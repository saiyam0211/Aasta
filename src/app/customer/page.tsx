'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  MapPin,
  Star,
  Clock,
  DollarSign,
  Search,
  Navigation,
  ChefHat,
  Utensils,
  Filter,
  Heart,
} from 'lucide-react';
import { useStore } from '@/lib/store';
import { toast } from 'sonner';

interface Restaurant {
  id: string;
  name: string;
  description: string;
  address: string;
  cuisineTypes: string[];
  averageRating: number;
  averagePreparationTime: number;
  minimumOrderAmount: number;
  isOpen: boolean;
  distance: number;
  estimatedDeliveryTime: number | null;
  totalOrders: number;
  menuCategories: string[];
  featuredItems: {
    id: string;
    name: string;
    price: number;
    category: string;
  }[];
}

const popularCuisines = [
  { name: 'North Indian', icon: '🍛', count: 12 },
  { name: 'Chinese', icon: '🥢', count: 8 },
  { name: 'Italian', icon: '🍝', count: 6 },
  { name: 'South Indian', icon: '🥥', count: 10 },
  { name: 'Fast Food', icon: '🍔', count: 15 },
  { name: 'Desserts', icon: '🍰', count: 7 },
];

export default function CustomerHome() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState<string>('');

  const { data: session } = useSession();
  const router = useRouter();

  const { location, locationPermission, requestLocation, setLocation } =
    useStore();

  useEffect(() => {
    if (!session) {
      router.push('/auth/signin');
      return;
    }

    if (location) {
      fetchNearbyRestaurants();
    }

    // Register PWA client for notifications
    registerPWAClient();
  }, [session, location, router]);

  const registerPWAClient = async () => {
    if (!session?.user?.id) return;

    try {
      // Generate session ID
      const sessionId = `customer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // PWA Detection
      const isStandalone = window.matchMedia(
        '(display-mode: standalone)'
      ).matches;
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      const isiOSStandalone =
        isIOS && (window.navigator as any).standalone === true;
      const isAndroidWebView = /wv/.test(navigator.userAgent);
      const hasManifest =
        document.querySelector('link[rel="manifest"]') !== null;

      const isPWAMode =
        isStandalone || isiOSStandalone || (isAndroidWebView && hasManifest);

      const pwaDetails = {
        isStandalone,
        isiOSStandalone,
        isAndroidWebView,
        hasManifest,
        displayMode: window.matchMedia('(display-mode: standalone)').matches
          ? 'standalone'
          : 'browser',
        userAgent: navigator.userAgent,
      };

      console.log('📱 Customer PWA Registration:', {
        sessionId,
        isPWAMode,
        pwaDetails,
      });

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
        console.log('✅ PWA Client registered:', result);
      } else {
        console.error('❌ PWA Client registration failed:', response.status);
      }
    } catch (error) {
      console.error('❌ PWA Client registration error:', error);
    }
  };

  const fetchNearbyRestaurants = async () => {
    if (!location) return;

    setLoading(true);
    try {
      const response = await fetch('/api/restaurants/discover', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          latitude: location.latitude,
          longitude: location.longitude,
          radius: 5,
          filters: {
            cuisineTypes: selectedCuisine ? [selectedCuisine] : [],
            rating: 3.5,
          },
        }),
      });

      if (!response.ok) throw new Error('Failed to fetch restaurants');

      const data = await response.json();
      setRestaurants(data.data.restaurants.slice(0, 6)); // Show only first 6 on homepage
    } catch (error) {
      console.error('Error fetching restaurants:', error);
      toast.error('Failed to load restaurants');
    } finally {
      setLoading(false);
    }
  };

  const handleLocationRequest = async () => {
    try {
      await requestLocation();
      toast.success('Location access granted!');
    } catch (error) {
      toast.error('Failed to get location');
    }
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      router.push(
        `/customer/discover?search=${encodeURIComponent(searchQuery.trim())}`
      );
    }
  };

  // Show location setup if no location is set
  if (!location) {
    return (
      <div className="bg-background min-h-screen">
        <div className="container mx-auto px-4 py-16">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mb-8">
              <div className="bg-accent-leaf-green mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full">
                <MapPin className="text-accent-dark-green h-12 w-12" />
              </div>
              <h1 className="mb-4 text-4xl font-bold">Welcome to Aasta</h1>
              <p className="text-muted-foreground text-xl">
                Your favorite night food delivery service
              </p>
            </div>

            <Card className="p-8">
              <CardHeader>
                <CardTitle>Set Your Location</CardTitle>
                <CardDescription>
                  We need your location to show nearby restaurants and calculate
                  delivery times
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  onClick={handleLocationRequest}
                  className="w-full"
                  size="lg"
                >
                  <Navigation className="mr-2 h-5 w-5" />
                  Use Current Location
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background text-muted-foreground px-2">
                      or
                    </span>
                  </div>
                </div>

                <Link href="/customer/location">
                  <Button variant="outline" className="w-full" size="lg">
                    <Search className="mr-2 h-5 w-5" />
                    Search Address
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Operating hours info */}
            <div className="bg-accent-leaf-green/10 mt-8 rounded-lg p-4">
              <div className="text-accent-dark-green flex items-center justify-center gap-2">
                <Clock className="h-5 w-5" />
                <span className="font-medium">
                  Operating Hours: 9:00 PM - 12:00 AM
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen">
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold">
            Good evening, {session?.user?.name?.split(' ')[0]}!
          </h1>
          <p className="text-muted-foreground">
            What would you like to eat tonight?
          </p>
        </div>

        {/* Search Bar */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
                <Input
                  type="text"
                  placeholder="Search for restaurants, cuisines, or dishes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-10"
                />
              </div>
              <Button onClick={handleSearch} disabled={!searchQuery.trim()}>
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Popular Cuisines */}
        <div className="mb-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl font-bold">Popular Cuisines</h2>
            <Link href="/customer/discover">
              <Button variant="ghost" size="sm">
                View All
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
            {popularCuisines.map((cuisine) => (
              <Card
                key={cuisine.name}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedCuisine === cuisine.name
                    ? 'ring-accent-dark-green ring-2'
                    : ''
                }`}
                onClick={() => {
                  setSelectedCuisine(
                    selectedCuisine === cuisine.name ? '' : cuisine.name
                  );
                  // Trigger refetch when cuisine is selected
                  if (location) fetchNearbyRestaurants();
                }}
              >
                <CardContent className="p-4 text-center">
                  <div className="mb-2 text-3xl">{cuisine.icon}</div>
                  <h3 className="text-sm font-medium">{cuisine.name}</h3>
                  <p className="text-muted-foreground text-xs">
                    {cuisine.count} restaurants
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Nearby Restaurants */}
        <div className="mb-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl font-bold">
              {selectedCuisine
                ? `${selectedCuisine} Restaurants`
                : 'Restaurants Near You'}
            </h2>
            <Link href="/customer/discover">
              <Button variant="ghost" size="sm">
                View All
              </Button>
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="bg-muted mb-2 h-4 rounded"></div>
                    <div className="bg-muted mb-4 h-3 w-2/3 rounded"></div>
                    <div className="space-y-2">
                      <div className="bg-muted h-3 w-1/2 rounded"></div>
                      <div className="bg-muted h-3 w-1/3 rounded"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : restaurants.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {restaurants.map((restaurant) => (
                <Card
                  key={restaurant.id}
                  className="transition-shadow hover:shadow-md"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">
                          {restaurant.name}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          {restaurant.cuisineTypes.join(', ')}
                        </CardDescription>
                      </div>
                      <Button variant="ghost" size="icon">
                        <Heart className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="mt-2 flex flex-wrap gap-2">
                      {restaurant.cuisineTypes.slice(0, 2).map((type) => (
                        <Badge
                          key={type}
                          variant="secondary"
                          className="text-xs"
                        >
                          {type}
                        </Badge>
                      ))}
                      {!restaurant.isOpen && (
                        <Badge variant="destructive" className="text-xs">
                          Closed
                        </Badge>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent>
                    <div className="text-muted-foreground mb-4 flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span>{restaurant.averageRating}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{restaurant.estimatedDeliveryTime} min</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        <span>₹{restaurant.minimumOrderAmount}</span>
                      </div>
                    </div>

                    <div className="text-muted-foreground mb-4 flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span>{restaurant.distance.toFixed(1)} km away</span>
                      </div>
                      <span>{restaurant.totalOrders} orders</span>
                    </div>

                    {restaurant.featuredItems.length > 0 && (
                      <div className="mb-4">
                        <p className="text-muted-foreground mb-2 text-xs">
                          Featured:
                        </p>
                        <div className="space-y-1">
                          {restaurant.featuredItems.slice(0, 2).map((item) => (
                            <div
                              key={item.id}
                              className="flex justify-between text-sm"
                            >
                              <span className="truncate">{item.name}</span>
                              <span className="font-medium">₹{item.price}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <Link href={`/customer/restaurant/${restaurant.id}`}>
                      <Button className="w-full" disabled={!restaurant.isOpen}>
                        {restaurant.isOpen ? (
                          <>
                            <Utensils className="mr-2 h-4 w-4" />
                            View Menu
                          </>
                        ) : (
                          'Closed'
                        )}
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <ChefHat className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
              <h3 className="mb-2 text-lg font-medium">No restaurants found</h3>
              <p className="text-muted-foreground mb-4">
                {selectedCuisine
                  ? `No ${selectedCuisine} restaurants available in your area right now.`
                  : 'No restaurants are currently available in your area.'}
              </p>
              {selectedCuisine && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedCuisine('');
                    fetchNearbyRestaurants();
                  }}
                >
                  Clear Filter
                </Button>
              )}
            </Card>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <Link href="/customer/discover">
            <Card className="cursor-pointer transition-shadow hover:shadow-md">
              <CardContent className="p-6 text-center">
                <Search className="text-accent-dark-green mx-auto mb-2 h-8 w-8" />
                <h3 className="font-medium">Discover</h3>
                <p className="text-muted-foreground text-sm">
                  Find new restaurants
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/customer/orders">
            <Card className="cursor-pointer transition-shadow hover:shadow-md">
              <CardContent className="p-6 text-center">
                <Clock className="text-accent-dark-green mx-auto mb-2 h-8 w-8" />
                <h3 className="font-medium">Orders</h3>
                <p className="text-muted-foreground text-sm">
                  Track your orders
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/customer/favorites">
            <Card className="cursor-pointer transition-shadow hover:shadow-md">
              <CardContent className="p-6 text-center">
                <Heart className="text-accent-dark-green mx-auto mb-2 h-8 w-8" />
                <h3 className="font-medium">Favorites</h3>
                <p className="text-muted-foreground text-sm">
                  Your liked places
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/customer/profile">
            <Card className="cursor-pointer transition-shadow hover:shadow-md">
              <CardContent className="p-6 text-center">
                <MapPin className="text-accent-dark-green mx-auto mb-2 h-8 w-8" />
                <h3 className="font-medium">Profile</h3>
                <p className="text-muted-foreground text-sm">Manage account</p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}
