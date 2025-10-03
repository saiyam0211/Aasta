'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { useCartStore } from '@/lib/store';
import { CartBottomNav } from '@/components/ui/cart-bottom-nav';

interface CustomerLayoutProps {
  children: React.ReactNode;
  hideHeader?: boolean;
  hideFooter?: boolean;
}

export default function CustomerLayout({
  children,
  hideHeader = false,
  hideFooter = false,
}: CustomerLayoutProps) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { cart } = useCartStore();
  const isOnline = true;

  const cartItemCount =
    cart?.items.reduce((total, item) => total + item.quantity, 0) || 0;

  if (!session) {
    return (
      <div className="bg-primary-dark-green flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="bg-accent-leaf-green mx-auto flex h-16 w-16 items-center justify-center rounded-full shadow-lg">
            <span className="text-brand text-primary-dark-green text-xl font-bold">
              A
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-off-white min-h-screen">
      {/* Offline Indicator */}
      {!isOnline && (
        <div className="fixed top-0 right-0 left-0 z-50 bg-red-600 p-2 text-center text-sm text-white">
          <div className="flex items-center justify-center space-x-2">
            <span>You're offline. Some features may not be available.</span>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 pb-20 md:pb-0">{children}</main>

      {/* Cart Bottom Navigation - Only shows when cart has items */}
      <CartBottomNav
        cartItemCount={cartItemCount}
        cartTotal={cart?.total || 0}
      />
    </div>
  );
}