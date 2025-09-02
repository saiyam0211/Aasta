'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import CustomerLayout from '@/components/layouts/customer-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  User,
  Phone,
  Clock,
  MapPin,
  Truck,
  Store,
  Star,
  ArrowRight,
  ArrowLeft,
  Package,
  ChefHat,
  CheckCircle,
} from 'lucide-react';
import localFont from 'next/font/local';
import { toast } from 'sonner';

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

interface Order {
  id: string;
  orderNumber?: string;
  status?: string;
  total?: number;
  totalAmount?: number;
  subtotal?: number;
  taxes?: number;
  deliveryFee?: number;
  savings?: number;
  createdAt?: string;
  orderType?: string;
  restaurant?: {
    name?: string;
  };
  orderItems?: Array<{
    menuItem?: {
      name?: string;
    };
    quantity?: number;
    unitPrice?: number;
    totalPrice?: number;
    total?: number;
  }>;
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Calculate total savings across all orders
  const totalSavings = useMemo(() => {
    const total = orders.reduce((sum, order) => {
      const savings = (order as any).savings || 0;
      return sum + savings;
    }, 0);

    // Debug logging
    console.log('Total savings calculation:', {
      totalOrders: orders.length,
      individualSavings: orders.map((order) => ({
        orderNumber: order.orderNumber,
        savings: (order as any).savings || 0,
      })),
      totalSavings: total,
    });

    return total;
  }, [orders]);

  useEffect(() => {
    if (status === 'loading') return;

    if (!session) {
      router.push('/auth/signin');
      return;
    }

    fetchRecentOrders();
  }, [session, status, router]);

  const fetchRecentOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        '/api/orders?limit=10&paymentStatus=COMPLETED'
      );
      const data = await response.json();

      console.log('Orders API response:', data);

      if (data.success) {
        const orders = data.data?.orders || [];
        console.log('Orders found:', orders.length);
        orders.forEach((order: any, index: number) => {
          console.log(`Order ${index + 1}:`, {
            orderNumber: order.orderNumber,
            total: order.total,
            totalAmount: order.totalAmount,
            subtotal: order.subtotal,
            taxes: order.taxes,
            deliveryFee: order.deliveryFee,
            savings: order.savings,
            orderItems: order.orderItems?.length || 0,
            orderItemsDetails: order.orderItems?.map((item: any) => ({
              name: item.menuItem?.name,
              unitPrice: item.unitPrice,
              originalUnitPrice: item.originalUnitPrice,
              totalPrice: item.totalPrice,
              totalOriginalPrice: item.totalOriginalPrice,
              quantity: item.quantity,
            })),
          });
        });
        setOrders(orders);
      } else {
        console.error('API returned error:', data);
        toast.error('Failed to load orders');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
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

  const handleGoBack = () => {
    router.back();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PLACED':
        return <CheckCircle className="h-4 w-4" />;
      case 'CONFIRMED':
        return <CheckCircle className="h-4 w-4" />;
      case 'PREPARING':
        return <ChefHat className="h-4 w-4" />;
      case 'READY_FOR_PICKUP':
        return <Package className="h-4 w-4" />;
      case 'OUT_FOR_DELIVERY':
        return <Truck className="h-4 w-4" />;
      case 'DELIVERED':
        return <Star className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (status === 'loading') {
    return (
      <CustomerLayout>
        <div className="mx-auto max-w-4xl px-4 py-6">
          <div className="animate-pulse space-y-8">
            <div className="h-40 rounded-3xl bg-gradient-to-r from-gray-200 to-gray-100"></div>
            <div className="h-80 rounded-3xl bg-gradient-to-r from-gray-200 to-gray-100"></div>
          </div>
        </div>
      </CustomerLayout>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="">
      <div className="sticky top-0 z-50 bg-white px-4 py-4">
        <div className="mb-2 flex items-center justify-between">
          <Button
            onClick={handleGoBack}
            variant="ghost"
            size="sm"
            className="h-10 w-20 rounded-full border border-[#D2F86A] bg-white/10 p-0 shadow-sm backdrop-blur-sm hover:bg-white"
          >
            <ArrowLeft className="h-5 w-5" style={{ color: '#002a01' }} /> Back
          </Button>

          {/* Total Savings Display */}
          {totalSavings > 0 && (
            <div className="flex items-center gap-2 rounded-2xl border border-green-200 bg-green-50 px-4 py-2">
              <div className="flex items-center gap-1">
                <span className="text-lg font-bold text-green-600">₹</span>
                <span className="text-lg font-bold text-green-600">
                  {totalSavings.toFixed(0)}
                </span>
              </div>
              <span className="text-sm font-medium text-green-700">
                Total Saved
              </span>
            </div>
          )}
        </div>
      </div>
      {/* User Profile Section */}
      <Card className="shadow-t-xl via-[#D2F86A]-50/30 relative mb-8 overflow-hidden rounded-t-3xl rounded-b-[60px] border-0 bg-gradient-to-br from-white to-white">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#D2F86A]/5 to-[#002a01]/5"></div>
        <div className="absolute top-0 right-0 h-32 w-32 translate-x-16 -translate-y-16 rounded-full bg-gradient-to-br from-[#002a01]/10 to-transparent"></div>

        <CardContent className="relative z-10">
          <div className="flex items-center gap-8">
            {/* Enhanced User Info */}
            <div className="flex-1 space-y-4">
              <div>
                <h2 className="mb-1 text-3xl font-bold text-gray-900">
                  {session.user?.name || 'User'}
                </h2>
                <p className="text-sm font-medium text-gray-500">
                  Aasta's Member
                </p>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white/60 px-4 py-3 text-gray-700 shadow-sm backdrop-blur-sm">
                  <div className="rounded-lg bg-[#002a01]/10 p-2">
                    <Phone className="h-4 w-4 text-[#002a01]" />
                  </div>
                  <span className="font-medium">
                    {session.user?.phone || 'No phone'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Orders Section */}
      <Card className="shadow-t-xl relative overflow-hidden rounded-t-[60px] border-0 bg-gradient-to-br from-white via-gray-200 to-white">
        {/* Background Pattern */}
        <div className="from-[#D2F86A]5 absolute inset-0 bg-gradient-to-br to-[#002a01]/5"></div>
        <div className="absolute bottom-0 left-0 h-24 w-24 -translate-x-12 translate-y-12 rounded-full bg-gradient-to-tr from-[#002a01]/10 to-transparent"></div>

        <CardHeader className="relative z-10">
          <div className="flex items-center justify-center">
            <CardTitle
              className={`${brandFont.className} flex items-center gap-3 text-[70px] text-[#002a01]`}
              style={{ letterSpacing: '-0.08em' }}
            >
              Recent Orders
              <span className="-ml-2 text-[60px] text-[#002a01]">.</span>
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-32 rounded-2xl bg-gradient-to-r from-gray-200 to-gray-100"></div>
                </div>
              ))}
            </div>
          ) : orders.length === 0 ? (
            <div className="py-16 text-center">
              <div className="from-[#D2F86A]10 mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br to-[#002a01]/10">
                <Package className="h-12 w-12 text-[#002a01]" />
              </div>
              <h3 className="mb-3 text-2xl font-bold text-gray-900">
              Your plate’s still empty.
              </h3>
              <p className="mx-auto mb-8 max-w-md text-gray-600">
              Time to fill it up! Place your first order and watch your history grow.
              </p>
              <Button
                onClick={() => router.push('/')}
                className="hover:from-[#D2F86A]90 rounded-xl bg-gradient-to-r from-[#002a01] to-[#002a01] px-8 py-3 text-white shadow-lg transition-all duration-200 hover:to-[#002a01]/90 hover:shadow-xl"
              >
                Order Now
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="group relative cursor-pointer overflow-hidden rounded-2xl border-r-1 border-[#002a01] bg-white/80 p-6 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
                  onClick={() => router.push(`/orders/${order.orderNumber}`)}
                >
                  {/* Hover Effect Background */}
                  <div className="absolute inset-0 bg-gradient-to-r from-[#D2F86A] to-[#002a01]/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>

                  <div className="relative z-10">
                    <div className="mb-4 flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`rounded-xl border p-3 ${
                            ((order as any).savings || 0) > 50
                              ? 'animate-pulse border-yellow-200 bg-gradient-to-br from-yellow-100 to-orange-100'
                              : 'border-green-200 bg-gradient-to-br from-green-100 to-emerald-100'
                          }`}
                        >
                          <div className="flex h-6 w-6 items-center justify-center">
                            <span
                              className={`text-lg font-bold ${
                                ((order as any).savings || 0) > 50
                                  ? 'text-orange-600'
                                  : 'text-green-600'
                              }`}
                            >
                              ₹
                            </span>
                          </div>
                        </div>
                        <div>
                          <h3
                            className={`text-xl font-bold ${
                              ((order as any).savings || 0) > 50
                                ? 'text-orange-600'
                                : 'text-green-600'
                            }`}
                          >
                            ₹{((order as any).savings || 0).toFixed(2)}
                          </h3>
                          <p
                            className={`text-xs font-medium ${
                              ((order as any).savings || 0) > 50
                                ? 'text-orange-500'
                                : 'text-green-500'
                            }`}
                          >
                            {((order as any).savings || 0) > 50
                              ? 'Great Savings!'
                              : 'Money Saved'}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mb-4 grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-2 rounded-lg border-t-1 border-l-1 border-[#002a01] bg-gray-50 px-3 py-2 text-sm text-gray-600">
                        <div className="rounded bg-[#002a01]/10 p-1">
                          <MapPin className="h-3 w-3 text-[#002a01]" />
                        </div>
                        <span className="truncate font-medium">
                          {order.restaurant?.name || 'Unknown Restaurant'}
                        </span>
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="rounded-lg border-b-1 border-l-1 border-[#002a01] bg-gray-50 px-3 py-2 text-sm text-gray-700">
                        {(order.orderItems || [])
                          .slice(0, 2)
                          .map(
                            (item) =>
                              `${item.menuItem?.name || 'Unknown Item'} (${item.quantity || 0})`
                          )
                          .join(', ')}
                        {(order.orderItems || []).length > 2 &&
                          ` +${(order.orderItems || []).length - 2} more`}
                      </p>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <div className="flex items-center gap-1 rounded-lg bg-white px-2 py-1 shadow-sm">
                          <Clock className="h-3 w-3" />
                          <span>
                            {order.createdAt
                              ? formatDate(order.createdAt)
                              : 'N/A'}
                          </span>
                          <span>
                            ,{' '}
                            {order.createdAt
                              ? formatTime(order.createdAt)
                              : 'N/A'}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-[#002a01]">
                          ₹{(order.total || order.totalAmount || 0).toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-500">Total Amount</p>
                      </div>
                    </div>
                  </div>

                  {/* Arrow Icon */}
                  <div className="absolute top-4 right-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <div className="rounded-full bg-[#002a01] p-2 shadow-lg">
                      <ArrowRight className="h-4 w-4 text-white" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
