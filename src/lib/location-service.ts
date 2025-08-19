// LocationService - Google Maps Integration for Aasta
interface Location {
  latitude: number;
  longitude: number;
}

interface LocationWithAddress extends Location {
  address: string;
  city?: string;
  state?: string;
  zipCode?: string;
}

interface Restaurant {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  address: string;
  phone: string;
  cuisineTypes: string[];
  averagePreparationTime: number;
  minimumOrderAmount: number;
  deliveryRadius: number;
  rating: number;
  status: string;
  operatingHours: any;
}

interface RouteInfo {
  distance: number; // in kilometers
  duration: number; // in minutes
  steps: {
    instruction: string;
    distance: number;
    duration: number;
  }[];
}

class LocationService {
  private apiKey: string;
  private cache: Map<string, any> = new Map();
  private cacheExpiry: number = 5 * 60 * 1000; // 5 minutes

  constructor() {
    this.apiKey = process.env.GOOGLE_MAPS_API_KEY || '';
  }

  // Find nearby restaurants within delivery radius
  async findNearbyRestaurants(
    userLocation: Location,
    radius: number = 5, // km
    filters?: {
      cuisineTypes?: string[];
      priceRange?: { min: number; max: number };
      rating?: number;
      deliveryTime?: number;
    }
  ): Promise<Restaurant[]> {
    try {
      const cacheKey = `restaurants_${userLocation.latitude}_${userLocation.longitude}_${radius}`;

      // Check cache first
      const cached = this.getFromCache(cacheKey);
      if (cached) return cached;

      // Fetch restaurants from database
      const { prisma } = await import('./prisma');
      const dbRestaurants = await prisma.restaurant.findMany({
        where: {
          status: 'ACTIVE',
        },
        include: {
          menuItems: {
            select: {
              id: true,
              name: true,
              price: true,
              available: true,
            },
            where: {
              available: true,
            },
            take: 5,
          },
        },
      });

      // Transform to expected format and calculate distances
      const restaurants: Restaurant[] = dbRestaurants.map((restaurant) => ({
        id: restaurant.id,
        name: restaurant.name,
        latitude: restaurant.latitude,
        longitude: restaurant.longitude,
        address: restaurant.address,
        phone: restaurant.phone,
        cuisineTypes: restaurant.cuisineTypes,
        averagePreparationTime: restaurant.averagePreparationTime,
        minimumOrderAmount: restaurant.minimumOrderAmount,
        deliveryRadius: restaurant.deliveryRadius,
        rating: restaurant.rating,
        status: restaurant.status,
        operatingHours: restaurant.operatingHours,
      }));

      // Fallback mock data if no restaurants in database
      const mockRestaurants: Restaurant[] =
        restaurants.length > 0
          ? restaurants
          : [
              {
                id: '1',
                name: 'Midnight Bites',
                latitude: userLocation.latitude + 0.01,
                longitude: userLocation.longitude + 0.01,
                address: '123 Food Street, Koramangala, Bengaluru',
                phone: '+91-9876543210',
                cuisineTypes: ['North Indian', 'Mughlai'],
                averagePreparationTime: 25,
                minimumOrderAmount: 200,
                deliveryRadius: 5,
                rating: 4.5,
                status: 'ACTIVE',
                operatingHours: {
                  monday: { open: '21:00', close: '00:00', isOpen: true },
                  tuesday: { open: '21:00', close: '00:00', isOpen: true },
                  // ... other days
                },
              },
              {
                id: '2',
                name: 'Night Owl Pizza',
                latitude: userLocation.latitude + 0.02,
                longitude: userLocation.longitude - 0.01,
                address: '456 Pizza Lane, Whitefield, Bengaluru',
                phone: '+91-9876543211',
                cuisineTypes: ['Italian', 'Fast Food'],
                averagePreparationTime: 30,
                minimumOrderAmount: 150,
                deliveryRadius: 4,
                rating: 4.3,
                status: 'ACTIVE',
                operatingHours: {
                  monday: { open: '21:00', close: '00:00', isOpen: true },
                  tuesday: { open: '21:00', close: '00:00', isOpen: true },
                  // ... other days
                },
              },
              {
                id: '3',
                name: 'Late Night Curry House',
                latitude: userLocation.latitude - 0.01,
                longitude: userLocation.longitude + 0.02,
                address: '789 Spice Street, Indiranagar, Bengaluru',
                phone: '+91-9876543212',
                cuisineTypes: ['South Indian', 'Continental'],
                averagePreparationTime: 20,
                minimumOrderAmount: 180,
                deliveryRadius: 6,
                rating: 4.7,
                status: 'ACTIVE',
                operatingHours: {
                  monday: { open: '21:00', close: '00:00', isOpen: true },
                  tuesday: { open: '21:00', close: '00:00', isOpen: true },
                  // ... other days
                },
              },
            ];

      // Filter restaurants based on criteria
      let filteredRestaurants = mockRestaurants.filter((restaurant) => {
        const distance = this.calculateDistance(userLocation, {
          latitude: restaurant.latitude,
          longitude: restaurant.longitude,
        });

        return distance <= radius && this.isRestaurantOperational(restaurant);
      });

      // Apply additional filters
      if (filters) {
        if (filters.cuisineTypes && filters.cuisineTypes.length > 0) {
          filteredRestaurants = filteredRestaurants.filter((restaurant) =>
            restaurant.cuisineTypes.some((cuisine) =>
              filters.cuisineTypes!.includes(cuisine)
            )
          );
        }

        if (filters.rating) {
          filteredRestaurants = filteredRestaurants.filter(
            (restaurant) => restaurant.rating >= filters.rating!
          );
        }
      }

      // Sort by distance
      filteredRestaurants.sort((a, b) => {
        const distanceA = this.calculateDistance(userLocation, {
          latitude: a.latitude,
          longitude: a.longitude,
        });
        const distanceB = this.calculateDistance(userLocation, {
          latitude: b.latitude,
          longitude: b.longitude,
        });
        return distanceA - distanceB;
      });

      // Cache the results
      this.setCache(cacheKey, filteredRestaurants);

      return filteredRestaurants;
    } catch (error) {
      console.error('Error finding nearby restaurants:', error);
      throw new Error('Failed to find nearby restaurants');
    }
  }

  // Calculate distance between two points using Haversine formula
  calculateDistance(point1: Location, point2: Location): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.deg2rad(point2.latitude - point1.latitude);
    const dLon = this.deg2rad(point2.longitude - point1.longitude);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(point1.latitude)) *
        Math.cos(this.deg2rad(point2.latitude)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return Math.round(distance * 100) / 100; // Round to 2 decimal places
  }

  // Get estimated delivery time with traffic
  async getETA(
    restaurantLocation: Location,
    deliveryLocation: Location,
    preparationTime: number = 20
  ): Promise<number> {
    try {
      const cacheKey = `eta_${restaurantLocation.latitude}_${restaurantLocation.longitude}_${deliveryLocation.latitude}_${deliveryLocation.longitude}`;

      const cached = this.getFromCache(cacheKey);
      if (cached) return cached + preparationTime;

      // For now, use simple calculation - will be replaced with Google Directions API
      const distance = this.calculateDistance(
        restaurantLocation,
        deliveryLocation
      );
      const averageSpeed = 25; // km/h average speed in city
      const travelTime = (distance / averageSpeed) * 60; // Convert to minutes

      // Add traffic buffer (20% extra time during night hours)
      const trafficBuffer = travelTime * 0.2;
      const totalTravelTime = Math.round(travelTime + trafficBuffer);

      this.setCache(cacheKey, totalTravelTime);

      return totalTravelTime + preparationTime;
    } catch (error) {
      console.error('Error calculating ETA:', error);
      // Return fallback estimate
      return preparationTime + 30;
    }
  }

  // Geocode address to coordinates
  async geocodeAddress(address: string): Promise<LocationWithAddress | null> {
    try {
      // Use Google Maps service for actual geocoding
      const { googleMapsService } = await import('./google-maps');
      return await googleMapsService.geocodeAddress(address);
    } catch (error) {
      console.error('Error geocoding address:', error);
      return null;
    }
  }

  // Reverse geocode coordinates to address
  async reverseGeocode(
    lat: number,
    lng: number
  ): Promise<LocationWithAddress | null> {
    try {
      const { googleMapsService } = await import('./google-maps');
      return await googleMapsService.reverseGeocode(lat, lng);
    } catch (error) {
      console.error('Error reverse geocoding:', error);
      return null;
    }
  }

  // Get place suggestions for autocomplete
  async getPlaceSuggestions(input: string): Promise<LocationWithAddress[]> {
    try {
      if (input.length < 3) return [];

      // 1) Try Ola Maps via server proxy to avoid CORS
      const ola = await this.fetchOlaSuggestions(input);
      if (ola.length > 0) return ola;

      // 2) Fallback: Google Places
      const { googleMapsService } = await import('./google-maps');
      return await googleMapsService.getPlacePredictions(input);
    } catch (error) {
      console.error('Error getting place suggestions:', error);
      return [];
    }
  }

  private async fetchOlaSuggestions(
    input: string
  ): Promise<LocationWithAddress[]> {
    try {
      const params = new URLSearchParams({ input, country: 'IN' });
      const res = await fetch(
        `/api/locations/autocomplete?${params.toString()}`,
        {
          method: 'GET',
          cache: 'no-store',
          headers: { Accept: 'application/json' },
        }
      );
      if (!res.ok) return [];
      const data = await res.json();
      if (!data?.success || !Array.isArray(data?.data)) return [];

      const suggestions = data.data as Array<{
        description: string;
        latitude: number | null;
        longitude: number | null;
      }>;

      // Take top 5, geocode if coordinates missing
      const top = suggestions.slice(0, 5);
      const results: LocationWithAddress[] = [];
      for (const s of top) {
        if (typeof s.latitude === 'number' && typeof s.longitude === 'number') {
          results.push({
            address: s.description,
            latitude: s.latitude,
            longitude: s.longitude,
          });
          continue;
        }
        // Geocode description to get coordinates
        const geocoded = await this.geocodeAddress(s.description);
        if (geocoded) results.push(geocoded);
      }
      return results;
    } catch {
      return [];
    }
  }

  // Get traffic-adjusted delivery time
  async getTrafficAdjustedTime(
    origin: Location,
    destination: Location,
    departureTime?: Date
  ): Promise<RouteInfo> {
    try {
      if (!this.apiKey) {
        throw new Error('Google Maps API key not configured');
      }

      const cacheKey = `route_${origin.latitude}_${origin.longitude}_${destination.latitude}_${destination.longitude}`;
      const cached = this.getFromCache(cacheKey);
      if (cached) return cached;

      // For now, return mock route info - will be replaced with Google Directions API
      const distance = this.calculateDistance(origin, destination);
      const duration = Math.round((distance / 25) * 60); // 25 km/h average speed

      const routeInfo: RouteInfo = {
        distance: distance,
        duration: duration,
        steps: [
          {
            instruction: `Head towards destination (${distance.toFixed(1)} km)`,
            distance: distance,
            duration: duration,
          },
        ],
      };

      this.setCache(cacheKey, routeInfo);
      return routeInfo;
    } catch (error) {
      console.error('Error getting traffic-adjusted time:', error);
      // Return fallback route info
      const distance = this.calculateDistance(origin, destination);
      return {
        distance: distance,
        duration: Math.round((distance / 20) * 60), // Conservative estimate
        steps: [],
      };
    }
  }

  // Check if restaurant is currently operational
  private isRestaurantOperational(restaurant: Restaurant): boolean {
    const now = new Date();
    const currentHour = now.getHours();

    // Night delivery operates from 9 PM to 12 AM (21:00 to 00:00)
    return currentHour >= 21 || currentHour < 1;
  }

  // Utility functions
  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  private getFromCache(key: string): any {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      return cached.data;
    }
    return null;
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  // Clear expired cache entries
  clearExpiredCache(): void {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp >= this.cacheExpiry) {
        this.cache.delete(key);
      }
    }
  }
}

// Export singleton instance
export const locationService = new LocationService();

// Export types
export type { Location, LocationWithAddress, Restaurant, RouteInfo };
