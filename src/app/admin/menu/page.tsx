"use client";

import { useState, useEffect } from "react";
import AdminLayout from "@/components/layouts/admin-layout";
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
  ToggleRight
} from "lucide-react";

interface Restaurant {
  id: string;
  name: string;
  ownerName: string;
}

interface MenuItem {
  id?: string;
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
  restaurantId: string;
  restaurantName?: string;
}

const DIETARY_TAGS = ['Vegetarian', 'Non-Vegetarian', 'Vegan', 'Gluten-Free', 'Contains Dairy', 'Contains Nuts'];
const SPICE_LEVELS = ['Mild', 'Medium', 'Spicy', 'Extra Spicy'];
const CATEGORIES = ['Appetizers', 'Main Course', 'Biryani', 'Dal & Curry', 'Breads', 'Pizza', 'Pasta', 'Desserts', 'Beverages'];

export default function AdminMenuPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRestaurant, setSelectedRestaurant] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  const [formData, setFormData] = useState<MenuItem>({
    name: '',
    description: '',
    price: 0,
    originalPrice: undefined,
    category: '',
    preparationTime: 15,
    imageUrl: '',
    dietaryTags: [],
    spiceLevel: 'Mild',
    available: true,
    featured: false,
    restaurantId: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedRestaurant) {
      loadMenuItems(selectedRestaurant);
    }
  }, [selectedRestaurant]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      
      // Load restaurants
      const restaurantsRes = await fetch('/api/restaurants');
      const restaurantsData = await restaurantsRes.json();
      if (restaurantsData.success) {
        setRestaurants(restaurantsData.data || []);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMenuItems = async (restaurantId: string) => {
    try {
      const response = await fetch(`/api/menu-items?restaurantId=${restaurantId}`);
      const data = await response.json();
      if (data.success) {
        setMenuItems(data.data || []);
      }
    } catch (error) {
      console.error('Error loading menu items:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.restaurantId) {
      alert('Please select a restaurant');
      return;
    }

    try {
      const url = editingItem ? `/api/menu-items/${editingItem.id}` : '/api/menu-items';
      const method = editingItem ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        // Reset form
        setFormData({
          name: '',
          description: '',
          price: 0,
          originalPrice: undefined,
          category: '',
          preparationTime: 15,
          imageUrl: '',
          dietaryTags: [],
          spiceLevel: 'Mild',
          available: true,
          featured: false,
          restaurantId: selectedRestaurant
        });
        setShowAddForm(false);
        setEditingItem(null);
        
        // Reload menu items
        if (selectedRestaurant) {
          loadMenuItems(selectedRestaurant);
        }
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
        // Reload menu items
        if (selectedRestaurant) {
          loadMenuItems(selectedRestaurant);
        }
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
      dietaryTags: prev.dietaryTags.includes(tag)
        ? prev.dietaryTags.filter(t => t !== tag)
        : [...prev.dietaryTags, tag]
    }));
  };

  const filteredMenuItems = menuItems.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <div className="text-center py-12">
            <p className="text-gray-500">Loading menu management...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#002a01]">
              Menu Management
            </h1>
            <p className="text-[#002a01]/70 mt-1">
              Add and manage menu items for all restaurants
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button 
              onClick={() => loadData()}
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
                  restaurantId: selectedRestaurant
                });
              }}
              className="bg-[#ffd500] hover:bg-[#ffd500]/90 text-[#002a01] font-semibold"
              disabled={!selectedRestaurant}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Menu Item
            </Button>
          </div>
        </div>

        {/* Restaurant Selection */}
        <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Label className="text-sm font-medium text-[#002a01] mb-2 block">
                  Select Restaurant
                </Label>
                <select
                  value={selectedRestaurant}
                  onChange={(e) => setSelectedRestaurant(e.target.value)}
                  className="w-full h-10 px-3 border-2 border-gray-300 rounded-lg focus:border-[#002a01] focus:outline-none"
                >
                  <option value="">Choose a restaurant...</option>
                  {restaurants.map((restaurant) => (
                    <option key={restaurant.id} value={restaurant.id}>
                      {restaurant.name} (Owner: {restaurant.ownerName})
                    </option>
                  ))}
                </select>
              </div>
              
              {selectedRestaurant && (
                <div className="flex-1">
                  <Label className="text-sm font-medium text-[#002a01] mb-2 block">
                    Search Menu Items
                  </Label>
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
                </div>
              )}
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
                      <Label htmlFor="category" className="text-sm font-medium text-primary-dark-green">
                        Category *
                      </Label>
                      <select
                        id="category"
                        value={formData.category}
                        onChange={(e) => setFormData({...formData, category: e.target.value})}
                        required
                        className="mt-1 w-full h-10 px-3 border-2 border-gray-300 rounded-lg focus:border-primary-dark-green selectable"
                      >
                        <option value="">Select category</option>
                        {CATEGORIES.map((category) => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <Label htmlFor="imageUrl" className="text-sm font-medium text-primary-dark-green">
                        Image URL
                      </Label>
                      <Input
                        id="imageUrl"
                        type="url"
                        placeholder="Enter image URL"
                        value={formData.imageUrl}
                        onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                        className="mt-1 h-10 border-2 border-gray-300 rounded-lg selectable"
                      />
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
                      <Label className="text-sm font-medium text-primary-dark-green">
                        Spice Level *
                      </Label>
                      <select
                        value={formData.spiceLevel}
                        onChange={(e) => setFormData({...formData, spiceLevel: e.target.value})}
                        required
                        className="mt-1 w-full h-10 px-3 border-2 border-gray-300 rounded-lg focus:border-primary-dark-green selectable"
                      >
                        {SPICE_LEVELS.map((level) => (
                          <option key={level} value={level}>
                            {level}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-primary-dark-green">
                        Dietary Tags
                      </Label>
                      <div className="flex flex-wrap gap-2">
                        {DIETARY_TAGS.map((tag) => (
                          <Badge
                            key={tag}
                            onClick={() => toggleDietaryTag(tag)}
                            className={`cursor-pointer touchable px-3 py-1 text-xs ${
                              formData.dietaryTags.includes(tag)
                                ? 'bg-accent-leaf-green text-primary-dark-green'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Checkboxes */}
                <div className="flex gap-6">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.available}
                      onChange={(e) => setFormData({...formData, available: e.target.checked})}
                      className="rounded"
                    />
                    <span className="text-sm font-medium text-primary-dark-green">Available</span>
                  </label>

                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.featured}
                      onChange={(e) => setFormData({...formData, featured: e.target.checked})}
                      className="rounded"
                    />
                    <span className="text-sm font-medium text-primary-dark-green">Featured Item</span>
                  </label>
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
        {selectedRestaurant && (
          <Card className="restaurant-card">
            <CardHeader>
              <CardTitle className="text-heading text-xl text-primary-dark-green">
                Menu Items ({filteredMenuItems.length})
              </CardTitle>
              <CardDescription>
                Manage menu items for {restaurants.find(r => r.id === selectedRestaurant)?.name}
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
                            <Badge className="bg-gray-100 text-gray-700 text-xs">
                              {item.category}
                            </Badge>
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
                            <span>{item.spiceLevel}</span>
                          </div>

                          <div className="flex flex-wrap gap-1">
                            {item.dietaryTags.map((tag) => (
                              <Badge key={tag} className="bg-accent-leaf-green text-primary-dark-green text-xs px-1 py-0">
                                {tag}
                              </Badge>
                            ))}
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex gap-1">
                              {item.available && (
                                <Badge className="bg-green-100 text-green-800 text-xs">
                                  Available
                                </Badge>
                              )}
                              {item.featured && (
                                <Badge className="bg-yellow-100 text-yellow-800 text-xs">
                                  Featured
                                </Badge>
                              )}
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
        )}

        {/* No Restaurant Selected */}
        {!selectedRestaurant && (
          <Card className="restaurant-card">
            <CardContent className="p-8 text-center">
              <Store className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2 text-primary-dark-green">
                Select a Restaurant
              </h3>
              <p className="text-gray-600">
                Choose a restaurant from the dropdown above to manage its menu items
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}
