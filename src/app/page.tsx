"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LocationPrompt } from "@/components/LocationPrompt";
import { useLocationStore } from "@/hooks/useLocation";
import CustomerLayout from "@/components/layouts/customer-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  MapPin, 
  Clock, 
  Star, 
  TrendingUp, 
  ShoppingBag,
  Search,
  Heart,
  Loader2,
  CheckCircle
} from "lucide-react";
import Link from "next/link";
import { usePWA } from "@/hooks/usePWA";

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { 
    isInstallable, 
    isInstalled, 
    showInstallPrompt, 
    isOnline,
    subscribeToPushNotifications 
  } = usePWA();
  const { latitude, longitude, setLocation, setError } = useLocationStore();
  const [showLocationPrompt, setShowLocationPrompt] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    router.push(`/search?query=${encodeURIComponent(searchQuery.trim())}`);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      // Not authenticated, redirect to customer sign in
      router.push("/auth/signin");
      return;
    }

    // If we don't have a location yet, show the prompt
    if (!latitude || !longitude) {
      setShowLocationPrompt(true);
    }

    // Register PWA client and trigger installation workflow
    registerPWAClientAndTriggerInstall();
  }, [session, status, router, latitude, longitude]);

  const registerPWAClientAndTriggerInstall = async () => {
    if (!session?.user?.id) return;

    try {
      // Generate session ID
      const sessionId = `home_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // PWA Detection
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      const isiOSStandalone = isIOS && (window.navigator as any).standalone === true;
      const isAndroidWebView = /wv/.test(navigator.userAgent);
      const hasManifest = document.querySelector('link[rel="manifest"]') !== null;

      const isPWAMode = isStandalone || isiOSStandalone || (isAndroidWebView && hasManifest);

      const pwaDetails = {
        isStandalone,
        isiOSStandalone,
        isAndroidWebView,
        hasManifest,
        displayMode: window.matchMedia('(display-mode: standalone)').matches ? 'standalone' : 'browser',
        userAgent: navigator.userAgent,
      };

      const response = await fetch('/api/client-register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          isPWA: isPWAMode,
          userAgent: navigator.userAgent,
          pwaDetails,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        
        // If already in PWA mode, ensure push notifications are set up
        if (isPWAMode && 'Notification' in window) {
          setTimeout(async () => {
            if (Notification.permission === 'granted') {
              await subscribeToPushNotifications();
            } else if (Notification.permission === 'default') {
              // Request permission for PWA users
              const permission = await Notification.requestPermission();
              if (permission === 'granted') {
                await subscribeToPushNotifications();
              }
            }
          }, 1000);
        }
      } else {
        console.error('❌ Home PWA Client registration failed:', response.status);
      }
    } catch (error) {
      console.error('❌ Home PWA Client registration error:', error);
    }
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-primary-dark-green">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-accent-leaf-green">
            <span className="text-brand font-bold text-xl text-primary-dark-green">A</span>
          </div>
          <h1 className="text-brand text-2xl font-bold mb-4 text-off-white">Aasta</h1>
          <div className="flex items-center justify-center space-x-2 text-off-white">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Loading...</span>
          </div>
        </div>
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
      <div className="space-y-8">
        {showLocationPrompt && (
          <LocationPrompt
            onLocationShared={(location) => {
              setLocation(location.lat, location.lng);
              setShowLocationPrompt(false);
            }}
            onDismiss={() => setShowLocationPrompt(false)}
          />
        )}

        {/* Success Message */}
        {isInstalled && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 text-green-800">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">🎉 Aasta App Installed Successfully!</span>
            </div>
            <p className="text-sm text-green-700 mt-1">
              You can now use Aasta as a native app on your device.
            </p>
          </div>
        )}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-off-white">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-brand text-3xl font-bold mb-2 text-primary-dark-green">
              Welcome back, {session.user.name?.split(" ")[0]}!
            </h1>
            <p className="text-signature text-lg text-primary-dark-green">
              Late night cravings sorted ✨
            </p>
            {isInstalled && (
              <div className="mt-2 text-sm text-green-600 font-medium">
                🎉 App installed! You'll receive push notifications for your orders.
              </div>
            )}
          </div>

          {/* Hero Banner */}
          <div className="mb-8 p-6 rounded-2xl touchable bg-bright-yellow">
            <div className="text-center">
              <h2 className="text-heading text-2xl font-bold mb-2 text-primary-dark-green">
                Night Delivery is Live! 🌙
              </h2>
              <p className="text-lg mb-4 text-primary-dark-green">
                Premium food delivery from 9 PM to 12 AM
              </p>
              
              {/* Search Bar */}
              <div className="max-w-md mx-auto mb-4">
                <div className="flex items-center space-x-2">
                  <Input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Search restaurants, dishes..."
                    className="flex-1 selectable border-2 border-primary-dark-green focus:border-primary-dark-green text-primary-dark-green"
                  />
                  <Button 
                    onClick={handleSearch} 
                    className="btn-primary px-4"
                    disabled={!searchQuery.trim()}
                  >
                    <Search className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              <Button className="btn-primary">
                Order Now
              </Button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="restaurant-card touchable cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-3">
                  <div className="p-3 rounded-lg bg-accent-leaf-green">
                    <Search className="w-6 h-6 text-primary-dark-green" />
                  </div>
                  <div>
                    <CardTitle className="text-lg text-primary-dark-green">Find Restaurants</CardTitle>
                    <CardDescription>Browse nearby restaurants</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>

            <Card className="restaurant-card touchable cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-3">
                  <div className="p-3 rounded-lg bg-accent-leaf-green">
                    <Clock className="w-6 h-6 text-primary-dark-green" />
                  </div>
                  <div>
                    <CardTitle className="text-lg text-primary-dark-green">Track Orders</CardTitle>
                    <CardDescription>Check your active orders</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>

            <Card className="restaurant-card touchable cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-3">
                  <div className="p-3 rounded-lg bg-accent-leaf-green">
                    <Heart className="w-6 h-6 text-primary-dark-green" />
                  </div>
                  <div>
                    <CardTitle className="text-lg text-primary-dark-green">Favorites</CardTitle>
                    <CardDescription>Your favorite restaurants</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </div>

          {/* Featured Restaurants */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-heading text-2xl font-bold text-primary-dark-green">Featured Restaurants</h2>
              <Link href="/restaurants">
                <Button variant="outline" className="border-2 border-primary-dark-green text-primary-dark-green">
                  View All
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredRestaurants.map((restaurant) => (
                <Card key={restaurant.id} className="restaurant-card touchable cursor-pointer">
                  <div className="aspect-video bg-gray-200 relative">
                    <div className="absolute top-3 left-3">
                      <Badge className="text-sm font-bold bg-bright-yellow text-primary-dark-green">
                        {restaurant.discount}
                      </Badge>
                    </div>
                    <div className="absolute top-3 right-3">
                      <Button variant="ghost" size="sm" className="bg-white/80 hover:bg-white touchable">
                        <Heart className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-lg text-primary-dark-green">{restaurant.name}</h3>
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
                      <Button size="sm" className="btn-primary">Order Now</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Recent Orders */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-heading text-2xl font-bold text-primary-dark-green">Recent Orders</h2>
              <Link href="/customer/orders">
                <Button variant="outline" className="border-2 border-primary-dark-green text-primary-dark-green">
                  View All Orders
                </Button>
              </Link>
            </div>

            {recentOrders.length > 0 ? (
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <Card key={order.id} className="restaurant-card">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-4 mb-2">
                            <h3 className="font-semibold text-primary-dark-green">{order.restaurant}</h3>
                            <Badge 
                              className={`font-medium ${
                                order.status === "delivered" 
                                  ? "bg-accent-leaf-green text-primary-dark-green" 
                                  : "bg-bright-yellow text-primary-dark-green"
                              }`}
                            >
                              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </Badge>
                          </div>
                          <p className="text-gray-600 text-sm mb-1 selectable">{order.items}</p>
                          <p className="text-gray-500 text-xs">{order.date}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-lg text-primary-dark-green">₹{order.total}</p>
                          <Button variant="outline" size="sm" className="mt-2 touchable">
                            Reorder
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="restaurant-card">
                <CardContent className="p-8 text-center">
                  <ShoppingBag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2 text-primary-dark-green">No orders yet</h3>
                  <p className="text-gray-600 mb-4">Start exploring restaurants and place your first order!</p>
                  <Link href="/restaurants">
                    <Button className="btn-primary">Browse Restaurants</Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
        
      </div>
    </CustomerLayout>
  );
}
