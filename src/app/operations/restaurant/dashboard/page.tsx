'use client';

import { useState, useEffect } from 'react';
import OperationsLayout from '@/components/layouts/operations-layout';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  AlertCircle,
} from 'lucide-react';

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
  const [deliveryPartners, setDeliveryPartners] = useState<DeliveryPartner[]>(
    []
  );
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
        fetch('/api/operations/delivery-partners'),
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
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <div className="h-4 w-3/4 rounded bg-gray-200"></div>
                    <div className="h-8 w-1/2 rounded bg-gray-200"></div>
                    <div className="h-3 w-2/3 rounded bg-gray-200"></div>
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
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-3xl font-bold text-[#002a01]">
              Restaurant Operations
            </h1>
            <p className="mt-1 text-[#002a01]/70">
              Monitor restaurant performance and manage operations
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <Button
              onClick={loadDashboardData}
              className="bg-[#d1f86a] font-semibold text-[#002a01] hover:bg-[#d1f86a]/90"
              disabled={isLoading}
            >
              <RefreshCw
                className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`}
              />
              Refresh Data
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-0 shadow-lg transition-all duration-300 hover:shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-semibold tracking-wide text-[#002a01]/60 uppercase">
                    Total Restaurants
                  </p>
                  <p className="text-3xl font-bold text-[#002a01]">
                    {stats?.totalRestaurants}
                  </p>
                  <div className="flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
                    <div className="mr-1.5 h-1.5 w-1.5 rounded-full bg-green-500"></div>
                    {stats?.activeRestaurants} active
                  </div>
                </div>
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#d1f86a] shadow-lg">
                  <Store className="h-8 w-8 text-[#002a01]" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg transition-all duration-300 hover:shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-semibold tracking-wide text-[#002a01]/60 uppercase">
                    Today's Orders
                  </p>
                  <p className="text-3xl font-bold text-[#002a01]">
                    {stats?.todayOrders}
                  </p>
                  <div className="flex items-center rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700">
                    <TrendingUp className="mr-1 h-3 w-3" />
                    +12% from yesterday
                  </div>
                </div>
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#ffd500] shadow-lg">
                  <ShoppingCart className="h-8 w-8 text-[#002a01]" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg transition-all duration-300 hover:shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-semibold tracking-wide text-[#002a01]/60 uppercase">
                    Revenue Today
                  </p>
                  <p className="text-3xl font-bold text-[#002a01]">
                    ₹{stats?.todayRevenue?.toLocaleString()}
                  </p>
                  <div className="flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
                    <TrendingUp className="mr-1 h-3 w-3" />
                    +8.5% from yesterday
                  </div>
                </div>
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#d1f86a] shadow-lg">
                  <DollarSign className="h-8 w-8 text-[#002a01]" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg transition-all duration-300 hover:shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-semibold tracking-wide text-[#002a01]/60 uppercase">
                    Assigned Partners
                  </p>
                  <p className="text-3xl font-bold text-[#002a01]">
                    {stats?.assignedPartners}
                  </p>
                  <div className="flex items-center rounded-full bg-purple-100 px-2 py-1 text-xs font-medium text-purple-700">
                    <Users className="mr-1 h-3 w-3" />
                    Active delivery team
                  </div>
                </div>
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#ffd500] shadow-lg">
                  <Users className="h-8 w-8 text-[#002a01]" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
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
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#ffd500]">
                  <ShoppingCart className="h-5 w-5 text-[#002a01]" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {liveOrders.map((order) => (
                <div
                  key={order.id}
                  className="rounded-xl border border-slate-200 bg-gradient-to-r from-slate-50 to-white p-4 transition-all hover:shadow-md"
                >
                  <div className="mb-3 flex items-start justify-between">
                    <div>
                      <div className="mb-1 flex items-center space-x-2">
                        <h4 className="font-semibold text-[#002a01]">
                          {order.orderNumber}
                        </h4>
                        <Badge
                          className={`px-2 py-1 text-xs ${getStatusBadgeColor(order.status)}`}
                        >
                          {order.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">
                        Customer: {order.customerName}
                      </p>
                      <p className="text-sm text-gray-600">{order.createdAt}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-[#002a01]">₹{order.total}</p>
                      <div className="mt-1 flex items-center text-xs text-orange-600">
                        <Clock className="mr-1 h-3 w-3" />
                        {order.estimatedTime} min
                      </div>
                    </div>
                  </div>

                  <div className="mb-3">
                    <p className="text-sm font-medium text-gray-700">Items:</p>
                    <p className="text-sm text-gray-600">
                      {order.items.join(', ')}
                    </p>
                  </div>

                  {order.deliveryPartner && (
                    <div className="flex items-center justify-between rounded-lg bg-blue-50 p-2">
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-900">
                          {order.deliveryPartner.name}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4 text-blue-600" />
                        <span className="text-sm text-blue-800">
                          {order.deliveryPartner.phone}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              <Button variant="outline" className="mt-4 w-full">
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
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#d1f86a]">
                  <Users className="h-5 w-5 text-[#002a01]" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {deliveryPartners.map((partner) => (
                <div
                  key={partner.id}
                  className="rounded-xl border border-slate-200 bg-gradient-to-r from-slate-50 to-white p-4 transition-all hover:shadow-md"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#d1f86a]">
                        <Users className="h-5 w-5 text-[#002a01]" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-[#002a01]">
                          {partner.user?.name || 'Partner'}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {partner.user?.phone}
                        </p>
                      </div>
                    </div>
                    <Badge
                      className={`px-2 py-1 text-xs ${getPartnerStatusColor(partner.status)}`}
                    >
                      {partner.status}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <p className="text-xs text-gray-500">Rating</p>
                      <div className="flex items-center justify-center">
                        <Star className="mr-1 h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-semibold">
                          {partner.rating}
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Active Orders</p>
                      <p className="text-sm font-semibold text-[#002a01]">
                        {partner.currentOrders || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Today</p>
                      <p className="text-sm font-semibold text-[#002a01]">
                        {partner.completedDeliveries}
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              <Button variant="outline" className="mt-4 w-full">
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
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Button className="group h-20 bg-[#d1f86a] font-semibold text-[#002a01] shadow-lg transition-all duration-200 hover:bg-[#d1f86a]/90 hover:shadow-xl">
                <div className="space-y-2 text-center">
                  <Store className="mx-auto h-6 w-6 transition-transform duration-200 group-hover:scale-110" />
                  <span className="text-sm">Manage Restaurants</span>
                </div>
              </Button>

              <Button className="group h-20 bg-[#ffd500] font-semibold text-[#002a01] shadow-lg transition-all duration-200 hover:bg-[#ffd500]/90 hover:shadow-xl">
                <div className="space-y-2 text-center">
                  <ShoppingCart className="mx-auto h-6 w-6 transition-transform duration-200 group-hover:scale-110" />
                  <span className="text-sm">Add Menu Items</span>
                </div>
              </Button>

              <Button className="group h-20 bg-[#d1f86a] font-semibold text-[#002a01] shadow-lg transition-all duration-200 hover:bg-[#d1f86a]/90 hover:shadow-xl">
                <div className="space-y-2 text-center">
                  <Users className="mx-auto h-6 w-6 transition-transform duration-200 group-hover:scale-110" />
                  <span className="text-sm">Assign Partners</span>
                </div>
              </Button>

              <Button className="group h-20 bg-[#ffd500] font-semibold text-[#002a01] shadow-lg transition-all duration-200 hover:bg-[#ffd500]/90 hover:shadow-xl">
                <div className="space-y-2 text-center">
                  <TrendingUp className="mx-auto h-6 w-6 transition-transform duration-200 group-hover:scale-110" />
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
