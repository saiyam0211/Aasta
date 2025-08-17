'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  ShoppingCart,
  TrendingUp,
  DollarSign,
  Star,
  Clock,
  Calendar,
  Heart,
  Home,
  Briefcase,
} from 'lucide-react';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import AdminLayout from '@/components/layouts/admin-layout';

export default function CustomerDetails() {
  const params = useParams();
  const id = params?.id as string;
  const [customer, setCustomer] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchCustomerDetails = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/admin/customers/${id}`);
        const data = await response.json();

        if (data.success) {
          setCustomer(data.data.customer);
        } else {
          console.error('Failed to fetch customer details:', data.error);
        }
      } catch (error) {
        console.error('Error loading customer details:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCustomerDetails();
  }, [id]);

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="space-y-4 text-center">
            <div className="mx-auto flex h-16 w-16 animate-pulse items-center justify-center rounded-full bg-[#d1f86a]">
              <User className="h-8 w-8 text-[#002a01]" />
            </div>
            <h3 className="text-lg font-semibold text-[#002a01]">
              Loading customer details...
            </h3>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!customer) {
    return (
      <AdminLayout>
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="space-y-4 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
              <User className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              Customer not found
            </h3>
            <p className="text-gray-600">
              The requested customer could not be found.
            </p>
            <Button asChild variant="outline">
              <Link href="/admin/customers">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Customers
              </Link>
            </Button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <div className="flex justify-between">
          <div>
            <h3 className="text-xl font-semibold">{customer.name}</h3>
            <p className="text-sm text-gray-500">Email: {customer.email}</p>
            <p className="text-sm text-gray-500">Phone: {customer.phone}</p>
          </div>
        </div>
      </Card>

      <Card>
        <h4 className="text-lg font-semibold">Order Statistics</h4>
        <p className="text-sm">Total Orders: {customer.stats.totalOrders}</p>
        <p className="text-sm">Total Spent: ₹{customer.stats.totalSpent}</p>
        <p className="text-sm">
          Average Order Value: ₹{customer.stats.averageOrderValue.toFixed(2)}
        </p>
        <p className="text-sm">Highest Spent: ₹{customer.stats.highestSpent}</p>
        <p className="text-sm">Lowest Spent: ₹{customer.stats.lowestSpent}</p>
      </Card>

      <Card>
        <h4 className="text-lg font-semibold">Favourite Restaurants</h4>
        {customer.stats.favoriteRestaurants.length === 0 ? (
          <p className="text-sm">No favorites found.</p>
        ) : (
          customer.stats.favoriteRestaurants.map(
            (restaurant: any, index: number) => (
              <p key={index} className="text-sm">
                {restaurant.name} - Orders: {restaurant.orderCount}
              </p>
            )
          )
        )}
      </Card>

      <Card>
        <h4 className="text-lg font-semibold">Address Usage</h4>
        {customer.stats.addressUsage.map((address: any, index: number) => (
          <div key={index} className="mb-2">
            <p className="text-sm">
              {address.street}, {address.city}
            </p>
            <p className="text-sm text-gray-500">
              Orders to this address: {address.orderCount}
            </p>
          </div>
        ))}
      </Card>
    </div>
  );
}
