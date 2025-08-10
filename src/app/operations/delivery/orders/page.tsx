"use client";

import { useState, useEffect } from "react";
import OperationsLayout from "@/components/layouts/operations-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Clock, 
  MapPin, 
  Phone,
  User,
  Package,
  RefreshCw,
  Search,
  Filter
} from "lucide-react";

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
  const [searchQuery, setSearchQuery] = useState("");
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

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.customer.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <OperationsLayout type="delivery">
        <div className="flex items-center justify-center min-h-screen">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5 animate-spin" />
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
            <h1 className="text-3xl font-bold text-primary-dark-green">
              Active Orders
            </h1>
            <p className="text-lg text-primary-dark-green mt-1">
              All active orders from restaurants
            </p>
          </div>
          <Button 
            onClick={loadOrders}
            className="bg-accent-leaf-green hover:bg-accent-leaf-green/90 text-primary-dark-green"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search orders by ID, restaurant, or customer..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-10 border-2 border-gray-300 rounded-lg"
                />
              </div>
              
              <div className="flex gap-2">
                {['ALL', 'PLACED', 'CONFIRMED', 'PREPARING', 'OUT_FOR_DELIVERY'].map(status => (
                  <Button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`h-10 px-4 rounded-lg ${
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
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2 text-primary-dark-green">
                No Active Orders
              </h3>
              <p className="text-gray-600">
                {searchQuery || statusFilter !== 'ALL' 
                  ? 'No orders match your current filters.'
                  : 'No active orders from restaurants at the moment.'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOrders.map((order) => (
              <Card key={order.id} className="restaurant-card">
                <CardContent className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-primary-dark-green">
                        #{order.orderNumber}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {new Date(order.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <Badge className={`px-2 py-1 text-xs font-medium border ${getStatusBadgeColor(order.status)}`}>
                      {order.status.replace('_', ' ')}
                    </Badge>
                  </div>

                  {/* Restaurant & Customer Info */}
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Restaurant:</span>
                      <span className="font-medium">{order.restaurant.name}</span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Customer:</span>
                      <span className="font-medium">{order.customer.name}</span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Delivery Partner:</span>
                      <span className="font-medium">
                        {order.deliveryPartner ? order.deliveryPartner.user.name : 'Unassigned'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Total Amount:</span>
                      <span className="font-medium text-primary-dark-green">₹{order.totalAmount}</span>
                    </div>

                    <div className="flex items-start justify-between text-sm">
                      <span className="text-gray-600">Delivery Address:</span>
                      <span className="font-medium text-right max-w-[60%]">
                        {order.deliveryAddress.address}, {order.deliveryAddress.city}
                      </span>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="border-t pt-3 mb-4">
                    <div className="text-sm font-medium text-gray-700 mb-2">Items ({order.items.length}):</div>
                    <div className="space-y-1">
                      {order.items.slice(0, 3).map((item) => (
                        <div key={item.id} className="flex items-center justify-between text-xs text-gray-600">
                          <span>{item.quantity}x {item.menuItem.name}</span>
                          <span>₹{item.menuItem.price * item.quantity}</span>
                        </div>
                      ))}
                      {order.items.length > 3 && (
                        <div className="text-xs text-gray-500">+{order.items.length - 3} more items</div>
                      )}
                    </div>
                  </div>

                  {/* Time Details */}
                  <div className="border-t pt-3 space-y-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="w-4 h-4 mr-2" />
                      <span>Pickup: {new Date(order.pickupTime).toLocaleTimeString()}</span>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="w-4 h-4 mr-2" />
                      <span>ETA: {new Date(order.estimatedDeliveryTime).toLocaleTimeString()}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-4 flex gap-2">
                    <Button
                      className="flex-1 bg-blue-100 hover:bg-blue-200 text-blue-700 text-sm"
                      onClick={() => {
                        if (order.customer.phone) {
                          window.open(`tel:${order.customer.phone}`);
                        }
                      }}
                    >
                      <Phone className="w-4 h-4 mr-1" />
                      Call Customer
                    </Button>
                    
                    <Button
                      className="flex-1 bg-green-100 hover:bg-green-200 text-green-700 text-sm"
                      onClick={() => {
                        if (order.restaurant.phone) {
                          window.open(`tel:${order.restaurant.phone}`);
                        }
                      }}
                    >
                      <Phone className="w-4 h-4 mr-1" />
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
