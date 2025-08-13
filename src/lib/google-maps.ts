import { Loader } from '@googlemaps/js-api-loader';
import type { LocationWithAddress } from './location-service';

interface DistanceMatrixResponse {
  destination_addresses: string[];
  origin_addresses: string[];
  rows: {
    elements: {
      distance: {
        text: string;
        value: number; // in meters
      };
      duration: {
        text: string;
        value: number; // in seconds
      };
      status: string;
    }[];
  }[];
  status: string;
}

export interface DeliveryCalculation {
  distance: number; // in kilometers
  duration: number; // in minutes
  estimatedDeliveryTime?: Date;
}

class GoogleMapsService {
  private loader: Loader;
  private placesService: google.maps.places.PlacesService | null = null;
  private autocompleteService: google.maps.places.AutocompleteService | null =
    null;
  private geocoder: google.maps.Geocoder | null = null;
  private isInitialized = false;

  constructor() {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
      console.warn(
        'Google Maps API key not found. Location features will be limited.'
      );
    }

    this.loader = new Loader({
      apiKey: apiKey || '',
      version: 'weekly',
      libraries: ['places', 'geometry'],
    });
  }

  private checkApiKey(): boolean {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      console.warn(
        'Google Maps API key not configured. Please add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to your environment variables.'
      );
      return false;
    }
    return true;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      await this.loader.load();
      this.autocompleteService = new google.maps.places.AutocompleteService();
      this.geocoder = new google.maps.Geocoder();
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize Google Maps:', error);
      throw error;
    }
  }

  async getPlacePredictions(input: string): Promise<LocationWithAddress[]> {
    if (!this.checkApiKey() || input.length < 3) {
      return [];
    }

    try {
      await this.initialize();

      if (!this.autocompleteService) {
        console.error('Google Maps AutocompleteService not initialized');
        return [];
      }

      return new Promise((resolve) => {
        const timeout = setTimeout(() => {
          console.warn('Google Places API request timed out');
          resolve([]);
        }, 10000); // 10 second timeout

        this.autocompleteService!.getPlacePredictions(
          {
            input,
            // Remove types to get all results (addresses, establishments, etc.) like Google Maps
            componentRestrictions: { country: 'IN' }, // Restrict to India
          },
          async (predictions, status) => {
            clearTimeout(timeout);

            if (
              status === google.maps.places.PlacesServiceStatus.OVER_QUERY_LIMIT
            ) {
              console.error('Google Places API quota exceeded');
              resolve([]);
              return;
            }

            if (
              status === google.maps.places.PlacesServiceStatus.REQUEST_DENIED
            ) {
              console.error(
                'Google Places API request denied. Check your API key and restrictions.'
              );
              resolve([]);
              return;
            }

            if (
              status !== google.maps.places.PlacesServiceStatus.OK ||
              !predictions
            ) {
              console.warn(`Google Places API returned status: ${status}`);
              resolve([]);
              return;
            }

            // Convert predictions to LocationWithAddress format
            const locationPromises = predictions
              .slice(0, 5)
              .map(async (prediction) => {
                try {
                  const location = await this.geocodePlaceId(
                    prediction.place_id!
                  );
                  return location;
                } catch (error) {
                  console.error('Error geocoding place:', error);
                  return null;
                }
              });

            const locations = await Promise.all(locationPromises);
            resolve(
              locations.filter(
                (loc): loc is LocationWithAddress => loc !== null
              )
            );
          }
        );
      });
    } catch (error) {
      console.error('Error getting place predictions:', error);
      return [];
    }
  }

  async geocodePlaceId(placeId: string): Promise<LocationWithAddress | null> {
    await this.initialize();

    if (!this.geocoder) return null;

    return new Promise((resolve) => {
      this.geocoder!.geocode({ placeId }, (results, status) => {
        if (
          status !== google.maps.GeocoderStatus.OK ||
          !results ||
          results.length === 0
        ) {
          resolve(null);
          return;
        }

        const result = results[0];
        const location = result.geometry.location;

        // Extract address components
        const addressComponents = result.address_components;
        let city = '';
        let state = '';
        let zipCode = '';

        addressComponents.forEach((component) => {
          const types = component.types;
          if (
            types.includes('locality') ||
            types.includes('administrative_area_level_2')
          ) {
            city = component.long_name;
          }
          if (types.includes('administrative_area_level_1')) {
            state = component.long_name;
          }
          if (types.includes('postal_code')) {
            zipCode = component.long_name;
          }
        });

        resolve({
          latitude: location.lat(),
          longitude: location.lng(),
          address: result.formatted_address,
          city,
          state,
          zipCode,
        });
      });
    });
  }

  async reverseGeocode(
    lat: number,
    lng: number
  ): Promise<LocationWithAddress | null> {
    if (!this.checkApiKey()) {
      return null;
    }

    try {
      await this.initialize();

      if (!this.geocoder) {
        console.error('Google Maps Geocoder not initialized');
        return null;
      }

      return new Promise((resolve) => {
        const timeout = setTimeout(() => {
          console.warn('Google Geocoding API request timed out');
          resolve(null);
        }, 10000); // 10 second timeout

        this.geocoder!.geocode(
          { location: { lat, lng } },
          (results, status) => {
            clearTimeout(timeout);

            if (status === google.maps.GeocoderStatus.OVER_QUERY_LIMIT) {
              console.error('Google Geocoding API quota exceeded');
              resolve(null);
              return;
            }

            if (status === google.maps.GeocoderStatus.REQUEST_DENIED) {
              console.error(
                'Google Geocoding API request denied. Check your API key and restrictions.'
              );
              resolve(null);
              return;
            }

            if (
              status !== google.maps.GeocoderStatus.OK ||
              !results ||
              results.length === 0
            ) {
              console.warn(`Google Geocoding API returned status: ${status}`);
              resolve(null);
              return;
            }

            const result = results[0];

            // Extract address components
            const addressComponents = result.address_components;
            let city = '';
            let state = '';
            let zipCode = '';

            addressComponents.forEach((component) => {
              const types = component.types;
              if (
                types.includes('locality') ||
                types.includes('administrative_area_level_2')
              ) {
                city = component.long_name;
              }
              if (types.includes('administrative_area_level_1')) {
                state = component.long_name;
              }
              if (types.includes('postal_code')) {
                zipCode = component.long_name;
              }
            });

            resolve({
              latitude: lat,
              longitude: lng,
              address: result.formatted_address,
              city,
              state,
              zipCode,
            });
          }
        );
      });
    } catch (error) {
      console.error('Error reverse geocoding:', error);
      return null;
    }
  }

  async geocodeAddress(address: string): Promise<LocationWithAddress | null> {
    await this.initialize();

    if (!this.geocoder) return null;

    return new Promise((resolve) => {
      this.geocoder!.geocode({ address }, (results, status) => {
        if (
          status !== google.maps.GeocoderStatus.OK ||
          !results ||
          results.length === 0
        ) {
          resolve(null);
          return;
        }

        const result = results[0];
        const location = result.geometry.location;

        // Extract address components
        const addressComponents = result.address_components;
        let city = '';
        let state = '';
        let zipCode = '';

        addressComponents.forEach((component) => {
          const types = component.types;
          if (
            types.includes('locality') ||
            types.includes('administrative_area_level_2')
          ) {
            city = component.long_name;
          }
          if (types.includes('administrative_area_level_1')) {
            state = component.long_name;
          }
          if (types.includes('postal_code')) {
            zipCode = component.long_name;
          }
        });

        resolve({
          latitude: location.lat(),
          longitude: location.lng(),
          address: result.formatted_address,
          city,
          state,
          zipCode,
        });
      });
    });
  }

  /**
   * Calculate distance and duration between restaurant and customer address using Google Maps Distance Matrix API
   */
  async calculateDeliveryMetrics(
    restaurantLat: number,
    restaurantLng: number,
    customerLat: number,
    customerLng: number,
    preparationTime: number = 20 // in minutes
  ): Promise<DeliveryCalculation> {
    const apiKey =
      process.env.GOOGLE_MAPS_API_KEY ||
      process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      console.warn('Google Maps API key not found, using fallback calculation');
      return this.calculateFallbackMetrics(
        restaurantLat,
        restaurantLng,
        customerLat,
        customerLng,
        preparationTime
      );
    }

    try {
      const origins = `${restaurantLat},${restaurantLng}`;
      const destinations = `${customerLat},${customerLng}`;

      const url =
        `https://maps.googleapis.com/maps/api/distancematrix/json?` +
        `origins=${encodeURIComponent(origins)}&` +
        `destinations=${encodeURIComponent(destinations)}&` +
        `mode=driving&` +
        `units=metric&` +
        `departure_time=now&` +
        `traffic_model=best_guess&` +
        `key=${apiKey}`;

      const response = await fetch(url);
      const data: DistanceMatrixResponse = await response.json();

      if (data.status !== 'OK') {
        console.warn(`Google Maps Distance Matrix API error: ${data.status}`);
        return this.calculateFallbackMetrics(
          restaurantLat,
          restaurantLng,
          customerLat,
          customerLng,
          preparationTime
        );
      }

      const element = data.rows[0]?.elements[0];
      if (!element || element.status !== 'OK') {
        console.warn(`No route found: ${element?.status || 'Unknown error'}`);
        return this.calculateFallbackMetrics(
          restaurantLat,
          restaurantLng,
          customerLat,
          customerLng,
          preparationTime
        );
      }

      const distanceKm = element.distance.value / 1000; // Convert meters to kilometers
      const durationMinutes = Math.ceil(element.duration.value / 60); // Convert seconds to minutes

      // Calculate estimated delivery time (preparation time + travel time)
      const totalDeliveryMinutes = preparationTime + durationMinutes;
      const estimatedDeliveryTime = new Date(
        Date.now() + totalDeliveryMinutes * 60 * 1000
      );

      return {
        distance: Math.round(distanceKm * 100) / 100, // Round to 2 decimal places
        duration: durationMinutes,
        estimatedDeliveryTime,
      };
    } catch (error) {
      console.error('Error calculating delivery metrics:', error);
      return this.calculateFallbackMetrics(
        restaurantLat,
        restaurantLng,
        customerLat,
        customerLng,
        preparationTime
      );
    }
  }

  /**
   * Fallback calculation based on straight-line distance
   */
  private calculateFallbackMetrics(
    restaurantLat: number,
    restaurantLng: number,
    customerLat: number,
    customerLng: number,
    preparationTime: number
  ): DeliveryCalculation {
    const fallbackDistance = this.calculateStraightLineDistance(
      restaurantLat,
      restaurantLng,
      customerLat,
      customerLng
    );

    // Estimate duration based on average speed (assuming 25 km/h in city traffic)
    // Add 20% buffer for actual road distance vs straight line
    const adjustedDistance = fallbackDistance * 1.2;
    const fallbackDuration = Math.ceil((adjustedDistance / 25) * 60);
    const totalDeliveryMinutes = preparationTime + fallbackDuration;
    const estimatedDeliveryTime = new Date(
      Date.now() + totalDeliveryMinutes * 60 * 1000
    );

    return {
      distance: Math.round(adjustedDistance * 100) / 100,
      duration: fallbackDuration,
      estimatedDeliveryTime,
    };
  }

  /**
   * Calculate straight-line distance between two points using Haversine formula
   */
  private calculateStraightLineDistance(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
  ): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLng = this.toRadians(lng2 - lng1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) *
        Math.cos(this.toRadians(lat2)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return Math.round(distance * 100) / 100; // Round to 2 decimal places
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Validate coordinates
   */
  static isValidCoordinate(lat: number, lng: number): boolean {
    return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
  }
}

export const googleMapsService = new GoogleMapsService();
