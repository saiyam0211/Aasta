'use client';

import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  Store,
  Menu,
  X,
  LayoutDashboard,
  ShoppingCart,
  ChefHat,
  BarChart3,
  Settings,
  LogOut,
  Bell,
} from 'lucide-react';
import Link from 'next/link';

interface Props {
  children: React.ReactNode;
  title?: string;
  showSidebar?: boolean;
}

const navigationItems = [
  {
    href: '/restaurant/dashboard',
    icon: LayoutDashboard,
    label: 'Dashboard',
    description: 'Overview & Stats',
  },
  {
    href: '/restaurant/orders',
    icon: ShoppingCart,
    label: 'Orders',
    description: 'Manage Orders',
  },
  {
    href: '/restaurant/menu',
    icon: ChefHat,
    label: 'Menu',
    description: 'Menu Management',
  },
  {
    href: '/restaurant/financials',
    icon: BarChart3,
    label: 'Analytics',
    description: 'Financial Reports',
  },
];

export default function RestaurantLayout({
  children,
  title,
  showSidebar = true,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-lg">
          <Store className="text-primary-dark-green mx-auto mb-4 h-16 w-16" />
          <h2 className="text-primary-dark-green mb-2 text-2xl font-bold">
            Authentication Required
          </h2>
          <p className="mb-6 text-gray-600">
            Please log in to access the restaurant dashboard.
          </p>
          <Button
            onClick={() => router.push('/restaurant/auth/signin')}
            className="bg-accent-leaf-green hover:bg-accent-leaf-green/90 text-primary-dark-green border-primary-dark-green touchable rounded-xl border-2 px-8 py-3 font-semibold"
          >
            Log In
          </Button>
        </div>
      </div>
    );
  }

  const currentItem = navigationItems.find((item) =>
    pathname?.startsWith(item.href)
  );

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && showSidebar && (
        <div
          className="bg-opacity-50 fixed inset-0 z-40 bg-black lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      {showSidebar && (
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-64 transform border-r border-gray-200 bg-white ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } shadow-xl transition-transform duration-300 ease-in-out lg:static lg:flex lg:translate-x-0 lg:flex-col lg:shadow-none`}
        >
          {/* Sidebar Header */}
          <div className="bg-primary-dark-green flex h-16 flex-shrink-0 items-center justify-between border-b border-gray-200 px-4">
            <div className="flex items-center space-x-3">
              <div className="bg-accent-leaf-green flex h-8 w-8 items-center justify-center rounded-lg shadow-md">
                <span className="text-primary-dark-green text-sm font-bold">
                  A
                </span>
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Aasta</h2>
                <p className="text-accent-leaf-green text-xs">
                  Restaurant Portal
                </p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="rounded-lg p-1.5 text-white transition-colors hover:bg-white/10 lg:hidden"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* User Info */}
          <div className="flex-shrink-0 border-b border-gray-100 p-4">
            <div className="flex items-center space-x-3">
              <div className="from-accent-leaf-green to-bright-yellow flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br shadow-md">
                <Store className="text-primary-dark-green h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-900">
                  {session.user?.name || 'Restaurant Owner'}
                </p>
                <p className="truncate text-xs text-gray-500">
                  {session.user?.email}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
            {navigationItems.map((item) => {
              const isActive = pathname?.startsWith(item.href) || false;
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'from-accent-leaf-green to-bright-yellow text-primary-dark-green bg-gradient-to-r shadow-sm'
                      : 'hover:text-primary-dark-green text-gray-600 hover:bg-gray-50'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon
                    className={`mr-3 h-4 w-4 flex-shrink-0 ${
                      isActive
                        ? 'text-primary-dark-green'
                        : 'group-hover:text-primary-dark-green text-gray-400'
                    }`}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-semibold">{item.label}</div>
                    <div
                      className={`truncate text-xs ${
                        isActive
                          ? 'text-primary-dark-green/70'
                          : 'text-gray-400'
                      }`}
                    >
                      {item.description}
                    </div>
                  </div>
                </Link>
              );
            })}
          </nav>

          {/* Sidebar Footer */}
          <div className="flex-shrink-0 space-y-1 border-t border-gray-100 p-3">
            <Button
              variant="ghost"
              size="sm"
              className="hover:text-primary-dark-green h-auto w-full justify-start rounded-lg py-2 text-gray-600 hover:bg-gray-50"
            >
              <Settings className="mr-3 h-4 w-4" />
              Settings
            </Button>
            <Button
              onClick={() =>
                signOut({ callbackUrl: '/restaurant/auth/signin' })
              }
              variant="ghost"
              size="sm"
              className="h-auto w-full justify-start rounded-lg py-2 text-red-600 hover:bg-red-50 hover:text-red-700"
            >
              <LogOut className="mr-3 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </aside>
      )}

      {/* Main Content */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top Header */}
        <header className="sticky top-0 z-30 flex-shrink-0 border-b border-gray-200 bg-white shadow-sm">
          <div className="flex h-14 items-center justify-between px-4 sm:px-6">
            <div className="flex min-w-0 items-center space-x-3">
              {showSidebar && (
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="hover:text-primary-dark-green rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 lg:hidden"
                >
                  <Menu className="h-5 w-5" />
                </button>
              )}
              <div className="min-w-0">
                <h1 className="text-primary-dark-green truncate text-lg font-bold">
                  {title || currentItem?.label || 'Restaurant Dashboard'}
                </h1>
                {currentItem && (
                  <p className="truncate text-sm text-gray-500">
                    {currentItem.description}
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-shrink-0 items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                className="relative rounded-lg p-2 hover:bg-gray-100"
              >
                <Bell className="h-4 w-4 text-gray-600" />
                <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-red-500"></span>
              </Button>

              {!showSidebar && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.back()}
                  className="hover:text-primary-dark-green hover:border-primary-dark-green rounded-lg border-gray-200 text-gray-600"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-4 sm:p-6">
          <div className="mx-auto max-w-full">{children}</div>
        </main>
      </div>
    </div>
  );
}
