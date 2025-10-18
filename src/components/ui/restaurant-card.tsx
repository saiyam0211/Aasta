'use client';

import { cn } from '@/lib/utils';
import { SafeImage } from '@/components/ui/safe-image';
import { Star, Clock, MapPin } from 'lucide-react';
import Link from 'next/link';
import { useRef, useState, useEffect } from 'react';
import { useLocationStore } from '@/hooks/useLocation';
import { googleMapsService } from '@/lib/google-maps';
import Lottie from 'lottie-react';
import closedAnim from '../../../public/lotties/closed.json';
import { useRouter } from 'next/navigation';

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
  // Add these properties for distance calculation
  latitude?: number | null;
  longitude?: number | null;
  averagePreparationTime?: number;
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
    <span className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white/90 px-2 py-1 text-[11px] text-gray-900 shadow">
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
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [distanceText, setDistanceText] = useState<string | null>(null);
  const { latitude, longitude } = useLocationStore();

  const items =
    restaurant.featuredItems && restaurant.featuredItems.length > 0
      ? restaurant.featuredItems
      : undefined;
  const current = items ? items[index % items.length] : undefined;
  const heroFallback =
    restaurant.bannerImage ||
    restaurant.imageUrl ||
    '/images/restaurant-placeholder.svg';
  const heroImage = current?.image || heroFallback;

  // Calculate distance using Google Maps
  useEffect(() => {
    const calculateDistance = async () => {
      if (!restaurant || !latitude || !longitude) return;

      const rLat = restaurant.latitude;
      const rLng = restaurant.longitude;

      if (typeof rLat !== 'number' || typeof rLng !== 'number') {
        // Fallback to existing distanceKm if coordinates not available
        if (typeof restaurant.distanceKm === 'number') {
          const km = restaurant.distanceKm;
          const text =
            km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`;
          setDistanceText(text);
        }
        return;
      }

      try {
        const metrics = await googleMapsService.calculateDeliveryMetrics(
          rLat,
          rLng,
          latitude,
          longitude,
          restaurant.averagePreparationTime || 20
        );
        const km = metrics.distance;
        const text =
          km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`;
        setDistanceText(text);
      } catch (e) {
        console.error('Error calculating distance:', e);
        // Fallback to existing distanceKm
        if (typeof restaurant.distanceKm === 'number') {
          const km = restaurant.distanceKm;
          const text =
            km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`;
          setDistanceText(text);
        }
      }
    };

    calculateDistance();
  }, [
    restaurant.latitude,
    restaurant.longitude,
    latitude,
    longitude,
    restaurant.averagePreparationTime,
    restaurant.distanceKm,
  ]);

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
        'w-full overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-md',
        restaurant.isOpen === false ? 'cursor-not-allowed' : 'cursor-pointer',
        className
      )}
      onClick={() => {
        if (restaurant.isOpen === false) return;
        // Smooth client-side navigation - no page refresh
        if (href) {
          router.push(href);
        }
        onClick?.(restaurant.id);
      }}
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
          className={cn(
            'absolute inset-0 h-full w-full object-cover',
            restaurant.isOpen === false ? 'opacity-70' : undefined
          )}
          fallbackSrc="/images/restaurant-placeholder.svg"
        />
        {/* Closed Lottie on top when restaurant is inactive */}
        {restaurant.isOpen === false && (
          <div className="pointer-events-none absolute -top-35 left-1/2 z-20 -translate-x-1/2">
            <Lottie animationData={closedAnim as any} loop autoplay style={{ width: 400, height: 400 }} />
          </div>
        )}
        {/* Featured dish chip */}
        {current && (
          <div className="absolute top-3 left-3">
            <InfoChip>
              <span className="line-clamp-1 max-w-[150px] font-medium">
                {current.name}
              </span>
              <span className="font-bold">₹{current.price}</span>
            </InfoChip>
          </div>
        )}
        {/* Dots */}
        {items && items.length > 1 && (
          <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1">
            {items.map((_, i) => (
              <span
                key={i}
                className={cn(
                  'h-1.5 w-1.5 rounded-full',
                  i === index ? 'bg-white' : 'bg-white/60'
                )}
              />
            ))}
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-4">
        <div className="mb-2 flex items-start justify-between">
          <div>
            <div className="mb-2 line-clamp-1 text-2xl leading-5 font-semibold text-gray-900">
              {restaurant.name}
            </div>
            {restaurant.isOpen === false && (
              <div className="inline-flex items-center gap-1 rounded-md bg-red-50 px-2 py-0.5 text-[11px] font-medium text-red-700">
                Closed currently
              </div>
            )}
            {/* {restaurant.cuisineTypes && restaurant.cuisineTypes.length > 0 && (
              <div className="mt-1 line-clamp-1 text-xs text-gray-500">
                {restaurant.cuisineTypes.join(', ')}
              </div>
            )} */}
          </div>
        </div>

        <div className="flex flex-col text-xs text-gray-600">
          <div className="mb-2 flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>
              {typeof restaurant.estimatedDeliveryTime === 'string'
                ? restaurant.estimatedDeliveryTime
                : `${restaurant.estimatedDeliveryTime ?? '--'} min`}
            </span>
          </div>
          {/* Show calculated distance or fallback to existing distanceKm */}
          {distanceText && (
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span>{distanceText}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (href && restaurant.isOpen !== false) {
    return (
      <Link href={href} className="block">
        {content}
      </Link>
    );
  }

  return content;
}
