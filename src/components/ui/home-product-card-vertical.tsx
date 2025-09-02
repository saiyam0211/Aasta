'use client';

import { cn } from '@/lib/utils';
import { Star, Clock } from 'lucide-react';
import type { Dish } from '@/types/dish';
import { SafeImage } from '@/components/ui/safe-image';
import { useCartStore } from '@/lib/store';

interface HomeProductCardProps {
  dish: Dish;
  onAdd: (dish: Dish) => void;
  className?: string;
  onClick?: (dish: Dish) => void;
  restaurantContext?: { id: string; name: string };
}

interface HomeProductCardListProps {
  dishes: Dish[];
  onAdd: (dish: Dish) => void;
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
    <span className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-red-200 px-2 py-1 text-[11px] text-gray-700">
      {children}
    </span>
  );
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function HomeProductCard({
  dish,
  onAdd,
  className,
  onClick,
  restaurantContext,
}: HomeProductCardProps) {
  const hasDiscount = !!dish.originalPrice && dish.originalPrice > dish.price;
  const discountPct = hasDiscount
    ? Math.round(
        ((dish.originalPrice! - dish.price) / dish.originalPrice!) * 100
      )
    : 0;

  const isVeg = Array.isArray(dish.dietaryTags)
    ? dish.dietaryTags.some((t) => /veg(an|etarian)?/i.test(t)) &&
      !dish.dietaryTags.some((t) => /non[-\s]?veg/i.test(t))
    : dish.isVegetarian;

  const getItemQuantityInCart = useCartStore((s) => s.getItemQuantityInCart);
  const addItem = useCartStore((s) => s.addItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);

  const quantity = getItemQuantityInCart(dish.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    const restaurant =
      restaurantContext ??
      ({
        id: `rest-${slugify(dish.restaurant)}`,
        name: dish.restaurant,
      } as any);
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
    // do not call onAdd here to avoid double-add
  };

  const handleIncrease = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateQuantity(dish.id, quantity + 1);
  };

  const handleDecrease = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateQuantity(dish.id, quantity - 1);
  };

  return (
    <div
      className={cn(
        'h-full cursor-pointer rounded-2xl border border-gray-100 bg-white p-3 shadow-sm',
        className
      )}
      onClick={() => onClick?.(dish)}
      role="button"
      aria-label={`View ${dish.name}`}
    >
      {/* Image with centered ADD overlay */}
      <div className="relative mb-6 h-36 w-full overflow-hidden rounded-xl bg-gray-100">
        <SafeImage
          src={dish.image}
          alt={dish.name}
          className="absolute inset-0 h-full w-full object-cover"
          fallbackSrc="/images/dish-placeholder.svg"
        />
      </div>

      {/* Chips row */}
      <div className="mb-2 flex items-center gap-2">
        <VegMark isVegetarian={isVeg} />
        <InfoChip>Best Sellers</InfoChip>
      </div>

      {/* Title */}
      <div className="mb-1 line-clamp-2 text-sm leading-5 font-semibold text-gray-900">
        {dish.name}
      </div>

      {/* Rating */}
      <div className="mb-2 flex items-center gap-1 text-gray-700">
        {/* <Star className="w-4 h-4 text-yellow-500 fill-yellow-400" /> */}
        {/* <span className="text-sm font-medium">{dish.rating}</span> */}
        <span className="text-sm text-gray-500">({dish.restaurant})</span>
      </div>

      {/* Discount */}
      {hasDiscount && (
        <div className="mb-1 text-[12px] font-semibold text-blue-600">
          {discountPct}% OFF
        </div>
      )}

      {/* Price row */}
      <div className="relative flex items-center justify-between">
        <div className="flex items-baseline gap-2">
          <span className="text-lg font-bold text-gray-900">₹{dish.price}</span>
          {dish.originalPrice && (
            <span className="text-xs text-gray-400 line-through">
              ₹{dish.originalPrice}
            </span>
          )}
        </div>
        <div className="absolute -bottom-5 left-35 -translate-x-1/2 border-10 border-white">
          {quantity > 0 ? (
            <div className="-gap-2 inline-flex h-9 items-center rounded-md border border-green-600/30 bg-white shadow">
              <button
                onClick={handleDecrease}
                className="h-6 w-6 rounded-md text-lg text-[#002a01]"
                aria-label={`Decrease ${dish.name}`}
              >
                −
              </button>
              <span className="text-md min-w-[1.5rem] text-center font-medium">
                {quantity}
              </span>
              <button
                onClick={handleIncrease}
                className="h-6 w-6 rounded-md text-lg text-[#002a01]"
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
  );
}

// New component for horizontal scrolling list
export function HomeProductCardList({
  dishes,
  onAdd,
  onClick,
  restaurantContext,
}: HomeProductCardListProps) {
  return (
    <div className="relative">
      <div className="scrollbar-hide flex gap-4 overflow-x-auto pb-4">
        {dishes.map((dish) => (
          <div key={dish.id} className="w-48 flex-shrink-0">
            <HomeProductCard
              dish={dish}
              onAdd={onAdd}
              onClick={onClick}
              restaurantContext={restaurantContext}
            />
          </div>
        ))}
      </div>

      <style jsx>{`
        /* Hide scrollbar for Chrome, Safari and Opera */
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }

        /* Hide scrollbar for IE, Edge and Firefox */
        .scrollbar-hide {
          -ms-overflow-style: none; /* IE and Edge */
          scrollbar-width: none; /* Firefox */
        }
      `}</style>
    </div>
  );
}
