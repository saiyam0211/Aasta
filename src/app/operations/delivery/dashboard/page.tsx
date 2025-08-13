'use client';

import { useState, useEffect } from 'react';
import OperationsLayout from '@/components/layouts/operations-layout';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Truck,
  Users,
  Star,
  MapPin,
  Edit,
  ClipboardList,
  Eye,
  Plus,
  RefreshCw,
} from 'lucide-react';

interface DeliveryPartner {
  id: string;
  name: string;
  status: 'AVAILABLE' | 'BUSY' | 'OFFLINE';
  rating: number;
  deliveriesToday: number;
  deliveriesThisWeek: number;
  assignedOrders: number;
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
      const response = await fetch('/api/delivery-partners');
      const data = await response.json();
      if (data.success) {
        setPartners(data.data || []);
      } else {
        console.error('Error loading partners:', data.error);
      }
    } catch (error) {
      console.error('Error loading partners:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <OperationsLayout type="delivery">
        <div className="flex min-h-screen items-center justify-center">
          Loading...
        </div>
      </OperationsLayout>
    );
  }

  return (
    <OperationsLayout type="delivery">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-primary-dark-green text-3xl font-bold">
            Delivery Management
          </h1>
          <Button className="bg-primary-dark-green text-white">
            <Plus className="mr-1 h-5 w-5" /> Add Partner
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <CardTitle className="text-lg font-bold">
                Total Partners
              </CardTitle>
              <div className="flex items-center justify-between">
                <p className="text-3xl font-bold">{partners.length}</p>
                <Users className="text-primary-dark-green h-8 w-8" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <CardTitle className="text-lg font-bold">Available</CardTitle>
              <div className="flex items-center justify-between">
                <p className="text-3xl font-bold">
                  {partners.filter((p) => p.status === 'AVAILABLE').length}
                </p>
                <Truck className="text-primary-dark-green h-8 w-8" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <h2 className="mb-4 text-2xl font-bold">Delivery Partners</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {partners.map((partner) => (
              <Card key={partner.id}>
                <CardContent className="p-4">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">{partner.name}</h3>
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 fill-yellow-400" />
                        <span>{partner.rating}</span>
                      </div>
                    </div>
                    <Edit className="h-4 w-4 cursor-pointer" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Deliveries Today</span>
                      <span>{partner.deliveriesToday}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Deliveries This Week</span>
                      <span>{partner.deliveriesThisWeek}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Assigned Orders</span>
                      <span>{partner.assignedOrders}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </OperationsLayout>
  );
}
