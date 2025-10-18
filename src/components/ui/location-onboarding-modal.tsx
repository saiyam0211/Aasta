'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Lottie from 'lottie-react';
import locationAnim from '../../../public/lotties/location.json';
import { useLocationStore } from '@/hooks/useLocation';
import { useSearchParams } from 'next/navigation';
import { ChevronDown } from 'lucide-react';

interface Location {
  id: string;
  name: string;
  city: string;
  state: string;
  country: string;
}

interface LocationOnboardingModalProps {
  isModal?: boolean;
  onClose?: () => void;
}

export function LocationOnboardingModal({ isModal = false, onClose }: LocationOnboardingModalProps) {
  const router = useRouter();
  const { latitude, longitude, setLocation } = useLocationStore();
  const [isRequesting, setIsRequesting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const searchParams = useSearchParams();
  const isReselect = searchParams.get('reselect') === 'true';

  // Default Bangalore coordinates for now
  const defaultLat = 12.9716;
  const defaultLng = 77.5946;

  // Fetch locations from API
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await fetch('/api/locations');
        if (response.ok) {
          const data = await response.json();
          setLocations(data.locations || []);
        }
      } catch (error) {
        console.error('Error fetching locations:', error);
        setError('Failed to load locations');
      }
    };
    fetchLocations();
  }, []);

  // Navigate to home if location is set and not in modal mode
  useEffect(() => {
    if (latitude && longitude && !isReselect && !isModal) {
      router.replace('/');
    }
  }, [latitude, longitude, isReselect, isModal, router]);

  const selectLocation = (location: Location) => {
    setIsRequesting(true);
    setError(null);
    
    // For now, use default Bangalore coordinates
    // TODO: Store actual coordinates in the Location model
    setLocation(defaultLat, defaultLng, `${location.name}, ${location.city}`);
    
    if (isModal && onClose) {
      onClose();
    } else {
      router.replace('/');
    }
  };

  const handleBackClick = () => {
    if (isModal && onClose) {
      onClose();
    } else {
      router.back();
    }
  };

  return (
    <div className="min-h-screen bg-[#d3fb6b]">
      <div className="flex min-h-screen flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6">
          <button
            onClick={handleBackClick}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm"
          >
            <svg
              className="h-5 w-5 text-black"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <div className="text-center">
            <h1 className="text-xl font-bold text-black">Select Location</h1>
          </div>
          <div className="w-10" /> {/* Spacer for centering */}
        </div>

        {/* Content */}
        <div className="flex-1 px-6 pb-6">
          {/* Animation */}
          <div className="mb-8 flex justify-center">
            <Lottie
              animationData={locationAnim}
              loop={true}
              autoplay
              style={{ width: 200, height: 200 }}
            />
          </div>

          {/* Title and Description */}
          <div className="mb-8 text-center">
            <h2 className="mb-4 text-2xl font-bold text-black">
              Choose Your Location
            </h2>
            <p className="text-gray-700">
              Select your location to see restaurants and food available in your area.
            </p>
          </div>

          {/* Location Dropdown */}
          <div className="mb-8">
            <label className="mb-3 block text-sm font-medium text-gray-700">
              Select Location
            </label>
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full rounded-2xl border-2 border-gray-300 bg-white px-4 py-4 text-left text-black focus:border-[#002a01] focus:outline-none"
              >
                <div className="flex items-center justify-between">
                  <span className={selectedLocation ? 'text-black' : 'text-gray-500'}>
                    {selectedLocation 
                      ? `${selectedLocation.name}, ${selectedLocation.city}` 
                      : 'Choose a location'
                    }
                  </span>
                  <ChevronDown 
                    className={`h-5 w-5 text-gray-400 transition-transform ${
                      isDropdownOpen ? 'rotate-180' : ''
                    }`} 
                  />
                </div>
              </button>
              
              {isDropdownOpen && (
                <div className="absolute z-10 mt-2 w-full rounded-2xl border border-gray-200 bg-white shadow-lg">
                  {locations.length > 0 ? (
                    locations.map((location) => (
                      <button
                        key={location.id}
                        onClick={() => {
                          setSelectedLocation(location);
                          setIsDropdownOpen(false);
                        }}
                        className="w-full px-4 py-3 text-left text-black hover:bg-gray-50 first:rounded-t-2xl last:rounded-b-2xl"
                      >
                        <div className="font-medium">{location.name}</div>
                        <div className="text-sm text-gray-600">{location.city}, {location.state}</div>
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-3 text-gray-500">
                      {error || 'Loading locations...'}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 rounded-lg bg-red-100 p-3 text-red-700">
              {error}
            </div>
          )}

          {/* Continue Button */}
          <button
            onClick={() => selectedLocation && selectLocation(selectedLocation)}
            disabled={!selectedLocation || isRequesting}
            className="w-full rounded-3xl bg-[#dcf874] py-7 text-xl font-semibold text-black shadow-md active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isRequesting ? 'Setting Location...' : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  );
}
