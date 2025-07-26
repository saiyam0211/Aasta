"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Navigation, Loader2, X } from "lucide-react";
import { locationService } from "@/lib/location-service";
import { useLocationStore } from "@/lib/store";
import type { LocationWithAddress } from "@/lib/location-service";

interface LocationInputProps {
  onLocationSelect?: (location: LocationWithAddress) => void;
  placeholder?: string;
  className?: string;
}

export default function LocationInput({ 
  onLocationSelect, 
  placeholder = "Enter your delivery address",
  className = ""
}: LocationInputProps) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<LocationWithAddress[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<LocationWithAddress | null>(null);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const { currentLocation, requestLocation, setLocation } = useLocationStore();

  // Handle current location detection
  const handleCurrentLocation = async () => {
    try {
      setIsLoading(true);
      await requestLocation();
      
      if (currentLocation) {
        // Reverse geocode current location to get address
        const locationWithAddress = await locationService.geocodeAddress(
          `${currentLocation.latitude},${currentLocation.longitude}`
        );
        
        if (locationWithAddress) {
          setSelectedLocation(locationWithAddress);
          setQuery(locationWithAddress.address);
          onLocationSelect?.(locationWithAddress);
        }
      }
    } catch (error) {
      console.error('Error getting current location:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle address search with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (query.length > 2) {
        try {
          setIsLoading(true);
          // Mock address suggestions - in real app, use Google Places API
          const mockSuggestions: LocationWithAddress[] = [
            {
              latitude: 12.9716,
              longitude: 77.5946,
              address: `${query}, Koramangala, Bengaluru, Karnataka 560034`,
              city: 'Bengaluru',
              state: 'Karnataka',
              zipCode: '560034'
            },
            {
              latitude: 12.9279,
              longitude: 77.6271,
              address: `${query}, Whitefield, Bengaluru, Karnataka 560066`,
              city: 'Bengaluru',
              state: 'Karnataka',
              zipCode: '560066'
            },
            {
              latitude: 12.9698,
              longitude: 77.7499,
              address: `${query}, Electronic City, Bengaluru, Karnataka 560100`,
              city: 'Bengaluru',
              state: 'Karnataka',
              zipCode: '560100'
            },
            {
              latitude: 13.0358,
              longitude: 77.5970,
              address: `${query}, Hebbal, Bengaluru, Karnataka 560024`,
              city: 'Bengaluru',
              state: 'Karnataka',
              zipCode: '560024'
            },
            {
              latitude: 12.9352,
              longitude: 77.6245,
              address: `${query}, Indiranagar, Bengaluru, Karnataka 560038`,
              city: 'Bengaluru',
              state: 'Karnataka',
              zipCode: '560038'
            }
          ];
          setSuggestions(mockSuggestions);
          setShowSuggestions(true);
        } catch (error) {
          console.error('Error fetching suggestions:', error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query]);

  const handleSuggestionClick = (suggestion: LocationWithAddress) => {
    setSelectedLocation(suggestion);
    setQuery(suggestion.address);
    setShowSuggestions(false);
    setLocation({ latitude: suggestion.latitude, longitude: suggestion.longitude });
    onLocationSelect?.(suggestion);
  };

  const clearSelection = () => {
    setSelectedLocation(null);
    setQuery("");
    setSuggestions([]);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  return (
    <div className={`relative ${className}`}>
      <div className="flex space-x-2">
        {/* Address Input */}
        <div className="flex-1 relative">
          <div className="relative">
            <MapPin 
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" 
              style={{ color: 'var(--primary-dark-green)' }}
            />
            <Input
              ref={inputRef}
              type="text"
              placeholder={placeholder}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
              className="pl-10 pr-10 h-12 border-2 rounded-xl selectable"
              style={{ 
                borderColor: 'var(--primary-dark-green)',
                backgroundColor: 'var(--off-white)'
              }}
            />
            {selectedLocation && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearSelection}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 touchable"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
            {isLoading && (
              <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 animate-spin" />
            )}
          </div>

          {/* Suggestions Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <Card className="absolute top-full left-0 right-0 mt-1 z-50 max-h-60 overflow-y-auto restaurant-card">
              <CardContent className="p-0">
                {suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0 touchable"
                    style={{ borderColor: 'var(--primary-dark-green)' }}
                  >
                    <div className="flex items-start space-x-3">
                      <MapPin className="w-4 h-4 mt-1 flex-shrink-0" style={{ color: 'var(--primary-dark-green)' }} />
                      <div className="flex-1">
                        <p className="text-sm font-medium selectable" style={{ color: 'var(--primary-dark-green)' }}>
                          {suggestion.address}
                        </p>
                        {suggestion.city && (
                          <p className="text-xs text-gray-500 selectable">
                            {suggestion.city}, {suggestion.state}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Current Location Button */}
        <Button
          onClick={handleCurrentLocation}
          disabled={isLoading}
          className="h-12 px-4 rounded-xl touchable"
          style={{
            backgroundColor: 'var(--accent-leaf-green)',
            color: 'var(--primary-dark-green)',
            border: '2px solid var(--primary-dark-green)'
          }}
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Navigation className="w-5 h-5" />
          )}
        </Button>
      </div>

      {/* Selected Location Display */}
      {selectedLocation && (
        <div className="mt-3 p-3 rounded-xl" style={{ backgroundColor: 'var(--accent-leaf-green)' }}>
          <div className="flex items-start space-x-3">
            <MapPin className="w-5 h-5 mt-0.5" style={{ color: 'var(--primary-dark-green)' }} />
            <div className="flex-1">
              <p className="text-sm font-medium selectable" style={{ color: 'var(--primary-dark-green)' }}>
                Delivering to:
              </p>
              <p className="text-sm selectable" style={{ color: 'var(--primary-dark-green)' }}>
                {selectedLocation.address}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 