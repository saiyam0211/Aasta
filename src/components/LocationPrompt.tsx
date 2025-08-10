"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { MapPin, X } from 'lucide-react';

interface LocationPromptProps {
  onLocationShared: (location: { lat: number; lng: number }) => void;
  onDismiss: () => void;
}

export const LocationPrompt = ({ onLocationShared, onDismiss }: LocationPromptProps) => {
  const [isSharing, setIsSharing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleShareLocation = () => {
    setIsSharing(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsSharing(false);
        onLocationShared({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => {
        setIsSharing(false);
        setError("Couldn't get your location. Please try again or check your browser settings.");
        console.error("Geolocation error:", error);
      }
    );
  };

  return (
    <Card className="fixed top-4 left-4 right-4 z-50 bg-[#002a01] border-[#d1f86a] shadow-lg animate-in slide-in-from-top-2 duration-300 lg:left-auto lg:right-4 lg:w-96">
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <MapPin className="w-5 h-5 text-[#d1f86a]" />
            <h3 className="font-semibold text-[#d1f86a]">Share Your Location</h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDismiss}
            className="text-[#fcfefe]/80 hover:text-[#d1f86a] h-6 w-6 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
        
        <p className="text-[#fcfefe]/90 text-sm mb-4">
          Share your location to see restaurants near you.
        </p>

        {error && (
          <p className="text-red-400 text-sm mb-4">{error}</p>
        )}
        
        <div className="flex space-x-2">
          <Button
            onClick={handleShareLocation}
            disabled={isSharing}
            className="flex-1 bg-[#d1f86a] text-[#002a01] hover:bg-[#d1f86a]/90 font-semibold"
          >
            {isSharing ? (
              <>
                <div className="w-4 h-4 border-2 border-[#002a01]/30 border-t-[#002a01] rounded-full animate-spin mr-2" />
                Sharing...
              </>
            ) : (
              <>
                <MapPin className="w-4 h-4 mr-2" />
                Share Location
              </>
            )}
          </Button>
          
          <Button
            variant="outline"
            onClick={onDismiss}
            className="border-[#fcfefe]/30 text-[#fcfefe]/80 hover:bg-[#fcfefe]/10"
          >
            Later
          </Button>
        </div>
      </div>
    </Card>
  );
};

