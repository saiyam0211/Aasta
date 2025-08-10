"use client";

import { signIn, getSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ChefHat, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

export default function RestaurantSignInPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if user is already authenticated
    const checkAuth = async () => {
      const session = await getSession();
      if (session) {
        // Check if user already has restaurant role
        if (session.user.role === 'RESTAURANT_OWNER') {
          router.push("/restaurant/dashboard");
        } else if (session.user.role === 'CUSTOMER') {
          // User is authenticated but needs role update
          setIsLoading(true);
          await updateUserRole(session.user.id);
        }
      }
    };
    checkAuth();
  }, [router]);

  const updateUserRole = async (userId: string) => {
    try {
      const response = await fetch('/api/user/update-role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId,
          role: 'RESTAURANT_OWNER',
        }),
      });

      if (!response.ok) {
        console.error('Failed to update user role:', await response.json());
        toast.error('Failed to set restaurant role. Please try again.');
        setIsLoading(false);
        return;
      }

      // Show success message and reload to refresh the session
      toast.success('Restaurant account created successfully!');
      
      // Use setTimeout to give the toast time to show, then reload
      setTimeout(() => {
        window.location.href = '/restaurant/dashboard';
      }, 1000);
    } catch (error) {
      console.error('Error updating user role:', error);
      toast.error('Failed to update role. Please try again.');
      setIsLoading(false);
    }
  };

  const handleSignIn = async () => {
    if (!email || !password) {
      toast.error("Please enter both email and password");
      return;
    }

    try {
      setIsLoading(true);
      
      // Sign in with credentials
      const result = await signIn("restaurant-credentials", { 
        email,
        password,
        redirect: false
      });

      if (result?.ok) {
        toast.success('Signed in successfully!');
        router.push('/restaurant/dashboard');
      } else {
        toast.error(result?.error || "Invalid credentials. Please try again.");
      }
    } catch (error) {
      console.error("Sign in error:", error);
      toast.error("Failed to sign in. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white shadow-xl border-0 rounded-2xl overflow-hidden">
        <CardHeader className="bg-primary-dark-green text-center py-8 px-6">
          {/* Aasta Logo */}
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-accent-leaf-green shadow-lg">
              <span className="text-brand font-bold text-2xl text-primary-dark-green">A</span>
            </div>
          </div>
          
          <CardTitle className="text-brand text-2xl font-bold text-white mb-2">
            Restaurant Partner
          </CardTitle>
          <CardDescription className="text-accent-leaf-green text-sm">
            Welcome back to Aasta's partner portal
          </CardDescription>
        </CardHeader>
        
        <CardContent className="p-6 space-y-4">
          {/* Email Input */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email Address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 h-12 border-2 border-gray-200 rounded-xl focus:border-accent-leaf-green focus:ring-0"
                placeholder="restaurant@example.com"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium text-gray-700">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 pr-10 h-12 border-2 border-gray-200 rounded-xl focus:border-accent-leaf-green focus:ring-0"
                placeholder="Enter your password"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Sign In Button */}
          <Button
            onClick={handleSignIn}
            disabled={isLoading || !email || !password}
            className="w-full h-12 bg-gradient-to-r from-accent-leaf-green to-bright-yellow hover:from-accent-leaf-green/90 hover:to-bright-yellow/90 text-primary-dark-green font-semibold rounded-xl border-0 shadow-lg transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:transform-none"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                <ChefHat className="mr-2 h-4 w-4" />
                Sign In to Dashboard
              </>
            )}
          </Button>

          {/* Divider */}
          <div className="flex items-center my-6">
            <div className="flex-1 border-t border-gray-200"></div>
            <span className="px-3 text-xs text-gray-500 bg-white">New to Aasta?</span>
            <div className="flex-1 border-t border-gray-200"></div>
          </div>

          {/* Sign Up Link */}
          <Button
            variant="outline"
            asChild
            className="w-full h-12 border-2 border-primary-dark-green text-primary-dark-green hover:bg-primary-dark-green hover:text-white rounded-xl transition-all duration-200"
          >
            <Link href="/restaurant/auth/signup">
              Create Restaurant Account
            </Link>
          </Button>
          
          {/* Benefits Section */}
          <div className="mt-6 p-4 bg-gradient-to-r from-accent-leaf-green/10 to-bright-yellow/10 rounded-xl border border-accent-leaf-green/20">
            <h3 className="font-semibold text-primary-dark-green mb-2 text-sm">
              ✨ Partner Benefits
            </h3>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>🌙 Premium night-time delivery (9 PM - 12 AM)</li>
              <li>💰 Higher order values during late hours</li>
              <li>🚀 Dedicated delivery partner network</li>
              <li>📊 Real-time analytics and insights</li>
            </ul>
          </div>
          
          <div className="text-center mt-4">
            <p className="text-xs text-gray-500">
              © 2024 Aasta • Secure Partner Portal
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 