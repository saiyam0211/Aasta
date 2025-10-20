'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Star, Minus, Plus } from 'lucide-react';
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

function VegMark({ isVegetarian }: { isVegetarian: boolean }) {
  return (
    <span
      className={cn(
        'inline-flex h-4 w-4 items-center justify-center rounded-sm border-1',
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
  const [clicked, setClicked] = useState(false);
  const [showDiscountText, setShowDiscountText] = useState(true); // true = percentage, false = amount saved

  const hasDiscount = !!dish.originalPrice && dish.originalPrice > dish.price;
  const discountPct = hasDiscount
    ? Math.round(
      ((dish.originalPrice! - dish.price) / dish.originalPrice!) * 100
    )
    : 0;
  const savedAmount = hasDiscount ? dish.originalPrice! - dish.price : 0;

  // Auto-toggle discount text every 5 seconds
  useEffect(() => {
    if (!hasDiscount) return;

    const interval = setInterval(() => {
      setShowDiscountText(prev => !prev);
    }, 5000);

    return () => clearInterval(interval);
  }, [hasDiscount]);

  // Prefer Non-Veg tag if both present; otherwise treat Veg/Vegetarian/Vegan as veg
  const tagsLower = Array.isArray(dish.dietaryTags)
    ? dish.dietaryTags.map((t) => String(t).toLowerCase())
    : [];
  const hasNonVegTag = tagsLower.some((t) => /(non[-\s]?veg)/i.test(t));
  const hasVegTag = tagsLower.some((t) => /(\bveg\b|vegetarian|vegan)/i.test(t));
  const isVeg = !hasNonVegTag && (hasVegTag || !!dish.isVegetarian);

  const getItemQuantityInCart = useCartStore((s) => s.getItemQuantityInCart);
  const addItem = useCartStore((s) => s.addItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);

  const quantity = getItemQuantityInCart(dish.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    const maxStock = (dish as any).stockLeft;
    const currentQty = quantity || 0;
    if (typeof maxStock === 'number' && maxStock >= 0 && currentQty + 1 > maxStock) {
      toast.error(`Only ${maxStock} left in stock`);
      return;
    }
    const restaurant =
      restaurantContext ??
      (dish.restaurantId
        ? ({ id: dish.restaurantId, name: dish.restaurant } as any)
        : ({ id: `rest-${slugify(dish.restaurant)}`, name: dish.restaurant } as any));
    const cartItem = {
      menuItemId: dish.id,
      menuItem: {
        id: dish.id,
        name: dish.name,
        price: dish.price,
        imageUrl: dish.image,
        originalPrice: dish.originalPrice,
        stockLeft: (dish as any).stockLeft,
      },
      quantity: 1,
      subtotal: dish.price,
    } as any;
    addItem(cartItem, restaurant);
    onAdd(dish);
  };

  const handleIncrease = (e: React.MouseEvent) => {
    e.stopPropagation();
    const maxStock = (dish as any).stockLeft;
    if (typeof maxStock === 'number' && maxStock >= 0 && quantity + 1 > maxStock) {
      toast.error(`Only ${maxStock} left in stock`);
      return;
    }
    updateQuantity(dish.id, quantity + 1);
  };

  const handleDecrease = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateQuantity(dish.id, quantity - 1);
  };

  // Click handler for card (preserves original onClick)
  const handleCardClick = () => {
    setClicked(true);
    onClick?.(dish);
    setTimeout(() => setClicked(false), 150);
  };

  return (
    <div
      className={cn(
        'cursor-pointer rounded-2xl bg-white p-auto transition-transform duration-150',
        // 'scale-100 hover:scale-120', // keep hover effect
        // clicked && 'scale-105', // add click effect
        className
      )}
      onClick={handleCardClick}
      role="button"
      aria-label={`View ${dish.name}`}
    >
      {/* Image with centered ADD overlay */}
      <div className="relative mb-4 h-40 w-auto overflow-hidden rounded-3xl shadow-none border-none mx-auto">

        <SafeImage
          src={dish.image}
          alt={dish.name}
          className={cn(
            "absolute inset-0 h-full w-full object-cover",
            dish.soldOut && "grayscale"
          )}
          fallbackSrc="/images/dish-placeholder.svg"
        />
        {dish.soldOut && (
          <img
            src="/images/sold-out.png"
            alt="Sold Out"
            className="absolute top-0 -right-4 object-contain h-full w-full z-20"
            style={{ pointerEvents: 'none' }}
          />
        )}

        {/* {!dish.soldOut && (
          <>
            <div className="absolute top-1 right-2 z-50">
              <VegMark isVegetarian={isVeg} />
            </div>
            <div className="h-10 w-10 bg-white z-40 absolute -top-1 rounded-bl-2xl -right-1" />

            <div className="absolute top-[0rem] right-[1.2rem] w-8 h-8 overflow-visible">
              <svg
                width="40"
                height="40"
                viewBox="0 0 40 40"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{ transform: "rotate(270deg)" }}
              >
                <path d="M40 0 A16 16 0 0 1 24 16 L40 16 Z" fill="white" />
              </svg>
            </div>

            <div className="absolute top-[2.2rem] -right-[1rem] w-8 h-8 overflow-visible">
              <svg
                width="40"
                height="40"
                viewBox="0 0 40 40"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{ transform: "rotate(270deg)" }}
              >
                <path d="M40 0 A16 16 0 0 1 24 16 L40 16 Z" fill="white" />
              </svg>
            </div>
          </>
        )} */}
      </div>

      {/* Chips row: show distance hidden for now! */}
      {/* <div className="mb-2 flex items-center gap-2">
        {dish.distanceText && (
          <InfoChip>
            <>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-3 w-3"
              >
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z" />
              </svg>
              {dish.distanceText}
            </>
          </InfoChip>
        )}
      </div> */}

      {/* Title + VegMark in one row */}
      <div className=" flex items-start justify-between px-2">
        <div className="flex-1 min-w-0">
          <div className="ml-0.5 text-lg my-1 leading-5 font-semibold text-gray-900">
            {dish.name}
          </div>
          <div className="mb-1 flex items-center gap-1 text-gray-700">
            <span className="text-md text-gray-500">({dish.restaurant})</span>
          </div>
        </div>
        <div className="flex-shrink-0 pl-2 pt-0.5">
          <VegMark isVegetarian={isVeg} />
        </div>
      </div>


      {/* Discount */}
      {hasDiscount && (
        <div className=" h-4 text-[13.5px] font-semibold text-blue-600 relative overflow-hidden px-2">
          <div
            className={cn(
              "absolute inset-0 flex items-center transition-all duration-500 ease-in-out px-2",
              showDiscountText
                ? "transform translate-y-0 opacity-100"
                : "transform -translate-y-full opacity-0"
            )}
          >
            {discountPct}% OFF
          </div>
          <div
            className={cn(
              "absolute inset-0 flex items-center transition-all duration-500 ease-in-out px-2",
              !showDiscountText
                ? "transform translate-y-0 opacity-100"
                : "transform translate-y-full opacity-0"
            )}
          >
            You'll save ₹{savedAmount}
          </div>
        </div>
      )}

      {/* Price row */}
      <div className="relative flex items-center justify-between px-2">
        <div className="mt-2 flex flex-col items-baseline">
          {dish.originalPrice && (
            <span className="text-md text-gray-400 line-through">
              ₹{dish.originalPrice}
            </span>
          )}
          <span className="text-xl font-bold text-gray-900">₹{dish.price}</span>
        </div>
        {!dish.soldOut && (
          <div className="absolute right-0 bottom-1 border-1 border-white">
            <div className="relative w-[96px] h-9">
              <button
                onClick={handleAddToCart}
                className={cn(
                  "absolute right-0 top-0 z-10 transition-all duration-300 px-1 py-1 rounded-md border border-green-600/30 bg-white flex items-center justify-center text-xl font-semibold text-[#002a01] shadow-sm",
                  quantity > 0
                    ? "translate-y-[120%] opacity-0 pointer-events-none"
                    : "translate-y-0 opacity-100"
                )}
                aria-label={`Add ${dish.name}`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-plus-icon lucide-plus"
                >
                  <path d="M5 12h14" />
                  <path d="M12 5v14" />
                </svg>
              </button>

              <div
                className={cn(
                  "absolute right-0 top-0 flex items-center transition-all duration-300 w-[96px]",
                  quantity > 0
                    ? "translate-y-0 opacity-100"
                    : "translate-y-[120%] opacity-0 pointer-events-none"
                )}
              >
                <div className="-gap-2 inline-flex h-9 items-center rounded-md border border-green-600/30 bg-[#d3fb6b] shadow-sm pl-0 pr-2">
                  {/* Animate minus and qty from bottom */}
                  <div className="flex items-center transition-transform duration-300 delay-100 translate-y-0">
                    <button
                      onClick={handleDecrease}
                      className="h-8 w-8 rounded-md text-md mx-auto flex items-center justify-center text-[#002a01] transition-transform duration-300 "
                      aria-label={`Decrease ${dish.name}`}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-minus-icon lucide-minus"
                      >
                        <path d="M5 12h14" />
                      </svg>
                    </button>
                    <span className="text-lg min-w-[1.5rem] text-center font-medium transition-transform duration-300 ml-0">
                      {quantity}
                    </span>
                  </div>
                  <button
                    onClick={handleIncrease}
                    className="h-8 w-8 rounded-md text-md mx-auto flex items-center justify-center text-[#002a01]"
                    aria-label={`Increase ${dish.name}`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-plus-icon lucide-plus"
                    >
                      <path d="M5 12h14" />
                      <path d="M12 5v14" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
