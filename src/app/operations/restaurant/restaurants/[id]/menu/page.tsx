"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import OperationsLayout from "@/components/layouts/operations-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  ArrowLeft
} from "lucide-react";
import Link from "next/link";

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
    restaurantId: restaurantId
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);

  useEffect(() => {
    loadData();
  }, [restaurantId]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      
      // Load restaurant details
      const restaurantRes = await fetch(`/api/restaurants/${restaurantId}`);
      const restaurantData = await restaurantRes.json();
      if (restaurantData.success) {
        setRestaurant(restaurantData.data);
      }

      // Load menu items
      const menuRes = await fetch(`/api/menu-items?restaurantId=${restaurantId}`);
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
      const url = editingItem ? `/api/menu-items/${editingItem.id}` : '/api/menu-items';
      const method = editingItem ? 'PUT' : 'POST';

      // Create FormData for file upload
      const formDataToSend = new FormData();
      formDataToSend.append('restaurantId', restaurantId);
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('price', formData.price.toString());
      formDataToSend.append('preparationTime', formData.preparationTime.toString());
      formDataToSend.append('dietaryType', formData.dietaryType || 'Veg');
      formDataToSend.append('featured', formData.featured ? 'true' : 'false');
      
      if (formData.originalPrice) {
        formDataToSend.append('originalPrice', formData.originalPrice.toString());
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
          restaurantId: restaurantId
        });
        setSelectedImage(null);
        setShowAddForm(false);
        setEditingItem(null);
        
        // Reload menu items
        loadData();
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error || 'Failed to save menu item'}`);
      }
    } catch (error) {
      console.error('Error saving menu item:', error);
      alert('Failed to save menu item');
    }
  };

  const handleEdit = (item: MenuItem) => {
    setFormData(item);
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
    setFormData(prev => ({
      ...prev,
      dietaryTags: (prev.dietaryTags || []).includes(tag)
        ? (prev.dietaryTags || []).filter(t => t !== tag)
        : [...(prev.dietaryTags || []), tag]
    }));
  };

  const filteredMenuItems = menuItems.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <OperationsLayout type="restaurant">
        <div className="space-y-6">
          <div className="text-center py-12">
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
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Link href="/operations/restaurant/restaurants">
              <Button className="bg-gray-100 hover:bg-gray-200 text-gray-700 touchable">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Restaurants
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-[#002a01]">
                Menu Management
              </h1>
              <p className="text-[#002a01]/70 mt-1">
                {restaurant ? `Managing menu for ${restaurant.name}` : 'Loading restaurant...'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button 
              onClick={loadData}
              className="bg-[#d1f86a] hover:bg-[#d1f86a]/90 text-[#002a01] font-semibold"
              disabled={isLoading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh Data
            </Button>
            
            <Button 
              onClick={() => {
                setShowAddForm(true);
                setEditingItem(null);
                setFormData({
                  ...formData,
                  restaurantId: restaurantId
                });
              }}
              className="bg-[#ffd500] hover:bg-[#ffd500]/90 text-[#002a01] font-semibold"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Menu Item
            </Button>
          </div>
        </div>

        {/* Restaurant Info Card */}
        {restaurant && (
          <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-[#002a01]">{restaurant.name}</h3>
                  <p className="text-gray-600">Owner: {restaurant.ownerName}</p>
                  <p className="text-sm text-gray-500">{restaurant.address}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Total Menu Items</p>
                  <p className="text-2xl font-bold text-[#002a01]">{menuItems.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Search */}
        <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search menu items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-10 border-2 border-gray-300 rounded-lg focus:border-[#002a01] focus:outline-none"
              />
            </div>
          </CardContent>
        </Card>

        {/* Add/Edit Menu Item Form */}
        {showAddForm && (
          <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-[#002a01]">
                {editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}
              </CardTitle>
              <CardDescription className="text-[#002a01]/60">
                {editingItem ? 'Update the menu item details' : 'Add a new item to the restaurant menu'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Basic Information */}
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name" className="text-sm font-medium text-primary-dark-green">
                        Item Name *
                      </Label>
                      <Input
                        id="name"
                        type="text"
                        placeholder="Enter item name"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        required
                        className="mt-1 h-10 border-2 border-gray-300 rounded-lg selectable"
                      />
                    </div>

                    <div>
                      <Label htmlFor="description" className="text-sm font-medium text-primary-dark-green">
                        Description *
                      </Label>
                      <textarea
                        id="description"
                        placeholder="Enter item description"
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        required
                        className="mt-1 w-full h-20 px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-primary-dark-green selectable"
                      />
                    </div>

                    <div>
                      <Label className="text-sm font-medium text-primary-dark-green">
                        Dietary Type *
                      </Label>
                      <select
                        value={formData.dietaryType}
                        onChange={(e) => setFormData({...formData, dietaryType: e.target.value as 'Veg' | 'Non-Veg'})}
                        required
                        className="mt-1 w-full h-10 px-3 border-2 border-gray-300 rounded-lg focus:border-primary-dark-green selectable"
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
                        <Label htmlFor="price" className="text-sm font-medium text-primary-dark-green">
                          Price (₹) *
                        </Label>
                        <Input
                          id="price"
                          type="number"
                          placeholder="0"
                          value={formData.price}
                          onChange={(e) => setFormData({...formData, price: Number(e.target.value)})}
                          required
                          min="0"
                          step="0.01"
                          className="mt-1 h-10 border-2 border-gray-300 rounded-lg selectable"
                        />
                      </div>

                      <div>
                        <Label htmlFor="originalPrice" className="text-sm font-medium text-primary-dark-green">
                          Original Price (₹)
                        </Label>
                        <Input
                          id="originalPrice"
                          type="number"
                          placeholder="0"
                          value={formData.originalPrice || ''}
                          onChange={(e) => setFormData({...formData, originalPrice: e.target.value ? Number(e.target.value) : undefined})}
                          min="0"
                          step="0.01"
                          className="mt-1 h-10 border-2 border-gray-300 rounded-lg selectable"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="preparationTime" className="text-sm font-medium text-primary-dark-green">
                        Preparation Time (minutes) *
                      </Label>
                      <Input
                        id="preparationTime"
                        type="number"
                        placeholder="15"
                        value={formData.preparationTime}
                        onChange={(e) => setFormData({...formData, preparationTime: Number(e.target.value)})}
                        required
                        min="1"
                        className="mt-1 h-10 border-2 border-gray-300 rounded-lg selectable"
                      />
                    </div>

                    <div>
                      <Label htmlFor="image" className="text-sm font-medium text-primary-dark-green">
                        Item Image
                      </Label>
                      <Input
                        id="image"
                        type="file"
                        accept="image/*"
                        onChange={(e) => setSelectedImage(e.target.files ? e.target.files[0] : null)}
                        className="mt-1 h-10 border-2 border-gray-300 rounded-lg selectable file:border-0 file:bg-gray-100 file:px-4 file:py-2 file:mr-4 file:text-sm file:font-semibold"
                      />
                    </div>

                    {/* Featured Product Toggle */}
                    <div className="flex items-center space-x-2">
                      <input
                        id="featured"
                        type="checkbox"
                        checked={formData.featured || false}
                        onChange={(e) => setFormData({...formData, featured: e.target.checked})}
                        className="h-4 w-4 text-primary-dark-green focus:ring-primary-dark-green border-gray-300 rounded"
                      />
                      <Label htmlFor="featured" className="text-sm font-medium text-primary-dark-green">
                        Featured Product
                      </Label>
                    </div>

                    {/* Few Stocks Left Indicator */}
                    <div className="flex items-center space-x-2">
                      <input
                        id="fewStocksLeft"
                        type="checkbox"
                        checked={formData.stockLeft !== null && formData.stockLeft !== undefined && formData.stockLeft <= 5}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({...formData, stockLeft: 5}); // Set to 5 to indicate few stocks left
                          } else {
                            setFormData({...formData, stockLeft: null});
                          }
                        }}
                        className="h-4 w-4 text-primary-dark-green focus:ring-primary-dark-green border-gray-300 rounded"
                      />
                      <Label htmlFor="fewStocksLeft" className="text-sm font-medium text-primary-dark-green">
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
                    <Save className="w-4 h-4 mr-2" />
                    {editingItem ? 'Update Item' : 'Add Item'}
                  </Button>
                  <Button
                    type="button"
                    onClick={() => {
                      setShowAddForm(false);
                      setEditingItem(null);
                    }}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 touchable"
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
            <CardTitle className="text-heading text-xl text-primary-dark-green">
              Menu Items ({filteredMenuItems.length})
            </CardTitle>
            <CardDescription>
              {restaurant ? `Menu items for ${restaurant.name}` : 'Loading...'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredMenuItems.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2 text-primary-dark-green">
                  No menu items found
                </h3>
                <p className="text-gray-600 mb-4">
                  {searchQuery ? 'Try adjusting your search' : 'Start by adding some menu items'}
                </p>
                <Button 
                  onClick={() => setShowAddForm(true)}
                  className="bg-accent-leaf-green hover:bg-accent-leaf-green/90 text-primary-dark-green touchable"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Item
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredMenuItems.map((item) => (
                  <Card key={item.id} className="border">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="font-semibold text-primary-dark-green">{item.name}</h4>
                          <p className="text-sm text-gray-600 line-clamp-2">{item.description}</p>
                        </div>
                        <div className="flex gap-1 ml-2">
                          <Button
                            onClick={() => handleEdit(item)}
                            className="p-1 bg-blue-100 hover:bg-blue-200 text-blue-700 touchable"
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button
                            onClick={() => handleDelete(item.id!)}
                            className="p-1 bg-red-100 hover:bg-red-200 text-red-700 touchable"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <Badge className={`text-xs ${(item.dietaryTags && item.dietaryTags.includes('Veg')) || item.dietaryType === 'Veg' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                              {item.dietaryType || (item.dietaryTags && item.dietaryTags.find(tag => ['Veg', 'Non-Veg'].includes(tag))) || 'Unknown'}
                            </Badge>
                            {item.featured && (
                              <Badge className="text-xs bg-yellow-100 text-yellow-800">
                                Featured
                              </Badge>
                            )}
                            {item.stockLeft !== null && item.stockLeft !== undefined && (
                              <Badge className="text-xs bg-orange-100 text-orange-800">
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
                            <span className="font-semibold text-primary-dark-green">
                              ₹{item.price}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-xs text-gray-600">
                          <div className="flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
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
      </div>
    </OperationsLayout>
  );
}
