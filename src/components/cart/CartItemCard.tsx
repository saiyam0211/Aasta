'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Minus, Trash2 } from 'lucide-react';

interface CartItemCardProps {
  item: {
    menuItemId: string;
    menuItem: {
      name: string;
      price: number;
      originalPrice?: number;
      imageUrl?: string;
    };
    quantity: number;
    subtotal: number;
  };
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemoveItem: (itemId: string) => void;
}

export function CartItemCard({
  item,
  onUpdateQuantity,
  onRemoveItem,
}: CartItemCardProps) {
  return (
    <div className="flex items-center justify-between py-4">
      <div className="flex items-center gap-4">
        <img
          src={item.menuItem.imageUrl || '/placeholder.png'}
          alt={`${item.menuItem.name} - Anthony Espinosa on Unsplash`}
          className="h-16 w-16 rounded-md object-cover"
          style={{ width: '64px', height: '64px' }}
        />
        <div>
          <h4 className="text-primary-dark-green line-clamp-2 text-base font-semibold">
            {item.menuItem.name}
          </h4>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span className="font-medium">₹{item.menuItem.price}</span>
            {item.menuItem.originalPrice && item.menuItem.originalPrice > 0 && (
              <span className="text-gray-400 line-through">
                ₹{item.menuItem.originalPrice}
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-gray-500">NOT ELIGIBLE FOR COUPONS</p>
        </div>
      </div>

      <div className="flex flex-col items-end gap-2">
        <div className="flex items-center rounded-lg border border-gray-200 bg-white">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onUpdateQuantity(item.menuItemId, item.quantity - 1)}
            className="text-primary-dark-green h-8 w-8 p-0 hover:bg-gray-50"
          >
            <Minus className="h-4 w-4" />
          </Button>
          <span className="text-primary-dark-green min-w-[2rem] px-3 py-1 text-center font-semibold">
            {item.quantity}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onUpdateQuantity(item.menuItemId, item.quantity + 1)}
            className="text-primary-dark-green h-8 w-8 p-0 hover:bg-gray-50"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-primary-dark-green text-sm font-semibold">
            ₹{item.subtotal.toFixed(0)}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRemoveItem(item.menuItemId)}
            className="h-8 w-8 p-0 text-red-500 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
