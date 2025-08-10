"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, ShoppingBag, Star, RefreshCw, Search, MapPin, Phone, Truck, Package, ChefHat, CheckCircle, Filter, Calendar, TrendingUp } from "lucide-react";
import CustomerLayout from "@/components/layouts/customer-layout";
import { toast } from "sonner";

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
      case "PLACED": return "bg-blue-100 text-blue-800";
      case "CONFIRMED": return "bg-green-100 text-green-800";
      case "PREPARING": return "bg-yellow-100 text-yellow-800";
      case "READY_FOR_PICKUP": return "bg-purple-100 text-purple-800";
      case "OUT_FOR_DELIVERY": return "bg-orange-100 text-orange-800";
      case "DELIVERED": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PLACED": return Clock;
      case "CONFIRMED": return CheckCircle;
      case "PREPARING": return ChefHat;
      case "READY_FOR_PICKUP": return Package;
      case "OUT_FOR_DELIVERY": return Truck;
      case "DELIVERED": return CheckCircle;
      default: return Clock;
    }
  };

  const getOrderProgress = (status: string) => {
    const statusOrder = ['PLACED', 'CONFIRMED', 'PREPARING', 'READY_FOR_PICKUP', 'OUT_FOR_DELIVERY', 'DELIVERED'];
    const currentIndex = statusOrder.indexOf(status);
    return ((currentIndex + 1) / statusOrder.length) * 100;
  };

  const isActiveOrder = (status: string) => {
    return !['DELIVERED', 'CANCELLED'].includes(status);
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  const getCalculatedEstimatedDeliveryTime = (order: Order) => {
    // Calculate: estimatedPrepTime + estimatedDeliveryDuration + 5 minutes
    const totalMinutes = order.estimatedPreparationTime + order.estimatedDeliveryDuration + 5;
    
    // Calculate estimated delivery time from order creation time
    const orderTime = new Date(order.createdAt);
    const estimatedTime = new Date(orderTime.getTime() + totalMinutes * 60000);
    
    return estimatedTime;
  };

  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <ShoppingBag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">No orders found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {orders.map((order) => {
        const StatusIcon = getStatusIcon(order.status);
        const progress = getOrderProgress(order.status);
        const active = isActiveOrder(order.status);
        
        return (
          <Card key={order.id} className={`hover:shadow-lg transition-shadow cursor-pointer ${
            active ? 'border-l-4 border-l-orange-400' : ''
          }`}
                onClick={() => router.push(`/customer/orders/${order.orderNumber}`)}>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    Order #{order.orderNumber}
                    {active && <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full">Live</span>}
                  </CardTitle>
                  <span className="text-sm text-gray-600">
                    {order.restaurant.name} • {getTimeAgo(order.createdAt)}
                  </span>
                </div>
                <Badge className={`${getStatusColor(order.status)} px-3 py-1 flex items-center gap-1`}>
                  <StatusIcon className="w-3 h-3" />
                  {order.status.replace('_', ' ')}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {/* Progress Bar for Active Orders */}
              {active && (
                <div className="mb-4">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Order Progress</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-orange-400 to-orange-600 h-2 rounded-full transition-all duration-300" 
                      style={{width: `${progress}%`}}
                    ></div>
                  </div>
                </div>
              )}
              
              {/* Order Items */}
              <div className="mb-4">
                <span className="text-sm text-gray-600">
                  {order.items.map((item, index) => (
                    <span key={item.id}>{item.quantity}x {item.itemName}</span>
                  )).reduce((acc: any, el, index) => index === 0 ? [el] : [...acc, ', ', el], [])}
                </span>
              </div>
              
              {/* Delivery Address */}
              {active && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span className="font-medium">Delivery to:</span>
                  </div>
                  <p className="text-sm text-gray-700 ml-6">{order.deliveryAddress}</p>
                </div>
              )}
              
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  {(() => {
                    if (order.status === 'DELIVERED' && order.estimatedDeliveryTime) {
                      return (
                        <div className="text-sm text-gray-600 flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {`Delivered ${new Date(order.estimatedDeliveryTime).toLocaleDateString()}`}
                        </div>
                      );
                    } else if (order.estimatedPreparationTime || order.estimatedDeliveryDuration) {
                      const calculatedTime = getCalculatedEstimatedDeliveryTime(order);
                      return (
                        <div className="text-sm text-gray-600 flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {`Est: ${calculatedTime.toLocaleTimeString()}`}
                        </div>
                      );
                    } else if (order.estimatedDeliveryTime) {
                      return (
                        <div className="text-sm text-gray-600 flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {`Est: ${new Date(order.estimatedDeliveryTime).toLocaleTimeString()}`}
                        </div>
                      );
                    }
                    return null;
                  })()}
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-bold text-lg" style={{ color: '#002a01' }}>
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
                      <Star className="w-4 h-4 mr-1" />
                      Rate
                    </Button>
                  )}
                  {active && (
                    <Button 
                      size="sm" 
                      style={{
                        backgroundColor: '#d1f86a',
                        color: '#002a01',
                        border: '1px solid #002a01'
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
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [activeTab, setActiveTab] = useState("all");

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
      const response = await fetch(`/api/orders`);
      const data = await response.json();
      
      if (data.success) {
        // Transform the API response to match our interface
        const transformedOrders = data.data.orders.map((order: any) => ({
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
          deliveryAddress: `${order.deliveryAddress.street}, ${order.deliveryAddress.city}`,
          items: order.orderItems.map((item: any) => ({
            id: item.id,
            menuItemId: item.menuItemId,
            quantity: item.quantity,
            price: item.unitPrice,
            itemName: item.menuItem.name
          })),
          restaurant: {
            id: order.restaurant.id,
            name: order.restaurant.name,
            address: order.restaurant.address
          }
        }));
        setOrders(transformedOrders);
      } else {
        toast.error("Failed to fetch orders");
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      toast.error("Failed to fetch orders");
    } finally {
      setIsLoading(false);
    }
  };

  const filterOrders = () => {
    let filtered = orders;
    
    if (searchTerm) {
      filtered = filtered.filter(order => 
        order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.restaurant.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (statusFilter !== "ALL") {
      filtered = filtered.filter(order => order.status === statusFilter);
    }
    
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    setFilteredOrders(filtered);
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PLACED": return Clock;
      case "CONFIRMED": return CheckCircle;
      case "PREPARING": return ChefHat;
      case "READY_FOR_PICKUP": return Package;
      case "OUT_FOR_DELIVERY": return Truck;
      case "DELIVERED": return CheckCircle;
      default: return Clock;
    }
  };

  const getOrderProgress = (status: string) => {
    const statusOrder = ['PLACED', 'CONFIRMED', 'PREPARING', 'READY_FOR_PICKUP', 'OUT_FOR_DELIVERY', 'DELIVERED'];
    const currentIndex = statusOrder.indexOf(status);
    return ((currentIndex + 1) / statusOrder.length) * 100;
  };

  const isActiveOrder = (status: string) => {
    return !['DELIVERED', 'CANCELLED'].includes(status);
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  // Calculate summary statistics
  const getOrderStats = () => {
    const activeOrders = orders.filter(order => isActiveOrder(order.status));
    const completedOrders = orders.filter(order => order.status === 'DELIVERED');
    const totalSpent = orders.reduce((sum, order) => sum + order.total, 0);
    const favoriteRestaurant = orders.reduce((acc, order) => {
      acc[order.restaurant.name] = (acc[order.restaurant.name] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const topRestaurant = Object.keys(favoriteRestaurant).reduce((a, b) => 
      favoriteRestaurant[a] > favoriteRestaurant[b] ? a : b, '');

    return {
      total: orders.length,
      active: activeOrders.length,
      completed: completedOrders.length,
      totalSpent,
      topRestaurant
    };
  };

  const getFilteredOrdersByTab = (tab: string) => {
    let filtered = orders;
    
    switch (tab) {
      case 'active':
        filtered = orders.filter(order => isActiveOrder(order.status));
        break;
      case 'completed':
        filtered = orders.filter(order => order.status === 'DELIVERED');
        break;
      default:
        filtered = orders;
    }

    if (searchTerm) {
      filtered = filtered.filter(order => 
        order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.restaurant.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (statusFilter !== "ALL") {
      filtered = filtered.filter(order => order.status === statusFilter);
    }
    
    return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  };

  if (isLoading) {
    return (
      <CustomerLayout>
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            {[1, 2, 3].map(i => (
              <div key={i} className="h-48 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </CustomerLayout>
    );
  }

  return (
    <CustomerLayout>
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: '#002a01' }}>Your Orders</h1>
            <p className="text-gray-600 mt-2">Track your current and past orders</p>
          </div>
          <Button 
            onClick={fetchOrders}
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

        {orders.length === 0 ? (
          <Card>
            <CardContent className="text-center py-16">
              <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No orders yet</h3>
              <p className="text-gray-500 mb-6">When you place your first order, you'll see it here</p>
              <Button 
                onClick={() => router.push("/customer/discover")}
                style={{
                  backgroundColor: '#d1f86a',
                  color: '#002a01',
                  border: '1px solid #002a01'
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
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Total Orders</p>
                          <p className="text-2xl font-bold" style={{ color: '#002a01' }}>{stats.total}</p>
                        </div>
                        <ShoppingBag className="w-8 h-8 text-gray-400" />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Active Orders</p>
                          <p className="text-2xl font-bold text-orange-600">{stats.active}</p>
                        </div>
                        <Truck className="w-8 h-8 text-orange-400" />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Completed</p>
                          <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
                        </div>
                        <CheckCircle className="w-8 h-8 text-green-400" />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Total Spent</p>
                          <p className="text-2xl font-bold" style={{ color: '#002a01' }}>₹{stats.totalSpent.toFixed(0)}</p>
                        </div>
                        <TrendingUp className="w-8 h-8 text-gray-400" />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              );
            })()}
            
            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search by order number or restaurant name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md bg-white"
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
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="all">All Orders ({orders.length})</TabsTrigger>
                <TabsTrigger value="active">Active ({orders.filter(o => isActiveOrder(o.status)).length})</TabsTrigger>
                <TabsTrigger value="completed">Completed ({orders.filter(o => o.status === 'DELIVERED').length})</TabsTrigger>
              </TabsList>
              
              <TabsContent value="all" className="mt-6">
                <OrdersList orders={getFilteredOrdersByTab('all')} />
              </TabsContent>
              
              <TabsContent value="active" className="mt-6">
                <OrdersList orders={getFilteredOrdersByTab('active')} />
              </TabsContent>
              
              <TabsContent value="completed" className="mt-6">
                <OrdersList orders={getFilteredOrdersByTab('completed')} />
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </CustomerLayout>
  );
}

