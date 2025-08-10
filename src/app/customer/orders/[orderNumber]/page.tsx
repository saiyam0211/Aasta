"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  RefreshCw
} from "lucide-react";
import CustomerLayout from "@/components/layouts/customer-layout";
import { toast } from "sonner";

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
  { key: 'PLACED', label: 'Order Placed', icon: Clock, description: 'Your order has been placed successfully' },
  { key: 'CONFIRMED', label: 'Confirmed', icon: CheckCircle, description: 'Restaurant confirmed your order' },
  { key: 'PREPARING', label: 'Preparing', icon: ChefHat, description: 'Your food is being prepared' },
  { key: 'READY_FOR_PICKUP', label: 'Ready for Pickup', icon: Package, description: 'Food is ready for delivery partner' },
  { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', icon: Truck, description: 'Your order is on the way' },
  { key: 'DELIVERED', label: 'Delivered', icon: CheckCircle, description: 'Order delivered successfully' }
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
        toast.error(data.error || "Failed to fetch order details");
      }
    } catch (error) {
      console.error("Failed to fetch order details:", error);
      toast.error("Failed to fetch order details");
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PLACED": return "bg-blue-100 text-blue-800";
      case "CONFIRMED": return "bg-green-100 text-green-800";
      case "PREPARING": return "bg-yellow-100 text-yellow-800";
      case "READY_FOR_PICKUP": return "bg-purple-100 text-purple-800";
      case "OUT_FOR_DELIVERY": return "bg-orange-100 text-orange-800";
      case "DELIVERED": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getCurrentStep = (status: string) => {
    return statusSteps.findIndex(step => step.key === status);
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  if (isLoading) {
    return (
      <CustomerLayout>
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="h-48 bg-gray-200 rounded"></div>
          </div>
        </div>
      </CustomerLayout>
    );
  }

  if (!order) {
    return (
      <CustomerLayout>
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Card>
            <CardContent className="text-center py-16">
              <h3 className="text-xl font-semibold mb-2">Order not found</h3>
              <p className="text-gray-500 mb-6">The order you're looking for doesn't exist or you don't have access to it.</p>
              <Button onClick={() => router.push("/customer/orders")}>
                <ArrowLeft className="w-4 h-4 mr-2" />
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
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => router.push("/customer/orders")}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold" style={{ color: '#002a01' }}>
                Order #{order.orderNumber}
              </h1>
              <p className="text-gray-600 mt-1">
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
                border: '1px solid #002a01'
              }}
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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
                        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                          isCompleted 
                            ? 'bg-green-100 text-green-600' 
                            : isCurrent 
                              ? 'bg-orange-100 text-orange-600' 
                              : 'bg-gray-100 text-gray-400'
                        }`}>
                          <StepIcon className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className={`font-semibold ${
                              isCompleted ? 'text-green-600' : isCurrent ? 'text-orange-600' : 'text-gray-400'
                            }`}>
                              {step.label}
                            </h3>
                            {isCurrent && (
                              <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full">
                                Current
                              </span>
                            )}
                          </div>
                          <p className={`text-sm mt-1 ${
                            isCompleted || isCurrent ? 'text-gray-600' : 'text-gray-400'
                          }`}>
                            {step.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Estimated Delivery Time */}
                {order.estimatedDeliveryTime && order.status !== 'DELIVERED' && (
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2 text-blue-800">
                      <Clock className="w-5 h-5" />
                      <span className="font-semibold">Estimated Delivery</span>
                    </div>
                    <p className="text-blue-700 mt-1">
                      {new Date(order.estimatedDeliveryTime).toLocaleTimeString()}
                    </p>
                  </div>
                )}

                {/* Verification Code */}
                {order.status === 'OUT_FOR_DELIVERY' && order.verificationCode && (
                  <div className="mt-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                    <h4 className="font-semibold text-purple-800 mb-2">🔒 Verification Code</h4>
                    <p className="text-purple-700 text-sm mb-2">
                      Share this code with the delivery partner to confirm delivery:
                    </p>
                    <div className="bg-purple-100 p-3 rounded text-center">
                      <span className="text-2xl font-bold text-purple-800 tracking-wider">
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
                      <p className="font-semibold">{order.deliveryPartner.user.name}</p>
                      <p className="text-sm text-gray-600">Delivery Partner</p>
                    </div>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => window.open(`tel:${order.deliveryPartner?.user.phone}`)}
                    >
                      <Phone className="w-4 h-4 mr-2" />
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
                    <p className="text-sm text-gray-600">{order.restaurant.address}</p>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => window.open(`tel:${order.restaurant.phone}`)}
                  >
                    <Phone className="w-4 h-4 mr-2" />
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
                  <MapPin className="w-4 h-4 mt-1 text-gray-400" />
                  <div>
                    <p className="text-sm">
                      {order.deliveryAddress}
                    </p>
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
                      <span>{item.quantity}x {item.menuItem.name}</span>
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
                    <span style={{ color: '#002a01' }}>₹{order.total.toFixed(2)}</span>
                  </div>
                </div>

                {order.status === 'DELIVERED' && (
                  <Button 
                    className="w-full mt-4"
                    variant="outline"
                    onClick={() => {
                      // Add rating functionality here
                    }}
                  >
                    <Star className="w-4 h-4 mr-2" />
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
