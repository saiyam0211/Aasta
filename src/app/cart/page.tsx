'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useCartStore, useLocationStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import localFont from 'next/font/local';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Plus,
  Minus,
  Trash2,
  ShoppingCart,
  MapPin,
  Store,
  Bike,
  Clock,
  ChevronRight,
  Phone,
  Receipt,
  Tag,
  MapPinned,
  ArrowLeft,
  Share2,
} from 'lucide-react';
import CustomerLayout from '@/components/layouts/customer-layout';
import { toast } from 'sonner';
import LocationInput from '@/components/location/location-input';
import BillBreakdownSheet from '@/components/ui/BillBreakdownSheet';
import CouponSheet from '@/components/ui/CouponSheet';
import { locationService } from '@/lib/location-service';
import AddressSheet from '@/components/ui/AddressSheet';

const brandFont = localFont({
  src: [
    {
      path: '../../../public/fonts/Tanjambore_bysaiyam-Regular.ttf',
      weight: '400',
      style: 'normal',
    },
  ],
  variable: '--font-brand',
  display: 'swap',
});
export default function CartPage() {
  const { data: session } = useSession();
  const { cart, updateQuantity, removeItem } = useCartStore();
  const router = useRouter();

  const {
    currentAddress,
    currentLocation,
    setAddress,
    selectedAddressId,
    setSelectedAddressId,
  } = useLocationStore();

  const [mode, setMode] = useState<'delivery' | 'pickup'>('delivery');
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [billOpen, setBillOpen] = useState(false);
  const [couponOpen, setCouponOpen] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [etaText, setEtaText] = useState<string | null>(null);
  const [addressSheetOpen, setAddressSheetOpen] = useState(false);
  const [placing, setPlacing] = useState(false);

  // Determine veg/non-veg strictly from backend values; do not auto-assign
  type VegStatus = 'veg' | 'nonveg' | 'unknown';
  const getVegStatus = (menuItem: any): VegStatus => {
    const tags: string[] = Array.isArray(menuItem?.dietaryTags)
      ? menuItem.dietaryTags
      : [];
    const normalized = tags.map((t) => String(t).trim().toLowerCase());
    
    // Debug logging
    console.log('Menu item:', menuItem.name, 'dietaryTags:', menuItem?.dietaryTags, 'normalized:', normalized);
    
    if (normalized.some((t) => t === 'veg')) return 'veg';
    if (normalized.some((t) => t === 'non-veg' || t === 'non veg' || t === 'nonveg'))
      return 'nonveg';
    if (typeof menuItem?.isVegetarian === 'boolean') {
      return menuItem.isVegetarian ? 'veg' : 'nonveg';
    }
    return 'unknown';
  };

  // Razorpay helper
  const loadRazorpayScript = () => {
    if (typeof window === 'undefined') return;
    // @ts-ignore
    if (window.Razorpay) return;
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
  };

  useEffect(() => {
    loadRazorpayScript();
  }, []);

  const placeOrderAndPay = async () => {
    try {
      if (!cart || cart.items.length === 0) {
        toast.error('Your cart is empty');
        return;
      }
      const isPickup = mode === 'pickup';
      if (!isPickup) {
        // Check if we have current location
        const hasCurrentLocation =
          currentLocation?.latitude && currentLocation?.longitude;

        // Check if we have a valid address
        const hasValidAddress =
          currentAddress?.address && currentAddress.address.trim().length > 0;

        // If we have a selected address ID, assume it's valid (coordinates will be validated on server)
        const hasSelectedAddress = selectedAddressId;

        if (!hasCurrentLocation && !hasSelectedAddress) {
          toast.error(
            'Please set your live location or select a saved address'
          );
          setAddressSheetOpen(true); // Open address sheet modal
          return;
        }

        if (!hasValidAddress && !hasSelectedAddress) {
          toast.error('Please select an address');
          setAddressSheetOpen(true); // Open address sheet modal
          return;
        }

        // If we have a selected address, we're good to go
        if (hasSelectedAddress) {
          console.log('Using saved address with ID:', selectedAddressId);
          console.log('Current location state:', currentLocation);
          console.log('Current address state:', currentAddress);
        }
      }

      setPlacing(true);

      // 1) Create order
      const createRes = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cart,
          orderType: isPickup ? 'PICKUP' : 'DELIVERY',
          deliveryAddress: isPickup
            ? {
                address:
                  cart.restaurant?.address ||
                  cart.restaurant?.name ||
                  'Pickup at restaurant',
                latitude: Number((cart.restaurant as any)?.latitude || 0),
                longitude: Number((cart.restaurant as any)?.longitude || 0),
                instructions: 'Pickup at restaurant',
              }
            : {
                address: currentAddress?.address,
                latitude: selectedAddressId
                  ? 0
                  : currentLocation?.latitude || 0,
                longitude: selectedAddressId
                  ? 0
                  : currentLocation?.longitude || 0,
                instructions: '',
              },
          addressId: selectedAddressId || null,
        }),
      });
      const createData = await createRes.json();
      if (!createRes.ok || !createData?.success) {
        throw new Error(createData?.error || 'Failed to create order');
      }
      const orderNumber: string = createData.order.orderNumber;

      // 2) Create Razorpay order
      const payRes = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderNumber }),
      });
      const payData = await payRes.json();
      if (!payRes.ok || !payData?.success) {
        throw new Error(payData?.error || 'Failed to initiate payment');
      }

      // 3) Open Razorpay checkout
      // @ts-ignore
      const RazorpayCtor = window.Razorpay;
      if (!RazorpayCtor) {
        throw new Error('Payment SDK not loaded');
      }
      const options = {
        key: payData.razorpayOrder.key,
        amount: payData.razorpayOrder.amount,
        currency: payData.razorpayOrder.currency,
        name: 'Night Delivery',
        description: `Payment for Order #${orderNumber}`,
        order_id: payData.razorpayOrder.id,
        handler: async (response: any) => {
          try {
            const verifyRes = await fetch('/api/payments/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });
            const verifyData = await verifyRes.json();
            if (verifyRes.ok && verifyData?.success) {
              toast.success('Payment successful');
              router.push(`/orders/${orderNumber}?payment=success`);
            } else {
              toast.error('Payment verification failed');
              router.push(`/orders/${orderNumber}?payment=failed`);
            }
          } finally {
            setPlacing(false);
          }
        },
        modal: {
          ondismiss: () => {
            setPlacing(false);
            toast.error('Payment cancelled');
          },
        },
        theme: { color: '#fd6923' },
      };
      const rz = new RazorpayCtor(options);
      rz.open();
    } catch (e: any) {
      setPlacing(false);
      toast.error(e?.message || 'Failed to place order');
    }
  };

  // Prefill address from live location if available and no address yet
  useEffect(() => {
    const fillFromLocation = async () => {
      if (!currentAddress && currentLocation) {
        const addr = await locationService.reverseGeocode(
          currentLocation?.latitude || 0,
          currentLocation?.longitude || 0
        );
        if (addr) {
          setAddress({
            address: addr.address,
            city: addr.city,
            state: addr.state,
            zipCode: addr.zipCode,
          });
        }
      }
    };
    fillFromLocation();
  }, [currentAddress, currentLocation, setAddress]);

  // Compute ETA from real coordinates if available, else fall back to average prep time
  useEffect(() => {
    const computeEta = async () => {
      const r = cart?.restaurant;
      if (!r) {
        setEtaText(null);
        return;
      }
      const hasCoords =
        typeof r.latitude === 'number' && typeof r.longitude === 'number';
      const hasCurrentLocation =
        currentLocation?.latitude && currentLocation?.longitude;
      if (hasCoords && hasCurrentLocation) {
        const minutes = await locationService.getETA(
          { latitude: r.latitude as number, longitude: r.longitude as number },
          {
            latitude: currentLocation?.latitude || 0,
            longitude: currentLocation?.longitude || 0,
          },
          Number(r.averagePreparationTime || 0)
        );
        setEtaText(`${minutes} mins`);
        return;
      }
      if (r.averagePreparationTime) {
        const start = Number(r.averagePreparationTime);
        setEtaText(`${start}-${start + 5} mins`);
        return;
      }
      setEtaText(null);
    };
    computeEta();
  }, [cart?.restaurant, currentLocation]);

  // Check if cart is empty - but don't return early to avoid hooks rule violation
  const isCartEmpty = !cart || cart.items.length === 0;

  // Totals based strictly on menu item fields
  const aastaSubtotal = useMemo(() => {
    if (!cart?.items) return 0;
    return cart.items.reduce((sum, item) => {
      const price = Number(item.menuItem?.price ?? 0);
      return sum + price * item.quantity;
    }, 0);
  }, [cart?.items]);

  const originalSubtotal = useMemo(() => {
    if (!cart?.items) return 0;
    return cart.items.reduce((sum, item) => {
      const original = Number(item.menuItem?.originalPrice ?? 0);
      return sum + original * item.quantity;
    }, 0);
  }, [cart?.items]);

  const platformFee = 6;
  const handlingCharge = Number((aastaSubtotal * 0.02).toFixed(2));
  const packagingFeeOriginal = 10;
  const packagingFeeDisplay = 0;
  const deliveryFee = mode === 'delivery' ? (cart?.deliveryFee || 0) : 0;

  const computedTotal = useMemo(() => {
    return (
      aastaSubtotal +
      platformFee +
      handlingCharge +
      packagingFeeDisplay +
      deliveryFee
    );
  }, [
    aastaSubtotal,
    platformFee,
    handlingCharge,
    packagingFeeDisplay,
    deliveryFee,
  ]);

  const savings = useMemo(() => {
    if (!cart?.items) return 0;
    
    // Calculate item savings (same as orders API)
    const itemSavings = cart.items.reduce((sum, item) => {
      const original = Number(item.menuItem?.originalPrice ?? 0);
      const price = Number(item.menuItem?.price ?? 0);
      const diff = Math.max(0, original - price);
      return sum + diff * item.quantity;
    }, 0);

    // Calculate delivery fee savings (same as orders API)
    const estimatedDeliveryFee = 50; // Typical delivery fee
    const actualDeliveryFee = mode === 'delivery' ? (cart.deliveryFee || 0) : 0;
    const deliverySavings = Math.max(
      0,
      estimatedDeliveryFee - actualDeliveryFee
    );

    // Calculate packaging fee savings
    const packagingSavings = packagingFeeOriginal - packagingFeeDisplay; // 10 - 0 = 10

    // Total savings (matching orders API)
    const totalSavings = itemSavings + deliverySavings + packagingSavings;

    // Debug logging
    console.log('Cart savings breakdown:', {
      itemSavings,
      deliverySavings,
      packagingSavings,
      totalSavings,
      mode,
      deliveryFee: cart.deliveryFee,
    });

    return totalSavings;
  }, [cart?.items, mode, cart?.deliveryFee]);

  // etaText is computed in effect above

  const billValues = {
    originalSubtotal,
    aastaSubtotal,
    platformFee,
    handlingCharge,
    packagingFeeDisplay,
    packagingFeeOriginal,
    deliveryFee,
    total: computedTotal,
    savings,
  };

  const handleGoBack = () => {
    router.back();
  };

  return (
    <CustomerLayout hideHeader hideFooter>
      <div className="min-h-screen bg-[#f3f3f3]">
        {isCartEmpty ? (
          <div className="px-4 py-8 bg-[#f3f3f3]">
            <div className="mx-auto max-w-md">
              <Card className="border-0 shadow-sm">
                <CardContent className="px-6 py-12 text-center">
                  <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
                    <ShoppingCart className="h-10 w-10 text-gray-400" />
                  </div>
                  <h3 className="mb-2 text-xl font-semibold text-gray-900">
                    Your cart is empty
                  </h3>
                  <p className="mb-6 text-sm text-gray-500">
                    Discover delicious food and add items to your cart
                  </p>
                  <Button
                    onClick={() => router.push('/')}
                    className="h-11 w-full rounded-xl bg-orange-500 font-medium text-white hover:bg-orange-600"
                  >
                    Discover Restaurants
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          <div className="mx-auto max-w-md bg-gradient-to-b from-[#f3f3f3] via-[#fafafa] to-white pb-20">
          {/* Back button */}
          <div className="sticky top-0 z-10 bg-[#f3f3f3] px-4 pt-4">
            <div className="mb-4 flex justify-between">
              <Button
                onClick={handleGoBack}
                variant="ghost"
                size="sm"
                className="h-10 w-20 rounded-full border border-white/20 bg-white mt-1 p-0 shadow-sm backdrop-blur-sm hover:bg-white"
              >
                <ArrowLeft className="h-5 w-5" style={{ color: '#002a01' }} />{' '}
                Back
              </Button>
              {/* Delivery Mode Toggle */}
              <div className="mb-6 flex justify-center">
                <div className="inline-flex rounded-xl border border-gray-200 p-1">
                  <button
                    className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all ${
                      mode === 'delivery'
                        ? 'bg-[#D2F86A] text-black shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                    onClick={() => setMode('delivery')}
                  >
                    <Bike className="h-4 w-4" />
                    Delivery
                  </button>
                  <button
                    className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all ${
                      mode === 'pickup'
                        ? 'bg-[#D2F86A] text-black shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                    onClick={() => setMode('pickup')}
                  >
                    <Store className="h-4 w-4" />
                    Pickup
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="px-4">
            {/* Savings Banner */}
            {savings > 0 && (
              <div className="mb-4">
                <div className="flex items-center gap-2 rounded-xl border-t border-green-200 bg-green-50 px-4 py-3 relative">
                  <Tag className="h-5 w-5 text-green-600" />
                  <span className="text-md font-medium text-green-700">
                    You saved ₹{Math.round(savings)} on this order!
                  </span>
                </div>
                {/* Wavy SVG border at the bottom of the banner */}
                <div
                  style={{
                    lineHeight: 0,
                    marginTop: '-7px',
                    transform: 'rotate(180deg)',
                  }}
                >
                  <svg
                    viewBox="0 0 400 24"
                    width="100%"
                    height="24"
                    preserveAspectRatio="none"
                    style={{
                      display: 'block',
                    }}
                  >
                    <path
                      d="
                        M0 12
                        Q 12.5 0, 25 12
                        Q 37.5 24, 50 12
                        Q 62.5 0, 75 12
                        Q 87.5 24, 100 12
                        Q 112.5 0, 125 12
                        Q 137.5 24, 150 12
                        Q 162.5 0, 175 12
                        Q 187.5 24, 200 12
                        Q 212.5 0, 225 12
                        Q 237.5 24, 250 12
                        Q 262.5 0, 275 12
                        Q 287.5 24, 300 12
                        Q 312.5 0, 325 12
                        Q 337.5 24, 350 12
                        Q 362.5 0, 375 12
                        Q 387.5 24, 400 12
                        V24 H0 Z"
                      fill="#ECFDF3"
                    />
                  </svg>
                </div>

              </div>
            )}
            

            {/* Cart Items - Redesigned */}
            <div className="mb-6">
              <div className="mb-3">
                <p className="text-[15px] font-semibold text-gray-900">Order Item(s)</p>
                <p className="text-xs text-gray-500">Use coupons or reward balance to save more</p>
              </div>
              <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                {cart.items.map((item, index) => {
                  const status = getVegStatus(item.menuItem);
                  const vegBorder = status === 'veg' ? 'border-green-600' : status === 'nonveg' ? 'border-red-600' : 'border-gray-400';
                  const vegDot = status === 'veg' ? 'bg-green-600' : status === 'nonveg' ? 'bg-red-600' : 'bg-gray-400';
                  return (
                    <div key={item.menuItemId}>
                      <div className="p-4">
                        <div className="flex items-center justify-between">
                          {/* Item name and veg indicator */}
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <h3 className="text-base font-semibold text-gray-900 truncate">{item.menuItem.name}</h3>
                          </div>
                          
                          {/* Quantity controls */}
                          <div className="flex items-center gap-3 mx-4 h-10">
                            <div className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-2 py-1 h-10">
                              <button
                                className="flex h-5 w-5 items-center justify-center rounded-full bg-white shadow-sm hover:bg-gray-100 transition-colors"
                                onClick={() => updateQuantity(item.menuItemId, item.quantity - 1)}
                              >
                                <Minus className="h-3 w-3 text-gray-600" />
                              </button>
                              <span className="min-w-[20px] text-center text-sm font-semibold text-gray-700">{item.quantity}</span>
                              <button
                                className="flex h-5 w-5 items-center justify-center rounded-full bg-white shadow-sm hover:bg-gray-100 transition-colors"
                                onClick={() => updateQuantity(item.menuItemId, item.quantity + 1)}
                              >
                                <Plus className="h-3 w-3 text-gray-600" />
                              </button>
                            </div>
                          </div>
                          
                          {/* Price section */}
                          <div className="text-right min-w-0">
                            {Number(item.menuItem?.originalPrice) > 0 && (
                              <div className="text-sm text-gray-400 line-through">₹{item.menuItem.originalPrice}</div>
                            )}
                            <div className="text-lg font-bold text-gray-900">₹{(Number(item.menuItem?.price) * item.quantity).toFixed(0)}</div>
                          </div>
                        </div>
                      </div>
                      {/* Slashed dotted line separator */}
                      {index < cart.items.length - 1 && (
                        <div className="border-b border-dashed border-gray-300 mx-4"></div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Add More Items */}
            <div className="mb-8 -mt-2 text-center">
              <button
                onClick={() => {
                  const rid = (cart as any)?.restaurantId || (cart as any)?.restaurant?.id;
                  if (rid) {
                    router.push(`/restaurants/${rid}`);
                  } else {
                    router.push('/');
                  }
                }}
                className="text-md font-semibold text-orange-500 hover:text-orange-600"
              >
                + Add more items
              </button>
            </div>
          </div>

          {/* Delivery Info */}
          <div className=" overflow-hidden shadow-sm rounded-2xl border border-gray-200 bg-white mx-4">
            {/* Coupons row */}
            <button
              className="flex w-full items-center justify-between px-4 py-4"
              onClick={() => setCouponOpen(true)}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                  <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 7h18M5 7v12a2 2 0 002 2h10a2 2 0 002-2V7" />
                  </svg>
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-gray-900">Use Coupons</p>
                  <p className="text-xs text-gray-500">
                    {appliedCoupon ? `Applied: ${appliedCoupon}` : 'Tap to apply a coupon'}
                  </p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </button>
            <div className="border-t border-dashed border-gray-300 mx-4"></div>
            {/* ETA */}
            <div className="flex items-center justify-between px-4 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                  <Clock className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {mode === 'delivery' ? 'Delivery' : 'Pickup'}
                    {etaText ? ` in ${etaText}` : ''}
                  </p>
                  <p className="text-xs text-gray-500">
                    {etaText ? 'Live estimate' : 'Time shown at checkout'}
                  </p>
                </div>
              </div>
            </div>

            {/* Address (only for delivery) */}
            {mode === 'delivery' && (
              <>
                <div className="border-t border-dashed border-gray-300 mx-4"></div>
                <button
                  className="flex w-full items-center justify-between px-4 py-4 text-left hover:bg-white"
                  onClick={() => setAddressSheetOpen(true)}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                      <MapPinned className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        Deliver to Home
                      </p>
                      <p className="max-w-[250px] truncate text-xs text-gray-500">
                        {currentAddress?.address || 'Set your delivery address'}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </button>
              </>
            )}

            {/* Contact Info */}
            {session?.user?.phone && (
              <>
                <div className="border-t border-dashed border-gray-300 mx-4"></div>
                <div className="flex items-center gap-3 px-4 py-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                    <Phone className="h-5 w-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {session.user.name || 'You'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {session.user.phone}
                    </p>
                  </div>
                </div>
              </>
            )}

            {/* Bill Summary */}
            <div className="border-t border-dashed border-gray-300 mx-4"></div>
            <button
              className="flex w-full items-center justify-between px-4 py-4 hover:bg-white"
              onClick={() => setBillOpen(true)}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
                  <Receipt className="h-5 w-5 text-purple-600" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-gray-900">
                    Bill Details
                  </p>
                  <p className="text-xs text-gray-500">
                    View detailed bill breakdown
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-900">
                  ₹{Math.round(computedTotal)}
                </p>
                {savings > 0 && (
                  <p className="text-xs text-green-600">
                    Saved ₹{Math.round(savings)}
                  </p>
                )}
              </div>
            </button>
          </div>

          {/* Address Editor */}
          {mode === 'delivery' && isEditingAddress && (
            <div className="mb-6 rounded-xl border border-orange-200 bg-orange-50 p-4">
              <h3 className="mb-3 text-sm font-medium text-gray-900">
                Update delivery address
              </h3>
              <LocationInput
                onLocationSelect={(loc) => {
                  setAddress({
                    address: loc.address,
                    city: loc.city,
                    state: loc.state,
                    zipCode: loc.zipCode,
                  });
                  toast.success('Address updated');
                  setIsEditingAddress(false);
                }}
                placeholder="Search for your location"
              />
            </div>
          )}

          {/* Sticky Checkout Bar */}
          <div className="shadow-t-lg fixed bottom-5 left-1/2 w-[90%] max-w-md -translate-x-1/2 rounded-3xl border border-[#D2F86A] bg-white/10 px-4 py-4 backdrop-blur-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs tracking-wide text-gray-500 uppercase">
                  Total
                </p>
                <p className="text-xl font-bold text-gray-900">
                  ₹{Math.round(computedTotal)}
                </p>
                {savings > 0 && (
                  <p className="text-xs text-green-600">
                    You saved ₹{Math.round(savings)}
                  </p>
                )}
              </div>
              <Button
                className="h-12 rounded-xl bg-orange-500 px-8 font-medium text-white hover:bg-orange-600 disabled:opacity-60"
                disabled={placing}
                onClick={placeOrderAndPay}
              >
                {placing ? 'Processing…' : 'Place Order'}
              </Button>
            </div>
          </div>

          <BillBreakdownSheet
            open={billOpen}
            onOpenChange={setBillOpen}
            values={billValues}
          />
          <CouponSheet
            open={couponOpen}
            onOpenChange={setCouponOpen}
            onApply={(code) => {
              setAppliedCoupon(code);
              setCouponOpen(false);
              toast.success(`Coupon ${code} applied`);
            }}
          />
          <AddressSheet
            open={addressSheetOpen}
            onOpenChange={setAddressSheetOpen}
            context="cart"
            onSelect={(addr) => {
              const summary = [
                addr.houseNumber,
                addr.locality,
                addr.street,
                addr.city,
              ]
                .filter(Boolean)
                .join(', ');
              setAddress({
                address: summary,
                city: addr.city || '',
                state: addr.state || '',
                zipCode: addr.zipCode || '',
              });
              setSelectedAddressId(addr.id);
              setAddressSheetOpen(false);
              toast.success('Address selected');
            }}
          />
          </div>
        )}
      </div>
    </CustomerLayout>
  );
}
