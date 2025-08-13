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
import {
  UserPlus,
  Users,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  Phone,
  Mail,
} from 'lucide-react';

interface DeliveryPartner {
  id: string;
  name: string;
  phone: string;
  email: string;
  status: 'AVAILABLE' | 'BUSY' | 'OFFLINE';
  currentOrders: number;
  rating: number;
  todayDeliveries: number;
}

export default function DeliveryDashboard() {
  const [partners, setPartners] = useState<DeliveryPartner[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPartners();
  }, []);

  const loadPartners = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/operations/delivery-partners');
      const data = await response.json();
      if (data.success) {
        setPartners(data.data || []);
      } else {
        console.error('Failed to load partners:', data.error);
      }
    } catch (error) {
      console.error('Error loading partners:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'BUSY':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'OFFLINE':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (isLoading) {
    return (
      <OperationsLayout type="delivery">
        <div className="space-y-6">
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
      </OperationsLayout>
    );
  }

  return (
    <OperationsLayout type="delivery">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-3xl font-bold text-[#002a01]">
              Delivery Operations
            </h1>
            <p className="mt-1 text-[#002a01]/70">
              Manage all delivery operations and partners
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <Button
              onClick={loadPartners}
              className="bg-[#d1f86a] font-semibold text-[#002a01] hover:bg-[#d1f86a]/90"
              disabled={isLoading}
            >
              Refresh Data
            </Button>
          </div>
        </div>

        {/* Partners List */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {partners.map((partner) => (
            <Card
              key={partner.id}
              className="shadow-lg transition-all duration-300 hover:shadow-xl"
            >
              <CardContent className="p-6">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-[#002a01]">
                    {partner.name}
                  </h3>
                  <Badge
                    className={`px-2 py-1 text-xs font-medium ${getStatusBadgeColor(partner.status)}`}
                  >
                    {partner.status}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="mr-1 h-4 w-4" />
                    <span>{partner.phone}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="mr-1 h-4 w-4" />
                    <span>{partner.email}</span>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                  <div className="rounded bg-gray-50 p-2">
                    <p className="text-xs text-gray-500">Orders Today</p>
                    <p className="font-semibold text-[#002a01]">
                      {partner.todayDeliveries}
                    </p>
                  </div>
                  <div className="rounded bg-gray-50 p-2">
                    <p className="text-xs text-gray-500">Active Orders</p>
                    <p className="font-semibold text-[#002a01]">
                      {partner.currentOrders}
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex justify-end space-x-2">
                  <Button variant="outline" className="text-sm">
                    Remove
                  </Button>
                  <Button variant="outline" className="text-sm">
                    Edit
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </OperationsLayout>
  );
}
