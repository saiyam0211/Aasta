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

  const { currentAddress, currentLocation, setAddress } = useLocationStore();

  const [mode, setMode] = useState<'delivery' | 'pickup'>('delivery');
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [billOpen, setBillOpen] = useState(false);
  const [etaText, setEtaText] = useState<string | null>(null);
  const [addressSheetOpen, setAddressSheetOpen] = useState(false);
  const [placing, setPlacing] = useState(false);

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
        if (!currentLocation) {
          toast.error('Please set your live location');
          return;
        }
        const addrText = currentAddress?.address;
        if (!addrText || addrText.trim().length === 0) {
          toast.error('Please select an address');
          return;
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
                latitude: currentLocation!.latitude,
                longitude: currentLocation!.longitude,
                instructions: '',
              },
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
          currentLocation.latitude,
          currentLocation.longitude
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
      if (hasCoords && currentLocation) {
        const minutes = await locationService.getETA(
          { latitude: r.latitude as number, longitude: r.longitude as number },
          {
            latitude: currentLocation.latitude,
            longitude: currentLocation.longitude,
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

  if (!cart || cart.items.length === 0) {
    return (
      <CustomerLayout hideHeader hideFooter>
        <div className="min-h-screen bg-white px-4 py-8">
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
                  onClick={() => router.push('/customer/discover')}
                  className="h-11 w-full rounded-xl bg-orange-500 font-medium text-white hover:bg-orange-600"
                >
                  Discover Restaurants
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </CustomerLayout>
    );
  }

  // Totals based strictly on menu item fields
  const aastaSubtotal = useMemo(() => {
    return cart.items.reduce((sum, item) => {
      const price = Number(item.menuItem?.price ?? 0);
      return sum + price * item.quantity;
    }, 0);
  }, [cart.items]);

  const originalSubtotal = useMemo(() => {
    return cart.items.reduce((sum, item) => {
      const original = Number(item.menuItem?.originalPrice ?? 0);
      return sum + original * item.quantity;
    }, 0);
  }, [cart.items]);

  const handleGoBack = () => {
    router.back();
  };

  const platformFee = 6;
  const handlingCharge = Number((aastaSubtotal * 0.02).toFixed(2));
  const packagingFeeOriginal = 10;
  const packagingFeeDisplay = 0;
  const deliveryFee = mode === 'delivery' ? cart.deliveryFee : 0;

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
    return cart.items.reduce((sum, item) => {
      const original = Number(item.menuItem?.originalPrice ?? 0);
      const price = Number(item.menuItem?.price ?? 0);
      const diff = Math.max(0, original - price);
      return sum + diff * item.quantity;
    }, 0);
  }, [cart.items]);

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

  return (
    <CustomerLayout hideHeader hideFooter>
      <div className="min-h-screen bg-white">
        <div className="mx-auto max-w-md bg-white">
          {/* Back button */}
          <div className="sticky top-0 z-10 bg-white px-4 pt-4">
            <div className="mb-4 flex justify-between">
              <Button
                onClick={handleGoBack}
                variant="ghost"
                size="sm"
                className="glass-liquid h-10 w-20 rounded-full bg-white/80 p-0 shadow-sm hover:bg-white"
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

          <div className="px-4 pb-32">
            {/* Savings Banner */}
            {savings > 0 && (
              <div className="mb-4 flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3">
                <Tag className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-700">
                  You saved ₹{Math.round(savings)} on this order!
                </span>
              </div>
            )}

            {/* Delivery Info */}
            <div className="mb-6 overflow-hidden rounded-xl border border-gray-200 bg-white">
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
                  <div className="border-t border-gray-100"></div>
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
                          {currentAddress?.address ||
                            'Set your delivery address'}
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
                  <div className="border-t border-gray-100"></div>
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
              <div className="border-t border-gray-100"></div>
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

            {/* Cart Items */}
            <div className="mb-6">
              <h2 className="-mb-1 flex items-center text-lg font-semibold text-gray-900">
                <span
                  className={`${brandFont.className} text-[60px]`}
                  style={{ letterSpacing: '-0.08em' }}
                >
                  Items
                </span>
                <span className="ml-2 text-3xl text-orange-500">
                  {' '}
                  ({cart.items.length})
                </span>
              </h2>
              <div className="space-y-4">
                {cart.items.map((item, index) => (
                  <div
                    key={item.menuItemId}
                    className="rounded-xl border border-gray-200 bg-white p-4"
                  >
                    <div className="flex gap-4">
                      {/* Item Image */}
                      <div className="flex-shrink-0">
                        <img
                          src={item.menuItem.imageUrl || '/placeholder.png'}
                          alt={item.menuItem.name}
                          className="h-24 w-24 rounded-lg object-cover"
                        />
                      </div>

                      {/* Item Details */}
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">
                          {item.menuItem.name}
                        </h3>
                        <div className="mt-1 flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-900">
                            ₹{item.menuItem.price}
                          </span>
                          {Number(item.menuItem?.originalPrice) > 0 && (
                            <span className="text-sm text-gray-500 line-through">
                              ₹{item.menuItem.originalPrice}
                            </span>
                          )}
                        </div>

                        {/* Quantity Controls */}
                        <div className="mt-3 flex items-center justify-between">
                          <div className="flex items-center rounded-xl border border-gray-200">
                            <button
                              className="flex h-8 w-8 items-center justify-center text-gray-600 hover:bg-white"
                              onClick={() =>
                                updateQuantity(
                                  item.menuItemId,
                                  item.quantity - 1
                                )
                              }
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="flex h-8 w-10 items-center justify-center text-sm font-medium">
                              {item.quantity}
                            </span>
                            <button
                              className="flex h-8 w-8 items-center justify-center text-gray-600 hover:bg-white"
                              onClick={() =>
                                updateQuantity(
                                  item.menuItemId,
                                  item.quantity + 1
                                )
                              }
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-gray-900">
                              ₹{item.subtotal.toFixed(0)}
                            </span>
                            <button
                              className="flex h-8 w-8 items-center justify-center rounded-xl text-red-500 hover:bg-red-50"
                              onClick={() => {
                                removeItem(item.menuItemId);
                                toast.success(`${item.menuItem.name} removed`);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Add More Items */}
            <div className="mb-8 text-center">
              <button
                onClick={() => router.push('/customer/discover')}
                className="text-sm font-medium text-orange-500 hover:text-orange-600"
              >
                + Add more items
              </button>
            </div>
          </div>

          {/* Sticky Checkout Bar */}
          <div className="glass-liquid shadow-t-lg fixed bottom-0 left-1/2 w-full max-w-md -translate-x-1/2 border-t border-gray-200 bg-white px-4 py-4">
            <div className="flex items-center justify-between pb-20">
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
          <AddressSheet
            open={addressSheetOpen}
            onOpenChange={setAddressSheetOpen}
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
              setAddressSheetOpen(false);
              toast.success('Address selected');
            }}
          />
        </div>
      </div>
    </CustomerLayout>
  );
}
