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
      } catch (e) {
        console.warn('Native bridge setup skipped', e);
      }
    })();
  }, []);
  return null;
}
