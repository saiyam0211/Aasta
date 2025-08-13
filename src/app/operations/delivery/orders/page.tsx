'use client';

import { useState, useEffect } from 'react';
import OperationsLayout from '@/components/layouts/operations-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Clock,
  MapPin,
  Phone,
  User,
  Package,
  RefreshCw,
  Search,
  Filter,
} from 'lucide-react';

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  estimatedDeliveryTime: string;
  pickupTime: string;
  restaurant: {
    id: string;
    name: string;
    address: string;
    phone: string;
  };
  customer: {
    id: string;
    name: string;
    phone: string;
    email: string;
  };
  deliveryPartner?: {
    id: string;
    user: {
      name: string;
      phone: string;
    };
  };
  deliveryAddress: {
    address: string;
    city: string;
    zipCode: string;
  };
  items: {
    id: string;
    quantity: number;
    menuItem: {
      name: string;
      price: number;
    };
  }[];
}

export default function ActiveOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/operations/active-orders');
      const data = await response.json();
      if (data.success) {
        setOrders(data.data || []);
      } else {
        console.error('Error loading active orders:', data.error);
      }
    } catch (error) {
      console.error('Error loading active orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'PLACED':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'CONFIRMED':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'PREPARING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'READY_FOR_PICKUP':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'PICKED_UP':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'OUT_FOR_DELIVERY':
        return 'bg-teal-100 text-teal-800 border-teal-200';
      case 'DELIVERED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === 'ALL' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <OperationsLayout type="delivery">
        <div className="flex min-h-screen items-center justify-center">
          <div className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 animate-spin" />
            Loading active orders...
          </div>
        </div>
      </OperationsLayout>
    );
  }

  return (
    <OperationsLayout type="delivery">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-primary-dark-green text-3xl font-bold">
              Active Orders
            </h1>
            <p className="text-primary-dark-green mt-1 text-lg">
              All active orders from restaurants
            </p>
          </div>
          <Button
            onClick={loadOrders}
            className="bg-accent-leaf-green hover:bg-accent-leaf-green/90 text-primary-dark-green"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col gap-4 md:flex-row">
              <div className="relative flex-1">
                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search orders by ID, restaurant, or customer..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-10 rounded-lg border-2 border-gray-300 pl-10"
                />
              </div>

              <div className="flex gap-2">
                {[
                  'ALL',
                  'PLACED',
                  'CONFIRMED',
                  'PREPARING',
                  'OUT_FOR_DELIVERY',
                ].map((status) => (
                  <Button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`h-10 rounded-lg px-4 ${
                      statusFilter === status
                        ? 'bg-accent-leaf-green text-primary-dark-green'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {status}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {filteredOrders.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Package className="mx-auto mb-4 h-12 w-12 text-gray-400" />
              <h3 className="text-primary-dark-green mb-2 text-lg font-semibold">
                No Active Orders
              </h3>
              <p className="text-gray-600">
                {searchQuery || statusFilter !== 'ALL'
                  ? 'No orders match your current filters.'
                  : 'No active orders from restaurants at the moment.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredOrders.map((order) => (
              <Card key={order.id} className="restaurant-card">
                <CardContent className="p-6">
                  {/* Header */}
                  <div className="mb-4 flex items-start justify-between">
                    <div>
                      <h3 className="text-primary-dark-green text-lg font-semibold">
                        #{order.orderNumber}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {new Date(order.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <Badge
                      className={`border px-2 py-1 text-xs font-medium ${getStatusBadgeColor(order.status)}`}
                    >
                      {order.status.replace('_', ' ')}
                    </Badge>
                  </div>

                  {/* Restaurant & Customer Info */}
                  <div className="mb-4 space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Restaurant:</span>
                      <span className="font-medium">
                        {order.restaurant.name}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Customer:</span>
                      <span className="font-medium">{order.customer.name}</span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Delivery Partner:</span>
                      <span className="font-medium">
                        {order.deliveryPartner
                          ? order.deliveryPartner.user.name
                          : 'Unassigned'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Total Amount:</span>
                      <span className="text-primary-dark-green font-medium">
                        ₹{order.totalAmount}
                      </span>
                    </div>

                    <div className="flex items-start justify-between text-sm">
                      <span className="text-gray-600">Delivery Address:</span>
                      <span className="max-w-[60%] text-right font-medium">
                        {order.deliveryAddress.address},{' '}
                        {order.deliveryAddress.city}
                      </span>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="mb-4 border-t pt-3">
                    <div className="mb-2 text-sm font-medium text-gray-700">
                      Items ({order.items.length}):
                    </div>
                    <div className="space-y-1">
                      {order.items.slice(0, 3).map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between text-xs text-gray-600"
                        >
                          <span>
                            {item.quantity}x {item.menuItem.name}
                          </span>
                          <span>₹{item.menuItem.price * item.quantity}</span>
                        </div>
                      ))}
                      {order.items.length > 3 && (
                        <div className="text-xs text-gray-500">
                          +{order.items.length - 3} more items
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Time Details */}
                  <div className="space-y-2 border-t pt-3">
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="mr-2 h-4 w-4" />
                      <span>
                        Pickup:{' '}
                        {new Date(order.pickupTime).toLocaleTimeString()}
                      </span>
                    </div>

                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="mr-2 h-4 w-4" />
                      <span>
                        ETA:{' '}
                        {new Date(
                          order.estimatedDeliveryTime
                        ).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-4 flex gap-2">
                    <Button
                      className="flex-1 bg-blue-100 text-sm text-blue-700 hover:bg-blue-200"
                      onClick={() => {
                        if (order.customer.phone) {
                          window.open(`tel:${order.customer.phone}`);
                        }
                      }}
                    >
                      <Phone className="mr-1 h-4 w-4" />
                      Call Customer
                    </Button>

                    <Button
                      className="flex-1 bg-green-100 text-sm text-green-700 hover:bg-green-200"
                      onClick={() => {
                        if (order.restaurant.phone) {
                          window.open(`tel:${order.restaurant.phone}`);
                        }
                      }}
                    >
                      <Phone className="mr-1 h-4 w-4" />
                      Call Restaurant
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </OperationsLayout>
  );
}
