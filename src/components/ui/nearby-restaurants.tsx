'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import { navigationService } from '@/lib/navigation-service';
import {
  Star,
  Clock,
  MapPin,
  Heart,
  Zap,
  Truck,
  ArrowRight,
  ChefHat,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { SafeImage } from '@/components/ui/safe-image';

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
  className,
}: NearbyRestaurantsProps) {
  const router = useRouter();
  const handleFavoriteClick = (e: React.MouseEvent, restaurant: Restaurant) => {
    e.preventDefault();
    e.stopPropagation();
    onFavoriteToggle?.(restaurant.id, !restaurant.isFavorite);
  };

  if (!restaurants.length) {
    return (
      <div className={cn('w-full', className)}>
        <div className="py-12 text-center">
          <ChefHat className="mx-auto mb-4 h-16 w-16 text-gray-400" />
          <h3 className="mb-2 text-lg font-semibold text-gray-900">
            No restaurants nearby
          </h3>
          <p className="text-gray-600">
            Try adjusting your location or search area
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('w-full', className)}>
      {/* Section Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Restaurants Near You
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            {restaurants.length} restaurants within 5km
          </p>
        </div>
      </div>

      {/* Restaurant List */}
      <div className="space-y-4">
        {restaurants.map((restaurant) => (
          <Card
            key={restaurant.id}
            className="group cursor-pointer overflow-hidden rounded-2xl border-0 bg-white shadow-md transition-all duration-300 hover:shadow-xl"
            onClick={() => onRestaurantClick?.(restaurant.id)}
          >
            <div 
              className="block cursor-pointer"
              onClick={() => {
                // Instant navigation with feedback
                const href = `/restaurants/${restaurant.id}`;
                navigationService.startNavigation(href);
                setTimeout(() => router.push(href), 50);
              }}
            >
              <CardContent className="p-0">
                <div className="flex">
                  {/* Restaurant Image */}
                  <div className="relative h-32 w-32 flex-shrink-0 sm:h-32 sm:w-40">
                    <SafeImage
                      src={restaurant.image}
                      alt={restaurant.name}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      fallbackSrc="/images/restaurant-placeholder.svg"
                    />

                    {/* Status Overlay */}
                    {!restaurant.isOpen && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                        <span className="text-sm font-semibold text-white">
                          Closed
                        </span>
                      </div>
                    )}

                    {/* Promoted Badge */}
                    {restaurant.isPromoted && (
                      <div className="absolute top-2 left-2">
                        <Badge className="bg-accent-leaf-green text-primary-dark-green rounded-full px-2 py-1 text-xs font-semibold">
                          <Zap className="mr-1 h-3 w-3" />
                          Promoted
                        </Badge>
                      </div>
                    )}

                    {/* Discount Badge */}
                    {restaurant.discount && (
                      <div className="absolute bottom-2 left-2">
                        <Badge className="rounded-full bg-red-500 px-2 py-1 text-xs font-semibold text-white">
                          {restaurant.discount}
                        </Badge>
                      </div>
                    )}
                  </div>

                  {/* Restaurant Details */}
                  <div className="min-w-0 flex-1 p-4">
                    <div className="mb-2 flex items-start justify-between">
                      <div className="min-w-0 flex-1">
                        <h3 className="group-hover:text-primary-dark-green truncate text-lg font-bold text-gray-900 transition-colors">
                          {restaurant.name}
                        </h3>
                        <p className="truncate text-sm text-gray-600">
                          {restaurant.cuisineTypes.slice(0, 3).join(', ')}
                        </p>
                      </div>

                      {/* Favorite Button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => handleFavoriteClick(e, restaurant)}
                        className={cn(
                          'ml-2 h-8 w-8 flex-shrink-0 rounded-full p-0 transition-all duration-200',
                          restaurant.isFavorite
                            ? 'text-red-500 hover:bg-red-50 hover:text-red-600'
                            : 'text-gray-400 hover:bg-red-50 hover:text-red-500'
                        )}
                      >
                        <Heart
                          className={cn(
                            'h-4 w-4',
                            restaurant.isFavorite && 'fill-current'
                          )}
                        />
                      </Button>
                    </div>

                    {/* Rating and Reviews */}
                    <div className="mb-3 flex items-center gap-4">
                      <div className="flex items-center gap-1 rounded-lg bg-green-50 px-2 py-1">
                        <Star className="h-3 w-3 fill-green-500 text-green-500" />
                        <span className="text-sm font-semibold text-green-700">
                          {restaurant.rating}
                        </span>
                        <span className="text-xs text-gray-500">
                          ({restaurant.reviewCount})
                        </span>
                      </div>

                      <div className="flex items-center gap-1 text-gray-500">
                        <MapPin className="h-3 w-3" />
                        <span className="text-sm">
                          {restaurant.distance.toFixed(1)}km away
                        </span>
                      </div>
                    </div>

                    {/* Delivery Info */}
                    <div className="mb-3 flex items-center justify-between text-sm text-gray-600">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{restaurant.deliveryTime}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Truck className="h-3 w-3" />
                          <span>
                            {restaurant.deliveryFee === 0
                              ? 'Free delivery'
                              : `₹${restaurant.deliveryFee}`}
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

                      <div className="opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                        <ArrowRight className="text-primary-dark-green h-4 w-4" />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </div>
          </Card>
        ))}
      </div>

      {/* Load More Button */}
      {restaurants.length >= 10 && (
        <div className="mt-8 flex justify-center">
          <Button
            variant="outline"
            className="border-primary-dark-green text-primary-dark-green hover:bg-primary-dark-green rounded-xl px-8 py-3 hover:text-white"
          >
            Load More Restaurants
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
