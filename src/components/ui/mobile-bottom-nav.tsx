'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Home, Search, ShoppingCart, Clock, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface MobileBottomNavProps {
  cartItemCount?: number;
  activeOrdersCount?: number;
  onHomeClick?: () => void;
}

export function MobileBottomNav({
  cartItemCount = 0,
  activeOrdersCount = 0,
  onHomeClick,
}: MobileBottomNavProps) {
  const pathname = usePathname();

  const navItems = [
    {
      href: '/',
      icon: Home,
      label: 'Home',
      isActive: pathname === '/',
      onClick: onHomeClick,
    },
    // { href: "/restaurants", icon: Search, label: "Search", isActive: pathname?.startsWith("/restaurants") ?? false },
    {
      href: '/cart',
      icon: ShoppingCart,
      label: 'Cart',
      isActive: pathname === '/cart',
      badge: cartItemCount > 0 ? cartItemCount : undefined,
    },
    // { href: "/orders", icon: Clock, label: "Orders", isActive: pathname === "/orders", badge: activeOrdersCount > 0 ? activeOrdersCount : undefined },
    // { href: "/profile", icon: User, label: "Profile", isActive: pathname === "/profile" },
  ];

  return (
    <div className="fixed bottom-3 left-1/2 z-50 w-[50%] max-w-xl -translate-x-1/2 rounded-[40px] bg-[#002A01]/10 md:hidden">
      <div className="glass-liquid relative rounded-[40px] border border-black/5 px-3 py-3 text-black shadow-[0_8px_30px_rgba(0,0,0,0.35)]">
        <div className="flex items-center justify-center">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = item.isActive;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                onClick={item.onClick}
                className={cn(
                  'group flex items-center gap-2 rounded-2xl px-3 py-2 transition-all',
                  active ? 'text-[#002A01]' : 'text-gray-500'
                )}
              >
                <div className="relative flex items-center">
                  <Icon
                    className={cn(
                      'h-6 w-6 transition-all duration-300',
                      active && 'scale-110'
                    )}
                  />

                  {/* Animated label - only active tab shows */}
                  <span
                    className={cn(
                      'ml-2 overflow-hidden text-xs font-medium transition-all duration-300 ease-out',
                      active
                        ? 'max-w-[120px] translate-y-0 text-[#002A01] opacity-100'
                        : 'max-w-0 -translate-y-0 opacity-0'
                    )}
                  >
                    {item.label}
                    {/* underline */}
                    <span
                      className={cn(
                        'mt-1 block h-1 rounded-full transition-all duration-300',
                        active ? 'w-10 bg-[#002A01]' : 'w-0 bg-transparent'
                      )}
                    />
                  </span>

                  {/* Badge */}
                  {item.badge && (
                    <Badge className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center border-2 border-[#101113] bg-red-500 p-0 text-xs text-black">
                      {item.badge > 99 ? '99+' : item.badge}
                    </Badge>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Safe area */}
      <div className="pb-safe h-0" />
    </div>
  );
}
