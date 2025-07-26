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
  Info
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
  const { addItem, cart } = useCartStore();
  
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Mock restaurant data - in real app, fetch from API
    const mockRestaurant: Restaurant = {
      id: params.id as string,
      name: "Midnight Bites",
      description: "Authentic North Indian cuisine served fresh and hot during late night hours. Perfect for your midnight cravings with traditional recipes and modern presentation.",
      address: "123 Food Street, Connaught Place, New Delhi - 110001",
      phone: "+91-9876543210",
      cuisineTypes: ["North Indian", "Mughlai", "Tandoor"],
      rating: 4.5,
      reviewCount: 328,
      averagePreparationTime: 25,
      minimumOrderAmount: 200,
      deliveryRadius: 5,
      deliveryFee: 30,
      status: "ACTIVE",
      menu: {
        "Starters": [
          {
            id: "1",
            name: "Paneer Tikka",
            description: "Grilled cottage cheese marinated in aromatic spices and yogurt, served with mint chutney",
            price: 280,
            originalPrice: 320,
            category: "Starters",
            preparationTime: 20,
            imageUrl: "",
            dietaryTags: ["Vegetarian"],
            spiceLevel: "medium",
            available: true,
            featured: true
          },
          {
            id: "2",
            name: "Chicken Seekh Kebab",
            description: "Minced chicken seasoned with herbs and spices, grilled to perfection",
            price: 320,
            category: "Starters",
            preparationTime: 25,
            imageUrl: "",
            dietaryTags: ["High-Protein"],
            spiceLevel: "spicy",
            available: true,
            featured: false
          }
        ],
        "Main Course": [
          {
            id: "3",
            name: "Butter Chicken",
            description: "Tender chicken pieces in a rich, creamy tomato-based curry with aromatic spices",
            price: 380,
            category: "Main Course",
            preparationTime: 30,
            imageUrl: "",
            dietaryTags: ["High-Protein"],
            spiceLevel: "mild",
            available: true,
            featured: true
          },
          {
            id: "4",
            name: "Dal Makhani",
            description: "Slow-cooked black lentils in a rich, creamy sauce with butter and cream",
            price: 250,
            category: "Main Course",
            preparationTime: 20,
            imageUrl: "",
            dietaryTags: ["Vegetarian"],
            spiceLevel: "mild",
            available: true,
            featured: false
          }
        ],
        "Breads": [
          {
            id: "5",
            name: "Garlic Naan",
            description: "Soft, fluffy bread topped with fresh garlic and herbs, baked in tandoor",
            price: 80,
            category: "Breads",
            preparationTime: 10,
            imageUrl: "",
            dietaryTags: ["Vegetarian"],
            spiceLevel: "mild",
            available: true,
            featured: false
          }
        ]
      }
    };

    setRestaurant(mockRestaurant);
    const categories = Object.keys(mockRestaurant.menu);
    if (categories.length > 0) {
      setSelectedCategory(categories[0]);
    }
    setIsLoading(false);
  }, [params.id]);

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
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Restaurant Header */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold" style={{ color: '#002a01' }}>
                    {restaurant.name}
                  </h1>
                  <Button size="sm" variant="outline">
                    <Heart className="w-4 h-4" />
                  </Button>
                </div>
                
                <p className="text-gray-600 mb-4">{restaurant.description}</p>
                
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
                    <Badge key={cuisine} variant="outline">
                      {cuisine}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Minimum Order Notice */}
            <div 
              className="mt-4 p-3 rounded-lg flex items-center gap-2"
              style={{ backgroundColor: 'rgba(209, 248, 106, 0.2)' }}
            >
              <Info className="w-4 h-4" style={{ color: '#002a01' }} />
              <span className="text-sm" style={{ color: '#002a01' }}>
                Minimum order: ₹{restaurant.minimumOrderAmount}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Menu */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Categories Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Menu Categories</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {Object.keys(restaurant.menu).map(category => (
                  <div
                    key={category}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedCategory === category 
                        ? 'text-white' 
                        : 'hover:bg-gray-100'
                    }`}
                    onClick={() => setSelectedCategory(category)}
                    style={{
                      backgroundColor: selectedCategory === category ? '#002a01' : undefined
                    }}
                  >
                    <div className="font-medium">{category}</div>
                    <div className="text-sm opacity-70">
                      {restaurant.menu[category].length} items
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Menu Items */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle>{selectedCategory}</CardTitle>
                <CardDescription>
                  {restaurant.menu[selectedCategory]?.length} items available
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {restaurant.menu[selectedCategory]?.map(item => (
                    <div key={item.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-lg">{item.name}</h3>
                            {item.featured && (
                              <Badge style={{ backgroundColor: '#ffd500', color: '#002a01' }}>
                                Popular
                              </Badge>
                            )}
                            <Badge 
                              className={getSpiceLevelColor(item.spiceLevel)}
                              variant="outline"
                            >
                              {item.spiceLevel}
                            </Badge>
                          </div>
                          
                          <p className="text-gray-600 mb-3">{item.description}</p>
                          
                          <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-3">
                            <div className="flex items-center gap-1">
                              <span className="font-medium text-lg" style={{ color: '#002a01' }}>
                                ₹{item.price}
                              </span>
                              {item.originalPrice && (
                                <span className="line-through ml-1">₹{item.originalPrice}</span>
                              )}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              <span>{item.preparationTime} mins</span>
                            </div>
                          </div>
                          
                          {item.dietaryTags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-3">
                              {item.dietaryTags.map(tag => (
                                <Badge key={tag} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                        
                        <div className="ml-4">
                          {getItemQuantityInCart(item.id) > 0 ? (
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  // Remove item logic would go here
                                }}
                              >
                                <Minus className="w-4 h-4" />
                              </Button>
                              <span className="font-medium px-3">
                                {getItemQuantityInCart(item.id)}
                              </span>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleAddToCart(item)}
                              >
                                <Plus className="w-4 h-4" />
                              </Button>
                            </div>
                          ) : (
                            <Button
                              onClick={() => handleAddToCart(item)}
                              disabled={!item.available}
                              style={{
                                backgroundColor: item.available ? '#d1f86a' : '#gray',
                                color: '#002a01',
                                border: '2px solid #002a01'
                              }}
                            >
                              <Plus className="w-4 h-4 mr-2" />
                              Add
                            </Button>
                          )}
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