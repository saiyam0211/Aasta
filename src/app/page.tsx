'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import localFont from 'next/font/local';
import { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import { useLocationStore } from '@/hooks/useLocation';
import { toast } from 'sonner';
import { HomeHeader } from '@/components/ui/home-header';
// Removed AddressSheet import - we only use location modal
import { HomeProductCard } from '@/components/ui/home-product-card';
import { HomeProductCardList } from '@/components/ui/home-product-card-vertical';
import { CheckCircle } from 'lucide-react';
import type { Dish } from '@/types/dish';
import {
  RestaurantCard,
  type RestaurantSummary,
} from '@/components/ui/restaurant-card';
import { ProductBottomSheet } from '@/components/ui/ProductBottomSheet';
import { useCartStore } from '@/lib/store';
import { CartBottomNav } from '@/components/ui/cart-bottom-nav';
import { useCacheStore } from '@/lib/cache-store';
import { FoodHacksPromo } from '@/components/ui/food-hacks-promo';
import { useVegMode } from '@/contexts/VegModeContext';
import { HackOfTheDay } from '@/components/ui/deal-of-the-day';
import { readCache, writeCache } from '@/lib/smart-cache';
import { useAppCache } from '@/hooks/useAppCache';
import LocationChangeLoader from '@/components/ui/location-change-loader';
import VegModeLoader from '@/components/ui/veg-mode-loader';
import { LocationOnboarding } from '@/components/ui/location-onboarding';
import { hideSplashWhenReady } from '@/lib/splash-screen';
// Custom inline animation (no JSON)
// import { CurvedMarquee } from '@/components/ui/curved-marquee';
// import { usePullToRefresh } from '@/hooks/usePullToRefresh';

const brandFont = localFont({
  src: [
    {
      path: '../../public/fonts/Tanjambore_bysaiyam-Regular.ttf',
      weight: '400',
      style: 'normal',
    },
  ],
  variable: '--font-brand',
  display: 'swap',
});
export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { latitude, longitude, locationName, locationId, setLocation } =
    useLocationStore();
  const { cart, addItem } = useCartStore();
  const { vegOnly, onVegModeToggle } = useVegMode();
  const {
    getCachedData,
    setCachedData,
    invalidateCache: invalidateAppCache,
  } = useAppCache();
  const {
    setRestaurants: setCachedRestaurants,
    setDishes: setCachedDishes,
    isCacheValid,
    getCachedRestaurants,
    getCachedDishes,
    invalidateCache,
  } = useCacheStore();

  // Removed showLocationPrompt - we only use location modal
  // Removed addressSheetOpen - we only use location modal
  // Removed selectedLocationLabel - we only use locationName from store
  // Removed popular content; using inline search results instead
  const [searchQuery, setSearchQuery] = useState('');
  const [dishResults, setDishResults] = useState<Dish[]>([]);
  const [restaurantResults, setRestaurantResults] = useState<
    RestaurantSummary[]
  >([]);
  const [searchLoading, setSearchLoading] = useState(false);
  // Popular content (fallback when no search)
  const [popularDishes, setPopularDishes] = useState<Dish[]>([]);
  const [popularRestaurants, setPopularRestaurants] = useState<
    RestaurantSummary[]
  >([]);
  const [popularLoading, setPopularLoading] = useState(true); // Start with loading
  // Header reset signal for clearing input when Home is tapped
  const [headerResetSignal, setHeaderResetSignal] = useState(0);
  // Product sheet state
  const [selectedDish, setSelectedDish] = useState<Dish | null>(null);
  const [productSheetOpen, setProductSheetOpen] = useState(false);
  // State for hack of the day items
  const [hacksOfTheDay, setHacksOfTheDay] = useState<any[]>([]);
  const [hacksLoading, setHacksLoading] = useState(true); // Start with loading
  // Recently ordered items (last 4 order items)
  const [recentDishes, setRecentDishes] = useState<Dish[]>([]);
  const [recentLoading, setRecentLoading] = useState(true); // Start with loading
  // Real-time: backend update tag to trigger refreshes
  const [updateEtag, setUpdateEtag] = useState<string>('');
  // Nearby non-featured dishes (within 5km), split into three sections with no repeats
  const [nearbyDishesSections, setNearbyDishesSections] = useState<Dish[][]>([
    [],
    [],
    [],
  ]);
  const [nearbyDishesLoading, setNearbyDishesLoading] = useState(true); // Start with loading
  // Smooth veg-toggle UX (quick local filter + subtle animation)
  const [vegToggleAnimating, setVegToggleAnimating] = useState(false);
  // const [isPullRefreshing, setIsPullRefreshing] = useState(false);
  const [isRelocating, setIsRelocating] = useState(false);
  const [showLocationChangeLoader, setShowLocationChangeLoader] =
    useState(false);
  const [showVegModeLoader, setShowVegModeLoader] = useState(false);
  const [isEnteringVegMode, setIsEnteringVegMode] = useState(true);
  // Initial app loading state - we'll use splash screen instead
  const [isInitialLoading, setIsInitialLoading] = useState(false);
  const [prevVegOnly, setPrevVegOnly] = useState(vegOnly);
  const [showLocationModal, setShowLocationModal] = useState(false);
  // Remove login notification logic from home page - it should be handled by auth system

  const cartItemCount =
    cart?.items.reduce((total, item) => total + item.quantity, 0) || 0;

  const RADIUS = Number(process.env.NEXT_PUBLIC_RADIUS_KM || '5');

  // Removed coordinate hydration - we only use selected dropdown location

  // Removed location prompt logic - we only use location modal

  const slugify = (input: string) =>
    input
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

  // Load home data using app cache for instant loading
  const loadHomeDataWithCache = useCallback(async () => {
    try {
      // Check if we already have data and it's recent (less than 5 minutes old)
      const hasRecentData =
        popularDishes.length > 0 && popularRestaurants.length > 0;
      if (hasRecentData) {
        console.log('📱 Using cached data, skipping API calls');
        setIsInitialLoading(false);
        return;
      }

      // Load all data in parallel using cache
      const [restaurants, dishes, hacks, nearbyDishes, recentOrders] =
        await Promise.all([
          getCachedData(
            'popular_restaurants',
            () => loadPopularContentData(),
            vegOnly
          ),
          getCachedData(
            'popular_dishes',
            () => loadPopularDishesData(),
            vegOnly
          ),
          getCachedData('hacks_of_day', () => loadHacksOfTheDayData(), vegOnly),
          getCachedData('nearby_dishes', () => loadNearbyDishesData(), vegOnly),
          getCachedData('recent_orders', () => loadRecentOrdersData(), vegOnly),
        ]);

      // Set data immediately for instant UI
      setPopularRestaurants(restaurants);
      setPopularDishes(dishes);
      setHacksOfTheDay(hacks);
      setNearbyDishesSections(nearbyDishes);
      setRecentDishes(recentOrders);

      // Set loading states to false
      setPopularLoading(false);
      setHacksLoading(false);
      setNearbyDishesLoading(false);
      setRecentLoading(false);
      setIsInitialLoading(false);

      // Hide splash screen when all data is loaded
      await hideSplashWhenReady();

      // Welcome notification trigger moved to separate useEffect
    } catch (error) {
      console.error('❌ Error loading home data:', error);
      // Fallback to normal loading
      loadPopularContent();
      loadHacksOfTheDay();
      loadNearbyNonFeaturedDishes();
      loadRecentlyOrdered();

      // Hide splash screen even on error
      await hideSplashWhenReady();
    }
  }, [
    locationId,
    vegOnly,
    getCachedData,
    setPopularRestaurants,
    setPopularDishes,
    setHacksOfTheDay,
    setNearbyDishesSections,
    setRecentDishes,
    setPopularLoading,
    setHacksLoading,
    setNearbyDishesLoading,
    setRecentLoading,
  ]);

  // Individual data loading functions for cache
  const loadPopularContentData = async () => {
    const response = await fetch(
      `/api/restaurants/by-location?locationId=${locationId}&limit=12${vegOnly ? '&veg=1' : ''}&_=${Date.now()}`
    );
    const data = await response.json();
    return data.data || [];
  };

  const loadPopularDishesData = async () => {
    const response = await fetch(
      `/api/restaurants/by-location?locationId=${locationId}&limit=12${vegOnly ? '&veg=1' : ''}&_=${Date.now()}`
    );
    const data = await response.json();
    const restaurants = data.data || [];
    return restaurants.flatMap((r: any) =>
      (r.featuredItems || []).map((item: any) => ({
        id: item.id,
        name: item.name,
        image: item.image || '/images/dish-placeholder.svg',
        price: item.price,
        originalPrice: item.originalPrice,
        restaurant: r.name,
        restaurantId: r.id,
        dietaryTags: item.dietaryTags || [],
        stockLeft: item.stockLeft,
        soldOut: item.soldOut === true || item.stockLeft === null,
        preparationTime: item.preparationTime,
        description: item.description,
      }))
    );
  };

  const loadHacksOfTheDayData = async () => {
    const response = await fetch(
      `/api/restaurants/by-location?locationId=${locationId}${vegOnly ? '&veg=1' : ''}&_=${Date.now()}`
    );
    const data = await response.json();
    const restaurants = data.data || [];
    const hacks: any[] = [];
    restaurants.forEach((r: any) => {
      (r.hackItems || []).forEach((item: any) => {
        const isVeg =
          Array.isArray(item.dietaryTags) && item.dietaryTags.includes('Veg');
        if (vegOnly && !isVeg) return;
        hacks.push({
          id: item.id,
          name: item.name,
          image: item.image || '/images/dish-placeholder.svg',
          price: item.price,
          originalPrice: item.originalPrice,
          restaurant: r.name,
          restaurantId: r.id,
          dietaryTags: item.dietaryTags || [],
          stockLeft: item.stockLeft,
          soldOut: item.soldOut === true || item.stockLeft === null,
          preparationTime: item.preparationTime,
          description: item.description,
        });
      });
    });
    return hacks;
  };

  const loadNearbyDishesData = async () => {
    const response = await fetch(
      `/api/restaurants/by-location?locationId=${locationId}&limit=12${vegOnly ? '&veg=1' : ''}&_=${Date.now()}`
    );
    const data = await response.json();
    const restaurants = data.data || [];
    const allDishes: any[] = [];
    restaurants.forEach((r: any) => {
      (r.nonFeaturedItems || []).forEach((item: any) => {
        const isVeg =
          Array.isArray(item.dietaryTags) && item.dietaryTags.includes('Veg');
        if (vegOnly && !isVeg) return;
        allDishes.push({
          id: item.id,
          name: item.name,
          image: item.image || '/images/dish-placeholder.svg',
          price: item.price,
          originalPrice: item.originalPrice,
          restaurant: r.name,
          restaurantId: r.id,
          dietaryTags: item.dietaryTags || [],
          stockLeft: item.stockLeft,
          soldOut: item.soldOut === true || item.stockLeft === null,
          preparationTime: item.preparationTime,
          description: item.description,
        });
      });
    });

    // Split into 3 sections
    const shuffled = allDishes.sort(() => Math.random() - 0.5);
    const sectionSize = Math.ceil(shuffled.length / 3);
    return [
      shuffled.slice(0, sectionSize),
      shuffled.slice(sectionSize, sectionSize * 2),
      shuffled.slice(sectionSize * 2),
    ];
  };

  const loadRecentOrdersData = async () => {
    const response = await fetch(
      '/api/orders?limit=10&paymentStatus=COMPLETED'
    );
    const data = await response.json();
    return (data.data?.orders || []).slice(0, 4).map((order: any) => ({
      id: order.id,
      name: order.items?.[0]?.name || 'Order',
      image: order.items?.[0]?.image || '/images/dish-placeholder.svg',
      price: order.totalAmount,
      restaurant: order.restaurant?.name || 'Restaurant',
      restaurantId: order.restaurantId,
      orderNumber: order.orderNumber,
    }));
  };

  // Function to get and process preloaded data from splash screen
  const getPreloadedData = () => {
    try {
      const stored = sessionStorage.getItem('aasta_preloaded_data');
      if (!stored) return null;

      const preloadedData = JSON.parse(stored);

      // Check if data is for current location
      if (preloadedData.locationId !== locationId) {
        return null;
      }

      // Check if data is fresh (less than 5 minutes old)
      const isFresh = Date.now() - preloadedData.timestamp < 5 * 60 * 1000;
      if (!isFresh) return null;

      // Process the preloaded data into the expected format
      const processedData: any = {
        success: true,
        restaurants: [],
        dishes: [],
        hacks: [],
        nearbyDishes: [],
        recentOrders: [],
      };

      // Process each result
      preloadedData.results.forEach((result: any) => {
        if (result.success && result.data) {
          switch (result.type) {
            case 'popular':
              if (Array.isArray(result.data)) {
                processedData.restaurants = result.data.map((r: any) => ({
                  id: r.id,
                  name: r.name,
                  imageUrl: r.image,
                  bannerImage: r.bannerImage,
                  cuisineTypes: r.cuisineTypes,
                  rating: r.rating,
                  estimatedDeliveryTime: r.deliveryTime,
                  distanceKm: r.distance,
                  minimumOrderAmount: r.minimumOrderAmount,
                  isOpen: r.isOpen,
                  featuredItems: r.featuredItems || [],
                }));

                // Extract featured dishes
                processedData.dishes = result.data.flatMap((r: any) =>
                  (r.featuredItems || []).map((item: any) => ({
                    id: item.id,
                    name: item.name,
                    image: item.image || '/images/dish-placeholder.svg',
                    price: item.price,
                    originalPrice: item.originalPrice,
                    restaurant: r.name,
                    restaurantId: r.id,
                    dietaryTags: item.dietaryTags || [],
                    stockLeft: item.stockLeft,
                    soldOut: item.soldOut === true || item.stockLeft === null,
                    preparationTime: item.preparationTime,
                    description: item.description,
                  }))
                );
              }
              break;

            case 'hacks':
              if (Array.isArray(result.data)) {
                const hacks: any[] = [];
                result.data.forEach((r: any) => {
                  (r.hackItems || []).forEach((item: any) => {
                    const isVeg =
                      Array.isArray(item.dietaryTags) &&
                      item.dietaryTags.includes('Veg');
                    if (vegOnly && !isVeg) return;

                    hacks.push({
                      id: item.id,
                      name: item.name,
                      image: item.image || '/images/dish-placeholder.svg',
                      price: item.price,
                      originalPrice: item.originalPrice,
                      restaurant: r.name,
                      restaurantId: r.id,
                      dietaryTags: item.dietaryTags || [],
                      stockLeft: item.stockLeft,
                      soldOut: item.soldOut === true,
                    });
                  });
                });
                processedData.hacks = hacks;
              }
              break;

            case 'nearby':
              if (Array.isArray(result.data)) {
                const allDishes: any[] = [];
                result.data.forEach((r: any) => {
                  (r.nonFeaturedItems || []).forEach((item: any) => {
                    const isVeg =
                      Array.isArray(item.dietaryTags) &&
                      item.dietaryTags.includes('Veg');
                    if (vegOnly && !isVeg) return;

                    allDishes.push({
                      id: item.id,
                      name: item.name,
                      image: item.image || '/images/dish-placeholder.svg',
                      price: item.price,
                      originalPrice: item.originalPrice,
                      restaurant: r.name,
                      restaurantId: r.id,
                      dietaryTags: item.dietaryTags || [],
                      stockLeft: item.stockLeft,
                      soldOut: item.soldOut === true,
                    });
                  });
                });

                // Split into 3 sections
                const shuffled = allDishes.sort(() => Math.random() - 0.5);
                const sectionSize = Math.ceil(shuffled.length / 3);
                processedData.nearbyDishes = [
                  shuffled.slice(0, sectionSize),
                  shuffled.slice(sectionSize, sectionSize * 2),
                  shuffled.slice(sectionSize * 2),
                ];
              }
              break;

            case 'recent':
              if (result.data?.orders) {
                processedData.recentOrders = result.data.orders
                  .slice(0, 4)
                  .map((order: any) => ({
                    id: order.id,
                    name: order.items?.[0]?.name || 'Order',
                    image:
                      order.items?.[0]?.image || '/images/dish-placeholder.svg',
                    price: order.totalAmount,
                    restaurant: order.restaurant?.name || 'Restaurant',
                    restaurantId: order.restaurantId,
                    orderNumber: order.orderNumber,
                  }));
              }
              break;
          }
        }
      });

      return processedData;
    } catch (error) {
      console.error('Error processing preloaded data:', error);
      return null;
    }
  };

  // Function to refresh data (can be called from header)
  const refreshData = async () => {
    // setIsPullRefreshing(true);
    try {
      await loadPopularContent();
      await loadHacksOfTheDay();
      await loadNearbyNonFeaturedDishes();
      await loadRecentlyOrdered();
    } finally {
      // setIsPullRefreshing(false);
    }
  };

  // Pull-to-refresh functionality
  // const pullToRefreshRef = usePullToRefresh({
  //   onRefresh: refreshData,
  //   threshold: 80,
  //   resistance: 2.5,
  // });

  // Removed live location resolution - we only use selected dropdown location

  // Removed default address loading - we only use selected dropdown location

  // Invalidate cache when location changes significantly
  useEffect(() => {
    if (locationId) {
      // Clear cache when location changes
      // Use dummy coordinates for cache invalidation since we're using locationId-based caching
      invalidateCache({ latitude: 0, longitude: 0 });

      // Reset veg mode state to ensure it works properly with new location
      // This ensures veg mode toggle works correctly after location change
      console.log('🔄 Location changed, resetting veg mode state');
    }
  }, [locationId, invalidateCache]);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/auth/signin');
      return;
    }

    // If user has not selected a location yet, show location modal instead of redirecting
    if (!locationId) {
      // Don't redirect, just show the modal
      return;
    }

    // Load data based on locationId (not coordinates)
    // This ensures data loads properly when app reopens with stored locationId

    // Load data using app cache for instant loading
    loadHomeDataWithCache();
  }, [session, status, locationId, loadHomeDataWithCache]);

  // Lightweight polling for DB changes (restaurants/menu): refetch on etag change
  useEffect(() => {
    let stop = false;
    let last = '';
    const poll = async () => {
      try {
        const res = await fetch(`/api/updates/etag?_=${Date.now()}`);
        const data = await res.json();
        const etag = String(data?.etag || '');
        if (etag && etag !== last) {
          last = etag;
          setUpdateEtag(etag);
          if (locationId) {
            // Only refresh if data actually changed
            console.log('🔄 Data changed, refreshing cache...');
            loadHomeDataWithCache();
          }
        }
      } catch {}
      if (!stop) setTimeout(poll, 10000); // Reduce to 10s polling
    };
    poll();
    return () => {
      stop = true;
    };
  }, [locationId, loadHomeDataWithCache]);

  // Handle veg mode changes - show loader and refresh data
  useEffect(() => {
    if (status !== 'authenticated') return;

    console.log('🥬 Veg mode effect triggered:', {
      vegOnly,
      prevVegOnly,
      locationId,
      shouldAnimate: locationId && prevVegOnly !== vegOnly,
    });

    // Only show animation if veg mode actually changed (not on initial page load)
    if (locationId && prevVegOnly !== vegOnly) {
      console.log('🥬 Veg mode changed, showing loader and refreshing data');

      // Show veg mode loader
      setShowVegModeLoader(true);
      setIsEnteringVegMode(vegOnly);

      // Clear cache and reload when veg mode changes
      const refreshVegData = async () => {
        try {
          // Clear cache for current location (using dummy coordinates since we use locationId-based caching)
          invalidateCache({ latitude: 0, longitude: 0 });

          // Reload all data
          await Promise.all([
            loadPopularContent(true),
            loadHacksOfTheDay(),
            loadNearbyNonFeaturedDishes(),
            loadRecentlyOrdered(),
          ]);

          // Hide loader after data is loaded
          setTimeout(() => {
            setShowVegModeLoader(false);
          }, 1200); // Show loader for 1.2 seconds
        } catch (error) {
          console.error('Error refreshing veg mode data:', error);
          setShowVegModeLoader(false);
        }
      };

      refreshVegData();
    }

    // Update previous state
    setPrevVegOnly(vegOnly);
  }, [vegOnly, locationId, invalidateCache, prevVegOnly]);

  const loadHacksOfTheDay = async () => {
    if (!locationId) return;
    try {
      const cacheKey = `hacks_of_day_v1_${vegOnly ? 'veg' : 'all'}_${locationId}`;
      const cached = readCache<any[]>(cacheKey);
      if (cached?.data && cached.data.length > 0) {
        setHacksOfTheDay(cached.data);
        setHacksLoading(false);
      } else {
        setHacksLoading(true);
      }
      const res = await fetch(
        `/api/restaurants/by-location?locationId=${locationId}${vegOnly ? '&veg=1' : ''}`
      );
      if (!res.ok) {
        setHacksOfTheDay([]);
        return;
      }
      const payload = await res.json();
      const data = Array.isArray(payload?.data) ? payload.data : [];
      const allowedRestaurantIds = new Set(
        (data as any[]).map((r: any) => r.id)
      );
      const hacks: any[] = [];
      for (const r of data) {
        const arr = Array.isArray(r.hackItems) ? r.hackItems : [];
        for (const it of arr) {
          const tags = Array.isArray(it.dietaryTags) ? it.dietaryTags : [];
          const lower = tags.map((t: any) => String(t).toLowerCase());
          const hasNonVeg = lower.some((t: any) => /(non[-\s]?veg)/i.test(t));
          const hasVeg = lower.some((t: any) =>
            /(\bveg\b|vegetarian|vegan)/i.test(t)
          );
          const isVeg = !hasNonVeg && hasVeg;
          hacks.push({
            id: it.id,
            name: it.name,
            image: it.image,
            price: it.price,
            originalPrice: it.originalPrice,
            restaurant: r.name,
            restaurantId: r.id,
            dietaryTags: tags,
            isVegetarian: isVeg,
            stockLeft: typeof it.stockLeft === 'number' ? it.stockLeft : null,
            soldOut: it.soldOut === true,
            distanceText:
              typeof r.distance === 'number'
                ? `${Number(r.distance).toFixed(1)} km`
                : undefined,
          });
        }
      }
      // Defensive: ensure hacks belong to allowed restaurants and limit to 2 items
      const filteredHacks = hacks.filter((h) =>
        allowedRestaurantIds.has(h.restaurantId)
      );

      // Sort to ensure veg items come first, then non-veg
      const sortedHacks = filteredHacks.sort((a, b) => {
        if (a.isVegetarian && !b.isVegetarian) return -1;
        if (!a.isVegetarian && b.isVegetarian) return 1;
        return 0;
      });

      // Limit to maximum 2 items (1 veg + 1 non-veg)
      const finalList = sortedHacks.slice(0, 2);
      setHacksOfTheDay(finalList);
      writeCache(cacheKey, { data: finalList, updatedAt: Date.now() });
    } catch (error) {
      console.error('Error fetching hack of the day items:', error);
      setHacksOfTheDay([]);
    } finally {
      setHacksLoading(false);
      // Hide splash screen when this section loads
      await hideSplashWhenReady();
    }
  };

  // Recently ordered - fetch last 4 completed order items and map to Dish
  const loadRecentlyOrdered = async () => {
    try {
      const cacheKey = 'recently_ordered_dishes_v1';
      const cached = readCache<Dish[]>(cacheKey);
      if (cached?.data && cached.data.length > 0) {
        setRecentDishes(cached.data.slice(0, 4));
        setRecentLoading(false);
      } else {
        setRecentLoading(true);
      }
      const res = await fetch(
        `/api/orders?limit=4&paymentStatus=COMPLETED&_=${Date.now()}`
      );
      if (!res.ok) {
        setRecentDishes([]);
        return;
      }
      const data = await res.json();
      const orders = Array.isArray(data?.data?.orders) ? data.data.orders : [];
      // Flatten items with createdAt ordering
      const items: Dish[] = [];
      for (const order of orders) {
        const createdAt = order.createdAt
          ? Date.parse(order.createdAt)
          : Date.now();
        for (const it of order.orderItems || []) {
          const id =
            it?.menuItem?.id || `${order.id}-${it?.menuItem?.name || 'item'}`;
          const name = it?.menuItem?.name || 'Item';
          const image =
            it?.menuItem?.imageUrl || '/images/dish-placeholder.svg';
          const price = it?.unitPrice || it?.totalPrice || 0;
          const originalPrice =
            it?.originalUnitPrice || it?.totalOriginalPrice || undefined;
          const isVegetarian = Array.isArray(it?.menuItem?.dietaryTags)
            ? it.menuItem.dietaryTags.includes('Veg')
            : false;
          const rLat = (order?.restaurant as any)?.latitude as
            | number
            | undefined;
          const rLng = (order?.restaurant as any)?.longitude as
            | number
            | undefined;
          let distText: string | undefined = undefined;
          if (
            typeof latitude === 'number' &&
            typeof longitude === 'number' &&
            typeof rLat === 'number' &&
            typeof rLng === 'number'
          ) {
            const R = 6371;
            const dLat = ((rLat - latitude) * Math.PI) / 180;
            const dLon = ((rLng - longitude) * Math.PI) / 180;
            const a =
              Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos((latitude * Math.PI) / 180) *
                Math.cos((rLat * Math.PI) / 180) *
                Math.sin(dLon / 2) *
                Math.sin(dLon / 2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            const km = R * c;
            distText = `${km.toFixed(1)} km`;
          }

          items.push({
            id,
            name,
            image,
            price,
            originalPrice,
            rating: 0,
            preparationTime: it?.preparationTime || 15,
            restaurant: order?.restaurant?.name || 'Restaurant',
            category: it?.menuItem?.category || '',
            isVegetarian,
            spiceLevel: (it?.menuItem?.spiceLevel as any) || 'mild',
            description: it?.menuItem?.description || undefined,
            dietaryTags: it?.menuItem?.dietaryTags || [],
            restaurantId: it?.menuItem?.restaurantId,
            stockLeft:
              typeof it?.menuItem?.stockLeft === 'number'
                ? it?.menuItem?.stockLeft
                : null,
            soldOut:
              it?.menuItem?.available === false ||
              (typeof it?.menuItem?.stockLeft === 'number' &&
                it?.menuItem?.stockLeft <= 0) ||
              it?.menuItem?.stockLeft === null,
            distanceText: distText,
            // Keep createdAt implicitly via sort stage
          } as Dish & { _ts?: number });
        }
      }
      // Veg filter when toggle is ON
      const finalItems = vegOnly
        ? items.filter((d) =>
            Array.isArray(d.dietaryTags)
              ? d.dietaryTags.includes('Veg')
              : !!(d as any).isVegetarian
          )
        : items;
      // Do not depend on nearby restaurants; show last 4 completed items
      const finalFour = finalItems.slice(0, 4);
      setRecentDishes(finalFour);
      writeCache(cacheKey, { data: finalFour, updatedAt: Date.now() });
    } catch (e) {
      console.error('Failed to load recently ordered', e);
      setRecentDishes([]);
    } finally {
      setRecentLoading(false);
      // Hide splash screen when this section loads
      await hideSplashWhenReady();
    }
  };

  // Load non-featured menu items from restaurants in selected location and split into 3 unique sections
  const loadNearbyNonFeaturedDishes = async (
    preserveOrder: boolean = false
  ) => {
    if (!locationId) return;
    try {
      const cacheKey = `nearby_dishes_v1_${vegOnly ? 'veg' : 'all'}_${locationId}`;
      const cached = readCache<Dish[][]>(cacheKey);
      if (cached?.data && cached.data.length > 0 && !preserveOrder) {
        setNearbyDishesSections(cached.data);
        setNearbyDishesLoading(false);
      } else {
        setNearbyDishesLoading(true);
      }
      // Get restaurants by location (composite response includes item buckets)
      const restaurantsRes = await fetch(
        `/api/restaurants/by-location?locationId=${locationId}&limit=12${vegOnly ? '&veg=1' : ''}`
      );
      if (!restaurantsRes.ok) {
        setNearbyDishesSections([[], [], []]);
        return;
      }
      const restaurantsPayload = await restaurantsRes.json();
      const restaurantsRaw: any[] = Array.isArray(restaurantsPayload?.data)
        ? restaurantsPayload.data
        : [];

      const restaurants: RestaurantSummary[] = restaurantsRaw.map((x: any) => ({
        id: x.id,
        name: x.name,
        address: x.address,
        imageUrl: x.image,
        bannerImage: x.bannerImage,
        cuisineTypes: x.cuisineTypes,
        rating: x.rating,
        estimatedDeliveryTime: x.deliveryTime,
        distanceKm: x.distance,
        minimumOrderAmount: x.minimumOrderAmount,
        isOpen: !!x.isOpen,
        featuredItems: x.featuredItems || [],
      }));

      // Collect non-featured items directly from composite payload
      const allDishes: Dish[] = [];
      for (const r of restaurantsRaw) {
        const non: any[] = Array.isArray(r.nonFeaturedItems)
          ? r.nonFeaturedItems
          : [];
        for (const it of non) {
          const isVeg = Array.isArray(it.dietaryTags)
            ? it.dietaryTags.includes('Veg')
            : false;
          if (vegOnly && !isVeg) continue;
          const d: Dish = {
            id: it.id,
            name: it.name,
            image: it.image || '/images/dish-placeholder.svg',
            price: it.price,
            originalPrice: it.originalPrice ?? undefined,
            rating: 0,
            preparationTime: it.preparationTime ?? 15,
            restaurant: r.name,
            category: it.category || '',
            isVegetarian: isVeg,
            spiceLevel: (it.spiceLevel as any) || 'mild',
            description: it.description || undefined,
            dietaryTags: it.dietaryTags || [],
            restaurantId: r.id,
            stockLeft: typeof it.stockLeft === 'number' ? it.stockLeft : null,
            soldOut: it.soldOut === true,
            distanceText:
              typeof r.distance === 'number'
                ? `${Number(r.distance).toFixed(1)} km`
                : undefined,
          } as Dish;
          allDishes.push(d);
        }
      }

      // Deduplicate by id
      const uniqueMap = new Map<string, Dish>();
      for (const d of allDishes) {
        if (!uniqueMap.has(d.id)) uniqueMap.set(d.id, d);
      }
      let unique = Array.from(uniqueMap.values());

      // When preserving order (background refresh), do not reshuffle.
      if (!preserveOrder) {
        for (let i = unique.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [unique[i], unique[j]] = [unique[j], unique[i]];
        }
      }

      // Arrange so that consecutive items are not from the same restaurant
      const byRestaurant = new Map<string, Dish[]>();
      for (const d of unique) {
        const key = d.restaurantId || d.restaurant;
        if (!byRestaurant.has(key)) byRestaurant.set(key, []);
        byRestaurant.get(key)!.push(d);
      }
      // Shuffle each restaurant bucket
      for (const arr of byRestaurant.values()) {
        for (let i = arr.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [arr[i], arr[j]] = [arr[j], arr[i]];
        }
      }
      // Round-robin pick across restaurants avoiding same as previous
      const restaurantKeys = Array.from(byRestaurant.keys());
      // shuffle keys
      for (let i = restaurantKeys.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [restaurantKeys[i], restaurantKeys[j]] = [
          restaurantKeys[j],
          restaurantKeys[i],
        ];
      }
      const ordered: Dish[] = [];
      let lastKey: string | null = null;
      while (byRestaurant.size > 0) {
        let placed = false;
        for (let idx = 0; idx < restaurantKeys.length; idx++) {
          const key = restaurantKeys[idx];
          const bucket = byRestaurant.get(key);
          if (!bucket || bucket.length === 0) continue;
          if (key === lastKey) continue;
          ordered.push(bucket.shift()!);
          lastKey = key;
          placed = true;
          if (bucket.length === 0) {
            byRestaurant.delete(key);
          }
          break;
        }
        if (!placed) {
          // all remaining buckets have the same key as last; pick any
          const nonEmpty = restaurantKeys.find(
            (k) => (byRestaurant.get(k) || []).length > 0
          );
          if (!nonEmpty) break;
          const bucket = byRestaurant.get(nonEmpty)!;
          ordered.push(bucket.shift()!);
          lastKey = nonEmpty;
          if (bucket.length === 0) byRestaurant.delete(nonEmpty);
        }
        // refresh keys removing emptied ones
        for (let i = restaurantKeys.length - 1; i >= 0; i--) {
          const k = restaurantKeys[i];
          if (!byRestaurant.has(k)) restaurantKeys.splice(i, 1);
        }
        // rotate keys a bit to mix
        if (restaurantKeys.length > 1) {
          const first = restaurantKeys.shift()!;
          restaurantKeys.push(first);
        }
      }

      // Distribute into three sections in round-robin to avoid duplication across lines
      const s1: Dish[] = [],
        s2: Dish[] = [],
        s3: Dish[] = [];
      ordered.forEach((d, i) => {
        const slot = i % 3;
        if (slot === 0) s1.push(d);
        else if (slot === 1) s2.push(d);
        else s3.push(d);
      });

      if (preserveOrder) {
        // Preserve current visual order: keep ids order per section, update item fields in place, append new ids at the end
        const current = nearbyDishesSections;
        const mergeSection = (prev: Dish[], nextPool: Dish[]): Dish[] => {
          const byId = new Map(nextPool.map((d) => [d.id, d] as const));
          const result: Dish[] = [];
          const seen = new Set<string>();
          // Keep previous order where possible
          for (const old of prev) {
            const updated = byId.get(old.id);
            if (updated) {
              result.push(updated);
              seen.add(old.id);
            }
          }
          // Append new ones (not seen yet)
          for (const d of nextPool) {
            if (!seen.has(d.id)) result.push(d);
          }
          return result;
        };
        const merged: Dish[][] = [
          mergeSection(current[0] || [], s1),
          mergeSection(current[1] || [], s2),
          mergeSection(current[2] || [], s3),
        ];
        setNearbyDishesSections(merged);
      } else {
        const finalSections = [s1, s2, s3];
        setNearbyDishesSections(finalSections);
        writeCache(cacheKey, { data: finalSections, updatedAt: Date.now() });
      }
    } catch (e) {
      console.error('Failed loading nearby dishes', e);
      setNearbyDishesSections([[], [], []]);
    } finally {
      setNearbyDishesLoading(false);
      // Hide splash screen when this section loads
      await hideSplashWhenReady();
    }
  };

  const loadPopularContent = async (backgroundRefresh = false) => {
    try {
      if (!backgroundRefresh) {
        setPopularLoading(true);
      }

      // Get restaurants by location ID instead of coordinates
      let restaurantsData: RestaurantSummary[] = [];
      let dishesData: any[] = [];

      if (locationId) {
        const restaurantsRes = await fetch(
          `/api/restaurants/by-location?locationId=${locationId}&limit=12${vegOnly ? '&veg=1' : ''}&_=${Date.now()}`
        );

        if (restaurantsRes.ok) {
          const r = await restaurantsRes.json();
          const raw: any[] = Array.isArray(r.data) ? r.data : [];
          restaurantsData = raw.map((x: any) => ({
            id: x.id,
            name: x.name,
            imageUrl: x.image,
            bannerImage: x.bannerImage,
            cuisineTypes: x.cuisineTypes,
            rating: x.rating,
            estimatedDeliveryTime: x.deliveryTime,
            distanceKm: x.distance,
            minimumOrderAmount: x.minimumOrderAmount,
            isOpen: x.isOpen,
            featuredItems: Array.isArray(x.featuredItems)
              ? x.featuredItems
              : [],
          }));

          // Show all restaurants in the selected location
          const filteredRestaurants = restaurantsData;

          // Always update UI state; skip only the loading spinner for background refresh
          setPopularRestaurants(filteredRestaurants);
        }
      }

      // Featured dishes come directly from the location-based API response
      if (restaurantsData.length > 0) {
        const allowedRestaurantIds = new Set(
          restaurantsData.map((r: any) => r.id)
        );
        dishesData = restaurantsData.flatMap((r: any) => {
          const items = Array.isArray(r.featuredItems) ? r.featuredItems : [];
          return items.map((it: any) => ({
            id: it.id,
            name: it.name,
            image: it.image || '/images/dish-placeholder.svg',
            price: it.price,
            originalPrice: it.originalPrice,
            restaurant: r.name,
            restaurantId: r.id,
            dietaryTags: it.dietaryTags || [],
            stockLeft: typeof it.stockLeft === 'number' ? it.stockLeft : null,
            soldOut: it.soldOut === true,
            distanceText: undefined, // No distance for location-based filtering
            preparationTime: it.preparationTime,
            description: it.description,
          }));
        });
        // Popular Foods should show FEATURED items only
        dishesData = dishesData.filter((d: any) =>
          allowedRestaurantIds.has(d.restaurantId)
        );
        // Always update dishes in state
        setPopularDishes(dishesData);
      } else {
        // No restaurants in selected location, so no dishes either
        dishesData = [];
        setPopularDishes([]);
      }

      // Cache the results for future use (using locationId-based caching)
      if (locationId) {
        // Use dummy coordinates for caching since we're using locationId-based data
        const location = { latitude: 0, longitude: 0 };
        setCachedDishes(dishesData, location);
        setCachedRestaurants(restaurantsData, location);
      }
    } catch (e) {
      console.error(e);
      if (!backgroundRefresh) {
        toast.error('Failed to load home content');
      }
    } finally {
      if (!backgroundRefresh) {
        setPopularLoading(false);
        // Hide splash screen when this section loads
        await hideSplashWhenReady();
      }
    }
  };

  // Debounced search function
  const debouncedSearch = useMemo(() => {
    let timeoutId: NodeJS.Timeout;
    return (query: string) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        performInlineSearch(query);
      }, 300); // 300ms debounce
    };
  }, [locationId]);

  const performInlineSearch = async (query: string) => {
    const trimmed = query.trim();
    setSearchQuery(trimmed);
    if (!trimmed) {
      setDishResults([]);
      setRestaurantResults([]);
      return;
    }
    if (!locationId) {
      toast.error('Location is required for search. Please select a location.');
      return;
    }
    try {
      setSearchLoading(true);
      const res = await fetch(
        `/api/restaurants/search?query=${encodeURIComponent(trimmed)}&locationId=${locationId}${vegOnly ? '&veg=1' : ''}`
      );
      const data = await res.json();
      if (!res.ok || !data?.success) throw new Error('Search failed');

      // Map restaurants to RestaurantSummary
      const mappedRestaurants: RestaurantSummary[] = (
        data.data.restaurants || []
      ).map((r: any) => ({
        id: r.id,
        name: r.name,
        address: r.address,
        imageUrl: r.imageUrl,
        bannerImage: undefined,
        cuisineTypes: r.cuisineTypes,
        rating: r.rating,
        estimatedDeliveryTime: r.averagePreparationTime ?? null,
        distanceKm: r.distance ?? null,
        minimumOrderAmount: r.minimumOrderAmount ?? null,
        // Derive isOpen from status when available
        isOpen:
          typeof r.isOpen === 'boolean'
            ? r.isOpen
            : String(r.status || '')
                .toUpperCase()
                .trim() === 'ACTIVE',
        featuredItems: Array.isArray(r.featuredItems)
          ? r.featuredItems.map((it: any) => ({
              name: it.name,
              price: it.price,
              image: it.imageUrl || '/images/dish-placeholder.svg',
            }))
          : [],
      }));
      setRestaurantResults(mappedRestaurants);

      // Extract matching dishes from restaurants.menuItems
      const lowered = trimmed.toLowerCase();
      const items: Dish[] = [];
      for (const r of data.data.restaurants || []) {
        for (const it of r.menuItems || []) {
          const matches =
            (it.name || '').toLowerCase().includes(lowered) ||
            (it.description || '').toLowerCase().includes(lowered) ||
            (it.category || '').toLowerCase().includes(lowered);
          if (matches) {
            const isVeg = Array.isArray(it.dietaryTags)
              ? it.dietaryTags.includes('Veg')
              : false;

            // Skip non-vegetarian items when veg mode is on
            if (vegOnly && !isVeg) {
              return;
            }

            const dish: Dish = {
              id: it.id,
              name: it.name,
              image: it.imageUrl || '/images/dish-placeholder.svg',
              price: it.price,
              originalPrice: it.originalPrice ?? undefined,
              rating: 0,
              preparationTime: it.preparationTime ?? 15,
              restaurant: r.name,
              category: it.category || '',
              isVegetarian: isVeg,
              spiceLevel: (it.spiceLevel as any) || 'mild',
              description:
                it.description ||
                `Delicious ${it.name}, perfect for snacking or as a side dish.`,
              dietaryTags: it.dietaryTags || [],
              restaurantId: r.id,
              stockLeft: typeof it.stockLeft === 'number' ? it.stockLeft : null,
            };
            items.push(dish);
          }
        }
      }
      setDishResults(items);
    } catch (e) {
      console.error(e);
      toast.error('Failed to search restaurants');
      setDishResults([]);
      setRestaurantResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  // Moved loading/session guards below hooks to preserve hook order

  const handleAdd = (dish: Dish) => {
    toast.success(`${dish.name} added to cart!`);
  };

  const handleDealAdd = (deal: any) => {
    toast.success(`${deal.name} added to cart!`);
    // You can add cart logic here similar to other dishes
  };

  const handleHomeTap = () => {
    // Clear inline search state and reset header
    setSearchQuery('');
    setDishResults([]);
    setRestaurantResults([]);
    setHeaderResetSignal((v) => v + 1);
  };

  const openProduct = (dish: Dish) => {
    setSelectedDish(dish);
    setProductSheetOpen(true);
  };

  const addFromSheet = (dish: Dish, quantity: number) => {
    const maxStock = (dish as any).stockLeft;
    if (typeof maxStock === 'number' && maxStock >= 0 && quantity > maxStock) {
      toast.error(`Only ${maxStock} left in stock`);
      quantity = maxStock;
      if (maxStock === 0) return;
    }
    const byId = dish.restaurantId
      ? { id: dish.restaurantId, name: dish.restaurant }
      : undefined;
    const byName = !byId
      ? restaurantResults.find((r) => r.name === dish.restaurant)
      : undefined;
    const restaurant = byId
      ? byId
      : byName
        ? { id: byName.id, name: byName.name }
        : ({
            id: `rest-${slugify(dish.restaurant)}`,
            name: dish.restaurant,
          } as any);
    const cartItem = {
      menuItemId: dish.id,
      menuItem: {
        id: dish.id,
        name: dish.name,
        price: dish.price,
        imageUrl: dish.image,
        originalPrice: dish.originalPrice,
        stockLeft: (dish as any).stockLeft,
      },
      quantity,
      subtotal: dish.price * quantity,
    } as any;
    addItem(cartItem, restaurant);
    toast.success(`Added ${quantity} × ${dish.name} to cart`);
    setProductSheetOpen(false);
  };

  // Local fast-filtered views for instant veg toggle without waiting for network
  const isVegDish = (d: Dish) =>
    Array.isArray(d.dietaryTags)
      ? d.dietaryTags.includes('Veg')
      : !!d.isVegetarian;

  const visiblePopularDishes = useMemo(() => {
    if (!vegOnly) return popularDishes;
    return popularDishes.filter(isVegDish);
  }, [vegOnly, popularDishes]);

  const visibleNearbySections = useMemo(() => {
    if (!vegOnly) return nearbyDishesSections;
    return nearbyDishesSections.map((sec) => sec.filter(isVegDish));
  }, [vegOnly, nearbyDishesSections]);

  // Show location modal only if no location is set AND user just signed up
  // Check if this is the first time after signup
  const [showLocationModalAfterSignup, setShowLocationModalAfterSignup] =
    useState(false);

  useEffect(() => {
    if (status === 'authenticated' && !locationId) {
      // Check if user just signed up (you can add more sophisticated logic here)
      const hasSeenLocationModal = localStorage.getItem(
        'aasta_location_modal_seen'
      );
      if (!hasSeenLocationModal) {
        setShowLocationModalAfterSignup(true);
        localStorage.setItem('aasta_location_modal_seen', 'true');
      }
    }
  }, [status, locationId]);

  // Early return rendering (after all hooks) to avoid hook-order changes
  if (status === 'loading' || !session) {
    return <div className="min-h-screen" />;
  }

  if (showLocationModalAfterSignup) {
    return (
      <div className="min-h-screen bg-[#d3fb6b]">
        <LocationOnboarding
          isModal={true}
          onClose={() => setShowLocationModalAfterSignup(false)}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#d3fb6b]">
      {/* Location Change Loader */}
      {showLocationChangeLoader && <LocationChangeLoader />}

      {/* Veg Mode Loader */}
      <VegModeLoader
        isVisible={showVegModeLoader}
        isEntering={isEnteringVegMode}
      />

      {/* Location Modal - Manual trigger */}
      {showLocationModal && (
        <div className="fixed inset-0 z-[9999]">
          <LocationOnboarding
            isModal={true}
            onClose={() => setShowLocationModal(false)}
          />
        </div>
      )}
      {/* Full-screen onboarding handles location; fallback UI kept for legacy */}
      {/* {showLocationPrompt && (
        <LocationPrompt
          onLocationShared={(location) => {
            setLocation(location.lat, location.lng);
            setSelectedLocationLabel('Current Location');
            setShowLocationPrompt(false);
            try {
              localStorage.setItem('aasta_location_prompt_shown_v1', '1');
            } catch {}
            loadPopularContent();
          }}
          onDismiss={() => setShowLocationPrompt(false)}
        />
      )} */}

      <HomeHeader
        locationLabel={locationName || 'Select location'}
        onLocationClick={() => setShowLocationModal(true)}
        onSearch={(q) => debouncedSearch(q)}
        onDishSelect={(m) => {
          // Map suggestion item to Dish and open modal inline without navigating
          const dish: Dish = {
            id: m.id,
            name: m.name,
            image: m.imageUrl || '/images/dish-placeholder.svg',
            price: m.price,
            originalPrice: undefined,
            rating: 0,
            preparationTime: 20,
            restaurant: m.restaurant.name,
            category: m.category || 'General',
            isVegetarian: false,
            spiceLevel: 'mild' as any,
            description: '',
            dietaryTags: [],
          } as any;
          openProduct(dish);
        }}
        onFilterClick={() => router.push('/search')}
        onCartClick={() => router.push('/cart')}
        onProfileClick={() => router.push('/profile')}
        onRefresh={refreshData}
        className="z-10"
        resetSignal={headerResetSignal}
      />

      {/* Removed AddressSheet - we only use location modal */}

      {/* Curved Marquee for Offers
      <div className="relative -mt-4">
        <CurvedMarquee 
          messages={[
            '🎉 50% OFF on your first order!',
            '🚚 Free delivery on orders above ₹299',
            '⚡ 20 min delivery guaranteed',
            '💸 Get ₹100 cashback on weekend orders',
            '🔥 Hot deals this weekend only!',
            '🍕 Pizza starting at just ₹199',
            '🎁 Special offers for new users'
          ]}
          speed={25}
          className=""
        />
      </div> */}

      {/* Pull-to-refresh indicator */}
      {/* {isPullRefreshing && (
        <div className="fixed top-20 left-1/2 z-50 -translate-x-1/2 rounded-full bg-black/80 px-4 py-2 text-white">
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
            <span className="text-sm">Refreshing...</span>
          </div>
        </div>
      )} */}

      {/* Inline Search Results or Popular Sections */}
      <div className="rounded-t-[75px] bg-white px-6 pt-8 pb-28 shadow-[inset_0_12px_18px_-10px_rgba(0,0,0,0.20)]">
        {searchQuery ? (
          <>
            {/* Dishes */}
            <div className="mt-10 mb-6">
              <div className="mb-3 flex items-center justify-between">
                <h2 className={`z-20 text-[24px] font-semibold`}>
                  Food matched "{searchQuery}"
                </h2>
              </div>
              {searchLoading && dishResults.length === 0 ? (
                <div className="grid grid-cols-2 gap-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-48 animate-pulse rounded-2xl bg-gray-100"
                    />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {dishResults.map((dish) => (
                    <HomeProductCard
                      key={dish.id}
                      dish={dish}
                      onAdd={handleAdd}
                      onClick={openProduct}
                      restaurantContext={
                        dish.restaurantId
                          ? { id: dish.restaurantId, name: dish.restaurant }
                          : restaurantResults.find(
                                (r) => r.name === dish.restaurant
                              )
                            ? {
                                id: (
                                  restaurantResults.find(
                                    (r) => r.name === dish.restaurant
                                  ) as any
                                ).id,
                                name: dish.restaurant,
                              }
                            : undefined
                      }
                    />
                  ))}
                  {dishResults.length === 0 && (
                    <div className="col-span-2 flex flex-col items-center justify-center py-8 text-center">
                      <div className="mb-3 rounded-full bg-gray-100 p-3">
                        <svg
                          className="h-8 w-8 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                          />
                        </svg>
                      </div>
                      <h3 className="mb-1 text-base font-medium text-gray-900">
                        No dishes found
                      </h3>
                      <p className="text-sm text-gray-600">
                        Try searching for different foods or check your
                        spelling.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Restaurants */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className={`pt-10 text-[24px] font-semibold`}>
                  Restaurants matched "{searchQuery}"
                </h2>
              </div>
              {searchLoading && restaurantResults.length === 0 ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-44 animate-pulse rounded-3xl bg-gray-100"
                    />
                  ))}
                </div>
              ) : (
                <div className="space-y-20">
                  {restaurantResults.map((r) => (
                    <RestaurantCard
                      key={r.id}
                      restaurant={r}
                      href={`/restaurants/${r.id}`}
                    />
                  ))}
                  {restaurantResults.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <div className="mb-3 rounded-full bg-gray-100 p-3">
                        <svg
                          className="h-8 w-8 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                          />
                        </svg>
                      </div>
                      <h3 className="mb-1 text-base font-medium text-gray-900">
                        No restaurants found
                      </h3>
                      <p className="text-sm text-gray-600">
                        Try searching for different restaurant names or
                        cuisines.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            {/* Popular foods */}
            <div className="relative min-h-screen w-full bg-transparent">
              {/* Emerald Glow Background */}
              {/* <div
                className="absolute inset-0"
                style={{
                  backgroundImage: `
                    radial-gradient(125% 125% at 50% 90%, #ffffff 40%, #10b981 100%)
                  `,
                  backgroundSize: '100% 100%',
                }}
              /> */}

              <div className="relative mb-4 flex justify-end">
                <h2
                  className={`font-dela relative z-20 -mt-14 text-2xl font-semibold`}
                  // style={{ letterSpacing: '-0.08em' }}
                >
                  Popular foods
                  <span className="ml-1 text-[80px] text-[#fd6923]">.</span>
                  {/* Background image */}
                  <div
                    className="absolute top-8 right-5 -z-10 h-24 w-24 bg-cover bg-center bg-no-repeat"
                    style={{ backgroundImage: "url('/highlighter.png')" }}
                  ></div>
                </h2>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {popularLoading &&
                  popularDishes.length === 0 &&
                  Array.from({ length: 4 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-48 animate-pulse rounded-2xl bg-gray-100"
                    />
                  ))}
                {visiblePopularDishes.length > 0
                  ? visiblePopularDishes.map((dish) => (
                      <HomeProductCard
                        key={dish.id}
                        dish={dish as Dish}
                        onAdd={handleAdd}
                        onClick={openProduct}
                        restaurantContext={
                          (dish as Dish).restaurantId
                            ? {
                                id: (dish as Dish).restaurantId!,
                                name: (dish as Dish).restaurant,
                              }
                            : undefined
                        }
                      />
                    ))
                  : !popularLoading &&
                    popularDishes.length === 0 && (
                      <div className="col-span-2 flex flex-col items-center justify-center py-12 text-center">
                        <div className="mb-4 rounded-full bg-gray-100 p-4">
                          <svg
                            className="h-12 w-12 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 5.477 9.246 5 7.5 5s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                            />
                          </svg>
                        </div>
                        <h3 className="mb-2 text-lg font-semibold text-gray-900">
                          No trending FoodHacks here (yet).
                        </h3>
                        <p className="mb-4 max-w-sm text-sm text-gray-600">
                          Couldn’t spot any popular Food Hack nearby. Try
                          searching for your favorites or update your location
                          for more options.
                        </p>
                        <button
                          onClick={() =>
                            router.push('/onboarding/location?reselect=1')
                          }
                          className="rounded-full bg-black px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-gray-800"
                        >
                          Update Location
                        </button>
                      </div>
                    )}
              </div>
            </div>

            {/* Recently ordered - only show if there are recent dishes */}
            {recentDishes.length > 0 && (
              <div className="relative mt-10">
                <div className="relative mb-3 flex items-center justify-end">
                  <h2 className="font-dela relative z-20 text-2xl font-semibold">
                    Recently ordered
                    <span className="ml-1 text-[80px] text-[#fd6923]">.</span>
                    <span
                      className="absolute top-8 right-5 -z-10 h-24 w-32 bg-cover bg-center bg-no-repeat"
                      style={{ backgroundImage: "url('/highlighter.png')" }}
                    />
                  </h2>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {recentDishes.slice(0, 4).map((dish, idx) => (
                    <HomeProductCard
                      key={`recent-${dish.id}-${idx}`}
                      dish={dish}
                      onAdd={handleAdd}
                      onClick={openProduct}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Show loading state only when loading and no dishes yet */}
            {recentLoading && recentDishes.length === 0 && (
              <div className="relative mt-10">
                <div className="grid grid-cols-2 gap-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-48 animate-pulse rounded-2xl bg-gray-100"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Hack of the Day Section */}
            {hacksOfTheDay.length > 0 && (
              <div className="mt-8">
                {/* <div className="-mb-10 relative flex items-center justify-end">
                  <h2
                    className={`${brandFont.className} font-brand relative z-20 text-[70px] font-semibold`}
                    style={{ letterSpacing: '-0.08em' }}
                  >
                    Our Recommendations
                    <span className="ml-1 text-[80px] text-[#fd6923]">.</span>
                    <span
                      className="absolute inset-0 -z-10 mt-7 ml-24 bg-contain bg-center bg-no-repeat"
                      style={{ backgroundImage: "url('/highlighter.png')" }}
                    />
                  </h2>
                </div> */}
                {hacksLoading ? (
                  <div className="flex gap-4 overflow-x-auto pb-4">
                    {Array.from({ length: 2 }).map((_, i) => (
                      <div
                        key={i}
                        className="h-64 min-w-[320px] flex-shrink-0 animate-pulse rounded-3xl bg-gray-800/20"
                      />
                    ))}
                  </div>
                ) : (
                  <HackOfTheDay
                    deals={hacksOfTheDay}
                    onAdd={handleDealAdd}
                    className=""
                  />
                )}
              </div>
            )}

            {/* Nearby Products (Non-featured, within 5km) - three deduped vertical carousels */}
            <div className="mt-6 space-y-6">
              <div className="relative mb-3 flex items-center justify-end">
                <h2 className="font-dela relative z-20 text-2xl font-semibold">
                  Nearby foods
                  <span className="ml-1 text-[80px] text-[#fd6923]">.</span>
                  <span
                    className="absolute top-8 right-5 -z-10 h-24 w-24 bg-cover bg-center bg-no-repeat"
                    style={{ backgroundImage: "url('/highlighter.png')" }}
                  />
                </h2>
              </div>
              {nearbyDishesLoading &&
                visibleNearbySections.flat().length === 0 && (
                  <div className="flex gap-8 overflow-x-auto pb-2">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div
                        key={i}
                        className="h-60 min-w-[192px] animate-pulse rounded-2xl bg-gray-100"
                      />
                    ))}
                  </div>
                )}
              {visibleNearbySections.map((section, idx) =>
                section.length > 0 ? (
                  <div
                    key={idx}
                    className={
                      vegToggleAnimating
                        ? 'gap-8 opacity-90 transition-opacity duration-200'
                        : 'gap-8'
                    }
                  >
                    <HomeProductCardList
                      dishes={section}
                      onAdd={handleAdd}
                      onClick={openProduct}
                      showDistance
                    />
                  </div>
                ) : null
              )}
            </div>

            {/* Restaurants list */}
            <div className="space-y-1 pt-6">
              <div className="relative flex items-center justify-end">
                {/* <span
                  className="pointer-events-none absolute -right-64 top-2 -translate-x-1/2 z-0 mt-8 ml-24 h-[80px] w-[290px] bg-contain bg-center bg-no-repeat"
                  style={{ backgroundImage: "url('/highlighter.png')" }}
                  aria-hidden="true"
                /> */}
                <h2
                  className="font-dela relative z-10 text-2xl font-semibold"
                >
                  Restaurants for you
                  <span className="ml-1 text-[80px] text-[#fd6923]">.</span>
                  <span
                    className="absolute top-8 right-5 -z-10 h-24 w-24 bg-cover bg-center bg-no-repeat"
                    style={{ backgroundImage: "url('/highlighter.png')" }}
                  />
                </h2>
              </div>

              {popularLoading && popularRestaurants.length === 0 ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-44 animate-pulse rounded-3xl bg-gray-100"
                    />
                  ))}
                </div>
              ) : popularRestaurants.length > 0 ? (
                popularRestaurants.map((r) => (
                  <div key={r.id} className="mb-8">
                    <RestaurantCard
                      restaurant={r}
                      href={`/restaurants/${r.id}`}
                    />
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-0 text-center">
                  <div className="mb-4 rounded-full bg-gray-100 p-4">
                    <svg
                      className="h-12 w-12 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                      />
                    </svg>
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-gray-900">
                    No kitchens around you.
                  </h3>
                  <p className="mb-4 max-w-sm text-sm text-gray-600">
                    We couldn’t find any restaurants within 5 km. Try updating
                    your location to explore more.
                  </p>
                  <button
                    onClick={() =>
                      router.push('/onboarding/location?reselect=1')
                    }
                    className="rounded-full bg-black px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-gray-800"
                  >
                    Update Location
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Food Hacks Promotional Section */}
      <div className="bg-white">
        <FoodHacksPromo />
      </div>

      <ProductBottomSheet
        open={productSheetOpen}
        dish={selectedDish}
        onOpenChange={setProductSheetOpen}
        onAdd={addFromSheet}
      />

      {/* Cart Bottom Navigation - Only shows when cart has items */}
      <CartBottomNav
        cartItemCount={cartItemCount}
        cartTotal={cart?.total || 0}
      />
    </div>
  );
}
