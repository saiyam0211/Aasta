'use client';

import * as React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import Image from 'next/image';
import { X } from 'lucide-react';

interface CouponSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApply?: (code: string) => void;
}

export default function CouponSheet({ open, onOpenChange, onApply }: CouponSheetProps) {
  const [code, setCode] = React.useState('');
  const apply = () => {
    if (!onApply) return;
    onApply(code.trim());
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0 fixed inset-0 z-[100] bg-black/50" />
        <Dialog.Content className="sheet-content data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:slide-in-from-bottom data-[state=closed]:slide-out-to-bottom fixed bottom-0 left-1/2 z-[101] w-full max-w-md -translate-x-1/2 rounded-t-3xl bg-white shadow-2xl">
          <div className="absolute top-2 left-1/2 h-1.5 w-12 -translate-x-1/2 rounded-full bg-gray-300" />
          <div className="max-h-[70vh] overflow-auto p-5 pt-6">
            <div className="mb-2 flex items-center justify-between">
              <Dialog.Title className="text-lg font-semibold text-gray-900">Coupons</Dialog.Title>
              <Dialog.Close aria-label="Close" className="rounded-full p-2 hover:bg-gray-100">
                <X className="h-5 w-5" />
              </Dialog.Close>
            </div>
            <Dialog.Description className="sr-only">Apply a coupon to your order</Dialog.Description>

            {/* Input and apply */}
            <div className="mb-5 flex items-center gap-2">
              <input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Type coupon code here"
                className="flex-1 rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
              />
              <button
                className="rounded-xl bg-orange-500 px-4 py-3 text-sm font-medium text-white disabled:opacity-60"
                onClick={apply}
                disabled={!code.trim()}
              >
                Apply
              </button>
            </div>

            {/* Empty state */}
            <div className="pb-2 text-center">
              <div className="mx-auto mb-4 h-40 w-40">
                <Image
                  src="/images/no-coupon.webp"
                  alt="No coupons"
                  width={160}
                  height={160}
                  className="h-full w-full object-contain"
                />
              </div>
              <div className="text-base font-semibold text-gray-900">No coupons available</div>
              <div className="mx-auto mt-1 max-w-xs text-sm text-gray-600">
                We don’t have any active coupons at the moment. Please check back later.
              </div>
            </div>
          </div>
          <style jsx global>{`
            @keyframes nd-sheet-up{from{transform:translateY(100%)}to{transform:translateY(0)}}
            @keyframes nd-sheet-down{from{transform:translateY(0)}to{transform:translateY(100%)}}
            .sheet-content[data-state='open']{animation:nd-sheet-up 220ms ease-out}
            .sheet-content[data-state='closed']{animation:nd-sheet-down 200ms ease-in}
          `}</style>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}


