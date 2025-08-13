"use client";

import { useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Dish } from "@/types/dish";
import { DishCard } from "@/components/ui/dish-card";

interface FeaturedDishesProps {
  dishes: Dish[];
  onAddToCart: (dish: Dish) => void;
  className?: string;
}

export function FeaturedDishes({ dishes, onAddToCart, className }: FeaturedDishesProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  if (!dishes.length) return null;

  return (
    <div className={cn("w-full", className)}>
      {/* Section Header - Professional */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Featured Dishes</h2>
          <p className="text-gray-600 text-sm mt-1">Popular dishes from top restaurants</p>
        </div>
      </div>

      {/* Horizontal Scrollable Grid */}
      <div ref={scrollRef} className="flex gap-4 overflow-x-auto scrollbar-hide pb-2" style={{ scrollSnapType: "x mandatory" }}>
        {dishes.map((dish) => (
          <DishCard key={dish.id} dish={dish} onAddToCart={onAddToCart} />
        ))}

        {/* Show More Card */}
        <Card className="flex-none w-[200px] bg-gray-50 border-2 border-dashed border-gray-300 hover:border-primary-dark-green hover:bg-gray-100 transition-all duration-200 rounded-2xl cursor-pointer">
          <CardContent className="flex items-center justify-center h-full p-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary-dark-green/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <Plus className="w-6 h-6 text-primary-dark-green" />
              </div>
              <p className="text-sm font-medium text-gray-700 mb-1">View More</p>
              <p className="text-xs text-gray-500">Featured Dishes</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
