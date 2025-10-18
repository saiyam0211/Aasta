'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import {
  Star,
  Clock,
  Heart,
  MapPin,
  Zap,
  Truck,
  ChefHat,
  ArrowRight,
  Plus,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MobileRestaurantCardProps {
  id: string;
  name: string;
  cuisine: string;
  rating: number;
  deliveryTime: string;
  image: string;
  discount?: string;
  isFavorite?: boolean;
  isNewlyLaunched?: boolean;
  avgCost?: number;
  promoted?: boolean;
  className?: string;
  onFavoriteToggle?: (id: string, isFavorite: boolean) => void;
  onOrderNow?: (id: string) => void;
}

export function MobileRestaurantCard({
  id,
  name,
  cuisine,
  rating,
  deliveryTime,
  image,
  discount,
  isFavorite = false,
  isNewlyLaunched = false,
  avgCost,
  promoted = false,
  className,
  onFavoriteToggle,
  onOrderNow,
}: MobileRestaurantCardProps) {
  const router = useRouter();
  const [isPressed, setIsPressed] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [favoriteState, setFavoriteState] = useState(isFavorite);

  const handleFavoriteToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const newState = !favoriteState;
    setFavoriteState(newState);
    onFavoriteToggle?.(id, newState);
  };

  const handleOrderNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onOrderNow?.(id);
  };

  return (
    <Card
      className={cn(
        'group cursor-pointer overflow-hidden border-0 transition-all duration-300 ease-out',
        'bg-white shadow-md hover:shadow-xl',
        'mobile-card smooth-transition',
        isPressed && 'scale-[0.98]',
        className
      )}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      onTouchStart={() => setIsPressed(true)}
      onTouchEnd={() => setIsPressed(false)}
    >
      <div 
        onClick={() => {
          // Smooth client-side navigation - no page refresh
          router.push(`/restaurants/${id}`);
        }}
      >
        {/* Image Container */}
        <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
          {/* Image */}
          <img
            src={image}
            alt={name}
            className={cn(
              'h-full w-full object-cover transition-all duration-500',
              'group-hover:scale-105',
              imageLoaded ? 'opacity-100' : 'opacity-0'
            )}
            onLoad={() => setImageLoaded(true)}
          />

          {/* Loading Skeleton */}
          {!imageLoaded && (
            <div className="absolute inset-0 flex animate-pulse items-center justify-center bg-gray-200">
              <ChefHat className="h-12 w-12 text-gray-400" />
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
            {discount && (
              <Badge className="bg-red-500 px-3 py-1 font-semibold text-white shadow-lg">
                {discount}
              </Badge>
            )}
            {promoted && (
              <Badge className="bg-accent-leaf-green text-primary-dark-green px-3 py-1 font-semibold shadow-lg">
                <Zap className="mr-1 h-3 w-3" />
                Promoted
              </Badge>
            )}
            {isNewlyLaunched && (
              <Badge className="bg-blue-500 px-3 py-1 font-semibold text-white shadow-lg">
                New
              </Badge>
            )}
          </div>

          {/* Favorite Button */}
          <div className="absolute top-3 right-3 z-10">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleFavoriteToggle}
              className={cn(
                'h-10 w-10 rounded-full p-0 backdrop-blur-sm transition-all duration-200',
                'mobile-touch shadow-lg hover:scale-110',
                favoriteState
                  ? 'bg-red-500/90 text-white hover:bg-red-600'
                  : 'bg-white/90 text-gray-700 hover:bg-white'
              )}
            >
              <Heart
                className={cn('h-5 w-5', favoriteState && 'fill-current')}
              />
            </Button>
          </div>

          {/* Quick Order Button - Appears on Hover/Touch */}
          <div className="absolute right-3 bottom-3 translate-y-2 transform opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            <Button
              onClick={handleOrderNow}
              size="sm"
              className="bg-primary-dark-green rounded-full px-4 py-2 font-semibold text-white shadow-lg hover:bg-green-800 hover:shadow-xl"
            >
              <Plus className="mr-1 h-4 w-4" />
              Quick Add
            </Button>
          </div>
        </div>

        {/* Content */}
        <CardContent className="p-4">
          {/* Header */}
          <div className="mb-3 flex items-start justify-between">
            <div className="min-w-0 flex-1">
              <h3 className="group-hover:text-primary-dark-green truncate text-lg font-bold text-gray-900 transition-colors">
                {name}
              </h3>
              <p className="truncate text-sm text-gray-600">{cuisine}</p>
            </div>
            <div className="ml-2 flex flex-shrink-0 items-center space-x-1 rounded-lg bg-green-50 px-2 py-1">
              <Star className="h-4 w-4 fill-green-500 text-green-500" />
              <span className="text-sm font-semibold text-green-700">
                {rating}
              </span>
            </div>
          </div>

          {/* Details */}
          <div className="mb-4 flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center space-x-1">
              <Clock className="h-4 w-4" />
              <span>{deliveryTime}</span>
            </div>
            {avgCost && (
              <div className="flex items-center space-x-1">
                <span>₹{avgCost} for two</span>
              </div>
            )}
          </div>

          {/* Action Button */}
          <Button
            onClick={handleOrderNow}
            className="bg-primary-dark-green w-full rounded-xl py-3 font-semibold text-white shadow-md transition-all duration-200 group-hover:scale-[1.02] hover:bg-green-800 hover:shadow-lg"
          >
            Order Now
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardContent>
      </div>
    </Card>
  );
}
