'use client';

import { useState, useEffect } from 'react';
import OperationsLayout from '@/components/layouts/operations-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  User,
  Clock,
  MapPin,
  Phone,
  Truck,
  Package,
  RefreshCw,
} from 'lucide-react';

interface Assignment {
  id: string;
  deliveryPartnerId: string;
  orderId: string;
  assignedAt: string;
  status: 'ASSIGNED' | 'PICKED_UP' | 'DELIVERED';
  deliveryPartner: {
    id: string;
    userId: string;
    user: {
      name: string;
      email: string;
      phone: string;
    };
    status: 'AVAILABLE' | 'BUSY' | 'OFFLINE';
    currentLatitude?: number;
    currentLongitude?: number;
  };
  order: {
    id: string;
    orderNumber: string;
    status: string;
    totalAmount: number;
    estimatedDeliveryTime: string;
    pickupTime: string;
    restaurant: {
      id: string;
      name: string;
      address: string;
      phone: string;
    };
    customer: {
      name: string;
      phone: string;
    };
    deliveryAddress: {
      address: string;
      city: string;
      zipCode: string;
    };
  };
}

export default function Assignments() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAssignments();
  }, []);

  const loadAssignments = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/operations/assignments');
      const data = await response.json();
      if (data.success) {
        setAssignments(data.data || []);
      } else {
        console.error('Error loading assignments:', data.error);
      }
    } catch (error) {
      console.error('Error loading assignments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'ASSIGNED':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'PICKED_UP':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'DELIVERED':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (isLoading) {
    return (
      <OperationsLayout type="delivery">
        <div className="flex min-h-screen items-center justify-center">
          <div className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 animate-spin" />
            Loading assignments...
          </div>
        </div>
      </OperationsLayout>
    );
  }

  return (
    <OperationsLayout type="delivery">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-primary-dark-green text-3xl font-bold">
              Active Assignments
            </h1>
            <p className="text-primary-dark-green mt-1 text-lg">
              Delivery partners currently busy with orders
            </p>
          </div>
          <Button
            onClick={loadAssignments}
            className="bg-accent-leaf-green hover:bg-accent-leaf-green/90 text-primary-dark-green"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>

        {assignments.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Truck className="mx-auto mb-4 h-12 w-12 text-gray-400" />
              <h3 className="text-primary-dark-green mb-2 text-lg font-semibold">
                No Active Assignments
              </h3>
              <p className="text-gray-600">
                No delivery partners are currently assigned to orders.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {assignments.map((assignment) => (
              <Card key={assignment.id} className="restaurant-card">
                <CardContent className="p-6">
                  {/* Header */}
                  <div className="mb-4 flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="bg-primary-dark-green flex h-10 w-10 items-center justify-center rounded-full text-white">
                        <User className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-primary-dark-green text-lg font-semibold">
                          {assignment.deliveryPartner.user.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {assignment.deliveryPartner.user.phone}
                        </p>
                      </div>
                    </div>
                    <Badge
                      className={`border px-2 py-1 text-xs font-medium ${getStatusBadgeColor(assignment.status)}`}
                    >
                      {assignment.status}
                    </Badge>
                  </div>

                  {/* Order Details */}
                  <div className="mb-4 space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Order ID:</span>
                      <span className="font-medium">
                        {assignment.order.orderNumber}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Restaurant:</span>
                      <span className="font-medium">
                        {assignment.order.restaurant.name}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Customer:</span>
                      <span className="font-medium">
                        {assignment.order.customer.name}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Order Amount:</span>
                      <span className="text-primary-dark-green font-medium">
                        ₹{assignment.order.totalAmount}
                      </span>
                    </div>

                    <div className="flex items-start justify-between text-sm">
                      <span className="text-gray-600">Delivery Address:</span>
                      <span className="max-w-[60%] text-right font-medium">
                        {assignment.order.deliveryAddress.address},{' '}
                        {assignment.order.deliveryAddress.city}
                      </span>
                    </div>
                  </div>

                  {/* Time Details */}
                  <div className="space-y-2 border-t pt-3">
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="mr-2 h-4 w-4" />
                      <span>
                        Pickup:{' '}
                        {new Date(
                          assignment.order.pickupTime
                        ).toLocaleTimeString()}
                      </span>
                    </div>

                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="mr-2 h-4 w-4" />
                      <span>
                        ETA:{' '}
                        {new Date(
                          assignment.order.estimatedDeliveryTime
                        ).toLocaleTimeString()}
                      </span>
                    </div>

                    <div className="flex items-center text-sm text-gray-600">
                      <Package className="mr-2 h-4 w-4" />
                      <span>
                        Assigned:{' '}
                        {new Date(assignment.assignedAt).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-4 flex gap-2">
                    <Button
                      className="flex-1 bg-blue-100 text-sm text-blue-700 hover:bg-blue-200"
                      onClick={() => {
                        if (assignment.order.customer.phone) {
                          window.open(`tel:${assignment.order.customer.phone}`);
                        }
                      }}
                    >
                      <Phone className="mr-1 h-4 w-4" />
                      Call Customer
                    </Button>

                    <Button
                      className="flex-1 bg-green-100 text-sm text-green-700 hover:bg-green-200"
                      onClick={() => {
                        if (assignment.deliveryPartner.user.phone) {
                          window.open(
                            `tel:${assignment.deliveryPartner.user.phone}`
                          );
                        }
                      }}
                    >
                      <Phone className="mr-1 h-4 w-4" />
                      Call Partner
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </OperationsLayout>
  );
}
