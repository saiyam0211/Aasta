'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Clock,
  MapPin,
  Phone,
  CheckCircle,
  Truck,
  ChefHat,
  Package,
  Star,
  ArrowLeft,
  Copy,
  Check,
  CreditCard,
  AlertCircle,
  RefreshCw,
  Star as StarIcon,
  Bike,
  Store,
} from 'lucide-react';
import CustomerLayout from '@/components/layouts/customer-layout';
import { toast } from 'sonner';
import { useSearchParams } from 'next/navigation';
import { socketClient } from '@/lib/socket-client';
import { useSession } from 'next-auth/react';
import localFont from 'next/font/local';

function formatEta(iso: string | null): string | null {
  if (!iso) return null;
  const target = new Date(iso);
  const now = new Date();
  const mins = Math.max(
    1,
    Math.round((target.getTime() - now.getTime()) / 60000)
  );
  const timeStr = target.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
  return `${mins} mins • ~${timeStr}`;
}

function carbonSavedKg(distanceKm?: number | null): number {
  if (!distanceKm || distanceKm <= 0) return 0;
  // Factor can vary by vehicle; use a neutral mid-range factor (kg/km)
  const kgPerKm = 0.171; // ~170 g/km (from BEIS/Defra averages)
  return distanceKm * kgPerKm;
}

interface OrderItem {
  id: string;
  menuItemId: string;
  quantity: number;
  price: number;
  itemName: string;
  menuItem?: {
    name: string;
    imageUrl?: string;
  };
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  total: number;
  subtotal: number;
  taxes: number;
  deliveryFee: number;
  deliveryAddress: string;
  estimatedDeliveryTime: string;
  createdAt: string;
  verificationCode?: string;
  items: OrderItem[];
  restaurant: {
    id: string;
    name: string;
    phone: string;
    address: string;
  };
  deliveryDistance?: number; // Added for carbon emission calculation
  orderType?: string; // Added for order type
  estimatedPreparationTime?: number; // Added for preparation time
  savings?: number; // Added for savings
  deliveryPartner?: {
    id: string;
    name: string;
    phone: string;
  };
  reviewSubmitted?: boolean; // Added for review submission status
}

const orderStatusSteps = {
  PLACED: { label: 'Order Placed', icon: CheckCircle, completed: true },
  CONFIRMED: { label: 'Confirmed', icon: CheckCircle, completed: false },
  PREPARING: { label: 'Preparing', icon: ChefHat, completed: false },
  READY_FOR_PICKUP: {
    label: 'Ready for Pickup',
    icon: Package,
    completed: false,
  },
  OUT_FOR_DELIVERY: {
    label: 'Out for Delivery',
    icon: Truck,
    completed: false,
  },
  PICKED_UP: { label: 'Picked Up', icon: CheckCircle, completed: false },
  DELIVERED: { label: 'Delivered', icon: Star, completed: false },
} as const;

const getStatusSequence = (orderType?: string) => {
  return orderType === 'PICKUP'
    ? ([
        'PLACED',
        'CONFIRMED',
        'PREPARING',
        'READY_FOR_PICKUP',
        'PICKED_UP',
      ] as const)
    : ([
        'PLACED',
        'CONFIRMED',
        'PREPARING',
        'READY_FOR_PICKUP',
        'OUT_FOR_DELIVERY',
        'DELIVERED',
      ] as const);
};

const brandFont = localFont({
  src: [
    {
      path: '../../../../public/fonts/Tanjambore_bysaiyam-Regular.ttf',
      weight: '400',
      style: 'normal',
    },
  ],
  variable: '--font-brand',
  display: 'swap',
});

export default function OrderTrackingPage() {
  const { data: session } = useSession();
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [isProcessingRefund, setIsProcessingRefund] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [partner, setPartner] = useState<any | null>(null);

  useEffect(() => {
    // Ensure socket connected and authenticated so we join user_* room
    const token = session?.user?.id || '';
    if (token) {
      socketClient.connect(token);
      socketClient.authenticate(session!.user!.id, token);
    }
    if (params?.orderNumber) {
      fetchOrder();
    }
  }, [params?.orderNumber, session?.user?.id]);

  // Socket: subscribe to real-time order status updates
  useEffect(() => {
    let handler: any;
    try {
      handler = (update: any) => {
        if (update?.orderNumber === order?.orderNumber) {
          setOrder((prev) =>
            prev ? { ...prev, status: update.status } : prev
          );
        }
      };
      socketClient.on('order_status_update', handler);
    } catch {}
    return () => {
      if (handler) socketClient.off('order_status_update', handler);
    };
  }, [order?.orderNumber]);

  // Polling fallback: refresh ONLY the order status every 5s (pickup + delivery)
  useEffect(() => {
    if (!params?.orderNumber) return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/orders/${params.orderNumber}`);
        const data = await res.json();
        if (res.ok && data?.success) {
          const nextStatus = data.order?.status;
          if (nextStatus) {
            setOrder((prev) => (prev ? { ...prev, status: nextStatus } : prev));
          }
        }
      } catch {}
    }, 5000);
    return () => clearInterval(interval);
  }, [params?.orderNumber]);

  // Lightweight polling for delivery partner assignment updates
  useEffect(() => {
    if (!order || order.orderType !== 'DELIVERY') return;
    setPartner((order as any).deliveryPartner || null);
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/orders/${params?.orderNumber}`);
        const data = await res.json();
        if (res.ok && data?.success) {
          const latest = data.order;
          setOrder(latest);
          setPartner(latest.deliveryPartner || null);
        }
      } catch {}
    }, 5000);
    return () => clearInterval(interval);
  }, [order?.orderType, params?.orderNumber]);

  useEffect(() => {
    const p = searchParams?.get('payment');
    if (p === 'success') setShowCelebration(true);
  }, [searchParams]);

  const fetchOrder = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/orders/${params?.orderNumber}`);
      const data = await response.json();

      if (data.success) {
        setOrder(data.order);
      } else {
        toast.error('Order not found');
        router.push('/customer/orders');
      }
    } catch (error) {
      console.error('Failed to fetch order:', error);
      toast.error('Failed to load order details');
    } finally {
      setIsLoading(false);
    }
  };

  const copyOrderNumber = () => {
    navigator.clipboard.writeText(order?.orderNumber || '');
    setCopied(true);
    toast.success('Order number copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PLACED':
        return 'bg-blue-100 text-blue-800';
      case 'CONFIRMED':
        return 'bg-green-100 text-green-800';
      case 'PREPARING':
        return 'bg-yellow-100 text-yellow-800';
      case 'READY_FOR_PICKUP':
        return 'bg-purple-100 text-purple-800';
      case 'OUT_FOR_DELIVERY':
        return 'bg-orange-100 text-orange-800';
      case 'DELIVERED':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const sequence = getStatusSequence(order?.orderType);
  const getCurrentStepIndex = (status: string) => {
    return sequence.indexOf(status as any);
  };

  const getPaymentStatusColor = (paymentStatus: string) => {
    switch (paymentStatus) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'FAILED':
        return 'bg-red-100 text-red-800';
      case 'REFUNDED':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handlePayment = () => {
    router.push(`/payment/${order?.orderNumber}`);
  };

  const handleGoBack = () => {
    router.back();
  };

  const handleRefund = async () => {
    if (!order) return;

    setIsProcessingRefund(true);
    try {
      const response = await fetch('/api/payments/refund', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderNumber: order.orderNumber,
          reason: 'Customer requested refund',
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Refund initiated successfully');
        fetchOrder(); // Refresh order data
      } else {
        toast.error(data.error || 'Failed to process refund');
      }
    } catch (error) {
      toast.error('Failed to process refund');
    } finally {
      setIsProcessingRefund(false);
    }
  };

  // Rating UI state (post-completion)
  const [deliveryRating, setDeliveryRating] = useState(0);
  const [restaurantRating, setRestaurantRating] = useState(0);
  const [mealRating, setMealRating] = useState(0);
  const [aastaRating, setAastaRating] = useState(0);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [hasSubmittedReview, setHasSubmittedReview] = useState(false);

  const thankYouQuotes = [
    'Your feedback fuels better late-night meals. Thank you!',
    'Every bite gets better with your feedback. Appreciate it!',
    'Thanks! You just made Aasta a little tastier for everyone.',
    'Gratitude served hot! Your review helps us improve.',
    'Thanks for the love. Great food is a team effort—us and you!',
  ];
  const thankQuote = useMemo(
    () => thankYouQuotes[Math.floor(Math.random() * thankYouQuotes.length)],
    [order?.orderNumber]
  );

  const submitReview = async () => {
    if (!order) return;
    try {
      setSubmittingReview(true);
      const payload: any = {
        orderNumber: order.orderNumber,
        deliveryRating:
          order.orderType === 'DELIVERY'
            ? deliveryRating || undefined
            : undefined,
        serviceRating:
          order.orderType === 'PICKUP'
            ? restaurantRating || undefined
            : undefined,
        foodRating: mealRating || undefined,
        platformRating: aastaRating || undefined,
      };
      await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      toast.success('Thanks for your feedback!');
      setHasSubmittedReview(true);
      setOrder((prev) => (prev ? { ...prev, reviewSubmitted: true } : prev));
    } catch (e) {
      toast.error('Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const RatingStars = ({
    value,
    onChange,
  }: {
    value: number;
    onChange: (n: number) => void;
  }) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            aria-label={`Rate ${n}`}
            onClick={() => onChange(n)}
            className="p-0.5"
          >
            <Star
              className={`h-6 w-6 ${n <= value ? 'text-[#ffd500]' : 'text-gray-300'}`}
              strokeWidth={2}
              fill={n <= value ? 'currentColor' : 'none'}
            />
          </button>
        ))}
      </div>
    );
  };

  const isCompleted = order?.status === 'DELIVERED';

  if (isLoading) {
    return (
      <CustomerLayout>
        <div className="mx-auto max-w-4xl px-4 py-6">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-1/3 rounded bg-gray-200"></div>
            <div className="h-48 rounded bg-gray-200"></div>
            <div className="h-64 rounded bg-gray-200"></div>
          </div>
        </div>
      </CustomerLayout>
    );
  }

  if (!order) {
    return (
      <CustomerLayout hideHeader hideFooter>
        <div className="mx-auto max-w-4xl px-4 py-12 text-center">
          <h2 className="mb-2 text-2xl font-bold">Order not found</h2>
          <p className="mb-6 text-gray-500">
            The order you're looking for doesn't exist or you don't have
            permission to view it.
          </p>
          <Button
            onClick={handleGoBack}
            variant="ghost"
            size="sm"
            className="glass-liquid h-10 w-20 rounded-full bg-white/80 p-0 shadow-sm hover:bg-white"
          >
            <ArrowLeft className="h-5 w-5" style={{ color: '#002a01' }} /> Back
          </Button>
        </div>
      </CustomerLayout>
    );
  }

  return (
    <CustomerLayout hideHeader hideFooter>
      <div className="mx-auto max-w-4xl">
        <div className="sticky top-0 z-50 bg-white px-4 pt-4">
          <div className="flex justify-between">
            <Button
              onClick={handleGoBack}
              variant="ghost"
              size="sm"
              className="glass-liquid h-10 w-20 rounded-full bg-white/80 p-0 shadow-sm hover:bg-white"
            >
              <ArrowLeft className="h-5 w-5" style={{ color: '#002a01' }} />{' '}
              Back
            </Button>
            {/* Savings banner */}
            {typeof (order as any).savings === 'number' &&
              (order as any).savings > 0 && (
                <div className="items-right mb-4 gap-2 rounded-2xl border border-orange-200 bg-orange-50 px-4 py-3">
                  <span className="text-sm font-medium text-orange-900">
                    You saved ₹{((order as any).savings as number).toFixed(0)}{' '}
                    on this order
                  </span>
                </div>
              )}
          </div>
          {/* Header */}
          <div className="flex flex-col pb-6">
            <div>
              <div className="flex items-center gap-3">
                <h1
                  className={`text-[20px] font-semibold`}
                  style={{ color: '#002a01' }}
                >
                  Order #{order.orderNumber}
                </h1>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyOrderNumber}
                  className="flex items-center gap-1 rounded-lg"
                >
                  {copied ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                  {/* {copied ? 'Copied!' : 'Copy'} */}
                </Button>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <Badge className={`${getStatusColor(order.status)} px-3 py-1`}>
                {order.status.replace('_', ' ')}
              </Badge>
              <Badge
                className={`${getPaymentStatusColor(order.paymentStatus)} px-3 py-1`}
              >
                {order.paymentStatus === 'COMPLETED'
                  ? 'Paid'
                  : order.paymentStatus === 'PENDING'
                    ? 'Payment Pending'
                    : order.paymentStatus === 'FAILED'
                      ? 'Payment Failed'
                      : order.paymentStatus === 'REFUNDED'
                        ? 'Refunded'
                        : 'Payment Status'}
              </Badge>
              <Badge className={`bg-yellow-50 px-3 py-1`}>
                {order.verificationCode}
              </Badge>
              <Badge className={`bg-red-50 px-3 py-1`}>{order.orderType}</Badge>
            </div>
          </div>
        </div>
        {/* Celebration Popup */}
        {showCelebration && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="relative w-[90%] max-w-md overflow-hidden rounded-3xl border border-[#002a01]/10 bg-white shadow-2xl">
              {/* Brand header */}
              <div className="bg-[#002a01] px-6 pt-6 pb-4 text-center">
                <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-[#d1f86a] text-xl">
                  🎉
                </div>
                <h3 className="text-lg font-extrabold tracking-tight text-[#d1f86a]">
                  Order Confirmed!
                </h3>
                <p className="mt-1 text-xs text-[#fcfefe]/80">
                  {order.deliveryFee > 0
                    ? 'Thanks for your payment. Your food is on its way.'
                    : 'Thanks for your payment. We’ll notify you when it’s ready for pickup.'}
                </p>
              </div>

              {/* Info blocks */}
              <div className="space-y-3 px-6 py-5">
                {order.deliveryFee > 0 ? (
                  <div className="flex items-center justify-center rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-900">
                    <Clock className="mr-2 h-4 w-4" /> ETA{' '}
                    {formatEta(order.estimatedDeliveryTime) || 'Soon'}
                  </div>
                ) : (
                  <div className="flex items-center justify-center rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-900">
                    <ChefHat className="mr-2 h-4 w-4" /> Avg prep time{' '}
                    {Math.max(
                      10,
                      (order as any).estimatedPreparationTime || 20
                    )}{' '}
                    mins
                  </div>
                )}

                {/* Savings */}
                {typeof (order as any).savings === 'number' &&
                  (order as any).savings > 0 && (
                    <div className="rounded-2xl border border-orange-200 bg-orange-50 px-4 py-3 text-center text-sm text-orange-900">
                      You saved ₹{((order as any).savings as number).toFixed(0)}{' '}
                      on this order 🎁
                    </div>
                  )}

                {/* Pickup-only sections */}
                {order.deliveryFee === 0 && (
                  <>
                    {order.verificationCode && (
                      <div className="rounded-2xl border border-yellow-200 bg-yellow-50 px-4 py-3 text-center text-sm font-medium text-yellow-900">
                        Show this pickup code:{' '}
                        <span className="ml-1 font-mono text-base font-extrabold">
                          {order.verificationCode}
                        </span>
                      </div>
                    )}
                    <div className="rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-center text-sm text-blue-900">
                      You saved ~
                      {carbonSavedKg((order as any).deliveryDistance).toFixed(
                        2
                      )}{' '}
                      kg CO₂ by not driving 🚴
                    </div>
                  </>
                )}
              </div>

              <div className="border-t px-6 py-4">
                <Button
                  className="h-10 w-full rounded-xl bg-[#fd6923] text-white"
                  onClick={() => setShowCelebration(false)}
                >
                  Continue
                </Button>
              </div>
            </div>
          </div>
        )}

        {isCompleted && (
          <div className="px-4 pt-6">
            <div className="relative">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-[#002a01] via-[#002a01]/95 to-[#002a01]"></div>
              <div className="relative rounded-3xl border border-[#fcfefe]/15 p-6 text-center text-[#fcfefe]">
                {order.reviewSubmitted || hasSubmittedReview ? (
                  <div className="space-y-3">
                    <h3 className="text-xl font-bold">Thank you! 💚</h3>
                    <p className="text-sm text-[#fcfefe]/85">{thankQuote}</p>
                    <div className="mt-3 flex items-center justify-center gap-3">
                      <Button
                        onClick={() => router.push('/')}
                        className="rounded-xl bg-[#d1f86a] text-[#002a01]"
                      >
                        Explore more
                      </Button>
                      {/* <Button variant="outline" onClick={() => router.push('/customer/orders')} className="rounded-xl border-[#fcfefe]/30 text-[#fcfefe]">
                        View my orders
                      </Button> */}
                    </div>
                  </div>
                ) : (
                  <>
                    <h3 className="mb-1 text-xl font-bold">Enjoy your meal!</h3>
                    <p className="mb-4 text-sm text-[#fcfefe]/80">
                      We’d love your feedback
                    </p>

                    {order.orderType === 'DELIVERY' ? (
                      <div className="mb-4 flex flex-col items-center justify-center">
                        <p className="mb-2 text-sm">
                          Rate your delivery partner experience
                        </p>
                        <RatingStars
                          value={deliveryRating}
                          onChange={setDeliveryRating}
                        />
                      </div>
                    ) : (
                      <div className="mb-4 flex flex-col items-center justify-center">
                        <p className="mb-2 text-sm">
                          Rate your pickup experience
                        </p>
                        <RatingStars
                          value={restaurantRating}
                          onChange={setRestaurantRating}
                        />
                      </div>
                    )}

                    <div className="mb-4 flex flex-col items-center justify-center">
                      <p className="mb-2 text-sm">How's the food quality?</p>
                      <RatingStars
                        value={mealRating}
                        onChange={setMealRating}
                      />
                    </div>

                    <div className="mb-6 flex flex-col items-center justify-center">
                      <p className="mb-2 text-sm">
                        How's your overall experience with Aasta?
                      </p>
                      <RatingStars
                        value={aastaRating}
                        onChange={setAastaRating}
                      />
                    </div>

                    <Button
                      className="h-10 w-full rounded-xl bg-[#d1f86a] text-[#002a01]"
                      disabled={submittingReview}
                      onClick={submitReview}
                    >
                      {submittingReview ? 'Submitting…' : 'Submit review'}
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-8 px-4 lg:grid-cols-3">
          {/* Order Status & Timeline */}
          <div className="space-y-6 lg:col-span-2">
            <Card className="rounded-3xl border border-gray-100 shadow-sm">
              <CardHeader>
                <CardTitle
                  className={`${brandFont.className} -mt-5 text-[50px] text-[#002a01]`}
                  style={{ letterSpacing: '-0.08em' }}
                >
                  Order Status
                  <span className="ml-1 text-[60px] text-[#fd6923]">.</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="-mt-5 space-y-4">
                  {sequence.map((status, index) => {
                    const step = (orderStatusSteps as any)[status];
                    const Icon = step.icon;
                    const isCompleted =
                      index <= getCurrentStepIndex(order.status);
                    const isCurrent =
                      index === getCurrentStepIndex(order.status);

                    return (
                      <div key={status} className="flex items-center gap-4">
                        <div
                          className={`rounded-full p-2 ${
                            isCompleted
                              ? 'bg-green-100 text-green-600'
                              : 'bg-gray-100 text-gray-400'
                          }`}
                        >
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <p
                            className={`font-medium ${
                              isCurrent
                                ? 'text-green-600'
                                : isCompleted
                                  ? 'text-gray-900'
                                  : 'text-gray-500'
                            }`}
                          >
                            {step.label}
                          </p>
                          {isCurrent && (
                            <p className="text-sm text-gray-500">
                              Current status
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Environmental Impact / Motivation Card (admin gradient style) */}
            <div className="relative mt-8 px-4">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-[#002a01] via-[#002a01]/95 to-[#002a01]"></div>
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMiIgZmlsbD0iIzAwZmY0MCIgZmlsbC1vcGFjaXR5PSIwLjEiLz4KPC9zdmc+')] opacity-10"></div>
              <Card className="relative border-0 bg-transparent">
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 items-center gap-6 lg:grid-cols-3">
                    <div className="space-y-3 lg:col-span-2">
                      <div className="flex items-center justify-center space-x-3">
                        <h3 className="text-xl font-bold text-[#d1f86a]">
                          {order.deliveryFee > 0
                            ? 'Make it greener next time'
                            : 'High five for a green choice!'}
                        </h3>
                      </div>
                      <p className="text-center text-sm text-[#fcfefe]/85">
                        {order.deliveryFee > 0
                          ? `This delivery travelled about ${(order.deliveryDistance ?? 0).toFixed(1)} km and took ~${(order as any).estimatedDeliveryDuration ?? 0} mins. That’s roughly ${carbonSavedKg(order.deliveryDistance ?? 0).toFixed(2)} kg CO₂ emitted. Next time, pick up to save the delivery fee and the planet.`
                          : `You walked in and saved roughly ${carbonSavedKg(order.deliveryDistance ?? 0).toFixed(2)} kg CO₂ that would have been emitted for delivery — and probably a few minutes too. Great choice!`}
                      </p>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-[#d1f86a]/20 to-[#ffd500]/20 blur-2xl"></div>
                      <div className="relative rounded-3xl border border-[#fcfefe]/20 bg-[#fcfefe]/10 p-5 text-center backdrop-blur-sm">
                        <div className="mt-3">
                          <p className="text-sm font-medium text-[#fcfefe]/70">
                            Your impact
                          </p>
                          <p className="mt-1 text-2xl font-bold text-[#fcfefe]">
                            {order.deliveryFee > 0
                              ? `${carbonSavedKg(order.deliveryDistance ?? 0).toFixed(2)} kg CO₂ emitted`
                              : `${carbonSavedKg(order.deliveryDistance ?? 0).toFixed(2)} kg CO₂ saved`}
                          </p>
                          {typeof (order as any).savings === 'number' &&
                            (order as any).savings > 0 && (
                              <p className="mt-1 text-2xl font-bold text-[#fcfefe]">
                                ₹{((order as any).savings as number).toFixed(0)}{' '}
                                saved today
                              </p>
                            )}
                          <p className="mt-2 text-xs text-[#fcfefe]/75 italic">
                            {order.deliveryFee > 0
                              ? '“Small choices add up. Choose pickup to tread lighter.”'
                              : '“Every step counts. Thanks for walking the green path.”'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Restaurant & Delivery Info */}
            <Card className="rounded-2xl border border-gray-100 shadow-sm">
              <CardHeader>
                <CardTitle
                  className={`${brandFont.className} text-center text-[50px] text-[#002a01]`}
                  style={{ letterSpacing: '-0.08em' }}
                >
                  Restaurant & Delivery Details
                  <span className="ml-1 text-[60px] text-[#fd6923]">.</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col items-start justify-between">
                  <div>
                    <h6 className="text-xl font-semibold">
                      {order.restaurant.name}
                    </h6>
                    <p className="text-sm text-gray-500">
                      {order.restaurant.address}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3 border-[#002a01]/20"
                  >
                    <Phone className="mr-2 h-4 w-4" />
                    Call Restaurant
                  </Button>
                </div>

                {order.orderType === 'DELIVERY' && (
                  <div className="border-t pt-4">
                    <div className="flex items-start gap-2">
                      <MapPin className="mt-0.5 h-5 w-5 text-gray-400" />
                      <div>
                        <p className="font-medium">Delivery Address</p>
                        <p className="text-sm text-gray-600">
                          {order.deliveryAddress}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="border-t pt-4">
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-gray-400" />
                    {order.orderType === 'DELIVERY' ? (
                      <p className="font-medium">
                        Estimated Delivery:{' '}
                        {new Date(
                          order.estimatedDeliveryTime
                        ).toLocaleTimeString()}
                      </p>
                    ) : (
                      <p className="font-medium">
                        Average Time of Preperation:{' '}
                        {order.estimatedPreparationTime} mins
                      </p>
                    )}
                  </div>
                </div>

                {/* Delivery Partner Details (Delivery only) */}
                {order.orderType === 'DELIVERY' && (
                  <div className="border-t pt-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">Delivery Partner</p>
                        {partner ? (
                          <p className="text-sm text-gray-700">
                            {partner.name}
                            {partner.phone ? ` • ${partner.phone}` : ''}
                          </p>
                        ) : (
                          <p className="text-sm text-gray-500">
                            We will assign a delivery partner soon…
                          </p>
                        )}
                      </div>
                      {partner?.phone && (
                        <a
                          href={`tel:${partner.phone}`}
                          className="inline-flex items-center rounded-lg border border-[#002a01]/20 px-3 py-2 text-sm"
                        >
                          <Phone className="mr-2 h-4 w-4" /> Call
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {order.verificationCode && (
                  <div className="border-t pt-4">
                    <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
                      <h5 className="mb-2 font-semibold text-yellow-800">
                        Verification Code
                      </h5>
                      <p className="font-mono text-2xl font-bold tracking-wider text-yellow-900">
                        {order.verificationCode}
                      </p>
                      <p className="mt-2 text-sm text-yellow-700">
                        Share this code with the delivery partner upon receipt
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6 rounded-2xl border border-gray-100 shadow-sm">
              <CardHeader>
                <CardTitle
                  className={`${brandFont.className} -mb-5 text-[50px] text-[#002a01]`}
                  style={{ letterSpacing: '-0.08em' }}
                >
                  Order Summary
                  <span className="ml-1 text-[60px] text-[#fd6923]">.</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Order Items */}
                <div className="space-y-3">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-start justify-between"
                    >
                      <div className="flex-1">
                        <h5 className="text-sm font-medium">
                          {item.menuItem?.name || item.itemName}
                        </h5>
                        <p className="text-xs text-gray-500">
                          ₹{item.price} × {item.quantity}
                        </p>
                      </div>
                      <span className="text-sm font-semibold">
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="space-y-2 border-t pt-4">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>₹{order.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Delivery Fee</span>
                    <span>₹{order.deliveryFee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Taxes & Fees</span>
                    <span>₹{order.taxes.toFixed(2)}</span>
                  </div>
                  {typeof (order as any).savings === 'number' &&
                    (order as any).savings > 0 && (
                      <div className="flex justify-between text-sm text-green-700">
                        <span>Savings</span>
                        <span>
                          -₹{((order as any).savings as number).toFixed(0)}
                        </span>
                      </div>
                    )}
                  <div className="flex justify-between border-t pt-2 text-lg font-bold">
                    <span>Total</span>
                    <span style={{ color: '#002a01' }}>
                      ₹{order.total.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-2 pt-4">
                  {/* Payment Actions */}
                  {order.paymentStatus === 'PENDING' && (
                    <Button
                      className="w-full"
                      onClick={handlePayment}
                      style={{
                        backgroundColor: '#d1f86a',
                        color: '#002a01',
                        border: '1px solid #002a01',
                      }}
                    >
                      <CreditCard className="mr-2 h-4 w-4" />
                      Complete Payment
                    </Button>
                  )}

                  {order.paymentStatus === 'FAILED' && (
                    <Button
                      variant="outline"
                      className="w-full border-red-200 text-red-600"
                      onClick={handlePayment}
                    >
                      <AlertCircle className="mr-2 h-4 w-4" />
                      Retry Payment
                    </Button>
                  )}

                  {/* {order.paymentStatus === 'COMPLETED' &&
                    (order.status === 'PLACED' ||
                      order.status === 'CONFIRMED') && (
                      <Button
                        variant="outline"
                        className="w-full border-red-200 text-red-600"
                        onClick={handleRefund}
                        disabled={isProcessingRefund}
                      >
                        {isProcessingRefund ? (
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <AlertCircle className="mr-2 h-4 w-4" />
                        )}
                        {isProcessingRefund
                          ? 'Processing...'
                          : 'Request Refund'}
                      </Button>
                    )} */}

                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() =>
                      router.push(`/restaurants/${order.restaurant.id}`)
                    }
                  >
                    Reorder
                  </Button>

                  {order.status === 'DELIVERED' && (
                    <Button
                      className="w-full"
                      style={{
                        backgroundColor: '#d1f86a',
                        color: '#002a01',
                        border: '1px solid #002a01',
                      }}
                    >
                      <Star className="mr-2 h-4 w-4" />
                      Rate Order
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </CustomerLayout>
  );
}
