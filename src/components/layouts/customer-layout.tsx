"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
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
  Download
} from "lucide-react";
import { useCartStore } from "@/lib/store";
import { usePWA } from "@/hooks/usePWA";
import { usePushSubscription } from "@/hooks/usePushSubscription";
import { useNotificationListener } from "@/hooks/useNotificationListener";

interface CustomerLayoutProps {
  children: React.ReactNode;
}

const navigation = [
  { name: "Home", href: "/", icon: Home },
  { name: "Restaurants", href: "/restaurants", icon: Search },
  { name: "Orders", href: "/orders", icon: Clock },
  { name: "Profile", href: "/profile", icon: User },
];

export default function CustomerLayout({ children }: CustomerLayoutProps) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { cart } = useCartStore();
  const { isInstallable, installApp, isInstalled, showInstallPrompt, isOnline } = usePWA();
  const { isSubscribed, isSubscribing } = usePushSubscription(); // Auto-subscribe to push notifications
  useNotificationListener(); // Listen for real-time notifications

  const cartItemCount = cart?.items.reduce((total, item) => total + item.quantity, 0) || 0;

  // Register client with notification broadcaster
  useEffect(() => {
    if (session?.user?.id) {
      const registerClient = async () => {
        try {
          // Enhanced PWA detection - check multiple indicators
          const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
          const isIOSStandalone = (window.navigator as any).standalone === true;
          const isInAppBrowser = window.navigator.userAgent.includes('wv'); // Android WebView
          const hasManifest = document.querySelector('link[rel="manifest"]') !== null;
          
          // Force PWA mode if the app is installed (regardless of detection)
          const isPWAMode = isInstalled || isStandalone || isIOSStandalone || isInAppBrowser;
          
          // Generate a session ID for this browser session
          const sessionId = sessionStorage.getItem('client-session-id') || 
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
            userAgent: navigator.userAgent
          });
          
          console.log(`📱 Registering client: ${session.user.id} (PWA: ${isPWAMode})`);
          
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
                hasManifest
              }
            })
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
              body: JSON.stringify({ sessionId })
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
            body: JSON.stringify({ sessionId })
          }).catch(console.error);
        }
      };
    }
  }, [session?.user?.id, isInstalled]);

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-primary-dark-green">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-accent-leaf-green">
            <span className="text-brand font-bold text-xl text-primary-dark-green">A</span>
          </div>
          <h1 className="text-brand text-2xl font-bold mb-4 text-off-white">Aasta</h1>
          <p className="text-off-white mb-4">Please sign in to continue</p>
          <Link href="/auth/signin">
            <Button className="btn-primary">Sign In</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-off-white">
      {/* Offline Indicator */}
      {!isOnline && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-red-600 text-white p-2 text-center text-sm">
          <div className="flex items-center justify-center space-x-2">
            <span>You're offline. Some features may not be available.</span>
          </div>
        </div>
      )}
      
      {/* Header */}
      <header className="sticky top-0 z-40 bg-primary-dark-green shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full flex items-center justify-center bg-accent-leaf-green">
                  <span className="text-brand font-bold text-primary-dark-green">A</span>
                </div>
                <span className="text-brand text-xl font-bold text-off-white">Aasta</span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? "text-accent-leaf-green bg-primary-dark-green/50"
                        : "text-off-white hover:text-accent-leaf-green hover:bg-primary-dark-green/30"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Right side */}
            <div className="flex items-center space-x-4">
              {/* PWA Install Button - Desktop */}
              {isInstallable && !isInstalled && !showInstallPrompt && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={installApp}
                  className="hidden md:flex items-center space-x-1 border-accent-leaf-green text-accent-leaf-green hover:bg-accent-leaf-green hover:text-primary-dark-green"
                >
                  <Download className="w-4 h-4" />
                  <span>Install App</span>
                </Button>
              )}

              {/* Notification Status */}
              {isInstalled && (
                <div className="hidden md:flex items-center space-x-1 text-xs text-off-white/70">
                  <Bell className={`w-3 h-3 ${isSubscribed ? 'text-green-400' : 'text-yellow-400'}`} />
                  <span>{isSubscribed ? 'Notifications On' : 'Setting up...'}</span>
                </div>
              )}

              {/* Cart */}
              <Link href="/cart" className="relative p-2 text-off-white hover:text-accent-leaf-green">
                <ShoppingCart className="w-6 h-6" />
                {cartItemCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center p-0 text-xs bg-accent-leaf-green text-primary-dark-green">
                    {cartItemCount}
                  </Badge>
                )}
              </Link>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={session.user?.image || ""} alt={session.user?.name || ""} />
                      <AvatarFallback className="bg-accent-leaf-green text-primary-dark-green">
                        {session.user?.name?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      {session.user?.name && (
                        <p className="font-medium">{session.user.name}</p>
                      )}
                      {session.user?.email && (
                        <p className="w-[200px] truncate text-sm text-muted-foreground">
                          {session.user.email}
                        </p>
                      )}
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/orders">
                      <Clock className="mr-2 h-4 w-4" />
                      <span>Orders</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onSelect={(event) => {
                      event.preventDefault();
                      signOut();
                    }}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Mobile menu button */}
              <Button
                variant="ghost"
                className="md:hidden p-2 text-off-white"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-primary-dark-green border-t border-primary-dark-green/20">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium ${
                      isActive
                        ? "text-accent-leaf-green bg-primary-dark-green/50"
                        : "text-off-white hover:text-accent-leaf-green hover:bg-primary-dark-green/30"
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
              
              {/* Mobile PWA Install Button */}
              {isInstallable && !isInstalled && (
                <Button
                  variant="outline"
                  onClick={() => {
                    installApp();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full mt-2 mx-3 border-accent-leaf-green text-accent-leaf-green hover:bg-accent-leaf-green hover:text-primary-dark-green"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Install App
                </Button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-primary-dark-green text-off-white py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 rounded-full flex items-center justify-center bg-accent-leaf-green">
                  <span className="text-brand font-bold text-primary-dark-green">A</span>
                </div>
                <span className="text-brand text-xl font-bold">Aasta</span>
              </div>
              <p className="text-off-white/80">
                Premium night delivery service from 9 PM to 12 AM
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-off-white/80">
                <li><Link href="/restaurants" className="hover:text-accent-leaf-green">Restaurants</Link></li>
                <li><Link href="/orders" className="hover:text-accent-leaf-green">Orders</Link></li>
                <li><Link href="/profile" className="hover:text-accent-leaf-green">Profile</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-off-white/80">
                <li><Link href="/help" className="hover:text-accent-leaf-green">Help Center</Link></li>
                <li><Link href="/contact" className="hover:text-accent-leaf-green">Contact Us</Link></li>
                <li><Link href="/terms" className="hover:text-accent-leaf-green">Terms of Service</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Contact</h3>
              <div className="space-y-2 text-off-white/80">
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4" />
                  <span>Available in select cities</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4" />
                  <span>9 PM - 12 AM</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-primary-dark-green/20 mt-8 pt-8 text-center text-off-white/60">
            <p>&copy; 2024 Aasta. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
} 