'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Info } from 'lucide-react';

interface DonationSectionProps {
  onDonate: () => void;
}

export function DonationSection({ onDonate }: DonationSectionProps) {
  return (
    <Card className="mb-4 border-primary-dark-green">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-semibold text-primary-dark-green">
                Let's serve a brighter future
              </h3>
              <Info className="h-4 w-4 text-gray-400" />
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Through nutritious meals, you can empower young minds for greatness
            </p>
            
            <div className="flex items-center justify-between">
              <div>
                <span className="text-lg font-semibold text-primary-dark-green">
                  Donate to Feeding India
                </span>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm text-gray-600">₹3</span>
                </div>
              </div>
              <Button
                onClick={onDonate}
                variant="outline"
                className="border-red-500 text-red-500 hover:bg-red-50"
              >
                ADD
              </Button>
            </div>
          </div>
          
          <div className="flex-shrink-0">
            <img
              src="https://images.unsplash.com/photo-1527821468487-b724210d296a?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTAwNDR8MHwxfHNlYXJjaHw0fHxjaGlsZHJlbiUyMGtpZHMlMjBoYXBweSUyMGdyb3VwJTIwY2hhcml0eXxlbnwwfDB8fHwxNzU1MTU0NjIxfDA&ixlib=rb-4.1.0&q=85"
              alt="Group of happy children for charity - Avel Chuklanov on Unsplash"
              className="w-16 h-16 rounded-lg object-cover"
              style={{ width: '64px', height: '64px' }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}