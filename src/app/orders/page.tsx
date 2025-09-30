'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import CustomerLayout from '@/components/layouts/customer-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, Store, Clock, RefreshCw, ArrowLeft } from 'lucide-react';
import { useCartStore } from '@/lib/store';
import { toast } from 'sonner';

interface OrderItem {
  menuItem?: { id?: string; name?: string; imageUrl?: string; category?: string; spiceLevel?: string; dietaryTags?: string[] };
  quantity?: number;
  unitPrice?: number;
  totalPrice?: number;
  originalUnitPrice?: number;
  totalOriginalPrice?: number;
  preparationTime?: number;
}

interface Order {
  id: string;
  orderNumber?: string;
  total?: number;
  totalAmount?: number;
  createdAt?: string;
  restaurant?: { id?: string; name?: string };
  orderItems?: OrderItem[];
}

export default function OrdersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const { addItem: addToCart, clearCart } = useCartStore();

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/auth/signin');
      return;
    }
    loadOrders();
  }, [status, session]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/orders?limit=50&paymentStatus=COMPLETED');
      const data = await res.json();
      if (data?.success) setOrders(data.data?.orders || []);
    } catch (e) {
      console.error(e);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (d?: string) => (d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A');
  const formatTime = (d?: string) => (d ? new Date(d).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : 'N/A');

  const handleGoBack = () => router.back();

  const handleReorder = async (order: Order) => {
    try {
      clearCart();
      const restaurant = { id: order.restaurant?.id || 'unknown', name: order.restaurant?.name || 'Unknown Restaurant' } as any;
      for (const it of order.orderItems || []) {
        if (!it.menuItem || !it.quantity || !it.unitPrice) continue;
        const cartItem = {
          menuItemId: `${it.menuItem.id || `mi-${Math.random()}`}`,
          menuItem: {
            id: it.menuItem.id || `mi-${Math.random()}`,
            name: it.menuItem.name || 'Item',
            price: it.unitPrice,
          },
          quantity: it.quantity,
          subtotal: it.totalPrice || it.unitPrice * it.quantity,
        } as any;
        addToCart(cartItem, restaurant);
      }
      toast.success('Items added to cart');
      router.push('/cart');
    } catch (e) {
      console.error(e);
      toast.error('Failed to reorder');
    }
  };

  if (status === 'loading' || !session) {
    return <div className="min-h-screen" />;
  }

  return (
    <CustomerLayout>
      <div className="mx-auto max-w-4xl px-4 py-6">
        {/* Header */}
        <div className="mb-4 flex justify-between">
          <Button
            onClick={handleGoBack}
            variant="ghost"
            size="sm"
            className="h-10 w-20 rounded-full border border-white/20 bg-white mt-1 p-0 shadow-sm backdrop-blur-sm hover:bg-white"
          >
            <ArrowLeft className="h-5 w-5" style={{ color: '#002a01' }} /> Back
          </Button>
        </div>

        <Card className="border border-gray-200 bg-gray-50 shadow-sm">
          <CardHeader className="border-b border-gray-200 bg-gray-50 px-4 py-3 sm:px-6 sm:py-4">
            <CardTitle className="text-2xl font-semibold text-gray-900">Your Orders</CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-24 rounded-lg bg-gray-200 animate-pulse" />
                ))}
              </div>
            ) : orders.length === 0 ? (
              <div className="py-12 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                  <Package className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-gray-900">No orders yet</h3>
                <p className="mb-6 text-sm text-gray-500">Start your food journey by placing your first order</p>
                <Button onClick={() => router.push('/')} className="bg-gray-900 text-white hover:bg-gray-800">Browse Restaurants</Button>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order.id} className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.push(`/orders/${order.orderNumber}`)}>
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Store className="h-5 w-5 text-gray-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 text-base truncate">{order.restaurant?.name || 'Unknown Restaurant'}</h3>
                            <div className="flex items-center gap-1 text-sm text-gray-500">
                              <Clock className="h-3 w-3" />
                              <span>{formatDate(order.createdAt)}, {formatTime(order.createdAt)}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0 ml-3">
                          <div className="text-lg font-bold text-gray-900">₹{(order.total || order.totalAmount || 0).toFixed(2)}</div>
                          <div className="text-sm text-gray-500">total</div>
                        </div>
                      </div>

                      <div className="mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                          <span className="text-sm text-gray-600">
                            {(order.orderItems || []).slice(0, 1).map((item) => `${item.quantity || 1} x ${item.menuItem?.name || 'Unknown Item'}`).join(', ')}
                            {(order.orderItems || []).length > 1 && ` +${(order.orderItems || []).length - 1} more`}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div />
                        <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50 text-sm px-3 py-1" onClick={(e) => { e.stopPropagation(); handleReorder(order); }}>
                          <RefreshCw className="h-3 w-3 mr-1" /> Reorder
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </CustomerLayout>
  );
}
