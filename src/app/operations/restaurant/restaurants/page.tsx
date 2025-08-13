'use client';

import { useState, useEffect } from 'react';
import OperationsLayout from '@/components/layouts/operations-layout';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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
  Plus,
  Menu,
  RefreshCw,
} from 'lucide-react';
import Link from 'next/link';

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

export default function RestaurantOperationsPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<
    'ALL' | 'ACTIVE' | 'INACTIVE' | 'PENDING'
  >('ALL');

  useEffect(() => {
    loadRestaurants();
  }, []);

  const loadRestaurants = async () => {
    try {
      setIsLoading(true);

      const response = await fetch('/api/operations/restaurants');
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

  const handleStatusChange = async (
    restaurantId: string,
    newStatus: string
  ) => {
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
  const filteredRestaurants = restaurants.filter((restaurant) => {
    const matchesSearch =
      restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      restaurant.ownerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      restaurant.cuisineTypes.some((cuisine) =>
        cuisine.toLowerCase().includes(searchQuery.toLowerCase())
      );

    const matchesStatus =
      statusFilter === 'ALL' || restaurant.status === statusFilter;

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
      <OperationsLayout type="restaurant">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[#002a01]">
                Restaurant Management
              </h1>
              <p className="mt-1 text-[#002a01]/70">
                Manage all restaurants and their menu items
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="mb-2 h-4 rounded bg-gray-200"></div>
                  <div className="mb-3 h-3 w-2/3 rounded bg-gray-200"></div>
                  <div className="flex justify-between">
                    <div className="h-3 w-1/3 rounded bg-gray-200"></div>
                    <div className="h-8 w-20 rounded bg-gray-200"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </OperationsLayout>
    );
  }

  return (
    <OperationsLayout type="restaurant">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-brand text-primary-dark-green text-3xl font-bold">
              Restaurant Management
            </h1>
            <p className="text-signature text-primary-dark-green mt-1 text-lg">
              Manage all restaurants and their menu items
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              onClick={loadRestaurants}
              className="bg-[#d1f86a] font-semibold text-[#002a01] hover:bg-[#d1f86a]/90"
              disabled={isLoading}
            >
              <RefreshCw
                className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`}
              />
              Refresh
            </Button>
            <Button className="bg-accent-leaf-green hover:bg-accent-leaf-green/90 text-primary-dark-green touchable">
              <Plus className="mr-2 h-4 w-4" />
              Add Restaurant
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
          <Card className="restaurant-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Restaurants
                  </p>
                  <p className="text-primary-dark-green text-2xl font-bold">
                    {restaurants.length}
                  </p>
                </div>
                <Store className="text-primary-dark-green h-8 w-8" />
              </div>
            </CardContent>
          </Card>

          <Card className="restaurant-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active</p>
                  <p className="text-2xl font-bold text-green-600">
                    {restaurants.filter((r) => r.status === 'ACTIVE').length}
                  </p>
                </div>
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                  <Store className="h-4 w-4 text-green-600" />
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
                    {restaurants.filter((r) => r.status === 'PENDING').length}
                  </p>
                </div>
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-100">
                  <Clock className="h-4 w-4 text-yellow-600" />
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
                    {restaurants.filter((r) => r.status === 'INACTIVE').length}
                  </p>
                </div>
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100">
                  <Store className="h-4 w-4 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="restaurant-card">
          <CardContent className="p-6">
            <div className="flex flex-col gap-4 md:flex-row">
              <div className="relative flex-1">
                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search restaurants, owners, or cuisines..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="selectable h-10 rounded-lg border-2 border-gray-300 pl-10"
                />
              </div>

              <div className="flex gap-2">
                {['ALL', 'ACTIVE', 'PENDING', 'INACTIVE'].map((status) => (
                  <Button
                    key={status}
                    onClick={() => setStatusFilter(status as any)}
                    className={`touchable h-10 rounded-lg px-4 ${
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
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredRestaurants.map((restaurant) => (
            <Card key={restaurant.id} className="restaurant-card">
              <CardContent className="p-6">
                {/* Header */}
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-primary-dark-green mb-1 text-xl font-semibold">
                      {restaurant.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Owner: {restaurant.ownerName}
                    </p>
                  </div>
                  <Badge
                    className={`border px-2 py-1 text-xs font-medium ${getStatusBadgeColor(restaurant.status)}`}
                  >
                    {restaurant.status}
                  </Badge>
                </div>

                {/* Restaurant Info */}
                <div className="mb-4 space-y-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="mr-2 h-4 w-4" />
                    <span className="truncate">{restaurant.address}</span>
                  </div>

                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="mr-2 h-4 w-4" />
                    <span>{restaurant.phone}</span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center text-gray-600">
                      <Star className="mr-1 h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span>{restaurant.rating}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Users className="mr-1 h-4 w-4" />
                      <span>{restaurant.totalOrders} orders</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {restaurant.cuisineTypes.slice(0, 3).map((cuisine) => (
                      <Badge
                        key={cuisine}
                        className="bg-gray-100 px-2 py-1 text-xs text-gray-700"
                      >
                        {cuisine}
                      </Badge>
                    ))}
                    {restaurant.cuisineTypes.length > 3 && (
                      <Badge className="bg-gray-100 px-2 py-1 text-xs text-gray-700">
                        +{restaurant.cuisineTypes.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Key Metrics */}
                <div className="mb-4 grid grid-cols-2 gap-4">
                  <div className="rounded-lg bg-gray-50 p-2 text-center">
                    <p className="text-xs text-gray-500">Min Order</p>
                    <p className="text-primary-dark-green text-sm font-semibold">
                      ₹{restaurant.minimumOrderAmount}
                    </p>
                  </div>
                  <div className="rounded-lg bg-gray-50 p-2 text-center">
                    <p className="text-xs text-gray-500">Prep Time</p>
                    <p className="text-primary-dark-green text-sm font-semibold">
                      {restaurant.averagePreparationTime}m
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Link
                      href={`/operations/restaurant/restaurants/${restaurant.id}`}
                      className="flex-1"
                    >
                      <Button className="bg-accent-leaf-green hover:bg-accent-leaf-green/90 text-primary-dark-green touchable w-full text-sm">
                        <Eye className="mr-1 h-4 w-4" />
                        View & Manage
                      </Button>
                    </Link>

                    <Button
                      onClick={() =>
                        handleStatusChange(
                          restaurant.id,
                          restaurant.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
                        )
                      }
                      className={`touchable px-3 text-sm ${
                        restaurant.status === 'ACTIVE'
                          ? 'bg-red-100 text-red-700 hover:bg-red-200'
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    >
                      {restaurant.status === 'ACTIVE'
                        ? 'Deactivate'
                        : 'Activate'}
                    </Button>
                  </div>

                  <Link
                    href={`/operations/restaurant/restaurants/${restaurant.id}/menu`}
                    className="block"
                  >
                    <Button className="touchable w-full bg-blue-600 text-sm text-white hover:bg-blue-700">
                      <Menu className="mr-1 h-4 w-4" />
                      Manage Menu
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* No Results */}
        {filteredRestaurants.length === 0 && !isLoading && (
          <Card className="restaurant-card">
            <CardContent className="p-8 text-center">
              <Store className="mx-auto mb-4 h-12 w-12 text-gray-400" />
              <h3 className="text-primary-dark-green mb-2 text-lg font-semibold">
                No restaurants found
              </h3>
              <p className="mb-4 text-gray-600">
                {searchQuery || statusFilter !== 'ALL'
                  ? 'Try adjusting your search or filters'
                  : 'No restaurants have been added to the platform yet'}
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
    </OperationsLayout>
  );
}
