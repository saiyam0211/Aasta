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
    <Card className="mb-3 bg-accent-leaf-green border-primary-dark-green">
      <div className="px-4 py-3 flex items-center gap-3">
        <PartyPopper className="h-5 w-5 text-primary-dark-green wiggle" />
        <span className="text-sm font-medium text-primary-dark-green">
          You saved ₹{Math.round(savings)} on this order
        </span>
      </div>
    </Card>
  );
}