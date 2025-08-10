"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Store, Truck, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

type LoginType = 'restaurant' | 'delivery';

export default function OperationsLogin() {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState<LoginType>('restaurant');
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Hardcoded credentials check
    if (credentials.email !== 'operations@aasta.food' || credentials.password !== '@asta.food') {
      toast.error('Invalid credentials');
      return;
    }

    setLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Store session info
      localStorage.setItem('operations-session', JSON.stringify({
        email: credentials.email,
        type: selectedType,
        loginTime: new Date().toISOString()
      }));

      toast.success(`Login successful! Redirecting to ${selectedType} management...`);
      
      // Redirect based on selected type
      if (selectedType === 'restaurant') {
        router.push('/operations/restaurant/restaurants');
      } else {
        router.push('/operations/delivery');
      }
    } catch (error) {
      toast.error('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#002a01] to-[#004a02] flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-[#d1f86a] rounded-2xl flex items-center justify-center">
            <Store className="w-8 h-8 text-[#002a01]" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-[#002a01]">
              Operations Login
            </CardTitle>
            <p className="text-gray-600 mt-2">
              Access restaurant or delivery management
            </p>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Management Type Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-gray-700">Management Type</Label>
            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant={selectedType === 'restaurant' ? 'default' : 'outline'}
                className={`h-20 flex-col gap-2 ${
                  selectedType === 'restaurant' 
                    ? 'bg-[#002a01] hover:bg-[#002a01]/90 text-white' 
                    : 'border-2 hover:border-[#002a01] hover:bg-[#002a01]/5'
                }`}
                onClick={() => setSelectedType('restaurant')}
              >
                <Store className="w-6 h-6" />
                <span className="text-sm font-medium">Restaurant</span>
              </Button>
              
              <Button
                type="button"
                variant={selectedType === 'delivery' ? 'default' : 'outline'}
                className={`h-20 flex-col gap-2 ${
                  selectedType === 'delivery' 
                    ? 'bg-[#002a01] hover:bg-[#002a01]/90 text-white' 
                    : 'border-2 hover:border-[#002a01] hover:bg-[#002a01]/5'
                }`}
                onClick={() => setSelectedType('delivery')}
              >
                <Truck className="w-6 h-6" />
                <span className="text-sm font-medium">Delivery</span>
              </Button>
            </div>
          </div>

          {/* Selected Type Badge */}
          <div className="flex justify-center">
            <Badge className="bg-[#d1f86a] text-[#002a01] px-4 py-2 text-sm font-medium">
              {selectedType === 'restaurant' ? 'Restaurant Management' : 'Delivery Management'}
            </Badge>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="operations@aasta.food"
                value={credentials.email}
                onChange={(e) => setCredentials(prev => ({ ...prev, email: e.target.value }))}
                className="h-11"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="@asta.food"
                  value={credentials.password}
                  onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                  className="h-11 pr-10"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-11 bg-[#002a01] hover:bg-[#002a01]/90 text-white font-medium"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing In...
                </div>
              ) : (
                `Sign In to ${selectedType === 'restaurant' ? 'Restaurant' : 'Delivery'} Management`
              )}
            </Button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium text-gray-700 mb-2">Demo Credentials:</p>
            <div className="space-y-1 text-sm text-gray-600">
              <p><strong>Email:</strong> operations@aasta.food</p>
              <p><strong>Password:</strong> @asta.food</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
