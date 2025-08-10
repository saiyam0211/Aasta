"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  RefreshCw
} from "lucide-react";
import CustomerLayout from "@/components/layouts/customer-layout";
import { toast } from "sonner";

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
}

const orderStatusSteps = {
  PLACED: { label: "Order Placed", icon: CheckCircle, completed: true },
  CONFIRMED: { label: "Confirmed", icon: CheckCircle, completed: false },
  PREPARING: { label: "Preparing", icon: ChefHat, completed: false },
  READY_FOR_PICKUP: { label: "Ready for Pickup", icon: Package, completed: false },
  OUT_FOR_DELIVERY: { label: "Out for Delivery", icon: Truck, completed: false },
  DELIVERED: { label: "Delivered", icon: Star, completed: false }
};

export default function OrderTrackingPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [isProcessingRefund, setIsProcessingRefund] = useState(false);

  useEffect(() => {
    if (params?.orderNumber) {
      fetchOrder();
    }
  }, [params?.orderNumber]);

  const fetchOrder = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/orders/${params?.orderNumber}`);
      const data = await response.json();
      
      if (data.success) {
        setOrder(data.order);
      } else {
        toast.error("Order not found");
        router.push("/customer/orders");
      }
    } catch (error) {
      console.error("Failed to fetch order:", error);
      toast.error("Failed to load order details");
    } finally {
      setIsLoading(false);
    }
  };

  const copyOrderNumber = () => {
    navigator.clipboard.writeText(order?.orderNumber || "");
    setCopied(true);
    toast.success("Order number copied!");
    setTimeout(() => setCopied(false), 2000);
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

  const getCurrentStepIndex = (status: string) => {
    return Object.keys(orderStatusSteps).indexOf(status);
  };

  const getPaymentStatusColor = (paymentStatus: string) => {
    switch (paymentStatus) {
      case "COMPLETED": return "bg-green-100 text-green-800";
      case "PENDING": return "bg-yellow-100 text-yellow-800";
      case "FAILED": return "bg-red-100 text-red-800";
      case "REFUNDED": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
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
          reason: 'Customer requested refund'
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
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-48 bg-gray-200 rounded"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </CustomerLayout>
    );
  }

  if (!order) {
    return (
      <CustomerLayout>
        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
          <h2 className="text-2xl font-bold mb-2">Order not found</h2>
          <p className="text-gray-500 mb-6">The order you're looking for doesn't exist or you don't have permission to view it.</p>
          <Button onClick={() => router.push("/customer/orders")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Orders
          </Button>
        </div>
      </CustomerLayout>
    );
  }

  return (
    <CustomerLayout>
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <Button 
              variant="ghost" 
              onClick={() => router.push("/customer/orders")}
              className="mb-2"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
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
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? "Copied!" : "Copy"}
              </Button>
            </div>
          </div>
          <div className="flex gap-2">
            <Badge className={`${getStatusColor(order.status)} px-3 py-1`}>
              {order.status.replace('_', ' ')}
            </Badge>
            <Badge className={`${getPaymentStatusColor(order.paymentStatus)} px-3 py-1`}>
              {order.paymentStatus === 'COMPLETED' ? 'Paid' : 
               order.paymentStatus === 'PENDING' ? 'Payment Pending' :
               order.paymentStatus === 'FAILED' ? 'Payment Failed' :
               order.paymentStatus === 'REFUNDED' ? 'Refunded' : 'Payment Status'}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Status & Timeline */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Order Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(orderStatusSteps).map(([status, step], index) => {
                    const Icon = step.icon;
                    const isCompleted = index <= getCurrentStepIndex(order.status);
                    const isCurrent = index === getCurrentStepIndex(order.status);
                    
                    return (
                      <div key={status} className="flex items-center gap-4">
                        <div className={`p-2 rounded-full ${
                          isCompleted 
                            ? 'bg-green-100 text-green-600' 
                            : 'bg-gray-100 text-gray-400'
                        }`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <p className={`font-medium ${
                            isCurrent ? 'text-green-600' : isCompleted ? 'text-gray-900' : 'text-gray-500'
                          }`}>
                            {step.label}
                          </p>
                          {isCurrent && (
                            <p className="text-sm text-gray-500">Current status</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Restaurant & Delivery Info */}
            <Card>
              <CardHeader>
                <CardTitle>Restaurant & Delivery Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold">{order.restaurant.name}</h4>
                    <p className="text-sm text-gray-500">{order.restaurant.address}</p>
                  </div>
                  <Button variant="outline" size="sm">
                    <Phone className="w-4 h-4 mr-2" />
                    Call Restaurant
                  </Button>
                </div>
                
                <div className="border-t pt-4">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="font-medium">Delivery Address</p>
                      <p className="text-sm text-gray-600">{order.deliveryAddress}</p>
                    </div>
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-gray-400" />
                    <p className="font-medium">
                      Estimated Delivery: {new Date(order.estimatedDeliveryTime).toLocaleTimeString()}
                    </p>
                  </div>
                </div>

                {order.verificationCode && (
                  <div className="border-t pt-4">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <h5 className="font-semibold text-yellow-800 mb-2">Verification Code</h5>
                      <p className="text-2xl font-bold text-yellow-900 tracking-wider font-mono">
                        {order.verificationCode}
                      </p>
                      <p className="text-sm text-yellow-700 mt-2">
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
                    <div key={item.id} className="flex justify-between items-start">
                      <div className="flex-1">
                        <h5 className="font-medium text-sm">
                          {item.menuItem?.name || item.itemName}
                        </h5>
                        <p className="text-xs text-gray-500">
                          ₹{item.price} × {item.quantity}
                        </p>
                      </div>
                      <span className="font-semibold text-sm">
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="pt-4 border-t space-y-2">
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
                  <div className="flex justify-between font-bold text-lg pt-2 border-t">
                    <span>Total</span>
                    <span style={{ color: '#002a01' }}>₹{order.total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-4 space-y-2">
                  {/* Payment Actions */}
                  {order.paymentStatus === 'PENDING' && (
                    <Button 
                      className="w-full"
                      onClick={handlePayment}
                      style={{
                        backgroundColor: '#d1f86a',
                        color: '#002a01',
                        border: '1px solid #002a01'
                      }}
                    >
                      <CreditCard className="w-4 h-4 mr-2" />
                      Complete Payment
                    </Button>
                  )}
                  
                  {order.paymentStatus === 'FAILED' && (
                    <Button 
                      variant="outline"
                      className="w-full text-red-600 border-red-200"
                      onClick={handlePayment}
                    >
                      <AlertCircle className="w-4 h-4 mr-2" />
                      Retry Payment
                    </Button>
                  )}
                  
                  {order.paymentStatus === 'COMPLETED' && 
                   (order.status === 'PLACED' || order.status === 'CONFIRMED') && (
                    <Button 
                      variant="outline"
                      className="w-full text-red-600 border-red-200"
                      onClick={handleRefund}
                      disabled={isProcessingRefund}
                    >
                      {isProcessingRefund ? (
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <AlertCircle className="w-4 h-4 mr-2" />
                      )}
                      {isProcessingRefund ? 'Processing...' : 'Request Refund'}
                    </Button>
                  )}
                  
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => router.push(`/restaurants/${order.restaurant.id}`)}
                  >
                    Reorder
                  </Button>
                  
                  {order.status === 'DELIVERED' && (
                    <Button 
                      className="w-full"
                      style={{
                        backgroundColor: '#d1f86a',
                        color: '#002a01',
                        border: '1px solid #002a01'
                      }}
                    >
                      <Star className="w-4 h-4 mr-2" />
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
