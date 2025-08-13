'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface PWAClientRegistrationProps {
  pageIdentifier: string;
}

export default function PWAClientRegistration({
  pageIdentifier,
}: PWAClientRegistrationProps) {
  const { data: session } = useSession();

  useEffect(() => {
    if (!session?.user?.id) return;

    const registerPWAClient = async () => {
      try {
        // Generate session ID
        const sessionId = `${pageIdentifier}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        // PWA Detection
        const isStandalone = window.matchMedia(
          '(display-mode: standalone)'
        ).matches;
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        const isiOSStandalone =
          isIOS && (window.navigator as any).standalone === true;
        const isAndroidWebView = /wv/.test(navigator.userAgent);
        const hasManifest =
          document.querySelector('link[rel="manifest"]') !== null;

        const isPWAMode =
          isStandalone || isiOSStandalone || (isAndroidWebView && hasManifest);

        const pwaDetails = {
          isStandalone,
          isiOSStandalone,
          isAndroidWebView,
          hasManifest,
          displayMode: window.matchMedia('(display-mode: standalone)').matches
            ? 'standalone'
            : 'browser',
          userAgent: navigator.userAgent,
          pageIdentifier,
        };

        console.log(`📱 ${pageIdentifier} PWA Registration:`, {
          sessionId,
          isPWAMode,
          pwaDetails,
        });

        const response = await fetch('/api/client-register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sessionId,
            isPWA: isPWAMode,
            userAgent: navigator.userAgent,
            pwaDetails,
          }),
        });

        if (response.ok) {
          const result = await response.json();
          console.log(`✅ ${pageIdentifier} PWA Client registered:`, result);
        } else {
          const errorText = await response.text();
          console.error(
            `❌ ${pageIdentifier} PWA Client registration failed:`,
            {
              status: response.status,
              statusText: response.statusText,
              error: errorText,
            }
          );
        }
      } catch (error) {
        console.error(
          `❌ ${pageIdentifier} PWA Client registration error:`,
          error
        );
      }
    };

    // Register with a small delay to ensure DOM is ready
    const timeoutId = setTimeout(registerPWAClient, 1000);

    return () => clearTimeout(timeoutId);
  }, [session?.user?.id, pageIdentifier]);

  return null; // This component doesn't render anything
}
