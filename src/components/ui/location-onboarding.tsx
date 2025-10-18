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

interface LocationOnboardingProps {
  isModal?: boolean;
  onClose?: () => void;
}

export function LocationOnboarding({ isModal = false, onClose }: LocationOnboardingProps) {
  const router = useRouter();
  const { latitude, longitude, setLocation } = useLocationStore();
  const [isRequesting, setIsRequesting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoadingLocations, setIsLoadingLocations] = useState(false);
  const searchParams = useSearchParams();
  const isReselect = searchParams.get('reselect') === '1';

  useEffect(() => {
    if (latitude && longitude && !isReselect && !isModal) {
      router.replace('/');
    }
  }, [latitude, longitude, router, isReselect, isModal]);

  // Fetch locations on component mount
  useEffect(() => {
    const fetchLocations = async () => {
      setIsLoadingLocations(true);
      try {
        const response = await fetch('/api/locations');
        const data = await response.json();
        if (data.success && Array.isArray(data.locations)) {
          setLocations(data.locations);
        } else {
          setError('Failed to load locations');
        }
      } catch (error) {
        console.error('Error fetching locations:', error);
        setError('Failed to load locations');
      } finally {
        setIsLoadingLocations(false);
      }
    };
    fetchLocations();
  }, []);

  const selectLocation = (location: Location) => {
    setIsRequesting(true);
    setError(null);
    
    // For now, use default Bangalore coordinates
    // TODO: Store actual coordinates in the Location model
    const defaultLat = 12.9716;
    const defaultLng = 77.5946;
    setLocation(defaultLat, defaultLng, `${location.name}, ${location.city}`, location.id);
    
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
    <div className="fixed inset-0 z-50 flex min-h-screen w-full items-center justify-center bg-black/50 backdrop-blur-md">
      <div className="w-full max-w-md px-6">
        <div className="rounded-3xl bg-[#002a01] p-6 shadow-2xl">
          <div className="inline-block rounded-2xl border border-[#002a01] bg-[#002a01]/30 bg-white/60 px-4 py-2 text-sm font-semibold text-[#002a01] backdrop-blur-sm">
            Location
          </div>
          <div className="mt-2">
            <Lottie
              animationData={locationAnim as any}
              loop
              autoplay
              style={{ width: '100%', height: 300 }}
            />
          </div>
          <h1 className="text-4xl font-extrabold text-[#fff]">
            Where should we deliver the hacks?
          </h1>
          <p className="mt-4 text-lg text-[#fff]/80">
            Select your location to see nearby restaurants and get quick deliveries.
          </p>
          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
          <div className="mt-6 space-y-3">
            {/* Location Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                disabled={isLoadingLocations}
                className="w-full rounded-3xl bg-white/20 border border-white/30 px-6 py-4 text-left text-lg font-medium text-white backdrop-blur-sm hover:bg-white/30 transition-colors disabled:opacity-50"
              >
                <div className="flex items-center justify-between">
                  <span>
                    {selectedLocation 
                      ? `${selectedLocation.name}, ${selectedLocation.city}`
                      : isLoadingLocations 
                        ? 'Loading locations...'
                        : 'Select your location'
                    }
                  </span>
                  <ChevronDown className={`h-5 w-5 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </div>
              </button>
              
              {isDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 max-h-60 overflow-y-auto rounded-2xl bg-white/95 backdrop-blur-sm border border-white/30 shadow-xl z-10">
                  {locations.map((location) => (
                    <button
                      key={location.id}
                      onClick={() => {
                        setSelectedLocation(location);
                        setIsDropdownOpen(false);
                      }}
                      className="w-full px-6 py-4 text-left hover:bg-white/50 transition-colors border-b border-gray-200/50 last:border-b-0"
                    >
                      <div className="font-medium text-gray-900">
                        {location.name}
                      </div>
                      <div className="text-sm text-gray-600">
                        {location.city}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            
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
    </div>
  );
}
