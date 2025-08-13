'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  MapPin,
  Clock,
  Phone,
  Upload,
  X,
  CheckCircle,
  ChefHat,
  Store,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';
import { toast } from 'sonner';
import { EnhancedLocationInput } from '@/components/location/enhanced-location-input';
import RestaurantLayout from '@/components/layouts/restaurant-layout';

interface RestaurantData {
  name: string;
  ownerName: string;
  phone: string;
  address: string;
  latitude: number;
  longitude: number;
  locationId: string | null;
  cuisineTypes: string[];
  operatingHours: {
    [key: string]: { open: string; close: string; isOpen: boolean };
  };
}

interface Location {
  id: string;
  name: string;
  city: string;
  state: string;
  country: string;
}

export default function RestaurantOnboarding() {
  const { data: session } = useSession();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loadingLocations, setLoadingLocations] = useState(true);

  const [restaurantData, setRestaurantData] = useState<RestaurantData>({
    name: '',
    ownerName: '',
    phone: '',
    address: '',
    latitude: 0,
    longitude: 0,
    locationId: null,
    cuisineTypes: [],
    operatingHours: {
      monday: { open: '21:00', close: '00:00', isOpen: true },
      tuesday: { open: '21:00', close: '00:00', isOpen: true },
      wednesday: { open: '21:00', close: '00:00', isOpen: true },
      thursday: { open: '21:00', close: '00:00', isOpen: true },
      friday: { open: '21:00', close: '00:00', isOpen: true },
      saturday: { open: '21:00', close: '00:00', isOpen: true },
      sunday: { open: '21:00', close: '00:00', isOpen: true },
    },
  });

  // Fetch locations on component mount
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await fetch('/api/locations');
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
        setLoadingLocations(false);
      }
    };

    fetchLocations();
  }, []);

  const cuisineOptions = [
    'North Indian',
    'South Indian',
    'Italian',
    'Chinese',
    'Fast Food',
    'Mughlai',
    'Continental',
    'Thai',
    'Mexican',
    'Japanese',
    'Korean',
  ];

  const handleCuisineToggle = (cuisine: string) => {
    setRestaurantData((prev) => ({
      ...prev,
      cuisineTypes: prev.cuisineTypes.includes(cuisine)
        ? prev.cuisineTypes.filter((c) => c !== cuisine)
        : [...prev.cuisineTypes, cuisine],
    }));
  };

  const handleOperatingHoursChange = (
    day: string,
    field: string,
    value: string | boolean
  ) => {
    setRestaurantData((prev) => ({
      ...prev,
      operatingHours: {
        ...prev.operatingHours,
        [day]: {
          ...prev.operatingHours[day],
          [field]: value,
        },
      },
    }));
  };

  const handleLocationVerification = async () => {
    try {
      // Mock location verification - in real app, use Google Places API
      const mockCoords = {
        latitude: 28.6139 + (Math.random() - 0.5) * 0.1,
        longitude: 77.209 + (Math.random() - 0.5) * 0.1,
      };

      setRestaurantData((prev) => ({
        ...prev,
        latitude: mockCoords.latitude,
        longitude: mockCoords.longitude,
      }));

      toast.success('Location verified successfully!');
    } catch (error) {
      toast.error('Failed to verify location');
    }
  };

  const handleSubmit = async () => {
    try {
      setIsLoading(true);

      // Create restaurant profile via API
      const response = await fetch('/api/restaurants', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(restaurantData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create restaurant profile');
      }

      toast.success('Restaurant profile created successfully!');
      router.push('/restaurant/dashboard');
    } catch (error) {
      console.error('Error creating restaurant:', error);
      toast.error(
        error instanceof Error
          ? error.message
          : 'Failed to create restaurant profile'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="mb-4 text-lg font-semibold">Basic Information</h3>
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Restaurant Name *</Label>
            <Input
              id="name"
              value={restaurantData.name}
              onChange={(e) =>
                setRestaurantData((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="Enter restaurant name"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="ownerName">Owner/SPoC Name *</Label>
            <Input
              id="ownerName"
              value={restaurantData.ownerName}
              onChange={(e) =>
                setRestaurantData((prev) => ({
                  ...prev,
                  ownerName: e.target.value,
                }))
              }
              placeholder="Enter owner or point of contact name"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="phone">Phone Number *</Label>
            <Input
              id="phone"
              value={restaurantData.phone}
              onChange={(e) =>
                setRestaurantData((prev) => ({
                  ...prev,
                  phone: e.target.value,
                }))
              }
              placeholder="+91-9876543210"
              className="mt-1"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const handleLocationSelect = (location: {
    address: string;
    latitude: number;
    longitude: number;
  }) => {
    setRestaurantData((prev) => ({
      ...prev,
      address: location.address,
      latitude: location.latitude,
      longitude: location.longitude,
    }));
  };

  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="mb-4 text-lg font-semibold">Restaurant Location</h3>
        <p className="mb-4 text-sm text-gray-600">
          🎯 <strong>Important:</strong> Your exact location is critical for
          showing your restaurant to nearby customers. Please ensure your
          location is accurate.
        </p>
        <div className="space-y-4">
          {/* Location Selection */}
          <div>
            <Label htmlFor="location">Service Area *</Label>
            <Select
              value={restaurantData.locationId || ''}
              onValueChange={(value) =>
                setRestaurantData((prev) => ({ ...prev, locationId: value }))
              }
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select your service area">
                  {restaurantData.locationId &&
                  locations.find((loc) => loc.id === restaurantData.locationId)
                    ? `${locations.find((loc) => loc.id === restaurantData.locationId)?.name}, ${locations.find((loc) => loc.id === restaurantData.locationId)?.city}`
                    : 'Select your service area'}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {loadingLocations ? (
                  <SelectItem value="loading" disabled>
                    Loading locations...
                  </SelectItem>
                ) : locations.length > 0 ? (
                  locations.map((location) => (
                    <SelectItem
                      key={location.id}
                      value={location.id.toString()}
                    >
                      {location.name}, {location.city}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="none" disabled>
                    No locations available
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
            <p className="mt-1 text-xs text-gray-500">
              This determines which area your restaurant will serve customers
              in.
            </p>
          </div>

          {/* Address Input */}
          <EnhancedLocationInput
            onLocationSelect={handleLocationSelect}
            initialAddress={restaurantData.address}
            placeholder="Enter your restaurant's complete address"
            required={true}
            label="Restaurant Address"
          />
        </div>

        {restaurantData.latitude !== 0 && restaurantData.longitude !== 0 && (
          <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-3">
            <p className="text-sm text-green-800">
              ✅ <strong>Location Confirmed:</strong>
              <br />
              📍 Coordinates: {restaurantData.latitude.toFixed(6)},{' '}
              {restaurantData.longitude.toFixed(6)}
              <br />
              📧 Address: {restaurantData.address}
            </p>
          </div>
        )}
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="mb-4 text-lg font-semibold">Operating Hours</h3>
        <p className="mb-4 text-sm text-gray-600">
          Aasta operates from 9:00 PM to 12:00 AM. Configure your availability
          within these hours.
        </p>

        <div className="space-y-3">
          {Object.entries(restaurantData.operatingHours).map(([day, hours]) => (
            <div
              key={day}
              className="flex items-center gap-4 rounded-lg border p-3"
            >
              <div className="w-20">
                <span className="font-medium capitalize">{day}</span>
              </div>

              <Checkbox
                checked={hours.isOpen}
                onCheckedChange={(checked) =>
                  handleOperatingHoursChange(day, 'isOpen', checked as boolean)
                }
              />

              {hours.isOpen && (
                <>
                  <div className="flex items-center gap-2">
                    <Label className="text-sm">Open:</Label>
                    <Input
                      type="time"
                      value={hours.open}
                      onChange={(e) =>
                        handleOperatingHoursChange(day, 'open', e.target.value)
                      }
                      min="21:00"
                      max="23:59"
                      className="w-32"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <Label className="text-sm">Close:</Label>
                    <Input
                      type="time"
                      value={hours.close}
                      onChange={(e) =>
                        handleOperatingHoursChange(day, 'close', e.target.value)
                      }
                      min="21:00"
                      max="00:00"
                      className="w-32"
                    />
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <RestaurantLayout title="Onboarding" showSidebar={false}>
      <div className="mx-auto max-w-2xl px-4 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold" style={{ color: '#002a01' }}>
            Restaurant Onboarding
          </h1>
          <p className="mt-2 text-gray-600">
            Set up your restaurant profile to start receiving orders
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8 flex justify-center">
          <div className="flex items-center space-x-4">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                    currentStep >= step
                      ? 'text-white'
                      : 'border-2 border-gray-300 text-gray-400'
                  }`}
                  style={{
                    backgroundColor:
                      currentStep >= step ? '#002a01' : 'transparent',
                  }}
                >
                  {step}
                </div>
                {step < 3 && (
                  <div
                    className={`mx-2 h-0.5 w-12 ${
                      currentStep > step
                        ? 'bg-primary-dark-green'
                        : 'bg-gray-300'
                    }`}
                    style={{
                      backgroundColor:
                        currentStep > step ? '#002a01' : '#d1d5db',
                    }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form Card */}
        <Card>
          <CardHeader>
            <CardTitle>Step {currentStep} of 3</CardTitle>
            <CardDescription>
              {currentStep === 1 && 'Tell us about your restaurant'}
              {currentStep === 2 && 'Location and delivery settings'}
              {currentStep === 3 && 'Configure your operating hours'}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}

            {/* Navigation Buttons */}
            <div className="mt-8 flex justify-between">
              <Button
                variant="outline"
                onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
                disabled={currentStep === 1}
              >
                Previous
              </Button>

              {currentStep < 3 ? (
                <Button
                  onClick={() =>
                    setCurrentStep((prev) => Math.min(3, prev + 1))
                  }
                  disabled={
                    (currentStep === 1 &&
                      (!restaurantData.name ||
                        !restaurantData.ownerName ||
                        !restaurantData.phone)) ||
                    (currentStep === 2 &&
                      (!restaurantData.address ||
                        restaurantData.latitude === 0 ||
                        restaurantData.longitude === 0 ||
                        !restaurantData.locationId))
                  }
                  style={{
                    backgroundColor: '#d1f86a',
                    color: '#002a01',
                    border: '2px solid #002a01',
                  }}
                >
                  Next
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  style={{
                    backgroundColor: '#d1f86a',
                    color: '#002a01',
                    border: '2px solid #002a01',
                  }}
                >
                  {isLoading ? 'Creating Profile...' : 'Complete Setup'}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </RestaurantLayout>
  );
}
