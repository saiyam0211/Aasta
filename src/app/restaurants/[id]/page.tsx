"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CustomerLayout from "@/components/layouts/customer-layout";
import { 
  Star, 
  Clock, 
  MapPin, 
  Phone, 
  Heart,
  Plus,
  Minus,
  ShoppingCart,
  Info,
  ChefHat
} from "lucide-react";
import { useCartStore } from "@/lib/store";
import { toast } from "sonner";

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
  menu: { [category: string]: MenuItem[] };
}

export default function RestaurantDetailPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const params = useParams();
  const { addItem, updateQuantity, cart } = useCartStore();
  
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRestaurantData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch restaurant details
        const restaurantResponse = await fetch(`/api/restaurants/${params?.id}`);
        const restaurantData = await restaurantResponse.json();
        
        if (!restaurantResponse.ok || !restaurantData.success) {
          throw new Error(restaurantData.error || 'Failed to fetch restaurant');
        }
        
        // Fetch menu items
        const menuResponse = await fetch(`/api/menu-items?restaurantId=${params?.id}`);
        const menuData = await menuResponse.json();
        
        if (!menuResponse.ok || !menuData.success) {
          throw new Error(menuData.error || 'Failed to fetch menu');
        }
        
        // Group menu items by category
        const menuByCategory: { [category: string]: MenuItem[] } = {};
        const menuItems = menuData.data || [];
        
        menuItems.forEach((item: MenuItem) => {
          if (!menuByCategory[item.category]) {
            menuByCategory[item.category] = [];
          }
          menuByCategory[item.category].push(item);
        });
        
        const restaurantWithMenu: Restaurant = {
          ...restaurantData.data,
          menu: menuByCategory
        };
        
        setRestaurant(restaurantWithMenu);
        
        // Set first category as selected
        const categories = Object.keys(menuByCategory);
        if (categories.length > 0) {
          setSelectedCategory(categories[0]);
        }
        
      } catch (error) {
        console.error('Error fetching restaurant data:', error);
        toast.error('Failed to load restaurant data');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (params?.id) {
      fetchRestaurantData();
    }
  }, [params?.id]);

  const handleAddToCart = (item: MenuItem) => {
    if (!restaurant) return;
    
    const cartItem = {
      menuItemId: item.id,
      menuItem: item,
      quantity: 1,
      subtotal: item.price
    };
    
    addItem(cartItem, restaurant);
    
    toast.success(`${item.name} added to cart`);
  };

  const getItemQuantityInCart = (itemId: string) => {
    if (!cart) return 0;
    const item = cart.items.find((cartItem: any) => cartItem.menuItemId === itemId);
    return item?.quantity || 0;
  };

  const getSpiceLevelColor = (level: string) => {
    switch (level) {
      case "mild": return "bg-green-100 text-green-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      case "spicy": return "bg-orange-100 text-orange-800";
      case "extra-spicy": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <CustomerLayout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2" style={{ borderColor: '#002a01' }}></div>
        </div>
      </CustomerLayout>
    );
  }

  if (!restaurant) {
    return (
      <CustomerLayout>
        <div className="text-center py-12">
          <p className="text-gray-500">Restaurant not found</p>
        </div>
      </CustomerLayout>
    );
  }

  return (
    <CustomerLayout>
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Restaurant Header */}
        <Card className="mb-6 shadow-sm">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold" style={{ color: '#002a01' }}>
                    {restaurant.name}
                  </h1>
                  <Button size="sm" variant="outline" className="hover:bg-red-50">
                    <Heart className="w-4 h-4" />
                  </Button>
                </div>
                
                <p className="text-gray-600 mb-4 leading-relaxed">{restaurant.description}</p>
                
                <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-4">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{restaurant.rating}</span>
                    <span>({restaurant.reviewCount} reviews)</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{restaurant.averagePreparationTime} mins</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>₹{restaurant.deliveryFee} delivery</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Phone className="w-4 h-4" />
                    <span>{restaurant.phone}</span>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {restaurant.cuisineTypes.map(cuisine => (
                    <Badge key={cuisine} variant="outline" className="bg-gray-50">
                      {cuisine}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Minimum Order Notice */}
            <div 
              className="mt-4 p-3 rounded-lg flex items-center gap-2 border"
              style={{ backgroundColor: 'rgba(209, 248, 106, 0.2)', borderColor: 'rgba(0, 42, 1, 0.2)' }}
            >
              <Info className="w-4 h-4" style={{ color: '#002a01' }} />
              <span className="text-sm font-medium" style={{ color: '#002a01' }}>
                Minimum order: ₹{restaurant.minimumOrderAmount}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Menu */}
        <div className="flex flex-col lg:grid lg:grid-cols-5 gap-6">
          {/* Categories - Mobile Horizontal Scroll, Desktop Sidebar */}
          <div className="lg:col-span-1">
            {/* Mobile Categories */}
            <div className="lg:hidden mb-6">
              <div className="flex items-center gap-2 mb-3">
                <ChefHat className="w-5 h-5" style={{ color: '#002a01' }} />
                <h3 className="font-semibold" style={{ color: '#002a01' }}>Categories</h3>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {Object.keys(restaurant.menu).map(category => (
                  <button
                    key={category}
                    className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                      selectedCategory === category 
                        ? 'text-white shadow-md' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    onClick={() => setSelectedCategory(category)}
                    style={{
                      backgroundColor: selectedCategory === category ? '#002a01' : undefined
                    }}
                  >
                    {category}
                    <span className={`ml-2 text-xs ${
                      selectedCategory === category ? 'text-gray-200' : 'text-gray-500'
                    }`}>
                      ({restaurant.menu[category].length})
                    </span>
                  </button>
                ))}
              </div>
            </div>
            
            {/* Desktop Categories */}
            <div className="hidden lg:block sticky top-6">
              <Card className="shadow-sm border-2" style={{ borderColor: 'rgba(0, 42, 1, 0.1)' }}>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2" style={{ color: '#002a01' }}>
                    <ChefHat className="w-5 h-5" />
                    Menu Categories
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-1">
                    {Object.keys(restaurant.menu).map(category => (
                      <div
                        key={category}
                        className={`group p-3 rounded-lg cursor-pointer transition-all duration-200 border ${
                          selectedCategory === category 
                            ? 'text-white shadow-md transform scale-[1.02]' 
                            : 'hover:bg-gray-50 hover:border-gray-200 border-transparent'
                        }`}
                        onClick={() => setSelectedCategory(category)}
                        style={{
                          backgroundColor: selectedCategory === category ? '#002a01' : undefined
                        }}
                      >
                        <div className="font-medium text-sm">{category}</div>
                        <div className={`text-xs mt-1 ${
                          selectedCategory === category 
                            ? 'text-gray-200' 
                            : 'text-gray-500'
                        }`}>
                          {restaurant.menu[category].length} {restaurant.menu[category].length === 1 ? 'item' : 'items'}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Menu Items */}
          <div className="lg:col-span-4">
            <Card className="shadow-sm">
              <CardHeader className="border-b bg-gray-50/50">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl" style={{ color: '#002a01' }}>
                      {selectedCategory}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {restaurant.menu[selectedCategory]?.length} {restaurant.menu[selectedCategory]?.length === 1 ? 'item' : 'items'} available
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500">
                      Category {Object.keys(restaurant.menu).indexOf(selectedCategory) + 1} of {Object.keys(restaurant.menu).length}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-3 sm:p-6">
                <div className="space-y-4">
                  {restaurant.menu[selectedCategory]?.map(item => (
                    <div key={item.id} className="bg-white rounded-xl border border-gray-200 hover:shadow-lg hover:border-gray-300 transition-all duration-300 overflow-hidden">
                      <div className="flex gap-4 p-4">
                        {/* Item Image */}
                        <div className="flex-shrink-0">
                          {item.imageUrl ? (
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 object-cover rounded-lg shadow-sm"
                            />
                          ) : (
                            <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 bg-gray-100 rounded-lg flex items-center justify-center">
                              <ChefHat className="w-8 h-8 text-gray-400" />
                            </div>
                          )}
                        </div>
                        
                        {/* Item Details */}
                        <div className="flex-1 min-w-0">
                          {/* Header with name and badges */}
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-bold text-lg leading-tight text-gray-900 mb-1">
                                {item.name}
                              </h3>
                              <div className="flex flex-wrap gap-2">
                                {item.featured && (
                                  <Badge className="text-xs font-medium bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-900 border-0">
                                    ⭐ Popular
                                  </Badge>
                                )}
                                <Badge 
                                  className={`${getSpiceLevelColor(item.spiceLevel)} text-xs border-0`}
                                >
                                  🌶️ {item.spiceLevel}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          
                          {/* Description */}
                          <p className="text-gray-600 text-sm leading-relaxed mb-3 line-clamp-2">
                            {item.description}
                          </p>
                          
                          {/* Dietary Tags */}
                          {item.dietaryTags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-3">
                              {item.dietaryTags.slice(0, 3).map(tag => (
                                <Badge key={tag} className="text-xs bg-green-50 text-green-700 border border-green-200 px-2 py-1">
                                  {tag}
                                </Badge>
                              ))}
                              {item.dietaryTags.length > 3 && (
                                <Badge className="text-xs bg-gray-50 text-gray-600 border border-gray-200 px-2 py-1">
                                  +{item.dietaryTags.length - 3} more
                                </Badge>
                              )}
                            </div>
                          )}
                          
                          {/* Price and Time */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="flex items-baseline gap-2">
                                <span className="font-bold text-xl" style={{ color: '#002a01' }}>
                                  ₹{item.price}
                                </span>
                                {item.originalPrice && (
                                  <span className="line-through text-gray-400 text-sm">
                                    ₹{item.originalPrice}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-1 text-gray-500">
                                <Clock className="w-3 h-3" />
                                <span className="text-xs">{item.preparationTime}m</span>
                              </div>
                            </div>
                            
                            {/* Add to Cart Button */}
                            <div className="flex-shrink-0">
                              {getItemQuantityInCart(item.id) > 0 ? (
                                <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-1 border">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-8 w-8 p-0 hover:bg-white"
                                    onClick={() => {
                                      const currentQuantity = getItemQuantityInCart(item.id);
                                      if (currentQuantity > 1) {
                                        updateQuantity(item.id, currentQuantity - 1);
                                        toast.success(`${item.name} quantity decreased`);
                                      } else {
                                        updateQuantity(item.id, 0);
                                        toast.success(`${item.name} removed from cart`);
                                      }
                                    }}
                                  >
                                    <Minus className="w-4 h-4" />
                                  </Button>
                                  <span className="font-bold text-lg min-w-[24px] text-center" style={{ color: '#002a01' }}>
                                    {getItemQuantityInCart(item.id)}
                                  </span>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-8 w-8 p-0 hover:bg-white"
                                    onClick={() => handleAddToCart(item)}
                                  >
                                    <Plus className="w-4 h-4" />
                                  </Button>
                                </div>
                              ) : (
                                <Button
                                  onClick={() => handleAddToCart(item)}
                                  disabled={!item.available}
                                  size="sm"
                                  className="font-medium px-4 py-2 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
                                  style={{
                                    backgroundColor: item.available ? '#d1f86a' : '#e5e5e5',
                                    color: item.available ? '#002a01' : '#9ca3af',
                                    border: `1px solid ${item.available ? '#002a01' : '#d1d5db'}`
                                  }}
                                >
                                  <Plus className="w-4 h-4 mr-1" />
                                  <span className="hidden sm:inline">Add</span>
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </CustomerLayout>
  );
}