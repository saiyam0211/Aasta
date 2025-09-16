'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { SafeImage } from '@/components/ui/safe-image';
import { useCartStore } from '@/lib/store';

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

function DealCard({ deal, onAdd }: { deal: Deal; onAdd: () => void }) {
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
      },
      quantity: 1,
      subtotal: deal.price,
    } as any;
    addItem(cartItem, restaurant);
    onAdd(deal); // Call the original onAdd callback with deal object
  };

  const handleIncrease = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateQuantity(deal.id, quantity + 1);
  };

  const handleDecrease = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateQuantity(deal.id, quantity - 1);
  };

  return (
    <div className={cn(
      "relative rounded-3xl overflow-hidden min-w-[320px] flex-shrink-0 snap-center",
      deal.isVegetarian 
        ? "bg-gradient-to-br from-gray-900 to-green-900" 
        : "bg-gradient-to-br from-gray-900 to-red-900"
    )}>
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className={cn(
          "absolute inset-0 bg-gradient-to-br from-transparent to-transparent",
          deal.isVegetarian ? "via-green-500/20" : "via-red-500/20"
        )} />
        {/* Geometric pattern overlay */}
        <div className="absolute inset-0" style={{
          backgroundImage: `
            radial-gradient(circle at 25% 25%, rgba(255,255,255,0.1) 1px, transparent 1px),
            radial-gradient(circle at 75% 75%, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px'
        }} />
      </div>

      {/* Content */}
      <div className="relative z-10 p-6">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex justify-center">
            <img 
              src={deal.isVegetarian ? "/HACK-VEG.svg" : "/HACK-NONVEG.svg"}
              alt={deal.isVegetarian ? "Hack Veg" : "Hack Non-Veg"}
              className="h-20 w-auto"
            />
          </div>
        </div>

        {/* Dish Image */}
        <div className="relative mx-auto w-64 h-40 mb-6">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20 rounded-2xl" />
          <SafeImage
            src={deal.image}
            alt={deal.name}
            className="w-full h-full object-cover rounded-2xl"
            fallbackSrc="/images/dish-placeholder.svg"
          />
          
          {/* Price Badge */}
          <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2">
            <div className={cn(
              "px-6 py-2 rounded-full shadow-lg",
              deal.isVegetarian 
                ? "bg-gradient-to-r from-green-500 to-emerald-500" 
                : "bg-gradient-to-r from-pink-500 to-red-500"
            )}>
              <div className="flex items-center gap-2 text-white">
                <span className="text-2xl font-bold">₹{deal.price}</span>
                {hasDiscount && (
                  <span className="text-sm line-through opacity-75">₹{deal.originalPrice}</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Info Pills */}
        <div className="flex items-center justify-center gap-4 mb-6 mt-8">
          {/* Time */}
          <div className={cn(
            "flex items-center gap-1 backdrop-blur-sm border rounded-full px-3 py-1",
            deal.isVegetarian 
              ? "bg-green-600/20 border-green-500/30" 
              : "bg-red-600/20 border-red-500/30"
          )}>
            <div className={cn(
              "w-3 h-3 rounded-full flex items-center justify-center",
              deal.isVegetarian ? "bg-green-500" : "bg-red-500"
            )}>
              <div className="w-1.5 h-1.5 bg-white rounded-full" />
            </div>
            <span className="text-white text-sm font-medium">{deal.preparationTime} mins</span>
          </div>

          {/* Serving Size */}
          <div className="bg-gray-700/50 backdrop-blur-sm border border-gray-600 rounded-full px-3 py-1">
            <span className="text-white text-sm font-medium">
              {deal.servingSize || 'Serves 1'}
            </span>
          </div>
        </div>

        {/* Dish Name */}
        <h3 className="text-center text-xl font-bold text-white mb-2 leading-tight">
          {deal.name}
        </h3>

        {/* Dynamic Text with Transition */}
        <div className="h-6 text-center text-sm font-medium mb-8 relative overflow-hidden">
          {hasDiscount ? (
            <>
              <div
                className={cn(
                  "absolute inset-0 flex items-center justify-center transition-all duration-500 ease-in-out",
                  showDiscountText 
                    ? "transform translate-y-0 opacity-100" 
                    : "transform -translate-y-full opacity-0",
                  deal.isVegetarian ? "text-green-400" : "text-red-400"
                )}
              >
                {discountPct}% OFF
              </div>
              <div
                className={cn(
                  "absolute inset-0 flex items-center justify-center transition-all duration-500 ease-in-out",
                  !showDiscountText 
                    ? "transform translate-y-0 opacity-100" 
                    : "transform translate-y-full opacity-0",
                  deal.isVegetarian ? "text-green-400" : "text-red-400"
                )}
              >
                You'll save ₹{savedAmount}
              </div>
            </>
          ) : (
            <div className={cn(
              "text-center",
              deal.isVegetarian ? "text-green-400" : "text-red-400"
            )}>
              Limited stock
            </div>
          )}
        </div>

        {/* Add Button / Quantity Controls */}
        <div className="flex justify-center">
          {quantity > 0 ? (
            <div className="inline-flex h-16 items-center rounded-2xl border border-green-600/30 bg-[#d3fb6b] shadow-xl">
              <button
                onClick={handleDecrease}
                className="h-10 w-10 rounded-xl text-xl text-[#002a01] font-bold"
                aria-label={`Decrease ${deal.name}`}
              >
                −
              </button>
              <span className="text-lg min-w-[2rem] text-center font-bold text-[#002a01]">
                {quantity}
              </span>
              <button
                onClick={handleIncrease}
                className="h-10 w-10 rounded-xl text-xl text-[#002a01] font-bold"
                aria-label={`Increase ${deal.name}`}
              >
                +
              </button>
            </div>
          ) : (
            <button
              onClick={handleAddToCart}
              className={cn(
                "bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 text-black font-bold text-lg px-12 py-4 rounded-2xl shadow-xl transform transition-all duration-200 hover:scale-105 active:scale-95",
                deal.isVegetarian ? "bg-green-400" : "bg-red-400"
              )}
            >
              ADD
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function HackOfTheDay({ deals, onAdd, className }: HackOfTheDayProps) {
  return (
    <div className={cn("relative", className)}>
      {/* Carousel Container */}
      <div 
        className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden" 
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {deals.map((deal, index) => (
          <DealCard
            key={deal.id}
            deal={deal}
            onAdd={() => onAdd(deal)}
          />
        ))}
      </div>
      
      {/* Carousel Indicators */}
      {deals.length > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {deals.map((_, index) => (
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
