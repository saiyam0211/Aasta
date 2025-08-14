'use client';

import * as React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Plus, MapPin, Phone, Home, Building2, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLocationStore } from '@/lib/store';
import { toast } from 'sonner';

interface AddressRecord {
  id: string;
  type: 'HOME' | 'WORK' | 'OTHER';
  street: string | null;
  city: string | null;
  state: string | null;
  zipCode: string | null;
  latitude?: number | null;
  longitude?: number | null;
  landmark?: string | null;
  instructions?: string | null;
  isDefault: boolean;
  houseNumber?: string | null;
  locality?: string | null;
  contactPhone?: string | null;
}

interface AddressSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (address: AddressRecord) => void;
}

export default function AddressSheet({
  open,
  onOpenChange,
  onSelect,
}: AddressSheetProps) {
  const requestLocation = useLocationStore((s) => s.requestLocation);
  const currentLocation = useLocationStore((s) => s.currentLocation);
  const [loading, setLoading] = React.useState(false);
  const [addresses, setAddresses] = React.useState<AddressRecord[]>([]);
  const [mode, setMode] = React.useState<'list' | 'form'>('list');
  const [form, setForm] = React.useState({
    type: 'HOME' as AddressRecord['type'],
    houseNumber: '',
    locality: '',
    street: '',
    landmark: '',
    contactPhone: '',
    instructions: '',
  });

  const fetchAddresses = React.useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/user/address');
      const data = await res.json();
      if (data?.success) setAddresses(data.addresses || []);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    if (open) fetchAddresses();
  }, [open, fetchAddresses]);

  const handleUseLiveLocation = async () => {
    try {
      setLoading(true);
      await requestLocation();
    } finally {
      setLoading(false);
    }
  };

  const saveAddress = async () => {
    // Validate required fields and live location
    const missing: string[] = [];
    if (!currentLocation?.latitude || !currentLocation?.longitude) missing.push('Live location');
    if (!form.houseNumber.trim()) missing.push('House/Flat no.');
    if (!form.locality.trim()) missing.push('Locality');
    if (!form.street.trim()) missing.push('Street/Area');
    if (!form.contactPhone.trim()) missing.push('Phone number');

    if (missing.length > 0) {
      toast.error(`Please provide: ${missing.join(', ')}`);
      return;
    }

    const payload: any = {
      type: form.type,
      street: form.street || undefined,
      landmark: form.landmark || undefined,
      instructions: form.instructions || undefined,
      latitude: currentLocation?.latitude,
      longitude: currentLocation?.longitude,
      houseNumber: form.houseNumber || undefined,
      locality: form.locality || undefined,
      contactPhone: form.contactPhone || undefined,
      isDefault: addresses.length === 0 ? true : undefined,
    };
    const res = await fetch('/api/user/address', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (data?.success) {
      toast.success('Address saved');
      setMode('list');
      await fetchAddresses();
    } else {
      toast.error('Failed to save address');
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0 fixed inset-0 z-[100] bg-black/50" />
        <Dialog.Content className="sheet-content data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:slide-in-from-bottom data-[state=closed]:slide-out-to-bottom fixed bottom-0 left-1/2 z-[101] w-full max-w-md -translate-x-1/2 rounded-t-3xl bg-white shadow-2xl">
          <div className="absolute top-2 left-1/2 h-1.5 w-12 -translate-x-1/2 rounded-full bg-gray-300" />
          <div className="max-h-[80vh] overflow-auto p-5 pt-6">
            <div className="mb-4 flex items-center justify-between">
              <Dialog.Title className="text-lg font-semibold">
                Select an address
              </Dialog.Title>
              <Dialog.Close
                aria-label="Close"
                className="rounded-full p-2 hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </Dialog.Close>
            </div>

            {mode === 'list' ? (
              <>
                <button
                  className="mb-4 flex w-full items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-4 text-left"
                  onClick={() => setMode('form')}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                      <Plus className="h-5 w-5" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium">Add Address</p>
                    </div>
                  </div>
                </button>

                {loading && (
                  <div className="text-sm text-gray-500">Loading...</div>
                )}
                <div className="space-y-3">
                  {addresses.map((a) => (
                    <button
                      key={a.id}
                      className={cn(
                        'w-full rounded-xl border p-4 text-left',
                        a.isDefault ? 'border-green-400' : 'border-gray-200'
                      )}
                      onClick={() => onSelect(a)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                          {a.type === 'WORK' ? (
                            <Building2 className="h-5 w-5 text-green-700" />
                          ) : (
                            <Home className="h-5 w-5 text-green-700" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900">
                            {a.type === 'WORK'
                              ? 'Work'
                              : a.type === 'HOME'
                                ? 'Home'
                                : 'Other'}
                          </div>
                          <div className="line-clamp-2 text-xs text-gray-600">
                            {[a.houseNumber, a.locality, a.street, a.city]
                              .filter(Boolean)
                              .join(', ')}
                          </div>
                          {a.contactPhone && (
                            <div className="mt-1 inline-flex items-center gap-1 text-xs text-gray-500">
                              <Phone className="h-3 w-3" /> {a.contactPhone}
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">Add delivery address</p>
                  <button
                    className="text-sm text-gray-600"
                    onClick={() => setMode('list')}
                  >
                    Back
                  </button>
                </div>
                <div className="rounded-xl border border-gray-200 p-4">
                  <button
                    className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm"
                    onClick={handleUseLiveLocation}
                    disabled={loading}
                  >
                    <MapPin className="h-4 w-4" /> Use live location <span className="ml-1 text-red-500">*</span>
                  </button>
                  {/* Static Map Preview */}
                  {currentLocation && (
                    <div className="mt-3 overflow-hidden rounded-lg border">
                      <img
                        src={`https://maps.googleapis.com/maps/api/staticmap?center=${currentLocation.latitude},${currentLocation.longitude}&zoom=16&size=640x300&maptype=roadmap&markers=color:red%7C${currentLocation.latitude},${currentLocation.longitude}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`}
                        alt="Selected location map"
                        className="h-40 w-full object-cover"
                      />
                    </div>
                  )}
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <div className="col-span-1">
                      <label className="mb-1 block text-xs font-medium text-gray-700">
                        House/Flat no. <span className="text-red-500">*</span>
                      </label>
                      <input
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                        placeholder="e.g., A-307"
                        value={form.houseNumber}
                        onChange={(e) => setForm((f) => ({ ...f, houseNumber: e.target.value }))}
                      />
                    </div>
                    <div className="col-span-1">
                      <label className="mb-1 block text-xs font-medium text-gray-700">
                        Locality <span className="text-red-500">*</span>
                      </label>
                      <input
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                        placeholder="e.g., Whitefield"
                        value={form.locality}
                        onChange={(e) => setForm((f) => ({ ...f, locality: e.target.value }))}
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="mb-1 block text-xs font-medium text-gray-700">
                        Street/Area <span className="text-red-500">*</span>
                      </label>
                      <input
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                        placeholder="e.g., Extension Road"
                        value={form.street}
                        onChange={(e) => setForm((f) => ({ ...f, street: e.target.value }))}
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="mb-1 block text-xs font-medium text-gray-700">
                        Phone number <span className="text-red-500">*</span>
                      </label>
                      <input
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                        placeholder="e.g., 8901825390"
                        value={form.contactPhone}
                        onChange={(e) => setForm((f) => ({ ...f, contactPhone: e.target.value }))}
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="mb-1 block text-xs font-medium text-gray-700">Landmark (optional)</label>
                      <input
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                        placeholder="e.g., Near Yello Living"
                        value={form.landmark}
                        onChange={(e) => setForm((f) => ({ ...f, landmark: e.target.value }))}
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="mb-1 block text-xs font-medium text-gray-700">Instructions (optional)</label>
                      <textarea
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                        placeholder="e.g., Call on arrival"
                        value={form.instructions}
                        onChange={(e) => setForm((f) => ({ ...f, instructions: e.target.value }))}
                      />
                    </div>
                  </div>
                  <button
                    className="mt-4 w-full rounded-xl bg-[#fd6923] px-4 py-3 text-white"
                    onClick={saveAddress}
                    disabled={loading}
                  >
                    Save address
                  </button>
                </div>
              </div>
            )}
          </div>

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
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
