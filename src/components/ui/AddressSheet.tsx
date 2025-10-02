'use client';

import * as React from 'react';
import { useSession } from 'next-auth/react';
import * as Dialog from '@radix-ui/react-dialog';
import {
  X,
  Plus,
  MapPin,
  Phone,
  Home,
  Building2,
  Check,
  Loader2,
  Search,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLocationStore } from '@/lib/store';
import { toast } from 'sonner';
import { locationService } from '@/lib/location-service';

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
  context?: 'home' | 'cart' | 'profile'; // New context prop
}

export default function AddressSheet({
  open,
  onOpenChange,
  onSelect,
  context = 'home', // Default to home for backward compatibility
}: AddressSheetProps) {
  const { data: session } = useSession();
  const requestLocation = useLocationStore((s) => s.requestLocation);
  const currentLocation = useLocationStore((s) => s.currentLocation);
  const [loading, setLoading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
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

  // Address search state
  const [searchQuery, setSearchQuery] = React.useState('');
  const [searching, setSearching] = React.useState(false);
  const [searchResults, setSearchResults] = React.useState<
    { name?: string; address: string; latitude: number; longitude: number }[]
  >([]);
  const [selectedBySearch, setSelectedBySearch] = React.useState(false);

  // Debounced search
  React.useEffect(() => {
    if (searchQuery.trim().length < 3) {
      setSearchResults([]);
      return;
    }
    const t = setTimeout(async () => {
      try {
        setSearching(true);
        const results = await locationService.getPlaceSuggestions(searchQuery);
        const mapped = (results || []).map((r) => ({
          name: r.name,
          address: r.address,
          latitude: r.latitude,
          longitude: r.longitude,
        }));
        setSearchResults(mapped);
      } catch {
      } finally {
        setSearching(false);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const applySuggestion = (s: {
    name?: string;
    address: string;
    latitude: number;
    longitude: number;
  }) => {
    // Set coordinates from search selection
    useLocationStore.getState().setLocation({ latitude: s.latitude, longitude: s.longitude });
    
    if (context === 'home') {
      // For home page, immediately select and close the sheet
      onSelect({
        id: 'search',
        type: 'OTHER',
        street: s.address,
        city: null,
        state: null,
        zipCode: null,
        latitude: s.latitude,
        longitude: s.longitude,
        landmark: null,
        instructions: null,
        isDefault: false,
        houseNumber: null,
        locality: s.name || null,
        contactPhone: null,
      } as any);
      onOpenChange(false);
    } else {
      // For cart/profile, switch to form mode and pre-fill fields
      setMode('form');
      setForm(prev => ({
        ...prev,
        street: s.address,
        locality: s.name || '',
        // Keep other fields as they were
      }));
      setSelectedBySearch(true);
    }
  };

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

  // Prefill phone for cart/profile contexts
  React.useEffect(() => {
    if (!open) return;
    if (context === 'home') return;
    const phone = (session as any)?.user?.phone || (session as any)?.user?.mobile || '';
    if (phone) {
      setForm((f) => ({ ...f, contactPhone: String(phone) }));
    }
  }, [open, context, session]);

  const handleUseLiveLocation = async () => {
    try {
      setLoading(true);
      await requestLocation();
      const loc = useLocationStore.getState().currentLocation;
      if (loc?.latitude && loc?.longitude) {
        // Reverse geocode via API (Google Maps behind the scenes)
        try {
          const res = await fetch(
            `/api/geocode/reverse?lat=${loc.latitude}&lng=${loc.longitude}`
          );
          const data = await res.json();
          const formatted = data?.data?.address || 'Using live location';
          
          if (context === 'home') {
            // For home page, immediately select and close
            onSelect({
              id: 'live',
              type: 'OTHER',
              street: formatted,
              city: null,
              state: null,
              zipCode: null,
              latitude: loc.latitude,
              longitude: loc.longitude,
              landmark: null,
              instructions: null,
              isDefault: false,
              houseNumber: null,
              locality: null,
              contactPhone: null,
            } as any);
            onOpenChange(false);
          } else {
            // For cart/profile, switch to form mode and pre-fill
            setMode('form');
            setForm(prev => ({
              ...prev,
              street: formatted,
              // Keep other fields as they were
            }));
            setSelectedBySearch(false); // This was from live location, not search
          }
        } catch {
          // If reverse geocoding fails, still handle based on context
          if (context === 'home') {
            onSelect({
              id: 'live',
              type: 'OTHER',
              street: 'Using live location',
              city: null,
              state: null,
              zipCode: null,
              latitude: loc.latitude,
              longitude: loc.longitude,
              landmark: null,
              instructions: null,
              isDefault: false,
              houseNumber: null,
              locality: null,
              contactPhone: null,
            } as any);
            onOpenChange(false);
          } else {
            setMode('form');
            setForm(prev => ({
              ...prev,
              street: 'Using live location',
            }));
            setSelectedBySearch(false);
          }
        }
      }
    } finally {
      setLoading(false);
      // Only close sheet for home context
      if (context === 'home') {
        onOpenChange(false);
      }
    }
  };

  const saveAddress = async () => {
    console.log('Save address clicked, saving state:', saving);

    // Validate required fields and live location
    const missing: string[] = [];
    if (!currentLocation?.latitude || !currentLocation?.longitude)
      missing.push('Live location');
    if (!form.houseNumber.trim()) missing.push('House/Flat no.');
    if (!form.locality.trim()) missing.push('Locality');
    if (!form.street.trim()) missing.push('Street/Area');
    if (!form.contactPhone.trim()) missing.push('Phone number');

    if (missing.length > 0) {
      toast.error(`Please provide: ${missing.join(', ')}`);
      return;
    }

    try {
      console.log('Setting saving to true');
      setSaving(true);
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
      console.log('Sending payload:', payload);
      const res = await fetch('/api/user/address', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      console.log('Response:', data);
      if (data?.success) {
        toast.success('Address saved');
        setMode('list');
        await fetchAddresses();
        
        // For cart/profile context, select the newly saved address
        if (context !== 'home' && data?.address) {
          onSelect(data.address);
          onOpenChange(false);
        }
      } else {
        toast.error('Failed to save address');
      }
    } catch (error) {
      console.error('Error saving address:', error);
      toast.error('Failed to save address');
    } finally {
      console.log('Setting saving to false');
      setSaving(false);
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
                {/* Search field */}
            <div className="mb-4">
                  <div className="relative">
                    <input
                      className="w-full rounded-2xl border border-gray-200 bg-white px-12 py-3 text-[15px] text-gray-900 placeholder:text-gray-400"
                      placeholder="Search for area, street name..."
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setSelectedBySearch(false);
                      }}
                    />
                    <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
                  </div>
                  {searchResults.length > 0 && (
                    <div className="mt-2 max-h-64 overflow-auto rounded-2xl border border-gray-200 bg-white shadow-lg">
                      {searchResults.map((s, i) => (
                        <div
                          key={i}
                          className="flex cursor-pointer items-start gap-3 px-3 py-3 hover:bg-gray-50"
                          onClick={() => applySuggestion(s)}
                        >
                          <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                            <MapPin className="h-4 w-4 text-green-700" />
                          </div>
                          <div className="min-w-0">
                            {s.name && (
                              <div className="truncate text-[15px] font-semibold text-gray-900">
                                {s.name}
                              </div>
                            )}
                            <div className="truncate text-[13px] text-gray-600">
                              {s.address}
                            </div>
                          </div>
                          <ChevronRight className="ml-auto h-4 w-4 shrink-0 text-gray-400" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Use current location */}
                <button
                  className="mb-3 flex w-full items-center justify-between rounded-2xl border border-gray-200 bg-white px-4 py-4 text-left"
                  onClick={handleUseLiveLocation}
                  disabled={loading}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                      <MapPin className="h-5 w-5 text-green-700" />
                    </div>
                    <div className="text-left">
                      <p className="text-[15px] font-semibold text-gray-900">Use current location</p>
                      {currentLocation && (
                        <p className="text-xs text-gray-600">Live coordinates set</p>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </button>

                {/* Add new address - hidden for cart/profile contexts */}
                {context === 'home' && (
                  <button
                    className="mb-3 flex w-full items-center justify-between rounded-2xl border border-gray-200 bg-white px-4 py-4 text-left"
                    onClick={() => setMode('form')}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                        <Plus className="h-5 w-5 text-gray-700" />
                      </div>
                      <div className="text-left">
                        <p className="text-[15px] font-semibold text-gray-900">Add new address</p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </button>
                )}

                {/* Saved addresses */}
                <div className="mb-2 text-sm font-semibold text-gray-700">Your saved addresses</div>
                {loading && (
                  <div className="text-sm text-gray-500">Loading...</div>
                )}
                <div className="space-y-3">
                  {addresses.map((a) => (
                    <button
                      key={a.id}
                      className={cn(
                        'w-full rounded-2xl border bg-white p-4 text-left',
                        a.isDefault ? 'border-green-400' : 'border-gray-200'
                      )}
                      onClick={() => {
                        useLocationStore.getState().setSelectedAddressId(a.id);
                        // If saved address has coordinates, apply them to global location
                        if (typeof a.latitude === 'number' && typeof a.longitude === 'number') {
                          useLocationStore.getState().setLocation({ latitude: a.latitude!, longitude: a.longitude! });
                        }
                        onSelect(a);
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                          {a.type === 'WORK' ? (
                            <Building2 className="h-5 w-5 text-green-700" />
                          ) : (
                            <Home className="h-5 w-5 text-green-700" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="mb-1 text-sm font-semibold text-gray-900">
                            {a.type === 'WORK' ? 'Home' : a.type === 'HOME' ? 'Home' : 'Other'}
                            {a.isDefault && <span className="ml-2 text-xs text-green-600">You are here</span>}
                          </div>
                          <div className="text-[13px] leading-5 text-gray-700">
                            {[a.houseNumber, a.locality, a.street, a.city]
                              .filter(Boolean)
                              .join(', ')}
                          </div>
                          {a.contactPhone && (
                            <div className="mt-2 inline-flex items-center gap-1 text-xs text-gray-500">
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
                  {/* For cart/profile, hide in-form live/search controls */}
                  {context === 'home' && (
                    <>
                      <button
                        className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm"
                        onClick={handleUseLiveLocation}
                        disabled={loading}
                      >
                        <MapPin className="h-4 w-4" /> Use live location{' '}
                        <span className="ml-1 text-red-500">*</span>
                      </button>
                      {/* Search address */}
                      <div className="mt-3">
                        <label className="mb-1 block text-xs font-medium text-gray-700">
                          Or search address <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <input
                            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                            placeholder="Type to search via Google Maps"
                            value={searchQuery}
                            onChange={(e) => {
                              setSearchQuery(e.target.value);
                              setSelectedBySearch(false);
                            }}
                          />
                          {searching && (
                            <div className="absolute top-2 right-2 text-xs text-gray-400">
                              Searching...
                            </div>
                          )}
                          {searchResults.length > 0 && (
                            <div className="absolute z-50 mt-1 max-h-56 w-full overflow-auto rounded-md border border-gray-200 bg-white shadow-lg">
                              {searchResults.map((s, i) => (
                                <div
                                  key={i}
                                  className="cursor-pointer border-b p-2 text-sm last:border-b-0 hover:bg-gray-50"
                                  onClick={() => applySuggestion(s)}
                                >
                                  {s.address}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        {(selectedBySearch || currentLocation) && (
                          <div className="mt-1 text-xs text-green-600">
                            Coordinates set{' '}
                            {selectedBySearch
                              ? 'from search'
                              : 'from live location'}
                          </div>
                        )}
                      </div>
                    </>
                  )}
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
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            houseNumber: e.target.value,
                          }))
                        }
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
                        onChange={(e) =>
                          setForm((f) => ({ ...f, locality: e.target.value }))
                        }
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="mb-1 block text-xs font-medium text-gray-700">
                        Street/Area <span className="text-red-500">*</span>
                      </label>
                      <input
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm disabled:bg-gray-100"
                        placeholder="e.g., Extension Road"
                        value={form.street}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, street: e.target.value }))
                        }
                        readOnly={context !== 'home'}
                        disabled={context !== 'home'}
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="mb-1 block text-xs font-medium text-gray-700">
                        Phone number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                        placeholder="e.g., 99889 88998"
                        value={form.contactPhone}
                        onChange={(e) => {
                          // Only allow numbers
                          const value = e.target.value.replace(/\D/g, '');
                          setForm((f) => ({
                            ...f,
                            contactPhone: value,
                          }));
                        }}
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="mb-1 block text-xs font-medium text-gray-700">
                        Landmark (optional)
                      </label>
                      <input
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                        placeholder="e.g., Nearby landmark"
                        value={form.landmark}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, landmark: e.target.value }))
                        }
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="mb-1 block text-xs font-medium text-gray-700">
                        Instructions (optional)
                      </label>
                      <textarea
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                        placeholder="e.g., Call on arrival"
                        value={form.instructions}
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            instructions: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>
                  <button
                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#fd6923] px-4 py-3 text-white disabled:opacity-60"
                    onClick={saveAddress}
                    disabled={loading || saving}
                  >
                    {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                    {saving ? 'Saving address...' : 'Save address'}
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
