'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { SafeImage } from '@/components/ui/safe-image';
import { toast } from 'sonner';
import { useCartStore } from '@/lib/store';
import { Minus, Plus } from 'lucide-react';
import { hapticAddToCart, hapticIncreaseQuantity, hapticDecreaseQuantity } from '@/haptics';

interface Deal {
  id: string;
  name: string;
  image: string;
  price: number;
  originalPrice?: number;
  preparationTime: number;
  servingSize?: string;
  isVegetarian: boolean;
  restaurant: string;
  restaurantId?: string;
  dietaryTags?: string[];
  soldOut?: boolean;
  stockLeft?: number | null;
}

interface HackOfTheDayProps {
  deals: Deal[];
  onAdd: (deal: Deal) => void;
  className?: string;
}

function VegMark({ isVegetarian }: { isVegetarian: boolean }) {
  return (
    <span
      className={cn(
        'inline-flex h-5 w-5 items-center justify-center rounded-sm border-2',
        isVegetarian ? 'border-green-400 bg-white' : 'border-red-400 bg-white'
      )}
    >
      <span
        className={cn(
          'h-2.5 w-2.5 rounded-full',
          isVegetarian ? 'bg-green-400' : 'bg-red-400'
        )}
      />
    </span>
  );
}

function DealCard({ deal, onAdd }: { deal: Deal; onAdd: (deal: Deal) => void }) {
  const hasDiscount = !!deal.originalPrice && deal.originalPrice > deal.price;
  const [showDiscountText, setShowDiscountText] = useState(true); // true = percentage, false = amount saved
  
  const discountPct = hasDiscount
    ? Math.round(((deal.originalPrice! - deal.price) / deal.originalPrice!) * 100)
    : 0;
  const savedAmount = hasDiscount ? deal.originalPrice! - deal.price : 0;

  // Robust veg/non-veg detection (prefer explicit tags, then fallback to flag)
  const tagsLower = Array.isArray(deal.dietaryTags)
    ? deal.dietaryTags.map((t) => String(t).toLowerCase())
    : [];
  const hasNonVegTag = tagsLower.some((t) => /(non[-\s]?veg|egg|chicken|mutton|fish|meat)/i.test(t));
  const hasVegTag = tagsLower.some((t) => /(\bveg\b|vegetarian|vegan)/i.test(t));
  const isVeg = hasNonVegTag ? false : (hasVegTag ? true : !!deal.isVegetarian);

  // Auto-toggle discount text every 5 seconds
  useEffect(() => {
    if (!hasDiscount) return;
    
    const interval = setInterval(() => {
      setShowDiscountText(prev => !prev);
    }, 5000);

    return () => clearInterval(interval);
  }, [hasDiscount]);

  // Cart functionality
  const getItemQuantityInCart = useCartStore((s) => s.getItemQuantityInCart);
  const addItem = useCartStore((s) => s.addItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);

  const quantity = getItemQuantityInCart(deal.id);

  // Helper function for slugifying restaurant names
  const slugify = (input: string): string => {
    return input
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    hapticAddToCart();
    const maxStock = typeof deal.stockLeft === 'number' ? deal.stockLeft : undefined;
    const currentQty = quantity || 0;
    if (typeof maxStock === 'number' && maxStock >= 0 && currentQty + 1 > maxStock) {
      toast.error(`Only ${maxStock} left in stock`);
      return;
    }
    const restaurant = {
      id: deal.restaurantId || `rest-${slugify(deal.restaurant)}`,
      name: deal.restaurant,
    };
    const cartItem = {
      menuItemId: deal.id,
      menuItem: {
        id: deal.id,
        name: deal.name,
        price: deal.price,
        imageUrl: deal.image,
        originalPrice: deal.originalPrice,
        stockLeft: deal.stockLeft,
      },
      quantity: 1,
      subtotal: deal.price,
    } as any;
    addItem(cartItem, restaurant);
    onAdd(deal); // Call the original onAdd callback with deal object
  };

  const handleIncrease = (e: React.MouseEvent) => {
    e.stopPropagation();
    hapticIncreaseQuantity();
    const maxStock = typeof deal.stockLeft === 'number' ? deal.stockLeft : undefined;
    if (typeof maxStock === 'number' && maxStock >= 0 && quantity + 1 > maxStock) {
      toast.error(`Only ${maxStock} left in stock`);
      return;
    }
    updateQuantity(deal.id, quantity + 1);
  };

  const handleDecrease = (e: React.MouseEvent) => {
    e.stopPropagation();
    hapticDecreaseQuantity();
    updateQuantity(deal.id, quantity - 1);
  };

  return (
    <div className={cn(
      "relative rounded-3xl overflow-hidden w-[90%] h-auto flex-shrink-0 snap-center bg-neutral-900 mt-10",
      "border border-white/10 shadow-lg"
    )}>
      {/* Subtle radial flower-like background gradient, center of flower is bottom right (center at 85% 88%) */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className={cn(
            "absolute inset-0",
            "opacity-45 animate-[radialFlowerExpand_3.4s_ease-in-out_infinite]"
          )}
          style={{
            background: isVeg
              ? 'radial-gradient(ellipse 120% 80% at 85% 88%, rgba(16,185,129,0.50) 0%, rgba(16,185,129,0.14) 54%, rgba(0,0,0,0.06) 77%, transparent 100%)'
              : 'radial-gradient(ellipse 120% 80% at 85% 88%, rgba(244,63,94,0.44) 0%, rgba(244,63,94,0.12) 47%, rgba(0,0,0,0.06) 77%, transparent 100%)',
            filter: 'blur(2.5px)'
          }}
        />
        {/* "Flower petal" effect radiating from bottom right as center */}
        {[...Array(7)].map((_, i) => {
          const angle = (i / 7) * 2 * Math.PI;
          const cx = 85 + 22 * Math.cos(angle + 0.45); // center x is now 85%
          const cy = 88 + 18 * Math.sin(angle + 0.85); // center y is now 88%
          return (
            <div
              key={i}
              className={`absolute rounded-full`}
              style={{
                left: `${cx}%`,
                top: `${cy}%`,
                width: `${54 + 18 * Math.sin(angle)}px`,
                height: `${57 + 18 * Math.cos(angle)}px`,
                zIndex: 0,
                background: isVeg
                  ? "radial-gradient(circle at 54% 48%,rgba(16,185,129,0.18) 0%,rgba(16,185,129,0.10) 78%,transparent 100%)"
                  : "radial-gradient(circle at 54% 48%,rgba(244,63,94,0.17) 0%,rgba(244,63,94,0.09) 72%,transparent 100%)",
                filter: `blur(9px) brightness(0.62)`,
                opacity: 0.41 - i * 0.045
              }}
            />
          );
        })}
      </div>

      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: "url('/pattern.png')",
          backgroundRepeat: "repeat",
          opacity: 0.2,
          backgroundSize: "120px",
        }}
      />

      {/* Content */}
      <div className="relative z-10 p-6">
        {/* Header - Hack of the Day */}
        <div className="text-center mb-6">
          <div className="flex justify-center">
            <img 
              src={isVeg ? "/HACK-VEG.svg" : "/HACK-NONVEG.svg"}
              alt={isVeg ? "Hack Veg" : "Hack Non-Veg"}
              className="h-24 w-auto opacity-90"
            />
          </div>
        </div>

        {/* Dish Image */}
        <div className="relative mx-auto w-full h-40 mb-10">
          <div className="relative bg-white/5 backdrop-blur-sm rounded-3xl p-1 border border-white/10">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/30 rounded-3xl" />
            <SafeImage
              src={deal.image}
              alt={deal.name}
              className={cn("w-full h-60 object-cover rounded-3xl", deal.soldOut && "grayscale")}
              fallbackSrc="/images/dish-placeholder.svg"
            />
          </div>
          {deal.soldOut && (
            <img src="/images/sold-out.png" alt="Sold Out" className="absolute inset-0 top-0 right-0 object-cover h-[200%] w-[200%]" />
          )}
          
          {/* Price Badge */}
          <div className="absolute top-56 left-1/2 transform -translate-x-1/2 z-10">
            <div className={cn(
              "px-5 py-2 rounded-3xl shadow-lg border border-white/10",
              isVeg 
                ? "bg-gradient-to-r from-emerald-500 to-emerald-600" 
                : "bg-gradient-to-r from-rose-500 to-rose-600"
            )}>
              <div className="flex items-center gap-2 text-white">
                <span className="text-2xl font-semibold">₹{deal.price}</span>
                {hasDiscount && (
                  <span
                    className="text-md mt-1 opacity-80 relative"
                    style={{
                      display: 'inline-block',
                    }}
                  >
                    ₹{deal.originalPrice}
                    {/* Custom tilt strike-through */}
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute left-0 right-0 top-1/2 h-0.5"
                      style={{
                        background: 'rgba(255,255,255,0.7)',
                        transform: 'rotate(-8deg)',
                        width: '100%',
                        height: '2px',
                        top: '55%',
                      }}
                    />
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Info Pills */}
        <div className="flex items-center justify-center gap-3 mb-6 mt-24">
          {/* Time */}
          {/* <div className={cn(
            "flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium border",
            isVeg 
              ? "bg-emerald-900/40 border-emerald-700 text-emerald-100" 
              : "bg-rose-900/40 border-rose-700 text-rose-100"
          )}>
            <span className={cn(
              "inline-block h-2 w-2 rounded-full",
              isVeg ? "bg-emerald-400" : "bg-rose-400"
            )} />
            <span>{deal.preparationTime} mins</span>
          </div> */}

          {/* Serving Size */}
          {/* <div className="rounded-full px-3 py-1.5 text-xs font-medium border bg-white/5 border-white/10 text-white/90">
            <span>{deal.servingSize || 'Serves 1'}</span>
          </div> */}
        </div>

        {/* Dish Name */}
        <h3 className="text-center text-3xl mt-8 font-semibold text-white mb-2 leading-tight">
          {deal.name}
        </h3>

        {/* Dynamic Text with Enhanced Transition */}
        <div className="h-6 text-center text-lg font-medium mb-8 relative overflow-hidden text-white/90">
          {hasDiscount ? (
            <>
              <div
                className={cn(
                  "absolute inset-0 flex items-center justify-center transition-all duration-500 ease-in-out",
                  showDiscountText 
                    ? "translate-y-0 opacity-100" 
                    : "-translate-y-full opacity-0",
                  isVeg ? "text-emerald-300" : "text-rose-300"
                )}
              >
                <span>{discountPct}% OFF</span>
              </div>
              <div
                className={cn(
                  "absolute inset-0 flex items-center justify-center transition-all duration-500 ease-in-out",
                  !showDiscountText 
                    ? "translate-y-0 opacity-100" 
                    : "translate-y-full opacity-0",
                  isVeg ? "text-emerald-300" : "text-rose-300"
                )}
              >
                <span>You'll save ₹{savedAmount}</span>
              </div>
            </>
          ) : (
            <div className="text-center">Limited stock</div>
          )}
        </div>

        {/* Add Button / Quantity Controls - keep original styles, add slide animation */}
        <div className="flex items-center justify-center w-full">
          <div className="relative w-80 h-14 flex items-center justify-center mx-auto">
            {/* Centered Add button */}
            <button
              onClick={deal.soldOut ? undefined : handleAddToCart}
              disabled={deal.soldOut}
              className={cn(
                "absolute left-1/2 top-1/2 z-10 transition-all duration-300 p-4 rounded-2xl text-lg font-semibold border transform -translate-x-1/2 -translate-y-1/2",
                isVeg
                  ? "bg-emerald-500 border-emerald-500 text-white"
                  : "bg-rose-500 border-rose-500 text-white",
                deal.soldOut && "cursor-not-allowed opacity-20 bg-rose-900 border-rose-900 text-white",
                quantity > 0
                  ? "translate-y-[120%] opacity-0 pointer-events-none"
                  : "translate-y-[-50%] opacity-100"
              )}
              aria-label={`Add ${deal.name}`}
            >
              {deal.soldOut ? 'Out of Stock' : 'Add to cart'}
            </button>

            {/* Centered quantity controls */}
            <div
              className={cn(
                "absolute left-1/2 top-1/2 flex items-center w-auto transition-all duration-300 transform -translate-x-1/2 -translate-y-1/2",
                quantity > 0
                  ? "translate-y-[-50%] opacity-100"
                  : "translate-y-[120%] opacity-0 pointer-events-none"
              )}
            >
              <div className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-[#cefd4f] px-5 py-2 h-14">
                <button
                  className="flex h-6 w-6 items-center mx-auto justify-center rounded-full"
                  onClick={handleDecrease}
                  aria-label={`Decrease ${deal.name}`}
                >
                  <Minus className="h-8 w-8 text-black" />
                </button>
                <span className=" text-center px-2 text-2xl font-semibold text-gray-600">{quantity}</span>
                <button
                  className="flex h-6 w-6 items-center mx-auto justify-center rounded-full"
                  onClick={handleIncrease}
                  aria-label={`Increase ${deal.name}`}
                >
                  <Plus className="h-8 w-8 text-black" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function HackOfTheDay({ deals, onAdd, className }: HackOfTheDayProps) {
  // Helper to detect veg/non-veg same as DealCard
  const isVegDeal = (deal: Deal): boolean => {
    const tagsLower = Array.isArray(deal.dietaryTags)
      ? deal.dietaryTags.map((t) => String(t).toLowerCase())
      : [];
    const hasNonVegTag = tagsLower.some((t) => /(non[-\s]?veg|egg|chicken|mutton|fish|meat)/i.test(t));
    const hasVegTag = tagsLower.some((t) => /(\bveg\b|vegetarian|vegan)/i.test(t));
    return hasNonVegTag ? false : (hasVegTag ? true : !!deal.isVegetarian);
  };

  // Show Veg first, then Non-Veg; limit to maximum 2 items
  const limitedDeals = [...deals]
    .sort((a, b) => (isVegDeal(a) === isVegDeal(b) ? 0 : isVegDeal(a) ? -1 : 1))
    .slice(0, 2);
  
  return (
    <div className={cn("relative", className)}>
      {/* Carousel Container */}
      <div 
        className={cn(
          "flex gap-4 pb-4 [&::-webkit-scrollbar]:hidden",
          limitedDeals.length === 1 
            ? "justify-center" 
            : "overflow-x-auto snap-x snap-mandatory"
        )}
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {limitedDeals.map((deal, index) => (
          <DealCard
            key={deal.id}
            deal={deal}
            onAdd={() => onAdd(deal)}
          />
        ))}
      </div>
      
      {/* Carousel Indicators - only show if more than 1 item */}
      {limitedDeals.length > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {limitedDeals.map((_, index) => (
            <div
              key={index}
              className="w-2 h-2 rounded-full bg-gray-400 opacity-50"
            />
          ))}
        </div>
      )}
    </div>
  );
}
