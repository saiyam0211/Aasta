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
        // Let pages handle safe-area padding themselves; avoid global top padding

        // Use core proxy to avoid bundling native-only modules on web
        const StatusBar: any = registerPlugin('StatusBar');
        // Overlay webview so we don't get a solid native bar; use light icons over dark UI
        await StatusBar.setOverlaysWebView({ overlay: true });
        await StatusBar.setStyle({ style: 2 }); // 2 = Light (light icons for dark backgrounds)
        // No background color when overlaying; content background will be visible
      } catch (e) {
        console.warn('Native bridge setup skipped', e);
      }
    })();
  }, []);
  return null;
}
