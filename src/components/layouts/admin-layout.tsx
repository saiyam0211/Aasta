'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
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
  Search,
} from 'lucide-react';
import { Card } from '@/components/ui/card';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const navigationItems = [
  {
    name: 'Dashboard',
    href: '/admin/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'Restaurants',
    href: '/admin/restaurants',
    icon: Store,
  },
  {
    name: 'Menu Management',
    href: '/admin/menu',
    icon: ShoppingCart,
  },
  {
    name: 'Customers',
    href: '/admin/customers',
    icon: Users,
  },
  {
    name: 'Delivery Partners',
    href: '/admin/delivery-partners',
    icon: Truck,
  },
  {
    name: 'Analytics',
    href: '/admin/analytics',
    icon: BarChart3,
  },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === 'loading') return; // Still loading

    if (!session && pathname !== '/admin/login') {
      router.push('/admin/login');
    } else if (
      session &&
      session.user?.role !== 'ADMIN' &&
      pathname !== '/admin/login'
    ) {
      router.push('/admin/login');
    }
  }, [session, status, router, pathname]);

  const handleLogout = () => {
    signOut({ callbackUrl: '/admin/login' });
  };

  if (status === 'loading') {
    return (
      <div className="bg-primary-dark-green flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="bg-accent-leaf-green mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
            <span className="text-brand text-primary-dark-green text-xl font-bold">
              A
            </span>
          </div>
          <h1 className="text-brand text-off-white mb-4 text-2xl font-bold">
            Aasta Admin
          </h1>
        </div>
      </div>
    );
  }

  if (!session || session.user?.role !== 'ADMIN') {
    return null;
  }

  return (
    <div className="bg-off-white min-h-screen">
      {/* Mobile sidebar overlay */}
      {isSidebarOpen && (
        <div
          className="bg-opacity-50 fixed inset-0 z-40 bg-black lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-[#002a01] ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } transition-transform duration-200 ease-in-out lg:translate-x-0`}
      >
        {/* Sidebar Header */}
        <div className="flex h-16 items-center justify-between border-b border-[#002a01]/20 px-6">
          <div className="flex items-center space-x-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#d1f86a]">
              <Store className="h-5 w-5 text-[#002a01]" />
            </div>
            <h2 className="text-xl font-bold text-[#d1f86a]">Aasta</h2>
          </div>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="rounded-md p-2 text-[#d1f86a] hover:bg-[#002a01]/50 lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="mt-8 px-4">
          <div className="space-y-2">
            {navigationItems.map((item, index) => {
              const isActive =
                pathname === item.href ||
                (pathname?.startsWith('/admin/customers') &&
                  item.href === '/admin/customers');
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                    isActive
                      ? 'border border-[#d1f86a]/20 bg-[#d1f86a]/10 text-[#d1f86a]'
                      : 'text-[#fcfefe]/80 hover:bg-[#fcfefe]/5 hover:text-[#d1f86a]'
                  }`}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Bottom Section */}
        <div className="absolute right-4 bottom-4 left-4 space-y-2">
          <button className="flex w-full items-center rounded-lg px-4 py-3 text-sm font-medium text-[#fcfefe]/80 transition-colors hover:bg-[#fcfefe]/5 hover:text-[#d1f86a]">
            <Settings className="mr-3 h-5 w-5" />
            Settings
          </button>
          <button
            onClick={handleLogout}
            className="flex w-full items-center rounded-lg px-4 py-3 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/10"
          >
            <LogOut className="mr-3 h-5 w-5" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top header */}
        <header className="relative border-b border-gray-200/50 bg-gradient-to-r from-white to-gray-50 shadow-lg backdrop-blur-sm">
          <div className="from-accent-leaf-green/5 to-bright-yellow/5 absolute inset-0 bg-gradient-to-r"></div>
          <div className="relative z-10 flex items-center justify-between px-6 py-5">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                className="touchable hover:bg-accent-leaf-green/20 mr-3 rounded-xl p-2 lg:hidden"
                onClick={() => setIsSidebarOpen(true)}
              >
                <Menu className="text-primary-dark-green h-6 w-6" />
              </Button>
              <div>
                <h1 className="text-heading text-primary-dark-green text-3xl font-bold">
                  Admin Dashboard
                </h1>
                <p className="text-primary-dark-green/60 mt-1 text-xs">
                  Manage your delivery platform
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                className="touchable hover:bg-accent-leaf-green/20 relative rounded-xl p-3"
              >
                <Bell className="text-primary-dark-green h-5 w-5" />
                <div className="absolute -top-1 -right-1 h-3 w-3 animate-pulse rounded-full bg-red-500"></div>
              </Button>
              <div className="flex items-center space-x-3 rounded-2xl bg-white/70 p-2 shadow-sm backdrop-blur-sm">
                <div className="from-accent-leaf-green to-bright-yellow flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br shadow-lg">
                  <span className="text-primary-dark-green text-sm font-bold">
                    {session.user?.name?.charAt(0) || 'A'}
                  </span>
                </div>
                <div>
                  <span className="text-primary-dark-green block text-sm font-semibold">
                    {session.user?.name || 'Admin'}
                  </span>
                  <span className="text-primary-dark-green/60 text-xs">
                    Administrator
                  </span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
