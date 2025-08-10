"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import OperationsLayout from "@/components/layouts/operations-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Store, 
  MapPin, 
  Phone, 
  Mail, 
  Star, 
  Clock,
  Users,
  DollarSign,
  ArrowLeft,
  Edit,
  Menu,
  ShoppingCart,
  TrendingUp,
  Calendar,
  RefreshCw
} from "lucide-react";
import Link from "next/link";
import EditDetailsModal from "@/components/EditDetailsModal";
import { toast } from "sonner";

interface Restaurant {
  id: string;
  name: string;
  ownerName: string;
  address: string;
  phone: string;
  email: string;
  cuisineTypes: string[];
  rating: number;
  totalOrders: number;
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING';
  minimumOrderAmount: number;
  deliveryRadius: number;
  averagePreparationTime: number;
  createdAt: string;
  latitude: number;
  longitude: number;
}

interface RestaurantStats {
  totalMenuItems: number;
  activeMenuItems: number;
  featuredMenuItems: number;
  totalRevenue: number;
  averageOrderValue: number;
}

export default function RestaurantDetailPage() {
  const params = useParams();
  const restaurantId = params?.id as string;
  if (!restaurantId) {
    return <div className="text-red-500">Invalid restaurant ID.</div>;
  }
  
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [stats, setStats] = useState<RestaurantStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, [restaurantId]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      
      // Load restaurant details
      const restaurantRes = await fetch(`/api/restaurants/${restaurantId}`);
      const restaurantData = await restaurantRes.json();
      if (restaurantData.success) {
        setRestaurant(restaurantData.data);
      }

      // Load menu items to calculate stats
      const menuRes = await fetch(`/api/menu-items?restaurantId=${restaurantId}`);
      const menuData = await menuRes.json();
      if (menuData.success) {
        const menuItems = menuData.data || [];
        setStats({
          totalMenuItems: menuItems.length,
          activeMenuItems: menuItems.filter((item: any) => item.available).length,
          featuredMenuItems: menuItems.filter((item: any) => item.featured).length,
          totalRevenue: 0, // This would come from orders data
          averageOrderValue: 0, // This would come from orders data
        });
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveRestaurantDetails = async (data: any) => {
    try {
      setIsSaving(true);
      
      const response = await fetch(`/api/restaurants/${restaurantId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      const result = await response.json();
      
      if (result.success) {
        toast.success('Restaurant details updated successfully!');
        setRestaurant(prev => prev ? { ...prev, ...result.data } : null);
        setIsEditModalOpen(false);
        await loadData(); // Refresh data to get updated values
      } else {
        toast.error(result.error || 'Failed to update restaurant details');
      }
    } catch (error) {
      console.error('Error updating restaurant:', error);
      toast.error('Failed to update restaurant details');
    } finally {
      setIsSaving(false);
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'INACTIVE':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (isLoading) {
    return (
      <OperationsLayout type="restaurant">
        <div className="space-y-6">
          <div className="text-center py-12">
            <p className="text-gray-500">Loading restaurant details...</p>
          </div>
        </div>
      </OperationsLayout>
    );
  }

  if (!restaurant) {
    return (
      <OperationsLayout type="restaurant">
        <div className="space-y-6">
          <div className="text-center py-12">
            <p className="text-red-500">Restaurant not found</p>
            <Link href="/operations/restaurant/restaurants">
              <Button className="mt-4 bg-accent-leaf-green hover:bg-accent-leaf-green/90 text-primary-dark-green touchable">
                Back to Restaurants
              </Button>
            </Link>
          </div>
        </div>
      </OperationsLayout>
    );
  }

  return (
    <OperationsLayout type="restaurant">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/operations/restaurant/restaurants">
              <Button className="bg-gray-100 hover:bg-gray-200 text-gray-700 touchable">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Restaurants
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-[#002a01]">
                {restaurant.name}
              </h1>
              <p className="text-[#002a01]/70 mt-1">
                Restaurant Details & Management
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button 
              onClick={loadData}
              className="bg-[#d1f86a] hover:bg-[#d1f86a]/90 text-[#002a01] font-semibold"
              disabled={isLoading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            
            <Link href={`/operations/restaurant/restaurants/${restaurantId}/menu`}>
              <Button className="bg-[#ffd500] hover:bg-[#ffd500]/90 text-[#002a01] font-semibold">
                <Menu className="w-4 h-4 mr-2" />
                Manage Menu
              </Button>
            </Link>
          </div>
        </div>

        {/* Restaurant Overview Card */}
        <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl font-bold text-[#002a01] flex items-center gap-3">
                  <Store className="w-8 h-8" />
                  {restaurant.name}
                </CardTitle>
                <CardDescription className="text-lg text-gray-600 mt-2">
                  Owned by {restaurant.ownerName}
                </CardDescription>
              </div>
              <Badge className={`px-3 py-2 text-sm font-medium border ${getStatusBadgeColor(restaurant.status)}`}>
                {restaurant.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Contact Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-[#002a01]">Contact Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center text-gray-600">
                    <MapPin className="w-5 h-5 mr-3" />
                    <span className="text-sm">{restaurant.address}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Phone className="w-5 h-5 mr-3" />
                    <span className="text-sm">{restaurant.phone}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Mail className="w-5 h-5 mr-3" />
                    <span className="text-sm">{restaurant.email}</span>
                  </div>
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-[#002a01]">Performance</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-gray-600">
                      <Star className="w-5 h-5 mr-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm">Rating</span>
                    </div>
                    <span className="font-semibold text-[#002a01]">{restaurant.rating}/5</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-gray-600">
                      <ShoppingCart className="w-5 h-5 mr-3" />
                      <span className="text-sm">Total Orders</span>
                    </div>
                    <span className="font-semibold text-[#002a01]">{restaurant.totalOrders}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-gray-600">
                      <Calendar className="w-5 h-5 mr-3" />
                      <span className="text-sm">Joined</span>
                    </div>
                    <span className="font-semibold text-[#002a01]">
                      {new Date(restaurant.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Operational Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-[#002a01]">Operations</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-gray-600">
                      <DollarSign className="w-5 h-5 mr-3" />
                      <span className="text-sm">Min Order</span>
                    </div>
                    <span className="font-semibold text-[#002a01]">₹{restaurant.minimumOrderAmount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-gray-600">
                      <Clock className="w-5 h-5 mr-3" />
                      <span className="text-sm">Avg Prep Time</span>
                    </div>
                    <span className="font-semibold text-[#002a01]">{restaurant.averagePreparationTime}m</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-gray-600">
                      <MapPin className="w-5 h-5 mr-3" />
                      <span className="text-sm">Delivery Radius</span>
                    </div>
                    <span className="font-semibold text-[#002a01]">{restaurant.deliveryRadius}km</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Cuisine Types */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-[#002a01] mb-3">Cuisine Types</h3>
              <div className="flex flex-wrap gap-2">
                {restaurant.cuisineTypes.map((cuisine) => (
                  <Badge key={cuisine} className="bg-accent-leaf-green text-primary-dark-green px-3 py-1">
                    {cuisine}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Menu Statistics */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="restaurant-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Menu Items</p>
                    <p className="text-2xl font-bold text-primary-dark-green">{stats.totalMenuItems}</p>
                  </div>
                  <Menu className="w-8 h-8 text-primary-dark-green" />
                </div>
              </CardContent>
            </Card>

            <Card className="restaurant-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Items</p>
                    <p className="text-2xl font-bold text-green-600">{stats.activeMenuItems}</p>
                  </div>
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <ShoppingCart className="w-4 h-4 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="restaurant-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Featured Items</p>
                    <p className="text-2xl font-bold text-yellow-600">{stats.featuredMenuItems}</p>
                  </div>
                  <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                    <Star className="w-4 h-4 text-yellow-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="restaurant-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Menu Coverage</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {stats.totalMenuItems > 0 ? Math.round((stats.activeMenuItems / stats.totalMenuItems) * 100) : 0}%
                    </p>
                  </div>
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Quick Actions */}
        <Card className="restaurant-card">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-[#002a01]">Quick Actions</CardTitle>
            <CardDescription>
              Manage this restaurant's operations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link href={`/operations/restaurant/restaurants/${restaurantId}/menu`}>
                <Button className="w-full bg-accent-leaf-green hover:bg-accent-leaf-green/90 text-primary-dark-green touchable">
                  <Menu className="w-4 h-4 mr-2" />
                  Manage Menu
                </Button>
              </Link>
              
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white touchable">
                <Users className="w-4 h-4 mr-2" />
                View Orders
              </Button>
              
              <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white touchable">
                <TrendingUp className="w-4 h-4 mr-2" />
                Analytics
              </Button>
              
              <Button 
                onClick={() => setIsEditModalOpen(true)}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white touchable"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Details
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Edit Details Modal */}
      <EditDetailsModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        restaurant={restaurant}
        onSave={handleSaveRestaurantDetails}
        isLoading={isSaving}
      />
    </OperationsLayout>
  );
}
