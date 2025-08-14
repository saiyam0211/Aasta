"use client";
import { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import { Browser } from '@capacitor/browser';

const APP_HOST = 'aastadelivery.vercel.app';

export default function CapacitorBridge() {
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    const sub = App.addListener('appUrlOpen', async (data) => {
      try { await Browser.close(); } catch {}
      const url = data?.url ?? '';
      try {
        const parsed = new URL(url);
        if (parsed.host === APP_HOST && parsed.pathname.startsWith('/api/auth/callback')) {
          // Load the callback URL inside the WebView so cookies are set here
          window.location.href = url;
        }
      } catch {}
    });

    return () => { sub.then((h) => h.remove()); };
  }, []);

  return null;
} 