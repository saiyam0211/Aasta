'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Users,
  Search,
  Filter,
  TrendingUp,
  DollarSign,
  ShoppingCart,
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

export default function CustomerList() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/admin/customers');
        const data = await response.json();

        if (data.success) {
          setCustomers(data.data.customers);
        } else {
          console.error('Failed to fetch customers:', data.error);
        }
      } catch (error) {
        console.error('Error loading customers:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="space-y-4 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#d1f86a]">
              <Users className="h-8 w-8 text-[#002a01]" />
            </div>
            <h3 className="text-lg font-semibold text-[#002a01]">
              Loading customers...
            </h3>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (customers.length === 0) {
    return (
      <AdminLayout>
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="space-y-4 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
              <Users className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              No customers found
            </h3>
            <p className="text-gray-600">
              There are no customers in the system yet.
            </p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-3xl font-bold text-[#002a01]">
              Customer Management
            </h1>
            <p className="mt-1 text-[#002a01]/70">
              Manage and analyze your customer base
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              className="border-[#002a01]/20 text-[#002a01] hover:bg-[#d1f86a]/10"
            >
              <Search className="mr-2 h-4 w-4" />
              Search
            </Button>
            <Button
              variant="outline"
              className="border-[#002a01]/20 text-[#002a01] hover:bg-[#d1f86a]/10"
            >
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <Card className="border-0 bg-white/70 shadow-lg backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-semibold tracking-wide text-[#002a01]/60 uppercase">
                    Total Customers
                  </p>
                  <p className="text-3xl font-bold text-[#002a01]">
                    {customers.length}
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#d1f86a]">
                  <Users className="h-6 w-6 text-[#002a01]" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white/70 shadow-lg backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-semibold tracking-wide text-[#002a01]/60 uppercase">
                    Total Orders
                  </p>
                  <p className="text-3xl font-bold text-[#002a01]">
                    {customers.reduce(
                      (sum, customer) => sum + customer.stats.totalOrders,
                      0
                    )}
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#ffd500]">
                  <ShoppingCart className="h-6 w-6 text-[#002a01]" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white/70 shadow-lg backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-semibold tracking-wide text-[#002a01]/60 uppercase">
                    Total Revenue
                  </p>
                  <p className="text-3xl font-bold text-[#002a01]">
                    ₹
                    {customers
                      .reduce(
                        (sum, customer) => sum + customer.stats.totalSpent,
                        0
                      )
                      .toLocaleString()}
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Customer Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {customers.map((customer) => (
            <Card
              key={customer.id}
              className="group border-0 bg-white/70 shadow-lg backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-[#d1f86a]/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
              <CardHeader className="relative z-10">
                <div className="flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#d1f86a] to-[#ffd500] shadow-lg">
                    <span className="text-sm font-bold text-[#002a01]">
                      {customer.name?.charAt(0) || 'C'}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
                      <TrendingUp className="mr-1 h-3 w-3" />
                      Active
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <CardTitle className="text-[#002a01] transition-colors group-hover:text-[#002a01]/80">
                    {customer.name}
                  </CardTitle>
                  <CardDescription className="text-[#002a01]/60">
                    {customer.email}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="relative z-10 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-lg bg-[#002a01]/5 p-3 text-center">
                    <p className="text-2xl font-bold text-[#002a01]">
                      {customer.stats.totalOrders}
                    </p>
                    <p className="text-xs font-medium text-[#002a01]/60">
                      Orders
                    </p>
                  </div>
                  <div className="rounded-lg bg-[#002a01]/5 p-3 text-center">
                    <p className="text-2xl font-bold text-[#002a01]">
                      ₹{Math.round(customer.stats.totalSpent).toLocaleString()}
                    </p>
                    <p className="text-xs font-medium text-[#002a01]/60">
                      Spent
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#002a01]/60">Avg Order Value:</span>
                    <span className="font-semibold text-[#002a01]">
                      ₹{Math.round(customer.stats.averageOrderValue)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#002a01]/60">Last Order:</span>
                    <span className="font-semibold text-[#002a01]">
                      {customer.stats.lastOrderDate
                        ? new Date(
                            customer.stats.lastOrderDate
                          ).toLocaleDateString()
                        : 'Never'}
                    </span>
                  </div>
                </div>

                <Button
                  asChild
                  className="w-full bg-[#d1f86a] font-semibold text-[#002a01] shadow-lg transition-all duration-200 hover:bg-[#d1f86a]/90 hover:shadow-xl"
                >
                  <Link href={`/admin/customers/${customer.id}`}>
                    View Details
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
