'use client';

import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  Menu,
  ShoppingCart,
  User,
  LogOut,
  Settings,
  MapPin,
  Bell,
} from 'lucide-react';
import { useStore } from '@/lib/store';
import Link from 'next/link';

export function Header() {
  const { data: session } = useSession();
  const { cart, location } = useStore();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const cartItemCount =
    cart?.items.reduce((total, item) => total + item.quantity, 0) || 0;

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' });
  };

  const getRoleBasedNavigation = () => {
    if (!session?.user) return [];

    const role = session.user.role;

    switch (role) {
      case 'CUSTOMER':
        return [
          { href: '/customer/discover', label: 'Discover' },
          { href: '/customer/orders', label: 'Orders' },
          { href: '/customer/favorites', label: 'Favorites' },
        ];
      case 'RESTAURANT_OWNER':
        return [
          { href: '/restaurant/dashboard', label: 'Dashboard' },
          { href: '/restaurant/menu', label: 'Menu' },
          { href: '/restaurant/orders', label: 'Orders' },
          { href: '/restaurant/analytics', label: 'Analytics' },
        ];
      case 'DELIVERY_PARTNER':
        return [
          { href: '/delivery/dashboard', label: 'Dashboard' },
          { href: '/delivery/orders', label: 'Deliveries' },
          { href: '/delivery/earnings', label: 'Earnings' },
        ];
      case 'ADMIN':
        return [
          { href: '/admin/dashboard', label: 'Admin' },
          { href: '/admin/restaurants', label: 'Restaurants' },
          { href: '/admin/users', label: 'Users' },
          { href: '/admin/analytics', label: 'Analytics' },
        ];
      default:
        return [];
    }
  };

  const navigationItems = getRoleBasedNavigation();

  return (
    <header className="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <div className="text-xl font-bold">Aasta</div>
          <Badge variant="outline" className="text-xs">
            9PM-1AM
          </Badge>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center space-x-6 md:flex">
          {navigationItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="hover:text-primary text-sm font-medium transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Right Side Actions */}
        <div className="flex items-center space-x-4">
          {/* Location Indicator */}
          {location && (
            <div className="text-muted-foreground hidden items-center space-x-1 text-sm sm:flex">
              <MapPin className="h-4 w-4" />
              <span className="max-w-32 truncate">
                {location.latitude.toFixed(2)}, {location.longitude.toFixed(2)}
              </span>
            </div>
          )}

          {/* Cart (for customers) */}
          {session?.user?.role === 'CUSTOMER' && (
            <Button
              variant="outline"
              size="sm"
              className="relative"
              onClick={() => router.push('/customer/cart')}
            >
              <ShoppingCart className="h-4 w-4" />
              {cartItemCount > 0 && (
                <Badge className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center p-0 text-xs">
                  {cartItemCount}
                </Badge>
              )}
            </Button>
          )}

          {/* Notifications */}
          <Button variant="outline" size="sm">
            <Bell className="h-4 w-4" />
          </Button>

          {/* User Menu */}
          {session?.user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-8 w-8 rounded-full"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={session.user.image || ''}
                      alt={session.user.name || ''}
                    />
                    <AvatarFallback>
                      {session.user.name?.charAt(0) ||
                        session.user.email?.charAt(0) ||
                        'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    {session.user.name && (
                      <p className="font-medium">{session.user.name}</p>
                    )}
                    {session.user.email && (
                      <p className="text-muted-foreground w-[200px] truncate text-sm">
                        {session.user.email}
                      </p>
                    )}
                    <Badge variant="secondary" className="w-fit text-xs">
                      {session.user.role?.replace('_', ' ').toLowerCase()}
                    </Badge>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push('/profile')}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push('/settings')}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button onClick={() => router.push('/auth/signin')}>Sign In</Button>
          )}

          {/* Mobile Menu */}
          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="md:hidden">
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px]">
              <div className="mt-8 flex flex-col space-y-4">
                {navigationItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="hover:text-primary py-2 text-sm font-medium transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
