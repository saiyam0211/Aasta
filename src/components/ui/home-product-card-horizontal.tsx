'use client';

import { cn } from '@/lib/utils';
import type { Dish } from '@/types/dish';
import { SafeImage } from '@/components/ui/safe-image';
import { Clock, MapPin } from 'lucide-react';
import { useCartStore } from '@/lib/store';

interface HomeProductCardHorizontalProps {
  dish: Dish;
  onAdd: (dish: Dish) => void;
  className?: string;
  onClick?: (dish: Dish) => void;
  restaurantContext?: { id: string; name: string };
}

function VegMark({ isVegetarian }: { isVegetarian: boolean }) {
  return (
    <span
      className={cn(
        'inline-flex h-4 w-4 items-center justify-center rounded-sm border-2',
        isVegetarian ? 'border-green-600 bg-white' : 'border-red-600 bg-white'
      )}
    >
      <span
        className={cn(
          'h-2 w-2 rounded-full',
          isVegetarian ? 'bg-green-600' : 'bg-red-600'
        )}
      />
    </span>
  );
}

function InfoChip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-gray-100 px-2 py-1 text-[11px] text-gray-700">
      {children}
    </span>
  );
}

export function HomeProductCardHorizontal({
  dish,
  onAdd,
  className,
  onClick,
  restaurantContext,
}: HomeProductCardHorizontalProps) {
  const getItemQuantityInCart = useCartStore((s) => s.getItemQuantityInCart);
  const addItem = useCartStore((s) => s.addItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const hasDiscount = !!dish.originalPrice && dish.originalPrice > dish.price;
  const discountPct = hasDiscount
    ? Math.round(
        ((dish.originalPrice! - dish.price) / dish.originalPrice!) * 100
      )
    : 0;
  const quantity = getItemQuantityInCart(dish.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    const restaurant =
      restaurantContext ??
      ({ id: `rest-${dish.restaurant}`, name: dish.restaurant } as any);
    const cartItem = {
      menuItemId: dish.id,
      menuItem: {
        id: dish.id,
        name: dish.name,
        price: dish.price,
        imageUrl: dish.image,
        originalPrice: dish.originalPrice,
      },
      quantity: 1,
      subtotal: dish.price,
    } as any;
    addItem(cartItem, restaurant);
    onAdd(dish);
  };

  return (
    <div
      className={cn(
        'cursor-pointer rounded-2xl border border-gray-100 bg-white p-3 shadow-sm',
        className
      )}
      onClick={() => onClick?.(dish)}
      role="button"
      aria-label={`View ${dish.name}`}
    >
      <div className="flex gap-3">
        <div className="relative h-36 w-36 flex-shrink-0 overflow-hidden rounded-xl bg-gray-100">
          <SafeImage
            src={dish.image}
            alt={dish.name}
            className="absolute inset-0 h-full w-full object-cover"
            fallbackSrc="/images/dish-placeholder.svg"
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center gap-2"></div>

          <div className="text-md flex justify-between font-semibold text-gray-900">
            {dish.name}
            <VegMark isVegetarian={!!dish.isVegetarian} />
          </div>
          <div className="line-clamp-1 text-sm text-gray-500">
            ({dish.restaurant})
          </div>

          {/* Discount */}
          {hasDiscount && (
            <div className="mt-12 text-[12px] font-semibold text-blue-600">
              {discountPct}% OFF
            </div>
          )}
          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-bold text-gray-900">
                ₹{dish.price}
              </span>
              {dish.originalPrice && (
                <span className="text-xs text-gray-400 line-through">
                  ₹{dish.originalPrice}
                </span>
              )}
            </div>
            {quantity > 0 ? (
              <div
                className="glass-liquid inline-flex items-center rounded-md border border-green-600/30 bg-white shadow"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    updateQuantity(dish.id, quantity - 1);
                  }}
                  className="h-8 w-8 rounded-md text-xl text-[#002a01]"
                  aria-label={`Decrease ${dish.name}`}
                >
                  −
                </button>
                <span className="min-w-[1.5rem] text-center text-lg font-medium">
                  {quantity}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    updateQuantity(dish.id, quantity + 1);
                  }}
                  className="h-8 w-8 rounded-md text-xl text-[#002a01]"
                  aria-label={`Increase ${dish.name}`}
                >
                  +
                </button>
              </div>
            ) : (
              <button
                onClick={handleAddToCart}
                className="h-8 rounded-md border border-green-600/30 bg-white px-4 text-xl font-semibold text-[#002a01] shadow"
                aria-label={`Add ${dish.name}`}
              >
                Add
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
