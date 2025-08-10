"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } 
from "@/components/ui/badge";
import { Store, Users, TrendingUp, Clock, Eye, Truck, Calendar, RefreshCw, ArrowUpRight, Package, DollarSign } from "lucide-react";
import RestaurantLayout from "@/components/layouts/restaurant-layout";

interface Restaurant {
  id: string;
  name: string;
  description?: string;
  address: string;
  phone: string;
  status: string;
  cuisineTypes: string[];
  averagePreparationTime: number;
  minimumOrderAmount: number;
  deliveryRadius: number;
  assignedDeliveryPartners: string[];
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  customerName: string;
  itemCount: number;
}

interface DeliveryPartner {
  id: string;
  name: string;
  status: string;
  rating: number;
  completedDeliveries: number;
}

interface EarningsStats {
  today: number;
  thisWeek: number;
  thisMonth: number;
  totalOrders: number;
}

export default function RestaurantDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [activeOrders, setActiveOrders] = useState<Order[]>([]);
  const [deliveryPartners, setDeliveryPartners] = useState<DeliveryPartner[]>([]);
  const [earnings, setEarnings] = useState<EarningsStats>({
    today: 0,
    thisWeek: 0,
    thisMonth: 0,
    totalOrders: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") return;
    
    if (!session) {
      router.push("/restaurant/auth/signin");
      return;
    }

    // Fetch all dashboard data
    fetchDashboardData();
  }, [session, status, router]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch restaurant data
      const restaurantResponse = await fetch('/api/restaurants');
      const restaurantData = await restaurantResponse.json();
      
      if (restaurantResponse.ok && restaurantData.restaurant) {
        setRestaurant(restaurantData.restaurant);
        
        // Fetch active orders
        const ordersResponse = await fetch('/api/restaurant/orders?limit=3');
        const ordersData = await ordersResponse.json();
        
        if (ordersData.success) {
          setActiveOrders(ordersData.orders || []);
        }
        
        // Fetch delivery partners
        if (restaurantData.restaurant.assignedDeliveryPartners?.length > 0) {
          const partnersResponse = await fetch('/api/restaurant/delivery-partners');
          const partnersData = await partnersResponse.json();
          
          if (partnersData.success) {
            setDeliveryPartners(partnersData.partners || []);
          }
        }
        
        // Fetch earnings data
        const earningsResponse = await fetch('/api/restaurant/earnings');
        const earningsData = await earningsResponse.json();
        
        if (earningsData.success) {
          setEarnings(earningsData.earnings);
        }
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PLACED': return 'bg-blue-100 text-blue-800';
      case 'CONFIRMED': return 'bg-green-100 text-green-800';
      case 'PREPARING': return 'bg-yellow-100 text-yellow-800';
      case 'READY_FOR_PICKUP': return 'bg-purple-100 text-purple-800';
      case 'OUT_FOR_DELIVERY': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPartnerStatusColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE': return 'bg-green-100 text-green-800';
      case 'BUSY': return 'bg-yellow-100 text-yellow-800';
      case 'OFFLINE': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <RestaurantLayout> 
      <div className="space-y-8 animate-fade-in">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Restaurant Dashboard</h2>
          <p className="text-gray-600">Manage your night-time delivery orders and menu</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-600">Today's Orders</CardTitle>
                <Users className="w-4 h-4 text-gray-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{earnings.totalOrders}</div>
              <p className="text-xs text-gray-500">{earnings.totalOrders === 0 ? 'No orders yet today' : 'Orders received today'}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-600">Today's Earnings</CardTitle>
                <TrendingUp className="w-4 h-4 text-gray-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{earnings.today.toFixed(0)}</div>
              <p className="text-xs text-gray-500">Restaurant earnings today</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-600">Delivery Partners</CardTitle>
                <Truck className="w-4 h-4 text-gray-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{deliveryPartners.length}</div>
              <p className="text-xs text-gray-500">Assigned partners</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-600">Status</CardTitle>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Open</div>
              <p className="text-xs text-gray-500">Ready for orders</p>
            </CardContent>
          </Card>
        </div>

        {/* Active Orders Section */}
        {activeOrders.length > 0 && (
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Active Orders</h3>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => router.push('/restaurant/orders')}
                className="flex items-center gap-2"
              >
                <Eye className="w-4 h-4" />
                View More
              </Button>
            </div>
            <div className="grid gap-4">
              {activeOrders.slice(0, 3).map((order) => (
                <Card key={order.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-medium">Order #{order.orderNumber}</h4>
                        <p className="text-sm text-gray-600">{order.customerName}</p>
                      </div>
                      <Badge className={getStatusColor(order.status)}>
                        {order.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center text-sm text-gray-500">
                      <span>{order.itemCount} item{order.itemCount > 1 ? 's' : ''}</span>
                      <span>₹{order.totalAmount}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Delivery Partners Section */}
        {deliveryPartners.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Delivery Partners</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {deliveryPartners.map((partner) => (
                <Card key={partner.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-medium">{partner.name}</h4>
                        <p className="text-sm text-gray-600">{partner.completedDeliveries} deliveries</p>
                      </div>
                      <Badge className={getPartnerStatusColor(partner.status)}>
                        {partner.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-yellow-600">
                      <span>★</span>
                      <span>{partner.rating.toFixed(1)}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Earnings Overview */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Earnings Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">₹{earnings.today.toFixed(0)}</div>
                <p className="text-sm text-gray-600">Today</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">₹{earnings.thisWeek.toFixed(0)}</div>
                <p className="text-sm text-gray-600">This Week</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">₹{earnings.thisMonth.toFixed(0)}</div>
                <p className="text-sm text-gray-600">This Month</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg">Manage Menu</CardTitle>
              <CardDescription>Add, edit, or remove menu items</CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full bg-orange-600 hover:bg-orange-700"
                onClick={() => router.push('/restaurant/menu')}
              >
                Go to Menu Management
              </Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg">Restaurant Profile</CardTitle>
              <CardDescription>
                {loading ? "Loading..." : restaurant ? "Manage your restaurant information" : "Complete your restaurant setup"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Button className="w-full" variant="outline" disabled>
                  Loading...
                </Button>
              ) : restaurant ? (
                <div className="space-y-2">
                  <p className="text-sm font-medium">{restaurant.name}</p>
                  <p className="text-xs text-gray-500">{restaurant.address}</p>
                  <Button 
                    className="w-full" 
                    variant="outline"
                    onClick={() => router.push('/restaurant/profile')}
                  >
                    Edit Profile
                  </Button>
                </div>
              ) : (
                <Button 
                  className="w-full" 
                  variant="outline"
                  onClick={() => router.push('/restaurant/onboarding')}
                >
                  Setup Profile
                </Button>
              )}
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg">Analytics</CardTitle>
              <CardDescription>View sales reports and insights</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline">
                View Analytics
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Operating Hours Notice */}
        <div className="mt-8">
          <Card className="bg-orange-50 border-orange-200">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <Clock className="w-6 h-6 text-orange-600" />
                <div>
                  <h3 className="font-semibold text-orange-800">Night Delivery Hours</h3>
                  <p className="text-orange-700">Your restaurant is available for orders from 9:00 PM to 12:00 AM</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </RestaurantLayout>
  );
} 