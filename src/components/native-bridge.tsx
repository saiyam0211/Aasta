'use client';

import { useEffect } from 'react';

export default function NativeBridge() {
	useEffect(() => {
		(async () => {
			try {
				const cap = (window as any).Capacitor;
				if (!cap?.isNativePlatform?.()) return;

				// Mark html for native-specific CSS overrides
				document.documentElement.classList.add('native-webview');

				// Configure status bar to not overlay content
				const { StatusBar, Style } = await import('@capacitor/status-bar');
				await StatusBar.setOverlaysWebView({ overlay: false });
				await StatusBar.setStyle({ style: Style.Dark });
				await StatusBar.setBackgroundColor({ color: '#002a01' });
			} catch (e) {
				console.warn('Native bridge setup skipped', e);
			}
		})();
	}, []);
	return null;
} 