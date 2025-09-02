'use client';

import { useState, useRef } from 'react';
import Lottie from 'lottie-react';
import step1 from '../../../../public/lotties/step1.json';
import step2 from '../../../../public/lotties/step2.json';
import step3 from '../../../../public/lotties/step3.json';
import { createInvisibleRecaptcha, sendOtp } from '@/lib/firebase-client';
import type { RecaptchaVerifier, ConfirmationResult } from 'firebase/auth';
import { signIn } from 'next-auth/react';

export default function SignInPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<number>(1);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [confirmation, setConfirmation] = useState<ConfirmationResult | null>(
    null
  );
  const [error, setError] = useState('');
  const verifierRef = useRef<RecaptchaVerifier | null>(null);

  async function startPhoneFlow() {
    setError('');
    try {
      setIsLoading(true);
      const formatted = phone.trim().startsWith('+')
        ? phone.trim()
        : `+91${phone.trim()}`;

      // Create invisible reCAPTCHA verifier only when needed
      if (!verifierRef.current) {
        verifierRef.current = createInvisibleRecaptcha(
          'recaptcha-container',
          'invisible'
        );
      }

      const result = await sendOtp(formatted, verifierRef.current);
      setConfirmation(result);
      // Move to OTP step
      setStep(6);
    } catch (e: any) {
      console.error(e);
      setError(e?.message || 'Failed to send OTP');

      // Clear verifier on error to allow retry
      if (verifierRef.current) {
        try {
          (verifierRef.current as any).clear();
        } catch (clearError) {
          console.warn('Failed to clear verifier:', clearError);
        }
        verifierRef.current = null;
      }
    } finally {
      setIsLoading(false);
    }
  }

  async function verifyOtp() {
    if (!confirmation || !otp) return;
    setError('');
    try {
      setIsLoading(true);
      // Confirm with Firebase
      await confirmation.confirm(otp);
      // Create NextAuth session via credentials provider
      const formatted = phone.trim().startsWith('+')
        ? phone.trim()
        : `+91${phone.trim()}`;
      await signIn('phone-otp', {
        phone: formatted,
        name: name.trim(),
        redirect: true,
        callbackUrl: '/',
      });
    } catch (e: any) {
      console.error(e);
      setError('Invalid code, try again');
    } finally {
      setIsLoading(false);
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
    <div className="min-h-screen w-full bg-white">
      <div className="mx-auto flex min-h-screen max-w-md flex-col px-5 pt-[45%] pb-8">
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
              <div className="mb-6 w-full">
                <Lottie
                  animationData={step2 as any}
                  loop
                  autoplay
                  style={{ width: '100%', height: 280 }}
                />
              </div>
              <h2 className="mb-3 text-2xl font-extrabold text-[#0f172a]">
                Save big. Waste less.
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
              <div className="mb-6 w-full">
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
                Quick delivery, fair prices, lighter impact.
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
                Tell us who you are, and we'll unlock your personalized
                #FoodHacks.
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
                  <label className="absolute top-2 left-4 text-sm text-slate-500 transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-base peer-placeholder-shown:text-slate-400 peer-focus:top-2 peer-focus:text-sm peer-focus:text-[#002a01]">
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
                  <label className="absolute top-2 left-4 text-sm text-slate-500 transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-base peer-placeholder-shown:text-slate-400 peer-focus:top-2 peer-focus:text-sm peer-focus:text-[#002a01]">
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
                Almost there, foodie hacker!
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
