'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import localFont from 'next/font/local';
import { useEffect, useMemo, useState } from 'react';
import { LocationPrompt } from '@/components/LocationPrompt';
import { useLocationStore } from '@/hooks/useLocation';
import { toast } from 'sonner';
import { usePWA } from '@/hooks/usePWA';
import { HomeHeader } from '@/components/ui/home-header';
import AddressSheet from '@/components/ui/AddressSheet';
import { HomeProductCard } from '@/components/ui/home-product-card';
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
  const { isInstalled } = usePWA();
  const { latitude, longitude, setLocation } = useLocationStore();
  const { cart, addItem } = useCartStore();
  const { vegOnly } = useVegMode();
  const {
    setRestaurants: setCachedRestaurants,
    setDishes: setCachedDishes,
    isCacheValid,
    getCachedRestaurants,
    getCachedDishes,
    invalidateCache,
  } = useCacheStore();

  const [showLocationPrompt, setShowLocationPrompt] = useState(false);
  const [addressSheetOpen, setAddressSheetOpen] = useState(false);
  const [selectedLocationLabel, setSelectedLocationLabel] =
    useState('Using live location');
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
  const [popularLoading, setPopularLoading] = useState(false);
  // Header reset signal for clearing input when Home is tapped
  const [headerResetSignal, setHeaderResetSignal] = useState(0);
  // Product sheet state
  const [selectedDish, setSelectedDish] = useState<Dish | null>(null);
  const [productSheetOpen, setProductSheetOpen] = useState(false);
  // State for hack of the day items
  const [hacksOfTheDay, setHacksOfTheDay] = useState<any[]>([]);
  const [hacksLoading, setHacksLoading] = useState(false);
  // const [isPullRefreshing, setIsPullRefreshing] = useState(false);

  const cartItemCount =
    cart?.items.reduce((total, item) => total + item.quantity, 0) || 0;

  // Show location prompt only once after first sign-in; otherwise prefer AddressSheet input
  useEffect(() => {
    if (status !== 'authenticated') return;
    const hasCoords = typeof latitude === 'number' && typeof longitude === 'number';
    const shownKey = 'aasta_location_prompt_shown_v1';
    const alreadyShown = (() => {
      try {
        return localStorage.getItem(shownKey) === '1';
      } catch {
        return true; // default to hidden if storage blocked
      }
    })();

    if (!hasCoords) {
      if (!alreadyShown) {
        setShowLocationPrompt(true);
      } else {
        // Skip the legacy prompt, focus user on address entry instead
        setAddressSheetOpen(true);
      }
    }
  }, [status]);

  const slugify = (input: string) =>
    input
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

  // Function to refresh data (can be called from header)
  const refreshData = async () => {
    // setIsPullRefreshing(true);
    try {
      await loadPopularContent();
      await loadHacksOfTheDay();
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

  // Resolve human-readable address when coordinates are present and no saved address chosen
  useEffect(() => {
    const resolveAddress = async () => {
      if (!latitude || !longitude) return;
      
      // Check if user has saved addresses first
      try {
        const res = await fetch('/api/user/address');
        if (res.ok) {
          const data = await res.json();
          const addresses = Array.isArray(data?.addresses) ? data.addresses : [];
          const hasSavedAddresses = addresses.length > 0;
          
          // Only use reverse geocoding if no saved addresses
          if (!hasSavedAddresses) {
            const geoRes = await fetch(
              `/api/geocode/reverse?lat=${latitude}&lng=${longitude}`
            );
            if (geoRes.ok) {
              const geoData = await geoRes.json();
              if (geoData?.success && geoData?.data?.address) {
                // Truncate to first 50 words
                const words = geoData.data.address.split(/\s+/);
                const truncated =
                  words.length > 50 ? words.slice(0, 50).join(' ') + '…' : geoData.data.address;
                setSelectedLocationLabel(truncated);
              }
            }
          }
        }
      } catch (e) {
        console.error('Address resolution failed', e);
      }
    };
    resolveAddress();
  }, [latitude, longitude]);

  // On load, try to fetch user's saved addresses and use default if present
  useEffect(() => {
    const loadDefaultAddress = async () => {
      try {
        const res = await fetch('/api/user/address');
        if (!res.ok) return;
        const data = await res.json();
        const addresses = Array.isArray(data?.addresses) ? data.addresses : [];
        const def = addresses.find((a: any) => a.isDefault) || addresses[0];
        if (def) {
          const summary = [
            def.houseNumber,
            def.locality,
            def.street,
          ]
            .filter(Boolean)
            .join(', ');
          setSelectedLocationLabel(summary || 'Saved address');
          // If saved address has coordinates, set them so listings use it
          if (typeof def.latitude === 'number' && typeof def.longitude === 'number') {
            setLocation(def.latitude, def.longitude);
          }
        } else {
          setSelectedLocationLabel('Using live location');
        }
      } catch (error) {
        console.error('Error loading default address:', error);
      }
    };
    loadDefaultAddress();
  }, []);

  // Invalidate cache when location changes significantly
  useEffect(() => {
    if (latitude && longitude) {
      invalidateCache({ latitude, longitude });
    }
  }, [latitude, longitude, invalidateCache]);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/auth/signin');
      return;
    }

    // If user has not shared location yet, go to full-screen onboarding
    if (!latitude || !longitude) {
      router.replace('/onboarding/location');
      return;
    }

    // Check cache first for instant loading
    const location = { latitude, longitude };
    const cachedRestaurants = getCachedRestaurants(location);
    const cachedDishes = getCachedDishes(location);

    if (cachedRestaurants && cachedDishes) {
      // Use cached data immediately for instant loading
      setPopularRestaurants(cachedRestaurants);
      setPopularDishes(cachedDishes);
      setPopularLoading(false);

      // Refresh in background if cache is stale
      if (!isCacheValid(location)) {
        loadPopularContent(true); // true = background refresh
      }
    } else {
      // No cache available, load fresh data
      loadPopularContent();
    }
    
    // Load hack of the day items
    loadHacksOfTheDay();
  }, [session, status, latitude, longitude]);

  // Handle veg mode changes - force refresh
  useEffect(() => {
    if (status !== 'authenticated') return;
    
    // Clear cache and reload when veg mode changes
    if (latitude && longitude) {
      invalidateCache({ latitude, longitude });
      loadPopularContent();
      loadHacksOfTheDay();
    }
  }, [vegOnly, latitude, longitude, invalidateCache]);

  const loadHacksOfTheDay = async () => {
    if (!latitude || !longitude) return;
    
    try {
      setHacksLoading(true);
      const hacksRes = await fetch(
        `/api/hack-of-the-day?lat=${latitude}&lng=${longitude}&radius=5${vegOnly ? '&veg=1' : ''}`
      );

      if (hacksRes.ok) {
        const hacksData = await hacksRes.json();
        setHacksOfTheDay(hacksData.data || []);
        console.log('Loaded hack of the day items:', hacksData.data?.length || 0);
      } else {
        const errorData = await hacksRes.json().catch(() => ({ error: 'Unknown error' }));
        console.error('Failed to fetch hack of the day:', hacksRes.status, errorData);
        setHacksOfTheDay([]);
      }
    } catch (error) {
      console.error('Error fetching hack of the day items:', error);
      setHacksOfTheDay([]);
    } finally {
      setHacksLoading(false);
    }
  };

  const loadPopularContent = async (backgroundRefresh = false) => {
    try {
      if (!backgroundRefresh) {
        setPopularLoading(true);
      }

      // First get restaurants within 5km radius
      let restaurantsData: RestaurantSummary[] = [];
      let dishesData: any[] = [];

      if (latitude && longitude) {
        const restaurantsRes = await fetch(
          `/api/nearby-restaurants?latitude=${latitude}&longitude=${longitude}&radius=5&limit=8${vegOnly ? '&veg=1' : ''}`
        );

        if (restaurantsRes.ok) {
          const r = await restaurantsRes.json();
          restaurantsData = (r.data || []).map((x: any) => ({
            id: x.id,
            name: x.name,
            imageUrl: x.image, // API returns `image`
            bannerImage: x.bannerImageUrl, // if present
            cuisineTypes: x.cuisineTypes,
            rating: x.rating,
            estimatedDeliveryTime: x.deliveryTime, // API returns string like "25-35 min"
            distanceKm: x.distance,
            minimumOrderAmount: x.minimumOrderAmount,
            isOpen: x.isOpen,
            featuredItems: Array.isArray(x.featuredItems)
              ? x.featuredItems
              : [],
          }));

          // Filter restaurants when veg mode is on
          const filteredRestaurants = vegOnly 
            ? restaurantsData.filter(restaurant => {
                // Check if restaurant has any vegetarian items
                return restaurant.featuredItems?.some((item: any) => {
                  const isVeg = Array.isArray(item.dietaryTags)
                    ? item.dietaryTags.includes('Veg')
                    : item.isVegetarian;
                  return isVeg;
                });
              })
            : restaurantsData;

          if (!backgroundRefresh) {
            setPopularRestaurants(filteredRestaurants);
          }
        }
      }

      // Only get dishes if we have restaurants within 5km
      if (restaurantsData.length > 0) {
        const dishesRes = await fetch(
          `/api/featured-dishes?limit=8${latitude && longitude ? `&lat=${latitude}&lng=${longitude}&radius=5` : ''}${vegOnly ? '&veg=1' : ''}`
        );

        if (dishesRes.ok) {
          const dishesResponse = await dishesRes.json();
          dishesData = dishesResponse.data || [];
          if (!backgroundRefresh) {
            setPopularDishes(dishesData);
          }
        }
      } else {
        // No restaurants in 5km radius, so no dishes either
        dishesData = [];
        if (!backgroundRefresh) {
          setPopularDishes([]);
        }
      }

      // Cache the results for future use
      if (latitude && longitude) {
        const location = { latitude, longitude };
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
  }, [latitude, longitude]);

  const performInlineSearch = async (query: string) => {
    const trimmed = query.trim();
    setSearchQuery(trimmed);
    if (!trimmed) {
      setDishResults([]);
      setRestaurantResults([]);
      return;
    }
    if (!latitude || !longitude) {
      toast.error(
        'Location is required for search. Please enable location access.'
      );
      return;
    }
    try {
      setSearchLoading(true);
      const res = await fetch(
        `/api/restaurants/search?query=${encodeURIComponent(trimmed)}&latitude=${latitude}&longitude=${longitude}`
      );
      const data = await res.json();
      if (!res.ok || !data?.success) throw new Error('Search failed');

      // Map restaurants to RestaurantSummary
      const mappedRestaurants: RestaurantSummary[] = (
        data.data.restaurants || []
      ).map((r: any) => ({
        id: r.id,
        name: r.name,
        imageUrl: r.imageUrl,
        bannerImage: undefined,
        cuisineTypes: r.cuisineTypes,
        rating: r.rating,
        estimatedDeliveryTime: r.averagePreparationTime ?? null,
        distanceKm: r.distance ?? null,
        minimumOrderAmount: r.minimumOrderAmount ?? null,
        isOpen: r.isOpen,
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
              description: it.description || undefined,
              dietaryTags: it.dietaryTags || [],
              restaurantId: r.id,
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

  if (status === 'loading') return null;
  if (!session) return null;

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
      },
      quantity,
      subtotal: dish.price * quantity,
    } as any;
    addItem(cartItem, restaurant);
    toast.success(`Added ${quantity} × ${dish.name} to cart`);
    setProductSheetOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#d3fb6b]">
      {/* Full-screen onboarding handles location; fallback UI kept for legacy */}
      {showLocationPrompt && (
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
      )}

      <HomeHeader
        locationLabel={selectedLocationLabel}
        onLocationClick={() => setAddressSheetOpen(true)}
        onSearch={(q) => debouncedSearch(q)}
        onFilterClick={() => router.push('/search')}
        onCartClick={() => router.push('/cart')}
        onProfileClick={() => router.push('/profile')}
        onRefresh={refreshData}
        className="z-10"
        resetSignal={headerResetSignal}
      />

      <AddressSheet
        open={addressSheetOpen}
        onOpenChange={setAddressSheetOpen}
        onSelect={(addr) => {
          // If selection came from search suggestions, show `name, address` if available
          if (addr.id === 'search') {
            // Ensure the selected coordinates are set globally
            if (typeof addr.latitude === 'number' && typeof addr.longitude === 'number') {
              setLocation(addr.latitude!, addr.longitude!);
            }
            const name = (addr as any).locality ? String((addr as any).locality) : '';
            const full = [name, addr.street].filter(Boolean).join(', ');
            const words = full.split(/\s+/);
            const truncated = words.length > 50 ? words.slice(0, 50).join(' ') + '…' : full;
            setSelectedLocationLabel(truncated);
          } else if (addr.id !== 'live' && (addr.houseNumber || addr.locality || addr.street)) {
            // For saved addresses, show house no, locality, street area
            const summary = [addr.houseNumber, addr.locality, addr.street]
              .filter(Boolean)
              .join(', ');
            setSelectedLocationLabel(summary || 'Saved address');
          } else {
            // For live location, use the reverse-geocoded address with truncation
            const label = addr.street || 'Using live location';
            const words = String(label).split(/\s+/);
            const truncated = words.length > 50 ? words.slice(0, 50).join(' ') + '…' : String(label);
            setSelectedLocationLabel(truncated);
          }
          setAddressSheetOpen(false);
          // Trigger refresh based on new coordinates
          refreshData();
        }}
      />

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
      <div className="rounded-t-[70px] bg-white px-4 pt-8 pb-28">
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
            <div className="relative min-h-screen w-full bg-white">
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

              <div className="relative mb-3 flex items-center justify-end">
                <h2
                  className={`${brandFont.className} font-brand relative z-20 text-[70px] font-semibold`}
                  style={{ letterSpacing: '-0.08em' }}
                >
                  Popular foods
                  <span className="ml-1 text-[80px] text-[#fd6923]">.</span>
                  {/* Background image */}
                  <span
                    className="absolute inset-0 -z-10 mt-7 ml-24 bg-contain bg-center bg-no-repeat"
                    style={{ backgroundImage: "url('/highlighter.png')" }}
                  />
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
                {popularDishes.length > 0
                  ? popularDishes.map((dish) => (
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
                  : !popularLoading && (
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

            {/* Hack of the Day Section */}
            {(hacksLoading || hacksOfTheDay.length > 0) && (
              <div className="py-8">
                {hacksLoading ? (
                  <div className="flex gap-4 overflow-x-auto pb-4">
                    {Array.from({ length: 2 }).map((_, i) => (
                      <div
                        key={i}
                        className="min-w-[320px] h-64 animate-pulse rounded-3xl bg-gray-800/20 flex-shrink-0"
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

            {/* Restaurants list */}
            <div className="space-y-4 pt-6">
              <div className="flex items-center justify-end">
                <h2
                  className={`${brandFont.className} font-brand text-[70px] font-semibold`}
                  style={{ letterSpacing: '-0.08em' }}
                >
                  Restaurants
                  <span className="ml-1 text-[80px] text-[#fd6923]">.</span>
                  <span
                    className="absolute inset-0 -z-10 mt-7 ml-24 bg-contain bg-center bg-no-repeat"
                    style={{ backgroundImage: "url('/highlighter.png')" }}
                  />
                </h2>
              </div>
              {popularLoading ? (
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
                  <RestaurantCard
                    key={r.id}
                    restaurant={r}
                    href={`/restaurants/${r.id}`}
                  />
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
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
