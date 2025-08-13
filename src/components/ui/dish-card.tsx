"use client";

import { Card, CardContent } from "@/components/ui/card";
import { SafeImage } from "@/components/ui/safe-image";
import { cn } from "@/lib/utils";
import { Star, Clock } from "lucide-react";
import type { Dish } from "@/types/dish";

interface DishCardProps {
  dish: Dish;
  onAddToCart: (dish: Dish) => void;
  className?: string;
}

function VegMark({ isVegetarian }: { isVegetarian: boolean }) {
  return (
    <div
      className={cn(
        "w-4 h-4 border-2 flex items-center justify-center rounded-sm",
        isVegetarian ? "border-green-600 bg-white" : "border-red-600 bg-white"
      )}
    >
      <div
        className={cn(
          "w-2 h-2 rounded-full",
          isVegetarian ? "bg-green-600" : "bg-red-600"
        )}
      />
    </div>
  );
}

function InfoChip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded-full bg-gray-100 text-gray-700 border border-gray-200">
      {children}
    </span>
  );
}

export function DishCard({ dish, onAddToCart, className }: DishCardProps) {
  const hasDiscount = !!dish.originalPrice && dish.originalPrice > dish.price;
  const discountPct = hasDiscount
    ? Math.round(((dish.originalPrice! - dish.price) / dish.originalPrice!) * 100)
    : 0;

  const isVeg = Array.isArray(dish.dietaryTags)
    ? dish.dietaryTags.some(t => /veg(an|etarian)?/i.test(t)) && !dish.dietaryTags.some(t => /non[-\s]?veg/i.test(t))
    : dish.isVegetarian;

  const highlights = (dish.description || "")
    .split(/[.•\n]/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 2);

  return (
    <Card
      key={dish.id}
      className={cn(
        "flex-none w-[280px] overflow-hidden bg-white shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 rounded-3xl",
        className
      )}
      style={{ scrollSnapAlign: "start" }}
    >
      {/* Image with ADD overlay */}
      <div className="relative">
        <div className="relative aspect-[4/3] overflow-hidden">
          <SafeImage
            src={dish.image}
            alt={dish.name}
            className="w-full h-full object-cover"
            fallbackSrc="/images/dish-placeholder.svg"
          />

          {/* ADD overlay */}
          <div className="absolute -bottom-5 left-1/2 -translate-x-1/2">
            <button
              onClick={() => onAddToCart(dish)}
              className="px-6 h-9 rounded-2xl bg-white text-green-700 font-semibold shadow border border-green-600/30"
            >
              ADD
            </button>
            {dish.description && (
              <div className="text-[10px] text-gray-500 text-center mt-1">customisable</div>
            )}
          </div>
        </div>
      </div>

      <CardContent className="pt-7 pb-4 px-4">
        {/* Chips row */}
        <div className="flex items-center gap-2 mb-2">
          <VegMark isVegetarian={isVeg} />
          <InfoChip>
            <Clock className="w-3 h-3" /> {dish.preparationTime} mins
          </InfoChip>
        </div>

        {/* Title */}
        <h3 className="font-semibold text-[16px] text-gray-900 leading-5 mb-1 line-clamp-2">
          {dish.name}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-2 text-gray-700">
          <Star className="w-4 h-4 text-yellow-500 fill-yellow-400" />
          <span className="text-sm font-medium">{dish.rating}</span>
          <span className="text-sm text-gray-500">({dish.restaurant})</span>
        </div>

        {/* Highlights bullets */}
        {highlights.length > 0 && (
          <ul className="mb-2 space-y-1">
            {highlights.map((h, i) => (
              <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                <span className="text-gray-400">◆</span>
                <span className="leading-5">{h}</span>
              </li>
            ))}
          </ul>
        )}

        {/* Discount */}
        {hasDiscount && (
          <div className="text-[12px] font-semibold text-blue-600 mb-1">{discountPct}% OFF</div>
        )}

        {/* Price row */}
        <div className="flex items-baseline gap-2">
          <span className="text-xl font-extrabold text-gray-900">₹{dish.price}</span>
          {dish.originalPrice && (
            <span className="text-sm text-gray-500 line-through">₹{dish.originalPrice}</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 