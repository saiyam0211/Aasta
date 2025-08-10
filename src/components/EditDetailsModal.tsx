import React, { useState } from 'react';
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

  const handleSave = () => {
    if (restaurantPrice + aastaPrice > 100) {
      alert('Restaurant price and Aasta price combined cannot exceed 100%');
      return;
    }

    onSave({
      restaurantPricePercentage: restaurantPrice / 100,
      aastaPricePercentage: aastaPrice / 100,
      minimumOrderAmount: minOrderAmount,
      averagePreparationTime: prepTime,
      deliveryRadius: deliveryRadius,
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
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditDetailsModal;

