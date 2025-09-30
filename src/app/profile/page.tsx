'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import CustomerLayout from '@/components/layouts/customer-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import AddressSheet from '@/components/ui/AddressSheet';
import { useCartStore } from '@/lib/store';
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
  Share2,
  BookOpen,
  Info,
  Shield,
  Bell,
  LogOut,
  Menu,
  ChevronRight,
  RefreshCw,
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
  const [isAddressSheetOpen, setIsAddressSheetOpen] = useState(false);
  const { addItem: addToCart, clearCart } = useCartStore();

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

  const handleReorder = async (order: Order) => {
    try {
      // Clear existing cart first
      clearCart();
      
      // Get restaurant details (we'll need to fetch this or use existing data)
      const restaurant = {
        id: 'unknown', // We'll need to get this from the order data
        name: order.restaurant?.name || 'Unknown Restaurant',
        // Add other restaurant properties as needed
      };

      // Add each item from the order to cart
      if (order.orderItems && order.orderItems.length > 0) {
        for (const orderItem of order.orderItems) {
          if (orderItem.menuItem && orderItem.quantity && orderItem.unitPrice) {
            const cartItem = {
              menuItemId: `item-${Date.now()}-${Math.random()}`, // Generate unique ID
              menuItem: {
                id: `item-${Date.now()}-${Math.random()}`,
                name: orderItem.menuItem.name || 'Unknown Item',
                price: orderItem.unitPrice,
                // Add other menu item properties as needed
              },
              quantity: orderItem.quantity,
              customizations: {}, // No customizations for reorder
              subtotal: orderItem.totalPrice || (orderItem.unitPrice * orderItem.quantity),
            };

            addToCart(cartItem, restaurant);
          }
        }
      }

      // Show success message
      toast.success('Items added to cart!');
      
      // Redirect to cart page
      router.push('/cart');
    } catch (error) {
      console.error('Error reordering:', error);
      toast.error('Failed to add items to cart');
    }
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
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200 px-4 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <Button
            onClick={handleGoBack}
            variant="ghost"
            size="sm"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>

          {/* Total Savings Display */}
          {totalSavings > 0 && (
            <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2">
              <div className="flex items-center gap-1">
                <span className="text-sm font-bold text-green-700">₹</span>
                <span className="text-sm font-bold text-green-700">
                  {totalSavings.toFixed(0)}
                </span>
              </div>
              <span className="text-xs font-medium text-green-600">
                Total Saved
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-6">
      {/* User Profile Section */}
        <Card className="mb-6 border border-gray-200 bg-gray-50 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-6">
              {/* Avatar */}
              <div className="relative">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                  <User className="h-8 w-8 text-gray-600" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                  <CheckCircle className="h-3 w-3 text-white" />
                </div>
              </div>
              
              {/* User Info */}
              <div className="flex-1 min-w-0">
                <h2 className="text-2xl font-bold text-gray-900 truncate">
                  {session.user?.name || 'User'}
                </h2>

                
                <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="h-4 w-4" />
                  <span className="truncate">{session.user?.phone || 'No phone'}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Options Section */}
        <Card className="mb-6 border border-gray-200 bg-gray-50 shadow-sm">
          <CardHeader className="border-b border-gray-200 bg-gray-50 px-4 py-3 sm:px-6 sm:py-4">
            <CardTitle className="text-2xl sm:text-2xl font-semibold text-gray-900">
              Account Options
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-0">
              {/* Share the app */}
              <div 
                className="flex items-center justify-between p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: 'Aasta Food Delivery',
                      text: 'Check out Aasta for amazing food delivery!',
                      url: window.location.origin
                    });
                  } else {
                    // Fallback for browsers that don't support Web Share API
                    navigator.clipboard.writeText(window.location.origin);
                    toast.success('App link copied to clipboard!');
                  }
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Share2 className="h-5 w-5 text-blue-600" />
                  </div>
                  <span className="font-medium text-gray-900">Share the app</span>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </div>

              {/* Address book */}
              <div 
                className="flex items-center justify-between p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => setIsAddressSheetOpen(true)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <BookOpen className="h-5 w-5 text-green-600" />
                  </div>
                  <span className="font-medium text-gray-900">Address book</span>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </div>

              {/* About us */}
              <div 
                className="flex items-center justify-between p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => router.push('/about')}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Info className="h-5 w-5 text-purple-600" />
                  </div>
                  <span className="font-medium text-gray-900">About us</span>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </div>

              {/* Privacy policy and agreements */}
              <div 
                className="flex items-center justify-between p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => router.push('/privacy')}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Shield className="h-5 w-5 text-orange-600" />
                  </div>
                  <span className="font-medium text-gray-900">Privacy policy and agreements</span>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </div>

              {/* Notification preference */}
              <div 
                className="flex items-center justify-between p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => router.push('/notifications')}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <Bell className="h-5 w-5 text-yellow-600" />
                  </div>
                  <span className="font-medium text-gray-900">Notification preference</span>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </div>

              {/* Logout */}
              <div 
                className="flex items-center justify-between p-4 hover:bg-red-50 cursor-pointer transition-colors"
                onClick={() => {
                  if (confirm('Are you sure you want to logout?')) {
                    // Handle logout logic here
                    router.push('/auth/signin');
                  }
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                    <LogOut className="h-5 w-5 text-red-600" />
                  </div>
                  <span className="font-medium text-gray-900">Logout</span>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-400" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Orders Section */}
        <Card className="border border-gray-200 bg-gray-50 shadow-sm">
          
          <CardHeader className="border-b border-gray-200 bg-gray-50 px-4 py-3 sm:px-6 sm:py-4">
            <CardTitle className="text-2xl sm:text-2xl font-semibold text-gray-900">
              Recent Orders
            </CardTitle>
        </CardHeader>
          <CardContent className="p-4 sm:p-6">
          {loading ? (
              <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-24 rounded-lg bg-gray-200"></div>
                </div>
              ))}
            </div>
          ) : orders.length === 0 ? (
            <div className="py-12 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                  <Package className="h-8 w-8 text-gray-400" />
              </div>
                <h3 className="mb-2 text-lg font-semibold text-gray-900">
                  No orders yet
              </h3>
                <p className="mb-6 text-sm text-gray-500">
                  Start your food journey by placing your first order
              </p>
              <Button
                onClick={() => router.push('/')}
                  className="bg-gray-900 text-white hover:bg-gray-800"
              >
                  Browse Restaurants
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
                {orders.map((order) => {
                  const savings = (order as any).savings || 0;
                  
                  return (
                <div
                  key={order.id}
                      className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => router.push(`/orders/${order.orderNumber}`)}
                >
                      <div className="p-4">
                        {/* Header */}
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                              <Store className="h-5 w-5 text-gray-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-gray-900 text-base truncate">
                                {order.restaurant?.name || 'Unknown Restaurant'}
                              </h3>
                              <div className="flex items-center gap-1 text-sm text-gray-500">
                                <Clock className="h-3 w-3" />
                                <span>
                                  {order.createdAt ? formatDate(order.createdAt) : 'N/A'}, {order.createdAt ? formatTime(order.createdAt) : 'N/A'}
                            </span>
                          </div>
                        </div>
                        </div>
                          <div className="text-right flex-shrink-0 ml-3">
                            <div className="text-lg font-bold text-gray-900">
                              ₹{(order.total || order.totalAmount || 0).toFixed(2)}
                      </div>
                            <div className="text-sm text-gray-500">total</div>
                      </div>
                    </div>

                        {/* Order Items */}
                        <div className="mb-3">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                            <span className="text-sm text-gray-600">
                        {(order.orderItems || [])
                                .slice(0, 1)
                          .map(
                            (item) =>
                                    `${item.quantity || 1} x ${item.menuItem?.name || 'Unknown Item'}`
                          )
                          .join(', ')}
                              {(order.orderItems || []).length > 1 &&
                                ` +${(order.orderItems || []).length - 1} more`}
                            </span>
                          </div>
                    </div>

                        {/* Footer */}
                    <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {savings > 0 && (
                              <div className=" px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">
                                Saved ₹{savings.toFixed(0)}
                              </div>
                            )}
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 border-red-200 hover:bg-red-50 text-sm px-3 py-1"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleReorder(order);
                            }}
                          >
                            <RefreshCw className="h-3 w-3 mr-1" />
                            Reorder
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </CardContent>
      </Card>
      </div>

      {/* Address Sheet */}
      <AddressSheet
        open={isAddressSheetOpen}
        onOpenChange={setIsAddressSheetOpen}
        onSelect={(address) => {
          // Handle address selection
          console.log('Selected address:', address);
          toast.success('Address selected successfully!');
          setIsAddressSheetOpen(false);
        }}
      />
    </div>
  );
}
