"use client";

import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import Link from "next/link";

const errorMessages = {
  OAuthAccountNotLinked: "This Google account is already associated with another account. Please sign in with the original method.",
  AccessDenied: "Access denied. You do not have permission to sign in.",
  Verification: "The verification link was invalid or has expired.",
  Default: "An error occurred during authentication. Please try again.",
};

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams?.get("error") as keyof typeof errorMessages;
  
  const errorMessage = errorMessages[error] || errorMessages.Default;

  return (
    <div className="min-h-screen flex items-center justify-center bg-primary-dark-green p-4">
      <Card className="w-full max-w-md restaurant-card">
        <CardHeader className="space-y-1 text-center">
          {/* Aasta Logo */}
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-accent-leaf-green">
              <span className="text-brand font-bold text-2xl text-primary-dark-green">A</span>
            </div>
          </div>
          
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
          </div>
          
          <CardTitle className="text-brand text-2xl font-bold text-red-600">Authentication Error</CardTitle>
          <CardDescription className="text-primary-dark-green text-center">
            {errorMessage}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Link href="/auth/signin">
              <Button className="w-full btn-primary">
                Try Again
              </Button>
            </Link>
            <Link href="/">
              <Button variant="outline" className="w-full border-2 border-primary-dark-green text-primary-dark-green">
                Go to Home
              </Button>
            </Link>
          </div>
          
          {error === "OAuthAccountNotLinked" && (
            <div className="bg-accent-leaf-green/20 p-4 rounded-xl">
              <h3 className="text-heading font-semibold text-primary-dark-green mb-2">Need Help?</h3>
              <p className="text-sm text-primary-dark-green">
                If you're having trouble signing in, try clearing your browser cookies or contact support.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 