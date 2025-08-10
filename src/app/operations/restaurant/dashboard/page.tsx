"use client";

import { useState, useEffect } from "react";
import OperationsLayout from "@/components/layouts/operations-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Store, 
  ShoppingCart, 
  Users, 
  Clock,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Eye,
  RefreshCw,
  Star,
  MapPin,
  Phone,
  MessageCircle,
  CheckCircle,
  XCircle,
  AlertCircle
} from "lucide-react";

interface RestaurantStats {
  totalRestaurants: number;
  activeRestaurants: number;
  todayOrders: number;
  todayRevenue: number;
  averageRating: number;
  assignedPartners: number;
}

interface LiveOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  items: string[];
  total: number;
  status: string;
  createdAt: string;
  estimatedTime: number;
  deliveryPartner?: {
    name: string;
    phone: string;
  };
}

interface DeliveryPartner {
  id: string;
  user: {
    name: string;
    phone: string;
  };
  status: string;
  currentOrders: number;
  rating: number;
  completedDeliveries: number;
}

export default function RestaurantDashboard() {
  const [stats, setStats] = useState<RestaurantStats | null>(null);
  const [liveOrders, setLiveOrders] = useState<LiveOrder[]>([]);
  const [deliveryPartners, setDeliveryPartners] = useState<DeliveryPartner[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
    // Set up real-time updates
    const interval = setInterval(loadDashboardData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Load multiple data sources
      const [statsRes, ordersRes, partnersRes] = await Promise.all([
        fetch('/api/operations/restaurant/stats'),
        fetch('/api/operations/restaurant/live-orders'),
        fetch('/api/operations/delivery-partners')
      ]);

const statsData = await statsRes.json();
      if (statsData.success) {
        setStats(statsData.data);
      }

      const ordersData = await ordersRes.json();
      if (ordersData.success) {
        setLiveOrders(ordersData.data);
      }

      const partnersData = await partnersRes.json();
      if (partnersData.success) {
        setDeliveryPartners(partnersData.data.slice(0, 6)); // Show top 6 partners
      }

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'PREPARING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'READY_FOR_PICKUP':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'OUT_FOR_DELIVERY':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'DELIVERED':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPartnerStatusColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return 'bg-green-100 text-green-800';
      case 'BUSY':
        return 'bg-yellow-100 text-yellow-800';
      case 'OFFLINE':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading && !stats) {
    return (
      <OperationsLayout type="restaurant">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </OperationsLayout>
    );
  }

  return (
    <OperationsLayout type="restaurant">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#002a01]">
              Restaurant Operations
            </h1>
            <p className="text-[#002a01]/70 mt-1">
              Monitor restaurant performance and manage operations
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button 
              onClick={loadDashboardData}
              className="bg-[#d1f86a] hover:bg-[#d1f86a]/90 text-[#002a01] font-semibold"
              disabled={isLoading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh Data
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-[#002a01]/60 uppercase tracking-wide">Total Restaurants</p>
                  <p className="text-3xl font-bold text-[#002a01]">{stats?.totalRestaurants}</p>
                  <div className="flex items-center text-xs font-medium text-green-700 bg-green-100 px-2 py-1 rounded-full">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5"></div>
                    {stats?.activeRestaurants} active
                  </div>
                </div>
                <div className="w-16 h-16 bg-[#d1f86a] rounded-2xl shadow-lg flex items-center justify-center">
                  <Store className="w-8 h-8 text-[#002a01]" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-[#002a01]/60 uppercase tracking-wide">Today's Orders</p>
                  <p className="text-3xl font-bold text-[#002a01]">{stats?.todayOrders}</p>
                  <div className="flex items-center text-xs font-medium text-blue-700 bg-blue-100 px-2 py-1 rounded-full">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +12% from yesterday
                  </div>
                </div>
                <div className="w-16 h-16 bg-[#ffd500] rounded-2xl shadow-lg flex items-center justify-center">
                  <ShoppingCart className="w-8 h-8 text-[#002a01]" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-[#002a01]/60 uppercase tracking-wide">Revenue Today</p>
                  <p className="text-3xl font-bold text-[#002a01]">₹{stats?.todayRevenue?.toLocaleString()}</p>
                  <div className="flex items-center text-xs font-medium text-green-700 bg-green-100 px-2 py-1 rounded-full">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +8.5% from yesterday
                  </div>
                </div>
                <div className="w-16 h-16 bg-[#d1f86a] rounded-2xl shadow-lg flex items-center justify-center">
                  <DollarSign className="w-8 h-8 text-[#002a01]" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-[#002a01]/60 uppercase tracking-wide">Assigned Partners</p>
                  <p className="text-3xl font-bold text-[#002a01]">{stats?.assignedPartners}</p>
                  <div className="flex items-center text-xs font-medium text-purple-700 bg-purple-100 px-2 py-1 rounded-full">
                    <Users className="w-3 h-3 mr-1" />
                    Active delivery team
                  </div>
                </div>
                <div className="w-16 h-16 bg-[#ffd500] rounded-2xl shadow-lg flex items-center justify-center">
                  <Users className="w-8 h-8 text-[#002a01]" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Live Orders */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-bold text-[#002a01]">
                    Live Orders
                  </CardTitle>
                  <CardDescription className="text-[#002a01]/60">
                    Orders currently being processed
                  </CardDescription>
                </div>
                <div className="w-10 h-10 bg-[#ffd500] rounded-xl flex items-center justify-center">
                  <ShoppingCart className="w-5 h-5 text-[#002a01]" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {liveOrders.map((order) => (
                <div key={order.id} className="p-4 bg-gradient-to-r from-slate-50 to-white rounded-xl border border-slate-200 hover:shadow-md transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-semibold text-[#002a01]">{order.orderNumber}</h4>
                        <Badge className={`px-2 py-1 text-xs ${getStatusBadgeColor(order.status)}`}>
                          {order.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">Customer: {order.customerName}</p>
                      <p className="text-sm text-gray-600">{order.createdAt}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-[#002a01]">₹{order.total}</p>
                      <div className="flex items-center text-xs text-orange-600 mt-1">
                        <Clock className="w-3 h-3 mr-1" />
                        {order.estimatedTime} min
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <p className="text-sm font-medium text-gray-700">Items:</p>
                    <p className="text-sm text-gray-600">{order.items.join(', ')}</p>
                  </div>

                  {order.deliveryPartner && (
                    <div className="flex items-center justify-between p-2 bg-blue-50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-900">{order.deliveryPartner.name}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4 text-blue-600" />
                        <span className="text-sm text-blue-800">{order.deliveryPartner.phone}</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              
              <Button variant="outline" className="w-full mt-4">
                View All Orders
              </Button>
            </CardContent>
          </Card>

          {/* Delivery Partners Status */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-bold text-[#002a01]">
                    Delivery Partners
                  </CardTitle>
                  <CardDescription className="text-[#002a01]/60">
                    Current partner availability and status
                  </CardDescription>
                </div>
                <div className="w-10 h-10 bg-[#d1f86a] rounded-xl flex items-center justify-center">
                  <Users className="w-5 h-5 text-[#002a01]" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {deliveryPartners.map((partner) => (
                <div key={partner.id} className="p-4 bg-gradient-to-r from-slate-50 to-white rounded-xl border border-slate-200 hover:shadow-md transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-[#d1f86a] rounded-xl flex items-center justify-center">
                        <Users className="w-5 h-5 text-[#002a01]" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-[#002a01]">{partner.user?.name || 'Partner'}</h4>
                        <p className="text-sm text-gray-600">{partner.user?.phone}</p>
                      </div>
                    </div>
                    <Badge className={`px-2 py-1 text-xs ${getPartnerStatusColor(partner.status)}`}>
                      {partner.status}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <p className="text-xs text-gray-500">Rating</p>
                      <div className="flex items-center justify-center">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400 mr-1" />
                        <span className="text-sm font-semibold">{partner.rating}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Active Orders</p>
                      <p className="text-sm font-semibold text-[#002a01]">{partner.currentOrders || 0}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Today</p>
                      <p className="text-sm font-semibold text-[#002a01]">{partner.completedDeliveries}</p>
                    </div>
                  </div>
                </div>
              ))}
              
              <Button variant="outline" className="w-full mt-4">
                Manage All Partners
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-[#002a01]">
              Quick Actions
            </CardTitle>
            <CardDescription className="text-[#002a01]/60">
              Common restaurant management tasks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button className="h-20 bg-[#d1f86a] hover:bg-[#d1f86a]/90 text-[#002a01] font-semibold shadow-lg hover:shadow-xl transition-all duration-200 group">
                <div className="text-center space-y-2">
                  <Store className="w-6 h-6 mx-auto group-hover:scale-110 transition-transform duration-200" />
                  <span className="text-sm">Manage Restaurants</span>
                </div>
              </Button>

              <Button className="h-20 bg-[#ffd500] hover:bg-[#ffd500]/90 text-[#002a01] font-semibold shadow-lg hover:shadow-xl transition-all duration-200 group">
                <div className="text-center space-y-2">
                  <ShoppingCart className="w-6 h-6 mx-auto group-hover:scale-110 transition-transform duration-200" />
                  <span className="text-sm">Add Menu Items</span>
                </div>
              </Button>

              <Button className="h-20 bg-[#d1f86a] hover:bg-[#d1f86a]/90 text-[#002a01] font-semibold shadow-lg hover:shadow-xl transition-all duration-200 group">
                <div className="text-center space-y-2">
                  <Users className="w-6 h-6 mx-auto group-hover:scale-110 transition-transform duration-200" />
                  <span className="text-sm">Assign Partners</span>
                </div>
              </Button>

              <Button className="h-20 bg-[#ffd500] hover:bg-[#ffd500]/90 text-[#002a01] font-semibold shadow-lg hover:shadow-xl transition-all duration-200 group">
                <div className="text-center space-y-2">
                  <TrendingUp className="w-6 h-6 mx-auto group-hover:scale-110 transition-transform duration-200" />
                  <span className="text-sm">View Analytics</span>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </OperationsLayout>
  );
}
