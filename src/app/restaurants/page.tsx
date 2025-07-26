"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import CustomerLayout from "@/components/layouts/customer-layout";
import LocationInput from "@/components/location/location-input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  MapPin, 
  Clock, 
  Star, 
  Search,
  Heart,
  Filter,
  SlidersHorizontal,
  ChefHat,
  Utensils
} from "lucide-react";
import { locationService } from "@/lib/location-service";
import { useLocationStore } from "@/lib/store";
import type { Restaurant, LocationWithAddress } from "@/lib/location-service";

export default function RestaurantsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { currentLocation } = useLocationStore();
  
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<LocationWithAddress | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Cuisine filter options
  const cuisineTypes = [
    "North Indian", "South Indian", "Italian", "Chinese", 
    "Fast Food", "Mughlai", "Continental", "Thai", "Mexican"
  ];

  useEffect(() => {
    if (status === "loading") return;
    
    if (!session) {
      router.push("/auth/signin");
      return;
    }

    loadRestaurants();
  }, [session, status, router, selectedLocation, currentLocation]);

  const loadRestaurants = async () => {
    try {
      setIsLoading(true);
      
      // Use selected location or current location
      const location = selectedLocation || currentLocation || {
        latitude: 12.9716, // Default to Bengaluru
        longitude: 77.5946
      };

      const filters = {
        cuisineTypes: selectedCuisines.length > 0 ? selectedCuisines : undefined,
        rating: 4.0 // Minimum rating filter
      };

      const nearbyRestaurants = await locationService.findNearbyRestaurants(
        location,
        5, // 5km radius
        filters
      );

      // Filter by search query
      let filteredRestaurants = nearbyRestaurants;
      if (searchQuery.trim()) {
        filteredRestaurants = nearbyRestaurants.filter(restaurant =>
          restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          restaurant.cuisineTypes.some(cuisine => 
            cuisine.toLowerCase().includes(searchQuery.toLowerCase())
          )
        );
      }

      setRestaurants(filteredRestaurants);
    } catch (error) {
      console.error('Error loading restaurants:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLocationSelect = (location: LocationWithAddress) => {
    setSelectedLocation(location);
  };

  const toggleCuisineFilter = (cuisine: string) => {
    setSelectedCuisines(prev => 
      prev.includes(cuisine) 
        ? prev.filter(c => c !== cuisine)
        : [...prev, cuisine]
    );
  };

  const clearFilters = () => {
    setSelectedCuisines([]);
    setSearchQuery("");
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--primary-dark-green)' }}>
        <div className="text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'var(--accent-leaf-green)' }}>
            <span className="text-brand font-bold text-xl" style={{ color: 'var(--primary-dark-green)' }}>A</span>
          </div>
          <h1 className="text-brand text-2xl font-bold mb-4" style={{ color: 'var(--off-white)' }}>Aasta</h1>
        </div>
      </div>
    );
  }

  if (!session) return null;

  return (
    <CustomerLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" style={{ backgroundColor: 'var(--off-white)' }}>
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-brand text-3xl font-bold mb-2" style={{ color: 'var(--primary-dark-green)' }}>
            Restaurants Near You
          </h1>
          <p className="text-signature text-lg" style={{ color: 'var(--primary-dark-green)' }}>
            Discover amazing food for your late night cravings 🌙
          </p>
        </div>

        {/* Location & Search Section */}
        <div className="mb-8 space-y-4">
          <LocationInput
            onLocationSelect={handleLocationSelect}
            placeholder="Where should we deliver?"
            className="mb-4"
          />
          
          <div className="flex space-x-4">
            <div className="flex-1 relative">
              <Search 
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" 
                style={{ color: 'var(--primary-dark-green)' }}
              />
              <Input
                type="text"
                placeholder="Search restaurants or cuisines..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 border-2 rounded-xl selectable"
                style={{ 
                  borderColor: 'var(--primary-dark-green)',
                  backgroundColor: 'var(--off-white)'
                }}
              />
            </div>
            
            <Button
              onClick={() => setShowFilters(!showFilters)}
              className="h-12 px-4 rounded-xl touchable"
              style={{
                backgroundColor: showFilters ? 'var(--bright-yellow)' : 'var(--accent-leaf-green)',
                color: 'var(--primary-dark-green)',
                border: '2px solid var(--primary-dark-green)'
              }}
            >
              <SlidersHorizontal className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Filters Section */}
        {showFilters && (
          <Card className="restaurant-card mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-heading" style={{ color: 'var(--primary-dark-green)' }}>
                  Filter by Cuisine
                </CardTitle>
                <Button 
                  variant="ghost" 
                  onClick={clearFilters}
                  className="touchable"
                  style={{ color: 'var(--primary-dark-green)' }}
                >
                  Clear All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {cuisineTypes.map((cuisine) => (
                  <Badge
                    key={cuisine}
                    onClick={() => toggleCuisineFilter(cuisine)}
                    className="cursor-pointer touchable px-4 py-2 text-sm font-medium"
                    style={{
                      backgroundColor: selectedCuisines.includes(cuisine) 
                        ? 'var(--bright-yellow)' 
                        : 'var(--accent-leaf-green)',
                      color: 'var(--primary-dark-green)',
                      border: '1px solid var(--primary-dark-green)'
                    }}
                  >
                    {cuisine}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="restaurant-card">
                <div className="aspect-video bg-gray-200 skeleton"></div>
                <CardContent className="p-4">
                  <div className="h-4 bg-gray-200 rounded skeleton mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded skeleton mb-3 w-2/3"></div>
                  <div className="flex justify-between">
                    <div className="h-3 bg-gray-200 rounded skeleton w-1/3"></div>
                    <div className="h-8 bg-gray-200 rounded skeleton w-20"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Results Header */}
        {!isLoading && (
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-heading text-xl font-bold" style={{ color: 'var(--primary-dark-green)' }}>
              {restaurants.length} restaurants found
            </h2>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Clock className="w-4 h-4" />
              <span>Open now (9 PM - 12 AM)</span>
            </div>
          </div>
        )}

        {/* Restaurants Grid */}
        {!isLoading && restaurants.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {restaurants.map((restaurant) => (
              <Card key={restaurant.id} className="restaurant-card touchable cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 
                        className="text-xl font-semibold mb-2 cursor-pointer hover:underline"
                        style={{ color: '#002a01' }}
                        onClick={() => router.push(`/restaurants/${restaurant.id}`)}
                      >
                        {restaurant.name}
                      </h3>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">{restaurant.rating}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 mb-3">
                    <Utensils className="w-4 h-4 text-gray-500" />
                    <p className="text-gray-600 text-sm">
                      {restaurant.cuisineTypes.slice(0, 2).join(', ')}
                    </p>
                  </div>

                  <div className="flex items-center space-x-2 mb-3">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <p className="text-gray-600 text-sm">
                      {restaurant.address}
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1 text-gray-500">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm">
                        {restaurant.averagePreparationTime + 15}-{restaurant.averagePreparationTime + 25} min
                      </span>
                    </div>
                    <Button size="sm" className="btn-primary">
                      View Menu
                    </Button>
                  </div>

                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-xs text-gray-500">
                      Min order: ₹{restaurant.minimumOrderAmount}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* No Results */}
        {!isLoading && restaurants.length === 0 && (
          <Card className="restaurant-card">
            <CardContent className="p-8 text-center">
              <Utensils className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--primary-dark-green)' }}>
                No restaurants found
              </h3>
              <p className="text-gray-600 mb-4">
                Try adjusting your location or search filters
              </p>
              <Button onClick={clearFilters} className="btn-primary">
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </CustomerLayout>
  );
} 