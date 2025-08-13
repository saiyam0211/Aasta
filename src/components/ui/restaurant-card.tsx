"use client";

import { cn } from "@/lib/utils";
import { SafeImage } from "@/components/ui/safe-image";
import { Star, Clock, MapPin } from "lucide-react";
import Link from "next/link";
import { useRef, useState } from "react";

export interface RestaurantSummary {
  id: string;
  name: string;
  imageUrl?: string;
  bannerImage?: string;
  logoImage?: string;
  cuisineTypes?: string[];
  rating?: number;
  estimatedDeliveryTime?: number | string | null;
  distanceKm?: number | null;
  minimumOrderAmount?: number | null;
  isOpen?: boolean;
  featuredItems?: { name: string; price: number; image: string }[];
}

interface RestaurantCardProps {
  restaurant: RestaurantSummary;
  href?: string; // optional link to restaurant page
  onClick?: (id: string) => void;
  onFavoriteToggle?: (id: string, isFavorite: boolean) => void;
  isFavorite?: boolean;
  className?: string;
}

function InfoChip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded-full bg-white/90 text-gray-900 border border-gray-200 shadow">
      {children}
    </span>
  );
}

export function RestaurantCard({
  restaurant,
  href,
  onClick,
  onFavoriteToggle,
  isFavorite = false,
  className,
}: RestaurantCardProps) {
  const [index, setIndex] = useState(0);
  const items = restaurant.featuredItems && restaurant.featuredItems.length > 0 ? restaurant.featuredItems : undefined;
  const current = items ? items[index % items.length] : undefined;
  const heroFallback = restaurant.bannerImage || restaurant.imageUrl || "/images/restaurant-placeholder.svg";
  const heroImage = current?.image || heroFallback;

  // Swipe handling
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const onTouchStart: React.TouchEventHandler<HTMLDivElement> = (e) => {
    touchStartX.current = e.touches[0].clientX;
    touchEndX.current = null;
  };
  const onTouchMove: React.TouchEventHandler<HTMLDivElement> = (e) => {
    touchEndX.current = e.touches[0].clientX;
  };
  const onTouchEnd: React.TouchEventHandler<HTMLDivElement> = (e) => {
    const start = touchStartX.current;
    const end = touchEndX.current;
    if (start == null || end == null) return;
    const dx = end - start;
    const threshold = 40; // pixels
    if (Math.abs(dx) > threshold && items && items.length > 1) {
      if (dx < 0) {
        setIndex((i) => (i + 1) % items.length);
      } else {
        setIndex((i) => (i - 1 + items.length) % items.length);
      }
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  const content = (
    <div
      className={cn(
        "w-full bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden",
        className
      )}
      onClick={() => onClick?.(restaurant.id)}
    >
      {/* Image with swipe */}
      <div
        className="relative h-40 bg-gray-100 select-none"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <SafeImage
          key={index}
          src={heroImage}
          alt={restaurant.name}
          className="absolute inset-0 w-full h-full object-cover"
          fallbackSrc="/images/restaurant-placeholder.svg"
        />
        {/* Featured dish chip */}
        {current && (
          <div className="absolute top-3 left-3">
            <InfoChip>
              <span className="font-medium line-clamp-1 max-w-[150px]">{current.name}</span>
              <span className="font-bold">₹{current.price}</span>
            </InfoChip>
          </div>
        )}
        {/* Dots */}
        {items && items.length > 1 && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
            {items.map((_, i) => (
              <span key={i} className={cn("w-1.5 h-1.5 rounded-full", i === index ? "bg-white" : "bg-white/60")} />)
            )}
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div>
            <div className="font-semibold text-gray-900 text-base leading-5 line-clamp-1">
              {restaurant.name}
            </div>
            {restaurant.cuisineTypes && restaurant.cuisineTypes.length > 0 && (
              <div className="text-xs text-gray-500 mt-1 line-clamp-1">
                {restaurant.cuisineTypes.join(", ")}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-gray-600">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-yellow-500 fill-yellow-400" />
            <span>{restaurant.rating ?? "--"}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>
              {typeof restaurant.estimatedDeliveryTime === 'string'
                ? restaurant.estimatedDeliveryTime
                : `${restaurant.estimatedDeliveryTime ?? "--"} min`}
            </span>
          </div>
          {restaurant.distanceKm != null && (
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              <span>{restaurant.distanceKm.toFixed(1)} km</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block">
        {content}
      </Link>
    );
  }

  return content;
} 