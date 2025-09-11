'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import CustomerLayout from '@/components/layouts/customer-layout';
import {
  Star,
  Clock,
  MapPin,
  Share2,
  Phone,
  Heart,
  Plus,
  Minus,
  Info,
  ChefHat,
  ArrowLeft,
} from 'lucide-react';
import { useCartStore } from '@/lib/store';
import { toast } from 'sonner';
import localFont from 'next/font/local';
import { useLocationStore } from '@/hooks/useLocation';
import { googleMapsService } from '@/lib/google-maps';
import { ProductBottomSheet } from '@/components/ui/ProductBottomSheet';
import type { Dish } from '@/types/dish';
import { shareContent, generateRestaurantShareData } from '@/lib/share-utils';
import { HomeProductCard } from '@/components/ui/home-product-card';
import { HomeProductCardHorizontal } from '@/components/ui/home-product-card-horizontal';
import { HomeProductCardList } from '@/components/ui/home-product-card-vertical';
import AastaLoader from '@/components/ui/AastaLoader';

const brandFont = localFont({
  src: [
    {
      path: '../../../../public/fonts/Tanjambore_bysaiyam-Regular.ttf',
      weight: '400',
      style: 'normal',
    },
  ],
  variable: '--font-brand',
  display: 'swap',
});

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  preparationTime: number;
  imageUrl?: string;
  dietaryTags: string[];
  spiceLevel: string;
  available: boolean;
  featured: boolean;
}

interface RestaurantLocation {
  id?: string;
  name?: string;
  city?: string;
  state?: string;
  country?: string;
}

interface Restaurant {
  id: string;
  name: string;
  description: string;
  address: string;
  phone: string;
  cuisineTypes: string[];
  rating: number;
  reviewCount: number;
  averagePreparationTime: number;
  minimumOrderAmount: number;
  deliveryRadius: number;
  deliveryFee: number;
  status: string;
  location?: RestaurantLocation;
  locationId?: string;
  location_id?: string;
  locationName?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}

function VegMark({ isVegetarian }: { isVegetarian: boolean }) {
  return (
    <span
      className={`inline-flex h-4 w-4 items-center justify-center rounded-sm border-2 ${
        isVegetarian ? 'border-green-600 bg-white' : 'border-red-600 bg-white'
      }`}
    >
      <span
        className={`h-2 w-2 rounded-full ${isVegetarian ? 'bg-green-600' : 'bg-red-600'}`}
      />
    </span>
  );
}

export default function RestaurantDetailPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const params = useParams();
  const { addItem, updateQuantity, cart } = useCartStore();
  const { latitude, longitude } = useLocationStore();

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [featuredItems, setFeaturedItems] = useState<MenuItem[]>([]);
  const [otherItems, setOtherItems] = useState<MenuItem[]>([]);
  const [locationName, setLocationName] = useState<string>('');
  const [distanceText, setDistanceText] = useState<string | null>(null);

  // ProductBottomSheet state
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedDish, setSelectedDish] = useState<Dish | null>(null);

  useEffect(() => {
    const fetchRestaurantData = async () => {
      try {
        setIsLoading(true);
        const restaurantResponse = await fetch(
          `/api/restaurants/${params?.id}`
        );
        const restaurantData = await restaurantResponse.json();
        if (!restaurantResponse.ok || !restaurantData.success)
          throw new Error(restaurantData.error || 'Failed to fetch restaurant');

        const menuResponse = await fetch(
          `/api/menu-items?restaurantId=${params?.id}`
        );
        const menuData = await menuResponse.json();
        if (!menuResponse.ok || !menuData.success)
          throw new Error(menuData.error || 'Failed to fetch menu');

        const r: Restaurant = restaurantData.data;
        setRestaurant(r);

        const menuItems: MenuItem[] = menuData.data || [];
        setFeaturedItems(menuItems.filter((m) => m.featured));
        setOtherItems(menuItems.filter((m) => !m.featured));

        // Prefer API-provided flattened locationName
        const apiName = (r as any).locationName as string | null;
        const embeddedName = r?.location?.name || r?.location?.city;
        if (apiName) {
          setLocationName(apiName);
        } else if (embeddedName) {
          setLocationName(embeddedName);
        }
      } catch (error) {
        console.error('Error fetching restaurant data:', error);
        toast.error('Failed to load restaurant data');
      } finally {
        setIsLoading(false);
      }
    };
    if (params?.id) fetchRestaurantData();
  }, [params?.id]);

  // Compute distance using Google Maps Distance Matrix (with fallback)
  useEffect(() => {
    const run = async () => {
      if (!restaurant || !latitude || !longitude) return;
      const rLat = (restaurant as any).latitude as number | undefined;
      const rLng = (restaurant as any).longitude as number | undefined;
      if (typeof rLat !== 'number' || typeof rLng !== 'number') return;
      try {
        const metrics = await googleMapsService.calculateDeliveryMetrics(
          rLat,
          rLng,
          latitude,
          longitude,
          restaurant.averagePreparationTime || 20
        );
        const km = metrics.distance;
        const text =
          km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`;
        setDistanceText(text);
      } catch (e) {
        console.error(e);
      }
    };
    run();
  }, [
    restaurant?.latitude,
    restaurant?.longitude,
    latitude,
    longitude,
    restaurant?.averagePreparationTime,
  ]);

  const handleAddToCart = (item: MenuItem) => {
    if (!restaurant) return;
    const cartItem = {
      menuItemId: item.id,
      menuItem: item,
      quantity: 1,
      subtotal: item.price,
    } as any;
    addItem(cartItem, restaurant);
    toast.success(`${item.name} added to cart`);
  };

  const getItemQuantityInCart = (itemId: string) => {
    if (!cart) return 0;
    const item = cart.items.find(
      (cartItem: any) => cartItem.menuItemId === itemId
    );
    return item?.quantity || 0;
  };

  const getSpiceLevelColor = (level: string) => {
    switch (level) {
      case 'mild':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'spicy':
        return 'bg-orange-100 text-orange-800';
      case 'extra-spicy':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const openProduct = (item: MenuItem) => {
    if (!restaurant) return;
    // Determine veg/non-veg from tags
    const tags = (item.dietaryTags || []).map((t: string) => t.toLowerCase());
    const isNonVeg = tags.some((t) => /non\s?-?veg/.test(t));
    const isVegTag = tags.some((t) => /(veg|vegetarian|vegan)/.test(t));
    const isVegetarian = !isNonVeg && isVegTag;

    const dish: Dish = {
      id: item.id,
      name: item.name,
      image: item.imageUrl || '/images/dish-placeholder.svg',
      price: item.price,
      originalPrice: item.originalPrice,
      rating: restaurant.rating || 0,
      preparationTime:
        item.preparationTime || restaurant.averagePreparationTime || 20,
      restaurant: restaurant.name,
      category: item.category,
      isVegetarian,
      spiceLevel: (item.spiceLevel as any) || 'mild',
      description: item.description,
      dietaryTags: item.dietaryTags || [],
      distanceText: distanceText || undefined,
      distanceMeters: distanceText?.endsWith('km')
        ? Math.round(parseFloat(distanceText) * 1000)
        : undefined,
    };
    setSelectedDish(dish);
    setSheetOpen(true);
  };

  const addFromSheet = (dish: Dish, quantity: number) => {
    // Reuse existing cart add
    handleAddToCart({
      id: dish.id,
      name: dish.name,
      description: dish.description || '',
      price: dish.price,
      originalPrice: dish.originalPrice,
      category: dish.category,
      preparationTime: dish.preparationTime,
      imageUrl: dish.image,
      dietaryTags: dish.dietaryTags || [],
      spiceLevel: dish.spiceLevel,
      available: true,
      featured: false,
    });
    setSheetOpen(false);
  };

  const handleGoBack = () => {
    router.back();
  };

  const handleShareRestaurant = async () => {
    if (!restaurant) return;

    const shareData = generateRestaurantShareData(
      restaurant.name,
      restaurant.description || `Delicious food at ${restaurant.name}`,
      ratingValue,
      locationText,
      restaurant.id
    );

    const success = await shareContent(shareData);
    if (success) {
      toast.success('Restaurant shared successfully!');
    } else {
      toast.error('Failed to share restaurant');
    }
  };

  if (isLoading) {
    return (
      <CustomerLayout hideHeader hideFooter>
        <AastaLoader backgroundColor="#002a01" size={400} segmentSeconds={2} />
      </CustomerLayout>
    );
  }

  if (!restaurant) {
    return (
      <CustomerLayout hideHeader hideFooter>
        <div className="py-12 text-center">
          <p className="text-gray-500">Restaurant not found</p>
        </div>
      </CustomerLayout>
    );
  }

  const ratingValue =
    typeof (restaurant as any).rating === 'number'
      ? restaurant.rating.toFixed(1)
      : '--';
  const ratingsCountText =
    typeof (restaurant as any).reviewCount === 'number'
      ? restaurant.reviewCount.toLocaleString()
      : '—';
  const prepTimeText =
    typeof (restaurant as any).averagePreparationTime === 'number'
      ? `${restaurant.averagePreparationTime} mins`
      : '--';
  const locationText =
    locationName ||
    restaurant.locationName ||
    restaurant.location?.name ||
    restaurant.location?.city ||
    restaurant.address;

  return (
    <CustomerLayout hideHeader hideFooter>
      <div className="mx-auto max-w-3xl bg-[#D2F86A]">
        <div className="px-4 py-6">
          {/* Back button */}
          <div className="mb-4 flex justify-between">
            <Button
              onClick={handleGoBack}
              variant="ghost"
              size="sm"
              className="glass-liquid h-10 w-20 rounded-full bg-white/80 p-0 shadow-sm hover:bg-white"
            >
              <ArrowLeft className="h-5 w-5" style={{ color: '#002a01' }} />{' '}
              Back
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="glass-liquid h-10 w-10 rounded-full transition-colors hover:bg-white/90"
              onClick={handleShareRestaurant}
            >
              <Share2 className="h-4 w-4" />
            </Button>
          </div>

          {/* Top header card like reference */}
          <Card className="shadow-b-sm glass-liquid z-1 mb-4 h-40 rounded-[40px] border-gray-100 bg-white">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <h1
                    className={`text-[25px] font-extrabold tracking-tight`}
                    style={{ color: '#002a01' }}
                  >
                    {restaurant.name}
                  </h1>
                  <div className="mt-1 flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="h-4 w-4" /> {locationText}
                    <span>|</span>
                    <Clock className="h-4 w-4" /> {prepTimeText}
                    {distanceText && (
                      <>
                        <span>|</span>
                        <span>{distanceText}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="shadow-t-sm rounded-t-[50px] border-gray-100 bg-white">
          {/* Featured items horizontal scroll */}
          {featuredItems.length > 0 && (
            <div className="mb-6 px-4 pt-5">
              <div className="mr-1 mb-3 flex justify-end">
                <h2
                  className={`${brandFont.className} text-[60px] font-semibold`}
                  style={{ color: '#002a01', letterSpacing: '-0.08em' }}
                >
                  aasta's Favourite
                  <span className="ml-1 text-[60px] text-[#fd6923]">.</span>
                </h2>
              </div>

              {/* Convert featuredItems to Dish objects */}
              <HomeProductCardList
                dishes={featuredItems.map((item) => {
                  const tags = (item.dietaryTags || []).map((t: string) =>
                    t.toLowerCase()
                  );
                  const isNonVeg = tags.some((t: string) =>
                    /non\s?-?veg/.test(t)
                  );
                  const isVegTag = tags.some((t: string) =>
                    /(veg|vegetarian|vegan)/.test(t)
                  );
                  const isVegetarian = !isNonVeg && isVegTag;

                  return {
                    id: item.id,
                    name: item.name,
                    image: item.imageUrl || '/images/dish-placeholder.svg',
                    price: item.price,
                    originalPrice: item.originalPrice,
                    rating: restaurant.rating || 0,
                    preparationTime:
                      item.preparationTime ||
                      restaurant.averagePreparationTime ||
                      20,
                    restaurant: restaurant.name,
                    category: item.category,
                    isVegetarian,
                    spiceLevel: (item.spiceLevel as any) || 'mild',
                    description: item.description,
                    dietaryTags: item.dietaryTags || [],
                    distanceText: distanceText || undefined,
                  } as Dish;
                })}
                onAdd={(dish) => {
                  toast.success(`${dish.name} added to cart!`);
                }}
                onClick={(dish) => {
                  const originalItem = featuredItems.find(
                    (item) => item.id === dish.id
                  );
                  if (originalItem) openProduct(originalItem);
                }}
                restaurantContext={{ id: restaurant.id, name: restaurant.name }}
              />
            </div>
          )}

          {/* Other items vertical list */}
          <div className="space-y-4 px-4">
            <div className="mr-1 mb-3 flex justify-end">
              <h2
                className={`${brandFont.className} text-[60px] font-semibold`}
                style={{ color: '#002a01', letterSpacing: '-0.08em' }}
              >
                Recommended
                <span className="ml-1 text-[60px] text-[#fd6923]">.</span>
              </h2>
            </div>
            {otherItems.map((item) => {
              const tags = (item.dietaryTags || []).map((t: string) =>
                t.toLowerCase()
              );
              const isNonVeg = tags.some((t: string) => /non\s?-?veg/.test(t));
              const isVegTag = tags.some((t: string) =>
                /(veg|vegetarian|vegan)/.test(t)
              );
              const isVegetarian = !isNonVeg && isVegTag;
              const dish: Dish = {
                id: item.id,
                name: item.name,
                image: item.imageUrl || '/images/dish-placeholder.svg',
                price: item.price,
                originalPrice: item.originalPrice,
                rating: restaurant.rating || 0,
                preparationTime:
                  item.preparationTime ||
                  restaurant.averagePreparationTime ||
                  20,
                restaurant: restaurant.name,
                category: item.category,
                isVegetarian,
                spiceLevel: (item.spiceLevel as any) || 'mild',
                description: item.description,
                dietaryTags: item.dietaryTags || [],
                distanceText: distanceText || undefined,
              };
              return (
                <HomeProductCardHorizontal
                  key={item.id}
                  dish={dish}
                  onAdd={(d) => toast.success(`${d.name} added to cart!`)}
                  onClick={() => openProduct(item)}
                  restaurantContext={{
                    id: restaurant.id,
                    name: restaurant.name,
                  }}
                />
              );
            })}
          </div>
        </div>
      </div>

      <ProductBottomSheet
        open={sheetOpen}
        dish={selectedDish}
        onOpenChange={setSheetOpen}
        onAdd={addFromSheet}
      />
    </CustomerLayout>
  );
}
