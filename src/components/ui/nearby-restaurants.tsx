"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Star, 
  Clock, 
  MapPin, 
  Heart, 
  Zap, 
  Truck,
  ArrowRight,
  ChefHat
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { SafeImage } from "@/components/ui/safe-image";

interface Restaurant {
  id: string;
  name: string;
  image: string;
  cuisineTypes: string[];
  rating: number;
  reviewCount: number;
  deliveryTime: string;
  deliveryFee: number;
  distance: number; // in km
  isPromoted: boolean;
  isFavorite: boolean;
  discount?: string;
  minOrderAmount: number;
  avgCostForTwo: number;
  isOpen: boolean;
}

interface NearbyRestaurantsProps {
  restaurants: Restaurant[];
  onFavoriteToggle?: (id: string, isFavorite: boolean) => void;
  onRestaurantClick?: (id: string) => void;
  className?: string;
}

export function NearbyRestaurants({ 
  restaurants, 
  onFavoriteToggle, 
  onRestaurantClick,
  className 
}: NearbyRestaurantsProps) {
  
  const handleFavoriteClick = (e: React.MouseEvent, restaurant: Restaurant) => {
    e.preventDefault();
    e.stopPropagation();
    onFavoriteToggle?.(restaurant.id, !restaurant.isFavorite);
  };

  if (!restaurants.length) {
    return (
      <div className={cn("w-full", className)}>
        <div className="text-center py-12">
          <ChefHat className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No restaurants nearby</h3>
          <p className="text-gray-600">Try adjusting your location or search area</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("w-full", className)}>
      {/* Section Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Restaurants Near You</h2>
          <p className="text-gray-600 text-sm mt-1">{restaurants.length} restaurants within 5km</p>
        </div>
      </div>

      {/* Restaurant List */}
      <div className="space-y-4">
        {restaurants.map((restaurant) => (
          <Card 
            key={restaurant.id}
            className="overflow-hidden bg-white shadow-md hover:shadow-xl transition-all duration-300 border-0 rounded-2xl group cursor-pointer"
            onClick={() => onRestaurantClick?.(restaurant.id)}
          >
            <Link href={`/restaurants/${restaurant.id}`} className="block">
              <CardContent className="p-0">
                <div className="flex">
                  {/* Restaurant Image */}
                  <div className="relative w-32 h-32 sm:w-40 sm:h-32 flex-shrink-0">
                    <SafeImage
                      src={restaurant.image}
                      alt={restaurant.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      fallbackSrc="/images/restaurant-placeholder.svg"
                    />
                    
                    {/* Status Overlay */}
                    {!restaurant.isOpen && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <span className="text-white text-sm font-semibold">Closed</span>
                      </div>
                    )}

                    {/* Promoted Badge */}
                    {restaurant.isPromoted && (
                      <div className="absolute top-2 left-2">
                        <Badge className="bg-accent-leaf-green text-primary-dark-green text-xs px-2 py-1 rounded-full font-semibold">
                          <Zap className="w-3 h-3 mr-1" />
                          Promoted
                        </Badge>
                      </div>
                    )}

                    {/* Discount Badge */}
                    {restaurant.discount && (
                      <div className="absolute bottom-2 left-2">
                        <Badge className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                          {restaurant.discount}
                        </Badge>
                      </div>
                    )}
                  </div>

                  {/* Restaurant Details */}
                  <div className="flex-1 p-4 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-lg text-gray-900 truncate group-hover:text-primary-dark-green transition-colors">
                          {restaurant.name}
                        </h3>
                        <p className="text-sm text-gray-600 truncate">
                          {restaurant.cuisineTypes.slice(0, 3).join(', ')}
                        </p>
                      </div>
                      
                      {/* Favorite Button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => handleFavoriteClick(e, restaurant)}
                        className={cn(
                          "w-8 h-8 p-0 rounded-full transition-all duration-200 ml-2 flex-shrink-0",
                          restaurant.isFavorite
                            ? "text-red-500 hover:text-red-600 hover:bg-red-50"
                            : "text-gray-400 hover:text-red-500 hover:bg-red-50"
                        )}
                      >
                        <Heart className={cn(
                          "w-4 h-4",
                          restaurant.isFavorite && "fill-current"
                        )} />
                      </Button>
                    </div>

                    {/* Rating and Reviews */}
                    <div className="flex items-center gap-4 mb-3">
                      <div className="flex items-center gap-1 bg-green-50 px-2 py-1 rounded-lg">
                        <Star className="w-3 h-3 fill-green-500 text-green-500" />
                        <span className="text-sm font-semibold text-green-700">{restaurant.rating}</span>
                        <span className="text-xs text-gray-500">({restaurant.reviewCount})</span>
                      </div>
                      
                      <div className="flex items-center gap-1 text-gray-500">
                        <MapPin className="w-3 h-3" />
                        <span className="text-sm">{restaurant.distance.toFixed(1)}km away</span>
                      </div>
                    </div>

                    {/* Delivery Info */}
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{restaurant.deliveryTime}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Truck className="w-3 h-3" />
                          <span>
                            {restaurant.deliveryFee === 0 ? 'Free delivery' : `₹${restaurant.deliveryFee}`}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Additional Info */}
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-gray-500">
                        <span>₹{restaurant.avgCostForTwo} for two • </span>
                        <span>Min ₹{restaurant.minOrderAmount}</span>
                      </div>
                      
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <ArrowRight className="w-4 h-4 text-primary-dark-green" />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Link>
          </Card>
        ))}
      </div>

      {/* Load More Button */}
      {restaurants.length >= 10 && (
        <div className="flex justify-center mt-8">
          <Button 
            variant="outline" 
            className="border-primary-dark-green text-primary-dark-green hover:bg-primary-dark-green hover:text-white px-8 py-3 rounded-xl"
          >
            Load More Restaurants
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      )}
    </div>
  );
}
