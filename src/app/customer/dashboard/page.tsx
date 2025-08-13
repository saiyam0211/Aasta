"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import CustomerLayout from "@/components/layouts/customer-layout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { MapPin, ChevronDown, Navigation, Search, Loader2 } from "lucide-react";
import { MaterialSearchBar } from "@/components/ui/material-search-bar";
import { HeroBanner } from "@/components/ui/hero-banner";
import { FeaturedDishes } from "@/components/ui/featured-dishes";
import { NearbyRestaurants } from "@/components/ui/nearby-restaurants";
import { useStore } from "@/lib/store";
import { locationService } from "@/lib/location-service";
import { toast } from "sonner";

export default function CustomerDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [addressInput, setAddressInput] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isSearchingAddress, setIsSearchingAddress] = useState(false);
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [isLoadingRestaurants, setIsLoadingRestaurants] = useState(false);
  
  const {
    location,
    locationAddress,
    locationPermission,
    locationLoading,
    locationError,
    requestLocation,
    setLocation,
    setAddress,
    getLocationDisplayText
  } = useStore();
  
  const [locationDisplay, setLocationDisplay] = useState("Set your location");
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);

  // Update location display when location or address changes
  useEffect(() => {
    let displayText = "Set your location";
    
    console.log('🔍 Location Display Effect triggered:', {
      location,
      locationAddress,
      hasLocation: !!location,
      hasAddress: !!locationAddress,
      addressValue: locationAddress?.address
    });
    
    if (locationAddress && locationAddress.address) {
      // Try to create a short, user-friendly address
      const address = locationAddress.address;
      const parts = address.split(',');
      if (parts.length >= 2) {
        // Return first two parts for a concise display
        displayText = `${parts[0].trim()}, ${parts[1].trim()}`;
      } else {
        displayText = address.length > 40 ? address.substring(0, 37) + '...' : address;
      }
      console.log('✅ Using address for display:', displayText);
    } else if (location) {
      displayText = 'Current Location';
      console.log('⚠️ Using fallback "Current Location" text');
    }
    
    console.log('📍 Setting location display to:', displayText);
    setLocationDisplay(displayText);
    
    // If we have location but no address, fetch it using our API
    if (location && !locationAddress) {
      console.log('🌐 Fetching address for location:', location);
      const apiUrl = `/api/geocode/reverse?lat=${location.latitude}&lng=${location.longitude}`;
      console.log('📡 API URL:', apiUrl);
      
      fetch(apiUrl)
        .then(response => {
          console.log('📥 API Response status:', response.status, response.statusText);
          return response.json();
        })
        .then((data) => {
          console.log('🎯 Reverse geocoding result:', data);
          if (data.success && data.data) {
            console.log('💾 Setting address in store:', data.data);
            setAddress({
              address: data.data.address,
              city: data.data.city,
              state: data.data.state,
              zipCode: data.data.zipCode,
            });
          } else {
            console.error('❌ API returned unsuccessful result:', data);
          }
        })
        .catch((error) => {
          console.error('💥 Error getting address:', error);
        });
    } else if (location && locationAddress) {
      console.log('✨ Both location and address available, no fetch needed');
    } else if (!location) {
      console.log('📍 No location available');
    }
  }, [location, locationAddress, setAddress]);

  // Fetch restaurants when location changes
  useEffect(() => {
    if (location) {
      fetchNearbyRestaurants();
    }
  }, [location]);

  useEffect(() => {
    if (status === "loading") return;
    
    if (!session) {
      router.push("/auth/signin");
      return;
    }

    // Set initial loading state
    setIsLoadingData(false);
  }, [session, status, router]);

  // Fetch nearby restaurants from API
  const fetchNearbyRestaurants = async () => {
    if (!location) return;
    
    setIsLoadingRestaurants(true);
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
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data.restaurants) {
          // Transform API data to component format
          const transformedRestaurants = data.data.restaurants.map((restaurant: any) => ({
            id: restaurant.id,
            name: restaurant.name,
            image: restaurant.imageUrl || '/images/restaurant-placeholder.svg',
            cuisineTypes: restaurant.cuisineTypes,
            rating: restaurant.rating,
            reviewCount: restaurant.totalOrders || 0,
            deliveryTime: `${restaurant.estimatedDeliveryTime || 30}-${(restaurant.estimatedDeliveryTime || 30) + 5} min`,
            deliveryFee: 25, // Default delivery fee
            distance: restaurant.distance,
            isPromoted: false,
            isFavorite: false,
            minOrderAmount: restaurant.minimumOrderAmount,
            avgCostForTwo: restaurant.minimumOrderAmount * 2,
            isOpen: restaurant.isOpen,
          }));
          setRestaurants(transformedRestaurants);
        }
      }
    } catch (error) {
      console.error('Error fetching restaurants:', error);
      toast.error('Failed to fetch nearby restaurants');
    } finally {
      setIsLoadingRestaurants(false);
    }
  };

  // Location handlers
  const handleLocationClick = () => {
    setShowLocationModal(true);
  };

  const handleUseCurrentLocation = async () => {
    try {
      await requestLocation();
      if (location) {
        toast.success('Location updated!');
        setShowLocationModal(false);
      }
    } catch (error) {
      toast.error('Failed to get current location');
    }
  };

  const handleAddressSearch = async () => {
    if (!addressInput.trim()) return;
    
    setIsSearchingAddress(true);
    try {
      const suggestions = await locationService.getPlaceSuggestions(addressInput);
      setSuggestions(suggestions);
    } catch (error) {
      toast.error('Failed to search for address');
    } finally {
      setIsSearchingAddress(false);
    }
  };

  const handleSelectSuggestion = async (suggestion: any) => {
    try {
      const result = await locationService.geocodeAddress(suggestion.address);
      if (result) {
        setLocation({
          latitude: result.latitude,
          longitude: result.longitude,
        });
        setAddress({
          address: result.address,
          city: result.city,
          state: result.state,
          zipCode: result.zipCode,
        });
        toast.success('Location updated!');
        setShowLocationModal(false);
        setSuggestions([]);
        setAddressInput("");
      }
    } catch (error) {
      toast.error('Failed to set location');
    }
  };

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
  const heroBanners = [
    {
      id: 1,
      title: "Night Delivery is Live!",
      subtitle: "Premium food delivery from 9 PM to 12 AM",
      description: "Get your favorite food delivered fresh to your doorstep during late night hours",
      image: "/images/banners/night-delivery-banner.jpg",
      backgroundColor: "#1a365d",
      textColor: "text-white",
      ctaText: "Order Now",
      ctaAction: () => router.push('/restaurants')
    },
    {
      id: 2,
      title: "Free Delivery Weekend",
      subtitle: "No delivery charges on orders above ₹299",
      description: "Save more on your favorite meals with free delivery all weekend long",
      image: "/images/banners/free-delivery-banner.jpg",
      backgroundColor: "#2d5016",
      textColor: "text-white",
      ctaText: "Explore Offers",
      ctaAction: () => router.push('/restaurants?filter=offers')
    },
    {
      id: 3,
      title: "New Restaurant Alert!",
      subtitle: "50+ new restaurants added this week",
      description: "Discover exciting new cuisines and flavors from recently added restaurants",
      image: "/images/banners/new-restaurant-banner.jpg",
      backgroundColor: "#7c2d12",
      textColor: "text-white",
      ctaText: "Discover New",
      ctaAction: () => router.push('/restaurants?filter=new')
    }
  ];

  const featuredDishes = [
    {
      id: "dish1",
      name: "Butter Chicken with Naan",
      image: "/images/dish-placeholder.svg",
      price: 299,
      originalPrice: 399,
      rating: 4.8,
      preparationTime: 25,
      restaurant: "Midnight Bites",
      category: "North Indian",
      isVegetarian: false,
      spiceLevel: 'medium' as const,
      description: "Creamy tomato-based curry with tender chicken pieces served with fresh naan"
    },
    {
      id: "dish2",
      name: "Margherita Pizza",
      image: "/images/dish-placeholder.svg",
      price: 249,
      originalPrice: 329,
      rating: 4.6,
      preparationTime: 20,
      restaurant: "Night Owl Pizza",
      category: "Italian",
      isVegetarian: true,
      spiceLevel: 'mild' as const,
      description: "Classic pizza with fresh mozzarella, tomato sauce, and basil leaves"
    },
    {
      id: "dish3",
      name: "Hyderabadi Biryani",
      image: "/images/dish-placeholder.svg",
      price: 349,
      originalPrice: 449,
      rating: 4.9,
      preparationTime: 35,
      restaurant: "Royal Kitchen",
      category: "Biryani",
      isVegetarian: false,
      spiceLevel: 'spicy' as const,
      description: "Aromatic basmati rice with tender mutton pieces and authentic spices"
    },
    {
      id: "dish4",
      name: "Paneer Tikka Masala",
      image: "/images/dish-placeholder.svg",
      price: 279,
      rating: 4.7,
      preparationTime: 22,
      restaurant: "Veggie Delight",
      category: "North Indian",
      isVegetarian: true,
      spiceLevel: 'medium' as const,
      description: "Grilled cottage cheese in rich tomato and cream gravy"
    },
    {
      id: "dish5",
      name: "Chicken Hakka Noodles",
      image: "/images/dish-placeholder.svg",
      price: 199,
      originalPrice: 259,
      rating: 4.5,
      preparationTime: 18,
      restaurant: "Dragon Palace",
      category: "Chinese",
      isVegetarian: false,
      spiceLevel: 'mild' as const,
      description: "Stir-fried noodles with chicken and fresh vegetables"
    },
    {
      id: "dish6",
      name: "Masala Dosa",
      image: "/images/dish-placeholder.svg",
      price: 129,
      rating: 4.8,
      preparationTime: 15,
      restaurant: "South Spice",
      category: "South Indian",
      isVegetarian: true,
      spiceLevel: 'mild' as const,
      description: "Crispy crepe filled with spiced potato curry served with chutney"
    }
  ];

  const nearbyRestaurants = [
    {
      id: "rest1",
      name: "Midnight Bites",
      image: "/images/restaurant-placeholder.svg",
      cuisineTypes: ["North Indian", "Mughlai", "Tandoor"],
      rating: 4.5,
      reviewCount: 1250,
      deliveryTime: "25-30 min",
      deliveryFee: 0,
      distance: 1.2,
      isPromoted: true,
      isFavorite: false,
      discount: "20% OFF",
      minOrderAmount: 199,
      avgCostForTwo: 350,
      isOpen: true
    },
    {
      id: "rest2",
      name: "Night Owl Pizza",
      image: "/images/restaurant-placeholder.svg",
      cuisineTypes: ["Italian", "Pizza", "Pasta"],
      rating: 4.3,
      reviewCount: 890,
      deliveryTime: "30-35 min",
      deliveryFee: 25,
      distance: 2.1,
      isPromoted: false,
      isFavorite: true,
      discount: "Free Delivery",
      minOrderAmount: 249,
      avgCostForTwo: 450,
      isOpen: true
    },
    {
      id: "rest3",
      name: "Royal Kitchen",
      image: "/images/restaurant-placeholder.svg",
      cuisineTypes: ["Biryani", "Hyderabadi", "Kebabs"],
      rating: 4.8,
      reviewCount: 2100,
      deliveryTime: "35-40 min",
      deliveryFee: 30,
      distance: 3.5,
      isPromoted: true,
      isFavorite: false,
      minOrderAmount: 299,
      avgCostForTwo: 500,
      isOpen: true
    },
    {
      id: "rest4",
      name: "Dragon Palace",
      image: "/images/restaurant-placeholder.svg",
      cuisineTypes: ["Chinese", "Thai", "Asian"],
      rating: 4.2,
      reviewCount: 675,
      deliveryTime: "20-25 min",
      deliveryFee: 20,
      distance: 1.8,
      isPromoted: false,
      isFavorite: true,
      discount: "15% OFF",
      minOrderAmount: 179,
      avgCostForTwo: 320,
      isOpen: true
    },
    {
      id: "rest5",
      name: "South Spice",
      image: "/images/restaurant-placeholder.svg",
      cuisineTypes: ["South Indian", "Dosa", "Idli"],
      rating: 4.6,
      reviewCount: 1540,
      deliveryTime: "15-20 min",
      deliveryFee: 0,
      distance: 0.8,
      isPromoted: false,
      isFavorite: false,
      minOrderAmount: 149,
      avgCostForTwo: 280,
      isOpen: true
    }
  ];

  const handleAddToCart = (dish: any) => {
    // TODO: Implement add to cart functionality
    toast.success(`${dish.name} added to cart!`);
  };

  const handleFavoriteToggle = (id: string, isFavorite: boolean) => {
    // TODO: Implement favorite toggle API call
    toast.success(isFavorite ? 'Added to favorites!' : 'Removed from favorites!');
  };

  return (
    <CustomerLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Top Header Bar with Location and Profile */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              {/* Location Section */}
              <div 
                className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 rounded-lg p-2 transition-colors"
                onClick={handleLocationClick}
              >
                <MapPin className="w-5 h-5 text-red-500" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{locationDisplay}</p>
                  <p className="text-xs text-gray-500">Tap to change location</p>
                  {/* Debug info - remove later */}
                  {process.env.NODE_ENV === 'development' && (
                    <p className="text-xs text-blue-500">Debug: {JSON.stringify({ hasLoc: !!location, hasAddr: !!locationAddress })}</p>
                  )}
                </div>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </div>

              {/* Profile Avatar */}
              <Avatar className="w-10 h-10 cursor-pointer hover:ring-2 hover:ring-primary-dark-green hover:ring-offset-2 transition-all">
                <AvatarImage src={session.user?.image || ""} alt={session.user?.name || ""} />
                <AvatarFallback className="bg-accent-leaf-green text-primary-dark-green font-semibold">
                  {session.user?.name?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>

        {/* Main Content Container */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
          {/* Material 3 Search Bar */}
          <div className="relative">
            <MaterialSearchBar
              placeholder="Search restaurants, dishes, cuisines..."
              onSearch={(query) => router.push(`/restaurants?search=${encodeURIComponent(query)}`)}
              onFilter={() => {/* TODO: Implement filter modal */}}
              onVoiceSearch={() => {/* TODO: Implement voice search */}}
            />
          </div>

          {/* Hero Banner Section */}
          <HeroBanner 
            banners={heroBanners}
            autoSlideInterval={5000}
          />

          {/* Featured Dishes Section */}
          <FeaturedDishes 
            dishes={featuredDishes}
            onAddToCart={handleAddToCart}
          />

          {/* Nearby Restaurants Section */}
          <NearbyRestaurants 
            restaurants={restaurants.length > 0 ? restaurants : nearbyRestaurants}
            onFavoriteToggle={handleFavoriteToggle}
            onRestaurantClick={(id) => router.push(`/restaurants/${id}`)}
          />
          
          {isLoadingRestaurants && (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary-dark-green" />
              <span className="ml-2 text-gray-600">Loading nearby restaurants...</span>
            </div>
          )}
        </div>
      </div>

      {/* Location Selection Modal */}
      <Dialog open={showLocationModal} onOpenChange={setShowLocationModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Set Your Location</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Current Location Button */}
            <Button 
              onClick={handleUseCurrentLocation}
              className="w-full flex items-center justify-center gap-2"
              disabled={locationLoading}
            >
              {locationLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Navigation className="h-4 w-4" />
              )}
              {locationLoading ? 'Getting location...' : 'Use Current Location'}
            </Button>
            
            {locationError && (
              <p className="text-sm text-red-600 text-center">{locationError}</p>
            )}
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-muted-foreground">or</span>
              </div>
            </div>
            
            {/* Address Search */}
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter your address..."
                  value={addressInput}
                  onChange={(e) => setAddressInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddressSearch()}
                />
                <Button 
                  onClick={handleAddressSearch}
                  disabled={isSearchingAddress || !addressInput.trim()}
                  size="sm"
                >
                  {isSearchingAddress ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                </Button>
              </div>
              
              {/* Address Suggestions */}
              {suggestions.length > 0 && (
                <div className="max-h-40 overflow-y-auto space-y-1 border rounded-md">
                  {suggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className="p-2 hover:bg-gray-100 cursor-pointer flex items-center gap-2"
                      onClick={() => handleSelectSuggestion(suggestion)}
                    >
                      <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{suggestion.address}</p>
                        {suggestion.city && (
                          <p className="text-xs text-gray-500 truncate">{suggestion.city}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
    </CustomerLayout>
  );
}
