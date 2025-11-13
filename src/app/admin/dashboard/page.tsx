'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
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
  Users,
  Truck,
  ShoppingCart,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Clock,
  Star,
  MapPin,
  Eye,
  RefreshCw,
  BarChart3,
  Activity,
  Calendar,
  LogOut,
  Settings,
  Menu,
  X,
} from 'lucide-react';

interface DashboardStats {
  restaurants: {
    total: number;
    active: number;
  };
  customers: {
    total: number;
    growth: string;
    thisMonth: number;
  };
  orders: {
    total: number;
    today: number;
    growth: string;
  };
  deliveryPartners: {
    total: number;
    active: number;
  };
  revenue: {
    total: number;
    today: number;
    yesterday: number;
    average: number;
    growth: string;
  };
  topRestaurants: Array<{
    id: string;
    name: string;
    orders: number;
    revenue: number;
    rating: number;
    menuItems?: number;
    deliveryPartners?: number;
    lastWeekEarnings?: number;
    aastaEarnings?: number;
    gmv?: number;
    restaurantEarnings?: number;
  }>;
  topDeliveryPartners?: Array<{
    id: string;
    name: string;
    todayEarnings: number;
    totalEarnings: number;
    rating: number;
    orders?: number;
    cancelledOrders?: number;
    assignedRestaurants?: number;
    lastWeekEarnings?: number;
  }>;
  recentOrders: Array<{
    id: string;
    restaurant: string;
    customer: string;
    total: number;
    status: string;
    createdAt: string;
  }>;
  lastUpdated: string;
  // Dynamic operational data
  activeOrdersCount: number;
  openRestaurantsCount: number;
  platformHealth: {
    uptime: string;
    responseTime: string;
    errorRate: string;
  };
  customerSatisfaction: {
    star5: string;
    star4: string;
    below3Stars: string;
  };
  deliveryPerformance: {
    averageTime: string;
    onTimePercentage: string;
    fastDeliveryPercentage: string;
    averageDistance: string;
  };
}

// Admin Layout Component
const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {isSidebarOpen && (
        <div
          className="bg-opacity-50 fixed inset-0 z-40 bg-black lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-[#002a01] ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } transition-transform duration-200 ease-in-out lg:translate-x-0`}
      >
        {/* Sidebar Header */}
        <div className="flex h-16 items-center justify-between border-b border-[#002a01]/20 px-6">
          <div className="flex items-center space-x-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#d1f86a]">
              <Store className="h-5 w-5 text-[#002a01]" />
            </div>
            <h2 className="text-xl font-bold text-[#d1f86a]">Aasta</h2>
          </div>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="rounded-md p-2 text-[#d1f86a] hover:bg-[#002a01]/50 lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="mt-8 px-4">
          <div className="space-y-2">
            <a
              href="#"
              className="flex items-center rounded-lg border border-[#d1f86a]/20 bg-[#d1f86a]/10 px-4 py-3 text-sm font-medium text-[#d1f86a]"
            >
              <Activity className="mr-3 h-5 w-5" />
              Dashboard
            </a>
            <Link
              href="/admin/customers"
              className="flex items-center rounded-lg px-4 py-3 text-sm font-medium text-[#fcfefe]/80 transition-colors hover:bg-[#fcfefe]/5 hover:text-[#d1f86a]"
            >
              <Users className="mr-3 h-5 w-5" />
              Customers
            </Link>
            <a
              href="#"
              className="flex items-center rounded-lg px-4 py-3 text-sm font-medium text-[#fcfefe]/80 transition-colors hover:bg-[#fcfefe]/5 hover:text-[#d1f86a]"
            >
              <ShoppingCart className="mr-3 h-5 w-5" />
              Orders
            </a>
            <a
              href="/admin/locations"
              className="flex items-center rounded-lg px-4 py-3 text-sm font-medium text-[#fcfefe]/80 transition-colors hover:bg-[#fcfefe]/5 hover:text-[#d1f86a]"
            >
              <MapPin className="mr-3 h-5 w-5" />
              Locations
            </a>
            <a
              href="#"
              className="flex items-center rounded-lg px-4 py-3 text-sm font-medium text-[#fcfefe]/80 transition-colors hover:bg-[#fcfefe]/5 hover:text-[#d1f86a]"
            >
              <BarChart3 className="mr-3 h-5 w-5" />
              Analytics
            </a>
          </div>
        </nav>

        {/* Bottom Section */}
        <div className="absolute right-4 bottom-4 left-4 space-y-2">
          <button className="flex w-full items-center rounded-lg px-4 py-3 text-sm font-medium text-[#fcfefe]/80 transition-colors hover:bg-[#fcfefe]/5 hover:text-[#d1f86a]">
            <Settings className="mr-3 h-5 w-5" />
            Settings
          </button>
          <button className="flex w-full items-center rounded-lg px-4 py-3 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/10">
            <LogOut className="mr-3 h-5 w-5" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Mobile Header */}
        <div className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 shadow-sm lg:hidden">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="rounded-md p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900"
          >
            <Menu className="h-6 w-6" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900">
            Admin Dashboard
          </h1>
          <div className="w-10"></div>
        </div>

        {/* Page Content */}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const handleLogout = () => {
    // adminSession.clear();
    // router.push("/admin/login");
    console.log('Logout clicked');
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        const res = await fetch('/api/admin/analytics');
        const data = await res.json();
        if (data.success) {
          setStats(data.data);
        } else {
          console.error('Failed to fetch analytics data:', data.error);
          setStats(null);
        }
      } catch (error) {
        console.error('Error loading dashboard stats:', error);
        setStats(null);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const loadDashboardStats = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/admin/analytics');
      const data = await res.json();
      if (data.success) {
        setStats(data.data);
        setLastUpdated(new Date());
      } else {
        console.error('Failed to fetch analytics data:', data.error);
        setStats(null);
      }
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
      setStats(null);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
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
      </AdminLayout>
    );
  }

  if (!stats) {
    return (
      <AdminLayout>
        <div className="flex min-h-[50vh] items-center justify-center">
          <Card className="w-full max-w-md">
            <CardContent className="space-y-4 p-8 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                <Activity className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Failed to load dashboard data
              </h3>
              <p className="text-gray-600">
                Please try refreshing the page or contact support if the issue
                persists.
              </p>
              <Button
                onClick={loadDashboardStats}
                className="bg-[#002a01] text-white hover:bg-[#002a01]/90"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Retry
              </Button>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-3xl font-bold text-[#002a01]">
              Dashboard Overview
            </h1>
            <p className="mt-1 text-[#002a01]/70">
              Monitor your platform&apos;s performance and growth
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <Button
              onClick={loadDashboardStats}
              className="bg-[#d1f86a] font-semibold text-[#002a01] hover:bg-[#d1f86a]/90"
              disabled={isLoading}
            >
              <RefreshCw
                className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`}
              />
              Refresh Data
            </Button>

            <Button
              onClick={handleLogout}
              variant="outline"
              className="border-red-200 font-semibold text-red-700 hover:border-red-300 hover:bg-red-50"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>

        {/* Enhanced Key Metrics */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {/* Total Restaurants */}
          <Card className="group relative overflow-hidden border-0 bg-white/70 shadow-lg backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
            <div className="absolute inset-0 bg-gradient-to-br from-[#d1f86a]/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
            <CardContent className="relative z-10 p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-3">
                  <p className="text-sm font-semibold tracking-wide text-[#002a01]/60 uppercase">
                    Total Restaurants
                  </p>
                  <p className="text-4xl font-bold text-[#002a01]">
                    {stats.restaurants.total}
                  </p>
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center rounded-full border border-green-200 bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700">
                      <div className="mr-1.5 h-1.5 w-1.5 rounded-full bg-green-500"></div>
                      {stats.restaurants.active} active
                    </div>
                  </div>
                </div>
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#d1f86a] shadow-lg transition-transform duration-300 group-hover:scale-110">
                  <Store className="h-8 w-8 text-[#002a01]" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Total Customers */}
          <Card className="group relative overflow-hidden border-0 bg-white/70 shadow-lg backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
            <div className="absolute inset-0 bg-gradient-to-br from-[#ffd500]/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
            <CardContent className="relative z-10 p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-3">
                  <p className="text-sm font-semibold tracking-wide text-[#002a01]/60 uppercase">
                    Total Customers
                  </p>
                  <p className="text-4xl font-bold text-[#002a01]">
                    {stats.customers.total.toLocaleString()}
                  </p>
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center rounded-full border border-blue-200 bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-700">
                      <TrendingUp className="mr-1 h-3 w-3" />+
                      {stats.customers.growth}% this month
                    </div>
                  </div>
                </div>
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#ffd500] shadow-lg transition-transform duration-300 group-hover:scale-110">
                  <Users className="h-8 w-8 text-[#002a01]" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Delivery Partners */}
          <Card className="group relative overflow-hidden border-0 bg-white/70 shadow-lg backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
            <div className="absolute inset-0 bg-gradient-to-br from-[#d1f86a]/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
            <CardContent className="relative z-10 p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-3">
                  <p className="text-sm font-semibold tracking-wide text-[#002a01]/60 uppercase">
                    Delivery Partners
                  </p>
                  <p className="text-4xl font-bold text-[#002a01]">
                    {stats.deliveryPartners.total}
                  </p>
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center rounded-full border border-green-200 bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700">
                      <div className="mr-1.5 h-1.5 w-1.5 animate-pulse rounded-full bg-green-500"></div>
                      {stats.deliveryPartners.active} online
                    </div>
                  </div>
                </div>
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#d1f86a] shadow-lg transition-transform duration-300 group-hover:scale-110">
                  <Truck className="h-8 w-8 text-[#002a01]" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Total Orders */}
          <Card className="group relative overflow-hidden border-0 bg-white/70 shadow-lg backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
            <div className="absolute inset-0 bg-gradient-to-br from-[#ffd500]/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
            <CardContent className="relative z-10 p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-3">
                  <p className="text-sm font-semibold tracking-wide text-[#002a01]/60 uppercase">
                    Total Orders
                  </p>
                  <p className="text-4xl font-bold text-[#002a01]">
                    {stats.orders.total.toLocaleString()}
                  </p>
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center rounded-full border border-orange-200 bg-orange-100 px-2.5 py-1 text-xs font-medium text-orange-700">
                      <Clock className="mr-1 h-3 w-3" />
                      {stats.orders.today} today
                    </div>
                  </div>
                </div>
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#ffd500] shadow-lg transition-transform duration-300 group-hover:scale-110">
                  <ShoppingCart className="h-8 w-8 text-[#002a01]" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Revenue Metrics */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <Card className="border-0 bg-white/70 shadow-lg backdrop-blur-sm transition-all duration-300 hover:shadow-xl">
            <CardContent className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-semibold tracking-wide text-[#002a01]/60 uppercase">
                    Total Revenue
                  </p>
                  <p className="text-3xl font-bold text-[#002a01]">
                    ₹{stats.revenue.total.toLocaleString()}
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <div className="flex items-center text-sm font-medium text-green-600">
                <TrendingUp className="mr-2 h-4 w-4" />
                +15.3% from last month
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white/70 shadow-lg backdrop-blur-sm transition-all duration-300 hover:shadow-xl">
            <CardContent className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-semibold tracking-wide text-[#002a01]/60 uppercase">
                    Today&apos;s Revenue
                  </p>
                  <p className="text-3xl font-bold text-[#002a01]">
                    ₹{stats.revenue.today.toLocaleString()}
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-100">
                  <DollarSign className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
              <div className="flex items-center text-sm font-medium text-green-600">
                <TrendingUp className="mr-2 h-4 w-4" />+{stats.revenue.growth}%
                from yesterday
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white/70 shadow-lg backdrop-blur-sm transition-all duration-300 hover:shadow-xl">
            <CardContent className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-semibold tracking-wide text-[#002a01]/60 uppercase">
                    Avg Order Value
                  </p>
                  <p className="text-3xl font-bold text-[#002a01]">
                    ₹{stats.revenue.average}
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
                  <ShoppingCart className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="flex items-center text-sm font-medium text-red-600">
                <TrendingDown className="mr-2 h-4 w-4" />
                -2.1% from last week
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Bottom Section */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Top Restaurants */}
          <Card className="border-0 bg-white/70 shadow-lg backdrop-blur-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-xl font-bold text-[#002a01]">
                    Top Performing Delivery Partners
                  </CardTitle>
                  <CardDescription className="text-[#002a01]/60">
                    Based on total earnings
                  </CardDescription>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#d1f86a]">
                  <Star className="h-5 w-5 text-[#002a01]" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {stats.topDeliveryPartners?.map((partner, index) => (
                <div
                  key={partner.id}
                  className="group rounded-xl border border-slate-200 bg-gradient-to-r from-slate-50 to-white p-4 transition-all duration-200 hover:border-[#d1f86a]/50 hover:shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#d1f86a] transition-transform duration-200 group-hover:scale-110">
                        <span className="text-sm font-bold text-[#002a01]">
                          {index + 1}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold text-[#002a01] transition-colors group-hover:text-[#002a01]/80">
                          {partner.name}
                        </p>
                        <div className="flex items-center space-x-3 text-xs text-[#002a01]/60">
                          <span className="font-medium">
                            {partner.orders} orders
                          </span>
                          <div className="flex items-center">
                            <Star className="mr-1 h-3 w-3 fill-yellow-400 text-yellow-400" />
                            {partner.rating?.toFixed(1) || 'N/A'}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2 text-right">
                      <p className="font-bold text-[#002a01]">
                        ₹{partner.totalEarnings.toLocaleString()}
                      </p>
                      <Link href={`/admin/delivery-partners/${partner.id}`}>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-xs text-[#002a01]/60 transition-colors hover:bg-[#d1f86a]/20 hover:text-[#002a01]"
                        >
                          <Eye className="mr-1 h-3 w-3" />
                          View
                        </Button>
                      </Link>
                      <div className="mt-2 text-xs text-[#002a01]/70">
                        <p>
                          Weekly Earnings: ₹
                          {partner.lastWeekEarnings?.toLocaleString() || 0}
                        </p>
                        <p>
                          Assigned Restaurants:{' '}
                          {partner.assignedRestaurants || 0}
                        </p>
                        <p>Cancelled Orders: {partner.cancelledOrders || 0}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              <Link href="/admin/delivery-partners">
                <Button
                  variant="outline"
                  className="mt-4 w-full border-[#002a01]/20 text-[#002a01] transition-all duration-200 hover:border-[#d1f86a] hover:bg-[#d1f86a]/10"
                >
                  View All Delivery Partners
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Top Restaurants */}
          <Card className="border-0 bg-white/70 shadow-lg backdrop-blur-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-xl font-bold text-[#002a01]">
                    Top Performing Restaurants
                  </CardTitle>
                  <CardDescription className="text-[#002a01]/60">
                    Based on total orders and revenue
                  </CardDescription>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#d1f86a]">
                  <Star className="h-5 w-5 text-[#002a01]" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {stats.topRestaurants?.map((restaurant, index) => (
                <div
                  key={restaurant.id}
                  className="group rounded-xl border border-slate-200 bg-gradient-to-r from-slate-50 to-white p-4 transition-all duration-200 hover:border-[#d1f86a]/50 hover:shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#d1f86a] transition-transform duration-200 group-hover:scale-110">
                        <span className="text-sm font-bold text-[#002a01]">
                          {index + 1}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold text-[#002a01] transition-colors group-hover:text-[#002a01]/80">
                          {restaurant.name}
                        </p>
                        <div className="flex items-center space-x-3 text-xs text-[#002a01]/60">
                          <span className="font-medium">
                            {restaurant.orders} orders
                          </span>
                          <div className="flex items-center">
                            <Star className="mr-1 h-3 w-3 fill-yellow-400 text-yellow-400" />
                            {restaurant.rating?.toFixed(1) || 'N/A'}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2 text-right">
                      <p className="font-bold text-[#002a01]">
                        ₹{restaurant.revenue.toLocaleString()}
                      </p>
                      <Link href={`/admin/restaurants/${restaurant.id}`}>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-xs text-[#002a01]/60 transition-colors hover:bg-[#d1f86a]/20 hover:text-[#002a01]"
                        >
                          <Eye className="mr-1 h-3 w-3" />
                          View
                        </Button>
                      </Link>
                      <div className="mt-2 text-xs text-[#002a01]/70">
                        <p>GMV: ₹{restaurant.gmv?.toLocaleString() || 0}</p>
                        <p>
                          Weekly Payout (Fri): ₹
                          {restaurant.lastWeekEarnings?.toLocaleString() || 0}
                        </p>
                        <p>
                          Aasta Earnings: ₹
                          {restaurant.aastaEarnings?.toLocaleString() || 0}
                        </p>
                        <p>Menu Items: {restaurant.menuItems || 0}</p>
                        <p>
                          Partners Assigned: {restaurant.deliveryPartners || 0}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              <Link href="/admin/restaurants">
                <Button
                  variant="outline"
                  className="mt-4 w-full border-[#002a01]/20 text-[#002a01] transition-all duration-200 hover:border-[#d1f86a] hover:bg-[#d1f86a]/10"
                >
                  View All Restaurants
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Quick Actions */}
        <Card className="border-0 bg-white/70 shadow-lg backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#002a01]">
                <Activity className="h-5 w-5 text-[#d1f86a]" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-[#002a01]">
                  Quick Actions
                </CardTitle>
                <CardDescription className="text-[#002a01]/60">
                  Common administrative tasks
                </CardDescription>
              </div>
            </div>
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
                  <Truck className="mx-auto h-6 w-6 transition-transform duration-200 group-hover:scale-110" />
                  <span className="text-sm">Delivery Partners</span>
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

        {/* Night-Time Branding Section */}
        <div className="relative">
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-[#002a01] via-[#002a01]/95 to-[#002a01]"></div>
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMiIgZmlsbD0iIzAwZmY0MCIgZmlsbC1vcGFjaXR5PSIwLjEiLz4KPC9zdmc+')] opacity-20"></div>

          <Card className="relative border-0 bg-transparent">
            <CardContent className="p-8">
              <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-2">
                <div className="space-y-6">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#d1f86a]">
                        <svg
                          className="h-6 w-6 text-[#002a01]"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 2L3 8v10c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V8l-7-6zM8 18v-6h4v6H8z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <h2 className="text-3xl font-bold text-[#d1f86a]">
                        Night-Time Operations
                      </h2>
                    </div>
                    <p className="text-lg leading-relaxed text-[#fcfefe]/80">
                      Your platform is optimized for late-night food delivery
                      between 9 PM - 12 AM. Monitor peak hours and ensure
                      seamless service for night owl customers.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-xl border border-[#fcfefe]/20 bg-[#fcfefe]/10 p-4 backdrop-blur-sm">
                      <div className="flex items-center space-x-3">
                        <Clock className="h-5 w-5 text-[#d1f86a]" />
                        <div>
                          <p className="text-sm font-medium text-[#fcfefe]/60">
                            Operating Hours
                          </p>
                          <p className="text-lg font-bold text-[#fcfefe]">
                            9 PM - 12 AM
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-xl border border-[#fcfefe]/20 bg-[#fcfefe]/10 p-4 backdrop-blur-sm">
                      <div className="flex items-center space-x-3">
                        <Activity className="h-5 w-5 text-[#ffd500]" />
                        <div>
                          <p className="text-sm font-medium text-[#fcfefe]/60">
                            Peak Time
                          </p>
                          <p className="text-lg font-bold text-[#fcfefe]">
                            10 PM - 11 PM
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-[#d1f86a]/20 to-[#ffd500]/20 blur-2xl"></div>
                  <div className="relative rounded-3xl border border-[#fcfefe]/20 bg-[#fcfefe]/10 p-6 backdrop-blur-sm">
                    <div className="space-y-4 text-center">
                      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-[#ffd500] shadow-2xl">
                        <svg
                          className="h-10 w-10 text-[#002a01]"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="mb-2 text-xl font-bold text-[#fcfefe]">
                          Late Night Cravings
                        </h3>
                        <p className="text-sm text-[#fcfefe]/70">
                          Serving hungry customers when they need it most
                        </p>
                      </div>
                      <div className="flex items-center justify-center space-x-4 text-sm">
                        <div className="flex items-center space-x-2">
                          <div className="h-2 w-2 animate-pulse rounded-full bg-[#d1f86a]"></div>
                          <span className="text-[#fcfefe]/80">
                            {stats.activeOrdersCount} active orders
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="h-2 w-2 animate-pulse rounded-full bg-[#ffd500]"></div>
                          <span className="text-[#fcfefe]/80">
                            {stats.openRestaurantsCount} restaurants open
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Platform Performance Insights */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="border-0 bg-white/70 shadow-lg backdrop-blur-sm transition-all duration-300 hover:shadow-xl">
            <CardContent className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-semibold tracking-wide text-[#002a01]/60 uppercase">
                    Platform Health
                  </p>
                  <div className="flex items-center space-x-2">
                    <div className="h-3 w-3 animate-pulse rounded-full bg-green-500"></div>
                    <p className="text-lg font-bold text-[#002a01]">
                      Excellent
                    </p>
                  </div>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100">
                  <Activity className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <div className="space-y-2 text-sm text-[#002a01]/60">
                <div className="flex justify-between">
                  <span>Uptime</span>
                  <span className="font-semibold">
                    {stats.platformHealth?.uptime || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Response Time</span>
                  <span className="font-semibold">
                    {stats.platformHealth?.responseTime || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Error Rate</span>
                  <span className="font-semibold">
                    {stats.platformHealth?.errorRate || 'N/A'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white/70 shadow-lg backdrop-blur-sm transition-all duration-300 hover:shadow-xl">
            <CardContent className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-semibold tracking-wide text-[#002a01]/60 uppercase">
                    Customer Satisfaction
                  </p>
                  <div className="flex items-center space-x-2">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <p className="text-lg font-bold text-[#002a01]">
                      4.8 / 5.0
                    </p>
                  </div>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-100">
                  <Star className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
              <div className="space-y-2 text-sm text-[#002a01]/60">
                <div className="flex justify-between">
                  <span>5 Star Reviews</span>
                  <span className="font-semibold">
                    {stats.customerSatisfaction?.star5 || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>4 Star Reviews</span>
                  <span className="font-semibold">
                    {stats.customerSatisfaction?.star4 || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Below 3 Stars</span>
                  <span className="font-semibold">
                    {stats.customerSatisfaction?.below3Stars || 'N/A'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white/70 shadow-lg backdrop-blur-sm transition-all duration-300 hover:shadow-xl">
            <CardContent className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-semibold tracking-wide text-[#002a01]/60 uppercase">
                    Delivery Performance
                  </p>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-blue-600" />
                    <p className="text-lg font-bold text-[#002a01]">
                      {stats.deliveryPerformance?.averageTime || 'N/A'}
                    </p>
                  </div>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
                  <Truck className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="space-y-2 text-sm text-[#002a01]/60">
                <div className="flex justify-between">
                  <span>On Time Delivery</span>
                  <span className="font-semibold">
                    {stats.deliveryPerformance?.onTimePercentage || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Fast Delivery (&lt;25min)</span>
                  <span className="font-semibold">
                    {stats.deliveryPerformance?.fastDeliveryPercentage || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Average Distance</span>
                  <span className="font-semibold">
                    {stats.deliveryPerformance?.averageDistance || 'N/A'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer Section */}
        <div className="space-y-4 py-8 text-center">
          <div className="flex items-center justify-center space-x-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#002a01]">
              <svg
                className="h-4 w-4 text-[#d1f86a]"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 2L3 8v10c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V8l-7-6zM8 18v-6h4v6H8z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-[#002a01]">
              Aasta Admin Dashboard
            </h3>
          </div>
          <p className="mx-auto max-w-2xl text-[#002a01]/60">
            Empowering late-night food delivery with real-time insights and
            comprehensive platform management. Built for efficiency, designed
            for growth.
          </p>
          <div className="flex items-center justify-center space-x-6 text-sm text-[#002a01]/50">
            <span>Version 2.1.0</span>
            <span>•</span>
            <span>Last deployed: Today</span>
            <span>•</span>
            <span>Next update: Scheduled</span>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
