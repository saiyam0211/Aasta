'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Clock,
  Search,
  Filter,
  CheckCircle,
  ChefHat,
  Package,
  Truck,
  AlertCircle,
  RefreshCw,
  Eye,
} from 'lucide-react';
import { toast } from 'sonner';
import RestaurantLayout from '@/components/layouts/restaurant-layout';

interface OrderItem {
  id: string;
  menuItemId: string;
  quantity: number;
  price: number;
  itemName: string;
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  subtotal: number;
  createdAt: string;
  estimatedDeliveryTime: string;
  deliveryAddress: string;
  items: OrderItem[];
  customer: {
    name: string;
    phone?: string;
  };
}

const statusConfig = {
  PLACED: {
    color: 'bg-blue-100 text-blue-800',
    icon: Clock,
    label: 'New Order',
  },
  CONFIRMED: {
    color: 'bg-green-100 text-green-800',
    icon: CheckCircle,
    label: 'Confirmed',
  },
  PREPARING: {
    color: 'bg-yellow-100 text-yellow-800',
    icon: ChefHat,
    label: 'Preparing',
  },
  READY_FOR_PICKUP: {
    color: 'bg-purple-100 text-purple-800',
    icon: Package,
    label: 'Ready',
  },
  OUT_FOR_DELIVERY: {
    color: 'bg-orange-100 text-orange-800',
    icon: Truck,
    label: 'Out for Delivery',
  },
  DELIVERED: {
    color: 'bg-green-100 text-green-800',
    icon: CheckCircle,
    label: 'Delivered',
  },
};

export default function RestaurantOrdersPage() {
  const { data: session } = useSession();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [updatingOrders, setUpdatingOrders] = useState<Set<string>>(new Set());
  const [verificationCodes, setVerificationCodes] = useState<{
    [orderNumber: string]: string;
  }>({});

  useEffect(() => {
    fetchOrders();
    // Set up auto-refresh every 30 seconds
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    filterOrders();
  }, [orders, searchTerm, statusFilter]);

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/restaurant/orders');
      const data = await response.json();

      if (data.success) {
        setOrders(data.orders);
      } else {
        toast.error('Failed to fetch orders');
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      toast.error('Failed to fetch orders');
    } finally {
      setIsLoading(false);
    }
  };

  const filterOrders = () => {
    let filtered = orders;

    if (searchTerm) {
      filtered = filtered.filter(
        (order) =>
          order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.customer.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'ALL') {
      filtered = filtered.filter((order) => order.status === statusFilter);
    }

    // Sort by creation date (newest first)
    filtered.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    setFilteredOrders(filtered);
  };

  const updateOrderStatus = async (orderNumber: string, newStatus: string) => {
    setUpdatingOrders((prev) => new Set(prev).add(orderNumber));

    try {
      const response = await fetch(`/api/orders/${orderNumber}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();

      if (data.success) {
        setOrders((prev) =>
          prev.map((order) =>
            order.orderNumber === orderNumber
              ? { ...order, status: newStatus }
              : order
          )
        );
        toast.success(
          `Order ${orderNumber} updated to ${newStatus.replace('_', ' ').toLowerCase()}`
        );
      } else {
        toast.error('Failed to update order status');
      }
    } catch (error) {
      console.error('Failed to update order:', error);
      toast.error('Failed to update order status');
    } finally {
      setUpdatingOrders((prev) => {
        const next = new Set(prev);
        next.delete(orderNumber);
        return next;
      });
    }
  };

  const getNextStatus = (currentStatus: string): string | null => {
    const statusOrder = [
      'PLACED',
      'CONFIRMED',
      'PREPARING',
      'READY_FOR_PICKUP',
    ];
    const currentIndex = statusOrder.indexOf(currentStatus);
    return currentIndex < statusOrder.length - 1
      ? statusOrder[currentIndex + 1]
      : null;
  };

  const handleVerification = async (orderNumber: string) => {
    const verificationCode = verificationCodes[orderNumber];
    if (!verificationCode) {
      toast.error('Please enter verification code');
      return;
    }

    setUpdatingOrders((prev) => new Set(prev).add(orderNumber));

    try {
      const response = await fetch(`/api/orders/${orderNumber}/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ verificationCode }),
      });

      const data = await response.json();

      if (data.success) {
        setOrders((prev) =>
          prev.map((order) =>
            order.orderNumber === orderNumber
              ? { ...order, status: 'OUT_FOR_DELIVERY' }
              : order
          )
        );
        toast.success('Order verified and handed over to delivery partner!');
        // Clear the verification code
        setVerificationCodes((prev) => {
          const next = { ...prev };
          delete next[orderNumber];
          return next;
        });
      } else {
        toast.error(data.error || 'Invalid verification code');
      }
    } catch (error) {
      console.error('Failed to verify order:', error);
      toast.error('Failed to verify order');
    } finally {
      setUpdatingOrders((prev) => {
        const next = new Set(prev);
        next.delete(orderNumber);
        return next;
      });
    }
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

  const getPriorityClass = (order: Order) => {
    const minutesAgo = Math.floor(
      (new Date().getTime() - new Date(order.createdAt).getTime()) / (1000 * 60)
    );
    if (minutesAgo > 30 && ['PLACED', 'CONFIRMED'].includes(order.status)) {
      return 'border-l-4 border-l-red-500 bg-red-50';
    }
    if (minutesAgo > 15 && order.status === 'PLACED') {
      return 'border-l-4 border-l-yellow-500 bg-yellow-50';
    }
    return '';
  };

  if (isLoading) {
    return (
      <RestaurantLayout title="Orders">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-1/3 rounded bg-gray-200"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 rounded bg-gray-200"></div>
            ))}
          </div>
        </div>
      </RestaurantLayout>
    );
  }

  return (
    <RestaurantLayout title="Orders">
      <div className="animate-fade-in space-y-6">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: '#002a01' }}>
              Order Management
            </h1>
            <p className="mt-2 text-gray-600">
              Manage incoming orders and update their status
            </p>
          </div>
          <Button
            onClick={fetchOrders}
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

        {/* Filters */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
            <Input
              placeholder="Search by order number or customer name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-md border border-gray-300 bg-white px-3 py-2"
          >
            <option value="ALL">All Orders</option>
            <option value="PLACED">New Orders</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="PREPARING">Preparing</option>
            <option value="READY_FOR_PICKUP">Ready for Pickup</option>
          </select>
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {filteredOrders.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <AlertCircle className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                <h3 className="mb-2 text-lg font-semibold">No orders found</h3>
                <p className="text-gray-500">
                  {searchTerm || statusFilter !== 'ALL'
                    ? 'Try adjusting your search or filter criteria'
                    : 'New orders will appear here'}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredOrders.map((order) => {
              const statusInfo =
                statusConfig[order.status as keyof typeof statusConfig];
              const Icon = statusInfo?.icon || Clock;
              const nextStatus = getNextStatus(order.status);
              const isUpdating = updatingOrders.has(order.orderNumber);

              return (
                <Card key={order.id} className={`${getPriorityClass(order)}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">
                          Order #{order.orderNumber}
                        </CardTitle>
                        <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
                          <span>{order.customer.name}</span>
                          <span>•</span>
                          <span>{getTimeAgo(order.createdAt)}</span>
                          <span>•</span>
                          <span>₹{(order.totalAmount || 0).toFixed(2)}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge
                          className={`${statusInfo?.color} flex items-center gap-1 px-3 py-1`}
                        >
                          <Icon className="h-3 w-3" />
                          {statusInfo?.label}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {/* Order Items */}
                    <div className="mb-4">
                      <h4 className="mb-2 font-semibold">
                        Items ({order.items.length})
                      </h4>
                      <div className="space-y-1">
                        {order.items.map((item) => (
                          <div
                            key={item.id}
                            className="flex justify-between text-sm"
                          >
                            <span>
                              {item.quantity}x {item.itemName}
                            </span>
                            <span>
                              ₹{(item.price * item.quantity).toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Delivery Address */}
                    <div className="mb-4 rounded bg-gray-50 p-3">
                      <h4 className="mb-1 text-sm font-semibold">
                        Delivery Address
                      </h4>
                      <p className="text-sm text-gray-600">
                        {order.deliveryAddress}
                      </p>
                    </div>

                    {/* Verification Code Section for READY_FOR_PICKUP */}
                    {order.status === 'READY_FOR_PICKUP' && (
                      <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-4">
                        <h4 className="mb-3 text-sm font-semibold text-blue-800">
                          🔒 Order Verification Required
                        </h4>
                        <p className="mb-3 text-sm text-blue-700">
                          The delivery partner will provide a verification code.
                          Enter it below to confirm handover.
                        </p>
                        <div className="flex items-center gap-3">
                          <Input
                            type="text"
                            placeholder="Enter 6-digit code"
                            value={verificationCodes[order.orderNumber] || ''}
                            onChange={(e) =>
                              setVerificationCodes((prev) => ({
                                ...prev,
                                [order.orderNumber]: e.target.value,
                              }))
                            }
                            className="h-9 max-w-xs text-sm"
                            maxLength={6}
                          />
                          <Button
                            size="sm"
                            onClick={() =>
                              handleVerification(order.orderNumber)
                            }
                            disabled={
                              isUpdating ||
                              !verificationCodes[order.orderNumber]
                            }
                            style={{
                              backgroundColor: '#007bff',
                              color: '#fff',
                            }}
                          >
                            {isUpdating ? (
                              <RefreshCw className="mr-1 h-4 w-4 animate-spin" />
                            ) : (
                              <CheckCircle className="mr-1 h-4 w-4" />
                            )}
                            Verify & Handover
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-500">
                        Est. delivery:{' '}
                        {new Date(
                          order.estimatedDeliveryTime
                        ).toLocaleTimeString()}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            /* View details */
                          }}
                        >
                          <Eye className="mr-1 h-4 w-4" />
                          View
                        </Button>
                        {nextStatus && (
                          <Button
                            size="sm"
                            onClick={() =>
                              updateOrderStatus(order.orderNumber, nextStatus)
                            }
                            disabled={isUpdating}
                            style={{
                              backgroundColor: '#d1f86a',
                              color: '#002a01',
                              border: '1px solid #002a01',
                            }}
                          >
                            {isUpdating ? (
                              <RefreshCw className="mr-1 h-4 w-4 animate-spin" />
                            ) : (
                              <CheckCircle className="mr-1 h-4 w-4" />
                            )}
                            Mark{' '}
                            {
                              statusConfig[
                                nextStatus as keyof typeof statusConfig
                              ]?.label
                            }
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </RestaurantLayout>
  );
}
