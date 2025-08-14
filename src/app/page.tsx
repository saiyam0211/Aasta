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
import { HomeProductCard } from '@/components/ui/home-product-card';
import { MobileBottomNav } from '@/components/ui/mobile-bottom-nav';
import { CheckCircle } from 'lucide-react';
import type { Dish } from '@/types/dish';
import {
  RestaurantCard,
  type RestaurantSummary,
} from '@/components/ui/restaurant-card';
import { ProductBottomSheet } from '@/components/ui/ProductBottomSheet';
import { useCartStore } from '@/lib/store';

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

  const [showLocationPrompt, setShowLocationPrompt] = useState(false);
  const [selectedLocationLabel, setSelectedLocationLabel] =
    useState('New York City');
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

  const cartItemCount =
    cart?.items.reduce((total, item) => total + item.quantity, 0) || 0;

  const slugify = (input: string) =>
    input
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

  // Resolve human-readable address when coordinates are present
  useEffect(() => {
    const resolveAddress = async () => {
      if (!latitude || !longitude) return;
      try {
        const res = await fetch(
          `/api/geocode/reverse?lat=${latitude}&lng=${longitude}`
        );
        if (res.ok) {
          const data = await res.json();
          if (data?.success && data?.data?.address) {
            setSelectedLocationLabel(data.data.address);
          }
        }
      } catch (e) {
        console.error('Reverse geocode failed', e);
      }
    };
    resolveAddress();
  }, [latitude, longitude]);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/auth/signin');
      return;
    }

    if (!latitude || !longitude) setShowLocationPrompt(true);
    // Load popular content on initial mount
    loadPopularContent();
  }, [session, status]);

  const loadPopularContent = async () => {
    try {
      setPopularLoading(true);
      const [dishesRes, restaurantsRes] = await Promise.all([
        fetch(
          `/api/featured-dishes?limit=8${latitude && longitude ? `&lat=${latitude}&lng=${longitude}` : ''}`
        ),
        latitude && longitude
          ? fetch(
              `/api/nearby-restaurants?latitude=${latitude}&longitude=${longitude}&radius=5&limit=8`
            )
          : Promise.resolve(
              new Response(JSON.stringify({ success: true, data: [] }))
            ),
      ]);

      if (dishesRes.ok) {
        const dishesData = await dishesRes.json();
        setPopularDishes(dishesData.data || []);
      }

      if (restaurantsRes.ok) {
        const r = await restaurantsRes.json();
        const mapped: RestaurantSummary[] = (r.data || []).map((x: any) => ({
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
          featuredItems: Array.isArray(x.featuredItems) ? x.featuredItems : [],
        }));
        setPopularRestaurants(mapped);
      }
    } catch (e) {
      console.error(e);
      toast.error('Failed to load home content');
    } finally {
      setPopularLoading(false);
    }
  };

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
              ? it.dietaryTags.some((t: string) =>
                  /veg(an|etarian)?/i.test(t)
                ) &&
                !it.dietaryTags.some((t: string) => /non[-\s]?veg/i.test(t))
              : false;
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
    <div className="min-h-screen bg-white">
      {showLocationPrompt && (
        <LocationPrompt
          onLocationShared={(location) => {
            setLocation(location.lat, location.lng);
            setSelectedLocationLabel('Current Location');
            setShowLocationPrompt(false);
            loadPopularContent();
          }}
          onDismiss={() => setShowLocationPrompt(false)}
        />
      )}

      <HomeHeader
        locationLabel={selectedLocationLabel}
        onLocationClick={() => setShowLocationPrompt(true)}
        onSearch={(q) => performInlineSearch(q)}
        onFilterClick={() => router.push('/search')}
        onCartClick={() => router.push('/cart')}
        onProfileClick={() => router.push('/profile')}
        className="z-10"
        resetSignal={headerResetSignal}
      />

      {/* Inline Search Results or Popular Sections */}
      <div className="px-4 pt-8 pb-28">
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
                    <div className="col-span-2 text-sm text-gray-500">
                      No dishes matched.
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
                <div className="space-y-4">
                  {restaurantResults.map((r) => (
                    <RestaurantCard
                      key={r.id}
                      restaurant={r}
                      href={`/restaurants/${r.id}`}
                    />
                  ))}
                  {restaurantResults.length === 0 && (
                    <div className="text-sm text-gray-500">
                      No restaurants matched.
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            {/* Popular foods */}
            <div className="">
              <div className="mb-3 flex items-center justify-end">
                <h2
                  className={`${brandFont.className} font-brand z-20 text-[70px] font-semibold`}
                  style={{ letterSpacing: '-0.08em' }}
                >
                  Popular foods
                  <span className="ml-1 text-[80px] text-[#fd6923]">.</span>
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
                {popularDishes.map((dish) => (
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
                ))}
              </div>
            </div>

            {/* Restaurants list */}
            <div className="space-y-4 pt-6">
              <div className="flex items-center justify-end">
                <h2
                  className={`${brandFont.className} font-brand text-[70px] font-semibold`}
                  style={{ letterSpacing: '-0.08em' }}
                >
                  Restaurants
                  <span className="ml-1 text-[80px] text-[#fd6923]">.</span>
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
              ) : (
                <>
                  {popularRestaurants.map((r) => (
                    <RestaurantCard
                      key={r.id}
                      restaurant={r}
                      href={`/restaurants/${r.id}`}
                    />
                  ))}
                </>
              )}
            </div>
          </>
        )}
      </div>

      <ProductBottomSheet
        open={productSheetOpen}
        dish={selectedDish}
        onOpenChange={setProductSheetOpen}
        onAdd={addFromSheet}
      />

      <MobileBottomNav
        onHomeClick={handleHomeTap}
        cartItemCount={cartItemCount}
      />
    </div>
  );
}
