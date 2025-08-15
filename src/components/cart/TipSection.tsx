'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface TipSectionProps {
  selectedTip: number | null;
  onTipSelect: (amount: number | null) => void;
}

export function TipSection({ selectedTip, onTipSelect }: TipSectionProps) {
  const [customTip, setCustomTip] = React.useState<string>('');
  const [showCustomInput, setShowCustomInput] = React.useState(false);

  const tipOptions = [15, 20, 30];

  const handleCustomTip = () => {
    const amount = parseFloat(customTip);
    if (!isNaN(amount) && amount > 0) {
      onTipSelect(amount);
      setShowCustomInput(false);
      setCustomTip('');
    }
  };

  return (
    <Card className="border-primary-dark-green mb-4">
      <CardContent className="p-4">
        <div className="mb-4 text-center text-sm font-medium text-gray-500">
          GRATITUDE CORNER
        </div>

        <div className="mb-4 flex items-start gap-4">
          <div className="flex-1">
            <h3 className="text-primary-dark-green mb-2 text-lg font-semibold">
              Tip your delivery partner
            </h3>
            <p className="mb-4 text-sm text-gray-600">
              Your kindness means a lot! 100% of your tip will go directly to
              them
            </p>

            <div className="mb-3 flex gap-2">
              {tipOptions.map((amount) => (
                <Button
                  key={amount}
                  variant={selectedTip === amount ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onTipSelect(amount)}
                  className={`flex-1 ${
                    selectedTip === amount
                      ? 'bg-accent-leaf-green text-primary-dark-green border-primary-dark-green'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  ₹{amount}
                </Button>
              ))}
              <Button
                variant={showCustomInput ? 'default' : 'outline'}
                size="sm"
                onClick={() => setShowCustomInput(!showCustomInput)}
                className={`flex-1 ${
                  showCustomInput
                    ? 'bg-accent-leaf-green text-primary-dark-green border-primary-dark-green'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                Other
              </Button>
            </div>

            {showCustomInput && (
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Enter amount"
                  value={customTip}
                  onChange={(e) => setCustomTip(e.target.value)}
                  className="flex-1"
                />
                <Button
                  onClick={handleCustomTip}
                  size="sm"
                  className="bg-accent-leaf-green text-primary-dark-green border-primary-dark-green hover:bg-accent-leaf-green/90"
                >
                  Add
                </Button>
              </div>
            )}
          </div>

          <div className="flex-shrink-0">
            <img
              src="https://images.unsplash.com/photo-1551962419-dd504f20a479?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTAwNDR8MHwxfHNlYXJjaHw4fHxkZWxpdmVyeSUyMHBlcnNvbiUyMGNvdXJpZXIlMjBncmF0aXR1ZGUlMjBwb3NlJTIwZm9sZGVkJTIwaGFuZHN8ZW58MHwxfHxyZWR8MTc1NTE1NDYyMHww&ixlib=rb-4.1.0&q=85"
              alt="Delivery person with folded hands - One zone Studio on Unsplash"
              className="h-16 w-16 rounded-lg object-cover"
              style={{ width: '64px', height: '64px' }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
