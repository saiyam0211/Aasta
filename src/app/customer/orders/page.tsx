'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Clock,
  ShoppingBag,
  Star,
  RefreshCw,
  Search,
  MapPin,
  Phone,
  Truck,
  Package,
  ChefHat,
  CheckCircle,
  Filter,
  Calendar,
  TrendingUp,
} from 'lucide-react';
import CustomerLayout from '@/components/layouts/customer-layout';
import { toast } from 'sonner';

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
  total: number;
  subtotal: number;
  taxes: number;
  deliveryFee: number;
  createdAt: string;
  estimatedDeliveryTime: string;
  estimatedPreparationTime: number;
  estimatedDeliveryDuration: number;
  deliveryAddress: string;
  items: OrderItem[];
  restaurant: {
    id: string;
    name: string;
    address?: string;
  };
}

// OrdersList component for rendering orders
const OrdersList = ({ orders }: { orders: Order[] }) => {
  const router = useRouter();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PLACED':
        return 'bg-[#f3ffe6] text-[#002a01] border border-[#d1f86a]/50';
      case 'CONFIRMED':
        return 'bg-[#e9ffe0] text-[#0f6a16] border border-[#d1f86a]/50';
      case 'PREPARING':
        return 'bg-[#fff6db] text-[#7a5a00] border border-[#ffd166]/50';
      case 'READY_FOR_PICKUP':
        return 'bg-[#eef2ff] text-[#1d4ed8] border border-[#c7d2fe]/60';
      case 'OUT_FOR_DELIVERY':
        return 'bg-[#fff0e6] text-[#7a3d00] border border-[#fb923c]/50';
      case 'DELIVERED':
        return 'bg-[#e9ffe9] text-[#0f6a16] border border-[#d1f86a]/50';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PLACED':
        return Clock;
      case 'CONFIRMED':
        return CheckCircle;
      case 'PREPARING':
        return ChefHat;
      case 'READY_FOR_PICKUP':
        return Package;
      case 'OUT_FOR_DELIVERY':
        return Truck;
      case 'DELIVERED':
        return CheckCircle;
      default:
        return Clock;
    }
  };

  const getOrderProgress = (status: string) => {
    const statusOrder = [
      'PLACED',
      'CONFIRMED',
      'PREPARING',
      'READY_FOR_PICKUP',
      'OUT_FOR_DELIVERY',
      'DELIVERED',
    ];
    const currentIndex = statusOrder.indexOf(status);
    return ((currentIndex + 1) / statusOrder.length) * 100;
  };

  const isActiveOrder = (status: string) => {
    return !['DELIVERED', 'CANCELLED'].includes(status);
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  const getCalculatedEstimatedDeliveryTime = (order: Order) => {
    // Calculate: estimatedPrepTime + estimatedDeliveryDuration + 5 minutes
    const totalMinutes =
      order.estimatedPreparationTime + order.estimatedDeliveryDuration + 5;

    // Calculate estimated delivery time from order creation time
    const orderTime = new Date(order.createdAt);
    const estimatedTime = new Date(orderTime.getTime() + totalMinutes * 60000);

    return estimatedTime;
  };

  if (orders.length === 0) {
    return (
      <div className="py-12 text-center">
        <ShoppingBag className="mx-auto mb-4 h-12 w-12 text-gray-400" />
        <p className="text-gray-500">No orders found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => {
        const StatusIcon = getStatusIcon(order.status);
        const progress = getOrderProgress(order.status);
        const active = isActiveOrder(order.status);

        return (
          <Card
            key={order.id}
            className={`cursor-pointer transition-shadow hover:shadow-lg ${
              active ? 'border-l-4 border-l-[#d1f86a]' : ''
            } rounded-lg border border-[#002a01]/10`}
            onClick={() => router.push(`/customer/orders/${order.orderNumber}`)}
          >
            <CardHeader className="py-2">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    Order #{order.orderNumber}
                    {active && (
                      <span className="rounded-full border border-[#d1f86a]/60 bg-[#d1f86a]/30 px-2 py-[2px] text-[11px] text-[#002a01]">
                        Live
                      </span>
                    )}
                  </CardTitle>
                  <span className="text-sm text-gray-600">
                    {order.restaurant.name} • {getTimeAgo(order.createdAt)}
                  </span>
                </div>
                <Badge
                  className={`${getStatusColor(order.status)} flex items-center gap-1 rounded-full px-2 py-[2px] text-xs`}
                >
                  <StatusIcon className="h-3 w-3" />
                  {order.status.replace('_', ' ')}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              {/* Progress Bar for Active Orders */}
              {active && (
                <div className="mb-3">
                  <div className="mb-1 flex justify-between text-xs text-gray-500">
                    <span>Order Progress</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-gray-200">
                    <div
                      className="h-1.5 rounded-full bg-[#d1f86a] transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Order Items */}
              <div className="mb-2">
                <span className="block overflow-hidden text-sm text-ellipsis whitespace-nowrap text-gray-600">
                  {order.items
                    .map((item, index) => (
                      <span key={item.id}>
                        {item.quantity}x {item.itemName}
                      </span>
                    ))
                    .reduce(
                      (acc: any, el, index) =>
                        index === 0 ? [el] : [...acc, ', ', el],
                      []
                    )}
                </span>
              </div>

              {/* Delivery Address */}
              {active && (
                <div className="mb-3 rounded-lg border border-[#d1f86a]/40 bg-[#f6ffe6] p-2 text-xs">
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="h-4 w-4" />
                    <span className="font-medium">Delivery to:</span>
                  </div>
                  <p className="ml-6 overflow-hidden text-ellipsis whitespace-nowrap text-gray-700">
                    {order.deliveryAddress}
                  </p>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {(() => {
                    if (
                      order.status === 'DELIVERED' &&
                      order.estimatedDeliveryTime
                    ) {
                      return (
                        <div className="flex items-center gap-1 text-xs text-gray-600">
                          <Clock className="h-4 w-4" />
                          {`Delivered ${new Date(order.estimatedDeliveryTime).toLocaleDateString()}`}
                        </div>
                      );
                    } else if (
                      order.estimatedPreparationTime ||
                      order.estimatedDeliveryDuration
                    ) {
                      const calculatedTime =
                        getCalculatedEstimatedDeliveryTime(order);
                      return (
                        <div className="flex items-center gap-1 text-xs text-gray-600">
                          <Clock className="h-4 w-4" />
                          {`Est: ${calculatedTime.toLocaleTimeString()}`}
                        </div>
                      );
                    } else if (order.estimatedDeliveryTime) {
                      return (
                        <div className="flex items-center gap-1 text-xs text-gray-600">
                          <Clock className="h-4 w-4" />
                          {`Est: ${new Date(order.estimatedDeliveryTime).toLocaleTimeString()}`}
                        </div>
                      );
                    }
                    return null;
                  })()}
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className="text-base font-bold"
                    style={{ color: '#002a01' }}
                  >
                    ₹{order.total.toFixed(2)}
                  </span>
                  {order.status === 'DELIVERED' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Add rating functionality here
                      }}
                    >
                      <Star className="mr-1 h-4 w-4" />
                      Rate
                    </Button>
                  )}
                  {active && (
                    <Button
                      size="sm"
                      style={{
                        backgroundColor: '#d1f86a',
                        color: '#002a01',
                        border: '1px solid #002a01',
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/customer/orders/${order.orderNumber}`);
                      }}
                    >
                      Track Order
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default function OrdersPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    if (session?.user?.id) {
      fetchOrders();
    }
  }, [session]);

  useEffect(() => {
    filterOrders();
  }, [orders, searchTerm, statusFilter]);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/orders?as=customer`);
      if (!response.ok) {
        const text = await response.text().catch(() => '');
        throw new Error(text || `HTTP ${response.status}`);
      }
      const data = await response.json();

      if (data?.success) {
        // Transform the API response to match our interface
        const transformedOrders = (data.data.orders || []).map((order: any) => {
          const restaurant = order.restaurant || {};
          const address = order.deliveryAddress || {};
          return {
            id: order.id,
            orderNumber: order.orderNumber,
            status: order.status,
            total: order.totalAmount,
            subtotal: order.subtotal,
            taxes: order.taxes,
            deliveryFee: order.deliveryFee,
            createdAt: order.createdAt,
            estimatedDeliveryTime: order.estimatedDeliveryTime,
            estimatedPreparationTime: order.estimatedPreparationTime || 0,
            estimatedDeliveryDuration: order.estimatedDeliveryDuration || 0,
            deliveryAddress:
              address?.street && address?.city
                ? `${address.street}, ${address.city}`
                : address?.street || address?.city || '',
            items: (order.orderItems || []).map((item: any) => ({
              id: item.id,
              menuItemId: item.menuItemId,
              quantity: item.quantity,
              price: item.unitPrice,
              itemName: item.menuItem?.name || 'Item',
            })),
            restaurant: {
              id: restaurant?.id || '',
              name: restaurant?.name || 'Restaurant',
              address: restaurant?.address,
            },
          } as Order;
        });
        setOrders(transformedOrders);
      } else {
        toast.error(data?.error || 'Failed to fetch orders');
      }
    } catch (error: any) {
      console.error('Failed to fetch orders:', error);
      toast.error(error?.message || 'Failed to fetch orders');
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
          order.restaurant.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'ALL') {
      filtered = filtered.filter((order) => order.status === statusFilter);
    }

    filtered.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    setFilteredOrders(filtered);
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PLACED':
        return Clock;
      case 'CONFIRMED':
        return CheckCircle;
      case 'PREPARING':
        return ChefHat;
      case 'READY_FOR_PICKUP':
        return Package;
      case 'OUT_FOR_DELIVERY':
        return Truck;
      case 'DELIVERED':
        return CheckCircle;
      default:
        return Clock;
    }
  };

  const getOrderProgress = (status: string) => {
    const statusOrder = [
      'PLACED',
      'CONFIRMED',
      'PREPARING',
      'READY_FOR_PICKUP',
      'OUT_FOR_DELIVERY',
      'DELIVERED',
    ];
    const currentIndex = statusOrder.indexOf(status);
    return ((currentIndex + 1) / statusOrder.length) * 100;
  };

  const isActiveOrder = (status: string) => {
    return !['DELIVERED', 'CANCELLED'].includes(status);
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  // Calculate summary statistics
  const getOrderStats = () => {
    const activeOrders = orders.filter((order) => isActiveOrder(order.status));
    const completedOrders = orders.filter(
      (order) => order.status === 'DELIVERED'
    );
    const totalSpent = orders.reduce((sum, order) => sum + order.total, 0);
    const favoriteRestaurant = orders.reduce(
      (acc, order) => {
        acc[order.restaurant.name] = (acc[order.restaurant.name] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );
    const topRestaurant = Object.keys(favoriteRestaurant).reduce(
      (a, b) => (favoriteRestaurant[a] > favoriteRestaurant[b] ? a : b),
      ''
    );

    return {
      total: orders.length,
      active: activeOrders.length,
      completed: completedOrders.length,
      totalSpent,
      topRestaurant,
    };
  };

  const getFilteredOrdersByTab = (tab: string) => {
    let filtered = orders;

    switch (tab) {
      case 'active':
        filtered = orders.filter((order) => isActiveOrder(order.status));
        break;
      case 'completed':
        filtered = orders.filter((order) => order.status === 'DELIVERED');
        break;
      default:
        filtered = orders;
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (order) =>
          order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.restaurant.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'ALL') {
      filtered = filtered.filter((order) => order.status === statusFilter);
    }

    return filtered.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  };

  if (isLoading) {
    return (
      <CustomerLayout>
        <div className="mx-auto max-w-4xl px-4 py-6">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-1/3 rounded bg-gray-200"></div>
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 rounded bg-gray-200"></div>
            ))}
          </div>
        </div>
      </CustomerLayout>
    );
  }

  return (
    <CustomerLayout>
      <div className="mx-auto max-w-4xl px-4 py-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: '#002a01' }}>
              Your Orders
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              Track your current and past orders
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

        {orders.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <ShoppingBag className="mx-auto mb-4 h-16 w-16 text-gray-400" />
              <h3 className="mb-2 text-xl font-semibold">No orders yet</h3>
              <p className="mb-6 text-gray-500">
                When you place your first order, you'll see it here
              </p>
              <Button
                onClick={() => router.push('/customer/discover')}
                style={{
                  backgroundColor: '#d1f86a',
                  color: '#002a01',
                  border: '1px solid #002a01',
                }}
              >
                Start Ordering
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Summary Statistics */}
            {(() => {
              const stats = getOrderStats();
              return (
                <div className="mb-6 grid grid-cols-1 gap-3 md:grid-cols-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">
                            Total Orders
                          </p>
                          <p
                            className="text-xl font-bold"
                            style={{ color: '#002a01' }}
                          >
                            {stats.total}
                          </p>
                        </div>
                        <ShoppingBag
                          className="h-8 w-8"
                          style={{ color: '#002a01' }}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">
                            Active Orders
                          </p>
                          <p
                            className="text-xl font-bold"
                            style={{ color: '#002a01' }}
                          >
                            {stats.active}
                          </p>
                        </div>
                        <Truck
                          className="h-8 w-8"
                          style={{ color: '#002a01' }}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">
                            Completed
                          </p>
                          <p
                            className="text-xl font-bold"
                            style={{ color: '#002a01' }}
                          >
                            {stats.completed}
                          </p>
                        </div>
                        <CheckCircle
                          className="h-8 w-8"
                          style={{ color: '#002a01' }}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">
                            Total Spent
                          </p>
                          <p
                            className="text-xl font-bold"
                            style={{ color: '#002a01' }}
                          >
                            ₹{stats.totalSpent.toFixed(0)}
                          </p>
                        </div>
                        <TrendingUp
                          className="h-8 w-8"
                          style={{ color: '#002a01' }}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              );
            })()}

            {/* Search and Filter */}
            <div className="mb-4 flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                <Input
                  placeholder="Search by order number or restaurant name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border-[#d1f86a]/40 pl-10 focus-visible:ring-1 focus-visible:ring-[#d1f86a]"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-md border border-[#d1f86a]/50 bg-white px-3 py-2 focus:ring-1 focus:ring-[#d1f86a] focus:outline-none"
              >
                <option value="ALL">All Status</option>
                <option value="PLACED">Placed</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="PREPARING">Preparing</option>
                <option value="READY_FOR_PICKUP">Ready for Pickup</option>
                <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
                <option value="DELIVERED">Delivered</option>
              </select>
            </div>

            {/* Tabbed Orders */}
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger
                  value="all"
                  className="data-[state=active]:bg-[#d1f86a] data-[state=active]:text-[#002a01]"
                >
                  All Orders ({orders.length})
                </TabsTrigger>
                <TabsTrigger
                  value="active"
                  className="data-[state=active]:bg-[#d1f86a] data-[state=active]:text-[#002a01]"
                >
                  Active ({orders.filter((o) => isActiveOrder(o.status)).length}
                  )
                </TabsTrigger>
                <TabsTrigger
                  value="completed"
                  className="data-[state=active]:bg-[#d1f86a] data-[state=active]:text-[#002a01]"
                >
                  Completed (
                  {orders.filter((o) => o.status === 'DELIVERED').length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="mt-4">
                <OrdersList orders={getFilteredOrdersByTab('all')} />
              </TabsContent>

              <TabsContent value="active" className="mt-4">
                <OrdersList orders={getFilteredOrdersByTab('active')} />
              </TabsContent>

              <TabsContent value="completed" className="mt-4">
                <OrdersList orders={getFilteredOrdersByTab('completed')} />
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </CustomerLayout>
  );
}
