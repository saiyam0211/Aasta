"use client";

import { useState, useEffect } from "react";
import OperationsLayout from "@/components/layouts/operations-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { 
  Users, 
  Search, 
  Plus, 
  Phone,
  Star,
  Truck,
  MapPin,
  Edit,
  Eye,
  MessageCircle
} from "lucide-react";

interface DeliveryPartner {
  id: string;
  userId: string;
  user: {
    name: string;
    email: string;
    phone: string;
  };
  assignedRestaurants: string[];
  status: 'AVAILABLE' | 'BUSY' | 'OFFLINE';
  rating: number;
  completedDeliveries: number;
  todayEarnings: number;
  totalEarnings: number;
  telegramPhone?: string;
  currentLatitude?: number;
  currentLongitude?: number;
}

interface NewPartnerData {
  name: string;
  email: string;
  phone: string;
  telegramPhone?: string;
}

interface Restaurant {
  id: string;
  name: string;
  address: string;
  status: string;
  ownerName: string;
  phone: string;
  email: string;
}

export default function DeliveryOperationsPage() {
  const [partners, setPartners] = useState<DeliveryPartner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'AVAILABLE' | 'BUSY' | 'OFFLINE'>('ALL');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newPartnerData, setNewPartnerData] = useState<NewPartnerData>({
    name: '',
    email: '',
    phone: '',
    telegramPhone: ''
  });
  const [editingPartner, setEditingPartner] = useState<DeliveryPartner | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [assigningPartner, setAssigningPartner] = useState<DeliveryPartner | null>(null);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [selectedRestaurants, setSelectedRestaurants] = useState<string[]>([]);

  useEffect(() => {
    loadPartners();
    loadRestaurants();
  }, []);

  const loadRestaurants = async () => {
    try {
      const response = await fetch('/api/operations/restaurants');
      const data = await response.json();
      if (data.success) {
        setRestaurants(data.data || []);
      } else {
        console.error('Failed to load restaurants:', data.error);
      }
    } catch (error) {
      console.error('Error loading restaurants:', error);
    }
  };

  const loadPartners = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/operations/delivery-partners');
      const data = await response.json();
      if (data.success) {
        setPartners(data.data || []);
      } else {
        console.error('Failed to load delivery partners:', data.error);
      }
    } catch (error) {
      console.error('Error loading delivery partners:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddPartner = async () => {
    try {
      setIsSubmitting(true);
      const userResponse = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newPartnerData.name,
          email: newPartnerData.email,
          phone: newPartnerData.phone,
          role: 'DELIVERY_PARTNER'
        }),
      });
      const userData = await userResponse.json();
      if (!userData.success) {
        alert('Failed to create user: ' + userData.error);
        return;
      }

      const partnerResponse = await fetch('/api/delivery-partners', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userData.data.id,
          telegramPhone: newPartnerData.telegramPhone
        }),
      });
      const partnerData = await partnerResponse.json();
      if (partnerData.success) {
        setIsAddDialogOpen(false);
        setNewPartnerData({ name: '', email: '', phone: '', telegramPhone: '' });
        loadPartners();
      } else {
        alert('Failed to create delivery partner: ' + partnerData.error);
      }
    } catch (error) {
      console.error('Error adding delivery partner:', error);
      alert('Error adding delivery partner. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (partnerId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/delivery-partners/${partnerId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (response.ok) {
        loadPartners();
      } else {
        console.error('Failed to update partner status');
      }
    } catch (error) {
      console.error('Error updating partner status:', error);
    }
  };

  const handleEditPartner = (partner: DeliveryPartner) => {
    setEditingPartner(partner);
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingPartner) return;
    try {
      setIsSubmitting(true);
      const response = await fetch(`/api/delivery-partners/${editingPartner.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          telegramPhone: editingPartner.telegramPhone
        }),
      });
      if (response.ok) {
        setIsEditDialogOpen(false);
        setEditingPartner(null);
        loadPartners();
      } else {
        console.error('Failed to update partner');
        alert('Failed to update partner. Please try again.');
      }
    } catch (error) {
      console.error('Error updating partner:', error);
      alert('Error updating partner. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAssignRestaurants = (partner: DeliveryPartner) => {
    setAssigningPartner(partner);
    setSelectedRestaurants(partner.assignedRestaurants || []);
    setIsAssignDialogOpen(true);
  };

  const handleSaveAssignment = async () => {
    if (!assigningPartner) return;
    try {
      setIsSubmitting(true);
      
      // First, get current assignments for each restaurant to avoid overwriting other partners
      const restaurantUpdates = [];
      
      for (const restaurantId of restaurants.map(r => r.id)) {
        // Get current restaurant data
        const currentResponse = await fetch(`/api/restaurants/${restaurantId}/assign-partners`);
        if (currentResponse.ok) {
          const currentData = await currentResponse.json();
          const currentPartners = currentData.data?.restaurant?.assignedDeliveryPartners || [];
          
          let updatedPartners;
          if (selectedRestaurants.includes(restaurantId)) {
            // Add this partner if not already assigned
            if (!currentPartners.includes(assigningPartner.id)) {
              updatedPartners = [...currentPartners, assigningPartner.id];
            } else {
              updatedPartners = currentPartners; // Already assigned, no change needed
            }
          } else {
            // Remove this partner if currently assigned
            updatedPartners = currentPartners.filter((id: string) => id !== assigningPartner.id);
          }
          
          // Only update if there's a change
          if (JSON.stringify(updatedPartners.sort()) !== JSON.stringify(currentPartners.sort())) {
            restaurantUpdates.push({ restaurantId, updatedPartners });
          }
        }
      }
      
      // Apply the updates
      for (const { restaurantId, updatedPartners } of restaurantUpdates) {
        const response = await fetch(`/api/restaurants/${restaurantId}/assign-partners`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            deliveryPartnerIds: updatedPartners
          }),
        });
        
        if (!response.ok) {
          const error = await response.json();
          console.error(`Failed to update restaurant ${restaurantId}:`, error);
          throw new Error(`Failed to update restaurant assignments`);
        }
      }
      
      // Also update the delivery partner's assignedRestaurants field
      const partnerResponse = await fetch(`/api/delivery-partners/${assigningPartner.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          assignedRestaurants: selectedRestaurants
        }),
      });
      
      if (partnerResponse.ok) {
        setIsAssignDialogOpen(false);
        setAssigningPartner(null);
        setSelectedRestaurants([]);
        loadPartners();
        alert('Restaurant assignments updated successfully!');
      } else {
        console.error('Failed to update delivery partner assignments');
        alert('Failed to update delivery partner assignments. Please try again.');
      }
    } catch (error) {
      console.error('Error updating restaurant assignments:', error);
      alert('Error updating restaurant assignments. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleRestaurantSelection = (restaurantId: string) => {
    setSelectedRestaurants(prev =>
      prev.includes(restaurantId)
        ? prev.filter(id => id !== restaurantId)
        : [...prev, restaurantId]
    );
  };

  const filteredPartners = partners.filter(partner => {
    const matchesSearch = partner.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         partner.user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         partner.user.phone.includes(searchQuery);
    const matchesStatus = statusFilter === 'ALL' || partner.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-brand text-3xl font-bold text-primary-dark-green">
                Delivery Operations
              </h1>
              <p className="text-signature text-lg text-primary-dark-green mt-1">
                Manage delivery partners
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded mb-3 w-2/3"></div>
                  <div className="flex justify-between">
                    <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-8 bg-gray-200 rounded w-20"></div>
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
      <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-brand text-3xl font-bold text-primary-dark-green">
            Delivery Operations
          </h1>
          <p className="text-signature text-lg text-primary-dark-green mt-1">
            Manage delivery partners
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-accent-leaf-green hover:bg-accent-leaf-green/90 text-primary-dark-green touchable">
              <Plus className="w-4 h-4 mr-2" />
              Add Delivery Partner
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Delivery Partner</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input
                  id="name"
                  value={newPartnerData.name}
                  onChange={(e) => setNewPartnerData(prev => ({ ...prev, name: e.target.value }))}
                  className="col-span-3"
                  placeholder="Enter full name"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={newPartnerData.email}
                  onChange={(e) => setNewPartnerData(prev => ({ ...prev, email: e.target.value }))}
                  className="col-span-3"
                  placeholder="Enter email address"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="phone" className="text-right">
                  Phone
                </Label>
                <Input
                  id="phone"
                  value={newPartnerData.phone}
                  onChange={(e) => setNewPartnerData(prev => ({ ...prev, phone: e.target.value }))}
                  className="col-span-3"
                  placeholder="Enter phone number"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="telegram" className="text-right">
                  Telegram Phone
                </Label>
                <Input
                  id="telegram"
                  value={newPartnerData.telegramPhone}
                  onChange={(e) => setNewPartnerData(prev => ({ ...prev, telegramPhone: e.target.value }))}
                  className="col-span-3"
                  placeholder="Enter Telegram phone number (optional)"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsAddDialogOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddPartner}
                disabled={isSubmitting}
                className="bg-accent-leaf-green hover:bg-accent-leaf-green/90 text-primary-dark-green"
              >
                {isSubmitting ? 'Adding...' : 'Add Partner'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="restaurant-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Partners</p>
                <p className="text-2xl font-bold text-primary-dark-green">{partners.length}</p>
              </div>
              <Users className="w-8 h-8 text-primary-dark-green" />
            </div>
          </CardContent>
        </Card>

        <Card className="restaurant-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Available</p>
                <p className="text-2xl font-bold text-green-600">
                  {partners.filter(p => p.status === 'AVAILABLE').length}
                </p>
              </div>
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <Users className="w-4 h-4 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="restaurant-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Busy</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {partners.filter(p => p.status === 'BUSY').length}
                </p>
              </div>
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <Truck className="w-4 h-4 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="restaurant-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Offline</p>
                <p className="text-2xl font-bold text-red-600">
                  {partners.filter(p => p.status === 'OFFLINE').length}
                </p>
              </div>
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <Users className="w-4 h-4 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="restaurant-card">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search partners by name, email, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-10 border-2 border-gray-300 rounded-lg selectable"
              />
            </div>
            
            <div className="flex gap-2">
              {['ALL', 'AVAILABLE', 'BUSY', 'OFFLINE'].map(status => (
                <Button
                  key={status}
                  onClick={() => setStatusFilter(status as any)}
                  className={`h-10 px-4 rounded-lg touchable ${
                    statusFilter === status
                      ? 'bg-accent-leaf-green text-primary-dark-green'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {status}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Partners Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPartners.map((partner) => (
          <Card key={partner.id} className="restaurant-card">
            <CardContent className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-primary-dark-green mb-1">
                    {partner.user.name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {partner.user.email}
                  </p>
                </div>
                <Badge className={`px-2 py-1 text-xs font-medium border ${getStatusBadgeColor(partner.status)}`}>
                  {partner.status}
                </Badge>
              </div>

              {/* Partner Info */}
              <div className="space-y-3 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <Phone className="w-4 h-4 mr-2" />
                  <span>{partner.user.phone}</span>
                </div>

                {partner.telegramPhone && (
                  <div className="flex items-center text-sm text-gray-600">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    <span>Telegram: {partner.telegramPhone}</span>
                  </div>
                )}

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center text-gray-600">
                    <Star className="w-4 h-4 mr-1 fill-yellow-400 text-yellow-400" />
                    <span>{partner.rating}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Truck className="w-4 h-4 mr-1" />
                    <span>{partner.completedDeliveries} deliveries</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Today's Earnings:</span>
                  <span className="font-semibold text-primary-dark-green">₹{partner.todayEarnings}</span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Assigned Restaurants:</span>
                  <span className="font-semibold text-primary-dark-green">{partner.assignedRestaurants.length}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleEditPartner(partner)}
                    className="flex-1 bg-accent-leaf-green hover:bg-accent-leaf-green/90 text-primary-dark-green text-sm touchable"
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  
                  <Button
                    onClick={() => handleStatusChange(
                      partner.id, 
                      partner.status === 'AVAILABLE' ? 'OFFLINE' : 'AVAILABLE'
                    )}
                    className={`px-3 text-sm touchable ${
                      partner.status === 'AVAILABLE'
                        ? 'bg-red-100 hover:bg-red-200 text-red-700'
                        : 'bg-green-100 hover:bg-green-200 text-green-700'
                    }`}
                  >
                    {partner.status === 'AVAILABLE' ? 'Set Offline' : 'Set Available'}
                  </Button>
                </div>
                <Button
                  onClick={() => handleAssignRestaurants(partner)}
                  className="w-full bg-blue-100 hover:bg-blue-200 text-blue-700 text-sm touchable"
                >
                  <MapPin className="w-4 h-4 mr-1" />
                  Assign Restaurants
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* No Results */}
      {filteredPartners.length === 0 && !isLoading && (
        <Card className="restaurant-card">
          <CardContent className="p-8 text-center">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2 text-primary-dark-green">
              No delivery partners found
            </h3>
            <p className="text-gray-600 mb-4">
              {searchQuery || statusFilter !== 'ALL' 
                ? 'Try adjusting your search or filters'
                : 'No delivery partners have been added to the platform yet'
              }
            </p>
            <Button 
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('ALL');
              }}
              className="bg-accent-leaf-green hover:bg-accent-leaf-green/90 text-primary-dark-green touchable"
            >
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Delivery Partner</DialogTitle>
          </DialogHeader>
          {editingPartner && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Name</Label>
                <div className="col-span-3 text-sm text-gray-600">
                  {editingPartner.user.name}
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Email</Label>
                <div className="col-span-3 text-sm text-gray-600">
                  {editingPartner.user.email}
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Phone</Label>
                <div className="col-span-3 text-sm text-gray-600">
                  {editingPartner.user.phone}
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-telegram" className="text-right">
                  Telegram Phone
                </Label>
                <Input
                  id="edit-telegram"
                  value={editingPartner.telegramPhone || ''}
                  onChange={(e) => setEditingPartner(prev => 
                    prev ? { ...prev, telegramPhone: e.target.value } : null
                  )}
                  className="col-span-3"
                  placeholder="Enter Telegram phone number (optional)"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Status</Label>
                <Badge className={getStatusBadgeColor(editingPartner.status)}>
                  {editingPartner.status}
                </Badge>
              </div>
            </div>
          )}
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsEditDialogOpen(false);
                setEditingPartner(null);
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveEdit}
              disabled={isSubmitting}
              className="bg-accent-leaf-green hover:bg-accent-leaf-green/90 text-primary-dark-green"
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Assign Restaurants Dialog */}
      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Assign Restaurants</DialogTitle>
            {assigningPartner && (
              <p className="text-sm text-gray-600">
                Managing restaurant assignments for {assigningPartner.user.name}
              </p>
            )}
          </DialogHeader>
          <div className="py-4">
            {restaurants.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No restaurants available</p>
                <p className="text-sm text-gray-400">
                  Add restaurants to the platform first before assigning them to delivery partners.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-sm text-gray-600 mb-4">
                  Select restaurants that this delivery partner should receive orders from:
                </div>
                <div className="max-h-96 overflow-y-auto space-y-3">
                  {restaurants.map((restaurant) => (
                    <div
                      key={restaurant.id}
                      className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-all ${
                        selectedRestaurants.includes(restaurant.id)
                          ? 'border-accent-leaf-green bg-accent-leaf-green/10'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => toggleRestaurantSelection(restaurant.id)}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <div className="flex-1">
                            <h4 className="font-medium text-primary-dark-green">
                              {restaurant.name}
                            </h4>
                            <p className="text-sm text-gray-600 mt-1">
                              {restaurant.address}
                            </p>
                            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                              <span>Owner: {restaurant.ownerName}</span>
                              <span>Phone: {restaurant.phone}</span>
                              <span className={`px-2 py-1 rounded text-xs ${
                                restaurant.status === 'ACTIVE' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {restaurant.status}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex-shrink-0 ml-4">
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                          selectedRestaurants.includes(restaurant.id)
                            ? 'border-accent-leaf-green bg-accent-leaf-green'
                            : 'border-gray-300'
                        }`}>
                          {selectedRestaurants.includes(restaurant.id) && (
                            <svg className="w-3 h-3 text-primary-dark-green" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-700">
                    <strong>Selected: {selectedRestaurants.length}</strong> of {restaurants.length} restaurants
                  </div>
                  {selectedRestaurants.length > 0 && (
                    <div className="text-xs text-gray-500 mt-1">
                      This partner will receive order notifications from the selected restaurants.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsAssignDialogOpen(false);
                setAssigningPartner(null);
                setSelectedRestaurants([]);
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveAssignment}
              disabled={isSubmitting || restaurants.length === 0}
              className="bg-accent-leaf-green hover:bg-accent-leaf-green/90 text-primary-dark-green"
            >
              {isSubmitting ? 'Saving...' : 'Save Assignment'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      </div>
    </OperationsLayout>
  );
}

