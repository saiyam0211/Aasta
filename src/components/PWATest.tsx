"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function PWATest() {
  const { data: session } = useSession();
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [swRegistered, setSwRegistered] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [manifestLoaded, setManifestLoaded] = useState(false);
  const [userEngaged, setUserEngaged] = useState(false);
  const [pushSubscribed, setPushSubscribed] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // Check manifest loading
    fetch('/manifest.json')
      .then(response => {
        if (response.ok) {
          setManifestLoaded(true);
          console.log('✅ Manifest loaded successfully');
        } else {
          console.log('❌ Manifest failed to load:', response.status);
        }
      })
      .catch(error => {
        console.log('❌ Manifest fetch error:', error);
      });

    // Track user engagement for install prompt
    const trackEngagement = () => {
      setUserEngaged(true);
      console.log('User engaged with the page');
    };

    ['click', 'keydown', 'scroll', 'touchstart'].forEach(event => {
      document.addEventListener(event, trackEngagement, { once: true, passive: true });
    });

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      console.log('beforeinstallprompt event fired');
      e.preventDefault();
      setInstallPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('SW registered: ', registration);
          setSwRegistered(true);
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError);
        });
    }

    // Check notification permission
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const installApp = async () => {
    if (!installPrompt) return;

    try {
      await installPrompt.prompt();
      const choiceResult = await installPrompt.userChoice;
      
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }
      
      setInstallPrompt(null);
      setIsInstallable(false);
    } catch (error) {
      console.error('Error during installation:', error);
    }
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      try {
        const permission = await Notification.requestPermission();
        console.log('Notification permission result:', permission);
        setNotificationPermission(permission);
        
        if (permission === 'granted') {
          console.log('✅ Notification permission granted!');
        } else if (permission === 'denied') {
          console.log('❌ Notification permission denied');
          alert('Notifications are blocked. Please enable them in your browser settings.');
        } else {
          console.log('⚠️ Notification permission dismissed');
        }
        
        return permission === 'granted';
      } catch (error) {
        console.error('Error requesting notification permission:', error);
        alert('Error requesting notification permission: ' + (error instanceof Error ? error.message : 'Unknown error'));
        return false;
      }
    } else {
      console.log('❌ Notifications not supported in this browser');
      alert('Notifications are not supported in this browser');
      return false;
    }
  };

  const subscribeToPush = async () => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      try {
        const registration = await navigator.serviceWorker.ready;
        const vapidPublicKey = 'BLrXB9jwTEIXyAEQNlQZqW-9OGDajzUW4m0AwrLI2G89Qe3Xc7dejs9XdXDlhNIG_PJFFE_WjisPKxPNAPqopPo';
        
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: vapidPublicKey
        });

        console.log('Push subscription:', subscription);

        // Send subscription to server
        const response = await fetch('/api/push-subscription', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(subscription)
        });

        const result = await response.json();
        console.log('Subscription result:', result);
        
        return subscription;
      } catch (error) {
        console.error('Error subscribing to push notifications:', error);
        return null;
      }
    }
    return null;
  };

  const registerAsPWA = async () => {
    try {
      const sessionId = sessionStorage.getItem('client-session-id') || 
                       `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      if (!sessionStorage.getItem('client-session-id')) {
        sessionStorage.setItem('client-session-id', sessionId);
      }

      console.log('🔧 Manually registering as PWA client...');
      
      const response = await fetch('/api/client-register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          isPWA: true, // Force PWA registration
          userAgent: navigator.userAgent,
          pwaDetails: {
            isStandalone: window.matchMedia('(display-mode: standalone)').matches,
            isIOSStandalone: (window.navigator as any).standalone === true,
            isInAppBrowser: false,
            hasManifest: true,
            manualOverride: true
          }
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Manually registered as PWA:', result);
        alert(`Successfully registered as PWA! Current PWA clients: ${result.stats.pwaClients}`);
      } else {
        const error = await response.json();
        console.error('❌ Failed to register as PWA:', error);
        alert('Failed to register as PWA: ' + error.error);
      }
    } catch (error) {
      console.error('❌ Error manually registering as PWA:', error);
      alert('Error: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  return (
    <Card className="fixed bottom-4 right-4 w-80 z-50">
      <CardContent className="p-4">
        <h3 className="font-bold mb-3">PWA Debug Panel</h3>
        
        <div className="space-y-2 text-sm">
          <div>SW Registered: {swRegistered ? '✅' : '❌'}</div>
          <div>Manifest Loaded: {manifestLoaded ? '✅' : '❌'}</div>
          <div>User Engaged: {userEngaged ? '✅' : '❌'}</div>
          <div>Is Installable: {isInstallable ? '✅' : '❌'}</div>
          <div>Is Installed: {isInstalled ? '✅' : '❌'}</div>
          <div>Notification Permission: {notificationPermission}</div>
        </div>

        <div className="mt-4 space-y-2">
          <Button 
            onClick={installApp} 
            disabled={!isInstallable}
            className="w-full"
            size="sm"
          >
            Install App
          </Button>
          
          <Button 
            onClick={requestNotificationPermission}
            className="w-full"
            size="sm"
            variant="outline"
          >
            Request Notifications
          </Button>
          
          <Button 
            onClick={registerAsPWA}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            size="sm"
          >
            🚀 Register as PWA Client
          </Button>
          
          {session?.user?.id && (
            <Button 
              onClick={registerAsPWA}
              className="w-full bg-green-600 hover:bg-green-700"
              size="sm"
            >
              🔧 Register as PWA
            </Button>
          )}
          
          <div className="text-xs text-gray-600 mt-2">
            {notificationPermission === 'denied' && (
              <div className="text-red-600">
                Notifications blocked! Click the lock icon in address bar and reset permissions, then refresh.
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
