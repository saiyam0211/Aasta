"use client";

import { cn } from "@/lib/utils";
import { Star, Clock } from "lucide-react";
import type { Dish } from "@/types/dish";
import { SafeImage } from "@/components/ui/safe-image";

interface HomeProductCardProps {
  dish: Dish;
  onAdd: (dish: Dish) => void;
  className?: string;
}

function VegMark({ isVegetarian }: { isVegetarian: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center w-4 h-4 rounded-sm border-2",
        isVegetarian ? "border-green-600 bg-white" : "border-red-600 bg-white"
      )}
    >
      <span className={cn("w-2 h-2 rounded-full", isVegetarian ? "bg-green-600" : "bg-red-600")} />
    </span>
  );
}

function InfoChip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded-full bg-gray-100 text-gray-700 border border-gray-200">
      {children}
    </span>
  );
}

export function HomeProductCard({ dish, onAdd, className }: HomeProductCardProps) {
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
    <div className={cn("bg-white rounded-2xl p-3 shadow-sm border border-gray-100", className)}>
      {/* Image with centered ADD overlay */}
      <div className="relative w-full h-36 rounded-xl overflow-hidden mb-6 bg-gray-100">
        <SafeImage
          src={dish.image}
          alt={dish.name}
          className="absolute inset-0 w-full h-full object-cover"
          fallbackSrc="/images/dish-placeholder.svg"
        />
      </div>

      {/* Chips row */}
      <div className="flex items-center gap-2 mb-2">
        <VegMark isVegetarian={isVeg} />
        <InfoChip>
          {dish.distanceText ? (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z"/></svg>
              {dish.distanceText}
            </>
          ) : (
            <>
              <Clock className="w-3 h-3" /> {dish.preparationTime} mins
            </>
          )}
        </InfoChip>
      </div>

      {/* Title */}
      <div className="font-semibold text-gray-900 text-sm leading-5 line-clamp-2 mb-1">{dish.name}</div>

      {/* Rating */}
      <div className="flex items-center gap-1 mb-2 text-gray-700">
        {/* <Star className="w-4 h-4 text-yellow-500 fill-yellow-400" /> */}
        {/* <span className="text-sm font-medium">{dish.rating}</span> */}
        <span className="text-sm text-gray-500">({dish.restaurant})</span>
      </div>

      {/* Highlights bullets */}
      {/* {highlights.length > 0 && (
        <ul className="mb-2 space-y-1">
          {highlights.map((h, i) => (
            <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
              <span className="text-gray-400">◆</span>
              <span className="leading-5">{h}</span>
            </li>
          ))}
        </ul>
      )} */}

      {/* Discount */}
      {hasDiscount && <div className="text-[12px] font-semibold text-blue-600 mb-1">{discountPct}% OFF</div>}

      {/* Price row */}
      <div className="flex relative items-center justify-between">
        <div className="flex items-baseline gap-2">
          <span className="text-lg font-bold text-gray-900">₹{dish.price}</span>
          {dish.originalPrice && (
            <span className="text-xs text-gray-400 line-through">₹{dish.originalPrice}</span>
          )}
        </div>
        <div className="absolute border-10 border-white -bottom-5 left-35 -translate-x-1/2">
          <button
            onClick={() => onAdd(dish)}
            className="px-4 h-8 rounded-md glass-liquid bg-white text-green-700 font-semibold text-xl shadow border border-green-600/30"
            aria-label={`Add ${dish.name}`}
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
} 