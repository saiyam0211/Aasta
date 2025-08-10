"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, ChefHat, Clock, DollarSign, Package } from "lucide-react";
import { toast } from "sonner";
import RestaurantLayout from "@/components/layouts/restaurant-layout";

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
  stockLeft?: number | null;
}

export default function MenuStockManagement() {
  const { data: session } = useSession();
  const router = useRouter();
  
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [restaurant, setRestaurant] = useState<any>(null);
  const [stockInputs, setStockInputs] = useState<Record<string, string>>({});

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
      
      if (response.ok && data.success) {
        setMenuItems(data.data || []);
        
        // Set first category as selected
        const categories = getCategories(data.data || []);
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
        
        toast.success(`${item.name} marked as ${!item.available ? 'available' : 'out of stock'}`);
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to update item availability');
      }
    } catch (error) {
      console.error('Error toggling item availability:', error);
      toast.error('Failed to update item availability');
    }
  };

  const updateStock = async (itemId: string, newStock: number) => {
    try {
      const item = menuItems.find(i => i.id === itemId);
      if (!item) return;

      // Create FormData to match the API expectation
      const formData = new FormData();
      formData.append('stockLeft', newStock.toString());
      
      // If stock is 0, mark as unavailable
      if (newStock === 0) {
        formData.append('available', 'false');
      } else if (!item.available && newStock > 0) {
        formData.append('available', 'true');
      }

      const response = await fetch(`/api/menu-items/${itemId}`, {
        method: 'PUT',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        setMenuItems(prev => prev.map(i => 
          i.id === itemId 
            ? { 
                ...i, 
                stockLeft: newStock,
                available: newStock > 0 ? (item.available || newStock > 0) : false
              }
            : i
        ));
        
        if (newStock === 0) {
          toast.success(`${item.name} is now out of stock`);
        } else {
          toast.success(`Stock updated for ${item.name}: ${newStock} left`);
        }
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to update stock');
      }
    } catch (error) {
      console.error('Error updating stock:', error);
      toast.error('Failed to update stock');
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
      <RestaurantLayout title="Menu">
        <div className="flex items-center justify-center min-h-96">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-600"></div>
        </div>
      </RestaurantLayout>
    );
  }

  if (!restaurant) {
    return (
      <RestaurantLayout title="Menu">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Restaurant Setup Required</h2>
            <p className="text-gray-600 mb-4">Please complete your restaurant setup first</p>
            <Button onClick={() => router.push("/restaurant/onboarding")}>
              Complete Setup
            </Button>
          </div>
        </div>
      </RestaurantLayout>
    );
  }

  return (
    <RestaurantLayout title="Menu">
      <div className="space-y-8 animate-fade-in">
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
                                  {item.available ? 'Available' : 'Out of Stock'}
                                </Badge>
                                {item.stockLeft !== null && item.stockLeft !== undefined && (
                                  <Badge 
                                    variant="outline"
                                    className={`text-xs ${
                                      item.stockLeft === 0 
                                        ? 'border-red-300 text-red-700 bg-red-50' 
                                        : item.stockLeft <= 5 
                                        ? 'border-orange-300 text-orange-700 bg-orange-50'
                                        : 'border-green-300 text-green-700 bg-green-50'
                                    }`}
                                  >
                                    <Package className="w-3 h-3 mr-1" />
                                    {item.stockLeft} left
                                  </Badge>
                                )}
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

                              {/* Stock Management */}
                              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-medium text-gray-700">Stock Left</span>
                                  <div className="flex items-center gap-2">
                                    <Input
                                      type="number"
                                      value={stockInputs[item.id] ?? item.stockLeft ?? ''}
                                      onChange={(e) => setStockInputs(prev => ({...prev, [item.id]: e.target.value}))}
                                      onBlur={(e) => {
                                        const newStock = parseInt(e.target.value);
                                        if (!isNaN(newStock) && newStock !== (item.stockLeft ?? 0)) {
                                          updateStock(item.id, newStock);
                                        } else if (e.target.value === '' || isNaN(newStock)) {
                                           setStockInputs(prev => ({...prev, [item.id]: (item.stockLeft ?? 0).toString()}));
                                        }
                                      }}
                                      className="h-8 w-20 text-center"
                                      min="0"
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex flex-col gap-2 ml-4">
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
                                    <EyeOff className="w-4 h-4 mr-2" />
                                    Out of Stock
                                  </>
                                ) : (
                                  <>
                                    <Eye className="w-4 h-4 mr-2" />
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
    </RestaurantLayout>
  );
} 
