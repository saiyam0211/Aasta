'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

function urlBase64ToUint8Array(base64String: string) {
	const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
	const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
	const rawData = typeof window !== 'undefined' ? window.atob(base64) : Buffer.from(base64, 'base64').toString('binary');
	const outputArray = new Uint8Array(rawData.length);
	for (let i = 0; i < rawData.length; ++i) outputArray[i] = rawData.charCodeAt(i);
	return outputArray;
}

const PENDING_KEY = 'pendingPushSubscription';

export function usePushSubscription() {
	const { data: session } = useSession();
	const [isSubscribed, setIsSubscribed] = useState(false);
	const [isSubscribing, setIsSubscribing] = useState(false);

	useEffect(() => {
		if (
			!('serviceWorker' in navigator) ||
			!('PushManager' in window)
		) {
			return;
		}

		// On load, try flushing any pending subscription saved before login
		if (session?.user?.id) {
			flushPendingSubscription();
		}

		// Check if already subscribed
		checkSubscriptionStatus();

		// Auto-subscribe if in PWA mode and not already subscribed
		autoSubscribe();
	}, [session?.user?.id]);

	const flushPendingSubscription = async () => {
		try {
			const pending = localStorage.getItem(PENDING_KEY);
			if (!pending) return;
			const subscription = JSON.parse(pending);
			const resp = await fetch('/api/push-subscription', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(subscription),
			});
			if (resp.ok) {
				localStorage.removeItem(PENDING_KEY);
				setIsSubscribed(true);
				console.log('✅ Pending push subscription uploaded after login');
			} else {
				console.log('⚠️ Failed to upload pending subscription');
			}
		} catch (err) {
			console.error('Failed flushing pending subscription', err);
		}
	};

	const checkSubscriptionStatus = async () => {
		try {
			const registration = await navigator.serviceWorker.ready;
			const subscription = await registration.pushManager.getSubscription();
			const hasSubscription = !!subscription;
			setIsSubscribed(hasSubscription);
			console.log(
				'📊 Push subscription status:',
				hasSubscription ? 'Active' : 'None'
			);
			return hasSubscription;
		} catch (error) {
			console.error('❌ Error checking subscription status:', error);
			return false;
		}
	};

	const autoSubscribe = async () => {
		try {
			// Only auto-subscribe if app is in standalone mode (PWA)
			const isStandalone = window.matchMedia(
				'(display-mode: standalone)'
			).matches;
			const isIOSStandalone = (window.navigator as any).standalone === true;

			if (!isStandalone && !isIOSStandalone) {
				console.log('🔍 Not in PWA mode, skipping auto-subscription');
				return;
			}

			const alreadySubscribed = await checkSubscriptionStatus();
			if (alreadySubscribed) {
				console.log('✅ Already subscribed to push notifications');
				return;
			}

			// Check notification permission
			if (Notification.permission === 'denied') {
				console.log('❌ Notification permission denied');
				return;
			}

			// Request permission if not granted
			if (Notification.permission !== 'granted') {
				console.log('🔔 Requesting notification permission for PWA user...');
				const permission = await Notification.requestPermission();
				if (permission !== 'granted') {
					console.log('❌ Notification permission not granted');
					return;
				}
			}

			// Subscribe to push notifications
			console.log('🚀 Auto-subscribing to push notifications...');
			await subscribeToPush();
		} catch (error) {
			console.error('❌ Error in auto-subscribe:', error);
		}
	};

	const subscribeToPush = async () => {
		if (isSubscribing) {
			console.log('⏳ Subscription already in progress...');
			return;
		}

		setIsSubscribing(true);

		try {
			const registration = await navigator.serviceWorker.ready;
			const vapidPublicKey =
				process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ||
				'BLrXB9jwTEIXyAEQNlQZqW-9OGDajzUW4m0AwrLI2G89Qe3Xc7dejs9XdXDlhNIG_PJFFE_WjisPKxPNAPqopPo';

			const subscription = await registration.pushManager.subscribe({
				userVisibleOnly: true,
				applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
			});

			console.log('📡 Push subscription created:', {
				endpoint: subscription.endpoint.substring(0, 50) + '...',
				keys: Object.keys(subscription.toJSON().keys || {}),
			});

			const payload = subscription.toJSON();

			// Send subscription to server if logged in; otherwise store locally for later upload
			if (session?.user?.id) {
				const response = await fetch('/api/push-subscription', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify(payload),
				});

				if (response.ok) {
					setIsSubscribed(true);
					console.log('✅ Push notification subscription successful!');
				} else if (response.status === 401) {
					localStorage.setItem(PENDING_KEY, JSON.stringify(payload));
					console.log('🕒 Saved subscription locally; will upload after login');
				} else {
					const error = await response.json().catch(() => ({}));
					console.error('❌ Failed to save push subscription:', error);
					throw new Error(error.error || 'Failed to save subscription');
				}
			} else {
				localStorage.setItem(PENDING_KEY, JSON.stringify(payload));
				console.log('🕒 Saved subscription locally (no session)');
			}

			return subscription;
		} catch (error) {
			console.error('❌ Error subscribing to push notifications:', error);
			setIsSubscribed(false);
			return null;
		} finally {
			setIsSubscribing(false);
		}
	};

	const unsubscribe = async () => {
		try {
			const registration = await navigator.serviceWorker.ready;
			const subscription = await registration.pushManager.getSubscription();

			if (subscription) {
				await subscription.unsubscribe();

				// Remove from server
				await fetch('/api/push-subscription', {
					method: 'DELETE',
				});

				setIsSubscribed(false);
				console.log('✅ Successfully unsubscribed from push notifications');
			}
		} catch (error) {
			console.error('❌ Error unsubscribing:', error);
		}
	};

	return {
		isSubscribed,
		isSubscribing,
		subscribeToPush,
		unsubscribe,
		checkSubscriptionStatus,
	};
}
