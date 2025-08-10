"use client";

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import CustomerLayout from '@/components/layouts/customer-layout';
import { useLocationStore } from '@/hooks/useLocation';
import { MapPin, Home, Building, Plus, Edit, Trash, Phone, User, Mail, Loader2, Save } from 'lucide-react';

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
  const [newAddress, setNewAddress] = useState({ street: '', city: '', state: '', zipCode: '' });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  useEffect(() => {
    if (session) {
      setLoading(false);
      setUserName(session.user.name || '');
      setPhone(session.user.phone || '');
      fetchUserProfile();
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
      } else {
        setError('Failed to fetch profile.');
      }
    } catch (err) {
      console.error('Profile fetch error:', err);
      setError('An error occurred while fetching the profile.');
    }
  };

  const handleAddressChange = (field: string, value: string) => {
    setNewAddress({ ...newAddress, [field]: value });
  };

  // Check for duplicate address
  const isDuplicateAddress = (newAddr: any) => {
    return addresses.some(addr => 
      addr.street.toLowerCase().trim() === newAddr.street.toLowerCase().trim() &&
      addr.city.toLowerCase().trim() === newAddr.city.toLowerCase().trim() &&
      addr.state.toLowerCase().trim() === newAddr.state.toLowerCase().trim() &&
      addr.zipCode === newAddr.zipCode
    );
  };

  const addOrUpdateAddress = async () => {
    try {
      setError('');
      setSuccess('');

      // Validate required fields
      if (!newAddress.street || !newAddress.city || !newAddress.state || !newAddress.zipCode) {
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
          setAddresses(addresses.map(addr => 
            addr.id === editingId ? data.address : addr
          ));
          setNewAddress({ street: '', city: '', state: '', zipCode: '' });
          setEditingId(null);
          setSuccess('Address updated successfully!');
        } else {
          setError(data.message || 'Failed to update address.');
        }
      } else {
        // Check for duplicate before adding
        if (isDuplicateAddress(newAddress)) {
          setError('This address already exists. Please add a different address.');
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
      zipCode: address.zipCode
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
        setAddresses(addresses.filter(address => address.id !== id));
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
    // Implement save logic for user profile
  };

  if (loading) return <p>Loading...</p>;

  return (
    <CustomerLayout>
      <div className="max-w-4xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-semibold mb-6">User Profile</h1>
        <div className="mb-6">
          <div className="mb-4">
            <label className="block text-sm font-medium">Name</label>
            <Input value={userName} onChange={(e) => setUserName(e.target.value)} />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium">Phone Number</label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <Button onClick={saveProfile} className="btn-primary">Save Profile</Button>
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-4">Saved Addresses</h2>
          
          {/* Success/Error Messages */}
          {success && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">{success}</div>}
          {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}
          
          {/* Address List */}
          {addresses.length === 0 ? (
            <div className="text-gray-500 mb-6">
              <p>No addresses saved yet. Add your first address below.</p>
            </div>
          ) : (
            addresses.map((address) => (
              <Card key={address.id} className="mb-4">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-grow">
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">{address.type || 'Home'}</span>
                        {address.isDefault && (
                          <Badge variant="secondary" className="text-xs">Default</Badge>
                        )}
                      </div>
                      <p className="text-gray-700">
                        {address.street}<br />
                        {address.city}, {address.state} {address.zipCode}
                      </p>
                      {address.landmark && (
                        <p className="text-sm text-gray-500 mt-1">Landmark: {address.landmark}</p>
                      )}
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button 
                        onClick={() => editAddress(address)} 
                        size="sm" 
                        variant="outline"
                        className="flex items-center gap-1"
                      >
                        <Edit className="h-3 w-3" />
                        Edit
                      </Button>
                      <Button 
                        onClick={() => deleteAddress(address.id)} 
                        size="sm" 
                        variant="destructive"
                        className="flex items-center gap-1"
                      >
                        <Trash className="h-3 w-3" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
          
          {/* Add/Edit Address Form */}
          <Card id="address-form" className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {editingId ? <Edit className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
                {editingId ? 'Edit Address' : 'Add New Address'}
              </CardTitle>
              {editingId && (
                <CardDescription>
                  You are editing an existing address. Click cancel to stop editing.
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
                  onChange={(e) => handleAddressChange('street', e.target.value)} 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input 
                    id="city"
                    placeholder="New York" 
                    value={newAddress.city} 
                    onChange={(e) => handleAddressChange('city', e.target.value)} 
                  />
                </div>
                <div>
                  <Label htmlFor="state">State</Label>
                  <Input 
                    id="state"
                    placeholder="NY" 
                    value={newAddress.state} 
                    onChange={(e) => handleAddressChange('state', e.target.value)} 
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="zipCode">ZIP Code</Label>
                <Input 
                  id="zipCode"
                  placeholder="10001" 
                  value={newAddress.zipCode} 
                  onChange={(e) => handleAddressChange('zipCode', e.target.value)} 
                />
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={addOrUpdateAddress} 
                  className="flex items-center gap-2"
                >
                  {editingId ? (
                    <><Save className="h-4 w-4" /> Update Address</>
                  ) : (
                    <><Plus className="h-4 w-4" /> Add Address</>
                  )}
                </Button>
                {editingId && (
                  <Button 
                    onClick={cancelEdit} 
                    variant="outline"
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </CustomerLayout>
  );
}
