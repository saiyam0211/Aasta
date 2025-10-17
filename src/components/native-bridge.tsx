'use client';

import { useEffect } from 'react';
import { Capacitor, registerPlugin } from '@capacitor/core';

export default function NativeBridge() {
  useEffect(() => {
    (async () => {
      try {
        if (!Capacitor.isNativePlatform()) return;

        // Mark html for native-specific CSS overrides
        document.documentElement.classList.add('native-webview');

        // Use core proxy to avoid bundling native-only modules on web
        const StatusBar: any = registerPlugin('StatusBar');
        await StatusBar.setOverlaysWebView({ overlay: false });
        await StatusBar.setStyle({ style: 1 }); // 1 = Dark
        await StatusBar.setBackgroundColor({ color: '#002a01' });

        // Ensure iOS safe-area is respected by forcing viewport-fit cover and using env insets
        try {
          const meta = document.querySelector('meta[name="viewport"]');
          const content = meta?.getAttribute('content') || '';
          if (!/viewport-fit=cover/.test(content)) {
            meta?.setAttribute('content', `${content}, viewport-fit=cover`);
          }
        } catch {}
      } catch (e) {
        console.warn('Native bridge setup skipped', e);
      }
    })();
  }, []);
  return null;
}
