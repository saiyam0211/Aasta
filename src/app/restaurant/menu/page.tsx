"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Upload, 
  Image as ImageIcon, 
  Clock,
  DollarSign,
  Tag,
  ChefHat,
  Eye,
  EyeOff
} from "lucide-react";
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

interface Category {
  id: string;
  name: string;
  description: string;
  items: MenuItem[];
}

export default function MenuManagement() {
  const { data: session } = useSession();
  const router = useRouter();
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  
  const [newCategory, setNewCategory] = useState({ name: "", description: "" });
  const [newItem, setNewItem] = useState<Omit<MenuItem, 'id'>>({
    name: "",
    description: "",
    price: 0,
    originalPrice: 0,
    category: "",
    preparationTime: 15,
    imageUrl: "",
    dietaryTags: [],
    spiceLevel: "medium",
    available: true,
    featured: false
  });

  const spiceLevels = ["mild", "medium", "spicy", "extra-spicy"];
  const dietaryOptions = ["Vegetarian", "Vegan", "Gluten-Free", "Dairy-Free", "Keto", "High-Protein"];

  // Load mock data
  useEffect(() => {
    const mockCategories: Category[] = [
      {
        id: "1",
        name: "Starters",
        description: "Appetizers and small bites",
        items: [
          {
            id: "1",
            name: "Paneer Tikka",
            description: "Grilled cottage cheese with aromatic spices",
            price: 280,
            originalPrice: 320,
            category: "Starters",
            preparationTime: 20,
            imageUrl: "",
            dietaryTags: ["Vegetarian"],
            spiceLevel: "medium",
            available: true,
            featured: true
          }
        ]
      },
      {
        id: "2", 
        name: "Main Course",
        description: "Hearty main dishes",
        items: [
          {
            id: "2",
            name: "Butter Chicken",
            description: "Creamy tomato-based curry with tender chicken",
            price: 380,
            category: "Main Course",
            preparationTime: 25,
            imageUrl: "",
            dietaryTags: ["High-Protein"],
            spiceLevel: "mild",
            available: true,
            featured: false
          }
        ]
      }
    ];
    setCategories(mockCategories);
    if (mockCategories.length > 0) {
      setSelectedCategory(mockCategories[0].id);
    }
  }, []);

  const handleAddCategory = () => {
    if (!newCategory.name.trim()) {
      toast.error("Category name is required");
      return;
    }

    const category: Category = {
      id: Date.now().toString(),
      name: newCategory.name,
      description: newCategory.description,
      items: []
    };

    setCategories(prev => [...prev, category]);
    setNewCategory({ name: "", description: "" });
    setIsAddingCategory(false);
    setSelectedCategory(category.id);
    toast.success("Category added successfully");
  };

  const handleAddItem = () => {
    if (!newItem.name.trim() || !newItem.price || !selectedCategory) {
      toast.error("Please fill all required fields");
      return;
    }

    const item: MenuItem = {
      ...newItem,
      id: Date.now().toString(),
      category: categories.find(c => c.id === selectedCategory)?.name || ""
    };

    setCategories(prev => prev.map(cat => 
      cat.id === selectedCategory 
        ? { ...cat, items: [...cat.items, item] }
        : cat
    ));

    setNewItem({
      name: "",
      description: "",
      price: 0,
      originalPrice: 0,
      category: "",
      preparationTime: 15,
      imageUrl: "",
      dietaryTags: [],
      spiceLevel: "medium",
      available: true,
      featured: false
    });
    
    setIsAddingItem(false);
    toast.success("Menu item added successfully");
  };

  const handleEditItem = (item: MenuItem) => {
    setEditingItem(item);
    setNewItem(item);
  };

  const handleUpdateItem = () => {
    if (!editingItem) return;

    setCategories(prev => prev.map(cat => ({
      ...cat,
      items: cat.items.map(item => 
        item.id === editingItem.id 
          ? { ...newItem, id: editingItem.id }
          : item
      )
    })));

    setEditingItem(null);
    setNewItem({
      name: "",
      description: "",
      price: 0,
      originalPrice: 0,
      category: "",
      preparationTime: 15,
      imageUrl: "",
      dietaryTags: [],
      spiceLevel: "medium",
      available: true,
      featured: false
    });
    
    toast.success("Menu item updated successfully");
  };

  const handleDeleteItem = (itemId: string) => {
    setCategories(prev => prev.map(cat => ({
      ...cat,
      items: cat.items.filter(item => item.id !== itemId)
    })));
    toast.success("Menu item deleted successfully");
  };

  const toggleItemAvailability = (itemId: string) => {
    setCategories(prev => prev.map(cat => ({
      ...cat,
      items: cat.items.map(item => 
        item.id === itemId 
          ? { ...item, available: !item.available }
          : item
      )
    })));
  };

  const handleDietaryTagToggle = (tag: string) => {
    setNewItem(prev => ({
      ...prev,
      dietaryTags: prev.dietaryTags.includes(tag)
        ? prev.dietaryTags.filter(t => t !== tag)
        : [...prev.dietaryTags, tag]
    }));
  };

  const selectedCategoryData = categories.find(c => c.id === selectedCategory);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#fcfefe' }}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: '#002a01' }}>
              Menu Management
            </h1>
            <p className="text-gray-600 mt-2">
              Manage your restaurant menu items and categories
            </p>
          </div>
          
          <div className="flex gap-4">
            <Dialog open={isAddingCategory} onOpenChange={setIsAddingCategory}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Category
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Category</DialogTitle>
                  <DialogDescription>
                    Create a new menu category to organize your items
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="categoryName">Category Name *</Label>
                    <Input
                      id="categoryName"
                      value={newCategory.name}
                      onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Starters, Main Course"
                    />
                  </div>
                  <div>
                    <Label htmlFor="categoryDesc">Description</Label>
                    <Textarea
                      id="categoryDesc"
                      value={newCategory.description}
                      onChange={(e) => setNewCategory(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Brief description of this category"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsAddingCategory(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddCategory}>
                      Add Category
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={isAddingItem || !!editingItem} onOpenChange={(open) => {
              if (!open) {
                setIsAddingItem(false);
                setEditingItem(null);
                setNewItem({
                  name: "",
                  description: "",
                  price: 0,
                  originalPrice: 0,
                  category: "",
                  preparationTime: 15,
                  imageUrl: "",
                  dietaryTags: [],
                  spiceLevel: "medium",
                  available: true,
                  featured: false
                });
              }
            }}>
              <DialogTrigger asChild>
                <Button 
                  onClick={() => setIsAddingItem(true)}
                  style={{
                    backgroundColor: '#d1f86a',
                    color: '#002a01',
                    border: '2px solid #002a01'
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Menu Item
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingItem ? "Edit Menu Item" : "Add New Menu Item"}
                  </DialogTitle>
                  <DialogDescription>
                    {editingItem ? "Update the menu item details" : "Create a new menu item for your restaurant"}
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-6">
                  {/* Basic Information */}
                  <div className="space-y-4">
                    <h3 className="font-semibold">Basic Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="itemName">Item Name *</Label>
                        <Input
                          id="itemName"
                          value={newItem.name}
                          onChange={(e) => setNewItem(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="e.g., Butter Chicken"
                        />
                      </div>
                      <div>
                        <Label htmlFor="prepTime">Prep Time (minutes) *</Label>
                        <Input
                          id="prepTime"
                          type="number"
                          value={newItem.preparationTime}
                          onChange={(e) => setNewItem(prev => ({ ...prev, preparationTime: Number(e.target.value) }))}
                          min="5"
                          max="60"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="itemDesc">Description</Label>
                      <Textarea
                        id="itemDesc"
                        value={newItem.description}
                        onChange={(e) => setNewItem(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Describe the dish, ingredients, and preparation"
                        rows={3}
                      />
                    </div>
                  </div>

                  {/* Pricing */}
                  <div className="space-y-4">
                    <h3 className="font-semibold">Pricing</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="price">Price (₹) *</Label>
                        <Input
                          id="price"
                          type="number"
                          value={newItem.price}
                          onChange={(e) => setNewItem(prev => ({ ...prev, price: Number(e.target.value) }))}
                          min="0"
                          step="10"
                        />
                      </div>
                      <div>
                        <Label htmlFor="originalPrice">Original Price (₹)</Label>
                        <Input
                          id="originalPrice"
                          type="number"
                          value={newItem.originalPrice || ""}
                          onChange={(e) => setNewItem(prev => ({ ...prev, originalPrice: Number(e.target.value) || undefined }))}
                          min="0"
                          step="10"
                          placeholder="For discount display"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Properties */}
                  <div className="space-y-4">
                    <h3 className="font-semibold">Properties</h3>
                    
                    <div>
                      <Label htmlFor="spiceLevel">Spice Level</Label>
                      <Select value={newItem.spiceLevel} onValueChange={(value) => setNewItem(prev => ({ ...prev, spiceLevel: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {spiceLevels.map(level => (
                            <SelectItem key={level} value={level}>
                              {level.charAt(0).toUpperCase() + level.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Dietary Tags</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {dietaryOptions.map(tag => (
                          <Badge
                            key={tag}
                            variant={newItem.dietaryTags.includes(tag) ? "default" : "outline"}
                            className="cursor-pointer"
                            onClick={() => handleDietaryTagToggle(tag)}
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="available"
                          checked={newItem.available}
                          onCheckedChange={(checked) => setNewItem(prev => ({ ...prev, available: checked }))}
                        />
                        <Label htmlFor="available">Available for orders</Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="featured"
                          checked={newItem.featured}
                          onCheckedChange={(checked) => setNewItem(prev => ({ ...prev, featured: checked }))}
                        />
                        <Label htmlFor="featured">Featured item</Label>
                      </div>
                    </div>
                  </div>

                  {/* Image Upload */}
                  <div className="space-y-4">
                    <h3 className="font-semibold">Image</h3>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <ImageIcon className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                      <p className="text-gray-500 mb-2">Upload item image</p>
                      <Button variant="outline" size="sm">
                        <Upload className="w-4 h-4 mr-2" />
                        Choose File
                      </Button>
                      <p className="text-xs text-gray-400 mt-2">
                        Recommended: 400x400px, max 2MB
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => {
                      setIsAddingItem(false);
                      setEditingItem(null);
                    }}>
                      Cancel
                    </Button>
                    <Button 
                      onClick={editingItem ? handleUpdateItem : handleAddItem}
                      style={{
                        backgroundColor: '#d1f86a',
                        color: '#002a01',
                        border: '2px solid #002a01'
                      }}
                    >
                      {editingItem ? "Update Item" : "Add Item"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
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
                    key={category.id}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedCategory === category.id 
                        ? 'bg-accent-leaf-green text-primary-dark-green' 
                        : 'hover:bg-gray-100'
                    }`}
                    onClick={() => setSelectedCategory(category.id)}
                    style={{
                      backgroundColor: selectedCategory === category.id ? '#d1f86a' : undefined,
                      color: selectedCategory === category.id ? '#002a01' : undefined
                    }}
                  >
                    <div className="font-medium">{category.name}</div>
                    <div className="text-sm opacity-70">
                      {category.items.length} items
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Items List */}
          <div className="lg:col-span-3">
            {selectedCategoryData ? (
              <Card>
                <CardHeader>
                  <CardTitle>{selectedCategoryData.name}</CardTitle>
                  <CardDescription>{selectedCategoryData.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  {selectedCategoryData.items.length === 0 ? (
                    <div className="text-center py-12">
                      <ChefHat className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                      <p className="text-gray-500 mb-4">No items in this category yet</p>
                      <Button 
                        onClick={() => setIsAddingItem(true)}
                        style={{
                          backgroundColor: '#d1f86a',
                          color: '#002a01',
                          border: '2px solid #002a01'
                        }}
                      >
                        Add First Item
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {selectedCategoryData.items.map(item => (
                        <div key={item.id} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="font-semibold text-lg">{item.name}</h3>
                                {item.featured && (
                                  <Badge variant="secondary">Featured</Badge>
                                )}
                                {!item.available && (
                                  <Badge variant="destructive">Unavailable</Badge>
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
                                <div className="flex items-center gap-1">
                                  <Tag className="w-4 h-4" />
                                  <span className="capitalize">{item.spiceLevel}</span>
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
                                variant="outline"
                                onClick={() => toggleItemAvailability(item.id)}
                              >
                                {item.available ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEditItem(item)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDeleteItem(item.id)}
                              >
                                <Trash2 className="w-4 h-4" />
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