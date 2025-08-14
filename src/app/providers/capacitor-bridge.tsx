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

		// Primary: Detect OAuth completion inside Custom Tab and take over in WebView
		// @ts-ignore - event carries { url: string } in runtime; types may lag
		const pageLoadedSub = Browser.addListener('browserPageLoaded', async (event: any) => {
			const url: string | undefined = event?.url;
			if (!url) return;
			try {
				const parsed = new URL(url);
				if (parsed.host !== APP_HOST) return;
				if (parsed.pathname.startsWith('/api/auth/callback') || parsed.pathname === '/' ) {
					try { await Browser.close(); } catch {}
					// If it's callback, load it to set cookies; else go to app home to pick up session
					if (parsed.pathname.startsWith('/api/auth/callback')) {
						window.location.href = url;
					} else {
						window.location.href = `${APP_ORIGIN}/customer`;
					}
				}
			} catch {}
		});
		listenerHandles.push(pageLoadedSub);

		// Also, when user closes the browser manually after login, refresh to pick up session
		const finishedSub = Browser.addListener('browserFinished', () => {
			// Best-effort: navigate to customer home, session may already be set
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