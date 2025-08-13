'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { MapPin, X } from 'lucide-react';

interface LocationPromptProps {
  onLocationShared: (location: { lat: number; lng: number }) => void;
  onDismiss: () => void;
}

export const LocationPrompt = ({
  onLocationShared,
  onDismiss,
}: LocationPromptProps) => {
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
        setError(
          "Couldn't get your location. Please try again or check your browser settings."
        );
        console.error('Geolocation error:', error);
      }
    );
  };

  return (
    <Card className="animate-in slide-in-from-top-2 fixed top-4 right-4 left-4 z-50 border-[#d1f86a] bg-[#002a01] shadow-lg duration-300 lg:right-4 lg:left-auto lg:w-96">
      <div className="p-4">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MapPin className="h-5 w-5 text-[#d1f86a]" />
            <h3 className="font-semibold text-[#d1f86a]">
              Share Your Location
            </h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDismiss}
            className="h-6 w-6 p-0 text-[#fcfefe]/80 hover:text-[#d1f86a]"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <p className="mb-4 text-sm text-[#fcfefe]/90">
          Share your location to see restaurants near you.
        </p>

        {error && <p className="mb-4 text-sm text-red-400">{error}</p>}

        <div className="flex space-x-2">
          <Button
            onClick={handleShareLocation}
            disabled={isSharing}
            className="flex-1 bg-[#d1f86a] font-semibold text-[#002a01] hover:bg-[#d1f86a]/90"
          >
            {isSharing ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-[#002a01]/30 border-t-[#002a01]" />
                Sharing...
              </>
            ) : (
              <>
                <MapPin className="mr-2 h-4 w-4" />
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
