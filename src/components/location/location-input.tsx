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
  const [error, setError] = useState<string | null>(null);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { currentLocation, requestLocation, setLocation } = useLocationStore();

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle current location detection
  const handleCurrentLocation = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      await requestLocation();
      
      // Need to get the updated location from the store after requestLocation
      const { currentLocation: updatedLocation, error: locationError } = useLocationStore.getState();
      
      if (locationError) {
        setError(locationError);
        return;
      }
      
      if (updatedLocation) {
        // Reverse geocode current location to get address
        const locationWithAddress = await locationService.reverseGeocode(
          updatedLocation.latitude,
          updatedLocation.longitude
        );
        
        if (locationWithAddress) {
          setSelectedLocation(locationWithAddress);
          setQuery(locationWithAddress.address);
          setLocation({ latitude: locationWithAddress.latitude, longitude: locationWithAddress.longitude });
          onLocationSelect?.(locationWithAddress);
        } else {
          setError('Unable to get address for your location. Please try typing your address.');
        }
      } else {
        setError('Unable to detect your location. Please ensure location permission is granted.');
      }
    } catch (error) {
      console.error('Error getting current location:', error);
      setError('Failed to get your location. Please try again or enter your address manually.');
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
          setError(null);
          
          // Use Google Places API for real address suggestions
          const suggestions = await locationService.getPlaceSuggestions(query);
          setSuggestions(suggestions);
          setShowSuggestions(suggestions.length > 0);
          
          if (suggestions.length === 0) {
            // Only show error if user has typed enough characters and no API key is configured
            if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
              setError('Location search requires Google Maps API configuration.');
            }
          }
        } catch (error) {
          console.error('Error fetching suggestions:', error);
          setSuggestions([]);
          setShowSuggestions(false);
          setError('Unable to search for locations. Please try again.');
        } finally {
          setIsLoading(false);
        }
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
        setError(null);
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
    setError(null);
    inputRef.current?.focus();
  };

  return (
    <div className={`relative ${className}`}>
      <div className="flex space-x-2">
        {/* Address Input */}
        <div className="flex-1 relative" ref={dropdownRef}>
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
            <div 
              className="absolute top-full left-0 right-0 mt-1 z-50 bg-white rounded-lg shadow-lg border-2"
              style={{ 
                borderColor: 'var(--primary-dark-green)',
                maxHeight: '240px',
                overflowY: 'auto',
                WebkitOverflowScrolling: 'touch' // For smooth scrolling on mobile
              }}
            >
              {suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0 transition-colors duration-150"
                  style={{ 
                    borderColor: 'var(--primary-dark-green)',
                    borderBottomWidth: index === suggestions.length - 1 ? '0' : '1px'
                  }}
                >
                  <div className="flex items-start space-x-3">
                    <MapPin className="w-4 h-4 mt-1 flex-shrink-0" style={{ color: 'var(--primary-dark-green)' }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: 'var(--primary-dark-green)' }}>
                        {suggestion.address}
                      </p>
                      {suggestion.city && (
                        <p className="text-xs text-gray-500 truncate">
                          {suggestion.city}, {suggestion.state}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
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

      {/* Error Message */}
      {error && (
        <div className="mt-2 p-2 rounded-lg bg-red-50 border border-red-200">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

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