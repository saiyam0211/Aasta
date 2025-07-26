// Google Maps types
declare namespace google {
  namespace maps {
    class Geocoder {
      geocode(
        request: google.maps.GeocoderRequest,
        callback: (
          results: google.maps.GeocoderResult[] | null,
          status: google.maps.GeocoderStatus
        ) => void
      ): void;
    }

    interface GeocoderRequest {
      address?: string;
      location?: google.maps.LatLng | google.maps.LatLngLiteral;
      placeId?: string;
      bounds?: google.maps.LatLngBounds;
      componentRestrictions?: google.maps.GeocoderComponentRestrictions;
      region?: string;
    }

    interface GeocoderResult {
      address_components: google.maps.GeocoderAddressComponent[];
      formatted_address: string;
      geometry: google.maps.GeocoderGeometry;
      place_id: string;
      types: string[];
    }

    interface GeocoderAddressComponent {
      long_name: string;
      short_name: string;
      types: string[];
    }

    interface GeocoderGeometry {
      location: google.maps.LatLng;
      location_type: google.maps.GeocoderLocationType;
      viewport: google.maps.LatLngBounds;
      bounds?: google.maps.LatLngBounds;
    }

    class LatLng {
      constructor(lat: number, lng: number);
      lat(): number;
      lng(): number;
    }

    interface LatLngLiteral {
      lat: number;
      lng: number;
    }

    class LatLngBounds {
      constructor(sw?: google.maps.LatLng, ne?: google.maps.LatLng);
    }

    interface GeocoderComponentRestrictions {
      administrativeArea?: string;
      country?: string | string[];
      locality?: string;
      postalCode?: string;
      route?: string;
    }

    enum GeocoderStatus {
      ERROR = 'ERROR',
      INVALID_REQUEST = 'INVALID_REQUEST',
      OK = 'OK',
      OVER_QUERY_LIMIT = 'OVER_QUERY_LIMIT',
      REQUEST_DENIED = 'REQUEST_DENIED',
      UNKNOWN_ERROR = 'UNKNOWN_ERROR',
      ZERO_RESULTS = 'ZERO_RESULTS',
    }

    enum GeocoderLocationType {
      APPROXIMATE = 'APPROXIMATE',
      GEOMETRIC_CENTER = 'GEOMETRIC_CENTER',
      RANGE_INTERPOLATED = 'RANGE_INTERPOLATED',
      ROOFTOP = 'ROOFTOP',
    }

    namespace places {
      class AutocompleteService {
        getPlacePredictions(
          request: google.maps.places.AutocompletionRequest,
          callback: (
            predictions: google.maps.places.AutocompletePrediction[] | null,
            status: google.maps.places.PlacesServiceStatus
          ) => void
        ): void;
      }

      class PlacesService {
        constructor(attrContainer: HTMLDivElement | google.maps.Map);
      }

      interface AutocompletionRequest {
        input: string;
        bounds?: google.maps.LatLngBounds;
        componentRestrictions?: google.maps.places.ComponentRestrictions;
        location?: google.maps.LatLng;
        offset?: number;
        origin?: google.maps.LatLng;
        radius?: number;
        region?: string;
        sessionToken?: google.maps.places.AutocompleteSessionToken;
        types?: string[];
      }

      interface AutocompletePrediction {
        description: string;
        matched_substrings: google.maps.places.PredictionSubstring[];
        place_id: string;
        reference: string;
        structured_formatting: google.maps.places.StructuredFormatting;
        terms: google.maps.places.PredictionTerm[];
        types: string[];
      }

      interface PredictionSubstring {
        length: number;
        offset: number;
      }

      interface StructuredFormatting {
        main_text: string;
        main_text_matched_substrings?: google.maps.places.PredictionSubstring[];
        secondary_text?: string;
        secondary_text_matched_substrings?: google.maps.places.PredictionSubstring[];
      }

      interface PredictionTerm {
        offset: number;
        value: string;
      }

      interface ComponentRestrictions {
        country: string | string[];
      }

      class AutocompleteSessionToken {}

      enum PlacesServiceStatus {
        INVALID_REQUEST = 'INVALID_REQUEST',
        NOT_FOUND = 'NOT_FOUND',
        OK = 'OK',
        OVER_QUERY_LIMIT = 'OVER_QUERY_LIMIT',
        REQUEST_DENIED = 'REQUEST_DENIED',
        UNKNOWN_ERROR = 'UNKNOWN_ERROR',
        ZERO_RESULTS = 'ZERO_RESULTS',
      }
    }
  }
}
