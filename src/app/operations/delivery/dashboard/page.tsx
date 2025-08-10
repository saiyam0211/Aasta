"use client";

import { useState, useEffect } from "react";
import OperationsLayout from "@/components/layouts/operations-layout";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Truck, 
  Users, 
  Star, 
  MapPin, 
  Edit, 
  ClipboardList, 
  Eye, 
  Plus,
  RefreshCw
} from "lucide-react";

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
        <div className="flex items-center justify-center min-h-screen">
          Loading...
        </div>
      </OperationsLayout>
    );
  }

  return (
    <OperationsLayout type="delivery">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-primary-dark-green">
            Delivery Management
          </h1>
          <Button className="bg-primary-dark-green text-white">
            <Plus className="w-5 h-5 mr-1" /> Add Partner
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <CardTitle className="text-lg font-bold">
                Total Partners
              </CardTitle>
              <div className="flex items-center justify-between">
                <p className="text-3xl font-bold">{partners.length}</p>
                <Users className="w-8 h-8 text-primary-dark-green" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <CardTitle className="text-lg font-bold">
                Available
              </CardTitle>
              <div className="flex items-center justify-between">
                <p className="text-3xl font-bold">
                  {partners.filter((p) => p.status === 'AVAILABLE').length}
                </p>
                <Truck className="w-8 h-8 text-primary-dark-green" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-4">Delivery Partners</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {partners.map(partner => (
              <Card key={partner.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold">
                        {partner.name}
                      </h3>
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 fill-yellow-400" />
                        <span>{partner.rating}</span>
                      </div>
                    </div>
                    <Edit className="w-4 h-4 cursor-pointer" />
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
