"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, Loader, Navigation } from "lucide-react";
import { toast } from "sonner";

interface LocationInputProps {
  onLocationSelect: (location: {
    address: string;
    latitude: number;
    longitude: number;
  }) => void;
  initialAddress?: string;
  placeholder?: string;
  required?: boolean;
  label?: string;
}

export function EnhancedLocationInput({
  onLocationSelect,
  initialAddress = "",
  placeholder = "Enter complete address",
  required = false,
  label = "Address"
}: LocationInputProps) {
  const [address, setAddress] = useState(initialAddress);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isLocationDetected, setIsLocationDetected] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const getCurrentLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by this browser.");
      return;
    }

    setIsLoadingLocation(true);
    try {
      const position = await new Promise<GeolocationPosition>(
        (resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            resolve,
            reject,
            {
              enableHighAccuracy: true,
              timeout: 15000,
              maximumAge: 60000,
            }
          );
        }
      );

      const { latitude, longitude } = position.coords;

      // Use Google Maps Geocoding API to get detailed address
      try {
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
        );
        const data = await response.json();

        if (data.status === 'OK' && data.results.length > 0) {
          const result = data.results[0];
          const formattedAddress = result.formatted_address;
          
          const locationData = {
            address: formattedAddress,
            latitude,
            longitude,
          };
          
          setAddress(formattedAddress);
          setIsLocationDetected(true);
          onLocationSelect(locationData);
          toast.success("📍 Live location detected successfully!");
        } else {
          throw new Error("Failed to get address from coordinates");
        }
      } catch (geocodeError) {
        // Fallback: just use coordinates without detailed address
        const locationData = {
          address: `Location: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
          latitude,
          longitude,
        };
        
        setAddress(locationData.address);
        setIsLocationDetected(true);
        onLocationSelect(locationData);
        toast.success("📍 Location coordinates detected!");
      }
    } catch (error: any) {
      console.error("Error getting location:", error);
      
      let errorMessage = "Failed to get your location. Please enter manually.";
      
      if (error.code) {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location access denied. Please enable location permission and try again.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information is unavailable. Please enter address manually.";
            break;
          case error.TIMEOUT:
            errorMessage = "Location request timed out. Please try again or enter manually.";
            break;
        }
      }
      
      toast.error(errorMessage);
    } finally {
      setIsLoadingLocation(false);
    }
  }, [onLocationSelect]);

  const verifyAddress = async () => {
    if (!address.trim()) {
      toast.error("Please enter an address first");
      return;
    }

    setIsVerifying(true);
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
      );
      const data = await response.json();

      if (data.status === 'OK' && data.results.length > 0) {
        const result = data.results[0];
        const location = result.geometry.location;
        
        const locationData = {
          address: result.formatted_address,
          latitude: location.lat,
          longitude: location.lng,
        };
        
        setAddress(result.formatted_address);
        setIsLocationDetected(true);
        onLocationSelect(locationData);
        toast.success("✅ Address verified successfully!");
      } else {
        toast.error("Could not verify this address. Please check and try again.");
      }
    } catch (error) {
      console.error("Error verifying address:", error);
      toast.error("Failed to verify address. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleAddressChange = async (value: string) => {
    setAddress(value);
    setIsLocationDetected(false);
    
    if (value.length > 2) {
      try {
        // For demo purposes, we'll create mock suggestions
        // In production, use Google Places API
        const mockSuggestions = [
          {
            description: value + ", Bengaluru, Karnataka, India",
            structured_formatting: {
              main_text: value,
              secondary_text: "Bengaluru, Karnataka, India"
            }
          }
        ];
        setSuggestions(mockSuggestions);
        setShowSuggestions(true);
      } catch (error) {
        console.error("Error fetching suggestions:", error);
      }
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSuggestionSelect = async (suggestion: any) => {
    setAddress(suggestion.description);
    setShowSuggestions(false);
    
    // Auto-verify the selected suggestion
    setTimeout(() => {
      verifyAddress();
    }, 100);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="address">
        {label} {required && "*"}
      </Label>
      
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={getCurrentLocation}
          disabled={isLoadingLocation}
          className="shrink-0 px-3"
          title="Use your current location"
        >
          {isLoadingLocation ? (
            <Loader className="w-4 h-4 animate-spin" />
          ) : (
            <Navigation className="w-4 h-4" />
          )}
        </Button>
        
        <div className="flex-1 relative">
          <Input
            id="address"
            value={address}
            onChange={(e) => handleAddressChange(e.target.value)}
            placeholder={placeholder}
            className={`pr-4 ${isLocationDetected ? 'border-green-500 bg-green-50' : ''}`}
          />
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
              {suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                  onClick={() => handleSuggestionSelect(suggestion)}
                >
                  <div className="font-medium">{suggestion.structured_formatting?.main_text}</div>
                  <div className="text-sm text-gray-500">
                    {suggestion.structured_formatting?.secondary_text}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <Button
          type="button"
          variant="outline"
          onClick={verifyAddress}
          disabled={isVerifying || !address.trim()}
          className="shrink-0"
        >
          {isVerifying ? (
            <Loader className="w-4 h-4 animate-spin mr-2" />
          ) : (
            <MapPin className="w-4 h-4 mr-2" />
          )}
          {isVerifying ? "Verifying..." : "Verify"}
        </Button>
      </div>
      
      {isLocationDetected && (
        <p className="text-sm text-green-600 mt-1">
          ✓ Location verified and coordinates saved
        </p>
      )}
    </div>
  );
}
