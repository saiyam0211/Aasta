'use client';

import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bike, Store } from 'lucide-react';

interface DeliveryModeToggleProps {
  mode: 'delivery' | 'pickup';
  onModeChange: (mode: 'delivery' | 'pickup') => void;
}

export function DeliveryModeToggle({
  mode,
  onModeChange,
}: DeliveryModeToggleProps) {
  const handleChange = (value: string) => {
    const next = value === 'pickup' ? 'pickup' : 'delivery';
    onModeChange(next);
  };
  return (
    <div className="mb-3">
      <Tabs value={mode as string} onValueChange={handleChange}>
        <TabsList className="border-primary-dark-green inline-flex rounded-xl border bg-white p-1">
          <TabsTrigger
            value="delivery"
            className="data-[state=active]:bg-accent-leaf-green data-[state=active]:text-primary-dark-green text-primary-dark-green flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm data-[state=active]:shadow-sm"
          >
            <Bike className="h-4 w-4" />
            Delivery
          </TabsTrigger>
          <TabsTrigger
            value="pickup"
            className="data-[state=active]:bg-accent-leaf-green data-[state=active]:text-primary-dark-green text-primary-dark-green flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm data-[state=active]:shadow-sm"
          >
            <Store className="h-4 w-4" />
            Pickup
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}
