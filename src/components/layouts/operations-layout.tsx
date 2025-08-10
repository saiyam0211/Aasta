"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Store, 
  Users, 
  Truck, 
  ShoppingCart, 
  PlusCircle,
  BarChart3,
  Activity,
  LogOut,
  Settings,
  Menu,
  X,
  Clock,
  MapPin
} from "lucide-react";

interface OperationsLayoutProps {
  children: React.ReactNode;
  type: 'restaurant' | 'delivery';
}

export default function OperationsLayout({ children, type }: OperationsLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check authentication
    const session = localStorage.getItem('operations-session');
    if (!session) {
      router.push('/operations/login');
      return;
    }

    const sessionData = JSON.parse(session);
    if (sessionData.type !== type) {
      router.push('/operations/login');
      return;
    }
  }, [router, type]);

  const handleLogout = () => {
    localStorage.removeItem('operations-session');
    router.push('/operations/login');
  };

const restaurantNavItems = [
  { href: "/operations/restaurant/dashboard", icon: Activity, label: "Dashboard", active: true },
  { href: "/operations/restaurant/restaurants", icon: Store, label: "Restaurants" },
  { href: "/operations/restaurant/orders", icon: ShoppingCart, label: "Live Orders" },
  { href: "/operations/restaurant/notifications", icon: PlusCircle, label: "Send Notifications" },
  { href: "/operations/restaurant/partners", icon: Users, label: "Assigned Partners" },
  { href: "/operations/restaurant/analytics", icon: BarChart3, label: "Analytics" },
];

  const deliveryNavItems = [
    { href: "/operations/delivery/dashboard", icon: Activity, label: "Dashboard", active: true },
    { href: "/operations/delivery/partners", icon: Users, label: "Delivery Partners" },
    { href: "/operations/delivery/assignments", icon: MapPin, label: "Order Assignments" },
    { href: "/operations/delivery/orders", icon: ShoppingCart, label: "Live Orders" },
    { href: "/operations/delivery/analytics", icon: BarChart3, label: "Analytics" },
  ];

  const navItems = type === 'restaurant' ? restaurantNavItems : deliveryNavItems;
  const title = type === 'restaurant' ? 'Restaurant Operations' : 'Delivery Operations';
  const icon = type === 'restaurant' ? Store : Truck;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" 
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
              {React.createElement(icon, { className: "w-5 h-5 text-[#002a01]" })}
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
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  item.active 
                    ? 'text-[#d1f86a] bg-[#d1f86a]/10 border border-[#d1f86a]/20'
                    : 'text-[#fcfefe]/80 hover:text-[#d1f86a] hover:bg-[#fcfefe]/5'
                }`}
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.label}
              </Link>
            ))}
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

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Mobile Header */}
        <div className="lg:hidden bg-white shadow-sm border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          >
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
          <div className="w-10"></div>
        </div>

        {/* Page Content */}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
