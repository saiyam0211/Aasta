"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useCartStore, useLocationStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  MapPin, 
  Clock, 
  CreditCard, 
  ShoppingCart, 
  AlertCircle,
  CheckCircle,
  Loader2,
  Plus,
  Edit,
  Trash,
  Home
} from "lucide-react";
import CustomerLayout from "@/components/layouts/customer-layout";
import { toast } from "sonner";

interface DeliveryAddress {
  address: string;
  latitude: number;
  longitude: number;
  instructions?: string;
}

interface SavedAddress {
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

export default function CheckoutPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { cart, clearCart } = useCartStore();
  const { currentLocation } = useLocationStore();
  const latitude = currentLocation?.latitude || 0;
  const longitude = currentLocation?.longitude || 0;
  
  const [deliveryAddress, setDeliveryAddress] = useState<DeliveryAddress>({
    address: "",
    latitude: currentLocation?.latitude || 0,
    longitude: currentLocation?.longitude || 0,
    instructions: ""
  });
  
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [addressError, setAddressError] = useState("");
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);

  useEffect(() => {
    if (session) {
      fetchSavedAddresses();
    }
  }, [session]);

  const fetchSavedAddresses = async () => {
    try {
      const res = await fetch('/api/user/address');
      const data = await res.json();
      if (data.success) {
        setSavedAddresses(data.addresses);
      }
    } catch (error) {
      console.error('Failed to fetch saved addresses:', error);
    }
  };

  useEffect(() => {
    if (!cart || cart.items.length === 0) {
      router.push("/cart");
      return;
    }
  }, [cart, router]);

  useEffect(() => {
    // Auto-fill address from location if available and address is empty
    if (currentLocation && !deliveryAddress.address) {
      fetchCurrentAddress();
    }
  }, [currentLocation]);

  const fetchCurrentAddress = async () => {
    if (!currentLocation) return;
    
    setIsLoadingAddress(true);
    setAddressError("");
    
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${currentLocation.latitude},${currentLocation.longitude}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
      );
      const data = await response.json();
      
      if (data.results && data.results[0]) {
        setDeliveryAddress(prev => ({
          ...prev,
          address: data.results[0].formatted_address,
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude
        }));
        toast.success("Address auto-filled from your location!");
      } else {
        toast.error("Could not get address from your location. Please enter manually.");
      }
    } catch (error) {
      console.error("Failed to fetch address:", error);
      toast.error("Failed to get address from location. Please enter manually.");
    } finally {
      setIsLoadingAddress(false);
    }
  };

  const validateAddress = () => {
    if (!deliveryAddress.address.trim()) {
      setAddressError("Delivery address is required");
      return false;
    }
    
    setAddressError("");
    return true;
  };

  const handlePlaceOrder = async () => {
    if (!validateAddress()) return;
    
    setIsPlacingOrder(true);
    
    try {
      const response = await fetch("/api/orders/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cart,
          deliveryAddress
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        clearCart();
        toast.success("Order placed successfully!");
        // Redirect to payment page for payment processing
        router.push(`/payment/${data.order.orderNumber}`);
      } else {
        toast.error(data.error || "Failed to place order");
      }
    } catch (error) {
      console.error("Order placement failed:", error);
      toast.error("Failed to place order. Please try again.");
    } finally {
      setIsPlacingOrder(false);
    }
  };

  if (!cart || cart.items.length === 0) {
    return (
      <CustomerLayout>
        <div className="max-w-2xl mx-auto px-4 py-12 text-center">
          <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2" style={{ color: '#002a01' }}>
            Your cart is empty
          </h2>
          <p className="text-gray-500 mb-6">Add some delicious items to your cart first</p>
          <Button 
            onClick={() => router.push("/customer/discover")}
            style={{
              backgroundColor: '#d1f86a',
              color: '#002a01',
              border: '1px solid #002a01'
            }}
          >
            Discover Restaurants
          </Button>
        </div>
      </CustomerLayout>
    );
  }

  return (
    <CustomerLayout>
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Checkout Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Address */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2" style={{ color: '#002a01' }}>
                  <MapPin className="w-5 h-5" />
                  Delivery Address
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Saved Addresses Dropdown */}
                {savedAddresses.length > 0 && (
                  <div>
                    <Label htmlFor="saved-addresses">Choose from Saved Addresses</Label>
                    <Select 
                      value={selectedAddressId || ""} 
                      onValueChange={(value) => {
                        if (value === "new") {
                          setSelectedAddressId(null);
                          setDeliveryAddress({
                            address: "",
                            latitude: currentLocation?.latitude || 0,
                            longitude: currentLocation?.longitude || 0,
                            instructions: ""
                          });
                        } else if (value === "current") {
                          setSelectedAddressId(null);
                          fetchCurrentAddress();
                        } else {
                          const selectedAddr = savedAddresses.find(addr => addr.id === value);
                          if (selectedAddr) {
                            setSelectedAddressId(value);
                            setDeliveryAddress({
                              address: `${selectedAddr.street}, ${selectedAddr.city}, ${selectedAddr.state} ${selectedAddr.zipCode}`,
                              latitude: 0, // You might want to geocode this
                              longitude: 0,
                              instructions: selectedAddr.instructions || ""
                            });
                          }
                        }
                      }}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select a saved address or add new" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="current">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            Use Current Location
                          </div>
                        </SelectItem>
                        {savedAddresses.map((address) => (
                          <SelectItem key={address.id} value={address.id}>
                            <div className="flex items-center gap-2">
                              <Home className="w-4 h-4" />
                              <div>
                                <div className="font-medium">{address.type || 'Home'}</div>
                                <div className="text-xs text-gray-500">
                                  {address.street}, {address.city}
                                </div>
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                        <SelectItem value="new">
                          <div className="flex items-center gap-2">
                            <Plus className="w-4 h-4" />
                            Add New Address
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
                
                <div>
                  <Label htmlFor="address">Street Address *</Label>
                  <div className="relative">
                    <Textarea
                      id="address"
                      placeholder={isLoadingAddress ? "Getting your address..." : "Enter your complete delivery address"}
                      value={deliveryAddress.address}
                      onChange={(e) => {
                        setDeliveryAddress(prev => ({
                          ...prev,
                          address: e.target.value
                        }));
                        setSelectedAddressId(null); // Clear selection when manually editing
                      }}
                      className="mt-1"
                      rows={3}
                      disabled={isLoadingAddress}
                    />
                    {isLoadingAddress && (
                      <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 rounded">
                        <Loader2 className="w-5 h-5 animate-spin text-gray-500" />
                      </div>
                    )}
                  </div>
                  {addressError && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {addressError}
                    </p>
                  )}
                  {currentLocation && deliveryAddress.address && !addressError && (
                    <p className="text-green-600 text-sm mt-1 flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" />
                      Address filled from your current location
                    </p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="instructions">Delivery Instructions (Optional)</Label>
                  <Textarea
                    id="instructions"
                    placeholder="e.g., Ring the doorbell, Leave at door, etc."
                    value={deliveryAddress.instructions}
                    onChange={(e) => setDeliveryAddress(prev => ({
                      ...prev,
                      instructions: e.target.value
                    }))}
                    className="mt-1"
                    rows={2}
                  />
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={fetchCurrentAddress}
                    disabled={!currentLocation || isLoadingAddress}
                    className="flex-1"
                  >
                    {isLoadingAddress ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Getting Address...
                      </>
                    ) : (
                      <>
                        <MapPin className="w-4 h-4 mr-2" />
                        {deliveryAddress.address ? "Update from Location" : "Use Current Location"}
                      </>
                    )}
                  </Button>
                  
                  <Button 
                    variant="secondary"
                    onClick={() => router.push('/profile')}
                    className="flex items-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    Manage Addresses
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2" style={{ color: '#002a01' }}>
                  <CreditCard className="w-5 h-5" />
                  Payment Method
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-4 border rounded-lg bg-blue-50">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-blue-600" />
                    <span className="font-medium">Online Payment</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    Secure payment with Razorpay - Cards, UPI, Wallets & More
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle style={{ color: '#002a01' }}>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Restaurant Info */}
                <div className="pb-4 border-b">
                  <h4 className="font-semibold">{cart.restaurant.name}</h4>
                  <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                    <Clock className="w-4 h-4" />
                    <span>{cart.restaurant.averagePreparationTime || 30} mins</span>
                  </div>
                </div>

                {/* Cart Items */}
                <div className="space-y-3">
                  {cart.items.map((item) => (
                    <div key={item.menuItemId} className="flex justify-between items-start">
                      <div className="flex-1">
                        <h5 className="font-medium text-sm">{item.menuItem.name}</h5>
                        <p className="text-xs text-gray-500">
                          ₹{item.menuItem.price} × {item.quantity}
                        </p>
                      </div>
                      <span className="font-semibold text-sm">
                        ₹{item.subtotal.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="pt-4 border-t space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>₹{cart.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Delivery Fee</span>
                    <span>₹{cart.deliveryFee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Taxes & Fees</span>
                    <span>₹{cart.taxes.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg pt-2 border-t">
                    <span>Total</span>
                    <span style={{ color: '#002a01' }}>₹{cart.total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Place Order Button */}
                <Button
                  onClick={handlePlaceOrder}
                  disabled={isPlacingOrder}
                  className="w-full mt-6"
                  style={{
                    backgroundColor: '#d1f86a',
                    color: '#002a01',
                    border: '1px solid #002a01'
                  }}
                >
                  {isPlacingOrder ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Placing Order...
                    </>
                  ) : (
                    <>
                      Place Order • ₹{cart.total.toFixed(2)}
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </CustomerLayout>
  );
}
