'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { Browser } from '@capacitor/browser';

export default function SignInPage() {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      const callbackPath = '/customer';
      const absoluteCallbackUrl = `https://aastadelivery.vercel.app${callbackPath}`;

      if (Capacitor.isNativePlatform()) {
        // Always start OAuth at NextAuth's endpoint in the system browser
        // so state/CSRF cookies are set in the same browser (Chrome Custom Tab)
        const nextAuthInitUrl = `https://aastadelivery.vercel.app/api/auth/signin/google?prompt=select_account&callbackUrl=${encodeURIComponent(
          absoluteCallbackUrl
        )}`;
        await Browser.open({ url: nextAuthInitUrl, presentationStyle: 'fullscreen' });
        setIsLoading(false);
        return;
      }

      // Web fallback: normal NextAuth redirect
      await signIn('google', { callbackUrl: callbackPath, redirect: true });
    } catch (error) {
      console.error('Sign in error:', error);
      setIsLoading(false);
    }
  };

  return (
    <div
      className="flex min-h-screen items-center justify-center p-4"
      style={{ backgroundColor: '#002a01' }}
    >
      <Card
        className="w-full max-w-md"
        style={{
          backgroundColor: '#fcfefe',
          borderRadius: '16px',
          boxShadow: '0 4px 20px rgba(0, 42, 1, 0.15)',
        }}
      >
        <CardHeader className="space-y-1 text-center">
          {/* Aasta Logo */}
          <div className="mb-6 flex justify-center">
            <div
              className="flex h-20 w-20 items-center justify-center"
              style={{
                backgroundColor: '#d1f86a',
                borderRadius: '16px',
              }}
            >
              <span
                className="text-3xl font-bold"
                style={{
                  color: '#002a01',
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: '700',
                }}
              >
                A
              </span>
            </div>
          </div>

          <CardTitle
            className="text-3xl font-bold"
            style={{
              color: '#002a01',
              fontFamily: 'Inter, sans-serif',
              fontWeight: '700',
            }}
          >
            Welcome to Aasta
          </CardTitle>
          <CardDescription
            className="text-lg"
            style={{
              color: '#002a01',
              fontStyle: 'italic',
            }}
          >
            Premium late night food delivery from 9 PM to 12 AM ✨
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <Button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="h-12 w-full text-base font-semibold"
            style={{
              backgroundColor: '#d1f86a',
              color: '#002a01',
              border: '2px solid #002a01',
              borderRadius: '12px',
              minHeight: '48px',
            }}
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

          <div className="space-y-2 text-center">
            <p className="text-xs text-gray-600">
              By continuing, you agree to our{' '}
              <a
                href="/terms"
                className="underline hover:no-underline"
                style={{ color: '#002a01' }}
              >
                Terms of Service
              </a>{' '}
              and{' '}
                <a
                  href="/privacy"
                  className="underline hover:no-underline"
                  style={{ color: '#002a01' }}
                >
                  Privacy Policy
                </a>
            </p>
          </div>

          <div
            className="rounded-xl p-4 text-center"
            style={{ backgroundColor: 'rgba(209, 248, 106, 0.2)' }}
          >
            <p
              className="mb-1 font-semibold"
              style={{
                color: '#002a01',
                fontFamily: 'Inter, sans-serif',
                fontWeight: '600',
              }}
            >
              Operating Hours:
            </p>
            <p className="text-2xl font-bold" style={{ color: '#002a01' }}>
              9:00 PM
            </p>
            <p className="text-sm" style={{ color: '#002a01' }}>
              to
            </p>
            <p className="text-2xl font-bold" style={{ color: '#002a01' }}>
              12:00 AM
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
