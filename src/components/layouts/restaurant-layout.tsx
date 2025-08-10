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
  Bell
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
    description: 'Overview & Stats'
  },
  {
    href: '/restaurant/orders',
    icon: ShoppingCart,
    label: 'Orders',
    description: 'Manage Orders'
  },
  {
    href: '/restaurant/menu',
    icon: ChefHat,
    label: 'Menu',
    description: 'Menu Management'
  },
  {
    href: '/restaurant/financials',
    icon: BarChart3,
    label: 'Analytics',
    description: 'Financial Reports'
  }
];

export default function RestaurantLayout({ children, title, showSidebar = true }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center p-8 bg-white rounded-2xl shadow-lg border border-gray-200">
          <Store className="w-16 h-16 mx-auto mb-4 text-primary-dark-green" />
          <h2 className="text-2xl font-bold text-primary-dark-green mb-2">Authentication Required</h2>
          <p className="text-gray-600 mb-6">
            Please log in to access the restaurant dashboard.
          </p>
          <Button 
            onClick={() => router.push('/restaurant/auth/signin')}
            className="bg-accent-leaf-green hover:bg-accent-leaf-green/90 text-primary-dark-green border-2 border-primary-dark-green font-semibold px-8 py-3 rounded-xl touchable"
          >
            Log In
          </Button>
        </div>
      </div>
    );
  }

  const currentItem = navigationItems.find(item => pathname?.startsWith(item.href));

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && showSidebar && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" 
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      {showSidebar && (
        <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:flex lg:flex-col shadow-xl lg:shadow-none`}>
          {/* Sidebar Header */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 bg-primary-dark-green flex-shrink-0">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-accent-leaf-green rounded-lg flex items-center justify-center shadow-md">
                <span className="text-primary-dark-green font-bold text-sm">A</span>
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Aasta</h2>
                <p className="text-xs text-accent-leaf-green">Restaurant Portal</p>
              </div>
            </div>
            <button 
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1.5 rounded-lg text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* User Info */}
          <div className="p-4 border-b border-gray-100 flex-shrink-0">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-accent-leaf-green to-bright-yellow rounded-lg flex items-center justify-center shadow-md">
                <Store className="w-5 h-5 text-primary-dark-green" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {session.user?.name || 'Restaurant Owner'}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {session.user?.email}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {navigationItems.map((item) => {
              const isActive = pathname?.startsWith(item.href) || false;
              const Icon = item.icon;
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                    isActive 
                      ? 'bg-gradient-to-r from-accent-leaf-green to-bright-yellow text-primary-dark-green shadow-sm' 
                      : 'text-gray-600 hover:text-primary-dark-green hover:bg-gray-50'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className={`w-4 h-4 mr-3 flex-shrink-0 ${
                    isActive ? 'text-primary-dark-green' : 'text-gray-400 group-hover:text-primary-dark-green'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold truncate">{item.label}</div>
                    <div className={`text-xs truncate ${
                      isActive ? 'text-primary-dark-green/70' : 'text-gray-400'
                    }`}>
                      {item.description}
                    </div>
                  </div>
                </Link>
              );
            })}
          </nav>

          {/* Sidebar Footer */}
          <div className="p-3 border-t border-gray-100 space-y-1 flex-shrink-0">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-gray-600 hover:text-primary-dark-green hover:bg-gray-50 rounded-lg h-auto py-2"
            >
              <Settings className="w-4 h-4 mr-3" />
              Settings
            </Button>
            <Button
              onClick={() => signOut({ callbackUrl: '/restaurant/auth/signin' })}
              variant="ghost"
              size="sm"
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg h-auto py-2"
            >
              <LogOut className="w-4 h-4 mr-3" />
              Sign Out
            </Button>
          </div>
        </aside>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-30 flex-shrink-0">
          <div className="flex items-center justify-between h-14 px-4 sm:px-6">
            <div className="flex items-center space-x-3 min-w-0">
              {showSidebar && (
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden p-2 rounded-lg text-gray-600 hover:text-primary-dark-green hover:bg-gray-100 transition-colors"
                >
                  <Menu className="w-5 h-5" />
                </button>
              )}
              <div className="min-w-0">
                <h1 className="text-lg font-bold text-primary-dark-green truncate">
                  {title || currentItem?.label || 'Restaurant Dashboard'}
                </h1>
                {currentItem && (
                  <p className="text-sm text-gray-500 truncate">{currentItem.description}</p>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-3 flex-shrink-0">
              <Button
                variant="ghost"
                size="sm"
                className="relative p-2 rounded-lg hover:bg-gray-100"
              >
                <Bell className="w-4 h-4 text-gray-600" />
                <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full"></span>
              </Button>
              
              {!showSidebar && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => router.back()}
                  className="border-gray-200 text-gray-600 hover:text-primary-dark-green hover:border-primary-dark-green rounded-lg"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              )}
            </div>
          </div>
        </header>
        
        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 overflow-auto">
          <div className="max-w-full mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}