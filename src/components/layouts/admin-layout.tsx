"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
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
  Menu,
  X,
  Bell,
  Search
} from "lucide-react";
import { adminSession, AdminUser } from "@/lib/admin-auth";
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
    href: "/admin/delivery", 
    icon: Truck 
  },
  { 
    name: "Analytics", 
    href: "/admin/analytics", 
    icon: BarChart3 
  },
  { 
    name: "Settings", 
    href: "/admin/settings", 
    icon: Settings 
  },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const session = adminSession.get();
    if (!session) {
      router.push("/admin/login");
    } else {
      setAdminUser(session);
    }
    setIsLoading(false);
  }, [router]);

  const handleLogout = () => {
    adminSession.clear();
    router.push("/admin/login");
  };

  if (isLoading) {
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

  if (!adminUser) {
    return null;
  }

  return (
    <div className="min-h-screen bg-off-white">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden" 
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-primary-dark-green to-primary-dark-green/95 backdrop-blur-sm transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-all duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 shadow-2xl`}>
        <div className="flex items-center justify-center h-20 px-4 border-b border-accent-leaf-green/30 bg-gradient-to-r from-primary-dark-green to-primary-dark-green/80">
          <div className="flex items-center space-x-3 group">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br from-accent-leaf-green to-bright-yellow shadow-lg group-hover:scale-105 transition-transform duration-300">
              <span className="text-brand font-bold text-xl text-primary-dark-green">A</span>
            </div>
            <div>
              <span className="text-brand text-xl font-bold text-off-white block">Aasta Admin</span>
              <span className="text-xs text-accent-leaf-green/80">Control Panel</span>
            </div>
          </div>
        </div>

        <nav className="mt-8">
          <div className="px-4 space-y-3">
            {navigationItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-4 py-4 text-sm font-medium rounded-2xl transition-all duration-300 touchable group relative overflow-hidden ${
                    isActive
                      ? 'bg-gradient-to-r from-accent-leaf-green to-bright-yellow text-primary-dark-green shadow-lg transform scale-105'
                      : 'text-off-white hover:bg-gradient-to-r hover:from-accent-leaf-green/20 hover:to-bright-yellow/20 hover:text-accent-leaf-green hover:scale-105'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className={`absolute inset-0 bg-gradient-to-r from-accent-leaf-green/10 to-bright-yellow/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${isActive ? 'opacity-100' : ''}`}></div>
                  <Icon className={`mr-4 h-5 w-5 relative z-10 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                  <span className="relative z-10">{item.name}</span>
                  {isActive && (
                    <div className="absolute right-2 w-2 h-2 bg-primary-dark-green rounded-full animate-pulse"></div>
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="absolute bottom-0 w-full p-4">
          <Button
            onClick={handleLogout}
            className="w-full flex items-center justify-center px-4 py-4 text-sm font-medium text-off-white bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 rounded-2xl transition-all duration-300 touchable shadow-lg hover:shadow-xl transform hover:scale-105 group"
          >
            <LogOut className="mr-3 h-5 w-5 group-hover:rotate-12 transition-transform duration-300" />
            <span>Sign Out</span>
          </Button>
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
                onClick={() => setSidebarOpen(true)}
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
                    {adminUser.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <span className="text-sm font-semibold text-primary-dark-green block">
                    {adminUser.name}
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
