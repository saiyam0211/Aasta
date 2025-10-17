'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Capacitor, registerPlugin } from '@capacitor/core';

function isDarkColor(hex: string): boolean {
  const c = hex.replace('#', '');
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  const brightness = (299 * r + 587 * g + 114 * b) / 1000;
  return brightness < 128;
}

function pickColorFromPath(pathname: string): { color: string; lightText: boolean } {
  let color = '#ffffff';
  if (pathname === '/' || pathname.startsWith('/home')) color = '#d3fb6b';
  else if (pathname.startsWith('/profile')) color = '#ffffff';
  else if (pathname.startsWith('/restaurants')) color = '#002a01';
  else if (pathname.startsWith('/cart')) color = '#f3f3f3';
  else if (pathname.startsWith('/orders/') && pathname.split('/').length > 2) color = '#ffffff';
  const lightText = isDarkColor(color);
  return { color, lightText };
}

export default function StatusBarOverlay() {
  const pathname = usePathname() || '/';

  useEffect(() => {
    const { color, lightText } = pickColorFromPath(pathname);
    try {
      document.documentElement.style.setProperty('--statusbar-color', color);
    } catch {}
    if (Capacitor.isNativePlatform()) {
      try {
        const StatusBar: any = registerPlugin('StatusBar');
        StatusBar.setOverlaysWebView({ overlay: false });
        // Capacitor: 1 = Dark, 2 = Light (as per core plugin). Use lightText to choose.
        StatusBar.setStyle({ style: lightText ? 2 : 1 });
        StatusBar.setBackgroundColor({ color });
      } catch {}
    }
  }, [pathname]);

  return <div className="statusbar-overlay" />;
}


