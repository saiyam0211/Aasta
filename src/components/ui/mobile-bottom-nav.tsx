"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Home, Search, ShoppingCart, Clock, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface MobileBottomNavProps {
  cartItemCount?: number;
  activeOrdersCount?: number;
}

export function MobileBottomNav({ cartItemCount = 0, activeOrdersCount = 0 }: MobileBottomNavProps) {
  const pathname = usePathname();

  const navItems = [
    { href: "/", icon: Home, label: "Home", isActive: pathname === "/" },
    // { href: "/restaurants", icon: Search, label: "Search", isActive: pathname?.startsWith("/restaurants") ?? false },
    { href: "/cart", icon: ShoppingCart, label: "Cart", isActive: pathname === "/cart", badge: cartItemCount > 0 ? cartItemCount : undefined },
    // { href: "/orders", icon: Clock, label: "Orders", isActive: pathname === "/orders", badge: activeOrdersCount > 0 ? activeOrdersCount : undefined },
    // { href: "/profile", icon: User, label: "Profile", isActive: pathname === "/profile" },
  ];

  return (
    <div className="fixed bottom-3 left-1/2 -translate-x-1/2 rounded-[40px] bg-[#002A01]/10 z-50 md:hidden w-[50%] max-w-xl ">
      <div className="relative glass-liquid rounded-[40px]  text-black shadow-[0_8px_30px_rgba(0,0,0,0.35)] border border-black/5 px-3 py-3">
        <div className="flex items-center justify-center">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = item.isActive;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "group flex items-center gap-2 px-3 py-2 rounded-2xl transition-all",
                  active ? "text-[#002A01]" : "text-gray-500"
                )}
              >
                <div className="relative flex items-center">
                  <Icon className={cn("w-6 h-6 transition-all duration-300", active && " scale-110")}/>

                  {/* Animated label - only active tab shows */}
                  <span
                    className={cn(
                      "ml-2 text-xs font-medium overflow-hidden transition-all duration-300 ease-out",
                      active ? "max-w-[120px] opacity-100 translate-y-0 text-[#002A01]" : "max-w-0 opacity-0 -translate-y-0"
                    )}
                  >
                    {item.label}
                    {/* underline */}
                    <span className={cn("block h-1 rounded-full mt-1 transition-all duration-300",
                      active ? "w-10 bg-[#002A01]" : "w-0 bg-transparent")}
                    />
                  </span>

                  {/* Badge */}
                  {item.badge && (
                    <Badge className="absolute -top-2 -right-2 w-5 h-5 flex items-center justify-center p-0 text-xs bg-red-500 text-black border-2 border-[#101113]">
                      {item.badge > 99 ? "99+" : item.badge}
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
