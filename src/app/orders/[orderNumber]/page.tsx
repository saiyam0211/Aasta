'use client';

import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';
import CustomerLayout from '@/components/layouts/customer-layout';
import { toast } from 'sonner';
import { useSearchParams } from 'next/navigation';

function formatEta(iso: string | null): string | null {
  if (!iso) return null;
  const target = new Date(iso);
  const now = new Date();
  const mins = Math.max(1, Math.round((target.getTime() - now.getTime()) / 60000));
  const timeStr = target.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return `${mins} mins • ~${timeStr}`;
}

function carbonSavedKg(distanceKm?: number | null): number {
  if (!distanceKm || distanceKm <= 0) return 0;
  const gramsPerKm = 120; // Approx CO2 for a small petrol car per km
  return (distanceKm * gramsPerKm) / 1000; // kg
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
  DELIVERED: { label: 'Delivered', icon: Star, completed: false },
};

export default function OrderTrackingPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [isProcessingRefund, setIsProcessingRefund] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    if (params?.orderNumber) {
      fetchOrder();
    }
  }, [params?.orderNumber]);

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

  const getCurrentStepIndex = (status: string) => {
    return Object.keys(orderStatusSteps).indexOf(status);
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
      <CustomerLayout>
        <div className="mx-auto max-w-4xl px-4 py-12 text-center">
          <h2 className="mb-2 text-2xl font-bold">Order not found</h2>
          <p className="mb-6 text-gray-500">
            The order you're looking for doesn't exist or you don't have
            permission to view it.
          </p>
          <Button onClick={() => router.push('/customer/orders')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Orders
          </Button>
        </div>
      </CustomerLayout>
    );
  }

  return (
    <CustomerLayout>
      <div className="mx-auto max-w-4xl px-4 py-6">
        {/* Celebration Popup */}
        {showCelebration && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="relative w-[80%] max-w-md rounded-3xl bg-white p-6 text-center shadow-2xl">
              <div className="absolute -top-4 left-1/2 h-2 w-24 -translate-x-1/2 rounded-full bg-[#D2F86A]" />
              <div className="mb-3 text-3xl">🎉</div>
              <h3 className="mb-2 text-xl font-bold text-gray-900">Order Confirmed!</h3>
              {order.deliveryFee > 0 ? (
                <p className="mb-2 text-sm text-gray-700">
                  Thanks for your payment. Your food is on its way.
                </p>
              ) : (
                <p className="mb-2 text-sm text-gray-700">
                  Thanks for your payment. We’ll notify you when it’s ready for pickup.
                </p>
              )}
              {order.deliveryFee > 0 ? (
                <div className="mb-3 rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-800">
                  ETA: {formatEta(order.estimatedDeliveryTime) || 'Soon'}
                </div>
              ) : (
                <div className="mb-3 rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-800">
                  Prep time: {Math.max(10, (order as any).estimatedPreparationTime || 20)} mins
                </div>
              )}
               {order.deliveryFee === 0 && order.verificationCode && (
                <div className="mb-3 rounded-xl border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-800">
                  Show this code at the counter: <span className="font-mono text-lg font-bold">{order.verificationCode}</span>
                </div>
              )}
              {/* Carbon saved */}
              <div className="mb-4 rounded-xl border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800">
                You saved ~{carbonSavedKg((order as any).deliveryDistance).toFixed(2)} kg CO₂ by not driving to the restaurant.
              </div>
              <Button className="h-10 rounded-xl bg-[#fd6923] text-white" onClick={() => setShowCelebration(false)}>
                Continue
              </Button>
            </div>
          </div>
        )}
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <Button
              variant="ghost"
              onClick={() => router.push('/customer/orders')}
              className="mb-2"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Orders
            </Button>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold" style={{ color: '#002a01' }}>
                Order #{order.orderNumber}
              </h1>
              <Button
                variant="outline"
                size="sm"
                onClick={copyOrderNumber}
                className="flex items-center gap-1"
              >
                {copied ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
                {copied ? 'Copied!' : 'Copy'}
              </Button>
            </div>
          </div>
          <div className="flex gap-2">
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
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Order Status & Timeline */}
          <div className="space-y-6 lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Order Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(orderStatusSteps).map(
                    ([status, step], index) => {
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
                    }
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Restaurant & Delivery Info */}
            <Card>
              <CardHeader>
                <CardTitle>Restaurant & Delivery Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold">{order.restaurant.name}</h4>
                    <p className="text-sm text-gray-500">
                      {order.restaurant.address}
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    <Phone className="mr-2 h-4 w-4" />
                    Call Restaurant
                  </Button>
                </div>

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

                <div className="border-t pt-4">
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-gray-400" />
                    <p className="font-medium">
                      Estimated Delivery:{' '}
                      {new Date(
                        order.estimatedDeliveryTime
                      ).toLocaleTimeString()}
                    </p>
                  </div>
                </div>

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
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
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

                  {order.paymentStatus === 'COMPLETED' &&
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
                    )}

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
