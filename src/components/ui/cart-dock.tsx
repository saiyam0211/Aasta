'use client';

import React, { useEffect, useState } from 'react';
import { useCartStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { ShoppingCart, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CartDockProps {
  className?: string;
}

export function CartDock({ className }: CartDockProps) {
  const { cart, addItem } = useCartStore();
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);

  const cartItemCount = cart?.items.reduce((total, item) => total + item.quantity, 0) || 0;
  const cartTotal = cart?.total || 0;

  // Debug logging
  console.log('CartDock render:', { cartItemCount, cartTotal, isVisible, cart });

  useEffect(() => {
    console.log('CartDock useEffect triggered:', { cartItemCount, isVisible });
    
    // Show dock when items are added to cart
    if (cartItemCount > 0) {
      console.log('Showing cart dock - items in cart:', cartItemCount);
      setIsVisible(true);
    } else {
      // Hide dock when cart is empty
      console.log('Hiding cart dock - cart is empty');
      setIsVisible(false);
    }
  }, [cartItemCount, cart]);

  const handleCartClick = () => {
    router.push('/cart');
  };

  // Temporary test function to add item to cart
  const testAddItem = () => {
    const testItem = {
      menuItemId: 'test-item',
      menuItem: {
        id: 'test-item',
        name: 'Test Item',
        price: 100,
        imageUrl: '/placeholder.png',
      },
      quantity: 1,
      subtotal: 100,
    };
    const testRestaurant = {
      id: 'test-restaurant',
      name: 'Test Restaurant',
    };
    addItem(testItem, testRestaurant);
  };

  // Always render the component but control visibility with AnimatePresence
  return (
    <>
      {/* Always visible test element to confirm component is rendering */}
      <div className="fixed top-4 left-4 z-50 bg-red-500 text-white px-4 py-2 rounded-lg text-sm">
        CartDock Component Loaded
      </div>

      {/* Temporary test button */}
      <div className="fixed top-4 right-4 z-50">
        <button
          onClick={testAddItem}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm"
        >
          Test Add Item
        </button>
        <div className="text-xs text-gray-600 mt-1">
          Cart: {cartItemCount} items
        </div>
        <div className="text-xs text-gray-600">
          Visible: {isVisible ? 'Yes' : 'No'}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {isVisible && (
          <motion.div
            key="cart-dock"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 30,
              mass: 0.8
            }}
            className={`fixed bottom-6 left-1/2 z-50 w-[90%] max-w-md -translate-x-1/2 md:hidden ${className}`}
          >
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="group cursor-pointer"
              onClick={handleCartClick}
            >
              <div className="relative rounded-2xl bg-white shadow-[0_8px_32px_rgba(0,0,0,0.12)] border border-gray-100 overflow-hidden">
                {/* Inner shadow effect */}
                <div className="absolute inset-0 rounded-2xl shadow-[inset_0_1px_0_rgba(255,255,255,0.8),inset_0_-1px_0_rgba(0,0,0,0.05)] pointer-events-none" />
                
                <div className="relative flex items-center justify-between p-4">
                  {/* Left side - Cart icon and item count */}
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#002a01] text-white shadow-lg">
                        <ShoppingCart className="h-6 w-6" />
                      </div>
                      {cartItemCount > 0 && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white shadow-lg"
                        >
                          {cartItemCount}
                        </motion.div>
                      )}
                    </div>
                    
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-600">
                        {cartItemCount} {cartItemCount === 1 ? 'item' : 'items'} in cart
                      </span>
                      <span className="text-lg font-bold text-[#002a01]">
                        ₹{cartTotal.toFixed(0)}
                      </span>
                    </div>
                  </div>

                  {/* Right side - Arrow and action */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-[#002a01]">
                      View Cart
                    </span>
                    <motion.div
                      animate={{ x: [0, 4, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                    >
                      <ChevronRight className="h-5 w-5 text-[#002a01]" />
                    </motion.div>
                  </div>
                </div>

                {/* Subtle gradient overlay for depth */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/80 via-white/40 to-white/20 pointer-events-none" />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
} 