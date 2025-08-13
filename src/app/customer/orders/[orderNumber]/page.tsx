'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Clock,
  MapPin,
  Phone,
  CheckCircle,
  ChefHat,
  Package,
  Truck,
  Star,
  RefreshCw,
} from 'lucide-react';
import CustomerLayout from '@/components/layouts/customer-layout';
import { toast } from 'sonner';

interface OrderItem {
  id: string;
  menuItemId: string;
  quantity: number;
  price: number; // Changed from unitPrice to price to match API
  itemName: string; // Added itemName field from API
  menuItem: {
    name: string;
    imageUrl?: string;
  };
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  subtotal: number;
  deliveryFee: number;
  taxes: number;
  total: number; // Changed from totalAmount to match API
  createdAt: string;
  estimatedDeliveryTime: string;
  verificationCode?: string; // Made optional
  specialInstructions?: string;
  restaurant: {
    id: string;
    name: string;
    phone: string;
    address: string;
  };
  deliveryAddress: string; // Changed to string to match API response
  items: OrderItem[]; // Changed from orderItems to items to match API
  deliveryPartner?: {
    id: string;
    user: {
      name: string;
      phone: string;
    };
  };
}

const statusSteps = [
  {
    key: 'PLACED',
    label: 'Order Placed',
    icon: Clock,
    description: 'Your order has been placed successfully',
  },
  {
    key: 'CONFIRMED',
    label: 'Confirmed',
    icon: CheckCircle,
    description: 'Restaurant confirmed your order',
  },
  {
    key: 'PREPARING',
    label: 'Preparing',
    icon: ChefHat,
    description: 'Your food is being prepared',
  },
  {
    key: 'READY_FOR_PICKUP',
    label: 'Ready for Pickup',
    icon: Package,
    description: 'Food is ready for delivery partner',
  },
  {
    key: 'OUT_FOR_DELIVERY',
    label: 'Out for Delivery',
    icon: Truck,
    description: 'Your order is on the way',
  },
  {
    key: 'DELIVERED',
    label: 'Delivered',
    icon: CheckCircle,
    description: 'Order delivered successfully',
  },
];

export default function OrderTrackingPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const orderNumber = params?.orderNumber as string;

  useEffect(() => {
    if (session?.user?.id && orderNumber) {
      fetchOrderDetails();
    }
  }, [session, orderNumber]);

  const fetchOrderDetails = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/orders/${orderNumber}`);
      const data = await response.json();

      if (data.success) {
        setOrder(data.order);
      } else {
        toast.error(data.error || 'Failed to fetch order details');
      }
    } catch (error) {
      console.error('Failed to fetch order details:', error);
      toast.error('Failed to fetch order details');
    } finally {
      setIsLoading(false);
    }
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

  const getCurrentStep = (status: string) => {
    return statusSteps.findIndex((step) => step.key === status);
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  if (isLoading) {
    return (
      <CustomerLayout>
        <div className="mx-auto max-w-4xl px-4 py-6">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-1/3 rounded bg-gray-200"></div>
            <div className="h-64 rounded bg-gray-200"></div>
            <div className="h-48 rounded bg-gray-200"></div>
          </div>
        </div>
      </CustomerLayout>
    );
  }

  if (!order) {
    return (
      <CustomerLayout>
        <div className="mx-auto max-w-4xl px-4 py-6">
          <Card>
            <CardContent className="py-16 text-center">
              <h3 className="mb-2 text-xl font-semibold">Order not found</h3>
              <p className="mb-6 text-gray-500">
                The order you're looking for doesn't exist or you don't have
                access to it.
              </p>
              <Button onClick={() => router.push('/customer/orders')}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Orders
              </Button>
            </CardContent>
          </Card>
        </div>
      </CustomerLayout>
    );
  }

  const currentStep = getCurrentStep(order.status);

  return (
    <CustomerLayout>
      <div className="mx-auto max-w-4xl px-4 py-6">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => router.push('/customer/orders')}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold" style={{ color: '#002a01' }}>
                Order #{order.orderNumber}
              </h1>
              <p className="mt-1 text-gray-600">
                Placed {getTimeAgo(order.createdAt)} • {order.restaurant.name}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge className={`${getStatusColor(order.status)} px-4 py-2`}>
              {order.status.replace('_', ' ')}
            </Badge>
            <Button
              onClick={fetchOrderDetails}
              className="flex items-center gap-2"
              style={{
                backgroundColor: '#d1f86a',
                color: '#002a01',
                border: '1px solid #002a01',
              }}
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Order Status Timeline */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Order Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {statusSteps.map((step, index) => {
                    const StepIcon = step.icon;
                    const isCompleted = index <= currentStep;
                    const isCurrent = index === currentStep;

                    return (
                      <div key={step.key} className="flex items-start gap-4">
                        <div
                          className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${
                            isCompleted
                              ? 'bg-green-100 text-green-600'
                              : isCurrent
                                ? 'bg-orange-100 text-orange-600'
                                : 'bg-gray-100 text-gray-400'
                          }`}
                        >
                          <StepIcon className="h-5 w-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <h3
                              className={`font-semibold ${
                                isCompleted
                                  ? 'text-green-600'
                                  : isCurrent
                                    ? 'text-orange-600'
                                    : 'text-gray-400'
                              }`}
                            >
                              {step.label}
                            </h3>
                            {isCurrent && (
                              <span className="rounded-full bg-orange-100 px-2 py-1 text-xs text-orange-800">
                                Current
                              </span>
                            )}
                          </div>
                          <p
                            className={`mt-1 text-sm ${
                              isCompleted || isCurrent
                                ? 'text-gray-600'
                                : 'text-gray-400'
                            }`}
                          >
                            {step.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Estimated Delivery Time */}
                {order.estimatedDeliveryTime &&
                  order.status !== 'DELIVERED' && (
                    <div className="mt-6 rounded-lg bg-blue-50 p-4">
                      <div className="flex items-center gap-2 text-blue-800">
                        <Clock className="h-5 w-5" />
                        <span className="font-semibold">
                          Estimated Delivery
                        </span>
                      </div>
                      <p className="mt-1 text-blue-700">
                        {new Date(
                          order.estimatedDeliveryTime
                        ).toLocaleTimeString()}
                      </p>
                    </div>
                  )}

                {/* Verification Code */}
                {order.status === 'OUT_FOR_DELIVERY' &&
                  order.verificationCode && (
                    <div className="mt-6 rounded-lg border border-purple-200 bg-purple-50 p-4">
                      <h4 className="mb-2 font-semibold text-purple-800">
                        🔒 Verification Code
                      </h4>
                      <p className="mb-2 text-sm text-purple-700">
                        Share this code with the delivery partner to confirm
                        delivery:
                      </p>
                      <div className="rounded bg-purple-100 p-3 text-center">
                        <span className="text-2xl font-bold tracking-wider text-purple-800">
                          {order.verificationCode}
                        </span>
                      </div>
                    </div>
                  )}
              </CardContent>
            </Card>
          </div>

          {/* Order Details Sidebar */}
          <div className="space-y-6">
            {/* Delivery Partner Info */}
            {order.deliveryPartner && order.status === 'OUT_FOR_DELIVERY' && (
              <Card>
                <CardHeader>
                  <CardTitle>Delivery Partner</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="font-semibold">
                        {order.deliveryPartner.user.name}
                      </p>
                      <p className="text-sm text-gray-600">Delivery Partner</p>
                    </div>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() =>
                        window.open(`tel:${order.deliveryPartner?.user.phone}`)
                      }
                    >
                      <Phone className="mr-2 h-4 w-4" />
                      Call Partner
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Restaurant Info */}
            <Card>
              <CardHeader>
                <CardTitle>Restaurant</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="font-semibold">{order.restaurant.name}</p>
                    <p className="text-sm text-gray-600">
                      {order.restaurant.address}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => window.open(`tel:${order.restaurant.phone}`)}
                  >
                    <Phone className="mr-2 h-4 w-4" />
                    Call Restaurant
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Delivery Address */}
            <Card>
              <CardHeader>
                <CardTitle>Delivery Address</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-2">
                  <MapPin className="mt-1 h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm">{order.deliveryAddress}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span>
                        {item.quantity}x {item.menuItem.name}
                      </span>
                      <span>₹{(item.quantity * item.price).toFixed(2)}</span>
                    </div>
                  ))}
                  <hr />
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>₹{order.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Delivery Fee</span>
                    <span>₹{order.deliveryFee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Taxes</span>
                    <span>₹{order.taxes.toFixed(2)}</span>
                  </div>
                  <hr />
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span style={{ color: '#002a01' }}>
                      ₹{order.total.toFixed(2)}
                    </span>
                  </div>
                </div>

                {order.status === 'DELIVERED' && (
                  <Button
                    className="mt-4 w-full"
                    variant="outline"
                    onClick={() => {
                      // Add rating functionality here
                    }}
                  >
                    <Star className="mr-2 h-4 w-4" />
                    Rate Order
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </CustomerLayout>
  );
}
