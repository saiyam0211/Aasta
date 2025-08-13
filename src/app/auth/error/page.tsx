'use client';

import { useSearchParams } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';
import Link from 'next/link';

const errorMessages = {
  OAuthAccountNotLinked:
    'This Google account is already associated with another account. Please sign in with the original method.',
  AccessDenied: 'Access denied. You do not have permission to sign in.',
  Verification: 'The verification link was invalid or has expired.',
  Default: 'An error occurred during authentication. Please try again.',
};

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams?.get('error') as keyof typeof errorMessages;

  const errorMessage = errorMessages[error] || errorMessages.Default;

  return (
    <div className="bg-primary-dark-green flex min-h-screen items-center justify-center p-4">
      <Card className="restaurant-card w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          {/* Aasta Logo */}
          <div className="mb-4 flex justify-center">
            <div className="bg-accent-leaf-green flex h-16 w-16 items-center justify-center rounded-2xl">
              <span className="text-brand text-primary-dark-green text-2xl font-bold">
                A
              </span>
            </div>
          </div>

          <div className="mb-4 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
          </div>

          <CardTitle className="text-brand text-2xl font-bold text-red-600">
            Authentication Error
          </CardTitle>
          <CardDescription className="text-primary-dark-green text-center">
            {errorMessage}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Link href="/auth/signin">
              <Button className="btn-primary w-full">Try Again</Button>
            </Link>
            <Link href="/">
              <Button
                variant="outline"
                className="border-primary-dark-green text-primary-dark-green w-full border-2"
              >
                Go to Home
              </Button>
            </Link>
          </div>

          {error === 'OAuthAccountNotLinked' && (
            <div className="bg-accent-leaf-green/20 rounded-xl p-4">
              <h3 className="text-heading text-primary-dark-green mb-2 font-semibold">
                Need Help?
              </h3>
              <p className="text-primary-dark-green text-sm">
                If you're having trouble signing in, try clearing your browser
                cookies or contact support.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
