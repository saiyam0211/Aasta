"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import localFont from "next/font/local";
import { useEffect, useMemo, useState } from "react";
import { LocationPrompt } from "@/components/LocationPrompt";
import { useLocationStore } from "@/hooks/useLocation";
import { toast } from "sonner";
import { usePWA } from "@/hooks/usePWA";
import { HomeHeader } from "@/components/ui/home-header";
import { HomeProductCard } from "@/components/ui/home-product-card";
import { MobileBottomNav } from "@/components/ui/mobile-bottom-nav";
import { CheckCircle } from "lucide-react";
import type { Dish } from "@/types/dish";
import { RestaurantCard, type RestaurantSummary } from "@/components/ui/restaurant-card";


const brandFont = localFont({
  src: [{ path: "../../public/fonts/Tanjambore_bysaiyam-Regular.ttf", weight: "400", style: "normal" }],
  variable: "--font-brand",
  display: "swap",
});
export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { isInstalled } = usePWA();
  const { latitude, longitude, setLocation } = useLocationStore();

  const [showLocationPrompt, setShowLocationPrompt] = useState(false);
  const [selectedLocationLabel, setSelectedLocationLabel] = useState("New York City");
  const [popularDishes, setPopularDishes] = useState<Dish[]>([]);
  const [restaurants, setRestaurants] = useState<RestaurantSummary[]>([]);
  const [loading, setLoading] = useState(true);

  // Resolve human-readable address when coordinates are present
  useEffect(() => {
    const resolveAddress = async () => {
      if (!latitude || !longitude) return;
      try {
        const res = await fetch(`/api/geocode/reverse?lat=${latitude}&lng=${longitude}`);
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
    if (status === "loading") return;
    if (!session) {
      router.push("/auth/signin");
      return;
    }

    if (!latitude || !longitude) setShowLocationPrompt(true);

    loadPageData();
  }, [session, status]);

  const loadPageData = async () => {
    try {
      setLoading(true);
      const [dishesRes, restaurantsRes] = await Promise.all([
        fetch(`/api/featured-dishes?limit=8${latitude && longitude ? `&lat=${latitude}&lng=${longitude}` : ''}`),
        latitude && longitude
          ? fetch(`/api/nearby-restaurants?latitude=${latitude}&longitude=${longitude}&radius=5&limit=8`)
          : Promise.resolve(new Response(JSON.stringify({ success: true, data: [] })))
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
        setRestaurants(mapped);
      }
    } catch (e) {
      console.error(e);
      toast.error('Failed to load home content');
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") return null;
  if (!session) return null;

  const handleAdd = (dish: Dish) => {
    toast.success(`${dish.name} added to cart!`);
  };

  return (
    <div className="min-h-screen bg-white">
      {showLocationPrompt && (
        <LocationPrompt
          onLocationShared={(location) => {
            setLocation(location.lat, location.lng);
            setSelectedLocationLabel("Current Location");
            setShowLocationPrompt(false);
            loadPageData();
          }}
          onDismiss={() => setShowLocationPrompt(false)}
        />
      )}

      {/* {isInstalled && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-3 mx-4 mt-3">
          <div className="flex items-center gap-2 text-green-800">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">App Installed Successfully</span>
          </div>
        </div>
      )} */}

      <HomeHeader
        locationLabel={selectedLocationLabel}
        onLocationClick={() => setShowLocationPrompt(true)}
        onSearch={(q) => router.push(`/restaurants?search=${encodeURIComponent(q)}`)}
        onFilterClick={() => router.push('/search')}
        onCartClick={() => router.push('/cart')}
        onProfileClick={() => router.push('/profile')}
        className="z-10"
      />

      {/* <div className="flex items-center justify-center -mt-10 z-20">
        <span
          className="inline-flex items-center font-semibold text-center"
          style={{
            color: "#B2BFB3",
            letterSpacing: "-0.08em",
            lineHeight: 1,
          }}
        >
          <span
            className="text-[100px] mr-2"
            style={{
              display: "inline-flex",
              alignItems: "center",
              height: "100px",
              verticalAlign: "middle",
            }}
          >
            <span
              style={{
                display: "inline-block",
                lineHeight: "100px",
                height: "120px",
                verticalAlign: "middle",
              }}
              className="align-middle"
            >
              #
            </span>
          </span>
          <span className={`${brandFont.className} text-[150px] leading-[100px]`} style={{letterSpacing: "-0.08em"}}>FoodHack</span>
        </span>
      </div> */}

      {/* Popular foods */}
      <div className="px-4 pt-4">
        <div className="flex items-center justify-between mb-3">
        <h2 className={`${brandFont.className} font-brand text-[70px] font-semibold`} style={{ letterSpacing: '-0.08em' }}>
          Popular foods
          <span className="ml-1 text-[80px] text-[#fd6923]">.</span></h2>
          <button className="text-sm text-gray-500" onClick={() => router.push('/restaurants')}>
            View all
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {popularDishes.map((dish) => (
            <HomeProductCard key={dish.id} dish={dish as Dish} onAdd={handleAdd} />
          ))}
        </div>
      </div>

      {/* Restaurants list */}
      <div className="px-4 pt-6 pb-28 space-y-4">
        <div className="flex items-center justify-between">
        <h2 className={`${brandFont.className} font-brand text-[70px] font-semibold`} style={{ letterSpacing: '-0.08em' }}>
            Restaurants
            <span className="ml-1 text-[80px] text-[#fd6923]">.</span>
            </h2>
          <button className="text-sm text-gray-500" onClick={() => router.push('/restaurants')}>
            View all
          </button>
        </div>
        {restaurants.map((r) => (
          <RestaurantCard key={r.id} restaurant={r} href={`/restaurants/${r.id}`} />
        ))}
      </div>

      <MobileBottomNav />
    </div>
  );
}
