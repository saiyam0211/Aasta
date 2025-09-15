'use client';

import { Card, CardContent } from '@/components/ui/card';
import { SafeImage } from '@/components/ui/safe-image';
import { cn } from '@/lib/utils';
import { Star, Clock } from 'lucide-react';
import type { Dish } from '@/types/dish';

interface DishCardProps {
  dish: Dish;
  onAddToCart: (dish: Dish) => void;
  className?: string;
}

function VegMark({ isVegetarian }: { isVegetarian: boolean }) {
  return (
    <div
      className={cn(
        'flex h-4 w-4 items-center justify-center rounded-sm border-2',
        isVegetarian ? 'border-green-600 bg-white' : 'border-red-600 bg-white'
      )}
    >
      <div
        className={cn(
          'h-2 w-2 rounded-full',
          isVegetarian ? 'bg-green-600' : 'bg-red-600'
        )}
      />
    </div>
  );
}

function InfoChip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-gray-100 px-2 py-1 text-[11px] text-gray-700">
      {children}
    </span>
  );
}

export function DishCard({ dish, onAddToCart, className }: DishCardProps) {
  const hasDiscount = !!dish.originalPrice && dish.originalPrice > dish.price;
  const discountPct = hasDiscount
    ? Math.round(
        ((dish.originalPrice! - dish.price) / dish.originalPrice!) * 100
      )
    : 0;

  const isVeg = Array.isArray(dish.dietaryTags)
    ? dish.dietaryTags.includes('Veg')
    : dish.isVegetarian;

  const highlights = (dish.description || '')
    .split(/[.•\n]/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 2);

  return (
    <Card
      key={dish.id}
      className={cn(
        'w-[280px] flex-none overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm transition-all duration-200 hover:shadow-md',
        className
      )}
      style={{ scrollSnapAlign: 'start' }}
    >
      {/* Image with ADD overlay */}
      <div className="relative">
        <div className="relative aspect-[4/3] overflow-hidden">
          <SafeImage
            src={dish.image}
            alt={dish.name}
            className="h-full w-full object-cover"
            fallbackSrc="/images/dish-placeholder.svg"
          />

          {/* ADD overlay */}
          <div className="absolute -bottom-5 left-1/2 -translate-x-1/2">
            <button
              onClick={() => onAddToCart(dish)}
              className="h-9 rounded-2xl border border-green-600/30 bg-white px-6 font-semibold text-green-700 shadow"
            >
              ADD
            </button>
            {dish.description && (
              <div className="mt-1 text-center text-[10px] text-gray-500">
                customisable
              </div>
            )}
          </div>
        </div>
      </div>

      <CardContent className="px-4 pt-7 pb-4">
        {/* Chips row */}
        <div className="mb-2 flex items-center gap-2">
          <VegMark isVegetarian={isVeg} />
          <InfoChip>
            <Clock className="h-3 w-3" /> {dish.preparationTime} mins
          </InfoChip>
        </div>

        {/* Title */}
        <h3 className="mb-1 line-clamp-2 text-[16px] leading-5 font-semibold text-gray-900">
          {dish.name}
        </h3>

        {/* Rating */}
        <div className="mb-2 flex items-center gap-1 text-gray-700">
          <Star className="h-4 w-4 fill-yellow-400 text-yellow-500" />
          <span className="text-sm font-medium">{dish.rating}</span>
          <span className="text-sm text-gray-500">({dish.restaurant})</span>
        </div>

        {/* Highlights bullets */}
        {highlights.length > 0 && (
          <ul className="mb-2 space-y-1">
            {highlights.map((h, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-sm text-gray-600"
              >
                <span className="text-gray-400">◆</span>
                <span className="leading-5">{h}</span>
              </li>
            ))}
          </ul>
        )}

        {/* Discount */}
        {hasDiscount && (
          <div className="mb-1 text-[12px] font-semibold text-blue-600">
            {discountPct}% OFF
          </div>
        )}

        {/* Price row */}
        <div className="flex items-baseline gap-2">
          <span className="text-xl font-extrabold text-gray-900">
            ₹{dish.price}
          </span>
          {dish.originalPrice && (
            <span className="text-sm text-gray-500 line-through">
              ₹{dish.originalPrice}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
