"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Truck, 
  Star,
  Eye,
  RefreshCw,
  Activity,
  ArrowLeft
} from "lucide-react";

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
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
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
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <Link href="/admin/dashboard">
              <Button
                variant="outline"
                size="sm"
                className="border-[#002a01]/20 text-[#002a01] hover:bg-[#d1f86a]/10 hover:border-[#d1f86a]"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-[#002a01]">
                All Delivery Partners
              </h1>
              <p className="text-[#002a01]/70 mt-1">
                Complete list of delivery partners on the platform
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button 
              onClick={loadPartnersData}
              className="bg-[#d1f86a] hover:bg-[#d1f86a]/90 text-[#002a01] font-semibold"
              disabled={isLoading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh Data
            </Button>
          </div>
        </div>

        {/* Partners Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {partners.map((partner, index) => (
            <Card key={partner.id} className="border-0 shadow-lg bg-white/70 backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Partner Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-[#d1f86a] rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                        <Truck className="w-6 h-6 text-[#002a01]" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-[#002a01] text-lg">
                          {partner.name}
                        </h3>
                        <div className="flex items-center space-x-3 text-sm text-[#002a01]/60">
                          <span className="font-medium">{partner.orders} orders</span>
                          <div className="flex items-center">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400 mr-1" />
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
                      <span>Today's Earnings:</span>
                      <span className="font-semibold">₹{partner.todayEarnings.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Last Week's Earnings:</span>
                      <span className="font-semibold">₹{partner.lastWeekEarnings?.toLocaleString() || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Assigned Restaurants:</span>
                      <span className="font-semibold">{partner.assignedRestaurants || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Cancelled Orders:</span>
                      <span className="font-semibold">{partner.cancelledOrders || 0}</span>
                    </div>
                  </div>

                  {/* View Button */}
                  <div className="pt-2">
                    <Link href={`/admin/delivery-partners/${partner.id}`}>
                      <Button 
                        size="sm" 
                        className="w-full bg-[#002a01] hover:bg-[#002a01]/90 text-white"
                      >
                        <Eye className="w-4 h-4 mr-2" />
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
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Truck className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No delivery partners found</h3>
            <p className="text-gray-600">There are currently no delivery partners to display.</p>
          </div>
        )}

        {/* Footer */}
        <div className="text-center py-8 space-y-4">
          <div className="flex items-center justify-center space-x-3">
            <div className="w-8 h-8 bg-[#002a01] rounded-lg flex items-center justify-center">
              <Truck className="w-4 h-4 text-[#d1f86a]" />
            </div>
            <h3 className="text-2xl font-bold text-[#002a01]">Aasta Delivery Partners</h3>
          </div>
          <p className="text-[#002a01]/60 max-w-2xl mx-auto">
            Managing {partners.length} delivery partners on the platform. 
            Last updated: {lastUpdated.toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}

