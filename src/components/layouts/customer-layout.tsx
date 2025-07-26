"use client";

import { useState } from "react";
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
  LogOut
} from "lucide-react";
import { useCartStore } from "@/lib/store";

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

  const cartItemCount = cart?.items.reduce((total, item) => total + item.quantity, 0) || 0;

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/auth/signin" });
  };

  return (
    <div className="min-h-screen bg-off-white">
      {/* Header */}
      <header className="shadow-sm border-b sticky top-0 z-50 bg-primary-dark-green border-primary-dark-green">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-2 touchable">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-accent-leaf-green">
                  <span className="text-brand font-bold text-sm text-primary-dark-green">A</span>
                </div>
                <span className="text-brand text-xl font-bold hidden sm:block text-off-white">
                  Aasta
                </span>
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
                    className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors touchable ${
                      isActive
                        ? "bg-accent-leaf-green text-primary-dark-green"
                        : "text-off-white hover:text-white"
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            {/* Right side */}
            <div className="flex items-center space-x-4">
              {/* Cart */}
              <Link href="/cart">
                <Button variant="ghost" size="sm" className="relative touchable hover:bg-white/10 text-off-white">
                  <ShoppingCart className="w-5 h-5" />
                  {cartItemCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-xs flex items-center justify-center bg-bright-yellow text-primary-dark-green">
                      {cartItemCount}
                    </Badge>
                  )}
                </Button>
              </Link>

              {/* Notifications */}
              <Button variant="ghost" size="sm" className="touchable hover:bg-white/10 text-off-white">
                <Bell className="w-5 h-5" />
              </Button>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full touchable hover:bg-white/10">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={session?.user?.image || ""} alt={session?.user?.name || ""} />
                      <AvatarFallback className="bg-accent-leaf-green text-primary-dark-green">
                        {session?.user?.name?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-off-white border border-primary-dark-green" align="end" forceMount>
                  <div className="flex flex-col space-y-1 p-2">
                    <p className="text-sm font-medium leading-none selectable text-primary-dark-green">{session?.user?.name}</p>
                    <p className="text-xs leading-none text-muted-foreground selectable">
                      {session?.user?.email}
                    </p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="touchable">
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/addresses" className="touchable">
                      <MapPin className="mr-2 h-4 w-4" />
                      Addresses
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="touchable">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden touchable hover:bg-white/10 text-off-white"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t bg-primary-dark-green border-accent-leaf-green">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center px-3 py-2 rounded-md text-base font-medium transition-colors touchable ${
                      isActive
                        ? "bg-accent-leaf-green text-primary-dark-green"
                        : "text-off-white"
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Operating Hours Banner */}
      <div className="py-2 bg-accent-leaf-green">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center space-x-2 text-sm">
            <Clock className="w-4 h-4 text-primary-dark-green" />
            <span className="font-medium text-primary-dark-green">Operating Hours: 9:00 PM - 12:00 AM</span>
          </div>
        </div>
      </div>
    </div>
  );
} 