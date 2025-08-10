"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ChefHat, Mail, Lock, User, Phone, Eye, EyeOff, CheckCircle } from "lucide-react";
import { toast } from "sonner";

export default function SignUpPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Password validation
  const isPasswordValid = password.length >= 6;
  const doPasswordsMatch = password === confirmPassword && confirmPassword.length > 0;

  const handleSignUp = async () => {
    // Validation
    if (!email || !password || !confirmPassword || !ownerName) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/restaurant/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          email, 
          password, 
          ownerName,
          phone 
        }),
      });
      const data = await response.json();

      if (response.ok) {
        toast.success("Account created successfully!");
        setTimeout(() => {
          router.push("/restaurant/auth/signin");
        }, 1000);
      } else {
        toast.error(data.error || "Signup failed, please try again.");
      }
    } catch (error) {
      console.error("Signup error:", error);
      toast.error("An error occurred, please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg bg-white shadow-xl border-0 rounded-2xl overflow-hidden">
        <CardHeader className="bg-primary-dark-green text-center py-8 px-6">
          {/* Aasta Logo */}
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-accent-leaf-green shadow-lg">
              <span className="text-brand font-bold text-2xl text-primary-dark-green">A</span>
            </div>
          </div>
          
          <CardTitle className="text-brand text-2xl font-bold text-white mb-2">
            Join as a Restaurant Partner
          </CardTitle>
          <CardDescription className="text-accent-leaf-green text-sm">
            Create your account to start managing your restaurant on Aasta
          </CardDescription>
        </CardHeader>
        
        <CardContent className="p-6 space-y-4">
          {/* Owner Name Input */}
          <div className="space-y-2">
            <Label htmlFor="ownerName" className="text-sm font-medium text-gray-700">Owner Name *</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                id="ownerName"
                type="text"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                className="pl-10 h-12 border-2 border-gray-200 rounded-xl focus:border-accent-leaf-green focus:ring-0"
                placeholder="Enter your full name"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Email Input */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email Address *</Label>
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

          {/* Phone Input */}
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-sm font-medium text-gray-700">Phone (Optional)</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="pl-10 h-12 border-2 border-gray-200 rounded-xl focus:border-accent-leaf-green focus:ring-0"
                placeholder="+91-9876543210"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium text-gray-700">Create Password *</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 pr-10 h-12 border-2 border-gray-200 rounded-xl focus:border-accent-leaf-green focus:ring-0"
                placeholder="Create a secure password"
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
            {password.length > 0 && (
              <p className={`text-xs mt-1 ${isPasswordValid ? 'text-green-600' : 'text-red-600'}`}>
                Password must be at least 6 characters long.
              </p>
            )}
          </div>

          {/* Confirm Password Input */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">Confirm Password *</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="pl-10 pr-10 h-12 border-2 border-gray-200 rounded-xl focus:border-accent-leaf-green focus:ring-0"
                placeholder="Confirm your password"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {confirmPassword.length > 0 && (
              <p className={`text-xs mt-1 ${doPasswordsMatch ? 'text-green-600' : 'text-red-600'}`}>
                {doPasswordsMatch ? "Passwords match!" : "Passwords do not match."}
              </p>
            )}
          </div>

          {/* Sign Up Button */}
          <Button
            onClick={handleSignUp}
            disabled={isLoading || !email || !isPasswordValid || !doPasswordsMatch || !ownerName}
            className="w-full h-12 bg-gradient-to-r from-accent-leaf-green to-bright-yellow hover:from-accent-leaf-green/90 hover:to-bright-yellow/90 text-primary-dark-green font-semibold rounded-xl border-0 shadow-lg transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:transform-none"
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
          <div className="flex items-center my-6">
            <div className="flex-1 border-t border-gray-200"></div>
            <span className="px-3 text-xs text-gray-500 bg-white">Already a partner?</span>
            <div className="flex-1 border-t border-gray-200"></div>
          </div>

          {/* Sign In Link */}
          <Button
            variant="outline"
            asChild
            className="w-full h-12 border-2 border-primary-dark-green text-primary-dark-green hover:bg-primary-dark-green hover:text-white rounded-xl transition-all duration-200"
          >
            <Link href="/restaurant/auth/signin">
              Sign In to Your Dashboard
            </Link>
          </Button>
          
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
