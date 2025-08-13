'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Store, Truck, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

type LoginType = 'restaurant' | 'delivery';

export default function OperationsLogin() {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState<LoginType>('restaurant');
  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    // Hardcoded credentials check
    if (
      credentials.email !== 'operations@aasta.food' ||
      credentials.password !== '@asta.food'
    ) {
      toast.error('Invalid credentials');
      return;
    }

    setLoading(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Store session info
      localStorage.setItem(
        'operations-session',
        JSON.stringify({
          email: credentials.email,
          type: selectedType,
          loginTime: new Date().toISOString(),
        })
      );

      toast.success(
        `Login successful! Redirecting to ${selectedType} management...`
      );

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
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#002a01] to-[#004a02] p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#d1f86a]">
            <Store className="h-8 w-8 text-[#002a01]" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-[#002a01]">
              Operations Login
            </CardTitle>
            <p className="mt-2 text-gray-600">
              Access restaurant or delivery management
            </p>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Management Type Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-gray-700">
              Management Type
            </Label>
            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant={selectedType === 'restaurant' ? 'default' : 'outline'}
                className={`h-20 flex-col gap-2 ${
                  selectedType === 'restaurant'
                    ? 'bg-[#002a01] text-white hover:bg-[#002a01]/90'
                    : 'border-2 hover:border-[#002a01] hover:bg-[#002a01]/5'
                }`}
                onClick={() => setSelectedType('restaurant')}
              >
                <Store className="h-6 w-6" />
                <span className="text-sm font-medium">Restaurant</span>
              </Button>

              <Button
                type="button"
                variant={selectedType === 'delivery' ? 'default' : 'outline'}
                className={`h-20 flex-col gap-2 ${
                  selectedType === 'delivery'
                    ? 'bg-[#002a01] text-white hover:bg-[#002a01]/90'
                    : 'border-2 hover:border-[#002a01] hover:bg-[#002a01]/5'
                }`}
                onClick={() => setSelectedType('delivery')}
              >
                <Truck className="h-6 w-6" />
                <span className="text-sm font-medium">Delivery</span>
              </Button>
            </div>
          </div>

          {/* Selected Type Badge */}
          <div className="flex justify-center">
            <Badge className="bg-[#d1f86a] px-4 py-2 text-sm font-medium text-[#002a01]">
              {selectedType === 'restaurant'
                ? 'Restaurant Management'
                : 'Delivery Management'}
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
                onChange={(e) =>
                  setCredentials((prev) => ({ ...prev, email: e.target.value }))
                }
                className="h-11"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="@asta.food"
                  value={credentials.password}
                  onChange={(e) =>
                    setCredentials((prev) => ({
                      ...prev,
                      password: e.target.value,
                    }))
                  }
                  className="h-11 pr-10"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute top-1/2 right-2 h-6 w-6 -translate-y-1/2 p-0"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <Button
              type="submit"
              className="h-11 w-full bg-[#002a01] font-medium text-white hover:bg-[#002a01]/90"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Signing In...
                </div>
              ) : (
                `Sign In to ${selectedType === 'restaurant' ? 'Restaurant' : 'Delivery'} Management`
              )}
            </Button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 rounded-lg bg-gray-50 p-4">
            <p className="mb-2 text-sm font-medium text-gray-700">
              Demo Credentials:
            </p>
            <div className="space-y-1 text-sm text-gray-600">
              <p>
                <strong>Email:</strong> operations@aasta.food
              </p>
              <p>
                <strong>Password:</strong> @asta.food
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
