'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import CustomerLayout from '@/components/layouts/customer-layout';
import { useLocationStore } from '@/hooks/useLocation';
import { toast } from 'sonner';
import AddressSheet from '@/components/ui/AddressSheet';
import {
  MapPin,
  Home,
  Building,
  Plus,
  Edit,
  Trash,
  Phone,
  User,
  Mail,
  Loader2,
  Save,
  Leaf,
  PiggyBank,
} from 'lucide-react';

// Address Interface
interface Address {
  id: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  landmark?: string;
  instructions?: string;
  type?: string;
  isDefault: boolean;
}

export default function UserProfile() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('');
  const [phone, setPhone] = useState('');
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [newAddress, setNewAddress] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [stats, setStats] = useState<{
    totalSaved: number;
    co2SavedKg: number;
  }>({ totalSaved: 0, co2SavedKg: 0 });
  const [loadingStats, setLoadingStats] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedPhone, setSavedPhone] = useState<string>('');
  const [addressSheetOpen, setAddressSheetOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (session) {
      setLoading(false);
      setUserName(session.user.name || '');
      setPhone(session.user.phone || '');
      fetchUserProfile();
      fetchOrderStats();
    } else {
      router.push('/auth/signin');
    }
  }, [session]);

  const fetchUserProfile = async () => {
    try {
      const res = await fetch('/api/user/profile');
      const data = await res.json();
      if (data.success) {
        setAddresses(data.profile.addresses);
        if (typeof data.profile.name === 'string')
          setUserName(data.profile.name || '');
        if (typeof data.profile.phone === 'string') {
          setPhone(data.profile.phone || '');
          setSavedPhone(data.profile.phone || '');
        }
      } else {
        setError('Failed to fetch profile.');
      }
    } catch (err) {
      console.error('Profile fetch error:', err);
      setError('An error occurred while fetching the profile.');
    }
  };

  // Aggregate money saved and CO2 saved across all customer orders
  const fetchOrderStats = async () => {
    try {
      setLoadingStats(true);
      const res = await fetch('/api/orders?as=customer&limit=1000');
      if (!res.ok) {
        setLoadingStats(false);
        return;
      }
      const data = await res.json();
      const orders = (data?.data?.orders || []) as any[];
      let totalSaved = 0;
      let co2SavedKg = 0;
      const EMISSION_PER_KM = 0.12; // kg CO₂ per km (approx. low-emission 2-wheeler)
      for (const order of orders) {
        // Compute savings from items if original prices present
        const items = order.orderItems || [];
        const savedForOrder = items.reduce((sum: number, item: any) => {
          const originalUnit = (item.originalUnitPrice ?? item.unitPrice) || 0;
          const totalOriginal =
            (item.totalOriginalPrice ?? originalUnit * item.quantity) || 0;
          const actual =
            (item.totalPrice ?? item.unitPrice * item.quantity) || 0;
          const saved = Math.max(0, Number(totalOriginal) - Number(actual));
          return sum + saved;
        }, 0);
        totalSaved += savedForOrder;

        // CO2 saved only for pickup orders
        if (order.orderType === 'PICKUP') {
          const distanceKm = Number(order.deliveryDistance || 0);
          if (!Number.isNaN(distanceKm) && distanceKm > 0) {
            co2SavedKg += distanceKm * EMISSION_PER_KM;
          }
        }
      }
      setStats({
        totalSaved: Math.round(totalSaved),
        co2SavedKg: Number(co2SavedKg.toFixed(2)),
      });
    } catch (e) {
      console.error('Failed to fetch order stats', e);
    } finally {
      setLoadingStats(false);
    }
  };

  const handleAddressChange = (field: string, value: string) => {
    setNewAddress({ ...newAddress, [field]: value });
  };

  // Check for duplicate address
  const isDuplicateAddress = (newAddr: any) => {
    return addresses.some(
      (addr) =>
        addr.street.toLowerCase().trim() ===
          newAddr.street.toLowerCase().trim() &&
        addr.city.toLowerCase().trim() === newAddr.city.toLowerCase().trim() &&
        addr.state.toLowerCase().trim() ===
          newAddr.state.toLowerCase().trim() &&
        addr.zipCode === newAddr.zipCode
    );
  };

  const addOrUpdateAddress = async () => {
    try {
      setError('');
      setSuccess('');

      // Validate required fields
      if (
        !newAddress.street ||
        !newAddress.city ||
        !newAddress.state ||
        !newAddress.zipCode
      ) {
        setError('All fields are required.');
        return;
      }

      if (editingId) {
        // Update existing address
        const res = await fetch(`/api/user/address/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newAddress),
        });
        const data = await res.json();
        if (data.success) {
          setAddresses(
            addresses.map((addr) =>
              addr.id === editingId ? data.address : addr
            )
          );
          setNewAddress({ street: '', city: '', state: '', zipCode: '' });
          setEditingId(null);
          setSuccess('Address updated successfully!');
        } else {
          setError(data.message || 'Failed to update address.');
        }
      } else {
        // Check for duplicate before adding
        if (isDuplicateAddress(newAddress)) {
          setError(
            'This address already exists. Please add a different address.'
          );
          return;
        }

        // Add new address
        const res = await fetch('/api/user/address', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newAddress),
        });
        const data = await res.json();
        if (data.success) {
          setAddresses([...addresses, data.address]);
          setNewAddress({ street: '', city: '', state: '', zipCode: '' });
          setSuccess('Address added successfully!');
        } else {
          setError(data.message || 'Failed to add address.');
        }
      }
    } catch (err) {
      console.error('Address operation error:', err);
      setError('An error occurred while processing the address.');
    }
  };

  const editAddress = (address: Address) => {
    setNewAddress({
      street: address.street,
      city: address.city,
      state: address.state,
      zipCode: address.zipCode,
    });
    setEditingId(address.id);
    setError('');
    setSuccess('');

    // Scroll to the edit form
    setTimeout(() => {
      const editForm = document.getElementById('address-form');
      if (editForm) {
        editForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  const cancelEdit = () => {
    setNewAddress({ street: '', city: '', state: '', zipCode: '' });
    setEditingId(null);
    setError('');
    setSuccess('');
  };

  const deleteAddress = async (id: string) => {
    if (!confirm('Are you sure you want to delete this address?')) {
      return;
    }

    try {
      setError('');
      setSuccess('');
      const res = await fetch(`/api/user/address/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setAddresses(addresses.filter((address) => address.id !== id));
        setSuccess('Address deleted successfully!');
        // If we were editing this address, cancel the edit
        if (editingId === id) {
          cancelEdit();
        }
      } else {
        setError(data.message || 'Failed to delete address.');
      }
    } catch (err) {
      console.error('Delete address error:', err);
      setError('An error occurred while deleting the address.');
    }
  };

  const saveProfile = async () => {
    try {
      setError('');
      setSuccess('');
      setIsSaving(true);
      const payload: any = {};
      if (userName && userName !== (session?.user?.name || ''))
        payload.name = userName;
      if (phone && phone !== savedPhone) {
        const digitsOnly = phone.replace(/\D/g, '');
        if (!/^\d{10}$/.test(digitsOnly)) {
          toast.error('Enter a valid 10-digit phone number');
          setIsSaving(false);
          return;
        }
        payload.phone = digitsOnly;
      }
      if (Object.keys(payload).length === 0) {
        setSuccess('Nothing to update');
        toast.info('Nothing to update');
        setIsSaving(false);
        return;
      }
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess('Profile saved');
        toast.success('Profile saved');
        if (data.user?.name) setUserName(data.user.name);
        if (data.user?.phone) {
          setPhone(data.user.phone);
          setSavedPhone(data.user.phone);
        }
      } else {
        setError(data.message || 'Failed to save profile');
        toast.error(data.message || 'Failed to save profile');
      }
    } catch (e) {
      console.error('Profile save error', e);
      setError('Failed to save profile');
      toast.error('Failed to save profile');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <CustomerLayout>
      <div className="mx-auto max-w-4xl px-4 py-6">
        <h1 className="mb-2 text-2xl font-bold" style={{ color: '#002a01' }}>
          User Profile
        </h1>
        <p className="mb-5 text-sm text-gray-600">
          Manage your details, addresses, and track your positive impact
        </p>

        {/* Profile header card */}
        <Card className="mb-5 border border-[#002a01]/10">
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm text-gray-600">Signed in as</p>
              <p className="text-lg font-semibold" style={{ color: '#002a01' }}>
                {userName || '—'}
              </p>
              <p className="text-sm text-gray-600">
                {phone || 'Add your phone for quicker delivery updates'}
              </p>
            </div>
            <Button
              onClick={saveProfile}
              disabled={isSaving}
              className="rounded-xl"
              style={{
                backgroundColor: '#d1f86a',
                color: '#002a01',
                border: '1px solid #002a01',
              }}
            >
              {isSaving ? 'Saving…' : 'Save Profile'}
            </Button>
          </CardContent>
        </Card>

        {/* Editable fields */}
        <div className="mb-5 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">Name</label>
            <Input
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="border-[#d1f86a]/40 focus-visible:ring-1 focus-visible:ring-[#d1f86a]"
            />
          </div>
          {!savedPhone && (
            <div>
              <label className="mb-1 block text-sm font-medium">
                Phone Number
              </label>
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="border-[#d1f86a]/40 focus-visible:ring-1 focus-visible:ring-[#d1f86a]"
              />
            </div>
          )}
        </div>

        {/* Impact + Savings */}
        <div className="mb-6 grid grid-cols-1 gap-3 md:grid-cols-3">
          <Card className="border border-[#002a01]/10">
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm text-gray-600">Total Saved</p>
                <p className="text-xl font-bold" style={{ color: '#002a01' }}>
                  ₹{stats.totalSaved.toFixed(0)}
                </p>
              </div>
              <PiggyBank className="h-7 w-7" style={{ color: '#002a01' }} />
            </CardContent>
          </Card>
          <Card className="border border-[#002a01]/10">
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm text-gray-600">CO₂ Saved</p>
                <p className="text-xl font-bold" style={{ color: '#002a01' }}>
                  {stats.co2SavedKg.toFixed(2)} kg
                </p>
              </div>
              <Leaf className="h-7 w-7" style={{ color: '#002a01' }} />
            </CardContent>
          </Card>
          <Card className="border border-[#002a01]/10">
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm text-gray-600">Saved Addresses</p>
                <p className="text-xl font-bold" style={{ color: '#002a01' }}>
                  {addresses.length}
                </p>
              </div>
              <Button
                onClick={() => setAddressSheetOpen(true)}
                className="rounded-full"
                variant="outline"
              >
                View
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Playful CO2 card */}
        <div className="mb-6 px-1">
          <div className="relative">
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-[#002a01] via-[#002a01]/95 to-[#002a01]"></div>
            <div className="relative rounded-3xl border border-[#fcfefe]/15 p-5 text-[#fcfefe]">
              <h3 className="text-lg font-bold">
                You’re making a difference 🌿
              </h3>
              <p className="mt-1 text-sm text-[#fcfefe]/85">
                By choosing pickups, you’ve avoided delivery emissions.
              </p>
              <div className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#d1f86a] px-3 py-1 text-[#002a01]">
                <Leaf className="h-4 w-4" />
                <span className="font-semibold">
                  {stats.co2SavedKg.toFixed(2)} kg CO₂ saved
                </span>
              </div>
              <p className="mt-3 text-sm text-[#fcfefe]/75">
                “Small steps today, greener tomorrows.”
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2
            className="mb-3 text-xl font-semibold"
            style={{ color: '#002a01' }}
          >
            Saved Addresses
          </h2>

          {/* Success/Error Messages */}
          {success && (
            <div className="mb-4 rounded border border-green-400 bg-green-100 px-4 py-3 text-green-700">
              {success}
            </div>
          )}
          {error && (
            <div className="mb-4 rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700">
              {error}
            </div>
          )}

          {/* Address List */}
          {addresses.length === 0 ? (
            <div className="mb-6 text-gray-500">
              <p>No addresses saved yet. Add your first address below.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {addresses.map((address) => (
                <div
                  key={address.id}
                  className="rounded-2xl border border-[#d1f86a]/50 bg-[#f6ffe6] p-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-[#002a01]" />
                        <span className="font-medium text-[#002a01]">
                          {address.type || 'Home'}
                        </span>
                        {address.isDefault && (
                          <span className="rounded-full border border-[#002a01]/20 bg-white px-2 py-[2px] text-xs text-[#002a01]">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="truncate text-sm text-[#002a01]/90">
                        {address.street}, {address.city}, {address.state}{' '}
                        {address.zipCode}
                      </p>
                      {address.landmark && (
                        <p className="mt-1 truncate text-xs text-[#002a01]/70">
                          Landmark: {address.landmark}
                        </p>
                      )}
                    </div>
                    <div className="ml-3 flex shrink-0 gap-2">
                      <Button
                        onClick={() => editAddress(address)}
                        size="sm"
                        variant="outline"
                        className="h-8 rounded-full px-3"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        onClick={() => deleteAddress(address.id)}
                        size="sm"
                        variant="destructive"
                        className="h-8 rounded-full px-3"
                      >
                        <Trash className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add/Edit Address Form */}
          <Card id="address-form" className="mt-5 border border-[#002a01]/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {editingId ? (
                  <Edit className="h-5 w-5" />
                ) : (
                  <Plus className="h-5 w-5" />
                )}
                {editingId ? 'Edit Address' : 'Add New Address'}
              </CardTitle>
              {editingId && (
                <CardDescription>
                  You are editing an existing address. Click cancel to stop
                  editing.
                </CardDescription>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="street">Street Address</Label>
                <Input
                  id="street"
                  placeholder="123 Main Street"
                  value={newAddress.street}
                  onChange={(e) =>
                    handleAddressChange('street', e.target.value)
                  }
                  className="border-[#d1f86a]/40 focus-visible:ring-1 focus-visible:ring-[#d1f86a]"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    placeholder="New York"
                    value={newAddress.city}
                    onChange={(e) =>
                      handleAddressChange('city', e.target.value)
                    }
                    className="border-[#d1f86a]/40 focus-visible:ring-1 focus-visible:ring-[#d1f86a]"
                  />
                </div>
                <div>
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    placeholder="NY"
                    value={newAddress.state}
                    onChange={(e) =>
                      handleAddressChange('state', e.target.value)
                    }
                    className="border-[#d1f86a]/40 focus-visible:ring-1 focus-visible:ring-[#d1f86a]"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="zipCode">ZIP Code</Label>
                <Input
                  id="zipCode"
                  placeholder="10001"
                  value={newAddress.zipCode}
                  onChange={(e) =>
                    handleAddressChange('zipCode', e.target.value)
                  }
                  className="border-[#d1f86a]/40 focus-visible:ring-1 focus-visible:ring-[#d1f86a]"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={addOrUpdateAddress}
                  className="flex items-center gap-2"
                  style={{
                    backgroundColor: '#d1f86a',
                    color: '#002a01',
                    border: '1px solid #002a01',
                  }}
                >
                  {editingId ? (
                    <>
                      <Save className="h-4 w-4" /> Update Address
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4" /> Add Address
                    </>
                  )}
                </Button>
                {editingId && (
                  <Button onClick={cancelEdit} variant="outline">
                    Cancel
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      {/* Address drawer using AddressSheet */}
      <AddressSheet
        open={addressSheetOpen}
        onOpenChange={setAddressSheetOpen}
        onSelect={() => setAddressSheetOpen(false)}
      />
    </CustomerLayout>
  );
}
