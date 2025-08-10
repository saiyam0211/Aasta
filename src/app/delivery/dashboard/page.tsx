"use client";

import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Truck, MapPin, Clock, TrendingUp, DollarSign, RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface DeliveryPartnerData {
  id: string;
  status: 'AVAILABLE' | 'BUSY' | 'OFFLINE';
  rating: number;
  completedDeliveries: number;
  todayEarnings: number;
  totalEarnings: number;
  assignedRestaurants: string[];
  user: {
    name: string;
    email: string;
    phone: string;
  };
}

interface ActiveOrder {
  id: string;
  restaurant: {
    name: string;
    address: string;
  };
  customer: {
    name: string;
    address: string;
    phone: string;
  };
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  status: string;
  estimatedDeliveryTime?: string;
}

export default function DeliveryDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [partnerData, setPartnerData] = useState<DeliveryPartnerData | null>(null);
  const [activeOrders, setActiveOrders] = useState<ActiveOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Load partner data
  const loadPartnerData = async () => {
    try {
      const response = await fetch('/api/delivery-partners/me');
      const data = await response.json();
      
      if (data.success) {
        setPartnerData(data.data);
      } else {
        console.error('Failed to load partner data:', data.error);
        toast.error('Failed to load your profile data');
      }
    } catch (error) {
      console.error('Error loading partner data:', error);
      toast.error('Failed to load profile data');
    }
  };

  // Load active orders
  const loadActiveOrders = async () => {
    try {
      const response = await fetch('/api/delivery-partners/me/orders');
      const data = await response.json();
      
      if (data.success) {
        setActiveOrders(data.data || []);
      } else {
        console.error('Failed to load active orders:' , data.error);
      }
    } catch (error) {
      console.error('Error loading active orders:', error);
    }
  };

  // Toggle status between AVAILABLE and OFFLINE
  const toggleStatus = async () => {
    if (!partnerData) return;
    
    try {
      setIsUpdatingStatus(true);
      const newStatus = partnerData.status === 'AVAILABLE' ? 'OFFLINE' : 'AVAILABLE';
      
      const response = await fetch(`/api/delivery-partners/${partnerData.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        setPartnerData(prev => prev ? { ...prev, status: newStatus } : null);
        toast.success(`Status updated to ${newStatus.toLowerCase()}`);
      } else {
        console.error('Failed to update status');
        toast.error('Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Load data on mount and set up polling
  useEffect(() => {
    if (status === "loading") return;
    
    if (!session) {
      router.push("/delivery/auth/signin");
      return;
    }

    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([loadPartnerData(), loadActiveOrders()]);
      setIsLoading(false);
    };

    loadData();

    // Set up polling every 30 seconds for real-time updates
    const interval = setInterval(() => {
      loadPartnerData();
      loadActiveOrders();
    }, 30000);

    return () => clearInterval(interval);
  }, [session, status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  // Loading state
  if (isLoading || !partnerData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    );
  }

  // Helper functions
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return 'bg-green-100 text-green-800';
      case 'BUSY':
        return 'bg-yellow-100 text-yellow-800';
      case 'OFFLINE':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusDotColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return 'bg-green-500';
      case 'BUSY':
        return 'bg-yellow-500';
      case 'OFFLINE':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg flex items-center justify-center mr-3">
                <Truck className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">Delivery Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Badge className={getStatusColor(partnerData.status)}>
                {partnerData.status.charAt(0) + partnerData.status.slice(1).toLowerCase()}
              </Badge>
              <span className="text-sm text-gray-600">Welcome, {partnerData.user.name}</span>
              <Button 
                variant="outline" 
                onClick={() => signOut({ callbackUrl: "/delivery/auth/signin" })}
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Delivery Partner Dashboard</h2>
          <p className="text-gray-600">Manage your deliveries and track earnings</p>
        </div>

        {/* Status Card */}
        <div className="mb-6">
          <Card className={`border-2 ${
            partnerData.status === 'AVAILABLE' ? 'bg-green-50 border-green-200' :
            partnerData.status === 'BUSY' ? 'bg-yellow-50 border-yellow-200' :
            'bg-red-50 border-red-200'
          }`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${getStatusDotColor(partnerData.status)}`}></div>
                  <div>
                    <h3 className="font-semibold text-gray-800">
                      You're currently {partnerData.status.toLowerCase()}
                    </h3>
                    <p className="text-gray-700">
                      {partnerData.status === 'AVAILABLE' 
                        ? 'You can receive delivery requests'
                        : partnerData.status === 'BUSY'
                        ? 'You have active deliveries'
                        : 'Go online to start receiving delivery requests'
                      }
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button 
                    onClick={() => {
                      loadPartnerData();
                      loadActiveOrders();
                    }}
                    variant="outline"
                    size="sm"
                    disabled={isUpdatingStatus}
                  >
                    <RefreshCw className={`w-4 h-4 ${isUpdatingStatus ? 'animate-spin' : ''}`} />
                  </Button>
                  <Button 
                    onClick={toggleStatus}
                    disabled={isUpdatingStatus || partnerData.status === 'BUSY'}
                    className={`${
                      partnerData.status === 'AVAILABLE' 
                        ? 'bg-red-600 hover:bg-red-700' 
                        : 'bg-green-600 hover:bg-green-700'
                    }`}
                  >
                    {isUpdatingStatus ? 'Updating...' : 
                     partnerData.status === 'AVAILABLE' ? 'Go Offline' : 'Go Online'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-600">Today's Earnings</CardTitle>
                <DollarSign className="w-4 h-4 text-gray-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{partnerData.todayEarnings}</div>
              <p className="text-xs text-gray-500">
                {partnerData.todayEarnings > 0 
                  ? `From ${activeOrders.length} deliveries` 
                  : 'No deliveries yet today'
                }
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-600">Deliveries</CardTitle>
                <Truck className="w-4 h-4 text-gray-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{partnerData.completedDeliveries}</div>
              <p className="text-xs text-gray-500">Total completed</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-600">Active Orders</CardTitle>
                <Clock className="w-4 h-4 text-gray-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeOrders.length}</div>
              <p className="text-xs text-gray-500">Current batches</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-600">Rating</CardTitle>
                <TrendingUp className="w-4 h-4 text-gray-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{partnerData.rating.toFixed(1)}</div>
              <p className="text-xs text-gray-500">Customer rating</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg">Active Deliveries</CardTitle>
              <CardDescription>View your current delivery batches</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline">
                View Active Deliveries (0)
              </Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg">Delivery History</CardTitle>
              <CardDescription>Check your past delivery records</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline">
                View History
              </Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg">Earnings Report</CardTitle>
              <CardDescription>Track your weekly and monthly earnings</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline">
                View Earnings
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Location Card */}
        <div className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="w-5 h-5" />
                <span>Your Location</span>
              </CardTitle>
              <CardDescription>Enable location to receive nearby delivery requests</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Location sharing: Disabled</span>
                <Button variant="outline">
                  Enable Location
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Operating Hours Notice */}
        <div>
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <Clock className="w-6 h-6 text-green-600" />
                <div>
                  <h3 className="font-semibold text-green-800">Night Delivery Hours</h3>
                  <p className="text-green-700">Earn more during peak hours: 9:00 PM to 12:00 AM</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
} 