'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Lottie from 'lottie-react';
import step1 from '../../../../public/lotties/step1.json';
import step2 from '../../../../public/lotties/step2.json';
import step3 from '../../../../public/lotties/step3.json';
import { createInvisibleRecaptcha, sendOtp } from '@/lib/firebase-client';
import { 
  isNativePlatform, 
  sendNativeOtp, 
  verifyNativeOtp 
} from '@/lib/firebase-native-auth';
import type { RecaptchaVerifier, ConfirmationResult } from 'firebase/auth';
import { signIn } from 'next-auth/react';
import { setBackOverride } from '@/lib/back-channel';

export default function SignInPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<number>(1);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [confirmation, setConfirmation] = useState<ConfirmationResult | null>(
    null
  );
  const [nativeVerificationId, setNativeVerificationId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const verifierRef = useRef<RecaptchaVerifier | null>(null);
  const lastPushedStepRef = useRef<number>(1);
  const [useNativeAuth, setUseNativeAuth] = useState(false);

  // Detect platform on mount
  useEffect(() => {
    // Only use native auth on iOS (APNs works great)
    // Use web auth on Android (more reliable than SafetyNet)
    const platform = isNativePlatform();
    const isIOS = platform && typeof navigator !== 'undefined' && /iPhone|iPad|iPod/.test(navigator.userAgent);
    
    setUseNativeAuth(isIOS);
    
    if (isIOS) {
      console.log('[AUTH] 🍎 iOS detected, using native Firebase Auth (APNs)');
    } else if (platform) {
      console.log('[AUTH] 🤖 Android detected, using web Firebase Auth (reCAPTCHA)');
    } else {
      console.log('[AUTH] 🌐 Web platform detected, using web Firebase Auth with reCAPTCHA');
    }
  }, []);

  // Pre-initialize invisible reCAPTCHA when entering step 5 to hide setup cost
  // Skip on native platforms since we use native Firebase Auth
  useEffect(() => {
    if (useNativeAuth) return; // Skip reCAPTCHA on native platforms
    
    if (step === 5 && !verifierRef.current) {
      try {
        const t = performance.now();
        verifierRef.current = createInvisibleRecaptcha('recaptcha-container', 'invisible');
        console.log(`[AUTH] reCAPTCHA initialized at ${new Date().toISOString()} (+${Math.round(performance.now() - t)}ms)`);
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
      console.log(`[AUTH] Prefetched NextAuth endpoints (+${Math.round(performance.now() - t0)}ms)`);
    }
  }, [step]);

  // Pre-init earlier on step 4 as well and warm Firebase pathing
  // Skip on native platforms since we use native Firebase Auth
  useEffect(() => {
    if (useNativeAuth) return; // Skip reCAPTCHA on native platforms
    
    if (step === 4 && !verifierRef.current) {
      try {
        const t = performance.now();
        verifierRef.current = createInvisibleRecaptcha('recaptcha-container', 'invisible');
        console.log(`[AUTH] reCAPTCHA pre-initialized at step 4 (+${Math.round(performance.now() - t)}ms)`);
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
          console.log(`[AUTH] ✅ OTP sent via native SDK (+${Math.round(performance.now() - otpT0)}ms for send, +${Math.round(performance.now() - clickT0)}ms since click)`);
          setNativeVerificationId(result.verificationId);
          setStep(6);
          return;
        } catch (nativeError: any) {
          console.warn('[AUTH] ⚠️ Native auth failed, falling back to web reCAPTCHA:', nativeError.message);
          console.log('[AUTH] 🌐 Attempting web-based phone auth with reCAPTCHA...');
          // Fall through to web flow below
        }
      }

      // Web flow with reCAPTCHA
      console.log('[AUTH] Using web Firebase Auth (with reCAPTCHA)');
      
      // Create invisible reCAPTCHA verifier only when needed
      if (!verifierRef.current) {
        const t = performance.now();
        verifierRef.current = createInvisibleRecaptcha('recaptcha-container', 'invisible');
        console.log(`[AUTH] reCAPTCHA created lazily (+${Math.round(performance.now() - t)}ms since step)`);
      }

      const otpT0 = performance.now();
      let result: ConfirmationResult | null = null;
      let attempt = 0;
      let lastError: any = null;
      while (attempt < 2 && !result) {
        try {
          attempt += 1;
          if (attempt > 1) {
            console.log(`[AUTH] Retrying OTP send (attempt ${attempt}) after backoff...`);
            await new Promise((r) => setTimeout(r, 250));
            // recreate verifier defensively on retry
            try {
              (verifierRef.current as any)?.clear?.();
            } catch {}
            verifierRef.current = createInvisibleRecaptcha('recaptcha-container', 'invisible');
          }
          result = await sendOtp(formatted, verifierRef.current as RecaptchaVerifier);
        } catch (err: any) {
          lastError = err;
          // Retry on common transient errors
          if (attempt >= 2) throw err;
        }
      }
      console.log(`[AUTH] ✅ OTP sent at ${new Date().toISOString()} (+${Math.round(performance.now() - otpT0)}ms for send, +${Math.round(performance.now() - clickT0)}ms since click)`);
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
      console.log(`[AUTH] ⏱️ Send OTP flow finished at ${new Date().toISOString()}`);
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
        console.log(`[AUTH] ✅ Native Firebase verify OK (+${Math.round(performance.now() - verifyT0)}ms)`);
      } else {
        // Web flow
        console.log('[AUTH] Using web Firebase Auth verification');
        await confirmation!.confirm(otp);
        console.log(`[AUTH] ✅ Web Firebase confirm OK (+${Math.round(performance.now() - verifyT0)}ms)`);
      }
      
      // Create NextAuth session via credentials provider
      const formatted = phone.trim().startsWith('+')
        ? phone.trim()
        : `+91${phone.trim()}`;
      const signInT0 = performance.now();
      const res = await signIn('phone-otp', {
        phone: formatted,
        name: name.trim(),
        redirect: false, // avoid extra round-trip; we will navigate manually
        callbackUrl: '/',
      });
      const elapsed = Math.round(performance.now() - signInT0);
      console.log(`[AUTH] 🎫 NextAuth signIn completed (+${elapsed}ms, total +${Math.round(performance.now() - verifyT0)}ms)`);
      // Fast manual redirect if URL provided
      if (res && typeof res === 'object' && 'url' in res && (res as any).url) {
        const navT0 = performance.now();
        window.location.assign((res as any).url as string);
        console.log(`[AUTH] ↪️ Navigating to ${(res as any).url} (+${Math.round(performance.now() - navT0)}ms)`);
        return;
      }
      // Fallback
      window.location.assign('/');
    } catch (e: any) {
      console.error(e);
      setError('Invalid code, try again');
    } finally {
      setIsLoading(false);
      console.log(`[AUTH] ⏱️ Verify flow finished at ${new Date().toISOString()}`);
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
    <div className="min-h-dvh h-dvh w-full bg-white overflow-hidden">
      <div className="mx-auto flex min-h-dvh max-w-md flex-col px-5 pt-[45%] pb-8">
        <div
          key={step}
          className="animate-slide-up transition-all duration-300 ease-out"
        >
          {step === 1 && (
            <div className="flex h-full flex-col items-center text-center">
              <div className="mb-6 w-full">
                <Lottie
                  animationData={step1 as any}
                  loop
                  autoplay
                  style={{ width: '100%', height: 280 }}
                />
              </div>
              <h2 className="mb-3 text-2xl font-extrabold text-[#0f172a]">
                Smarter bites, happier you.
              </h2>
              <p className="mx-auto max-w-sm text-base text-[#475569]">
                Wholesome meals without hidden costs.
              </p>
              <div className="mt-6 w-full">
                <button
                  onClick={() => setStep(2)}
                  className="mx-auto flex w-full items-center justify-center rounded-3xl bg-black px-5 py-7 text-xl text-white"
                >
                  Show me the hack →
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="flex h-full flex-col items-center text-center">
              {/* Skip button positioned at the top */}
              <div className="-mt-40 mb-4 flex w-full justify-end">
                <Button
                  onClick={() => setStep(4)}
                  variant="ghost"
                  size="sm"
                  className="h-10 w-20 rounded-full border border-white/20 bg-white/10 p-0 shadow-sm backdrop-blur-sm hover:bg-white"
                >
                  Skip
                </Button>
              </div>

              <div className="mt-28 mb-6 w-full">
                <Lottie
                  animationData={step2 as any}
                  loop
                  autoplay
                  style={{ width: '100%', height: 280 }}
                />
              </div>
              <h2 className="mb-3 text-2xl font-extrabold text-[#0f172a]">
                The Unhappening is here.
              </h2>
              <p className="mx-auto max-w-sm text-base text-[#475569]">
                Transparent deals + eco kitchens.
              </p>
              <div className="mt-6 w-full">
                <button
                  onClick={() => setStep(3)}
                  className="mx-auto flex w-full items-center justify-center rounded-3xl bg-black px-5 py-7 text-xl text-white"
                >
                  Unlock my #FoodHack →
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="flex h-full flex-col items-center text-center">
              {/* Skip button positioned at the top */}
              <div className="-mt-40 mb-4 flex w-full justify-end">
                <Button
                  onClick={() => setStep(4)}
                  variant="ghost"
                  size="sm"
                  className="h-10 w-20 rounded-full border border-white/20 bg-white/10 p-0 shadow-sm backdrop-blur-sm hover:bg-white"
                >
                  Skip
                </Button>
              </div>
              <div className="mt-28 mb-6 w-full">
                <Lottie
                  animationData={step3 as any}
                  loop
                  autoplay
                  style={{ width: '100%', height: 280 }}
                />
              </div>
              <h2 className="mb-3 text-2xl font-extrabold text-[#0f172a]">
                Fast. Fair. Planet-friendly.
              </h2>
              <p className="mx-auto max-w-sm text-base text-[#475569]">
                Watch us reinvent food savings.
              </p>
              <div className="mt-6 w-full">
                <button
                  onClick={() => setStep(4)}
                  className="mx-auto flex w-full items-center justify-center rounded-3xl bg-black px-5 py-7 text-xl text-white"
                >
                  Let's get started →
                </button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="flex h-full flex-col items-center justify-center px-6 text-center">
              {/* Title */}
              <h2 className="mb-2 text-4xl font-bold tracking-tight text-slate-900">
                Claim your foodie identity.
              </h2>

              {/* Subtitle */}
              <p className="mb-6 max-w-xs text-base text-slate-600">
                Tell us who you are, and we'll unlock your personalized Food
                Hack.
              </p>

              {/* Input + Button */}
              <div className="w-full space-y-5">
                {/* Material 3 styled input */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder=" "
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="peer w-full rounded-2xl border border-slate-300 bg-white px-4 pt-5 pb-2 text-lg text-slate-900 shadow-sm focus:border-[#002a01] focus:ring-2 focus:ring-[#002a01] focus:outline-none"
                  />
                  <label className="absolute top-2 left-4 text-sm text-slate-500 transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-base peer-placeholder-shown:text-slate-400 peer-focus:top-2 peer-focus:text-sm peer-focus:text-slate-300">
                    Your name
                  </label>
                </div>

                {/* Material 3 expressive button */}
                <button
                  onClick={() => setStep(5)}
                  disabled={!name.trim()}
                  className="w-full rounded-3xl bg-black px-6 py-7 text-2xl font-medium text-white shadow-md transition-all duration-200 enabled:hover:bg-[#002a01] enabled:active:scale-[0.97] disabled:bg-slate-300 disabled:text-slate-500"
                >
                  Next →
                </button>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="flex h-full flex-col items-center justify-center px-6 text-center">
              {/* Title */}
              <h2 className="mb-2 text-4xl font-bold tracking-tight text-slate-900">
                Keep your #FoodHacks safe.
              </h2>

              {/* Subtitle */}
              <p className="mb-6 max-w-xs text-base text-slate-600">
                Enter your number and we'll send a one-time code to sign in
                securely.
              </p>

              {/* Input + Button */}
              <div className="w-full space-y-5">
                {/* Material 3 styled input */}
                <div className="relative">
                  <input
                    type="tel"
                    placeholder=" "
                    value={phone}
                    onChange={handlePhoneChange}
                    className="peer w-full rounded-2xl border border-slate-300 bg-white px-4 pt-5 pb-2 text-lg text-slate-900 shadow-sm focus:border-[#002a01] focus:ring-2 focus:ring-[#002a01] focus:outline-none"
                  />
                  <label className="absolute top-2 left-4 text-sm text-slate-500 transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-base peer-placeholder-shown:text-slate-400 peer-focus:top-2 peer-focus:text-sm peer-focus:text-slate-300">
                    Phone number
                  </label>
                </div>

                {/* Hidden reCAPTCHA container - will be invisible */}
                <div id="recaptcha-container" className="hidden" />

                {/* Material 3 expressive button */}
                <button
                  disabled={isLoading || phone.length < 8}
                  onClick={startPhoneFlow}
                  className="w-full rounded-3xl bg-black px-6 py-7 text-2xl font-medium text-white shadow-md transition-all duration-200 enabled:hover:bg-[#003d01] enabled:active:scale-[0.97] disabled:bg-slate-300 disabled:text-slate-500"
                >
                  {isLoading ? 'Sending…' : 'Send OTP'}
                </button>

                {/* Error message */}
                {error && (
                  <p className="pt-2 text-sm font-medium text-red-600">
                    {error}
                  </p>
                )}
              </div>
            </div>
          )}

          {step === 6 && (
            <div className="flex h-full flex-col items-center justify-center px-6 text-center">
              {/* Title */}
              <h2 className="mb-2 text-4xl font-bold tracking-tight text-slate-900">
                Almost there!
              </h2>

              {/* Subtitle */}
              <p className="mb-6 max-w-xs text-base text-slate-600">
                We sent your secret code to{' '}
                {/* <span className="font-medium text-slate-800">
                {phone.trim().startsWith('+') ? phone : `+91${phone}`}
              </span> */}
                — enter it to unlock your #FoodHacks.
              </p>

              {/* 6-digit OTP input */}
              <div className="mb-5 flex justify-center space-x-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <input
                    key={i}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={otp[i] || ''}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/, '');
                      if (!val) return;
                      const newOtp = otp.split('');
                      newOtp[i] = val;
                      setOtp(newOtp.join(''));
                      // move focus to next box
                      if (i < 5) {
                        const next = document.getElementById(`otp-${i + 1}`);
                        next?.focus();
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Backspace') {
                        const newOtp = otp.split('');
                        newOtp[i] = '';
                        setOtp(newOtp.join(''));
                        if (i > 0 && !otp[i]) {
                          const prev = document.getElementById(`otp-${i - 1}`);
                          prev?.focus();
                        }
                      }
                    }}
                    id={`otp-${i}`}
                    className="h-14 w-12 rounded-lg border border-slate-300 text-center text-xl font-medium text-slate-900 shadow-sm transition focus:border-[#002a01] focus:ring-2 focus:ring-[#002a01] focus:outline-none"
                  />
                ))}
              </div>

              {/* Verify button */}
              <button
                disabled={isLoading || otp.length < 6}
                onClick={verifyOtp}
                className="w-full rounded-3xl bg-black px-6 py-7 text-2xl font-medium text-white shadow-md transition-all duration-200 enabled:hover:bg-[#003d01] enabled:active:scale-[0.97] disabled:bg-slate-300 disabled:text-slate-500"
              >
                {isLoading ? 'Verifying…' : 'Verify & Continue'}
              </button>

              {/* Error message */}
              {error && (
                <p className="pt-2 text-sm font-medium text-red-600">{error}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
