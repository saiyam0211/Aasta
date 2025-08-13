'use client';

import { useState, useEffect } from 'react';

// Function to show PWA notifications using Service Worker or fallback
const showPWANotification = async (title: string, body: string) => {
  try {
    // Check if service worker is available and active
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready;
      if (registration && registration.active) {
        // Use Service Worker notification
        await registration.showNotification(title, {
          body,
          icon: '/icons/icon-192x192.png',
          tag: 'pwa-install-instruction',
          requireInteraction: true,
        });
        console.log('📱 PWA Service Worker notification shown');
        return;
      }
    }

    // Fallback to regular browser notification
    const browserNotification = new Notification(title, {
      body,
      icon: '/icons/icon-192x192.png',
      tag: 'pwa-install-instruction',
    });

    // Auto-close after 10 seconds
    setTimeout(() => {
      browserNotification.close();
    }, 10000);

    console.log('🔔 PWA browser notification shown');
  } catch (error) {
    console.error('❌ Error showing PWA notification:', error);
  }
};

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export const usePWA = () => {
  const [isInstallable, setIsInstallable] = useState(false);
  const [installPrompt, setInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  useEffect(() => {
    // Check if already installed
    const checkInstalled = () => {
      const isStandaloneMode = window.matchMedia(
        '(display-mode: standalone)'
      ).matches;
      const isiOSStandalone = (window.navigator as any).standalone === true;
      const isInstalled = isStandaloneMode || isiOSStandalone;

      if (isInstalled) {
        console.log('🎉 PWA is already installed');
        setIsInstalled(true);
        return true;
      }
      return false;
    };

    if (checkInstalled()) return;

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      console.log('🔥 beforeinstallprompt event fired - PWA is installable!');
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);

      // Wait for user engagement before showing prompt
      console.log('✅ PWA install prompt ready, waiting for user engagement');
    };

    // Listen for online/offline events
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    // Listen for app installed event
    const handleAppInstalled = () => {
      console.log('🎉 PWA installed successfully!');
      setIsInstalled(true);
      setIsInstallable(false);
      setInstallPrompt(null);
      setShowInstallPrompt(false);

      // Request notification permission immediately after installation
      requestNotificationPermissionAfterInstall();
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('✅ Service Worker registered:', registration);
        })
        .catch((registrationError) => {
          console.error(
            '❌ Service Worker registration failed:',
            registrationError
          );
        });
    }

    return () => {
      window.removeEventListener(
        'beforeinstallprompt',
        handleBeforeInstallPrompt
      );
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const installApp = async () => {
    if (!installPrompt) {
      console.log(
        '❌ No install prompt available - trying manual instructions'
      );

      // Show browser-specific instructions
      const userAgent = navigator.userAgent.toLowerCase();
      let instructions = '';

      if (userAgent.includes('chrome') || userAgent.includes('edge')) {
        instructions =
          'Look for the install icon (⊕) in your address bar, or:\n1. Click the three dots menu (⋮)\n2. Select "Install Aasta"\n3. Click "Install" in the popup';
      } else if (userAgent.includes('firefox')) {
        instructions =
          'Look for the install icon in your address bar, or:\n1. Click the address bar\n2. Look for "Install" option';
      } else if (userAgent.includes('safari')) {
        instructions =
          'On Safari:\n1. Tap the Share button (□↗)\n2. Scroll down and tap "Add to Home Screen"\n3. Tap "Add"';
      } else {
        instructions =
          'Look for an "Install" or "Add to Home Screen" option in your browser menu';
      }

      console.log('📱 Manual install instructions:', instructions);
      return;
    }

    try {
      console.log('🚀 Triggering PWA installation...');
      await installPrompt.prompt();
      const choiceResult = await installPrompt.userChoice;

      if (choiceResult.outcome === 'accepted') {
        console.log('✅ User accepted the install prompt');
      } else {
        console.log('❌ User dismissed the install prompt');
      }

      setInstallPrompt(null);
      setIsInstallable(false);
      setShowInstallPrompt(false);
    } catch (error) {
      console.error('❌ Error during installation:', error);
    }
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      try {
        const permission = await Notification.requestPermission();
        console.log('🔔 Notification permission result:', permission);
        return permission === 'granted';
      } catch (error) {
        console.error('❌ Error requesting notification permission:', error);
        return false;
      }
    }
    return false;
  };

  const requestNotificationPermissionAfterInstall = async () => {
    console.log(
      '🔔 Requesting notification permission after PWA installation...'
    );

    // Small delay to ensure PWA is fully installed
    setTimeout(async () => {
      if ('Notification' in window && Notification.permission === 'default') {
        try {
          const permission = await Notification.requestPermission();
          if (permission === 'granted') {
            console.log(
              '✅ Notification permission granted after installation!'
            );
            // Trigger push subscription
            await subscribeToPushNotifications();
          } else {
            console.log('❌ Notification permission denied after installation');
          }
        } catch (error) {
          console.error(
            '❌ Error requesting notification permission after install:',
            error
          );
        }
      }
    }, 1000);
  };

  const subscribeToPushNotifications = async () => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      try {
        const registration = await navigator.serviceWorker.ready;

        // Use the VAPID public key
        const vapidPublicKey =
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ||
          'BLrXB9jwTEIXyAEQNlQZqW-9OGDajzUW4m0AwrLI2G89Qe3Xc7dejs9XdXDlhNIG_PJFFE_WjisPKxPNAPqopPo';

        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: vapidPublicKey,
        });

        // Send subscription to server
        const response = await fetch('/api/push-subscription', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(subscription),
        });

        if (response.ok) {
          console.log('✅ Push notification subscription successful!');
        } else {
          console.error('❌ Failed to save push subscription');
        }

        return subscription;
      } catch (error) {
        console.error('❌ Error subscribing to push notifications:', error);
        return null;
      }
    }
    return null;
  };

  const dismissInstallPrompt = () => {
    setShowInstallPrompt(false);
  };

  return {
    isInstallable,
    isOnline,
    isInstalled,
    showInstallPrompt,
    installApp,
    dismissInstallPrompt,
    requestNotificationPermission,
    subscribeToPushNotifications,
  };
};
