'use client';

import { usePathname, useRouter } from 'next/navigation';
import { ShoppingCart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { useEffect, useState } from 'react';

interface CartBottomNavProps {
  cartItemCount: number;
  cartTotal?: number;
}

export function CartBottomNav({
  cartItemCount,
  cartTotal = 0,
}: CartBottomNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Show/hide based on cart items
  useEffect(() => {
    if (cartItemCount > 0 && !isVisible) {
      setIsAnimating(true);
      // Small delay to ensure smooth animation
      const timer = setTimeout(() => {
        setIsVisible(true);
        setIsAnimating(false);
      }, 50);
      return () => clearTimeout(timer);
    } else if (cartItemCount === 0 && isVisible) {
      setIsAnimating(true);
      setIsVisible(false);
      // Wait for exit animation to complete
      const timer = setTimeout(() => {
        setIsAnimating(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [cartItemCount, isVisible]);

  // Don't render if no items and not animating
  if (cartItemCount === 0 && !isAnimating) {
    return null;
  }

  const handleCartClick = () => {
    if (pathname !== '/cart') {
      router.push('/cart');
    }
  };

  return (
    <div
      className={cn(
        'fixed bottom-6 left-1/2 z-50 w-[85%] max-w-md -translate-x-1/2 md:hidden',
        'transition-all duration-300 ease-out',
        isVisible
          ? 'translate-y-0 opacity-100 scale-100'
          : 'translate-y-4 opacity-0 scale-95'
      )}
    >
      {/* Main cart button */}
      <div className="relative">
        <button
          onClick={handleCartClick}
          className={cn(
            'group relative w-full rounded-[20px] bg-white px-6 py-4 text-left shadow-[0_8px_32px_rgba(0,0,0,0.12)] transition-all duration-300 ease-out',
            'border border-gray-100',
            'hover:shadow-[0_12px_40px_rgba(0,0,0,0.16)] hover:scale-[1.02]',
            'active:scale-[0.98]',
            // Inner shadow effect
            'before:absolute before:inset-0 before:rounded-[20px] before:shadow-[inset_0_1px_3px_rgba(0,0,0,0.08)] before:pointer-events-none'
          )}
        >
          <div className="flex items-center justify-between">
            {/* Left side - Cart icon and item count */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <ShoppingCart className="h-6 w-6 text-[#002A01] transition-transform duration-200 group-hover:scale-110" />
                {cartItemCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center border-2 border-white bg-red-500 p-0 text-xs font-bold text-white shadow-sm">
                    {cartItemCount > 99 ? '99+' : cartItemCount}
                  </Badge>
                )}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-600">
                  {cartItemCount} {cartItemCount === 1 ? 'item' : 'items'}
                </span>
                <span className="text-lg font-bold text-[#002A01]">
                  ₹{cartTotal.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Right side - View cart text */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-[#002A01]">
                View Cart
              </span>
              <div className="h-4 w-4 rounded-full bg-[#002A01] p-0.5">
                <svg
                  className="h-full w-full text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </div>
          </div>
        </button>

        {/* Subtle glow effect */}
        <div className="absolute inset-0 rounded-[20px] bg-gradient-to-r from-[#002A01]/5 to-[#002A01]/10 blur-xl opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      </div>

      {/* Safe area */}
      <div className="pb-safe h-0" />
    </div>
  );
} 