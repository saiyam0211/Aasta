"use client";
import { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import { Browser } from '@capacitor/browser';

const APP_ORIGIN = 'https://aastadelivery.vercel.app';
const APP_HOST = 'aastadelivery.vercel.app';

export default function CapacitorBridge() {
	useEffect(() => {
		if (!Capacitor.isNativePlatform()) return;

		const listenerHandles: Array<Promise<{ remove: () => void }>> = [];

		// Fallback: When Android App Links open the app directly
		const appUrlOpenSub = App.addListener('appUrlOpen', async (data) => {
			try { await Browser.close(); } catch {}
			const url = data?.url ?? '';
			try {
				const parsed = new URL(url);
				if (parsed.host === APP_HOST) {
					window.location.href = url;
				}
			} catch {}
		});
		listenerHandles.push(appUrlOpenSub);

		// Detect OAuth completion inside Custom Tab and take over in WebView
		// @ts-ignore - event carries { url: string } at runtime
		const pageLoadedSub = Browser.addListener('browserPageLoaded', async (event: any) => {
			const url: string | undefined = event?.url;
			if (!url) return;
			try {
				const parsed = new URL(url);
				if (parsed.host !== APP_HOST) return;
				const hasCode = parsed.searchParams.has('code');
				const hasError = parsed.searchParams.has('error');
				const isCallback = parsed.pathname.startsWith('/api/auth/callback');
				// Only intercept when coming back from Google (code or error or explicit callback)
				if (isCallback || hasCode || hasError) {
					try { await Browser.close(); } catch {}
					// Load the exact URL in WebView so NextAuth can process cookies/session here
					window.location.href = url;
				}
			} catch {}
		});
		listenerHandles.push(pageLoadedSub);

		// When the browser is closed manually, try to land the user in-app
		const finishedSub = Browser.addListener('browserFinished', () => {
			// Navigate to customer; if session is set, it will show, else no harm
			window.location.href = `${APP_ORIGIN}/customer`;
		});
		listenerHandles.push(finishedSub);

		return () => {
			listenerHandles.forEach(async (p) => {
				try { (await p).remove(); } catch {}
			});
		};
	}, []);

	return null;
} 