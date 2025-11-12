'use client';

// imports
import { ChevronRight } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Lottie from 'lottie-react';
import step1 from '../../../../public/lotties/step1.json';
import step1_new from '../../../../public/lotties/step1_new.json';
import step3_new from '../../../../public/lotties/step3_new.json';
import step2 from '../../../../public/lotties/step2.json';
import step3 from '../../../../public/lotties/step3.json';

import { createInvisibleRecaptcha, sendOtp } from '@/lib/firebase-client';
import {
  isNativePlatform,
  sendNativeOtp,
  verifyNativeOtp,
} from '@/lib/firebase-native-auth';
import type { RecaptchaVerifier, ConfirmationResult } from 'firebase/auth';

import { signIn, useSession } from 'next-auth/react';
import { setBackOverride } from '@/lib/back-channel';
import { useRouter } from 'next/navigation';
import SignInStep from './components/SignInStep';
import Step4 from './components/Step4';
import Step5 from './components/Step5';
import Step6 from './components/Step6';

export default function SignInPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  // state variables declarations
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<number>(1);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [confirmation, setConfirmation] = useState<ConfirmationResult | null>(
    null
  );
  const [nativeVerificationId, setNativeVerificationId] = useState<
    string | null
  >(null);
  const [error, setError] = useState('');
  const verifierRef = useRef<RecaptchaVerifier | null>(null);
  const lastPushedStepRef = useRef<number>(1);
  const [useNativeAuth, setUseNativeAuth] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      console.log(
        '[AUTH] ✅ User already authenticated, redirecting to home...'
      );
      // Use hard redirect to ensure session is properly loaded
      window.location.href = '/';
    }
  }, [status, session]);

  // Detect platform on mount
  useEffect(() => {
    // Only use native auth on iOS (APNs works great)
    // Use web auth on Android (more reliable than SafetyNet)
    const platform = isNativePlatform();
    const isIOS =
      platform &&
      typeof navigator !== 'undefined' &&
      /iPhone|iPad|iPod/.test(navigator.userAgent);

    setUseNativeAuth(isIOS);

    if (isIOS) {
      console.log('[AUTH] 🍎 iOS detected, using native Firebase Auth (APNs)');
    } else if (platform) {
      console.log(
        '[AUTH] 🤖 Android detected, using web Firebase Auth (reCAPTCHA)'
      );
    } else {
      console.log(
        '[AUTH] 🌐 Web platform detected, using web Firebase Auth with reCAPTCHA'
      );
    }
  }, []);

  // Pre-initialize invisible reCAPTCHA when entering step 5 to hide setup cost
  // Skip on native platforms since we use native Firebase Auth
  useEffect(() => {
    if (useNativeAuth) return; // Skip reCAPTCHA on native platforms

    if (step === 5 && !verifierRef.current) {
      try {
        const t = performance.now();
        verifierRef.current = createInvisibleRecaptcha(
          'recaptcha-container',
          'invisible'
        );
        console.log(
          `[AUTH] reCAPTCHA initialized at ${new Date().toISOString()} (+${Math.round(performance.now() - t)}ms)`
        );
      } catch (e) {
        console.warn('[AUTH] reCAPTCHA init failed (will retry on send):', e);
        verifierRef.current = null;
      }
    }
  }, [step, useNativeAuth]);

  // Manage browser history so that device/browser back navigates steps
  useEffect(() => {
    // Push a new history state each time the step increases
    try {
      if (typeof window !== 'undefined') {
        if (step > lastPushedStepRef.current) {
          window.history.pushState({ step }, '', window.location.href);
          lastPushedStepRef.current = step;
        }
      }
    } catch {}
  }, [step]);

  useEffect(() => {
    function onPopState() {
      // Move back one step if possible; otherwise fall through to default
      if (step > 1) {
        setStep(step - 1);
      }
    }
    if (typeof window !== 'undefined') {
      window.addEventListener('popstate', onPopState);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('popstate', onPopState);
      }
    };
  }, [step]);

  // Register a back override so native back (Capacitor) also steps back
  useEffect(() => {
    setBackOverride(() => {
      if (step > 1) {
        setStep((s) => Math.max(1, s - 1));
        return true; // handled
      }
      return false; // not handled
    });
    return () => setBackOverride(null);
  }, [step]);

  // Warm NextAuth endpoints when OTP screen loads to reduce verify latency
  useEffect(() => {
    if (step === 6) {
      const t0 = performance.now();
      // Fire-and-forget; no UI impact
      fetch('/api/auth/csrf').catch(() => {});
      fetch('/api/auth/session').catch(() => {});
      console.log(
        `[AUTH] Prefetched NextAuth endpoints (+${Math.round(performance.now() - t0)}ms)`
      );
    }
  }, [step]);

  // Pre-init earlier on step 4 as well and warm Firebase pathing
  // Skip on native platforms since we use native Firebase Auth
  useEffect(() => {
    if (useNativeAuth) return; // Skip reCAPTCHA on native platforms

    if (step === 4 && !verifierRef.current) {
      try {
        const t = performance.now();
        verifierRef.current = createInvisibleRecaptcha(
          'recaptcha-container',
          'invisible'
        );
        console.log(
          `[AUTH] reCAPTCHA pre-initialized at step 4 (+${Math.round(performance.now() - t)}ms)`
        );
      } catch (e) {
        console.warn('[AUTH] Step 4 reCAPTCHA pre-init failed (non-blocking).');
      }
    }
    // Light warmup: touch Date.now to keep logs aligned and ensure module paths are hot
    if (step === 4) {
      // no-op warmup, place for future lightweight pings if needed
      // console.debug('[AUTH] Warmup step 4 executed');
    }
  }, [step, useNativeAuth]);

  async function startPhoneFlow() {
    setError('');
    try {
      setIsLoading(true);
      const clickT0 = performance.now();
      console.log(`[AUTH] 🚀 Send OTP clicked at ${new Date().toISOString()}`);

      // Clean phone number to E.164 format (remove spaces, dashes, etc.)
      let formatted = phone.trim().startsWith('+')
        ? phone.trim()
        : `+91${phone.trim()}`;

      // Remove all non-digit characters except the leading +
      formatted = formatted.replace(/(?!^\+)\D/g, '');

      console.log(`[AUTH] 📱 Cleaned phone number: ${formatted}`);

      // Use native auth on Capacitor platforms
      if (useNativeAuth) {
        console.log('[AUTH] Using native Firebase Auth (no reCAPTCHA)');
        const otpT0 = performance.now();

        try {
          const result = await sendNativeOtp(formatted);
          console.log(
            `[AUTH] ✅ OTP sent via native SDK (+${Math.round(performance.now() - otpT0)}ms for send, +${Math.round(performance.now() - clickT0)}ms since click)`
          );
          setNativeVerificationId(result.verificationId);
          setStep(6);
          return;
        } catch (nativeError: any) {
          console.warn(
            '[AUTH] ⚠️ Native auth failed, falling back to web reCAPTCHA:',
            nativeError.message
          );
          console.log(
            '[AUTH] 🌐 Attempting web-based phone auth with reCAPTCHA...'
          );
          // Fall through to web flow below
        }
      }

      // Web flow with reCAPTCHA
      console.log('[AUTH] Using web Firebase Auth (with reCAPTCHA)');

      // Create invisible reCAPTCHA verifier only when needed
      if (!verifierRef.current) {
        const t = performance.now();
        verifierRef.current = createInvisibleRecaptcha(
          'recaptcha-container',
          'invisible'
        );
        console.log(
          `[AUTH] reCAPTCHA created lazily (+${Math.round(performance.now() - t)}ms since step)`
        );
      }

      const otpT0 = performance.now();
      let result: ConfirmationResult | null = null;
      let attempt = 0;
      let lastError: any = null;
      while (attempt < 2 && !result) {
        try {
          attempt += 1;
          if (attempt > 1) {
            console.log(
              `[AUTH] Retrying OTP send (attempt ${attempt}) after backoff...`
            );
            await new Promise((r) => setTimeout(r, 250));
            // recreate verifier defensively on retry
            try {
              (verifierRef.current as any)?.clear?.();
            } catch {}
            verifierRef.current = createInvisibleRecaptcha(
              'recaptcha-container',
              'invisible'
            );
          }
          result = await sendOtp(
            formatted,
            verifierRef.current as RecaptchaVerifier
          );
        } catch (err: any) {
          lastError = err;
          // Retry on common transient errors
          if (attempt >= 2) throw err;
        }
      }
      console.log(
        `[AUTH] ✅ OTP sent at ${new Date().toISOString()} (+${Math.round(performance.now() - otpT0)}ms for send, +${Math.round(performance.now() - clickT0)}ms since click)`
      );
      setConfirmation(result);
      // Move to OTP step
      setStep(6);
    } catch (e: any) {
      console.error(e);
      setError(e?.message || 'Failed to send OTP');

      // Clear verifier on error to allow retry (web only)
      if (!useNativeAuth && verifierRef.current) {
        try {
          (verifierRef.current as any).clear();
        } catch (clearError) {
          console.warn('Failed to clear verifier:', clearError);
        }
        verifierRef.current = null;
      }
    } finally {
      setIsLoading(false);
      console.log(
        `[AUTH] ⏱️ Send OTP flow finished at ${new Date().toISOString()}`
      );
    }
  }

  async function verifyOtp() {
    if ((!confirmation && !nativeVerificationId) || !otp) return;
    setError('');
    try {
      setIsLoading(true);
      const verifyT0 = performance.now();
      console.log(`[AUTH] 🔑 Verify clicked at ${new Date().toISOString()}`);

      // Use native auth verification on Capacitor platforms
      if (useNativeAuth && nativeVerificationId) {
        console.log('[AUTH] Using native Firebase Auth verification');
        await verifyNativeOtp(nativeVerificationId, otp);
        console.log(
          `[AUTH] ✅ Native Firebase verify OK (+${Math.round(performance.now() - verifyT0)}ms)`
        );
      } else {
        // Web flow
        console.log('[AUTH] Using web Firebase Auth verification');
        await confirmation!.confirm(otp);
        console.log(
          `[AUTH] ✅ Web Firebase confirm OK (+${Math.round(performance.now() - verifyT0)}ms)`
        );
      }

      // Create NextAuth session via credentials provider
      // Clean phone number to E.164 format (remove spaces, dashes, etc.)
      let formatted = phone.trim().startsWith('+')
        ? phone.trim()
        : `+91${phone.trim()}`;

      // Remove all non-digit characters except the leading +
      formatted = formatted.replace(/(?!^\+)\D/g, '');

      console.log(
        '[AUTH] 📱 Sending to NextAuth - Phone:',
        formatted,
        'Name:',
        name.trim()
      );

      const signInT0 = performance.now();
      const res = await signIn('phone-otp', {
        phone: formatted,
        name: name.trim(),
        redirect: false, // avoid extra round-trip; we will navigate manually
        callbackUrl: '/',
      });
      const elapsed = Math.round(performance.now() - signInT0);
      console.log(
        `[AUTH] 🎫 NextAuth signIn completed (+${elapsed}ms, total +${Math.round(performance.now() - verifyT0)}ms)`,
        res
      );

      // Check if sign-in was successful
      if (res?.error) {
        console.error('[AUTH] ❌ NextAuth signIn error:', res.error);
        setError('Failed to create session. Please try again.');
        return;
      }

      if (!res?.ok) {
        console.error('[AUTH] ❌ NextAuth signIn not OK:', res);
        setError('Failed to sign in. Please try again.');
        return;
      }

      console.log('[AUTH] ✅ NextAuth signIn successful, redirecting...');

      // Extract pathname from URL (router.replace needs relative path, not absolute URL)
      let targetPath = '/';
      if (res?.url) {
        try {
          const url = new URL(res.url);
          targetPath = url.pathname + url.search + url.hash;
          console.log(
            '[AUTH] 📍 Extracted path from URL:',
            res.url,
            '->',
            targetPath
          );
        } catch (e) {
          console.log('[AUTH] ⚠️ URL parse error, using default path:', e);
        }
      }

      console.log('[AUTH] ↪️ Redirecting to:', targetPath);

      // Use window.location.href for a hard redirect (Next.js router sometimes fails after auth)
      // This ensures the session is properly loaded on the new page
      console.log('[AUTH] 🚀 Performing hard redirect...');
      window.location.href = targetPath;

      console.log('[AUTH] 🎉 Redirect initiated successfully');
    } catch (e: any) {
      console.error(e);
      setError('Invalid code, try again');
    } finally {
      setIsLoading(false);
      console.log(
        `[AUTH] ⏱️ Verify flow finished at ${new Date().toISOString()}`
      );
    }
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;

    // Remove the +91 prefix if it exists to get clean digits
    if (value.startsWith('+91 ')) {
      value = value.slice(4);
    }

    // Remove all non-digit characters
    value = value.replace(/\D/g, '');

    // Limit to max 10 digits (for Indian numbers)
    if (value.length > 10) value = value.slice(0, 10);

    // Format with dashes only if there are digits
    let formatted = '';
    if (value.length === 0) {
      formatted = '';
    } else if (value.length <= 3) {
      formatted = `+91 ${value}`;
    } else if (value.length <= 6) {
      formatted = `+91 ${value.slice(0, 3)}-${value.slice(3)}`;
    } else {
      formatted = `+91 ${value.slice(0, 3)}-${value.slice(3, 6)}-${value.slice(6)}`;
    }

    setPhone(formatted);
  };

  // Cleanup function for verifier
  const cleanupVerifier = () => {
    if (verifierRef.current) {
      try {
        (verifierRef.current as any).clear();
      } catch (e) {
        console.warn('Failed to clear verifier:', e);
      }
      verifierRef.current = null;
    }
  };

  return (
    <div className="bg-primary-dark-green h-dvh min-h-dvh w-full overflow-hidden">
      <div className="relative mx-auto flex min-h-dvh w-full flex-col justify-center px-6">
        {/* Skip button positioned at the top */}

        <div className="absolute top-6 right-6 flex min-h-10 w-full justify-end">
          {(step === 2 || step === 3) && (
            <Button
              onClick={() => setStep(4)}
              variant="ghost"
              size="sm"
              className="bg-accent-leaf-green flex h-10 w-18 items-center justify-center rounded-lg border border-black p-0 font-semibold tracking-tight shadow-sm backdrop-blur-sm hover:bg-white"
            >
              Skip
              <ChevronRight className="-ml-1" />
            </Button>
          )}
        </div>
        <div
          key={step}
          className="animate-slide-up h-full transition-all duration-300 ease-out"
        >
          {step === 1 && (
            <SignInStep
              lottieAnimation={step1_new}
              heading="Smarter bites, happier you."
              subHeading="Wholesome meals without hidden costs."
              buttonText="Show me the hack →"
              toNext={() => setStep(2)}
            />
          )}

          {step === 2 && (
            <SignInStep
              lottieAnimation={step2}
              heading="The Unhappening is here."
              subHeading="Transparent deals + eco kitchens."
              buttonText="Unlock my #FoodHack →"
              toNext={() => setStep(3)}
            />
          )}

          {step === 3 && (
            <SignInStep
              lottieAnimation={step3_new}
              heading="Fast. Fair. Planet-friendly."
              subHeading="Watch us reinvent food savings."
              buttonText="Let's get started →"
              toNext={() => setStep(4)}
            />
          )}

          {step === 4 && (
            <Step4 name={name} setName={setName} toNext={() => setStep(5)} />
          )}

          {step === 5 && (
            <Step5
              phone={phone}
              handlePhoneChange={handlePhoneChange}
              isLoading={isLoading}
              startPhoneFlow={startPhoneFlow}
              error={error}
            />
          )}

          {step === 6 && (
            <Step6
              otp={otp}
              setOtp={setOtp}
              error={error}
              isLoading={isLoading}
              verifyOtp={verifyOtp}
            />
          )}
        </div>
      </div>
    </div>
  );
}
