"use client";

import { useState, useEffect } from "react";
import OperationsLayout from "@/components/layouts/operations-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  User,
  Clock,
  MapPin,
  Phone,
  Truck,
  Package,
  RefreshCw
} from "lucide-react";

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
      <OperationsLayout type="restaurant">
        <div className="flex items-center justify-center min-h-screen">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5 animate-spin" />
            Loading assignments...
          </div>
        </div>
      </OperationsLayout>
    );
  }

  return (
    <OperationsLayout type="restaurant">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-primary-dark-green">
              Active Assignments
            </h1>
            <p className="text-lg text-primary-dark-green mt-1">
              Delivery partners currently busy with orders
            </p>
          </div>
          <Button 
            onClick={loadAssignments}
            className="bg-accent-leaf-green hover:bg-accent-leaf-green/90 text-primary-dark-green"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        {assignments.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Truck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2 text-primary-dark-green">
                No Active Assignments
              </h3>
              <p className="text-gray-600">
                No delivery partners are currently assigned to orders.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {assignments.map((assignment) => (
              <Card key={assignment.id} className="restaurant-card">
                <CardContent className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary-dark-green text-white rounded-full flex items-center justify-center">
                        <User className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-primary-dark-green">
                          {assignment.deliveryPartner.user.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {assignment.deliveryPartner.user.phone}
                        </p>
                      </div>
                    </div>
                    <Badge className={`px-2 py-1 text-xs font-medium border ${getStatusBadgeColor(assignment.status)}`}>
                      {assignment.status}
                    </Badge>
                  </div>

                  {/* Order Details */}
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Order ID:</span>
                      <span className="font-medium">{assignment.order.orderNumber}</span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Restaurant:</span>
                      <span className="font-medium">{assignment.order.restaurant.name}</span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Customer:</span>
                      <span className="font-medium">{assignment.order.customer.name}</span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Order Amount:</span>
                      <span className="font-medium text-primary-dark-green">₹{assignment.order.totalAmount}</span>
                    </div>

                    <div className="flex items-start justify-between text-sm">
                      <span className="text-gray-600">Delivery Address:</span>
                      <span className="font-medium text-right max-w-[60%]">
                        {assignment.order.deliveryAddress.address}, {assignment.order.deliveryAddress.city}
                      </span>
                    </div>
                  </div>

                  {/* Time Details */}
                  <div className="border-t pt-3 space-y-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="w-4 h-4 mr-2" />
                      <span>Pickup: {new Date(assignment.order.pickupTime).toLocaleTimeString()}</span>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="w-4 h-4 mr-2" />
                      <span>ETA: {new Date(assignment.order.estimatedDeliveryTime).toLocaleTimeString()}</span>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600">
                      <Package className="w-4 h-4 mr-2" />
                      <span>Assigned: {new Date(assignment.assignedAt).toLocaleTimeString()}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-4 flex gap-2">
                    <Button
                      className="flex-1 bg-blue-100 hover:bg-blue-200 text-blue-700 text-sm"
                      onClick={() => {
                        if (assignment.order.customer.phone) {
                          window.open(`tel:${assignment.order.customer.phone}`);
                        }
                      }}
                    >
                      <Phone className="w-4 h-4 mr-1" />
                      Call Customer
                    </Button>
                    
                    <Button
                      className="flex-1 bg-green-100 hover:bg-green-200 text-green-700 text-sm"
                      onClick={() => {
                        if (assignment.deliveryPartner.user.phone) {
                          window.open(`tel:${assignment.deliveryPartner.user.phone}`);
                        }
                      }}
                    >
                      <Phone className="w-4 h-4 mr-1" />
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
