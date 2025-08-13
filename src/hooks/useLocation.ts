'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface LocationState {
  latitude: number | null;
  longitude: number | null;
  error: string | null;
  setLocation: (lat: number, lng: number) => void;
  setError: (error: string) => void;
  clearLocation: () => void;
}

export const useLocationStore = create<LocationState>()(
  persist(
    (set) => ({
      latitude: null,
      longitude: null,
      error: null,
      setLocation: (lat, lng) => {
        console.log('📍 User location updated:', {
          latitude: lat,
          longitude: lng,
        });
        set({ latitude: lat, longitude: lng, error: null });
      },
      setError: (error) => {
        console.error('❌ Location error:', error);
        set({ error });
      },
      clearLocation: () => {
        console.log('🧹 Location cleared');
        set({ latitude: null, longitude: null, error: null });
      },
    }),
    {
      name: 'aasta-user-location',
    }
  )
);
