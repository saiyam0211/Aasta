import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CachedData<T> {
  data: T;
  timestamp: number;
  location: { latitude: number; longitude: number };
}

interface CacheState {
  // Restaurant cache
  restaurants: CachedData<any[]> | null;
  dishes: CachedData<any[]> | null;

  // Cache actions
  setRestaurants: (
    data: any[],
    location: { latitude: number; longitude: number }
  ) => void;
  setDishes: (
    data: any[],
    location: { latitude: number; longitude: number }
  ) => void;
  clearCache: () => void;
  invalidateCache: (newLocation: {
    latitude: number;
    longitude: number;
  }) => void;

  // Cache utilities
  isCacheValid: (
    location: { latitude: number; longitude: number },
    maxAgeMinutes?: number
  ) => boolean;
  getCachedRestaurants: (location: {
    latitude: number;
    longitude: number;
  }) => any[] | null;
  getCachedDishes: (location: {
    latitude: number;
    longitude: number;
  }) => any[] | null;
}

const CACHE_DURATION_MINUTES = 5; // Cache for 5 minutes

export const useCacheStore = create<CacheState>()(
  persist(
    (set, get) => ({
      restaurants: null,
      dishes: null,

      setRestaurants: (data, location) => {
        set({
          restaurants: {
            data,
            timestamp: Date.now(),
            location,
          },
        });
      },

      setDishes: (data, location) => {
        set({
          dishes: {
            data,
            timestamp: Date.now(),
            location,
          },
        });
      },

      clearCache: () => {
        set({
          restaurants: null,
          dishes: null,
        });
      },

      // Invalidate cache when location changes significantly
      invalidateCache: (newLocation: {
        latitude: number;
        longitude: number;
      }) => {
        const { restaurants, dishes } = get();

        const isLocationChanged = (cachedLocation: {
          latitude: number;
          longitude: number;
        }) => {
          const latDiff = Math.abs(
            cachedLocation.latitude - newLocation.latitude
          );
          const lngDiff = Math.abs(
            cachedLocation.longitude - newLocation.longitude
          );
          return latDiff > 0.001 || lngDiff > 0.001; // More than 100m
        };

        if (restaurants && isLocationChanged(restaurants.location)) {
          set({ restaurants: null });
        }

        if (dishes && isLocationChanged(dishes.location)) {
          set({ dishes: null });
        }
      },

      isCacheValid: (location, maxAgeMinutes = CACHE_DURATION_MINUTES) => {
        const { restaurants, dishes } = get();

        // Check if location is close enough (within 100m)
        const isLocationClose = (cachedLocation: {
          latitude: number;
          longitude: number;
        }) => {
          const latDiff = Math.abs(cachedLocation.latitude - location.latitude);
          const lngDiff = Math.abs(
            cachedLocation.longitude - location.longitude
          );
          return latDiff < 0.001 && lngDiff < 0.001; // ~100m tolerance
        };

        const now = Date.now();
        const maxAge = maxAgeMinutes * 60 * 1000;

        const restaurantsValid =
          restaurants &&
          now - restaurants.timestamp < maxAge &&
          isLocationClose(restaurants.location);

        const dishesValid =
          dishes &&
          now - dishes.timestamp < maxAge &&
          isLocationClose(dishes.location);

        return Boolean(restaurantsValid && dishesValid);
      },

      getCachedRestaurants: (location) => {
        const { restaurants } = get();
        if (!restaurants) return null;

        // Check if location is close enough
        const latDiff = Math.abs(
          restaurants.location.latitude - location.latitude
        );
        const lngDiff = Math.abs(
          restaurants.location.longitude - location.longitude
        );
        if (latDiff > 0.001 || lngDiff > 0.001) return null;

        return restaurants.data;
      },

      getCachedDishes: (location) => {
        const { dishes } = get();
        if (!dishes) return null;

        // Check if location is close enough
        const latDiff = Math.abs(dishes.location.latitude - location.latitude);
        const lngDiff = Math.abs(
          dishes.location.longitude - location.longitude
        );
        if (latDiff > 0.001 || lngDiff > 0.001) return null;

        return dishes.data;
      },
    }),
    {
      name: 'aasta-cache',
      partialize: (state) => ({
        restaurants: state.restaurants,
        dishes: state.dishes,
      }),
    }
  )
);
