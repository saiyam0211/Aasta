'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Capacitor, registerPlugin } from '@capacitor/core';

function pickColorFromPath(pathname: string): { color: string; lightText: boolean } {
  // Defaults
  let color = '#ffffff';
  // Route-based mapping
  if (pathname === '/' || pathname.startsWith('/home')) color = '#d3fb6b';
  else if (pathname.startsWith('/profile')) color = '#ffffff';
  else if (pathname.startsWith('/restaurants')) color = '#002a01';
  else if (pathname.startsWith('/cart')) color = '#f3f3f3';
  else if (pathname.startsWith('/orders/') && pathname.split('/').length > 2) color = '#ffffff'; // order details

  // Decide text color for native status bar
  const lightText = isDarkColor(color);
  return { color, lightText };
}

function isDarkColor(hex: string): boolean {
  const c = hex.replace('#', '');
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  // Perceived brightness (ITU-R BT.601)
  const brightness = (299 * r + 587 * g + 114 * b) / 1000;
  return brightness < 128; // dark background => use light text
}

export default function StatusBarOverlay() {
  const pathname = usePathname() || '/';

  useEffect(() => {
    const { color, lightText } = pickColorFromPath(pathname);
    // CSS var for web overlay
    try {
      document.documentElement.style.setProperty('--statusbar-color', color);
    } catch {}

    // Native status bar
    if (Capacitor.isNativePlatform()) {
      try {
        const StatusBar: any = registerPlugin('StatusBar');
        // Ensure content does not draw under the status bar; do once but safe to repeat
        StatusBar.setOverlaysWebView({ overlay: false });
        // 0 = Light text, 1 = Dark text (Capacitor)
        StatusBar.setStyle({ style: lightText ? 0 : 1 });
        StatusBar.setBackgroundColor({ color });
      } catch {}
    }
  }, [pathname]);

  // Sticky overlay sized to the device safe-area
  return <div className="statusbar-overlay" />;
}


