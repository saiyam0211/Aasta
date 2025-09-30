'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
import {
  Home,
  Search,
  ShoppingCart,
  Clock,
  User,
  MapPin,
  Bell,
  Menu,
  X,
  LogOut,
  Download,
} from 'lucide-react';
import { useCartStore } from '@/lib/store';
// import { usePWA } from '@/hooks/usePWA';
// import { usePushSubscription } from '@/hooks/usePushSubscription';
// import { useNotificationListener } from '@/hooks/useNotificationListener';
import { CartBottomNav } from '@/components/ui/cart-bottom-nav';

interface CustomerLayoutProps {
  children: React.ReactNode;
  hideHeader?: boolean;
  hideFooter?: boolean;
}

const navigation = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Restaurants', href: '/restaurants', icon: Search },
  { name: 'Orders', href: '/orders', icon: Clock },
  { name: 'Profile', href: '/profile', icon: User },
];

export default function CustomerLayout({
  children,
  hideHeader = false,
  hideFooter = false,
}: CustomerLayoutProps) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { cart } = useCartStore();
  // PWA features disabled for now
  const isInstalled = false;
  const isOnline = true;
  // const { isSubscribed, isSubscribing } = usePushSubscription();
  // useNotificationListener();

  const cartItemCount =
    cart?.items.reduce((total, item) => total + item.quantity, 0) || 0;

  // Register client with notification broadcaster
  useEffect(() => {
    if (session?.user?.id) {
      const registerClient = async () => {
        try {
          // Enhanced PWA detection - check multiple indicators
          const isStandalone = window.matchMedia(
            '(display-mode: standalone)'
          ).matches;
          const isIOSStandalone = (window.navigator as any).standalone === true;
          const isInAppBrowser = window.navigator.userAgent.includes('wv'); // Android WebView
          const hasManifest =
            document.querySelector('link[rel="manifest"]') !== null;

          // Force PWA mode if the app is installed (regardless of detection)
          const isPWAMode =
            isInstalled || isStandalone || isIOSStandalone || isInAppBrowser;

          // Generate a session ID for this browser session
          const sessionId =
            sessionStorage.getItem('client-session-id') ||
            `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

          if (!sessionStorage.getItem('client-session-id')) {
            sessionStorage.setItem('client-session-id', sessionId);
          }

          console.log(`📱 PWA Detection Details:`, {
            isStandalone,
            isIOSStandalone,
            isInAppBrowser,
            hasManifest,
            isPWAMode,
            userAgent: navigator.userAgent,
          });

          console.log(
            `📱 Registering client: ${session.user.id} (PWA: ${isPWAMode})`
          );

          // Register with backend broadcaster via API
          const response = await fetch('/api/client-register', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              sessionId,
              isPWA: isPWAMode,
              userAgent: navigator.userAgent,
              pwaDetails: {
                isStandalone,
                isIOSStandalone,
                isInAppBrowser,
                hasManifest,
              },
            }),
          });

          if (response.ok) {
            const result = await response.json();
            console.log('✅ Client registered successfully:', result);
            console.log(`📊 Current PWA clients: ${result.stats.pwaClients}`);
          } else {
            const error = await response.json();
            console.error('❌ Failed to register client:', error);
          }
        } catch (error) {
          console.error('❌ Error registering client:', error);
        }
      };

      registerClient();

      // Update activity every 30 seconds to keep session alive
      const activityInterval = setInterval(async () => {
        const sessionId = sessionStorage.getItem('client-session-id');
        if (sessionId) {
          try {
            await fetch('/api/client-register', {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ sessionId }),
            });
          } catch (error) {
            console.log('Failed to update activity:', error);
          }
        }
      }, 30000);

      // Cleanup on unmount
      return () => {
        clearInterval(activityInterval);
        const sessionId = sessionStorage.getItem('client-session-id');
        if (sessionId) {
          // Unregister client when component unmounts
          fetch('/api/client-register', {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ sessionId }),
          }).catch(console.error);
        }
      };
    }
  }, [session?.user?.id, isInstalled]);

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
