'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Home, Plus, ChevronRight } from 'lucide-react';

interface SavedAddress {
  id: string;
  type: string;
  label: string;
  address: string;
  phone?: string;
  distance: string;
  canDeliver: boolean;
}

interface AddressSelectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  addresses: SavedAddress[];
  onAddressSelect: (address: SavedAddress) => void;
  onAddNewAddress: () => void;
}

export function AddressSelectionModal({
  open,
  onOpenChange,
  addresses,
  onAddressSelect,
  onAddNewAddress,
}: AddressSelectionModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="mx-auto max-w-md">
        <DialogHeader>
          <DialogTitle className="text-primary-dark-green text-lg font-semibold">
            Select an address
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Add Address Button */}
          <Button
            onClick={onAddNewAddress}
            variant="ghost"
            className="h-auto w-full justify-between border border-gray-200 p-4 text-left hover:bg-gray-50"
          >
            <div className="flex items-center gap-3">
              <Plus className="h-5 w-5 text-red-500" />
              <span className="font-medium text-red-500">Add Address</span>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </Button>

          {/* Saved Addresses Section */}
          <div>
            <h3 className="mb-3 text-center text-sm font-medium text-gray-500">
              SAVED ADDRESSES
            </h3>

            {/* Delivers To */}
            <div className="mb-4">
              <h4 className="mb-2 text-sm font-medium text-blue-600">
                DELIVERS TO
              </h4>
              {addresses
                .filter((addr) => addr.canDeliver)
                .map((address) => (
                  <Button
                    key={address.id}
                    onClick={() => onAddressSelect(address)}
                    variant="ghost"
                    className="mb-2 h-auto w-full justify-start p-4 text-left hover:bg-gray-50"
                  >
                    <div className="flex w-full items-start gap-3">
                      <Home className="mt-1 h-5 w-5 flex-shrink-0 text-gray-600" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900">
                            {address.label}
                          </span>
                          <span className="text-xs text-gray-500">
                            {address.distance}
                          </span>
                        </div>
                        <p className="mt-1 line-clamp-2 text-sm text-gray-600">
                          {address.address}
                        </p>
                        {address.phone && (
                          <p className="mt-1 text-xs text-gray-500">
                            Phone number: {address.phone}
                          </p>
                        )}
                      </div>
                    </div>
                  </Button>
                ))}
            </div>

            {/* Does Not Deliver To */}
            {addresses.some((addr) => !addr.canDeliver) && (
              <div>
                <h4 className="mb-2 text-sm font-medium text-red-500">
                  DOES NOT DELIVER TO
                </h4>
                {addresses
                  .filter((addr) => !addr.canDeliver)
                  .map((address) => (
                    <div
                      key={address.id}
                      className="mb-2 w-full p-4 text-left opacity-50"
                    >
                      <div className="flex w-full items-start gap-3">
                        <Home className="mt-1 h-5 w-5 flex-shrink-0 text-gray-600" />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900">
                              {address.label}
                            </span>
                            <span className="text-xs text-gray-500">
                              {address.distance}
                            </span>
                          </div>
                          <p className="mt-1 line-clamp-2 text-sm text-gray-600">
                            {address.address}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* Powered by Google */}
          <div className="pt-4 text-center text-xs text-gray-400">
            powered by <span className="font-semibold">Google</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
