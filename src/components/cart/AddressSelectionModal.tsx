'use client';

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
  onAddNewAddress 
}: AddressSelectionModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-primary-dark-green">
            Select an address
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Add Address Button */}
          <Button
            onClick={onAddNewAddress}
            variant="ghost"
            className="w-full justify-between p-4 h-auto text-left border border-gray-200 hover:bg-gray-50"
          >
            <div className="flex items-center gap-3">
              <Plus className="h-5 w-5 text-red-500" />
              <span className="font-medium text-red-500">Add Address</span>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </Button>

          {/* Saved Addresses Section */}
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-3 text-center">
              SAVED ADDRESSES
            </h3>
            
            {/* Delivers To */}
            <div className="mb-4">
              <h4 className="text-sm font-medium text-blue-600 mb-2">DELIVERS TO</h4>
              {addresses.filter(addr => addr.canDeliver).map((address) => (
                <Button
                  key={address.id}
                  onClick={() => onAddressSelect(address)}
                  variant="ghost"
                  className="w-full justify-start p-4 h-auto text-left hover:bg-gray-50 mb-2"
                >
                  <div className="flex items-start gap-3 w-full">
                    <Home className="h-5 w-5 text-gray-600 mt-1 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">{address.label}</span>
                        <span className="text-xs text-gray-500">{address.distance}</span>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                        {address.address}
                      </p>
                      {address.phone && (
                        <p className="text-xs text-gray-500 mt-1">
                          Phone number: {address.phone}
                        </p>
                      )}
                    </div>
                  </div>
                </Button>
              ))}
            </div>

            {/* Does Not Deliver To */}
            {addresses.some(addr => !addr.canDeliver) && (
              <div>
                <h4 className="text-sm font-medium text-red-500 mb-2">DOES NOT DELIVER TO</h4>
                {addresses.filter(addr => !addr.canDeliver).map((address) => (
                  <div
                    key={address.id}
                    className="w-full p-4 text-left opacity-50 mb-2"
                  >
                    <div className="flex items-start gap-3 w-full">
                      <Home className="h-5 w-5 text-gray-600 mt-1 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900">{address.label}</span>
                          <span className="text-xs text-gray-500">{address.distance}</span>
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2 mt-1">
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
          <div className="text-center text-xs text-gray-400 pt-4">
            powered by <span className="font-semibold">Google</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}