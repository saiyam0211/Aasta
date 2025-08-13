'use client';

import { useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Dish } from '@/types/dish';
import { DishCard } from '@/components/ui/dish-card';

interface FeaturedDishesProps {
  dishes: Dish[];
  onAddToCart: (dish: Dish) => void;
  className?: string;
}

export function FeaturedDishes({
  dishes,
  onAddToCart,
  className,
}: FeaturedDishesProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  if (!dishes.length) return null;

  return (
    <div className={cn('w-full', className)}>
      {/* Section Header - Professional */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Featured Dishes</h2>
          <p className="mt-1 text-sm text-gray-600">
            Popular dishes from top restaurants
          </p>
        </div>
      </div>

      {/* Horizontal Scrollable Grid */}
      <div
        ref={scrollRef}
        className="scrollbar-hide flex gap-4 overflow-x-auto pb-2"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {dishes.map((dish) => (
          <DishCard key={dish.id} dish={dish} onAddToCart={onAddToCart} />
        ))}

        {/* Show More Card */}
        <Card className="hover:border-primary-dark-green w-[200px] flex-none cursor-pointer rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 transition-all duration-200 hover:bg-gray-100">
          <CardContent className="flex h-full items-center justify-center p-6">
            <div className="text-center">
              <div className="bg-primary-dark-green/10 mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full">
                <Plus className="text-primary-dark-green h-6 w-6" />
              </div>
              <p className="mb-1 text-sm font-medium text-gray-700">
                View More
              </p>
              <p className="text-xs text-gray-500">Featured Dishes</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
