"use client";

import { signIn, getSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Bike } from "lucide-react";
import { toast } from "sonner";

export default function DeliverySignInPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if user is already authenticated
    const checkAuth = async () => {
      const session = await getSession();
      if (session) {
        // Check if user already has delivery partner role
        if (session.user.role === 'DELIVERY_PARTNER') {
          router.push("/delivery/dashboard");
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
          role: 'DELIVERY_PARTNER',
        }),
      });

      if (!response.ok) {
        console.error('Failed to update user role:', await response.json());
        toast.error('Failed to set delivery partner role. Please try again.');
        setIsLoading(false);
        return;
      }

      // Show success message and reload to refresh the session
      toast.success('Delivery partner account created successfully!');
      
      // Use setTimeout to give the toast time to show, then reload
      setTimeout(() => {
        window.location.href = '/delivery/dashboard';
      }, 1000);
    } catch (error) {
      console.error('Error updating user role:', error);
      toast.error('Failed to update role. Please try again.');
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      
      // Sign in with Google
      const result = await signIn("google", { 
        redirect: false // Don't redirect automatically
      });

      if (result?.ok) {
        // After successful sign-in, update the user's role to delivery partner
        const session = await getSession();

        if (session?.user?.email) {
          const response = await fetch('/api/user/update-role', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userId: session.user.id,
              role: 'DELIVERY_PARTNER',
            }),
          });

          if (!response.ok) {
            console.error('Failed to update user role:', await response.json());
            toast.error('Failed to set delivery partner role. Please try again.');
            return;
          }

          // Show success message and reload to refresh the session
          toast.success('Delivery partner account created successfully!');
          
          // Use setTimeout to give the toast time to show, then reload
          setTimeout(() => {
            window.location.href = '/delivery/dashboard';
          }, 1000);
        }
      } else if (result?.error) {
        console.error("Sign in error:", result.error);
        toast.error("Failed to sign in. Please try again.");
      }
    } catch (error) {
      console.error("Sign in error:", error);
      toast.error("Failed to sign in. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-primary-dark-green p-4">
      <Card className="w-full max-w-md restaurant-card">
        <CardHeader className="space-y-1 text-center">
          {/* Aasta Logo */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center bg-accent-leaf-green">
              <span className="text-brand font-bold text-3xl text-primary-dark-green">A</span>
            </div>
          </div>
          
          <CardTitle className="text-brand text-3xl font-bold text-primary-dark-green">
            Delivery Partner
          </CardTitle>
          <CardDescription className="text-heading text-lg text-primary-dark-green">
            Earn with Aasta's premium night delivery service
          </CardDescription>
          
          {/* Delivery Icon */}
          <div className="flex justify-center py-4">
            <div className="p-3 bg-bright-yellow rounded-xl">
              <Bike className="w-8 h-8 text-primary-dark-green" />
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <Button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full h-12 bg-accent-leaf-green hover:bg-accent-leaf-green/90 text-primary-dark-green border-2 border-primary-dark-green rounded-xl font-semibold text-base touchable"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </>
            )}
          </Button>
          
          <div className="bg-bright-yellow/20 rounded-xl p-4 space-y-2">
            <h3 className="text-heading font-semibold text-primary-dark-green">
              Why deliver with Aasta?
            </h3>
            <ul className="text-sm text-primary-dark-green space-y-1">
              <li>• Higher earnings during night hours</li>
              <li>• Premium delivery charges</li>
              <li>• Flexible working hours (9 PM - 12 AM)</li>
              <li>• Efficient batch delivery system</li>
              <li>• Telegram integration for easy updates</li>
            </ul>
          </div>
          
          <div className="text-center">
            <p className="text-xs text-gray-600">
              Delivery Partner Portal • Night Shift: 9 PM - 12 AM
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 