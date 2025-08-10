
"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  Store, 
  Users, 
  Truck, 
  ShoppingCart, 
  BarChart3, 
  Settings, 
  LogOut,
  Activity,
  Menu,
  X,
  Bell,
  Search
} from "lucide-react";
import { Card } from "@/components/ui/card";

interface AdminLayoutProps {
  children: React.ReactNode;
}

const navigationItems = [
  { 
    name: "Dashboard", 
    href: "/admin/dashboard", 
    icon: LayoutDashboard 
  },
  { 
    name: "Restaurants", 
    href: "/admin/restaurants", 
    icon: Store 
  },
  { 
    name: "Menu Management", 
    href: "/admin/menu", 
    icon: ShoppingCart 
  },
  { 
    name: "Customers", 
    href: "/admin/customers", 
    icon: Users 
  },
  { 
    name: "Delivery Partners", 
    href: "/admin/delivery-partners", 
    icon: Truck 
  },
  { 
    name: "Analytics", 
    href: "/admin/analytics", 
    icon: BarChart3 
  },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === 'loading') return; // Still loading
    
    if (!session && pathname !== "/admin/login") {
      router.push("/admin/login");
    } else if (session && session.user?.role !== 'ADMIN' && pathname !== "/admin/login") {
      router.push("/admin/login");
    }
  }, [session, status, router, pathname]);

  const handleLogout = () => {
    signOut({ callbackUrl: '/admin/login' });
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-primary-dark-green">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-accent-leaf-green">
            <span className="text-brand font-bold text-xl text-primary-dark-green">A</span>
          </div>
          <h1 className="text-brand text-2xl font-bold mb-4 text-off-white">Aasta Admin</h1>
        </div>
      </div>
    );
  }

  if (!session || session.user?.role !== 'ADMIN') {
    return null;
  }

  return (
    <div className="min-h-screen bg-off-white">
      {/* Mobile sidebar overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#002a01] transform ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } transition-transform duration-200 ease-in-out lg:translate-x-0`}>
        {/* Sidebar Header */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-[#002a01]/20">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-[#d1f86a] rounded-lg flex items-center justify-center">
              <Store className="w-5 h-5 text-[#002a01]" />
            </div>
            <h2 className="text-xl font-bold text-[#d1f86a]">Aasta</h2>
          </div>
          <button 
                onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden p-2 rounded-md text-[#d1f86a] hover:bg-[#002a01]/50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="mt-8 px-4">
          <div className="space-y-2">
            {navigationItems.map((item, index) => {
              const isActive = pathname === item.href || (pathname?.startsWith('/admin/customers') && item.href === '/admin/customers');
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'text-[#d1f86a] bg-[#d1f86a]/10 border border-[#d1f86a]/20'
                      : 'text-[#fcfefe]/80 hover:text-[#d1f86a] hover:bg-[#fcfefe]/5'
                  }`}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Bottom Section */}
        <div className="absolute bottom-4 left-4 right-4 space-y-2">
          <button className="flex items-center w-full px-4 py-3 text-sm font-medium text-[#fcfefe]/80 hover:text-[#d1f86a] hover:bg-[#fcfefe]/5 rounded-lg transition-colors">
            <Settings className="w-5 h-5 mr-3" />
            Settings
          </button>
          <button 
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-3 text-sm font-medium text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Sign Out
          </button>
        </div>
      </div>


      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top header */}
        <header className="bg-gradient-to-r from-white to-gray-50 shadow-lg border-b border-gray-200/50 backdrop-blur-sm relative">
          <div className="absolute inset-0 bg-gradient-to-r from-accent-leaf-green/5 to-bright-yellow/5"></div>
          <div className="flex items-center justify-between px-6 py-5 relative z-10">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden mr-3 touchable hover:bg-accent-leaf-green/20 p-2 rounded-xl"
                onClick={() => setIsSidebarOpen(true)}
              >
                <Menu className="h-6 w-6 text-primary-dark-green" />
              </Button>
              <div>
                <h1 className="text-heading text-3xl font-bold text-primary-dark-green">
                  Admin Dashboard
                </h1>
                <p className="text-xs text-primary-dark-green/60 mt-1">Manage your delivery platform</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" className="touchable relative hover:bg-accent-leaf-green/20 p-3 rounded-xl">
                <Bell className="h-5 w-5 text-primary-dark-green" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              </Button>
              <div className="flex items-center space-x-3 bg-white/70 backdrop-blur-sm rounded-2xl p-2 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-leaf-green to-bright-yellow flex items-center justify-center shadow-lg">
                  <span className="text-sm font-bold text-primary-dark-green">
                    {session.user?.name?.charAt(0) || 'A'}
                  </span>
                </div>
                <div>
                  <span className="text-sm font-semibold text-primary-dark-green block">
                    {session.user?.name || 'Admin'}
                  </span>
                  <span className="text-xs text-primary-dark-green/60">Administrator</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
