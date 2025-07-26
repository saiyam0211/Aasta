"use client";

import { useState, useEffect } from "react";
import AdminLayout from "@/components/layouts/admin-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Store, 
  Search, 
  Eye, 
  Edit, 
  MapPin, 
  Phone, 
  Star, 
  Clock,
  Users,
  DollarSign,
  Filter,
  Plus
} from "lucide-react";
import Link from "next/link";

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

export default function AdminRestaurantsPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE' | 'PENDING'>('ALL');

  useEffect(() => {
    loadRestaurants();
  }, []);

  const loadRestaurants = async () => {
    try {
      setIsLoading(true);
      
      const response = await fetch('/api/restaurants');
      const data = await response.json();
      
      if (data.success) {
        setRestaurants(data.data || []);
      } else {
        console.error('Failed to load restaurants:', data.error);
      }
    } catch (error) {
      console.error('Error loading restaurants:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (restaurantId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/restaurants/${restaurantId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        loadRestaurants(); // Reload the list
      } else {
        console.error('Failed to update restaurant status');
      }
    } catch (error) {
      console.error('Error updating restaurant status:', error);
    }
  };

  // Filter restaurants based on search and status
  const filteredRestaurants = restaurants.filter(restaurant => {
    const matchesSearch = restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         restaurant.ownerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         restaurant.cuisineTypes.some(cuisine => 
                           cuisine.toLowerCase().includes(searchQuery.toLowerCase())
                         );
    
    const matchesStatus = statusFilter === 'ALL' || restaurant.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

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
      <AdminLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-brand text-3xl font-bold text-primary-dark-green">
                Restaurant Management
              </h1>
              <p className="text-signature text-lg text-primary-dark-green mt-1">
                Manage all restaurants on the platform
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded mb-3 w-2/3"></div>
                  <div className="flex justify-between">
                    <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-8 bg-gray-200 rounded w-20"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-brand text-3xl font-bold text-primary-dark-green">
              Restaurant Management
            </h1>
            <p className="text-signature text-lg text-primary-dark-green mt-1">
              Manage all restaurants on the platform
            </p>
          </div>
          <Button className="bg-accent-leaf-green hover:bg-accent-leaf-green/90 text-primary-dark-green touchable">
            <Plus className="w-4 h-4 mr-2" />
            Add Restaurant
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="restaurant-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Restaurants</p>
                  <p className="text-2xl font-bold text-primary-dark-green">{restaurants.length}</p>
                </div>
                <Store className="w-8 h-8 text-primary-dark-green" />
              </div>
            </CardContent>
          </Card>

          <Card className="restaurant-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active</p>
                  <p className="text-2xl font-bold text-green-600">
                    {restaurants.filter(r => r.status === 'ACTIVE').length}
                  </p>
                </div>
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <Store className="w-4 h-4 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="restaurant-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {restaurants.filter(r => r.status === 'PENDING').length}
                  </p>
                </div>
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Clock className="w-4 h-4 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="restaurant-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Inactive</p>
                  <p className="text-2xl font-bold text-red-600">
                    {restaurants.filter(r => r.status === 'INACTIVE').length}
                  </p>
                </div>
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                  <Store className="w-4 h-4 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="restaurant-card">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search restaurants, owners, or cuisines..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-10 border-2 border-gray-300 rounded-lg selectable"
                />
              </div>
              
              <div className="flex gap-2">
                {['ALL', 'ACTIVE', 'PENDING', 'INACTIVE'].map((status) => (
                  <Button
                    key={status}
                    onClick={() => setStatusFilter(status as any)}
                    className={`h-10 px-4 rounded-lg touchable ${
                      statusFilter === status
                        ? 'bg-accent-leaf-green text-primary-dark-green'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {status}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Restaurants Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRestaurants.map((restaurant) => (
            <Card key={restaurant.id} className="restaurant-card">
              <CardContent className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-primary-dark-green mb-1">
                      {restaurant.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Owner: {restaurant.ownerName}
                    </p>
                  </div>
                  <Badge className={`px-2 py-1 text-xs font-medium border ${getStatusBadgeColor(restaurant.status)}`}>
                    {restaurant.status}
                  </Badge>
                </div>

                {/* Restaurant Info */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span className="truncate">{restaurant.address}</span>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="w-4 h-4 mr-2" />
                    <span>{restaurant.phone}</span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center text-gray-600">
                      <Star className="w-4 h-4 mr-1 fill-yellow-400 text-yellow-400" />
                      <span>{restaurant.rating}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Users className="w-4 h-4 mr-1" />
                      <span>{restaurant.totalOrders} orders</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {restaurant.cuisineTypes.slice(0, 3).map((cuisine) => (
                      <Badge key={cuisine} className="bg-gray-100 text-gray-700 text-xs px-2 py-1">
                        {cuisine}
                      </Badge>
                    ))}
                    {restaurant.cuisineTypes.length > 3 && (
                      <Badge className="bg-gray-100 text-gray-700 text-xs px-2 py-1">
                        +{restaurant.cuisineTypes.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center p-2 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500">Min Order</p>
                    <p className="text-sm font-semibold text-primary-dark-green">
                      ₹{restaurant.minimumOrderAmount}
                    </p>
                  </div>
                  <div className="text-center p-2 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500">Prep Time</p>
                    <p className="text-sm font-semibold text-primary-dark-green">
                      {restaurant.averagePreparationTime}m
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Link href={`/admin/restaurants/${restaurant.id}`} className="flex-1">
                    <Button className="w-full bg-accent-leaf-green hover:bg-accent-leaf-green/90 text-primary-dark-green text-sm touchable">
                      <Eye className="w-4 h-4 mr-1" />
                      View Details
                    </Button>
                  </Link>
                  
                  <Button
                    onClick={() => handleStatusChange(
                      restaurant.id, 
                      restaurant.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
                    )}
                    className={`px-3 text-sm touchable ${
                      restaurant.status === 'ACTIVE'
                        ? 'bg-red-100 hover:bg-red-200 text-red-700'
                        : 'bg-green-100 hover:bg-green-200 text-green-700'
                    }`}
                  >
                    {restaurant.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* No Results */}
        {filteredRestaurants.length === 0 && !isLoading && (
          <Card className="restaurant-card">
            <CardContent className="p-8 text-center">
              <Store className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2 text-primary-dark-green">
                No restaurants found
              </h3>
              <p className="text-gray-600 mb-4">
                {searchQuery || statusFilter !== 'ALL' 
                  ? 'Try adjusting your search or filters'
                  : 'No restaurants have been added to the platform yet'
                }
              </p>
              <Button 
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('ALL');
                }}
                className="bg-accent-leaf-green hover:bg-accent-leaf-green/90 text-primary-dark-green touchable"
              >
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}
