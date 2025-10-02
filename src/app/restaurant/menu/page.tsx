'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, ChefHat, Clock, DollarSign, Package, Save, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import RestaurantLayout from '@/components/layouts/restaurant-layout';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

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
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [restaurant, setRestaurant] = useState<any>(null);
  const [stockInputs, setStockInputs] = useState<Record<string, string>>({});
  const [loadingItems, setLoadingItems] = useState<Set<string>>(new Set());
  const [showStockDialog, setShowStockDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [stockDialogValue, setStockDialogValue] = useState<string>('');
  const [pendingChanges, setPendingChanges] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!session) {
      router.push('/restaurant/auth/signin');
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
        toast.error('Please complete your restaurant setup first');
        router.push('/restaurant/onboarding');
      }
    } catch (error) {
      console.error('Error fetching restaurant data:', error);
      toast.error('Failed to load restaurant data');
    }
  };

  const fetchMenuItems = async (restaurantId: string) => {
    try {
      const response = await fetch(
        `/api/menu-items?restaurantId=${restaurantId}`
      );
      const data = await response.json();

      if (response.ok && data.success) {
        // Ensure all items have available: true
        const itemsWithAvailableTrue = (data.data || []).map((item: MenuItem) => ({
          ...item,
          available: true // Force available to true
        }));
        setMenuItems(itemsWithAvailableTrue);

        // Initialize stock inputs with current stock values
        const initialStockInputs: Record<string, string> = {};
        itemsWithAvailableTrue.forEach((item: MenuItem) => {
          initialStockInputs[item.id] = (item.stockLeft || 0).toString();
        });
        setStockInputs(initialStockInputs);
        
        // Clear any pending changes on load
        setPendingChanges(new Set());

        // Set first category as selected
        const categories = getCategories(data.data || []);
        if (categories.length > 0) {
          setSelectedCategory(categories[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching menu items:', error);
      toast.error('Failed to load menu items');
    } finally {
      setLoading(false);
    }
  };

  const toggleItemAvailability = async (itemId: string) => {
    const item = menuItems.find((i) => i.id === itemId);
    if (!item) return;

    // If item has stock, mark as out of stock (set stock to 0)
    if ((item.stockLeft || 0) > 0) {
      await updateStock(itemId, 0);
    } else {
      // If item is out of stock, show dialog to set stock
      setSelectedItem(item);
      setStockDialogValue('');
      setShowStockDialog(true);
    }
  };

  const updateStock = async (itemId: string, newStock: number) => {
    setLoadingItems(prev => new Set(prev).add(itemId));
    
    try {
      const item = menuItems.find((i) => i.id === itemId);
      if (!item) return;

      // Create FormData to match the API expectation
      const formData = new FormData();
      formData.append('stockLeft', newStock.toString());

      // ALWAYS keep available as true - never set to false
      formData.append('available', 'true');
      
      console.log('Updating stock for item:', {
        itemId,
        itemName: item.name,
        newStock,
        available: 'true' // Always true
      });

      const response = await fetch(`/api/menu-items/${itemId}`, {
        method: 'PUT',
        body: formData,
      });

      if (response.ok) {
        setMenuItems((prev) =>
          prev.map((i) =>
            i.id === itemId
              ? {
                  ...i,
                  stockLeft: newStock,
                  available: true, // ALWAYS keep as available - never false
                }
              : i
          )
        );

        // Update the stock input to reflect the new value
        setStockInputs(prev => ({
          ...prev,
          [itemId]: newStock.toString()
        }));

        // Remove from pending changes
        setPendingChanges(prev => {
          const newSet = new Set(prev);
          newSet.delete(itemId);
          return newSet;
        });

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
    } finally {
      setLoadingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  };

  const handleStockInputChange = (itemId: string, value: string) => {
    setStockInputs(prev => ({
      ...prev,
      [itemId]: value
    }));
    
    // Add to pending changes if value is different from current stock
    const item = menuItems.find(i => i.id === itemId);
    const currentStock = item?.stockLeft || 0;
    const newStock = parseInt(value) || 0;
    
    // Check if there's a meaningful change
    const hasChanged = value !== '' && value !== currentStock.toString() && newStock !== currentStock;
    
    console.log('Stock input change:', {
      itemId,
      value,
      currentStock,
      newStock,
      hasChanged
    });
    
    if (hasChanged) {
      setPendingChanges(prev => new Set(prev).add(itemId));
    } else {
      setPendingChanges(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  };

  const handleSaveStock = async (itemId: string) => {
    const stockValue = stockInputs[itemId];
    if (stockValue === undefined || stockValue === '') return;
    
    const newStock = parseInt(stockValue);
    if (isNaN(newStock) || newStock < 0) {
      toast.error('Please enter a valid stock quantity');
      return;
    }
    
    await updateStock(itemId, newStock);
  };

  const handleStockDialogSubmit = async () => {
    if (!selectedItem) return;
    
    const stockValue = parseInt(stockDialogValue);
    if (isNaN(stockValue) || stockValue < 0) {
      toast.error('Please enter a valid stock quantity');
      return;
    }
    
    await updateStock(selectedItem.id, stockValue);
    setShowStockDialog(false);
    setSelectedItem(null);
    setStockDialogValue('');
  };

  const getCategories = (items: MenuItem[]): string[] => {
    const categories = Array.from(new Set(items.map((item) => item.category)));
    return categories.sort();
  };

  const getItemsByCategory = (category: string): MenuItem[] => {
    return menuItems.filter((item) => item.category === category);
  };

  const categories = getCategories(menuItems);
  const selectedCategoryItems = selectedCategory
    ? getItemsByCategory(selectedCategory)
    : [];

  if (loading) {
    return (
      <RestaurantLayout title="Menu">
        <div className="flex min-h-96 items-center justify-center">
          <div className="h-32 w-32 animate-spin rounded-full border-b-2 border-orange-600"></div>
        </div>
      </RestaurantLayout>
    );
  }

  if (!restaurant) {
    return (
      <RestaurantLayout title="Menu">
        <div className="flex min-h-96 items-center justify-center">
          <div className="text-center">
            <h2 className="mb-4 text-2xl font-bold">
              Restaurant Setup Required
            </h2>
            <p className="mb-4 text-gray-600">
              Please complete your restaurant setup first
            </p>
            <Button onClick={() => router.push('/restaurant/onboarding')}>
              Complete Setup
            </Button>
          </div>
        </div>
      </RestaurantLayout>
    );
  }

  return (
    <RestaurantLayout title="Menu">
      <div className="animate-fade-in space-y-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold" style={{ color: '#002a01' }}>
            Menu Stock Management
          </h1>
          <p className="mt-2 text-gray-600">
            Manage availability of your menu items
          </p>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          {/* Categories Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Categories</CardTitle>
                <CardDescription>
                  Select a category to manage items
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {categories.map((category) => (
                  <div
                    key={category}
                    className={`cursor-pointer rounded-lg p-3 transition-colors ${
                      selectedCategory === category
                        ? 'text-white'
                        : 'hover:bg-gray-100'
                    }`}
                    onClick={() => setSelectedCategory(category)}
                    style={{
                      backgroundColor:
                        selectedCategory === category ? '#002a01' : undefined,
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
                  <CardDescription>
                    Toggle availability for items in this category
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {selectedCategoryItems.length === 0 ? (
                    <div className="py-12 text-center">
                      <ChefHat className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                      <p className="mb-4 text-gray-500">
                        No items in this category yet
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {selectedCategoryItems.map((item) => (
                        <div key={item.id} className="rounded-lg border p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="mb-2 flex items-center gap-3">
                                <h3 className="text-lg font-semibold">
                                  {item.name}
                                </h3>
                                {item.featured && (
                                  <Badge variant="secondary">Featured</Badge>
                                )}
                                <Badge
                                  variant={
                                    (item.stockLeft || 0) > 0 ? 'default' : 'destructive'
                                  }
                                  style={{
                                    backgroundColor: (item.stockLeft || 0) > 0
                                      ? '#d1f86a'
                                      : undefined,
                                    color: (item.stockLeft || 0) > 0
                                      ? '#002a01'
                                      : undefined,
                                  }}
                                >
                                  {(item.stockLeft || 0) > 0
                                    ? 'Available'
                                    : 'Out of Stock'}
                                </Badge>
                                {item.stockLeft !== null &&
                                  item.stockLeft !== undefined && (
                                    <Badge
                                      variant="outline"
                                      className={`text-xs ${
                                        item.stockLeft === 0
                                          ? 'border-red-300 bg-red-50 text-red-700'
                                          : item.stockLeft <= 5
                                            ? 'border-orange-300 bg-orange-50 text-orange-700'
                                            : 'border-green-300 bg-green-50 text-green-700'
                                      }`}
                                    >
                                      <Package className="mr-1 h-3 w-3" />
                                      {item.stockLeft} left
                                    </Badge>
                                  )}
                              </div>

                              <p className="mb-3 text-gray-600">
                                {item.description}
                              </p>

                              <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                                <div className="flex items-center gap-1">
                                  <DollarSign className="h-4 w-4" />
                                  <span className="font-medium">
                                    ₹{item.price}
                                  </span>
                                  {item.originalPrice && (
                                    <span className="ml-1 line-through">
                                      ₹{item.originalPrice}
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock className="h-4 w-4" />
                                  <span>{item.preparationTime} mins</span>
                                </div>
                              </div>

                              {item.dietaryTags.length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-1">
                                  {item.dietaryTags.map((tag) => (
                                    <Badge
                                      key={tag}
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              )}

                              {/* Enhanced Stock Management */}
                              <div className={`mt-4 rounded-lg p-4 transition-colors ${
                                pendingChanges.has(item.id) 
                                  ? 'bg-yellow-50 border-2 border-yellow-300 shadow-sm' 
                                  : 'bg-gray-50 border border-gray-200'
                              }`}>
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <Label className="text-sm font-medium text-gray-700">
                                      Stock Left
                                    </Label>
                                    {loadingItems.has(item.id) && (
                                      <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
                                    )}
                                    {pendingChanges.has(item.id) && !loadingItems.has(item.id) && (
                                      <div className="flex items-center gap-1 text-xs text-yellow-700 bg-yellow-100 px-2 py-1 rounded">
                                        <AlertCircle className="h-3 w-3" />
                                        <span className="font-medium">Unsaved changes</span>
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Input
                                      type="number"
                                      value={
                                        stockInputs[item.id] ??
                                        item.stockLeft ??
                                        ''
                                      }
                                      onChange={(e) => handleStockInputChange(item.id, e.target.value)}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter' && pendingChanges.has(item.id)) {
                                          handleSaveStock(item.id);
                                        }
                                      }}
                                      className="h-8 w-20 text-center font-medium"
                                      min="0"
                                      disabled={loadingItems.has(item.id)}
                                      placeholder="0"
                                      // NO onBlur - no auto-save!
                                    />
                                    {pendingChanges.has(item.id) && (
                                      <Button
                                        size="sm"
                                        onClick={() => handleSaveStock(item.id)}
                                        disabled={loadingItems.has(item.id)}
                                        className="h-8 px-3 bg-green-600 hover:bg-green-700 text-white font-medium shadow-sm"
                                      >
                                        {loadingItems.has(item.id) ? (
                                          <Loader2 className="h-3 w-3 animate-spin" />
                                        ) : (
                                          <>
                                            <Save className="h-3 w-3 mr-1" />
                                            Save
                                          </>
                                        )}
                                      </Button>
                                    )}
                                  </div>
                                </div>
                                {item.stockLeft === 0 && (
                                  <div className="mt-2 flex items-center gap-2 text-sm text-red-600 bg-red-50 px-2 py-1 rounded">
                                    <AlertCircle className="h-4 w-4" />
                                    <span className="font-medium">Out of stock</span>
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="ml-4 flex flex-col gap-2">
                              <Button
                                size="sm"
                                variant={(item.stockLeft || 0) > 0 ? 'outline' : 'default'}
                                onClick={() => toggleItemAvailability(item.id)}
                                style={{
                                  backgroundColor: (item.stockLeft || 0) > 0
                                    ? undefined
                                    : '#002a01',
                                  color: (item.stockLeft || 0) > 0 ? undefined : 'white',
                                }}
                              >
                                {(item.stockLeft || 0) > 0 ? (
                                  <>
                                    <EyeOff className="mr-2 h-4 w-4" />
                                    Mark Out of Stock
                                  </>
                                ) : (
                                  <>
                                    <Eye className="mr-2 h-4 w-4" />
                                    Add Stock
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
                <CardContent className="py-12 text-center">
                  <ChefHat className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                  <p className="text-gray-500">
                    Select a category to manage menu items
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Stock Dialog */}
      <Dialog open={showStockDialog} onOpenChange={setShowStockDialog}>
        <DialogContent className="sm:max-w-md bg-white border-2 border-gray-200 shadow-2xl rounded-lg">
          <DialogHeader className="bg-white pb-4">
            <DialogTitle className="text-xl font-semibold text-gray-900">Set Stock Quantity</DialogTitle>
            <DialogDescription className="text-gray-600 mt-2">
              Enter the stock quantity for <span className="font-medium text-gray-800">{selectedItem?.name}</span>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 bg-white py-4">
            <div>
              <Label htmlFor="stock-dialog-input" className="text-gray-700 font-medium text-sm">Stock Quantity</Label>
              <Input
                id="stock-dialog-input"
                type="number"
                value={stockDialogValue}
                onChange={(e) => setStockDialogValue(e.target.value)}
                placeholder="Enter stock quantity"
                min="0"
                className="mt-2 bg-white border-2 border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 rounded-md h-10 text-center font-medium"
                autoFocus
              />
            </div>
          </div>
          <DialogFooter className="bg-white pt-4 border-t border-gray-100">
            <Button
              variant="outline"
              onClick={() => setShowStockDialog(false)}
              className="bg-white border-2 border-gray-300 hover:bg-gray-50 text-gray-700 font-medium"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleStockDialogSubmit}
              className="bg-green-600 hover:bg-green-700 text-white font-medium px-6"
            >
              Set Stock
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </RestaurantLayout>
  );
}

