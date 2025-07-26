"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, Phone, Upload, X } from "lucide-react";
import { toast } from "sonner";

interface RestaurantData {
  name: string;
  description: string;
  phone: string;
  address: string;
  latitude: number;
  longitude: number;
  cuisineTypes: string[];
  minimumOrderAmount: number;
  deliveryRadius: number;
  averagePreparationTime: number;
  operatingHours: {
    [key: string]: { open: string; close: string; isOpen: boolean };
  };
}

export default function RestaurantOnboarding() {
  const { data: session } = useSession();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  
  const [restaurantData, setRestaurantData] = useState<RestaurantData>({
    name: "",
    description: "",
    phone: "",
    address: "",
    latitude: 0,
    longitude: 0,
    cuisineTypes: [],
    minimumOrderAmount: 200,
    deliveryRadius: 5,
    averagePreparationTime: 30,
    operatingHours: {
      monday: { open: "21:00", close: "00:00", isOpen: true },
      tuesday: { open: "21:00", close: "00:00", isOpen: true },
      wednesday: { open: "21:00", close: "00:00", isOpen: true },
      thursday: { open: "21:00", close: "00:00", isOpen: true },
      friday: { open: "21:00", close: "00:00", isOpen: true },
      saturday: { open: "21:00", close: "00:00", isOpen: true },
      sunday: { open: "21:00", close: "00:00", isOpen: true },
    }
  });

  const cuisineOptions = [
    "North Indian", "South Indian", "Italian", "Chinese", "Fast Food",
    "Mughlai", "Continental", "Thai", "Mexican", "Japanese", "Korean"
  ];

  const handleCuisineToggle = (cuisine: string) => {
    setRestaurantData(prev => ({
      ...prev,
      cuisineTypes: prev.cuisineTypes.includes(cuisine)
        ? prev.cuisineTypes.filter(c => c !== cuisine)
        : [...prev.cuisineTypes, cuisine]
    }));
  };

  const handleOperatingHoursChange = (day: string, field: string, value: string | boolean) => {
    setRestaurantData(prev => ({
      ...prev,
      operatingHours: {
        ...prev.operatingHours,
        [day]: {
          ...prev.operatingHours[day],
          [field]: value
        }
      }
    }));
  };

  const handleLocationVerification = async () => {
    try {
      // Mock location verification - in real app, use Google Places API
      const mockCoords = {
        latitude: 28.6139 + (Math.random() - 0.5) * 0.1,
        longitude: 77.2090 + (Math.random() - 0.5) * 0.1
      };
      
      setRestaurantData(prev => ({
        ...prev,
        latitude: mockCoords.latitude,
        longitude: mockCoords.longitude
      }));
      
      toast.success("Location verified successfully!");
    } catch (error) {
      toast.error("Failed to verify location");
    }
  };

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      
      // Mock API call - in real app, create restaurant profile
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success("Restaurant profile created successfully!");
      router.push("/restaurant/dashboard");
    } catch (error) {
      toast.error("Failed to create restaurant profile");
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Restaurant Name *</Label>
            <Input
              id="name"
              value={restaurantData.name}
              onChange={(e) => setRestaurantData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter restaurant name"
              className="mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={restaurantData.description}
              onChange={(e) => setRestaurantData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe your restaurant and specialties"
              className="mt-1"
              rows={3}
            />
          </div>
          
          <div>
            <Label htmlFor="phone">Phone Number *</Label>
            <Input
              id="phone"
              value={restaurantData.phone}
              onChange={(e) => setRestaurantData(prev => ({ ...prev, phone: e.target.value }))}
              placeholder="+91-9876543210"
              className="mt-1"
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Cuisine Types</h3>
        <div className="flex flex-wrap gap-2">
          {cuisineOptions.map((cuisine) => (
            <Badge
              key={cuisine}
              variant={restaurantData.cuisineTypes.includes(cuisine) ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => handleCuisineToggle(cuisine)}
            >
              {cuisine}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Location & Delivery</h3>
        <div className="space-y-4">
          <div>
            <Label htmlFor="address">Restaurant Address *</Label>
            <div className="flex gap-2 mt-1">
              <Input
                id="address"
                value={restaurantData.address}
                onChange={(e) => setRestaurantData(prev => ({ ...prev, address: e.target.value }))}
                placeholder="Enter complete address"
                className="flex-1"
              />
              <Button onClick={handleLocationVerification} variant="outline">
                <MapPin className="w-4 h-4 mr-2" />
                Verify
              </Button>
            </div>
            {restaurantData.latitude !== 0 && (
              <p className="text-sm text-green-600 mt-1">
                ✓ Location verified
              </p>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="deliveryRadius">Delivery Radius (km) *</Label>
              <Input
                id="deliveryRadius"
                type="number"
                value={restaurantData.deliveryRadius}
                onChange={(e) => setRestaurantData(prev => ({ ...prev, deliveryRadius: Number(e.target.value) }))}
                min="1"
                max="10"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="minimumOrder">Minimum Order Amount (₹) *</Label>
              <Input
                id="minimumOrder"
                type="number"
                value={restaurantData.minimumOrderAmount}
                onChange={(e) => setRestaurantData(prev => ({ ...prev, minimumOrderAmount: Number(e.target.value) }))}
                min="100"
                className="mt-1"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="prepTime">Average Preparation Time (minutes) *</Label>
            <Input
              id="prepTime"
              type="number"
              value={restaurantData.averagePreparationTime}
              onChange={(e) => setRestaurantData(prev => ({ ...prev, averagePreparationTime: Number(e.target.value) }))}
              min="10"
              max="60"
              className="mt-1"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Operating Hours</h3>
        <p className="text-sm text-gray-600 mb-4">
          Aasta operates from 9:00 PM to 12:00 AM. Configure your availability within these hours.
        </p>
        
        <div className="space-y-3">
          {Object.entries(restaurantData.operatingHours).map(([day, hours]) => (
            <div key={day} className="flex items-center gap-4 p-3 border rounded-lg">
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
                      onChange={(e) => handleOperatingHoursChange(day, 'open', e.target.value)}
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
                      onChange={(e) => handleOperatingHoursChange(day, 'close', e.target.value)}
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
    <div className="min-h-screen" style={{ backgroundColor: '#fcfefe' }}>
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold" style={{ color: '#002a01' }}>
            Restaurant Onboarding
          </h1>
          <p className="text-gray-600 mt-2">
            Set up your restaurant profile to start receiving orders
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-4">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    currentStep >= step
                      ? 'text-white'
                      : 'text-gray-400 border-2 border-gray-300'
                  }`}
                  style={{
                    backgroundColor: currentStep >= step ? '#002a01' : 'transparent'
                  }}
                >
                  {step}
                </div>
                {step < 3 && (
                  <div
                    className={`w-12 h-0.5 mx-2 ${
                      currentStep > step ? 'bg-primary-dark-green' : 'bg-gray-300'
                    }`}
                    style={{
                      backgroundColor: currentStep > step ? '#002a01' : '#d1d5db'
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
            <CardTitle>
              Step {currentStep} of 3
            </CardTitle>
            <CardDescription>
              {currentStep === 1 && "Tell us about your restaurant"}
              {currentStep === 2 && "Location and delivery settings"}
              {currentStep === 3 && "Configure your operating hours"}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
            
            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              <Button
                variant="outline"
                onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
                disabled={currentStep === 1}
              >
                Previous
              </Button>
              
              {currentStep < 3 ? (
                <Button
                  onClick={() => setCurrentStep(prev => Math.min(3, prev + 1))}
                  disabled={
                    (currentStep === 1 && (!restaurantData.name || !restaurantData.phone)) ||
                    (currentStep === 2 && (!restaurantData.address || restaurantData.latitude === 0))
                  }
                  style={{
                    backgroundColor: '#d1f86a',
                    color: '#002a01',
                    border: '2px solid #002a01'
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
                    border: '2px solid #002a01'
                  }}
                >
                  {isLoading ? "Creating Profile..." : "Complete Setup"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 