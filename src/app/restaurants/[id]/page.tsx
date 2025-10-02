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
import RestaurantFooter from '@/components/ui/restaurant-footer';
import type { Dish } from '@/types/dish';
import { shareContent, generateRestaurantShareData } from '@/lib/share-utils';
import { HomeProductCard } from '@/components/ui/home-product-card';
import { HomeProductCardHorizontal } from '@/components/ui/home-product-card-horizontal';
import { HomeProductCardList } from '@/components/ui/home-product-card-vertical';
import AastaLoader from '@/components/ui/AastaLoader';
import { useVegMode } from '@/contexts/VegModeContext';

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
  const { vegOnly } = useVegMode();

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [featuredItems, setFeaturedItems] = useState<MenuItem[]>([]);
  const [otherItems, setOtherItems] = useState<MenuItem[]>([]);
  const [locationName, setLocationName] = useState<string>('');
  const [distanceText, setDistanceText] = useState<string | null>(null);

  // ProductBottomSheet state
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedDish, setSelectedDish] = useState<Dish | null>(null);

  // Offers carousel state
  const [currentOfferIndex, setCurrentOfferIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  
  // Sample offers data
  const offers = [
    {
      id: 1,
      title: "Flat ₹150 off",
      subtitle: "USE DEALICIOUS | ABOVE ₹449",
      icon: "%",
      color: "orange"
    },
    {
      id: 2,
      title: "Free Delivery",
      subtitle: "ON ORDERS ABOVE ₹199",
      icon: "🚚",
      color: "green"
    },
    {
      id: 3,
      title: "20% Cashback",
      subtitle: "USE PAYTM | ABOVE ₹299",
      icon: "💰",
      color: "blue"
    },
    {
      id: 4,
      title: "Buy 1 Get 1",
      subtitle: "ON SELECTED ITEMS",
      icon: "🎁",
      color: "purple"
    },
    {
      id: 5,
      title: "Extra ₹50 off",
      subtitle: "USE SAVE50 | ABOVE ₹399",
      icon: "💸",
      color: "red"
    }
  ];

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
          `/api/menu-items?restaurantId=${params?.id}${vegOnly ? '&veg=1' : ''}`
        );
        const menuData = await menuResponse.json();
        if (!menuResponse.ok || !menuData.success)
          throw new Error(menuData.error || 'Failed to fetch menu');

        const r: Restaurant = restaurantData.data;
        setRestaurant(r);

        const menuItems: MenuItem[] = menuData.data || [];
        
        // Filter items based on veg mode
        const filteredItems = vegOnly 
          ? menuItems.filter((item) => {
              const isVeg = Array.isArray(item.dietaryTags)
                ? item.dietaryTags.includes('Veg')
                : false;
              return isVeg;
            })
          : menuItems;
        
        setFeaturedItems(filteredItems.filter((m) => m.featured));
        setOtherItems(filteredItems.filter((m) => !m.featured));

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
  }, [params?.id, vegOnly]);

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

  // Auto-rotate offers carousel every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentOfferIndex((prevIndex) => (prevIndex + 1) % offers.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [offers.length]);

  // Touch/swipe handlers for manual carousel navigation
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && currentOfferIndex < offers.length - 1) {
      setCurrentOfferIndex(currentOfferIndex + 1);
    }
    if (isRightSwipe && currentOfferIndex > 0) {
      setCurrentOfferIndex(currentOfferIndex - 1);
    }
  };

  const handleAddToCart = (item: MenuItem) => {
    if (!restaurant) return;
    const maxStock = (item as any)?.stockLeft;
    const currentQty = getItemQuantityInCart(item.id);
    if (typeof maxStock === 'number' && maxStock >= 0 && currentQty + 1 > maxStock) {
      toast.error(`Only ${maxStock} left in stock`);
      return;
    }
    const cartItem = {
      menuItemId: item.id,
      menuItem: { ...item },
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
      <div className="mx-auto max-w-3xl bg-[#002a01]">
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

          {/* Top header card with rating and offers */}
          <Card className="shadow-b-sm glass-liquid z-1 mb-4 rounded-[40px] border-gray-100 bg-white">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* Restaurant name and basic info */}
                  <div className="flex items-start gap-3">
                    <div className="flex-1">
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
                    
                    {/* Rating section */}
                    <div className="flex flex-col items-end gap-1 mt-2">
                      <div className="flex items-center gap-1 rounded-lg bg-green-600 px-2 py-1">
                        <Star className="h-3 w-3 fill-white text-white" />
                        <span className="text-xs font-semibold text-white">
                          {ratingValue}
                        </span>
                      </div>
                      <span className="text-xs text-gray-600">
                        {ratingsCountText} ratings
                      </span>
                    </div>
                  </div>

                  {/* Offers section */}
                  <div className="mt-4 bg-[#D2F86A] rounded-xl pl-2 ">
                    <div className="flex items-center gap-3">
                      {/* Offer carousel indicator - sliding window of 3 dots */}
                      <div className="flex items-center flex-col gap-1 mt-3">
                        {(() => {
                          // Calculate which 3 dots to show based on current position
                          let startIndex, endIndex;
                          let shouldAnimate = false;
                          
                          if (currentOfferIndex === 0) {
                            // First offer: show dots 1, 2, 3
                            startIndex = 0;
                            endIndex = 2;
                            shouldAnimate = true; // Animate when at first position
                          } else if (currentOfferIndex === offers.length - 1) {
                            // Last offer: show dots 3, 4, 5 (last 3)
                            startIndex = Math.max(0, offers.length - 3);
                            endIndex = offers.length - 1;
                            shouldAnimate = true; // Animate when at last position
                          } else {
                            // Middle offers: show current-1, current, current+1
                            startIndex = Math.max(0, currentOfferIndex - 1);
                            endIndex = Math.min(offers.length - 1, currentOfferIndex + 1);
                            shouldAnimate = false; // No animation for middle positions
                          }
                          
                          const dotsToShow = [];
                          for (let i = startIndex; i <= endIndex; i++) {
                            dotsToShow.push(i);
                          }
                          
                          return dotsToShow.map((index) => {
                            const isActive = index === currentOfferIndex;
                            return (
                              <div
                                key={index}
                                className={`h-2 w-2 rounded-full ${
                                  shouldAnimate 
                                    ? 'transition-all duration-500 ease-in-out' 
                                    : 'transition-none'
                                } ${
                                  isActive ? 'bg-[#002a01]' : 'bg-[#dee1e0]'
                                }`}
                              />
                            );
                          });
                        })()}
                        <span className="mt-2 mb-1 font-bold text-sm text-gray-700">
                          {currentOfferIndex + 1}/{offers.length}
                        </span>
                      </div>
                      
                      {/* Main offer - dynamically changing with touch support */}
                      <div 
                        className={`flex items-center gap-2 rounded-xl px-3 py-2 w-80 h-20 transition-all duration-500 ${
                          offers[currentOfferIndex]?.color === 'orange' ? 'bg-[#002a01]' :
                          offers[currentOfferIndex]?.color === 'green' ? 'bg-[#002a01]' :
                          offers[currentOfferIndex]?.color === 'blue' ? 'bg-[#002a01]' :
                          offers[currentOfferIndex]?.color === 'purple' ? 'bg-[#002a01]' :
                          'bg-[#002a01]'
                        }`}
                        onTouchStart={handleTouchStart}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={handleTouchEnd}
                      >
                        <div>
                          <div className={`text-md ml-2 font-bold ${
                            offers[currentOfferIndex]?.color === 'orange' ? 'text-white' :
                            offers[currentOfferIndex]?.color === 'green' ? 'text-white' :
                            offers[currentOfferIndex]?.color === 'blue' ? 'text-white' :
                            offers[currentOfferIndex]?.color === 'purple' ? 'text-white' :
                            'text-white'
                          }`}>
                            {offers[currentOfferIndex]?.title}
                          </div>
                          <div className={`text-sm ml-2 ${
                            offers[currentOfferIndex]?.color === 'orange' ? 'text-white' :
                            offers[currentOfferIndex]?.color === 'green' ? 'text-white' :
                            offers[currentOfferIndex]?.color === 'blue' ? 'text-white' :
                            offers[currentOfferIndex]?.color === 'purple' ? 'text-white' :
                            'text-white'
                          }`}>
                            {offers[currentOfferIndex]?.subtitle}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="shadow-t-sm rounded-t-[50px] pb-10 border-gray-100 bg-white">
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

      {/* Restaurant Footer */}
      <RestaurantFooter 
        restaurant={{
          id: restaurant.id,
          name: restaurant.name,
          address: restaurant.address,
          phone: restaurant.phone,
        }}
      />

      <ProductBottomSheet
        open={sheetOpen}
        dish={selectedDish}
        onOpenChange={setSheetOpen}
        onAdd={addFromSheet}
      />
    </CustomerLayout>
  );
}
