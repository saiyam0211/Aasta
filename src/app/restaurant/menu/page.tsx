"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye, EyeOff, ChefHat, Clock, DollarSign } from "lucide-react";
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

export default function MenuStockManagement() {
  const { data: session } = useSession();
  const router = useRouter();
  
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [restaurant, setRestaurant] = useState<any>(null);

  useEffect(() => {
    if (!session) {
      router.push("/restaurant/auth/signin");
      return;
    }
    
    fetchRestaurantData();
  }, [session, router]);

  const fetchRestaurantData = async () => {
    try {
      const response = await fetch('/api/restaurants');
      const data = await response.json();
      
      if (response.ok && data.restaurant) {
        setRestaurant(data.restaurant);
        fetchMenuItems(data.restaurant.id);
      } else {
        toast.error("Please complete your restaurant setup first");
        router.push("/restaurant/onboarding");
      }
    } catch (error) {
      console.error('Error fetching restaurant data:', error);
      toast.error("Failed to load restaurant data");
    }
  };

  const fetchMenuItems = async (restaurantId: string) => {
    try {
      const response = await fetch(`/api/menu-items?restaurantId=${restaurantId}`);
      const data = await response.json();
      
      if (response.ok) {
        setMenuItems(data.menuItems);
        
        // Set first category as selected
        const categories = getCategories(data.menuItems);
        if (categories.length > 0) {
          setSelectedCategory(categories[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching menu items:', error);
      toast.error("Failed to load menu items");
    } finally {
      setLoading(false);
    }
  };

  const toggleItemAvailability = async (itemId: string) => {
    try {
      const item = menuItems.find(i => i.id === itemId);
      if (!item) return;

      const response = await fetch(`/api/menu-items/${itemId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          available: !item.available
        }),
      });

      if (response.ok) {
        setMenuItems(prev => prev.map(i => 
          i.id === itemId 
            ? { ...i, available: !i.available }
            : i
        ));
        
        toast.success(`${item.name} marked as ${!item.available ? 'available' : 'unavailable'}`);
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to update item availability');
      }
    } catch (error) {
      console.error('Error toggling item availability:', error);
      toast.error('Failed to update item availability');
    }
  };

  const getCategories = (items: MenuItem[]): string[] => {
    const categories = Array.from(new Set(items.map(item => item.category)));
    return categories.sort();
  };

  const getItemsByCategory = (category: string): MenuItem[] => {
    return menuItems.filter(item => item.category === category);
  };

  const categories = getCategories(menuItems);
  const selectedCategoryItems = selectedCategory ? getItemsByCategory(selectedCategory) : [];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Restaurant Setup Required</h2>
          <p className="text-gray-600 mb-4">Please complete your restaurant setup first</p>
          <Button onClick={() => router.push("/restaurant/onboarding")}>
            Complete Setup
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#fcfefe' }}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold" style={{ color: '#002a01' }}>
            Menu Stock Management
          </h1>
          <p className="text-gray-600 mt-2">
            Manage availability of your menu items
          </p>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Categories Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Categories</CardTitle>
                <CardDescription>Select a category to manage items</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {categories.map(category => (
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
                      {getItemsByCategory(category).length} items
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Items List */}
          <div className="lg:col-span-3">
            {selectedCategory ? (
              <Card>
                <CardHeader>
                  <CardTitle>{selectedCategory}</CardTitle>
                  <CardDescription>Toggle availability for items in this category</CardDescription>
                </CardHeader>
                <CardContent>
                  {selectedCategoryItems.length === 0 ? (
                    <div className="text-center py-12">
                      <ChefHat className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                      <p className="text-gray-500 mb-4">No items in this category yet</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {selectedCategoryItems.map(item => (
                        <div key={item.id} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="font-semibold text-lg">{item.name}</h3>
                                {item.featured && (
                                  <Badge variant="secondary">Featured</Badge>
                                )}
                                <Badge 
                                  variant={item.available ? "default" : "destructive"}
                                  style={{
                                    backgroundColor: item.available ? '#d1f86a' : undefined,
                                    color: item.available ? '#002a01' : undefined
                                  }}
                                >
                                  {item.available ? 'Available' : 'Unavailable'}
                                </Badge>
                              </div>
                              
                              <p className="text-gray-600 mb-3">{item.description}</p>
                              
                              <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                                <div className="flex items-center gap-1">
                                  <DollarSign className="w-4 h-4" />
                                  <span className="font-medium">₹{item.price}</span>
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
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {item.dietaryTags.map(tag => (
                                    <Badge key={tag} variant="outline" className="text-xs">
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-2 ml-4">
                              <Button
                                size="sm"
                                variant={item.available ? "default" : "outline"}
                                onClick={() => toggleItemAvailability(item.id)}
                                style={{
                                  backgroundColor: item.available ? '#002a01' : undefined,
                                  color: item.available ? 'white' : undefined
                                }}
                              >
                                {item.available ? (
                                  <>
                                    <Eye className="w-4 h-4 mr-2" />
                                    Mark Unavailable
                                  </>
                                ) : (
                                  <>
                                    <EyeOff className="w-4 h-4 mr-2" />
                                    Mark Available
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <ChefHat className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500">Select a category to manage menu items</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 