'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  MapPin,
  Plus,
  Pencil,
  Trash2,
  Building2,
  Users,
  CheckCircle,
  XCircle,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';

interface Location {
  id: string;
  name: string;
  city: string;
  state: string;
  country: string;
  isActive: boolean;
  restaurantCount: number;
  createdAt: string;
  updatedAt: string;
}

interface LocationFormProps {
  isEdit?: boolean;
  formData: LocationFormData;
  setFormData: React.Dispatch<React.SetStateAction<LocationFormData>>;
  onCancel: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

const LocationForm: React.FC<LocationFormProps> = ({
  isEdit = false,
  formData,
  setFormData,
  onCancel,
  onSubmit,
  isSubmitting,
}) => (
  <div className="space-y-4">
    <div>
      <Label htmlFor="name">Location Name *</Label>
      <Input
        id="name"
        value={formData.name}
        onChange={(e) =>
          setFormData((prev) => ({ ...prev, name: e.target.value }))
        }
        placeholder="e.g., Koramangala, Indiranagar"
        className="mt-1"
      />
    </div>

    <div>
      <Label htmlFor="city">City *</Label>
      <Input
        id="city"
        value={formData.city}
        onChange={(e) =>
          setFormData((prev) => ({ ...prev, city: e.target.value }))
        }
        placeholder="e.g., Bangalore"
        className="mt-1"
      />
    </div>

    <div>
      <Label htmlFor="state">State *</Label>
      <Input
        id="state"
        value={formData.state}
        onChange={(e) =>
          setFormData((prev) => ({ ...prev, state: e.target.value }))
        }
        placeholder="e.g., Karnataka"
        className="mt-1"
      />
    </div>

    <div>
      <Label htmlFor="country">Country *</Label>
      <Input
        id="country"
        value={formData.country}
        onChange={(e) =>
          setFormData((prev) => ({ ...prev, country: e.target.value }))
        }
        placeholder="e.g., India"
        className="mt-1"
      />
    </div>

    {isEdit && (
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="isActive"
          checked={formData.isActive}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, isActive: e.target.checked }))
          }
          className="rounded"
        />
        <Label htmlFor="isActive">Active</Label>
      </div>
    )}

    <div className="flex justify-end space-x-2 pt-4">
      <Button type="button" variant="outline" onClick={onCancel}>
        Cancel
      </Button>
      <Button
        onClick={onSubmit}
        disabled={
          isSubmitting ||
          !formData.name ||
          !formData.city ||
          !formData.state ||
          !formData.country
        }
        className="bg-[#002a01] text-white hover:bg-[#002a01]/90"
      >
        {isSubmitting ? (
          <>
            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            {isEdit ? 'Updating...' : 'Creating...'}
          </>
        ) : isEdit ? (
          'Update Location'
        ) : (
          'Create Location'
        )}
      </Button>
    </div>
  </div>
);

interface LocationFormData {
  name: string;
  city: string;
  state: string;
  country: string;
  isActive: boolean;
}

export default function LocationsManagement() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [formData, setFormData] = useState<LocationFormData>({
    name: '',
    city: '',
    state: '',
    country: 'India',
    isActive: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch locations
  const fetchLocations = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/locations?includeInactive=true');
      const result = await response.json();

      if (result.success) {
        setLocations(result.locations);
      } else {
        toast.error('Failed to load locations');
      }
    } catch (error) {
      console.error('Error fetching locations:', error);
      toast.error('Failed to load locations');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  // Reset form data
  const resetForm = () => {
    setFormData({
      name: '',
      city: '',
      state: '',
      country: 'India',
      isActive: true,
    });
    setEditingLocation(null);
  };

  // Handle create location
  const handleCreate = async () => {
    try {
      setIsSubmitting(true);
      const response = await fetch('/api/admin/locations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success(result.message || 'Location created successfully');
        setIsCreateDialogOpen(false);
        resetForm();
        fetchLocations();
      } else {
        toast.error(result.error || 'Failed to create location');
      }
    } catch (error) {
      console.error('Error creating location:', error);
      toast.error('Failed to create location');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle edit location
  const handleEdit = (location: Location) => {
    setEditingLocation(location);
    setFormData({
      name: location.name,
      city: location.city,
      state: location.state,
      country: location.country,
      isActive: location.isActive,
    });
    setIsEditDialogOpen(true);
  };

  // Handle update location
  const handleUpdate = async () => {
    if (!editingLocation) return;

    try {
      setIsSubmitting(true);
      const response = await fetch(
        `/api/admin/locations/${editingLocation.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        }
      );

      const result = await response.json();

      if (response.ok) {
        toast.success(result.message || 'Location updated successfully');
        setIsEditDialogOpen(false);
        resetForm();
        fetchLocations();
      } else {
        toast.error(result.error || 'Failed to update location');
      }
    } catch (error) {
      console.error('Error updating location:', error);
      toast.error('Failed to update location');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle delete location
  const handleDelete = async (location: Location) => {
    try {
      const response = await fetch(`/api/admin/locations/${location.id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (response.ok) {
        toast.success(result.message || 'Location deactivated successfully');
        fetchLocations();
      } else {
        toast.error(result.error || 'Failed to deactivate location');
      }
    } catch (error) {
      console.error('Error deleting location:', error);
      toast.error('Failed to deactivate location');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="mx-auto max-w-7xl">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-1/4 rounded bg-gray-200"></div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-40 rounded-lg bg-gray-200"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-3xl font-bold text-[#002a01]">
              Location Management
            </h1>
            <p className="mt-1 text-[#002a01]/70">
              Manage service areas and delivery locations
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <Button
              onClick={fetchLocations}
              variant="outline"
              className="border-[#002a01]/20 text-[#002a01] hover:bg-[#d1f86a]/10"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>

            <Dialog
              open={isCreateDialogOpen}
              onOpenChange={setIsCreateDialogOpen}
            >
              <DialogTrigger asChild>
                <Button className="bg-[#d1f86a] font-semibold text-[#002a01] hover:bg-[#d1f86a]/90">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Location
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Location</DialogTitle>
                  <DialogDescription>
                    Add a new service area for restaurants to serve customers.
                  </DialogDescription>
                </DialogHeader>
                <LocationForm
                  formData={formData}
                  setFormData={setFormData}
                  onCancel={() => setIsCreateDialogOpen(false)}
                  onSubmit={handleCreate}
                  isSubmitting={isSubmitting}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Locations
                  </p>
                  <p className="text-2xl font-bold text-[#002a01]">
                    {locations.length}
                  </p>
                </div>
                <MapPin className="h-8 w-8 text-[#d1f86a]" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Active Locations
                  </p>
                  <p className="text-2xl font-bold text-green-600">
                    {locations.filter((loc) => loc.isActive).length}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Restaurants
                  </p>
                  <p className="text-2xl font-bold text-[#002a01]">
                    {locations.reduce(
                      (sum, loc) => sum + loc.restaurantCount,
                      0
                    )}
                  </p>
                </div>
                <Building2 className="h-8 w-8 text-[#ffd500]" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Locations Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {locations.map((location) => (
            <Card
              key={location.id}
              className="transition-shadow hover:shadow-lg"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg text-[#002a01]">
                      {location.name}
                    </CardTitle>
                    <CardDescription>
                      {location.city}, {location.state}
                    </CardDescription>
                  </div>
                  <Badge
                    variant={location.isActive ? 'default' : 'secondary'}
                    className={
                      location.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }
                  >
                    {location.isActive ? (
                      <>
                        <CheckCircle className="mr-1 h-3 w-3" />
                        Active
                      </>
                    ) : (
                      <>
                        <XCircle className="mr-1 h-3 w-3" />
                        Inactive
                      </>
                    )}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Country:</span>
                  <span className="font-medium">{location.country}</span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Restaurants:</span>
                  <div className="flex items-center">
                    <Building2 className="mr-1 h-4 w-4 text-[#d1f86a]" />
                    <span className="font-medium">
                      {location.restaurantCount}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Created:</span>
                  <span className="font-medium">
                    {new Date(location.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex items-center space-x-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(location)}
                    className="flex-1"
                  >
                    <Pencil className="mr-1 h-3 w-3" />
                    Edit
                  </Button>

                  {location.restaurantCount === 0 && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:bg-red-50 hover:text-red-700"
                        >
                          <Trash2 className="mr-1 h-3 w-3" />
                          Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Deactivate Location
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to deactivate "{location.name}
                            "? This action will hide the location from
                            restaurant onboarding.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(location)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Deactivate
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>

                {location.restaurantCount > 0 && (
                  <p className="rounded bg-gray-50 p-2 text-xs text-gray-500">
                    Cannot delete: {location.restaurantCount} restaurant(s) are
                    using this location
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Location</DialogTitle>
              <DialogDescription>
                Update the location details and status.
              </DialogDescription>
            </DialogHeader>
            <LocationForm
              isEdit={true}
              formData={formData}
              setFormData={setFormData}
              onCancel={() => setIsEditDialogOpen(false)}
              onSubmit={handleUpdate}
              isSubmitting={isSubmitting}
            />
          </DialogContent>
        </Dialog>

        {/* Empty State */}
        {locations.length === 0 && (
          <Card className="py-12 text-center">
            <CardContent>
              <MapPin className="mx-auto mb-4 h-12 w-12 text-gray-400" />
              <h3 className="mb-2 text-lg font-semibold text-gray-900">
                No locations found
              </h3>
              <p className="mb-4 text-gray-600">
                Create your first location to enable restaurant onboarding.
              </p>
              <Button
                onClick={() => setIsCreateDialogOpen(true)}
                className="bg-[#d1f86a] text-[#002a01] hover:bg-[#d1f86a]/90"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add First Location
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
