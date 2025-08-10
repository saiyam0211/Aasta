"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Users, Search, Filter, TrendingUp, DollarSign, ShoppingCart } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import AdminLayout from "@/components/layouts/admin-layout";

export default function CustomerList() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/admin/customers");
        const data = await response.json();

        if (data.success) {
          setCustomers(data.data.customers);
        } else {
          console.error("Failed to fetch customers:", data.error);
        }
      } catch (error) {
        console.error("Error loading customers:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-[#d1f86a] rounded-full flex items-center justify-center mx-auto">
              <Users className="w-8 h-8 text-[#002a01]" />
            </div>
            <h3 className="text-lg font-semibold text-[#002a01]">Loading customers...</h3>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (customers.length === 0) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
              <Users className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">No customers found</h3>
            <p className="text-gray-600">There are no customers in the system yet.</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#002a01]">
              Customer Management
            </h1>
            <p className="text-[#002a01]/70 mt-1">
              Manage and analyze your customer base
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button variant="outline" className="border-[#002a01]/20 text-[#002a01] hover:bg-[#d1f86a]/10">
              <Search className="w-4 h-4 mr-2" />
              Search
            </Button>
            <Button variant="outline" className="border-[#002a01]/20 text-[#002a01] hover:bg-[#d1f86a]/10">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-[#002a01]/60 uppercase tracking-wide">Total Customers</p>
                  <p className="text-3xl font-bold text-[#002a01]">{customers.length}</p>
                </div>
                <div className="w-12 h-12 bg-[#d1f86a] rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-[#002a01]" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-[#002a01]/60 uppercase tracking-wide">Total Orders</p>
                  <p className="text-3xl font-bold text-[#002a01]">
                    {customers.reduce((sum, customer) => sum + customer.stats.totalOrders, 0)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-[#ffd500] rounded-xl flex items-center justify-center">
                  <ShoppingCart className="w-6 h-6 text-[#002a01]" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-[#002a01]/60 uppercase tracking-wide">Total Revenue</p>
                  <p className="text-3xl font-bold text-[#002a01]">
                    ₹{customers.reduce((sum, customer) => sum + customer.stats.totalSpent, 0).toLocaleString()}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Customer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {customers.map((customer) => (
            <Card key={customer.id} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white/70 backdrop-blur-sm group">
              <div className="absolute inset-0 bg-gradient-to-br from-[#d1f86a]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
              <CardHeader className="relative z-10">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#d1f86a] to-[#ffd500] rounded-xl flex items-center justify-center shadow-lg">
                    <span className="text-sm font-bold text-[#002a01]">
                      {customer.name?.charAt(0) || 'C'}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center text-xs font-medium text-green-700 bg-green-100 px-2 py-1 rounded-full">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      Active
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <CardTitle className="text-[#002a01] group-hover:text-[#002a01]/80 transition-colors">
                    {customer.name}
                  </CardTitle>
                  <CardDescription className="text-[#002a01]/60">
                    {customer.email}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="relative z-10 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-[#002a01]/5 rounded-lg">
                    <p className="text-2xl font-bold text-[#002a01]">{customer.stats.totalOrders}</p>
                    <p className="text-xs text-[#002a01]/60 font-medium">Orders</p>
                  </div>
                  <div className="text-center p-3 bg-[#002a01]/5 rounded-lg">
                    <p className="text-2xl font-bold text-[#002a01]">₹{Math.round(customer.stats.totalSpent).toLocaleString()}</p>
                    <p className="text-xs text-[#002a01]/60 font-medium">Spent</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#002a01]/60">Avg Order Value:</span>
                    <span className="font-semibold text-[#002a01]">₹{Math.round(customer.stats.averageOrderValue)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#002a01]/60">Last Order:</span>
                    <span className="font-semibold text-[#002a01]">
                      {customer.stats.lastOrderDate 
                        ? new Date(customer.stats.lastOrderDate).toLocaleDateString()
                        : 'Never'
                      }
                    </span>
                  </div>
                </div>
                
                <Button 
                  asChild 
                  className="w-full bg-[#d1f86a] hover:bg-[#d1f86a]/90 text-[#002a01] font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
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

