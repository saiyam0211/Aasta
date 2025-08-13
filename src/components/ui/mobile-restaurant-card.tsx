"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Star, 
  Clock, 
  Heart, 
  MapPin, 
  Zap, 
  Truck,
  ChefHat,
  ArrowRight,
  Plus
} from "lucide-react";
import { cn } from "@/lib/utils";

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
        "overflow-hidden transition-all duration-300 ease-out cursor-pointer border-0 group",
        "bg-white shadow-md hover:shadow-xl",
        "mobile-card smooth-transition",
        isPressed && "scale-[0.98]",
        className
      )}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      onTouchStart={() => setIsPressed(true)}
      onTouchEnd={() => setIsPressed(false)}
    >
      <Link href={`/restaurants/${id}`}>
        {/* Image Container */}
        <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
          {/* Image */}
          <img
            src={image}
            alt={name}
            className={cn(
              "w-full h-full object-cover transition-all duration-500",
              "group-hover:scale-105",
              imageLoaded ? "opacity-100" : "opacity-0"
            )}
            onLoad={() => setImageLoaded(true)}
          />
          
          {/* Loading Skeleton */}
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
              <ChefHat className="w-12 h-12 text-gray-400" />
            </div>
          )}
          
          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
            {discount && (
              <Badge className="bg-red-500 text-white shadow-lg font-semibold px-3 py-1">
                {discount}
              </Badge>
            )}
            {promoted && (
              <Badge className="bg-accent-leaf-green text-primary-dark-green shadow-lg font-semibold px-3 py-1">
                <Zap className="w-3 h-3 mr-1" />
                Promoted
              </Badge>
            )}
            {isNewlyLaunched && (
              <Badge className="bg-blue-500 text-white shadow-lg font-semibold px-3 py-1">
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
                "w-10 h-10 p-0 rounded-full backdrop-blur-sm transition-all duration-200",
                "mobile-touch shadow-lg hover:scale-110",
                favoriteState
                  ? "bg-red-500/90 hover:bg-red-600 text-white"
                  : "bg-white/90 hover:bg-white text-gray-700"
              )}
            >
              <Heart className={cn(
                "w-5 h-5",
                favoriteState && "fill-current"
              )} />
            </Button>
          </div>
          
          {/* Quick Order Button - Appears on Hover/Touch */}
          <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
            <Button
              onClick={handleOrderNow}
              size="sm"
              className="bg-primary-dark-green hover:bg-green-800 text-white shadow-lg hover:shadow-xl rounded-full px-4 py-2 font-semibold"
            >
              <Plus className="w-4 h-4 mr-1" />
              Quick Add
            </Button>
          </div>
        </div>
        
        {/* Content */}
        <CardContent className="p-4">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-lg text-gray-900 truncate group-hover:text-primary-dark-green transition-colors">
                {name}
              </h3>
              <p className="text-gray-600 text-sm truncate">{cuisine}</p>
            </div>
            <div className="flex items-center space-x-1 bg-green-50 px-2 py-1 rounded-lg ml-2 flex-shrink-0">
              <Star className="w-4 h-4 fill-green-500 text-green-500" />
              <span className="text-sm font-semibold text-green-700">{rating}</span>
            </div>
          </div>
          
          {/* Details */}
          <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
            <div className="flex items-center space-x-1">
              <Clock className="w-4 h-4" />
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
            className="w-full bg-primary-dark-green hover:bg-green-800 text-white rounded-xl py-3 font-semibold transition-all duration-200 group-hover:scale-[1.02] shadow-md hover:shadow-lg"
          >
            Order Now
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </CardContent>
      </Link>
    </Card>
  );
}
