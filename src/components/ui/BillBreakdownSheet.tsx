'use client';

import * as React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';

interface BillBreakdownSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  values: {
    originalSubtotal: number;
    aastaSubtotal: number;
    platformFee: number; // fixed 6
    handlingCharge: number; // 2% of cart value
    packagingFeeDisplay: number; // always 0
    packagingFeeOriginal: number; // shown striked-through (10)
    deliveryFee: number; // 0 for pickup, cart delivery fee for delivery
    total: number;
    savings?: number; // optional savings display
  };
}

export function BillBreakdownSheet({
  open,
  onOpenChange,
  values,
}: BillBreakdownSheetProps) {
  const {
    originalSubtotal,
    aastaSubtotal,
    platformFee,
    handlingCharge,
    packagingFeeDisplay,
    packagingFeeOriginal,
    deliveryFee,
    total,
    savings,
  } = values;

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0 fixed inset-0 z-[100] bg-black/50" />
        <Dialog.Content className="sheet-content data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:slide-in-from-bottom data-[state=closed]:slide-out-to-bottom fixed bottom-0 left-1/2 z-[101] w-full max-w-md -translate-x-1/2 rounded-t-3xl bg-white shadow-2xl">
          <div className="absolute top-2 left-1/2 h-1.5 w-12 -translate-x-1/2 rounded-full bg-gray-300" />

          <div className="max-h-[80vh] overflow-auto p-5 pt-6">
            <div className="mb-4 flex items-center justify-between">
              <Dialog.Title className="text-lg font-semibold">
                Bill Summary
              </Dialog.Title>
              <Dialog.Close
                aria-label="Close"
                className="rounded-full p-2 hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </Dialog.Close>
            </div>

            <div className="space-y-3">
              {/* Original vs Aasta price */}
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Item total (original)</span>
                <span className="text-gray-400 line-through">
                  ₹{originalSubtotal.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Aasta price</span>
                <span className="font-semibold">
                  ₹{aastaSubtotal.toFixed(2)}
                </span>
              </div>

              {/* Fees */}
              <div className="mt-2 border-t pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Platform fee</span>
                  <span>₹{platformFee.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Handling charge (2%)</span>
                  <span>₹{handlingCharge.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Packaging fee</span>
                  <span>
                    <span className="mr-2 text-gray-400 line-through">
                      ₹{packagingFeeOriginal.toFixed(2)}
                    </span>
                    <span className="font-medium">
                      ₹{packagingFeeDisplay.toFixed(2)}
                    </span>
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Delivery fee</span>
                  <span>₹{deliveryFee.toFixed(2)}</span>
                </div>
              </div>

              {/* Total */}
              <div className="mt-3 border-t pt-3">
                <div className="flex items-center justify-between text-base font-semibold">
                  <span>To pay</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>
                {typeof savings === 'number' && savings > 0 && (
                  <div className="mt-2 rounded-xl bg-blue-50 p-2 text-sm text-blue-700">
                    You saved ₹{savings.toFixed(2)} on this order
                  </div>
                )}
              </div>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>

      <style jsx global>{`
        @keyframes nd-sheet-up {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
        @keyframes nd-sheet-down {
          from {
            transform: translateY(0);
          }
          to {
            transform: translateY(100%);
          }
        }
        .sheet-content[data-state='open'] {
          animation: nd-sheet-up 220ms ease-out;
        }
        .sheet-content[data-state='closed'] {
          animation: nd-sheet-down 200ms ease-in;
        }
      `}</style>
    </Dialog.Root>
  );
}

export default BillBreakdownSheet;
