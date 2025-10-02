'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import OperationsLayout from '@/components/layouts/operations-layout';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  ShoppingCart,
  Plus,
  Search,
  Store,
  Edit,
  Trash2,
  ImageIcon,
  DollarSign,
  Clock,
  Tag,
  Save,
  RefreshCw,
  Filter,
  Eye,
  ToggleLeft,
  ToggleRight,
  ArrowLeft,
} from 'lucide-react';
import Link from 'next/link';

interface Restaurant {
  id: string;
  name: string;
  ownerName: string;
  address: string;
  phone: string;
  email: string;
}

interface MenuItem {
  id?: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  preparationTime: number;
  imageUrl?: string;
  dietaryType?: 'Veg' | 'Non-Veg';
  dietaryTags?: string[];
  category?: string;
  restaurantId: string;
  restaurantName?: string;
  featured?: boolean;
  hackOfTheDay?: boolean;
  stockLeft?: number | null;
}

const DIETARY_TYPES = ['Veg', 'Non-Veg'];

export default function RestaurantMenuManagementPage() {
  const params = useParams();
  const restaurantId = params?.id as string;
  if (!restaurantId) {
    return <div className="text-red-500">Invalid restaurant ID.</div>;
  }

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  const [formData, setFormData] = useState<MenuItem>({
    name: '',
    description: '',
    price: 0,
    originalPrice: undefined,
    preparationTime: 15,
    imageUrl: '',
    dietaryType: 'Veg',
    restaurantId: restaurantId,
    hackOfTheDay: false,
    stockLeft: 10, // Default stock of 10
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [showHackLimitPopup, setShowHackLimitPopup] = useState(false);
  const [hackLimitMessage, setHackLimitMessage] = useState('');
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadData();
  }, [restaurantId]);

  // Auto-scroll to form when it's shown
  useEffect(() => {
    if (showAddForm && formRef.current) {
      // Small delay to ensure the form is rendered
      setTimeout(() => {
        formRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      }, 100);
    }
  }, [showAddForm]);

  const validateHackOfTheDay = async (newHackStatus: boolean, dietaryType: 'Veg' | 'Non-Veg', currentItemId?: string) => {
    try {
      if (!newHackStatus) return true; // If unchecking, always allow

      // Call global validation API
      const response = await fetch('/api/operations/validate-hack-of-the-day', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dietaryType,
          currentItemId,
        }),
      });

      const result = await response.json();

      if (!result.success || !result.isValid) {
        setHackLimitMessage(result.errorMessage || 'Validation failed');
        setShowHackLimitPopup(true);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in validateHackOfTheDay:', error);
      return true; // Allow operation to continue if validation fails
    }
  };

  const loadData = async () => {
    try {
      setIsLoading(true);

      // Load restaurant details
      const restaurantRes = await fetch(`/api/restaurants/${restaurantId}`);
      const restaurantData = await restaurantRes.json();
      if (restaurantData.success) {
        setRestaurant(restaurantData.data);
      }

      // Load menu items (show all items including out of stock)
      const menuRes = await fetch(
        `/api/menu-items?restaurantId=${restaurantId}&showAll=1`
      );
      const menuData = await menuRes.json();
      if (menuData.success) {
        setMenuItems(menuData.data || []);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = editingItem
        ? `/api/menu-items/${editingItem.id}`
        : '/api/menu-items';
      const method = editingItem ? 'PUT' : 'POST';

      // Create FormData for file upload
      const formDataToSend = new FormData();
      formDataToSend.append('restaurantId', restaurantId);
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('price', formData.price.toString());
      formDataToSend.append(
        'preparationTime',
        formData.preparationTime.toString()
      );
      formDataToSend.append('dietaryType', formData.dietaryType || 'Veg');
      formDataToSend.append('featured', formData.featured ? 'true' : 'false');
      formDataToSend.append('hackOfTheDay', formData.hackOfTheDay ? 'true' : 'false');
      formDataToSend.append('stockLeft', (formData.stockLeft || 10).toString());

      if (formData.originalPrice) {
        formDataToSend.append(
          'originalPrice',
          formData.originalPrice.toString()
        );
      }

      if (formData.stockLeft !== null && formData.stockLeft !== undefined) {
        formDataToSend.append('stockLeft', formData.stockLeft.toString());
      }

      if (selectedImage) {
        formDataToSend.append('image', selectedImage);
      }

      const response = await fetch(url, {
        method,
        body: formDataToSend,
      });

      if (response.ok) {
        // Reset form
        setFormData({
          name: '',
          description: '',
          price: 0,
          originalPrice: undefined,
          preparationTime: 15,
          imageUrl: '',
          dietaryType: 'Veg',
          restaurantId: restaurantId,
          hackOfTheDay: false,
          stockLeft: 10, // Default stock of 10
        });
        setSelectedImage(null);
        setShowAddForm(false);
        setEditingItem(null);

        // Reload menu items
        loadData();
      } else {
        const errorData = await response.json();
        
        // If it's a hack of the day validation error, show the popup
        if (errorData.error && errorData.error.includes('hack of the day')) {
          setHackLimitMessage(errorData.error);
          setShowHackLimitPopup(true);
          // Reset the hack of the day checkbox
          setFormData(prev => ({
            ...prev,
            hackOfTheDay: false,
          }));
        } else {
          alert(`Error: ${errorData.error || 'Failed to save menu item'}`);
        }
      }
    } catch (error) {
      console.error('Error saving menu item:', error);
      alert('Failed to save menu item');
    }
  };

  const handleEdit = (item: MenuItem) => {
    console.log('Editing item:', {
      name: item.name,
      dietaryTags: item.dietaryTags,
      dietaryType: item.dietaryType
    });
    
    setFormData({
      ...item,
      dietaryType: item.dietaryType || 'Veg', // Use dietaryType from API or default to Veg
    });
    setEditingItem(item);
    setShowAddForm(true);
  };

  const handleDelete = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this menu item?')) {
      return;
    }

    try {
      const response = await fetch(`/api/menu-items/${itemId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        loadData();
      } else {
        alert('Failed to delete menu item');
      }
    } catch (error) {
      console.error('Error deleting menu item:', error);
      alert('Failed to delete menu item');
    }
  };

  const toggleDietaryTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      dietaryTags: (prev.dietaryTags || []).includes(tag)
        ? (prev.dietaryTags || []).filter((t) => t !== tag)
        : [...(prev.dietaryTags || []), tag],
    }));
  };

  const filteredMenuItems = menuItems.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <OperationsLayout type="restaurant">
        <div className="space-y-6">
          <div className="py-12 text-center">
            <p className="text-gray-500">Loading menu management...</p>
          </div>
        </div>
      </OperationsLayout>
    );
  }

  return (
    <OperationsLayout type="restaurant">
      <div className="space-y-6">
        {/* Header */}
        <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-4">
            <Link href="/operations/restaurant/restaurants">
              <Button className="touchable bg-gray-100 text-gray-700 hover:bg-gray-200">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Restaurants
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-[#002a01]">
                Menu Management
              </h1>
              <p className="mt-1 text-[#002a01]/70">
                {restaurant
                  ? `Managing menu for ${restaurant.name}`
                  : 'Loading restaurant...'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Button
              onClick={loadData}
              className="bg-[#d1f86a] font-semibold text-[#002a01] hover:bg-[#d1f86a]/90"
              disabled={isLoading}
            >
              <RefreshCw
                className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`}
              />
              Refresh Data
            </Button>

            <Button
              onClick={() => {
                setShowAddForm(true);
                setEditingItem(null);
                setFormData({
                  ...formData,
                  restaurantId: restaurantId,
                });
              }}
              className="bg-[#ffd500] font-semibold text-[#002a01] hover:bg-[#ffd500]/90"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Menu Item
            </Button>
          </div>
        </div>

        {/* Restaurant Info Card */}
        {restaurant && (
          <Card className="border-0 bg-white/70 shadow-lg backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-[#002a01]">
                    {restaurant.name}
                  </h3>
                  <p className="text-gray-600">Owner: {restaurant.ownerName}</p>
                  <p className="text-sm text-gray-500">{restaurant.address}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Total Menu Items</p>
                  <p className="text-2xl font-bold text-[#002a01]">
                    {menuItems.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Search */}
        <Card className="border-0 bg-white/70 shadow-lg backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
              <Input
                type="text"
                placeholder="Search menu items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-10 rounded-lg border-2 border-gray-300 pl-10 focus:border-[#002a01] focus:outline-none"
              />
            </div>
          </CardContent>
        </Card>

        {/* Add/Edit Menu Item Form */}
        {showAddForm && (
          <Card ref={formRef} className="border-0 bg-white/70 shadow-lg backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-[#002a01]">
                {editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}
              </CardTitle>
              <CardDescription className="text-[#002a01]/60">
                {editingItem
                  ? 'Update the menu item details'
                  : 'Add a new item to the restaurant menu'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  {/* Basic Information */}
                  <div className="space-y-4">
                    <div>
                      <Label
                        htmlFor="name"
                        className="text-primary-dark-green text-sm font-medium"
                      >
                        Item Name *
                      </Label>
                      <Input
                        id="name"
                        type="text"
                        placeholder="Enter item name"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        required
                        className="selectable mt-1 h-10 rounded-lg border-2 border-gray-300"
                      />
                    </div>

                    <div>
                      <Label
                        htmlFor="description"
                        className="text-primary-dark-green text-sm font-medium"
                      >
                        Description *
                      </Label>
                      <textarea
                        id="description"
                        placeholder="Enter item description"
                        value={formData.description}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            description: e.target.value,
                          })
                        }
                        required
                        className="focus:border-primary-dark-green selectable mt-1 h-20 w-full rounded-lg border-2 border-gray-300 px-3 py-2"
                      />
                    </div>

                    <div>
                      <Label className="text-primary-dark-green text-sm font-medium">
                        Dietary Type *
                      </Label>
                      <select
                        value={formData.dietaryType}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            dietaryType: e.target.value as 'Veg' | 'Non-Veg',
                          })
                        }
                        required
                        className="focus:border-primary-dark-green selectable mt-1 h-10 w-full rounded-lg border-2 border-gray-300 px-3"
                      >
                        {DIETARY_TYPES.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Pricing and Details */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label
                          htmlFor="price"
                          className="text-primary-dark-green text-sm font-medium"
                        >
                          Price (₹) *
                        </Label>
                        <Input
                          id="price"
                          type="number"
                          placeholder="0"
                          value={formData.price}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              price: Number(e.target.value),
                            })
                          }
                          required
                          min="0"
                          step="0.01"
                          className="selectable mt-1 h-10 rounded-lg border-2 border-gray-300"
                        />
                      </div>

                      <div>
                        <Label
                          htmlFor="originalPrice"
                          className="text-primary-dark-green text-sm font-medium"
                        >
                          Original Price (₹)
                        </Label>
                        <Input
                          id="originalPrice"
                          type="number"
                          placeholder="0"
                          value={formData.originalPrice || ''}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              originalPrice: e.target.value
                                ? Number(e.target.value)
                                : undefined,
                            })
                          }
                          min="0"
                          step="0.01"
                          className="selectable mt-1 h-10 rounded-lg border-2 border-gray-300"
                        />
                      </div>
                    </div>

                    <div>
                      <Label
                        htmlFor="preparationTime"
                        className="text-primary-dark-green text-sm font-medium"
                      >
                        Preparation Time (minutes) *
                      </Label>
                      <Input
                        id="preparationTime"
                        type="number"
                        placeholder="15"
                        value={formData.preparationTime}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            preparationTime: Number(e.target.value),
                          })
                        }
                        required
                        min="1"
                        className="selectable mt-1 h-10 rounded-lg border-2 border-gray-300"
                      />
                    </div>

                    <div>
                      <Label
                        htmlFor="stockLeft"
                        className="text-primary-dark-green text-sm font-medium"
                      >
                        Initial Stock *
                      </Label>
                      <Input
                        id="stockLeft"
                        type="number"
                        placeholder="10"
                        value={formData.stockLeft || ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            stockLeft: Number(e.target.value),
                          })
                        }
                        required
                        min="0"
                        className="selectable mt-1 h-10 rounded-lg border-2 border-gray-300"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Set the initial stock quantity for this item
                      </p>
                    </div>

                    <div>
                      <Label
                        htmlFor="image"
                        className="text-primary-dark-green text-sm font-medium"
                      >
                        Item Image
                      </Label>
                      <Input
                        id="image"
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          setSelectedImage(
                            e.target.files ? e.target.files[0] : null
                          )
                        }
                        className="selectable mt-1 h-10 rounded-lg border-2 border-gray-300 file:mr-4 file:border-0 file:bg-gray-100 file:px-4 file:py-2 file:text-sm file:font-semibold"
                      />
                    </div>

                    {/* Featured Product Toggle */}
                    <div className="flex items-center space-x-2">
                      <input
                        id="featured"
                        type="checkbox"
                        checked={formData.featured || false}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            featured: e.target.checked,
                          })
                        }
                        className="text-primary-dark-green focus:ring-primary-dark-green h-4 w-4 rounded border-gray-300"
                      />
                      <Label
                        htmlFor="featured"
                        className="text-primary-dark-green text-sm font-medium"
                      >
                        Featured Product
                      </Label>
                    </div>

                    {/* Hack of the Day Toggle */}
                    <div className="flex items-center space-x-2">
                      <input
                        id="hackOfTheDay"
                        type="checkbox"
                        checked={formData.hackOfTheDay || false}
                        onChange={async (e) => {
                          const newHackStatus = e.target.checked;
                          
                          // If unchecking, always allow
                          if (!newHackStatus) {
                            setFormData({
                              ...formData,
                              hackOfTheDay: newHackStatus,
                            });
                            return;
                          }
                          
                          // If checking, validate first
                          const isValid = await validateHackOfTheDay(newHackStatus, formData.dietaryType || 'Veg', editingItem?.id);
                          if (isValid) {
                            setFormData({
                              ...formData,
                              hackOfTheDay: newHackStatus,
                            });
                          } else {
                            // Reset checkbox to previous state if validation fails
                            e.target.checked = formData.hackOfTheDay || false;
                          }
                        }}
                        className="text-primary-dark-green focus:ring-primary-dark-green h-4 w-4 rounded border-gray-300"
                      />
                      <Label
                        htmlFor="hackOfTheDay"
                        className="text-primary-dark-green text-sm font-medium"
                      >
                        Hack of the Day
                      </Label>
                    </div>

                    {/* Few Stocks Left Indicator */}
                    <div className="flex items-center space-x-2">
                      <input
                        id="fewStocksLeft"
                        type="checkbox"
                        checked={
                          formData.stockLeft !== null &&
                          formData.stockLeft !== undefined &&
                          formData.stockLeft <= 5
                        }
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({ ...formData, stockLeft: 5 }); // Set to 5 to indicate few stocks left
                          } else {
                            setFormData({ ...formData, stockLeft: null });
                          }
                        }}
                        className="text-primary-dark-green focus:ring-primary-dark-green h-4 w-4 rounded border-gray-300"
                      />
                      <Label
                        htmlFor="fewStocksLeft"
                        className="text-primary-dark-green text-sm font-medium"
                      >
                        Mark as "Few Stocks Left"
                      </Label>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4">
                  <Button
                    type="submit"
                    className="bg-accent-leaf-green hover:bg-accent-leaf-green/90 text-primary-dark-green touchable"
                  >
                    <Save className="mr-2 h-4 w-4" />
                    {editingItem ? 'Update Item' : 'Add Item'}
                  </Button>
                  <Button
                    type="button"
                    onClick={() => {
                      setShowAddForm(false);
                      setEditingItem(null);
                    }}
                    className="touchable bg-gray-100 text-gray-700 hover:bg-gray-200"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Menu Items List */}
        <Card className="restaurant-card">
          <CardHeader>
            <CardTitle className="text-heading text-primary-dark-green text-xl">
              Menu Items ({filteredMenuItems.length})
            </CardTitle>
            <CardDescription>
              {restaurant ? `Menu items for ${restaurant.name}` : 'Loading...'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredMenuItems.length === 0 ? (
              <div className="py-8 text-center">
                <ShoppingCart className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                <h3 className="text-primary-dark-green mb-2 text-lg font-semibold">
                  No menu items found
                </h3>
                <p className="mb-4 text-gray-600">
                  {searchQuery
                    ? 'Try adjusting your search'
                    : 'Start by adding some menu items'}
                </p>
                <Button
                  onClick={() => setShowAddForm(true)}
                  className="bg-accent-leaf-green hover:bg-accent-leaf-green/90 text-primary-dark-green touchable"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add First Item
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredMenuItems.map((item) => (
                  <Card key={item.id} className="border">
                    <CardContent className="p-4">
                      <div className="mb-3 flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="text-primary-dark-green font-semibold">
                            {item.name}
                          </h4>
                          <p className="line-clamp-2 text-sm text-gray-600">
                            {item.description}
                          </p>
                        </div>
                        <div className="ml-2 flex gap-1">
                          <Button
                            onClick={() => handleEdit(item)}
                            className="touchable bg-blue-100 p-1 text-blue-700 hover:bg-blue-200"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            onClick={() => handleDelete(item.id!)}
                            className="touchable bg-red-100 p-1 text-red-700 hover:bg-red-200"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <Badge
                              className={`text-xs ${(item.dietaryTags && item.dietaryTags.includes('Veg')) || item.dietaryType === 'Veg' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                            >
                              {item.dietaryType ||
                                (item.dietaryTags &&
                                  item.dietaryTags.find((tag) =>
                                    ['Veg', 'Non-Veg'].includes(tag)
                                  )) ||
                                'Unknown'}
                            </Badge>
                            {item.featured && (
                              <Badge className="bg-yellow-100 text-xs text-yellow-800">
                                Featured
                              </Badge>
                            )}
                            {item.stockLeft !== null &&
                              item.stockLeft !== undefined && (
                                <Badge className="bg-orange-100 text-xs text-orange-800">
                                  {item.stockLeft} left
                                </Badge>
                              )}
                          </div>
                          <div className="flex items-center gap-2">
                            {item.originalPrice && (
                              <span className="text-xs text-gray-500 line-through">
                                ₹{item.originalPrice}
                              </span>
                            )}
                            <span className="text-primary-dark-green font-semibold">
                              ₹{item.price}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-xs text-gray-600">
                          <div className="flex items-center">
                            <Clock className="mr-1 h-3 w-3" />
                            {item.preparationTime}m
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Hack Limit Popup */}
        {showHackLimitPopup && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="mx-4 max-w-md rounded-lg bg-white p-6 shadow-xl">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-red-600">
                  Hack of the Day Limit Reached
                </h3>
              </div>
              <div className="mb-6">
                <p className="text-gray-700">{hackLimitMessage}</p>
              </div>
              <div className="flex justify-end">
                <button
                  onClick={() => setShowHackLimitPopup(false)}
                  className="rounded-lg bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700"
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </OperationsLayout>
  );
}
