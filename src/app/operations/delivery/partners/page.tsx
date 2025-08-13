'use client';

import { useState, useEffect } from 'react';
import OperationsLayout from '@/components/layouts/operations-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  User,
  Edit,
  MapPin,
  Phone,
  Search,
  Star,
  RefreshCw,
  Users,
} from 'lucide-react';

interface DeliveryPartner {
  id: string;
  userId: string;
  user: {
    name: string;
    email: string;
    phone: string;
  };
  status: 'AVAILABLE' | 'BUSY' | 'OFFLINE';
  assignedRestaurants: string[];
  rating: number;
  completedDeliveries: number;
  todayEarnings: number;
}

interface Restaurant {
  id: string;
  name: string;
  address: string;
  phone: string;
}

export default function DeliveryPartners() {
  const [partners, setPartners] = useState<DeliveryPartner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPartner, setSelectedPartner] =
    useState<DeliveryPartner | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newPartnerName, setNewPartnerName] = useState('');
  const [newPartnerEmail, setNewPartnerEmail] = useState('');
  const [selectedRestaurants, setSelectedRestaurants] = useState<string[]>([]);

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
        console.error('Error loading partners:', data.error);
      }
    } catch (error) {
      console.error('Error loading partners:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRestaurants = async () => {
    try {
      const response = await fetch('/api/operations/restaurants');
      const data = await response.json();
      if (data.success) {
        setRestaurants(data.data || []);
      } else {
        console.error('Error loading restaurants:', data.error);
      }
    } catch (error) {
      console.error('Error loading restaurants:', error);
    }
  };

  const handleEditPartner = (partner: DeliveryPartner) => {
    setSelectedPartner(partner);
    setNewPhone(partner.user.phone || '');
    setShowEditModal(true);
  };

  const handleAssignRestaurants = (partner: DeliveryPartner) => {
    setSelectedPartner(partner);
    setSelectedRestaurants(partner.assignedRestaurants || []);
    setShowAssignModal(true);
    fetchRestaurants();
  };

  const updatePartnerPhone = async () => {
    if (selectedPartner) {
      try {
        const response = await fetch(
          `/api/operations/delivery-partners/${selectedPartner.id}`,
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              telegramPhone: newPhone,
              updateUserPhone: true, // Also update the user's phone number
            }),
          }
        );

        const data = await response.json();

        if (data.success) {
          console.log('Successfully updated partner phone:', data.message);
          setShowEditModal(false);
          setSelectedPartner(null);
          loadPartners(); // Refresh partners to show updated data
        } else {
          console.error('Error updating phone:', data.error);
          alert('Error updating phone: ' + data.error);
        }
      } catch (error) {
        console.error('Error updating phone:', error);
        alert('Error updating phone. Please try again.');
      }
    }
  };

  const assignRestaurants = async () => {
    if (selectedPartner) {
      try {
        const response = await fetch(
          `/api/operations/delivery-partners/${selectedPartner.id}`,
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              assignedRestaurants: selectedRestaurants,
            }),
          }
        );

        const data = await response.json();

        if (data.success) {
          console.log('Successfully assigned restaurants:', data.message);
          setShowAssignModal(false);
          setSelectedPartner(null);
          setSelectedRestaurants([]);
          setSearchTerm('');
          loadPartners(); // Refresh partners to show updated assignments
        } else {
          console.error('Error assigning restaurants:', data.error);
          alert('Error assigning restaurants: ' + data.error);
        }
      } catch (error) {
        console.error('Error assigning restaurants:', error);
        alert('Error assigning restaurants. Please try again.');
      }
    }
  };

  const addDeliveryPartner = async () => {
    try {
      // Validate required fields
      if (!newPartnerName || !newPartnerEmail || !newPhone) {
        alert('Please fill in all required fields.');
        return;
      }

      // Create both user and delivery partner in one API call
      const response = await fetch('/api/operations/delivery-partners', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newPartnerName,
          email: newPartnerEmail,
          telegramPhone: newPhone,
        }),
      });

      const data = await response.json();

      if (data.success) {
        console.log('Delivery partner created successfully:', data.message);
        setShowAddModal(false);
        setNewPartnerName('');
        setNewPartnerEmail('');
        setNewPhone('');
        loadPartners(); // Refresh partners to include the new partner
      } else {
        console.error('Error creating delivery partner:', data.error);
        alert('Error creating delivery partner: ' + data.error);
      }
    } catch (error) {
      console.error('Error creating delivery partner:', error);
      alert('Error creating delivery partner. Please try again.');
    }
  };

  const toggleRestaurantSelection = (restaurantId: string) => {
    setSelectedRestaurants((prev) =>
      prev.includes(restaurantId)
        ? prev.filter((id) => id !== restaurantId)
        : [...prev, restaurantId]
    );
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'BUSY':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'OFFLINE':
        return 'bg-red-100 text-red-800 border-red-200';
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
            Loading delivery partners...
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
              Delivery Partners
            </h1>
            <p className="text-primary-dark-green mt-1 text-lg">
              Manage all delivery partners and their assignments
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Button
              onClick={() => setShowAddModal(true)}
              className="bg-accent-leaf-green hover:bg-accent-leaf-green/90 text-primary-dark-green"
            >
              Add Partner
            </Button>
            <Button
              onClick={loadPartners}
              className="bg-accent-leaf-green hover:bg-accent-leaf-green/90 text-primary-dark-green"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>

        {partners.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Users className="mx-auto mb-4 h-12 w-12 text-gray-400" />
              <h3 className="text-primary-dark-green mb-2 text-lg font-semibold">
                No Delivery Partners
              </h3>
              <p className="text-gray-600">
                No delivery partners have been added to the platform yet.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {partners.map((partner) => (
              <Card key={partner.id} className="restaurant-card">
                <CardContent className="p-6">
                  {/* Header */}
                  <div className="mb-4 flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="bg-primary-dark-green flex h-10 w-10 items-center justify-center rounded-full text-white">
                        <User className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-primary-dark-green text-lg font-semibold">
                          {partner.user.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {partner.user.email}
                        </p>
                      </div>
                    </div>
                    <Badge
                      className={`border px-2 py-1 text-xs font-medium ${getStatusBadgeColor(partner.status)}`}
                    >
                      {partner.status}
                    </Badge>
                  </div>

                  {/* Partner Info */}
                  <div className="mb-4 space-y-3">
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone className="mr-2 h-4 w-4" />
                      <span>{partner.user.phone}</span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center text-gray-600">
                        <Star className="mr-1 h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span>{partner.rating || 0}</span>
                      </div>
                      <div className="text-gray-600">
                        {partner.completedDeliveries || 0} deliveries
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Today's Earnings:</span>
                      <span className="text-primary-dark-green font-semibold">
                        ₹{partner.todayEarnings || 0}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">
                        Assigned Restaurants:
                      </span>
                      <span className="text-primary-dark-green font-semibold">
                        {partner.assignedRestaurants?.length || 0}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleEditPartner(partner)}
                        className="bg-accent-leaf-green hover:bg-accent-leaf-green/90 text-primary-dark-green flex-1 text-sm"
                      >
                        <Edit className="mr-1 h-4 w-4" />
                        Edit
                      </Button>

                      <Button
                        onClick={() => {
                          if (partner.user.phone) {
                            window.open(`tel:${partner.user.phone}`);
                          }
                        }}
                        className="bg-blue-100 px-3 text-sm text-blue-700 hover:bg-blue-200"
                      >
                        <Phone className="h-4 w-4" />
                      </Button>
                    </div>

                    <Button
                      onClick={() => handleAssignRestaurants(partner)}
                      className="w-full bg-blue-100 text-sm text-blue-700 hover:bg-blue-200"
                    >
                      <MapPin className="mr-1 h-4 w-4" />
                      Assign Restaurants
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Edit Partner Phone Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Partner Telegram</DialogTitle>
            <DialogDescription>
              Update the telegram phone number for {selectedPartner?.user.name}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              type="tel"
              value={newPhone}
              onChange={(e) => setNewPhone(e.target.value)}
              placeholder="Enter new telegram phone number"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button onClick={updatePartnerPhone}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Restaurants Modal */}
      <Dialog open={showAssignModal} onOpenChange={setShowAssignModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Assign Restaurants</DialogTitle>
            <DialogDescription>
              Assign restaurants to {selectedPartner?.user.name}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
              <Input
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search restaurants..."
              />
            </div>

            <div className="max-h-60 overflow-y-auto rounded-md border">
              {restaurants
                .filter((restaurant) =>
                  restaurant.name
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase())
                )
                .map((restaurant) => (
                  <div
                    key={restaurant.id}
                    className="flex items-center gap-3 border-b p-3 last:border-b-0 hover:bg-gray-50"
                  >
                    <input
                      type="checkbox"
                      checked={selectedRestaurants.includes(restaurant.id)}
                      onChange={() => toggleRestaurantSelection(restaurant.id)}
                      className="form-checkbox text-primary-dark-green h-4 w-4"
                    />
                    <div className="flex-1">
                      <h4 className="text-primary-dark-green font-medium">
                        {restaurant.name}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {restaurant.address}
                      </p>
                    </div>
                  </div>
                ))}

              {restaurants.filter((restaurant) =>
                restaurant.name.toLowerCase().includes(searchTerm.toLowerCase())
              ).length === 0 && (
                <div className="p-8 text-center text-gray-500">
                  No restaurants found
                </div>
              )}
            </div>

            <div className="text-sm text-gray-600">
              Selected: {selectedRestaurants.length} restaurant(s)
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAssignModal(false)}>
              Cancel
            </Button>
            <Button onClick={assignRestaurants}>
              Assign Selected ({selectedRestaurants.length})
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Delivery Partner Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Delivery Partner</DialogTitle>
            <DialogDescription>
              Enter the information for the new delivery partner.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              type="text"
              value={newPartnerName}
              onChange={(e) => setNewPartnerName(e.target.value)}
              placeholder="Enter name"
            />
            <Input
              type="email"
              value={newPartnerEmail}
              onChange={(e) => setNewPartnerEmail(e.target.value)}
              placeholder="Enter email"
            />
            <Input
              type="tel"
              value={newPhone}
              onChange={(e) => setNewPhone(e.target.value)}
              placeholder="Enter telegram phone number"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button onClick={addDeliveryPartner}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </OperationsLayout>
  );
}
