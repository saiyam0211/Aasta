import React, { useState, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, Image as ImageIcon, X } from 'lucide-react';
import { toast } from 'sonner';

interface EditDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  restaurant: any;
  onSave: (data: any) => void;
  isLoading?: boolean;
}

const EditDetailsModal: React.FC<EditDetailsModalProps> = ({ 
  isOpen, 
  onClose, 
  restaurant, 
  onSave, 
  isLoading = false 
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [restaurantPrice, setRestaurantPrice] = useState(
    restaurant?.restaurantPricePercentage ? restaurant.restaurantPricePercentage * 100 : 40
  );
  const [aastaPrice, setAastaPrice] = useState(
    restaurant?.aastaPricePercentage ? restaurant.aastaPricePercentage * 100 : 10
  );
  const [minOrderAmount, setMinOrderAmount] = useState(
    restaurant?.minimumOrderAmount || 200
  );
  const [prepTime, setPrepTime] = useState(
    restaurant?.averagePreparationTime || 20
  );
  const [deliveryRadius, setDeliveryRadius] = useState(
    restaurant?.deliveryRadius || 5
  );
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Invalid file type. Only JPEG, PNG, and WebP images are allowed.');
      return;
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error('File size too large. Maximum size is 5MB.');
      return;
    }

    setSelectedImage(file);
    
    // Create preview URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const uploadRestaurantImage = async (): Promise<string | null> => {
    if (!selectedImage || !restaurant?.id) return null;

    try {
      setIsUploadingImage(true);
      const formData = new FormData();
      formData.append('file', selectedImage);
      formData.append('restaurantId', restaurant.id);

      const response = await fetch('/api/upload/restaurant-image', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        return result.data.imageUrl;
      } else {
        toast.error(result.error || 'Failed to upload image');
        return null;
      }
    } catch (error) {
      console.error('Error uploading restaurant image:', error);
      toast.error('Failed to upload image');
      return null;
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleSave = async () => {
    if (restaurantPrice + aastaPrice > 100) {
      alert('Restaurant price and Aasta price combined cannot exceed 100%');
      return;
    }

    let imageUrl = restaurant?.imageUrl;
    
    // Upload image if one was selected
    if (selectedImage) {
      const uploadedImageUrl = await uploadRestaurantImage();
      if (uploadedImageUrl) {
        imageUrl = uploadedImageUrl;
      } else {
        // If image upload failed, don't proceed with save
        return;
      }
    }

    onSave({
      restaurantPricePercentage: restaurantPrice / 100,
      aastaPricePercentage: aastaPrice / 100,
      minimumOrderAmount: minOrderAmount,
      averagePreparationTime: prepTime,
      deliveryRadius: deliveryRadius,
      imageUrl: imageUrl,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Restaurant Details</DialogTitle>
          <DialogDescription>
            Configure pricing percentages and operational settings for {restaurant?.name}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Restaurant Image Upload Section */}
          <div className="space-y-4">
            <h4 className="font-semibold text-sm text-[#002a01]">Restaurant Image</h4>
            
            <div className="space-y-3">
              {/* Current Image Display */}
              {(previewUrl || restaurant?.imageUrl) && (
                <div className="relative w-full h-32 border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                  <img
                    src={previewUrl || restaurant?.imageUrl || ''}
                    alt="Restaurant"
                    className="w-full h-full object-cover"
                  />
                  {previewUrl && (
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )}

              {/* Upload Button */}
              <div className="flex flex-col items-center justify-center">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleImageSelect}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full"
                  disabled={isUploadingImage}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {previewUrl ? 'Change Image' : (restaurant?.imageUrl ? 'Replace Image' : 'Upload Image')}
                </Button>
                <p className="text-xs text-gray-500 mt-1 text-center">
                  Supported formats: JPEG, PNG, WebP. Max size: 5MB
                </p>
              </div>
            </div>
          </div>

          {/* Pricing Section */}
          <div className="space-y-4">
            <h4 className="font-semibold text-sm text-[#002a01]">Pricing Configuration</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="restaurant-price">Restaurant Earnings (%)</Label>
                <Input 
                  id="restaurant-price"
                  type="number" 
                  min="0"
                  max="100"
                  value={restaurantPrice} 
                  onChange={(e) => setRestaurantPrice(Number(e.target.value))}
                  className="text-center"
                />
                <p className="text-xs text-gray-500">
                  Percentage of original price that restaurant earns
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="aasta-price">Aasta Earnings (%)</Label>
                <Input 
                  id="aasta-price"
                  type="number" 
                  min="0"
                  max="100"
                  value={aastaPrice} 
                  onChange={(e) => setAastaPrice(Number(e.target.value))}
                  className="text-center"
                />
                <p className="text-xs text-gray-500">
                  Percentage of original price that Aasta earns
                </p>
              </div>
            </div>
            
            {/* Pricing Example */}
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-xs font-medium text-gray-700 mb-2">Example for ₹200 item:</p>
              <div className="text-xs text-gray-600 space-y-1">
                <div>• Restaurant will earn: ₹{(200 * restaurantPrice / 100).toFixed(0)}</div>
                <div>• Aasta will earn: ₹{(200 * aastaPrice / 100).toFixed(0)}</div>
                <div>• Customer pays: ₹200</div>
              </div>
            </div>
          </div>

          {/* Operational Settings */}
          <div className="space-y-4">
            <h4 className="font-semibold text-sm text-[#002a01]">Operational Settings</h4>
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="min-order">Minimum Order Amount (₹)</Label>
                <Input 
                  id="min-order"
                  type="number" 
                  min="0"
                  value={minOrderAmount} 
                  onChange={(e) => setMinOrderAmount(Number(e.target.value))}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="prep-time">Avg Prep Time (min)</Label>
                  <Input 
                    id="prep-time"
                    type="number" 
                    min="1"
                    value={prepTime} 
                    onChange={(e) => setPrepTime(Number(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="delivery-radius">Delivery Radius (km)</Label>
                  <Input 
                    id="delivery-radius"
                    type="number" 
                    min="1"
                    step="0.5"
                    value={deliveryRadius} 
                    onChange={(e) => setDeliveryRadius(Number(e.target.value))}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            className="bg-[#d1f86a] hover:bg-[#d1f86a]/90 text-[#002a01]"
            disabled={isLoading || isUploadingImage}
          >
            {isUploadingImage ? 'Uploading Image...' : (isLoading ? 'Saving...' : 'Save Changes')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditDetailsModal;

