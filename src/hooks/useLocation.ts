'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface LocationState {
  latitude: number | null;
  longitude: number | null;
  locationName: string | null;
  locationId: string | null;
  error: string | null;
  setLocation: (lat: number, lng: number, name?: string, locationId?: string) => void;
  setError: (error: string) => void;
  clearLocation: () => void;
}

export const useLocationStore = create<LocationState>()(
  persist(
    (set) => ({
      latitude: null,
      longitude: null,
      locationName: null,
      locationId: null,
      error: null,
      setLocation: (lat, lng, name, locationId) => {
        console.log('📍 User location updated:', {
          latitude: lat,
          longitude: lng,
          locationName: name,
          locationId: locationId,
        });
        set({ 
          latitude: lat, 
          longitude: lng, 
          locationName: name || null, 
          locationId: locationId || null,
          error: null 
        });
      },
      setError: (error) => {
        console.error('❌ Location error:', error);
        set({ error });
      },
      clearLocation: () => {
        console.log('🧹 Location cleared');
        set({ latitude: null, longitude: null, locationName: null, locationId: null, error: null });
      },
    }),
    {
      name: 'aasta-user-location',
    }
  )
);
