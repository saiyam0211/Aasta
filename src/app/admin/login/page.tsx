"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, Shield, Loader2 } from "lucide-react";
import { validateAdminCredentials, adminSession } from "@/lib/admin-auth";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if admin is already logged in
    const existingSession = adminSession.get();
    if (existingSession) {
      router.push("/admin/dashboard");
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const adminUser = validateAdminCredentials(email, password);
      
      if (adminUser) {
        adminSession.set(adminUser);
        router.push("/admin/dashboard");
      } else {
        setError("Invalid email or password");
      }
    } catch (error) {
      setError("Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-dark-green via-primary-dark-green to-primary-dark-green/80 p-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-10 left-10 w-40 h-40 bg-accent-leaf-green/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-10 right-10 w-32 h-32 bg-bright-yellow/10 rounded-full blur-2xl animate-pulse delay-1000"></div>
      <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-accent-leaf-green/5 rounded-full blur-xl animate-pulse delay-500"></div>
      
      <Card className="w-full max-w-md restaurant-card border-0 shadow-2xl backdrop-blur-sm bg-white/95 relative z-10">
        <CardHeader className="space-y-4 text-center pb-8">
          {/* Aasta Logo */}
          <div className="flex justify-center mb-8">
            <div className="w-24 h-24 rounded-3xl flex items-center justify-center bg-gradient-to-br from-accent-leaf-green to-bright-yellow shadow-lg group-hover:scale-105 transition-transform duration-300">
              <span className="text-brand font-bold text-4xl text-primary-dark-green drop-shadow-sm">A</span>
            </div>
          </div>
          
          <div className="space-y-3">
            <CardTitle className="text-brand text-4xl font-bold text-primary-dark-green">
              Admin Portal
            </CardTitle>
            <CardDescription className="text-heading text-lg text-primary-dark-green/80">
              Sign in to access the admin dashboard
            </CardDescription>
            <div className="flex items-center justify-center space-x-2 text-xs text-primary-dark-green/60">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Secure Access</span>
            </div>
          </div>
          
          {/* Admin Icon */}
          <div className="flex justify-center py-6">
            <div className="p-4 bg-gradient-to-br from-bright-yellow to-bright-yellow/80 rounded-2xl shadow-lg">
              <Shield className="w-10 h-10 text-primary-dark-green" />
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-8 px-8 pb-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-primary-dark-green">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter admin email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-14 border-2 border-primary-dark-green/20 focus:border-accent-leaf-green rounded-2xl selectable bg-gray-50/50 focus:bg-white transition-all duration-200"
                disabled={isLoading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-primary-dark-green">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter admin password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-14 border-2 border-primary-dark-green/20 focus:border-accent-leaf-green rounded-2xl pr-12 selectable bg-gray-50/50 focus:bg-white transition-all duration-200"
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 touchable hover:bg-accent-leaf-green/20 rounded-xl"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
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
              className="w-full h-16 bg-gradient-to-r from-accent-leaf-green to-bright-yellow hover:from-accent-leaf-green/90 hover:to-bright-yellow/90 text-primary-dark-green border-2 border-primary-dark-green rounded-2xl font-bold text-lg touchable shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In to Admin Panel"
              )}
            </Button>
          </form>
          
          <div className="bg-gradient-to-r from-bright-yellow/10 to-accent-leaf-green/10 rounded-2xl p-6 space-y-3 border border-primary-dark-green/10">
            <h3 className="text-heading font-bold text-primary-dark-green flex items-center">
              <div className="w-2 h-2 bg-accent-leaf-green rounded-full mr-2"></div>
              Admin Access
            </h3>
            <ul className="text-sm text-primary-dark-green/80 space-y-2">
              <li className="flex items-center">
                <div className="w-1 h-1 bg-primary-dark-green rounded-full mr-3"></div>
                Manage all restaurants and menus
              </li>
              <li className="flex items-center">
                <div className="w-1 h-1 bg-primary-dark-green rounded-full mr-3"></div>
                View comprehensive analytics
              </li>
              <li className="flex items-center">
                <div className="w-1 h-1 bg-primary-dark-green rounded-full mr-3"></div>
                Monitor delivery partners
              </li>
              <li className="flex items-center">
                <div className="w-1 h-1 bg-primary-dark-green rounded-full mr-3"></div>
                Track orders and earnings
              </li>
            </ul>
          </div>
          
          <div className="text-center pt-4 border-t border-primary-dark-green/10">
            <p className="text-xs text-primary-dark-green/60 flex items-center justify-center">
              <div className="w-1 h-1 bg-accent-leaf-green rounded-full mr-2"></div>
              Admin Portal • Aasta Night Delivery Platform
              <div className="w-1 h-1 bg-accent-leaf-green rounded-full ml-2"></div>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
