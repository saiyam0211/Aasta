"use client";

import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import CustomerLayout from "@/components/layouts/customer-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  MapPin, 
  Clock, 
  Star, 
  TrendingUp, 
  ShoppingBag,
  Search,
  Heart
} from "lucide-react";
import Link from "next/link";

export default function CustomerDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;
    
    if (!session) {
      router.push("/auth/signin");
      return;
    }
  }, [session, status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  // Mock data - will be replaced with real API calls
  const featuredRestaurants = [
    {
      id: "1",
      name: "Midnight Bites",
      cuisine: "North Indian",
      rating: 4.5,
      deliveryTime: "25-30 min",
      image: "/api/placeholder/300/200",
      discount: "20% OFF",
    },
    {
      id: "2",
      name: "Night Owl Pizza",
      cuisine: "Italian",
      rating: 4.3,
      deliveryTime: "30-35 min",
      image: "/api/placeholder/300/200",
      discount: "Free Delivery",
    },
    {
      id: "3",
      name: "Late Night Dosa",
      cuisine: "South Indian",
      rating: 4.7,
      deliveryTime: "20-25 min",
      image: "/api/placeholder/300/200",
      discount: "15% OFF",
    },
  ];

  const recentOrders = [
    {
      id: "ORD001",
      restaurant: "Midnight Bites",
      items: "Butter Chicken, Naan x2",
      status: "delivered",
      total: 450,
      date: "2024-01-15",
    },
    {
      id: "ORD002",
      restaurant: "Night Owl Pizza",
      items: "Margherita Pizza",
      status: "delivered",
      total: 320,
      date: "2024-01-12",
    },
  ];

  return (
    <CustomerLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {session.user.name?.split(" ")[0]}!
          </h1>
          <p className="text-gray-600">
            Discover amazing restaurants open for night delivery
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Search className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Find Restaurants</CardTitle>
                  <CardDescription>Browse nearby restaurants</CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Clock className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Track Orders</CardTitle>
                  <CardDescription>Check your active orders</CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Heart className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Favorites</CardTitle>
                  <CardDescription>Your favorite restaurants</CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>
        </div>

        {/* Featured Restaurants */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Featured Restaurants</h2>
            <Link href="/customer/restaurants">
              <Button variant="outline">View All</Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredRestaurants.map((restaurant) => (
              <Card key={restaurant.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                <div className="aspect-video bg-gray-200 relative">
                  <div className="absolute top-3 left-3">
                    <Badge className="bg-red-500 text-white">
                      {restaurant.discount}
                    </Badge>
                  </div>
                  <div className="absolute top-3 right-3">
                    <Button variant="ghost" size="sm" className="bg-white/80 hover:bg-white">
                      <Heart className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-lg">{restaurant.name}</h3>
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">{restaurant.rating}</span>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm mb-3">{restaurant.cuisine}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1 text-gray-500">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm">{restaurant.deliveryTime}</span>
                    </div>
                    <Button size="sm">Order Now</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Recent Orders */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Recent Orders</h2>
            <Link href="/customer/orders">
              <Button variant="outline">View All Orders</Button>
            </Link>
          </div>

          {recentOrders.length > 0 ? (
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <Card key={order.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4 mb-2">
                          <h3 className="font-semibold">{order.restaurant}</h3>
                          <Badge 
                            variant={order.status === "delivered" ? "default" : "secondary"}
                            className={order.status === "delivered" ? "bg-green-500" : ""}
                          >
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </Badge>
                        </div>
                        <p className="text-gray-600 text-sm mb-1">{order.items}</p>
                        <p className="text-gray-500 text-xs">{order.date}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-lg">₹{order.total}</p>
                        <Button variant="outline" size="sm" className="mt-2">
                          Reorder
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <ShoppingBag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No orders yet</h3>
                <p className="text-gray-600 mb-4">Start exploring restaurants and place your first order!</p>
                <Link href="/customer/restaurants">
                  <Button>Browse Restaurants</Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </CustomerLayout>
  );
} 