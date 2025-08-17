'use client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signIn, useSession } from 'next-auth/react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, Shield, Loader2 } from 'lucide-react';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    // Check if admin is already logged in
    if (status === 'authenticated' && session?.user?.role === 'ADMIN') {
      router.push('/admin/dashboard');
    }
  }, [session, status, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await signIn('admin-credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid email or password');
      } else if (result?.ok) {
        router.push('/admin/dashboard');
      }
    } catch (error) {
      setError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="from-primary-dark-green via-primary-dark-green to-primary-dark-green/80 relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br p-4">
      {/* Background decorative elements */}
      <div className="bg-accent-leaf-green/10 absolute top-10 left-10 h-40 w-40 animate-pulse rounded-full blur-3xl"></div>
      <div className="bg-bright-yellow/10 absolute right-10 bottom-10 h-32 w-32 animate-pulse rounded-full blur-2xl delay-1000"></div>
      <div className="bg-accent-leaf-green/5 absolute top-1/2 left-1/4 h-24 w-24 animate-pulse rounded-full blur-xl delay-500"></div>

      <Card className="restaurant-card relative z-10 w-full max-w-md border-0 bg-white/95 shadow-2xl backdrop-blur-sm">
        <CardHeader className="space-y-4 pb-8 text-center">
          {/* Aasta Logo */}
          <div className="mb-8 flex justify-center">
            <div className="from-accent-leaf-green to-bright-yellow flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br shadow-lg transition-transform duration-300 group-hover:scale-105">
              <span className="text-brand text-primary-dark-green text-4xl font-bold drop-shadow-sm">
                A
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <CardTitle className="text-brand text-primary-dark-green text-4xl font-bold">
              Admin Portal
            </CardTitle>
            <CardDescription className="text-heading text-primary-dark-green/80 text-lg">
              Sign in to access the admin dashboard
            </CardDescription>
            <div className="text-primary-dark-green/60 flex items-center justify-center space-x-2 text-xs">
              <div className="h-2 w-2 animate-pulse rounded-full bg-green-500"></div>
              <span>Secure Access</span>
            </div>
          </div>

          {/* Admin Icon */}
          <div className="flex justify-center py-6">
            <div className="from-bright-yellow to-bright-yellow/80 rounded-2xl bg-gradient-to-br p-4 shadow-lg">
              <Shield className="text-primary-dark-green h-10 w-10" />
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-8 px-8 pb-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-primary-dark-green text-sm font-medium"
              >
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter admin email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="border-primary-dark-green/20 focus:border-accent-leaf-green selectable h-14 rounded-2xl border-2 bg-gray-50/50 transition-all duration-200 focus:bg-white"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="password"
                className="text-primary-dark-green text-sm font-medium"
              >
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter admin password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="border-primary-dark-green/20 focus:border-accent-leaf-green selectable h-14 rounded-2xl border-2 bg-gray-50/50 pr-12 transition-all duration-200 focus:bg-white"
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="touchable hover:bg-accent-leaf-green/20 absolute top-1/2 right-3 -translate-y-1/2 transform rounded-xl"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {error && (
              <Alert className="border-red-500 bg-red-50">
                <AlertDescription className="text-red-700">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="from-accent-leaf-green to-bright-yellow hover:from-accent-leaf-green/90 hover:to-bright-yellow/90 text-primary-dark-green border-primary-dark-green touchable h-16 w-full transform rounded-2xl border-2 bg-gradient-to-r text-lg font-bold shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In to Admin Panel'
              )}
            </Button>
          </form>

          <div className="from-bright-yellow/10 to-accent-leaf-green/10 border-primary-dark-green/10 space-y-3 rounded-2xl border bg-gradient-to-r p-6">
            <h3 className="text-heading text-primary-dark-green flex items-center font-bold">
              <div className="bg-accent-leaf-green mr-2 h-2 w-2 rounded-full"></div>
              Admin Access
            </h3>
            <ul className="text-primary-dark-green/80 space-y-2 text-sm">
              <li className="flex items-center">
                <div className="bg-primary-dark-green mr-3 h-1 w-1 rounded-full"></div>
                Manage all restaurants and menus
              </li>
              <li className="flex items-center">
                <div className="bg-primary-dark-green mr-3 h-1 w-1 rounded-full"></div>
                View comprehensive analytics
              </li>
              <li className="flex items-center">
                <div className="bg-primary-dark-green mr-3 h-1 w-1 rounded-full"></div>
                Monitor delivery partners
              </li>
              <li className="flex items-center">
                <div className="bg-primary-dark-green mr-3 h-1 w-1 rounded-full"></div>
                Track orders and earnings
              </li>
            </ul>
          </div>

          <div className="border-primary-dark-green/10 border-t pt-4 text-center">
            <p className="text-primary-dark-green/60 flex items-center justify-center text-xs">
              <div className="bg-accent-leaf-green mr-2 h-1 w-1 rounded-full"></div>
              Admin Portal • Aasta Night Delivery Platform
              <div className="bg-accent-leaf-green ml-2 h-1 w-1 rounded-full"></div>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
