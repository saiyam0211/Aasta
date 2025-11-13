'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Truck, Star, Eye, RefreshCw, Activity, ArrowLeft } from 'lucide-react';

interface DeliveryPartner {
  id: string;
  name: string;
  todayEarnings: number;
  totalEarnings: number;
  rating: number;
  orders?: number;
  cancelledOrders?: number;
  assignedRestaurants?: number;
  lastWeekEarnings?: number;
}

interface DeliveryPartnersData {
  topDeliveryPartners: DeliveryPartner[];
  lastUpdated: string;
}

export default function AllDeliveryPartnersPage() {
  const [partners, setPartners] = useState<DeliveryPartner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const loadPartnersData = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/admin/analytics');
      const data = await res.json();
      if (data.success) {
        setPartners(data.data.topDeliveryPartners || []);
        setLastUpdated(new Date());
      } else {
        console.error('Failed to fetch delivery partners data:', data.error);
        setPartners([]);
      }
    } catch (error) {
      console.error('Error loading delivery partners data:', error);
      setPartners([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPartnersData();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="mx-auto max-w-7xl space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <div className="h-4 w-3/4 rounded bg-gray-200"></div>
                    <div className="h-8 w-1/2 rounded bg-gray-200"></div>
                    <div className="h-3 w-2/3 rounded bg-gray-200"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl space-y-8 p-6">
        {/* Header */}
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center space-x-4">
            <Link href="/admin/dashboard">
              <Button
                variant="outline"
                size="sm"
                className="border-[#002a01]/20 text-[#002a01] hover:border-[#d1f86a] hover:bg-[#d1f86a]/10"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-[#002a01]">
                All Delivery Partners
              </h1>
              <p className="mt-1 text-[#002a01]/70">
                Complete list of delivery partners on the platform
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Button
              onClick={loadPartnersData}
              className="bg-[#d1f86a] font-semibold text-[#002a01] hover:bg-[#d1f86a]/90"
              disabled={isLoading}
            >
              <RefreshCw
                className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`}
              />
              Refresh Data
            </Button>
          </div>
        </div>

        {/* Partners Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {partners.map((partner, index) => (
            <Card
              key={partner.id}
              className="border-0 bg-white/70 shadow-lg backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Partner Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#d1f86a] transition-transform duration-200 group-hover:scale-110">
                        <Truck className="h-6 w-6 text-[#002a01]" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-[#002a01]">
                          {partner.name}
                        </h3>
                        <div className="flex items-center space-x-3 text-sm text-[#002a01]/60">
                          <span className="font-medium">
                            {partner.orders} orders
                          </span>
                          <div className="flex items-center">
                            <Star className="mr-1 h-3 w-3 fill-yellow-400 text-yellow-400" />
                            {partner.rating?.toFixed(1) || 'N/A'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Earnings */}
                  <div className="text-right">
                    <p className="text-2xl font-bold text-[#002a01]">
                      ₹{partner.totalEarnings.toLocaleString()}
                    </p>
                    <p className="text-sm text-[#002a01]/60">Total Earnings</p>
                  </div>

                  {/* Details */}
                  <div className="space-y-2 text-sm text-[#002a01]/70">
                    <div className="flex justify-between">
                      <span>Today&apos;s Earnings:</span>
                      <span className="font-semibold">
                        ₹{partner.todayEarnings.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Last Week&apos;s Earnings:</span>
                      <span className="font-semibold">
                        ₹{partner.lastWeekEarnings?.toLocaleString() || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Assigned Restaurants:</span>
                      <span className="font-semibold">
                        {partner.assignedRestaurants || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Cancelled Orders:</span>
                      <span className="font-semibold">
                        {partner.cancelledOrders || 0}
                      </span>
                    </div>
                  </div>

                  {/* View Button */}
                  <div className="pt-2">
                    <Link href={`/admin/delivery-partners/${partner.id}`}>
                      <Button
                        size="sm"
                        className="w-full bg-[#002a01] text-white hover:bg-[#002a01]/90"
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {partners.length === 0 && !isLoading && (
          <div className="py-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
              <Truck className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-gray-900">
              No delivery partners found
            </h3>
            <p className="text-gray-600">
              There are currently no delivery partners to display.
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="space-y-4 py-8 text-center">
          <div className="flex items-center justify-center space-x-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#002a01]">
              <Truck className="h-4 w-4 text-[#d1f86a]" />
            </div>
            <h3 className="text-2xl font-bold text-[#002a01]">
              Aasta Delivery Partners
            </h3>
          </div>
          <p className="mx-auto max-w-2xl text-[#002a01]/60">
            Managing {partners.length} delivery partners on the platform. Last
            updated: {lastUpdated.toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}
