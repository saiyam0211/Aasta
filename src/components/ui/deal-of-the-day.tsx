'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { SafeImage } from '@/components/ui/safe-image';
import { toast } from 'sonner';
import { useCartStore } from '@/lib/store';
import { Minus, Plus } from 'lucide-react';

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
    const maxStock = typeof deal.stockLeft === 'number' ? deal.stockLeft : undefined;
    if (typeof maxStock === 'number' && maxStock >= 0 && quantity + 1 > maxStock) {
      toast.error(`Only ${maxStock} left in stock`);
      return;
    }
    updateQuantity(deal.id, quantity + 1);
  };

  const handleDecrease = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateQuantity(deal.id, quantity - 1);
  };

  return (
    <div className={cn(
      "relative rounded-3xl overflow-hidden min-w-[320px] flex-shrink-0 snap-center bg-neutral-900 mt-10",
      "border border-white/10 shadow-lg"
    )}>
      {/* Subtle background gradient */}
      <div className="absolute inset-0 opacity-30">
        <div className={cn(
          "absolute inset-0 bg-gradient-to-br from-transparent to-transparent",
          deal.isVegetarian ? "via-emerald-700/30" : "via-rose-700/30"
        )} />
      </div>

      {/* Content */}
      <div className="relative z-10 p-6">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex justify-center">
            <img 
              src={deal.isVegetarian ? "/HACK-VEG.svg" : "/HACK-NONVEG.svg"}
              alt={deal.isVegetarian ? "Hack Veg" : "Hack Non-Veg"}
              className="h-24 w-auto opacity-90"
            />
          </div>
        </div>

        {/* Dish Image */}
        <div className="relative mx-auto w-64 h-40 mb-6">
          <div className="relative bg-white/5 backdrop-blur-sm rounded-2xl p-1 border border-white/10">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/30 rounded-2xl" />
            <SafeImage
              src={deal.image}
              alt={deal.name}
              className={cn("w-full h-48 object-cover rounded-2xl", deal.soldOut && "grayscale")}
              fallbackSrc="/images/dish-placeholder.svg"
            />
          </div>
          {deal.soldOut && (
            <img src="/images/sold-out.png" alt="Sold Out" className="absolute inset-0  h-full w-full" />
          )}
          
          {/* Price Badge */}
          <div className="absolute top-46 left-1/2 transform -translate-x-1/2 z-10">
            <div className={cn(
              "px-5 py-2 rounded-xl shadow-lg border border-white/10",
              deal.isVegetarian 
                ? "bg-gradient-to-r from-emerald-500 to-emerald-600" 
                : "bg-gradient-to-r from-rose-500 to-rose-600"
            )}>
              <div className="flex items-center gap-2 text-white">
                <span className="text-2xl font-semibold">₹{deal.price}</span>
                {hasDiscount && (
                  <span className="text-sm line-through/80 opacity-80">₹{deal.originalPrice}</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Info Pills */}
        <div className="flex items-center justify-center gap-3 mb-6 mt-24">
          {/* Time */}
          <div className={cn(
            "flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium border",
            deal.isVegetarian 
              ? "bg-emerald-900/40 border-emerald-700 text-emerald-100" 
              : "bg-rose-900/40 border-rose-700 text-rose-100"
          )}>
            <span className={cn(
              "inline-block h-2 w-2 rounded-full",
              deal.isVegetarian ? "bg-emerald-400" : "bg-rose-400"
            )} />
            <span>{deal.preparationTime} mins</span>
          </div>

          {/* Serving Size */}
          <div className="rounded-full px-3 py-1.5 text-xs font-medium border bg-white/5 border-white/10 text-white/90">
            <span>{deal.servingSize || 'Serves 1'}</span>
          </div>
        </div>

        {/* Dish Name */}
        <h3 className="text-center text-2xl font-semibold text-white mb-2 leading-tight">
          {deal.name}
        </h3>

        {/* Dynamic Text with Enhanced Transition */}
        <div className="h-6 text-center text-sm font-medium mb-8 relative overflow-hidden text-white/90">
          {hasDiscount ? (
            <>
              <div
                className={cn(
                  "absolute inset-0 flex items-center justify-center transition-all duration-500 ease-in-out",
                  showDiscountText 
                    ? "translate-y-0 opacity-100" 
                    : "-translate-y-full opacity-0",
                  deal.isVegetarian ? "text-emerald-300" : "text-rose-300"
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
                  deal.isVegetarian ? "text-emerald-300" : "text-rose-300"
                )}
              >
                <span>You'll save ₹{savedAmount}</span>
              </div>
            </>
          ) : (
            <div className="text-center">Limited stock</div>
          )}
        </div>

        {/* Add Button / Quantity Controls */}
        <div className="flex justify-center">
          {quantity > 0 ? (
            <div className="flex items-center gap-3 mx-8 h-14">
              <div className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-[#cefd4f] px-5 py-2 h-14">
                <button
                  className="flex h-6 w-6 items-center justify-center rounded-full bg-[#002a01] shadow-sm hover:bg-gray-100 transition-colors"
                  onClick={handleDecrease}
                  aria-label={`Decrease ${deal.name}`}
                >
                  <Minus className="h-3 w-3 text-white" />
                </button>
                <span className="min-w-[20px] text-center text-lg font-semibold text-gray-600">{quantity}</span>
                <button
                  className="flex h-6 w-6 items-center justify-center rounded-full bg-[#002a01] shadow-sm hover:bg-gray-100 transition-colors"
                  onClick={handleIncrease}
                  aria-label={`Increase ${deal.name}`}
                >
                  <Plus className="h-3 w-3 text-white" />
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={deal.soldOut ? undefined : handleAddToCart}
              disabled={deal.soldOut}
              className={cn(
                "px-6 py-4 rounded-xl text-md font-semibold shadow-lg border",
                deal.isVegetarian 
                  ? "bg-emerald-600 hover:bg-emerald-700 border-emerald-500 text-white" 
                  : "bg-rose-600 hover:bg-rose-700 border-rose-500 text-white",
                deal.soldOut && "cursor-not-allowed opacity-50"
              )}
            >
              {deal.soldOut ? 'Sold out' : 'Add to cart'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function HackOfTheDay({ deals, onAdd, className }: HackOfTheDayProps) {
  // Limit to maximum 2 items
  const limitedDeals = deals.slice(0, 2);
  
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
