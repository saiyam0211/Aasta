'use client';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  etag?: string;
  locationId?: string;
  vegOnly?: boolean;
}

interface AppCacheData {
  // Home page data
  popularRestaurants: any[];
  popularDishes: any[];
  hacksOfTheDay: any[];
  nearbyDishes: any[][];
  recentOrders: any[];
  
  // Restaurant page data
  restaurantDetails: Record<string, any>;
  restaurantMenu: Record<string, any>;
  
  // Profile data
  userProfile: any;
  userAddresses: any[];
  
  // Cart data
  cartItems: any[];
  
  // Search data
  searchResults: Record<string, any>;
  
  // Global state
  lastUpdateEtag: string;
  lastLocationId: string;
  lastVegMode: boolean;
}

class AppCache {
  private readonly CACHE_PREFIX = 'aasta_app_cache_';
  private readonly TTL_MS = 5 * 60 * 1000; // 5 minutes
  private readonly STALE_TTL_MS = 30 * 60 * 1000; // 30 minutes for stale data

  // Get cached data with freshness check
  get<T>(key: string, locationId?: string, vegOnly?: boolean): T | null {
    try {
      const stored = localStorage.getItem(this.CACHE_PREFIX + key);
      if (!stored) return null;

      const entry: CacheEntry<T> = JSON.parse(stored);
      
      // Check if data is for current location/veg mode
      if (locationId && entry.locationId && entry.locationId !== locationId) {
        return null;
      }
      if (vegOnly !== undefined && entry.vegOnly !== undefined && entry.vegOnly !== vegOnly) {
        return null;
      }

      // Check if data is fresh
      const isFresh = Date.now() - entry.timestamp < this.TTL_MS;
      const isStale = Date.now() - entry.timestamp < this.STALE_TTL_MS;

      if (isFresh) {
        console.log(`[Cache] Fresh data for ${key}`);
        return entry.data;
      } else if (isStale) {
        console.log(`[Cache] Stale data for ${key}, will refresh in background`);
        return entry.data;
      } else {
        console.log(`[Cache] Expired data for ${key}`);
        return null;
      }
    } catch (error) {
      console.error(`[Cache] Error reading ${key}:`, error);
      return null;
    }
  }

  // Set cached data
  set<T>(key: string, data: T, etag?: string, locationId?: string, vegOnly?: boolean): void {
    try {
      const entry: CacheEntry<T> = {
        data,
        timestamp: Date.now(),
        etag,
        locationId,
        vegOnly
      };
      
      localStorage.setItem(this.CACHE_PREFIX + key, JSON.stringify(entry));
      console.log(`[Cache] Stored data for ${key}`);
    } catch (error) {
      console.error(`[Cache] Error storing ${key}:`, error);
    }
  }

  // Check if data exists and is fresh
  has(key: string, locationId?: string, vegOnly?: boolean): boolean {
    return this.get(key, locationId, vegOnly) !== null;
  }

  // Invalidate specific cache entry
  invalidate(key: string): void {
    try {
      localStorage.removeItem(this.CACHE_PREFIX + key);
      console.log(`[Cache] Invalidated ${key}`);
    } catch (error) {
      console.error(`[Cache] Error invalidating ${key}:`, error);
    }
  }

  // Invalidate all cache entries
  invalidateAll(): void {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(this.CACHE_PREFIX)) {
          localStorage.removeItem(key);
        }
      });
      console.log(`[Cache] Invalidated all cache`);
    } catch (error) {
      console.error(`[Cache] Error invalidating all cache:`, error);
    }
  }

  // Invalidate cache for specific location
  invalidateLocation(locationId: string): void {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(this.CACHE_PREFIX)) {
          const stored = localStorage.getItem(key);
          if (stored) {
            const entry = JSON.parse(stored);
            if (entry.locationId === locationId) {
              localStorage.removeItem(key);
            }
          }
        }
      });
      console.log(`[Cache] Invalidated cache for location ${locationId}`);
    } catch (error) {
      console.error(`[Cache] Error invalidating location cache:`, error);
    }
  }

  // Get cache size info
  getCacheInfo(): { size: number; entries: string[] } {
    try {
      const keys = Object.keys(localStorage);
      const cacheKeys = keys.filter(key => key.startsWith(this.CACHE_PREFIX));
      return {
        size: cacheKeys.length,
        entries: cacheKeys
      };
    } catch (error) {
      console.error(`[Cache] Error getting cache info:`, error);
      return { size: 0, entries: [] };
    }
  }

  // Home page data methods
  getHomeData(locationId: string, vegOnly: boolean) {
    return {
      popularRestaurants: this.get('popular_restaurants', locationId, vegOnly) || [],
      popularDishes: this.get('popular_dishes', locationId, vegOnly) || [],
      hacksOfTheDay: this.get('hacks_of_day', locationId, vegOnly) || [],
      nearbyDishes: this.get('nearby_dishes', locationId, vegOnly) || [],
      recentOrders: this.get('recent_orders', locationId, vegOnly) || []
    };
  }

  setHomeData(data: Partial<AppCacheData>, locationId: string, vegOnly: boolean, etag?: string) {
    if (data.popularRestaurants) {
      this.set('popular_restaurants', data.popularRestaurants, etag, locationId, vegOnly);
    }
    if (data.popularDishes) {
      this.set('popular_dishes', data.popularDishes, etag, locationId, vegOnly);
    }
    if (data.hacksOfTheDay) {
      this.set('hacks_of_day', data.hacksOfTheDay, etag, locationId, vegOnly);
    }
    if (data.nearbyDishes) {
      this.set('nearby_dishes', data.nearbyDishes, etag, locationId, vegOnly);
    }
    if (data.recentOrders) {
      this.set('recent_orders', data.recentOrders, etag, locationId, vegOnly);
    }
  }

  // Restaurant data methods
  getRestaurantData(restaurantId: string) {
    return {
      details: this.get(`restaurant_${restaurantId}`) || null,
      menu: this.get(`restaurant_menu_${restaurantId}`) || null
    };
  }

  setRestaurantData(restaurantId: string, details: any, menu: any, etag?: string) {
    if (details) {
      this.set(`restaurant_${restaurantId}`, details, etag);
    }
    if (menu) {
      this.set(`restaurant_menu_${restaurantId}`, menu, etag);
    }
  }

  // Profile data methods
  getProfileData() {
    return {
      profile: this.get('user_profile') || null,
      addresses: this.get('user_addresses') || []
    };
  }

  setProfileData(profile: any, addresses: any[], etag?: string) {
    if (profile) {
      this.set('user_profile', profile, etag);
    }
    if (addresses) {
      this.set('user_addresses', addresses, etag);
    }
  }

  // Cart data methods
  getCartData() {
    return this.get('cart_items') || [];
  }

  setCartData(cartItems: any[]) {
    this.set('cart_items', cartItems);
  }

  // Search data methods
  getSearchData(query: string) {
    return this.get(`search_${query}`) || null;
  }

  setSearchData(query: string, results: any[]) {
    this.set(`search_${query}`, results);
  }

  // ETag management
  getLastEtag(): string | null {
    return this.get('last_etag') || null;
  }

  setLastEtag(etag: string) {
    this.set('last_etag', etag);
  }

  // Background refresh helper
  async refreshInBackground<T>(
    key: string,
    fetcher: () => Promise<T>,
    locationId?: string,
    vegOnly?: boolean
  ): Promise<T> {
    try {
      console.log(`[Cache] Background refresh for ${key}`);
      const freshData = await fetcher();
      this.set(key, freshData, undefined, locationId, vegOnly);
      return freshData;
    } catch (error) {
      console.error(`[Cache] Background refresh failed for ${key}:`, error);
      throw error;
    }
  }
}

// Export singleton instance
export const appCache = new AppCache();
export default appCache;
