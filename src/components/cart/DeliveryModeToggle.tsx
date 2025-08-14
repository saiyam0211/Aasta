'use client';

import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bike, Store } from 'lucide-react';

interface DeliveryModeToggleProps {
  mode: 'delivery' | 'pickup';
  onModeChange: (mode: 'delivery' | 'pickup') => void;
}

export function DeliveryModeToggle({ mode, onModeChange }: DeliveryModeToggleProps) {
  const handleChange = (value: string) => {
    const next = value === 'pickup' ? 'pickup' : 'delivery';
    onModeChange(next);
  };
  return (
    <div className="mb-3">
      <Tabs value={mode as string} onValueChange={handleChange}>
        <TabsList className="inline-flex rounded-xl border border-primary-dark-green p-1 bg-white">
          <TabsTrigger 
            value="delivery" 
            className="px-3 py-1.5 text-sm rounded-lg flex items-center gap-2 data-[state=active]:bg-accent-leaf-green data-[state=active]:text-primary-dark-green data-[state=active]:shadow-sm text-primary-dark-green"
          >
            <Bike className="h-4 w-4" />
            Delivery
          </TabsTrigger>
          <TabsTrigger 
            value="pickup"
            className="px-3 py-1.5 text-sm rounded-lg flex items-center gap-2 data-[state=active]:bg-accent-leaf-green data-[state=active]:text-primary-dark-green data-[state=active]:shadow-sm text-primary-dark-green"
          >
            <Store className="h-4 w-4" />
            Pickup
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}