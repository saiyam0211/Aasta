'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import CustomerLayout from '@/components/layouts/customer-layout';
import { useLocationStore } from '@/hooks/useLocation';
import { useCartStore } from '@/lib/store';
import {
  Search,
  Clock,
  Star,
  MapPin,
  Loader2,
  Plus,
  Minus,
} from 'lucide-react';
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
  const { addItem, getItemQuantityInCart, updateQuantity, removeItem } =
    useCartStore();
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
      setError(
        'Location is required for search. Please enable location access.'
      );
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(
        `/api/restaurants/search?query=${encodeURIComponent(searchTerm)}&latitude=${latitude}&longitude=${longitude}`
      );
      const data = await response.json();

      if (data.success) {
        // Filter and highlight matching menu items for better UX
        const enhancedResults = data.data.restaurants.map((restaurant: any) => {
          const matchingItems = restaurant.menuItems.filter(
            (item: any) =>
              item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              item.description
                ?.toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
              item.category?.toLowerCase().includes(searchTerm.toLowerCase())
          );

          return {
            ...restaurant,
            matchingMenuItems: matchingItems,
            hasMatchingItems: matchingItems.length > 0,
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

      // Check stock limit
      const maxStock = (menuItem as any)?.stockLeft;
      const currentQty = useCartStore.getState().getItemQuantityInCart(menuItem.id);
      if (typeof maxStock === 'number' && maxStock >= 0 && currentQty + 1 > maxStock) {
        toast.error(`Only ${maxStock} left in stock`);
        return;
      }

      // Create cart item
      const cartItem = {
        menuItemId: menuItem.id,
        menuItem: { ...menuItem },
        quantity: 1,
        subtotal: menuItem.price,
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
      <div className="bg-off-white mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Search Header */}
        <div className="mb-8">
          <h1 className="text-brand text-primary-dark-green mb-4 text-3xl font-bold">
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
                className="selectable border-primary-dark-green focus:border-primary-dark-green text-primary-dark-green flex-1 border-2"
              />
              <Button
                onClick={handleSearch}
                className="btn-primary px-6"
                disabled={!searchInput.trim() || loading}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Search Results */}
        {query && (
          <div className="mb-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-heading text-primary-dark-green text-xl font-semibold">
                Search results for "{query}"
              </h2>
              {results.length > 0 && (
                <div className="text-sm text-gray-600">
                  {results.reduce(
                    (total, restaurant) =>
                      total +
                      ((restaurant as any).matchingMenuItems?.length || 0),
                    0
                  )}{' '}
                  dishes found in {results.length} restaurant
                  {results.length > 1 ? 's' : ''}
                </div>
              )}
            </div>

            {error && (
              <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
                <p className="text-red-800">{error}</p>
              </div>
            )}

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Loader2 className="text-primary-dark-green mx-auto mb-4 h-8 w-8 animate-spin" />
                  <p className="text-gray-600">Searching restaurants...</p>
                </div>
              </div>
            ) : results.length === 0 && !error ? (
              <Card className="restaurant-card">
                <CardContent className="p-8 text-center">
                  <Search className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                  <h3 className="text-primary-dark-green mb-2 text-lg font-semibold">
                    No restaurants found
                  </h3>
                  <p className="mb-4 text-gray-600">
                    We couldn't find any restaurants matching "{query}". Try
                    searching with different keywords.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {results.map((restaurant) => {
                  const hasMatchingDishes = (restaurant as any)
                    .hasMatchingItems;

                  return (
                    <div key={restaurant.id} className="space-y-4">
                      {/* Restaurant Header */}
                      <div className="flex items-center justify-between rounded-lg bg-gray-50 p-4">
                        <div className="flex items-center space-x-4">
                          <div className="flex-shrink-0">
                            {restaurant.imageUrl ? (
                              <img
                                src={restaurant.imageUrl}
                                alt={restaurant.name}
                                className="h-16 w-16 rounded-lg object-cover"
                              />
                            ) : (
                              <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-gray-200">
                                <span className="text-xs text-gray-400">
                                  No image
                                </span>
                              </div>
                            )}
                          </div>
                          <div>
                            <Link
                              href={`/restaurants/${restaurant.id}`}
                              className="hover:underline"
                            >
                              <h3 className="text-primary-dark-green text-lg font-bold">
                                {restaurant.name}
                              </h3>
                            </Link>
                            <p className="text-sm text-gray-600">
                              {restaurant.cuisineTypes.join(', ')}
                            </p>
                            <div className="mt-1 flex items-center space-x-4">
                              <div className="flex items-center space-x-1">
                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                <span className="text-sm font-medium">
                                  {restaurant.rating}
                                </span>
                              </div>
                              <div className="flex items-center space-x-1 text-gray-500">
                                <MapPin className="h-3 w-3" />
                                <span className="text-sm">
                                  {restaurant.distance.toFixed(1)} km
                                </span>
                              </div>
                              <Badge
                                className={`text-xs ${
                                  restaurant.isOpen
                                    ? 'bg-accent-leaf-green text-primary-dark-green'
                                    : 'bg-gray-500 text-white'
                                }`}
                              >
                                {restaurant.isOpen ? 'Open' : 'Closed'}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Matching Dishes - Show prominently when searching for dishes */}
                      {hasMatchingDishes ? (
                        <div className="grid grid-cols-1 gap-4 pl-4 md:grid-cols-2 lg:grid-cols-3">
                          {(restaurant as any).matchingMenuItems.map(
                            (item: any) => (
                              <Card
                                key={item.id}
                                className="border border-green-200 transition-shadow hover:shadow-md"
                              >
                                <CardContent className="p-4">
                                  <div className="mb-2 flex items-start justify-between">
                                    <div className="flex-1">
                                      <h4 className="text-primary-dark-green font-semibold">
                                        {item.name}
                                      </h4>
                                      {item.description && (
                                        <p className="mt-1 line-clamp-2 text-sm text-gray-600">
                                          {item.description}
                                        </p>
                                      )}
                                    </div>
                                    {item.imageUrl && (
                                      <img
                                        src={item.imageUrl}
                                        alt={item.name}
                                        className="ml-3 h-16 w-16 rounded-lg object-cover"
                                      />
                                    )}
                                  </div>

                                  <div className="mt-3 flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                      <div className="flex items-center space-x-1">
                                        {item.originalPrice && (
                                          <span className="text-sm text-gray-500 line-through">
                                            ₹{item.originalPrice}
                                          </span>
                                        )}
                                        <span className="text-primary-dark-green font-bold">
                                          ₹{item.price}
                                        </span>
                                      </div>
                                      {item.discount > 0 && (
                                        <Badge className="bg-red-100 text-xs text-red-800">
                                          {item.discount}% OFF
                                        </Badge>
                                      )}
                                    </div>

                                    <div className="flex items-center space-x-2">
                                      {item.featured && (
                                        <Badge className="bg-yellow-100 text-xs text-yellow-800">
                                          Bestseller
                                        </Badge>
                                      )}
                                      {(() => {
                                        const quantity = getItemQuantityInCart(
                                          item.id
                                        );
                                        return quantity > 0 ? (
                                          <div className="flex items-center space-x-2">
                                            <span className="text-primary-dark-green text-sm font-medium">
                                              {quantity}
                                            </span>
                                            <div className="flex items-center space-x-1">
                                              <Button
                                                size="sm"
                                                variant="outline"
                                                className="border-primary-dark-green text-primary-dark-green hover:bg-primary-dark-green h-6 w-6 p-0 hover:text-white"
                                                onClick={() => {
                                                  if (quantity === 1) {
                                                    removeItem(item.id);
                                                  } else {
                                                    updateQuantity(
                                                      item.id,
                                                      quantity - 1
                                                    );
                                                  }
                                                }}
                                              >
                                                <Minus className="h-3 w-3" />
                                              </Button>
                                              <Button
                                                size="sm"
                                                variant="outline"
                                                className="border-primary-dark-green text-primary-dark-green hover:bg-primary-dark-green h-6 w-6 p-0 hover:text-white"
                                                onClick={() =>
                                                  updateQuantity(
                                                    item.id,
                                                    quantity + 1
                                                  )
                                                }
                                              >
                                                <Plus className="h-3 w-3" />
                                              </Button>
                                            </div>
                                          </div>
                                        ) : (
                                          <Button
                                            size="sm"
                                            className="btn-primary px-3 py-1 text-xs"
                                            onClick={() =>
                                              handleAddToCart(item, restaurant)
                                            }
                                            disabled={!restaurant.isOpen}
                                          >
                                            Add
                                          </Button>
                                        );
                                      })()}
                                    </div>
                                  </div>

                                  {/* Dietary tags */}
                                  {item.dietaryTags &&
                                    item.dietaryTags.length > 0 && (
                                      <div className="mt-2 flex flex-wrap gap-1">
                                        {item.dietaryTags
                                          .slice(0, 3)
                                          .map((tag: string) => (
                                            <Badge
                                              key={tag}
                                              className="bg-gray-100 text-xs text-gray-600"
                                            >
                                              {tag}
                                            </Badge>
                                          ))}
                                      </div>
                                    )}
                                </CardContent>
                              </Card>
                            )
                          )}
                        </div>
                      ) : (
                        /* Show restaurant info when no specific dishes match */
                        <div className="pl-4">
                          <p className="text-sm text-gray-600">
                            Restaurant matches your search criteria
                          </p>
                          <Link href={`/restaurants/${restaurant.id}`}>
                            <Button className="btn-primary mt-2">
                              View Menu
                            </Button>
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
              <Search className="mx-auto mb-4 h-12 w-12 text-gray-400" />
              <h3 className="text-primary-dark-green mb-2 text-lg font-semibold">
                Start searching
              </h3>
              <p className="text-gray-600">
                Enter a restaurant name, dish, or cuisine type to find what
                you're looking for.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </CustomerLayout>
  );
}
