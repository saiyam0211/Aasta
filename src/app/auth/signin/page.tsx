'use client';

import { useState, useRef, useEffect } from 'react';
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
	const [confirmation, setConfirmation] = useState<ConfirmationResult | null>(null);
	const [error, setError] = useState('');
	const verifierRef = useRef<RecaptchaVerifier | null>(null);

	useEffect(() => {
		// When entering the phone step, reset and create a fresh verifier
		if (step === 5) {
			try {
				// Clear any stale verifier first
				if (verifierRef.current && typeof (verifierRef.current as any).clear === 'function') {
					(verifierRef.current as any).clear();
				}
				verifierRef.current = null;
				const size = process.env.NEXT_PUBLIC_RECAPTCHA_SIZE === 'normal' ? 'normal' : 'invisible';
				verifierRef.current = createInvisibleRecaptcha('recaptcha-container', size);
			} catch (e) {
				console.error('Failed to (re)create reCAPTCHA verifier', e);
			}
		}
	}, [step]);

	async function startPhoneFlow() {
		setError('');
		try {
			setIsLoading(true);
			const formatted = phone.trim().startsWith('+') ? phone.trim() : `+91${phone.trim()}`;
			// Ensure verifier is present
			if (!verifierRef.current) {
				const size = process.env.NEXT_PUBLIC_RECAPTCHA_SIZE === 'normal' ? 'normal' : 'invisible';
				verifierRef.current = createInvisibleRecaptcha('recaptcha-container', size);
			}
			const result = await sendOtp(formatted, verifierRef.current);
			setConfirmation(result);
		} catch (e: any) {
			console.error(e);
			setError(e?.message || 'Failed to send OTP');
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
			const formatted = phone.trim().startsWith('+') ? phone.trim() : `+91${phone.trim()}`;
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

	return (
		<div className="min-h-screen w-full bg-white">
			<div className="mx-auto flex min-h-screen max-w-md flex-col px-5 pb-8 pt-[50%]">
				<div key={step} className="animate-slide-up transition-all duration-300 ease-out">
					{step === 1 && (
						<div className="flex h-full flex-col items-center text-center">
							<div className="mb-6 w-full">
								<Lottie animationData={step1 as any} loop autoplay style={{ width: '100%', height: 280 }} />
							</div>
							<h2 className="mb-3 text-2xl font-extrabold text-[#0f172a]">Tired of endless scrolling?</h2>
							<p className="mx-auto max-w-sm text-base text-[#475569]">
								Too many apps, too many fake deals. Finding food shouldn’t feel like a chore.
							</p>
							<div className="mt-6 w-full">
								<button onClick={() => setStep(2)} className="mx-auto flex w-full items-center justify-center rounded-full bg-black px-5 py-3 text-white">
									Skip the scroll →
								</button>
							</div>
						</div>
					)}

					{step === 2 && (
						<div className="flex h-full flex-col items-center text-center">
							<div className="mb-6 w-full">
								<Lottie animationData={step2 as any} loop autoplay style={{ width: '100%', height: 280 }} />
							</div>
							<h2 className="mb-3 text-2xl font-extrabold text-[#0f172a]">We’ve already made the smart choice.</h2>
							<p className="mx-auto max-w-sm text-base text-[#475569]">
								Aasta handpicks real, transparent deals and eco-friendly partner kitchens — so you save time, money, and the planet..
							</p>
							<div className="mt-6 w-full">
								<button onClick={() => setStep(3)} className="mx-auto flex w-full items-center justify-center rounded-full bg-black px-5 py-3 text-white">
									Show me the #FoodHack →
								</button>
							</div>
						</div>
					)}

					{step === 3 && (
						<div className="flex h-full flex-col items-center text-center">
							<div className="mb-6 w-full">
								<Lottie animationData={step3 as any} loop autoplay style={{ width: '100%', height: 280 }} />
							</div>
							<h2 className="mb-3 text-2xl font-extrabold text-[#0f172a]">Eat smarter. Feel lighter.</h2>
							<p className="mx-auto max-w-sm text-base text-[#475569]">
								Fast delivery, fair prices, and food that doesn’t cost the Earth. Because every order is a #FoodHack for you — and for the planet.
							</p>
							<div className="mt-6 w-full">
								<button onClick={() => setStep(4)} className="mx-auto flex w-full items-center justify-center rounded-full bg-black px-5 py-3 text-white">
									Let’s Get Started →
								</button>
							</div>
						</div>
					)}

					{step === 4 && (
						<div className="flex h-full flex-col items-center text-center">
							<h2 className="mb-3 text-2xl font-extrabold text-[#0f172a]">What's your name?</h2>
							<p className="mx-auto max-w-sm text-base text-[#475569]">We’ll personalize your experience.</p>
							<div className="mt-4 w-full space-y-3">
								<input
									type="text"
									placeholder="Your name"
									className="w-full rounded-xl border border-gray-300 px-4 py-3 text-center text-lg"
									value={name}
									onChange={(e) => setName(e.target.value)}
								/>
								<button onClick={() => setStep(5)} disabled={!name.trim()} className="mx-auto flex w-full items-center justify-center rounded-full bg-black px-5 py-3 text-white">
									Next →
								</button>
							</div>
						</div>
					)}

					{step === 5 && (
						<div className="flex h-full flex-col items-center text-center">
							<h2 className="mb-3 text-2xl font-extrabold text-[#0f172a]">Enter your phone number</h2>
							<p className="mx-auto max-w-sm text-base text-[#475569]">We’ll send you a one-time code to sign in securely.</p>
							<div className="mt-4 w-full space-y-3">
								<input
									type="tel"
									placeholder="e.g., 9876543210"
									className="w-full rounded-xl border border-gray-300 px-4 py-3 text-center text-lg"
									value={phone}
									onChange={(e) => setPhone(e.target.value)}
								/>
								<div id="recaptcha-container" />
								<button disabled={isLoading || phone.length < 8} onClick={startPhoneFlow} className="mx-auto flex w-full items-center justify-center rounded-full bg-black px-5 py-3 text-white">
									{isLoading ? 'Sending…' : 'Send OTP'}
								</button>
								{confirmation && (
									<div className="space-y-3 pt-4">
										<input
											type="text"
											placeholder="6-digit code"
											className="w-full rounded-xl border border-gray-300 px-4 py-3 text-center text-lg tracking-widest"
											maxLength={6}
											value={otp}
											onChange={(e) => setOtp(e.target.value)}
										/>
										<button disabled={isLoading || otp.length < 6} onClick={verifyOtp} className="mx-auto flex w-full items-center justify-center rounded-full bg-black px-5 py-3 text-white">
											{isLoading ? 'Verifying…' : 'Verify & Continue'}
										</button>
										{error && <p className="pt-2 text-sm text-red-600">{error}</p>}
									</div>
								)}
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
