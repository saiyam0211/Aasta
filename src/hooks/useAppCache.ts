'use client';

import { useEffect, useState, useCallback } from 'react';
import { appCache } from '@/lib/app-cache';
import { useLocationStore } from '@/hooks/useLocation';

interface UseAppCacheOptions {
  enableBackgroundRefresh?: boolean;
  refreshInterval?: number;
}

export function useAppCache(options: UseAppCacheOptions = {}) {
  const { enableBackgroundRefresh = true, refreshInterval = 30000 } = options;
  const { locationId } = useLocationStore();
  const [lastEtag, setLastEtag] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Check for updates in background
  const checkForUpdates = useCallback(async () => {
    if (!locationId || isRefreshing) return;

    try {
      setIsRefreshing(true);
      const response = await fetch('/api/updates/etag');
      const data = await response.json();
      const currentEtag = data?.etag;

      if (currentEtag && currentEtag !== lastEtag) {
        console.log('[AppCache] ETag changed, invalidating cache');
        appCache.invalidateLocation(locationId);
        setLastEtag(currentEtag);
        appCache.setLastEtag(currentEtag);
      }
    } catch (error) {
      console.error('[AppCache] Error checking for updates:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [locationId, lastEtag, isRefreshing]);

  // Initialize cache and start background refresh
  useEffect(() => {
    if (!locationId) return;

    // Load last ETag
    const storedEtag = appCache.getLastEtag();
    setLastEtag(storedEtag);

    // Start background refresh if enabled
    if (enableBackgroundRefresh) {
      const interval = setInterval(checkForUpdates, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [locationId, enableBackgroundRefresh, refreshInterval, checkForUpdates]);

  // Get cached data with fallback
  const getCachedData = useCallback(<T>(
    key: string,
    fetcher: () => Promise<T>,
    vegOnly?: boolean
  ): Promise<T> => {
    return new Promise(async (resolve) => {
      // Try to get from cache first
      const cached = appCache.get<T>(key, locationId || undefined, vegOnly);
      if (cached) {
        console.log(`[AppCache] Using cached data for ${key}`);
        resolve(cached);
        
        // Refresh in background if data is stale
        if (enableBackgroundRefresh) {
          try {
            const freshData = await fetcher();
            appCache.set(key, freshData, undefined, locationId || undefined, vegOnly);
          } catch (error) {
            console.error(`[AppCache] Background refresh failed for ${key}:`, error);
          }
        }
        return;
      }

      // No cache, fetch fresh data
      console.log(`[AppCache] No cache for ${key}, fetching fresh data`);
      try {
        const freshData = await fetcher();
        appCache.set(key, freshData, undefined, locationId || undefined, vegOnly);
        resolve(freshData);
      } catch (error) {
        console.error(`[AppCache] Error fetching ${key}:`, error);
        throw error;
      }
    });
  }, [locationId, enableBackgroundRefresh]);

  // Set cached data
  const setCachedData = useCallback(<T>(
    key: string,
    data: T,
    vegOnly?: boolean
  ) => {
    appCache.set(key, data, undefined, locationId || undefined, vegOnly);
  }, [locationId]);

  // Invalidate specific cache
  const invalidateCache = useCallback((key: string) => {
    appCache.invalidate(key);
  }, []);

  // Invalidate all cache
  const invalidateAllCache = useCallback(() => {
    appCache.invalidateAll();
  }, []);

  // Get cache info
  const getCacheInfo = useCallback(() => {
    return appCache.getCacheInfo();
  }, []);

  return {
    getCachedData,
    setCachedData,
    invalidateCache,
    invalidateAllCache,
    getCacheInfo,
    isRefreshing,
    lastEtag
  };
}
