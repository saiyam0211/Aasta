'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { PartyPopper } from 'lucide-react';

interface SavingsBannerProps {
  savings: number;
}

export function SavingsBanner({ savings }: SavingsBannerProps) {
  if (savings <= 0) return null;

  return (
    <Card className="bg-accent-leaf-green border-primary-dark-green mb-3">
      <div className="flex items-center gap-3 px-4 py-3">
        <PartyPopper className="text-primary-dark-green wiggle h-5 w-5" />
        <span className="text-primary-dark-green text-sm font-medium">
          You saved ₹{Math.round(savings)} on this order
        </span>
      </div>
    </Card>
  );
}
