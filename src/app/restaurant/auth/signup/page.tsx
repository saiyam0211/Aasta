'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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
import {
  Loader2,
  ChefHat,
  Mail,
  Lock,
  User,
  Phone,
  Eye,
  EyeOff,
  CheckCircle,
} from 'lucide-react';
import { toast } from 'sonner';

export default function SignUpPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Password validation
  const isPasswordValid = password.length >= 6;
  const doPasswordsMatch =
    password === confirmPassword && confirmPassword.length > 0;

  const handleSignUp = async () => {
    // Validation
    if (!email || !password || !confirmPassword || !ownerName) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/restaurant/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          ownerName,
          phone,
        }),
      });
      const data = await response.json();

      if (response.ok) {
        toast.success('Account created successfully!');
        setTimeout(() => {
          router.push('/restaurant/auth/signin');
        }, 1000);
      } else {
        toast.error(data.error || 'Signup failed, please try again.');
      }
    } catch (error) {
      console.error('Signup error:', error);
      toast.error('An error occurred, please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <Card className="w-full max-w-lg overflow-hidden rounded-2xl border-0 bg-white shadow-xl">
        <CardHeader className="bg-primary-dark-green px-6 py-8 text-center">
          {/* Aasta Logo */}
          <div className="mb-4 flex justify-center">
            <div className="bg-accent-leaf-green flex h-16 w-16 items-center justify-center rounded-2xl shadow-lg">
              <span className="text-brand text-primary-dark-green text-2xl font-bold">
                A
              </span>
            </div>
          </div>

          <CardTitle className="text-brand mb-2 text-2xl font-bold text-white">
            Join as a Restaurant Partner
          </CardTitle>
          <CardDescription className="text-accent-leaf-green text-sm">
            Create your account to start managing your restaurant on Aasta
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 p-6">
          {/* Owner Name Input */}
          <div className="space-y-2">
            <Label
              htmlFor="ownerName"
              className="text-sm font-medium text-gray-700"
            >
              Owner Name *
            </Label>
            <div className="relative">
              <User className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
              <Input
                id="ownerName"
                type="text"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                className="focus:border-accent-leaf-green h-12 rounded-xl border-2 border-gray-200 pl-10 focus:ring-0"
                placeholder="Enter your full name"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Email Input */}
          <div className="space-y-2">
            <Label
              htmlFor="email"
              className="text-sm font-medium text-gray-700"
            >
              Email Address *
            </Label>
            <div className="relative">
              <Mail className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="focus:border-accent-leaf-green h-12 rounded-xl border-2 border-gray-200 pl-10 focus:ring-0"
                placeholder="restaurant@example.com"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Phone Input */}
          <div className="space-y-2">
            <Label
              htmlFor="phone"
              className="text-sm font-medium text-gray-700"
            >
              Phone (Optional)
            </Label>
            <div className="relative">
              <Phone className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="focus:border-accent-leaf-green h-12 rounded-xl border-2 border-gray-200 pl-10 focus:ring-0"
                placeholder="+91-9876543210"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-2">
            <Label
              htmlFor="password"
              className="text-sm font-medium text-gray-700"
            >
              Create Password *
            </Label>
            <div className="relative">
              <Lock className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="focus:border-accent-leaf-green h-12 rounded-xl border-2 border-gray-200 pr-10 pl-10 focus:ring-0"
                placeholder="Create a secure password"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute top-1/2 right-3 -translate-y-1/2 transform text-gray-400 hover:text-gray-600"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {password.length > 0 && (
              <p
                className={`mt-1 text-xs ${isPasswordValid ? 'text-green-600' : 'text-red-600'}`}
              >
                Password must be at least 6 characters long.
              </p>
            )}
          </div>

          {/* Confirm Password Input */}
          <div className="space-y-2">
            <Label
              htmlFor="confirmPassword"
              className="text-sm font-medium text-gray-700"
            >
              Confirm Password *
            </Label>
            <div className="relative">
              <Lock className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="focus:border-accent-leaf-green h-12 rounded-xl border-2 border-gray-200 pr-10 pl-10 focus:ring-0"
                placeholder="Confirm your password"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute top-1/2 right-3 -translate-y-1/2 transform text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {confirmPassword.length > 0 && (
              <p
                className={`mt-1 text-xs ${doPasswordsMatch ? 'text-green-600' : 'text-red-600'}`}
              >
                {doPasswordsMatch
                  ? 'Passwords match!'
                  : 'Passwords do not match.'}
              </p>
            )}
          </div>

          {/* Sign Up Button */}
          <Button
            onClick={handleSignUp}
            disabled={
              isLoading ||
              !email ||
              !isPasswordValid ||
              !doPasswordsMatch ||
              !ownerName
            }
            className="from-accent-leaf-green to-bright-yellow hover:from-accent-leaf-green/90 hover:to-bright-yellow/90 text-primary-dark-green h-12 w-full transform rounded-xl border-0 bg-gradient-to-r font-semibold shadow-lg transition-all duration-200 hover:scale-[1.02] disabled:transform-none disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Account...
              </>
            ) : (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Create Restaurant Account
              </>
            )}
          </Button>

          {/* Divider */}
          <div className="my-6 flex items-center">
            <div className="flex-1 border-t border-gray-200"></div>
            <span className="bg-white px-3 text-xs text-gray-500">
              Already a partner?
            </span>
            <div className="flex-1 border-t border-gray-200"></div>
          </div>

          {/* Sign In Link */}
          <Button
            variant="outline"
            asChild
            className="border-primary-dark-green text-primary-dark-green hover:bg-primary-dark-green h-12 w-full rounded-xl border-2 transition-all duration-200 hover:text-white"
          >
            <Link href="/restaurant/auth/signin">
              Sign In to Your Dashboard
            </Link>
          </Button>

          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500">
              © 2024 Aasta • Secure Partner Portal
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
