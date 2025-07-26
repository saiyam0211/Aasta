"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  X
} from "lucide-react";

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
}


// Admin Layout Component
const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#002a01] transform ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } transition-transform duration-200 ease-in-out lg:translate-x-0`}>
        {/* Sidebar Header */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-[#002a01]/20">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-[#d1f86a] rounded-lg flex items-center justify-center">
              <Store className="w-5 h-5 text-[#002a01]" />
            </div>
            <h2 className="text-xl font-bold text-[#d1f86a]">Aasta</h2>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden p-2 rounded-md text-[#d1f86a] hover:bg-[#002a01]/50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="mt-8 px-4">
          <div className="space-y-2">
            <a 
              href="#" 
              className="flex items-center px-4 py-3 text-sm font-medium text-[#d1f86a] bg-[#d1f86a]/10 rounded-lg border border-[#d1f86a]/20"
            >
              <Activity className="w-5 h-5 mr-3" />
              Dashboard
            </a>
            <a 
              href="#" 
              className="flex items-center px-4 py-3 text-sm font-medium text-[#fcfefe]/80 hover:text-[#d1f86a] hover:bg-[#fcfefe]/5 rounded-lg transition-colors"
            >
              <Store className="w-5 h-5 mr-3" />
              Restaurants
            </a>
            <a 
              href="#" 
              className="flex items-center px-4 py-3 text-sm font-medium text-[#fcfefe]/80 hover:text-[#d1f86a] hover:bg-[#fcfefe]/5 rounded-lg transition-colors"
            >
              <Users className="w-5 h-5 mr-3" />
              Customers
            </a>
            <a 
              href="#" 
              className="flex items-center px-4 py-3 text-sm font-medium text-[#fcfefe]/80 hover:text-[#d1f86a] hover:bg-[#fcfefe]/5 rounded-lg transition-colors"
            >
              <Truck className="w-5 h-5 mr-3" />
              Delivery Partners
            </a>
            <a 
              href="#" 
              className="flex items-center px-4 py-3 text-sm font-medium text-[#fcfefe]/80 hover:text-[#d1f86a] hover:bg-[#fcfefe]/5 rounded-lg transition-colors"
            >
              <ShoppingCart className="w-5 h-5 mr-3" />
              Orders
            </a>
            <a 
              href="#" 
              className="flex items-center px-4 py-3 text-sm font-medium text-[#fcfefe]/80 hover:text-[#d1f86a] hover:bg-[#fcfefe]/5 rounded-lg transition-colors"
            >
              <BarChart3 className="w-5 h-5 mr-3" />
              Analytics
            </a>
          </div>
        </nav>

        {/* Bottom Section */}
        <div className="absolute bottom-4 left-4 right-4 space-y-2">
          <button className="flex items-center w-full px-4 py-3 text-sm font-medium text-[#fcfefe]/80 hover:text-[#d1f86a] hover:bg-[#fcfefe]/5 rounded-lg transition-colors">
            <Settings className="w-5 h-5 mr-3" />
            Settings
          </button>
          <button className="flex items-center w-full px-4 py-3 text-sm font-medium text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
            <LogOut className="w-5 h-5 mr-3" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Mobile Header */}
        <div className="lg:hidden bg-white shadow-sm border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          >
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900">Admin Dashboard</h1>
          <div className="w-10"></div>
        </div>

        {/* Page Content */}
        <div className="p-6">
          {children}
        </div>
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
      </AdminLayout>
    );
  }

  if (!stats) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <Card className="w-full max-w-md">
            <CardContent className="p-8 text-center space-y-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                <Activity className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Failed to load dashboard data</h3>
              <p className="text-gray-600">Please try refreshing the page or contact support if the issue persists.</p>
              <Button 
                onClick={loadDashboardStats} 
                className="bg-[#002a01] hover:bg-[#002a01]/90 text-white"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
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
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#002a01]">
              Dashboard Overview
            </h1>
            <p className="text-[#002a01]/70 mt-1">
              Monitor your platform's performance and growth
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button 
              onClick={loadDashboardStats}
              className="bg-[#d1f86a] hover:bg-[#d1f86a]/90 text-[#002a01] font-semibold"
              disabled={isLoading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh Data
            </Button>
            
            <Button 
              onClick={handleLogout}
              variant="outline"
              className="border-red-200 text-red-700 hover:bg-red-50 hover:border-red-300 font-semibold"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {/* Enhanced Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Restaurants */}
          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 relative overflow-hidden group bg-white/70 backdrop-blur-sm">
            <div className="absolute inset-0 bg-gradient-to-br from-[#d1f86a]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <CardContent className="p-6 relative z-10">
              <div className="flex items-center justify-between">
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-[#002a01]/60 uppercase tracking-wide">Total Restaurants</p>
                  <p className="text-4xl font-bold text-[#002a01]">{stats.restaurants.total}</p>
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center text-xs font-medium text-green-700 bg-green-100 px-2.5 py-1 rounded-full border border-green-200">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5"></div>
                      {stats.restaurants.active} active
                    </div>
                  </div>
                </div>
                <div className="w-16 h-16 bg-[#d1f86a] rounded-2xl shadow-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Store className="w-8 h-8 text-[#002a01]" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Total Customers */}
          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 relative overflow-hidden group bg-white/70 backdrop-blur-sm">
            <div className="absolute inset-0 bg-gradient-to-br from-[#ffd500]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <CardContent className="p-6 relative z-10">
              <div className="flex items-center justify-between">
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-[#002a01]/60 uppercase tracking-wide">Total Customers</p>
                  <p className="text-4xl font-bold text-[#002a01]">{stats.customers.total.toLocaleString()}</p>
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center text-xs font-medium text-blue-700 bg-blue-100 px-2.5 py-1 rounded-full border border-blue-200">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      +{stats.customers.growth}% this month
                    </div>
                  </div>
                </div>
                <div className="w-16 h-16 bg-[#ffd500] rounded-2xl shadow-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Users className="w-8 h-8 text-[#002a01]" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Delivery Partners */}
          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 relative overflow-hidden group bg-white/70 backdrop-blur-sm">
            <div className="absolute inset-0 bg-gradient-to-br from-[#d1f86a]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <CardContent className="p-6 relative z-10">
              <div className="flex items-center justify-between">
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-[#002a01]/60 uppercase tracking-wide">Delivery Partners</p>
                  <p className="text-4xl font-bold text-[#002a01]">{stats.deliveryPartners.total}</p>
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center text-xs font-medium text-green-700 bg-green-100 px-2.5 py-1 rounded-full border border-green-200">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5 animate-pulse"></div>
                      {stats.deliveryPartners.active} online
                    </div>
                  </div>
                </div>
                <div className="w-16 h-16 bg-[#d1f86a] rounded-2xl shadow-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Truck className="w-8 h-8 text-[#002a01]" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Total Orders */}
          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 relative overflow-hidden group bg-white/70 backdrop-blur-sm">
            <div className="absolute inset-0 bg-gradient-to-br from-[#ffd500]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <CardContent className="p-6 relative z-10">
              <div className="flex items-center justify-between">
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-[#002a01]/60 uppercase tracking-wide">Total Orders</p>
                  <p className="text-4xl font-bold text-[#002a01]">{stats.orders.total.toLocaleString()}</p>
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center text-xs font-medium text-orange-700 bg-orange-100 px-2.5 py-1 rounded-full border border-orange-200">
                      <Clock className="w-3 h-3 mr-1" />
                      {stats.orders.today} today
                    </div>
                  </div>
                </div>
                <div className="w-16 h-16 bg-[#ffd500] rounded-2xl shadow-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <ShoppingCart className="w-8 h-8 text-[#002a01]" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Revenue Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/70 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-[#002a01]/60 uppercase tracking-wide">Total Revenue</p>
                  <p className="text-3xl font-bold text-[#002a01]">₹{stats.revenue.total.toLocaleString()}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <div className="flex items-center text-sm text-green-600 font-medium">
                <TrendingUp className="w-4 h-4 mr-2" />
                +15.3% from last month
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/70 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-[#002a01]/60 uppercase tracking-wide">Today's Revenue</p>
                  <p className="text-3xl font-bold text-[#002a01]">₹{stats.revenue.today.toLocaleString()}</p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
              <div className="flex items-center text-sm text-green-600 font-medium">
                <TrendingUp className="w-4 h-4 mr-2" />
                +{stats.revenue.growth}% from yesterday
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/70 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-[#002a01]/60 uppercase tracking-wide">Avg Order Value</p>
                  <p className="text-3xl font-bold text-[#002a01]">₹{stats.revenue.average}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <ShoppingCart className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <div className="flex items-center text-sm text-red-600 font-medium">
                <TrendingDown className="w-4 h-4 mr-2" />
                -2.1% from last week
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Restaurants */}
          <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
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
                <div className="w-10 h-10 bg-[#d1f86a] rounded-xl flex items-center justify-center">
                  <Star className="w-5 h-5 text-[#002a01]" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {stats.topRestaurants?.map((restaurant, index) => (
                <div key={restaurant.id} className="group p-4 bg-gradient-to-r from-slate-50 to-white rounded-xl border border-slate-200 hover:border-[#d1f86a]/50 hover:shadow-md transition-all duration-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-[#d1f86a] rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                        <span className="text-sm font-bold text-[#002a01]">
                          {index + 1}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold text-[#002a01] group-hover:text-[#002a01]/80 transition-colors">
                          {restaurant.name}
                        </p>
                        <div className="flex items-center space-x-3 text-xs text-[#002a01]/60">
                          <span className="font-medium">{restaurant.orders} orders</span>
                          <div className="flex items-center">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400 mr-1" />
                            {restaurant.rating?.toFixed(1) || 'N/A'}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right space-y-2">
                      <p className="font-bold text-[#002a01]">
                        ₹{restaurant.revenue.toLocaleString()}
                      </p>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="text-xs text-[#002a01]/60 hover:text-[#002a01] hover:bg-[#d1f86a]/20 transition-colors"
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        View
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              <Button 
                variant="outline" 
                className="w-full mt-4 border-[#002a01]/20 text-[#002a01] hover:bg-[#d1f86a]/10 hover:border-[#d1f86a] transition-all duration-200"
              >
                View All Restaurants
              </Button>
            </CardContent>
          </Card>

          {/* Recent Orders */}
          <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-xl font-bold text-[#002a01]">
                    Recent Orders
                  </CardTitle>
                  <CardDescription className="text-[#002a01]/60">
                    Latest orders from customers
                  </CardDescription>
                </div>
                <div className="w-10 h-10 bg-[#ffd500] rounded-xl flex items-center justify-center">
                  <Activity className="w-5 h-5 text-[#002a01]" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {stats.recentOrders?.map((order) => (
                <div key={order.id} className="group p-4 bg-gradient-to-r from-slate-50 to-white rounded-xl border border-slate-200 hover:border-[#ffd500]/50 hover:shadow-md transition-all duration-200">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <p className="font-bold text-[#002a01]">#{order.id}</p>
                        <span className="text-xs text-[#002a01]/50">•</span>
                        <span className="text-xs text-[#002a01]/60">{order.createdAt}</span>
                      </div>
                      <p className="text-sm font-medium text-[#002a01]/80">{order.restaurant}</p>
                      <p className="text-xs text-[#002a01]/60">by {order.customer}</p>
                    </div>
                    <div className="text-right space-y-2">
                      <p className="font-bold text-[#002a01]">₹{order.total}</p>
                      <Badge 
                        className={`text-xs font-medium px-2.5 py-1 ${
                          order.status === 'delivered' 
                            ? 'bg-green-100 text-green-800 border-green-200'
                            : order.status === 'preparing'
                            ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
                            : 'bg-blue-100 text-blue-800 border-blue-200'
                        }`}
                      >
                        {order.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
              <Button 
                variant="outline" 
                className="w-full mt-4 border-[#002a01]/20 text-[#002a01] hover:bg-[#ffd500]/10 hover:border-[#ffd500] transition-all duration-200"
              >
                View All Orders
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Quick Actions */}
        <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-[#002a01] rounded-xl flex items-center justify-center">
                <Activity className="w-5 h-5 text-[#d1f86a]" />
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
                  <Truck className="w-6 h-6 mx-auto group-hover:scale-110 transition-transform duration-200" />
                  <span className="text-sm">Delivery Partners</span>
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

        {/* Night-Time Branding Section */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-[#002a01] via-[#002a01]/95 to-[#002a01] rounded-3xl"></div>
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMiIgZmlsbD0iIzAwZmY0MCIgZmlsbC1vcGFjaXR5PSIwLjEiLz4KPC9zdmc+')] opacity-20"></div>
          
          <Card className="relative border-0 bg-transparent">
            <CardContent className="p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div className="space-y-6">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-[#d1f86a] rounded-2xl flex items-center justify-center">
                        <svg className="w-6 h-6 text-[#002a01]" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 2L3 8v10c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V8l-7-6zM8 18v-6h4v6H8z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <h2 className="text-3xl font-bold text-[#d1f86a]">
                        Night-Time Operations
                      </h2>
                    </div>
                    <p className="text-lg text-[#fcfefe]/80 leading-relaxed">
                      Your platform is optimized for late-night food delivery between 9 PM - 12 AM. 
                      Monitor peak hours and ensure seamless service for night owl customers.
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-[#fcfefe]/10 backdrop-blur-sm rounded-xl p-4 border border-[#fcfefe]/20">
                      <div className="flex items-center space-x-3">
                        <Clock className="w-5 h-5 text-[#d1f86a]" />
                        <div>
                          <p className="text-sm text-[#fcfefe]/60 font-medium">Operating Hours</p>
                          <p className="text-lg font-bold text-[#fcfefe]">9 PM - 12 AM</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-[#fcfefe]/10 backdrop-blur-sm rounded-xl p-4 border border-[#fcfefe]/20">
                      <div className="flex items-center space-x-3">
                        <Activity className="w-5 h-5 text-[#ffd500]" />
                        <div>
                          <p className="text-sm text-[#fcfefe]/60 font-medium">Peak Time</p>
                          <p className="text-lg font-bold text-[#fcfefe]">10 PM - 11 PM</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#d1f86a]/20 to-[#ffd500]/20 rounded-3xl blur-2xl"></div>
                  <div className="relative bg-[#fcfefe]/10 backdrop-blur-sm rounded-3xl p-6 border border-[#fcfefe]/20">
                    <div className="text-center space-y-4">
                      <div className="w-20 h-20 bg-[#ffd500] rounded-3xl flex items-center justify-center mx-auto shadow-2xl">
                        <svg className="w-10 h-10 text-[#002a01]" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-[#fcfefe] mb-2">Late Night Cravings</h3>
                        <p className="text-[#fcfefe]/70 text-sm">
                          Serving hungry customers when they need it most
                        </p>
                      </div>
                      <div className="flex items-center justify-center space-x-4 text-sm">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-[#d1f86a] rounded-full animate-pulse"></div>
                          <span className="text-[#fcfefe]/80">42 active orders</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-[#ffd500] rounded-full animate-pulse"></div>
                          <span className="text-[#fcfefe]/80">18 restaurants open</span>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-[#002a01]/60 uppercase tracking-wide">Platform Health</p>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <p className="text-lg font-bold text-[#002a01]">Excellent</p>
                  </div>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <Activity className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <div className="space-y-2 text-sm text-[#002a01]/60">
                <div className="flex justify-between">
                  <span>Uptime</span>
                  <span className="font-semibold">99.9%</span>
                </div>
                <div className="flex justify-between">
                  <span>Response Time</span>
                  <span className="font-semibold">120ms</span>
                </div>
                <div className="flex justify-between">
                  <span>Error Rate</span>
                  <span className="font-semibold">0.1%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-[#002a01]/60 uppercase tracking-wide">Customer Satisfaction</p>
                  <div className="flex items-center space-x-2">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <p className="text-lg font-bold text-[#002a01]">4.8 / 5.0</p>
                  </div>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                  <Star className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
              <div className="space-y-2 text-sm text-[#002a01]/60">
                <div className="flex justify-between">
                  <span>5 Star Reviews</span>
                  <span className="font-semibold">78%</span>
                </div>
                <div className="flex justify-between">
                  <span>4 Star Reviews</span>
                  <span className="font-semibold">18%</span>
                </div>
                <div className="flex justify-between">
                  <span>Below 3 Stars</span>
                  <span className="font-semibold">4%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-[#002a01]/60 uppercase tracking-wide">Delivery Performance</p>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <p className="text-lg font-bold text-[#002a01]">28 mins</p>
                  </div>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Truck className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <div className="space-y-2 text-sm text-[#002a01]/60">
                <div className="flex justify-between">
                  <span>On Time Delivery</span>
                  <span className="font-semibold">94%</span>
                </div>
                <div className="flex justify-between">
                  <span>Fast Delivery ({'<'}25min)</span>
                  <span className="font-semibold">67%</span>
                </div>
                <div className="flex justify-between">
                  <span>Average Distance</span>
                  <span className="font-semibold">3.2 km</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer Section */}
        <div className="text-center py-8 space-y-4">
          <div className="flex items-center justify-center space-x-3">
            <div className="w-8 h-8 bg-[#002a01] rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-[#d1f86a]" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 2L3 8v10c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V8l-7-6zM8 18v-6h4v6H8z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-[#002a01]">Aasta Admin Dashboard</h3>
          </div>
          <p className="text-[#002a01]/60 max-w-2xl mx-auto">
            Empowering late-night food delivery with real-time insights and comprehensive platform management. 
            Built for efficiency, designed for growth.
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