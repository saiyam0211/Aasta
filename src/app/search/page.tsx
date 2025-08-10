"use client";

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import CustomerLayout from '@/components/layouts/customer-layout';
import { useLocationStore } from '@/hooks/useLocation';
import { useCartStore } from '@/lib/store';
import { Search, Clock, Star, MapPin, Loader2, Plus, Minus } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

interface Restaurant {
  id: string;
  name: string;
  cuisineTypes: string[];
  rating: number;
  distance: number;
  deliveryTime?: string;
  imageUrl?: string;
  isOpen: boolean;
  address: string;
  minimumOrderAmount?: number;
}

export default function SearchPage() {
  const [searchInput, setSearchInput] = useState('');
  const [results, setResults] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const searchParams = useSearchParams();
  const router = useRouter();
  const { latitude, longitude } = useLocationStore();
  const { addItem, getItemQuantityInCart, updateQuantity, removeItem } = useCartStore();
  const query = searchParams?.get('query') || '';

  useEffect(() => {
    if (query) {
      setSearchInput(query);
      performSearch(query);
    }
  }, [query]);

  const performSearch = async (searchTerm: string) => {
    if (!searchTerm.trim()) return;
    if (!latitude || !longitude) {
      setError('Location is required for search. Please enable location access.');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`/api/restaurants/search?query=${encodeURIComponent(searchTerm)}&latitude=${latitude}&longitude=${longitude}`);
      const data = await response.json();
      
      if (data.success) {
        // Filter and highlight matching menu items for better UX
        const enhancedResults = data.data.restaurants.map((restaurant: any) => {
          const matchingItems = restaurant.menuItems.filter((item: any) => 
            item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.category?.toLowerCase().includes(searchTerm.toLowerCase())
          );
          
          return {
            ...restaurant,
            matchingMenuItems: matchingItems,
            hasMatchingItems: matchingItems.length > 0
          };
        });
        
        setResults(enhancedResults);
      } else {
        setError('Failed to search restaurants');
      }
    } catch (err) {
      console.error('Search error:', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (!searchInput.trim()) return;
    router.push(`/search?query=${encodeURIComponent(searchInput.trim())}`);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleAddToCart = (menuItem: any, restaurant: any) => {
    try {
      // Check if restaurant is open
      if (!restaurant.isOpen) {
        toast.error('This restaurant is currently closed');
        return;
      }

      // Create cart item
      const cartItem = {
        menuItemId: menuItem.id,
        menuItem: menuItem,
        quantity: 1,
        subtotal: menuItem.price
      };

      // Add to cart
      addItem(cartItem, restaurant);
      toast.success(`${menuItem.name} added to cart!`);
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add item to cart');
    }
  };

  return (
    <CustomerLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-off-white">
        {/* Search Header */}
        <div className="mb-8">
          <h1 className="text-brand text-3xl font-bold mb-4 text-primary-dark-green">
            Search Restaurants
          </h1>
          
          {/* Search Input */}
          <div className="max-w-2xl">
            <div className="flex items-center space-x-2">
              <Input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Search for restaurants, dishes, cuisine..."
                className="flex-1 selectable border-2 border-primary-dark-green focus:border-primary-dark-green text-primary-dark-green"
              />
              <Button 
                onClick={handleSearch}
                className="btn-primary px-6"
                disabled={!searchInput.trim() || loading}
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Search Results */}
        {query && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-heading text-xl font-semibold text-primary-dark-green">
                Search results for "{query}"
              </h2>
              {results.length > 0 && (
                <div className="text-sm text-gray-600">
                  {results.reduce((total, restaurant) => total + ((restaurant as any).matchingMenuItems?.length || 0), 0)} dishes found in {results.length} restaurant{results.length > 1 ? 's' : ''}
                </div>
              )}
            </div>
            
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-red-800">{error}</p>
              </div>
            )}
            
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary-dark-green" />
                  <p className="text-gray-600">Searching restaurants...</p>
                </div>
              </div>
            ) : results.length === 0 && !error ? (
              <Card className="restaurant-card">
                <CardContent className="p-8 text-center">
                  <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2 text-primary-dark-green">No restaurants found</h3>
                  <p className="text-gray-600 mb-4">
                    We couldn't find any restaurants matching "{query}". Try searching with different keywords.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {results.map((restaurant) => {
                  const hasMatchingDishes = (restaurant as any).hasMatchingItems;
                  
                  return (
                    <div key={restaurant.id} className="space-y-4">
                      {/* Restaurant Header */}
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="flex-shrink-0">
                            {restaurant.imageUrl ? (
                              <img 
                                src={restaurant.imageUrl} 
                                alt={restaurant.name} 
                                className="w-16 h-16 rounded-lg object-cover"
                              />
                            ) : (
                              <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                                <span className="text-gray-400 text-xs">No image</span>
                              </div>
                            )}
                          </div>
                          <div>
                            <Link href={`/restaurants/${restaurant.id}`} className="hover:underline">
                              <h3 className="font-bold text-lg text-primary-dark-green">{restaurant.name}</h3>
                            </Link>
                            <p className="text-gray-600 text-sm">{restaurant.cuisineTypes.join(', ')}</p>
                            <div className="flex items-center space-x-4 mt-1">
                              <div className="flex items-center space-x-1">
                                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                <span className="text-sm font-medium">{restaurant.rating}</span>
                              </div>
                              <div className="flex items-center space-x-1 text-gray-500">
                                <MapPin className="w-3 h-3" />
                                <span className="text-sm">{restaurant.distance.toFixed(1)} km</span>
                              </div>
                              <Badge className={`text-xs ${
                                restaurant.isOpen 
                                  ? 'bg-accent-leaf-green text-primary-dark-green' 
                                  : 'bg-gray-500 text-white'
                              }`}>
                                {restaurant.isOpen ? 'Open' : 'Closed'}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Matching Dishes - Show prominently when searching for dishes */}
                      {hasMatchingDishes ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pl-4">
                          {(restaurant as any).matchingMenuItems.map((item: any) => (
                            <Card key={item.id} className="border border-green-200 hover:shadow-md transition-shadow">
                              <CardContent className="p-4">
                                <div className="flex justify-between items-start mb-2">
                                  <div className="flex-1">
                                    <h4 className="font-semibold text-primary-dark-green">{item.name}</h4>
                                    {item.description && (
                                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">{item.description}</p>
                                    )}
                                  </div>
                                  {item.imageUrl && (
                                    <img 
                                      src={item.imageUrl} 
                                      alt={item.name} 
                                      className="w-16 h-16 rounded-lg object-cover ml-3"
                                    />
                                  )}
                                </div>
                                
                                <div className="flex items-center justify-between mt-3">
                                  <div className="flex items-center space-x-2">
                                    <div className="flex items-center space-x-1">
                                      {item.originalPrice && (
                                        <span className="text-sm text-gray-500 line-through">₹{item.originalPrice}</span>
                                      )}
                                      <span className="font-bold text-primary-dark-green">₹{item.price}</span>
                                    </div>
                                    {item.discount > 0 && (
                                      <Badge className="text-xs bg-red-100 text-red-800">
                                        {item.discount}% OFF
                                      </Badge>
                                    )}
                                  </div>
                                  
                                  <div className="flex items-center space-x-2">
                                    {item.featured && (
                                      <Badge className="text-xs bg-yellow-100 text-yellow-800">Bestseller</Badge>
                                    )}
                                    {(() => {
                                      const quantity = getItemQuantityInCart(item.id);
                                      return quantity > 0 ? (
                                        <div className="flex items-center space-x-2">
                                          <span className="text-sm font-medium text-primary-dark-green">{quantity}</span>
                                          <div className="flex items-center space-x-1">
                                            <Button
                                              size="sm"
                                              variant="outline"
                                              className="h-6 w-6 p-0 border-primary-dark-green text-primary-dark-green hover:bg-primary-dark-green hover:text-white"
                                              onClick={() => {
                                                if (quantity === 1) {
                                                  removeItem(item.id);
                                                } else {
                                                  updateQuantity(item.id, quantity - 1);
                                                }
                                              }}
                                            >
                                              <Minus className="h-3 w-3" />
                                            </Button>
                                            <Button
                                              size="sm"
                                              variant="outline"
                                              className="h-6 w-6 p-0 border-primary-dark-green text-primary-dark-green hover:bg-primary-dark-green hover:text-white"
                                              onClick={() => updateQuantity(item.id, quantity + 1)}
                                            >
                                              <Plus className="h-3 w-3" />
                                            </Button>
                                          </div>
                                        </div>
                                      ) : (
                                        <Button 
                                          size="sm" 
                                          className="btn-primary px-3 py-1 text-xs"
                                          onClick={() => handleAddToCart(item, restaurant)}
                                          disabled={!restaurant.isOpen}
                                        >
                                          Add
                                        </Button>
                                      );
                                    })()} 
                                  </div>
                                </div>
                                
                                {/* Dietary tags */}
                                {item.dietaryTags && item.dietaryTags.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mt-2">
                                    {item.dietaryTags.slice(0, 3).map((tag: string) => (
                                      <Badge key={tag} className="text-xs bg-gray-100 text-gray-600">
                                        {tag}
                                      </Badge>
                                    ))}
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      ) : (
                        /* Show restaurant info when no specific dishes match */
                        <div className="pl-4">
                          <p className="text-gray-600 text-sm">Restaurant matches your search criteria</p>
                          <Link href={`/restaurants/${restaurant.id}`}>
                            <Button className="btn-primary mt-2">View Menu</Button>
                          </Link>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
        
        {/* No search performed yet */}
        {!query && (
          <Card className="restaurant-card">
            <CardContent className="p-8 text-center">
              <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2 text-primary-dark-green">Start searching</h3>
              <p className="text-gray-600">
                Enter a restaurant name, dish, or cuisine type to find what you're looking for.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </CustomerLayout>
  );
}

