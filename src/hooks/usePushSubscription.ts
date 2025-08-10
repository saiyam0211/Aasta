"use client";

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

export function usePushSubscription() {
  const { data: session } = useSession();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSubscribing, setIsSubscribing] = useState(false);

  useEffect(() => {
    if (!session?.user?.id || !('serviceWorker' in navigator) || !('PushManager' in window)) {
      return;
    }

    // Check if already subscribed
    checkSubscriptionStatus();
    
    // Auto-subscribe if in PWA mode and not already subscribed
    autoSubscribe();
  }, [session?.user?.id]);

  const checkSubscriptionStatus = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      const hasSubscription = !!subscription;
      setIsSubscribed(hasSubscription);
      console.log('📊 Push subscription status:', hasSubscription ? 'Active' : 'None');
      return hasSubscription;
    } catch (error) {
      console.error('❌ Error checking subscription status:', error);
      return false;
    }
  };

  const autoSubscribe = async () => {
    try {
      // Only auto-subscribe if user is logged in and app is in standalone mode (PWA)
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isIOSStandalone = (window.navigator as any).standalone === true;
      
      if (!isStandalone && !isIOSStandalone) {
        console.log('🔍 Not in PWA mode, skipping auto-subscription');
        return;
      }

      const alreadySubscribed = await checkSubscriptionStatus();
      if (alreadySubscribed) {
        console.log('✅ Already subscribed to push notifications');
        return;
      }

      // Check notification permission
      if (Notification.permission === 'denied') {
        console.log('❌ Notification permission denied');
        return;
      }

      // Request permission if not granted
      if (Notification.permission !== 'granted') {
        console.log('🔔 Requesting notification permission for PWA user...');
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
          console.log('❌ Notification permission not granted');
          return;
        }
      }

      // Subscribe to push notifications
      console.log('🚀 Auto-subscribing to push notifications...');
      await subscribeToPush();
    } catch (error) {
      console.error('❌ Error in auto-subscribe:', error);
    }
  };

  const subscribeToPush = async () => {
    if (isSubscribing) {
      console.log('⏳ Subscription already in progress...');
      return;
    }
    
    setIsSubscribing(true);
    
    try {
      const registration = await navigator.serviceWorker.ready;
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || 'BLrXB9jwTEIXyAEQNlQZqW-9OGDajzUW4m0AwrLI2G89Qe3Xc7dejs9XdXDlhNIG_PJFFE_WjisPKxPNAPqopPo';
      
      console.log('🔑 Using VAPID key:', vapidPublicKey.substring(0, 20) + '...');
      
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: vapidPublicKey
      });

      console.log('📡 Push subscription created:', {
        endpoint: subscription.endpoint.substring(0, 50) + '...',
        keys: Object.keys(subscription.toJSON().keys || {})
      });

      // Send subscription to server
      const response = await fetch('/api/push-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subscription.toJSON())
      });

      if (response.ok) {
        setIsSubscribed(true);
        console.log('✅ Push notification subscription successful!');
      } else {
        const error = await response.json();
        console.error('❌ Failed to save push subscription:', error);
        throw new Error(error.error || 'Failed to save subscription');
      }
      
      return subscription;
    } catch (error) {
      console.error('❌ Error subscribing to push notifications:', error);
      setIsSubscribed(false);
      return null;
    } finally {
      setIsSubscribing(false);
    }
  };

  const unsubscribe = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        await subscription.unsubscribe();
        
        // Remove from server
        await fetch('/api/push-subscription', {
          method: 'DELETE',
        });
        
        setIsSubscribed(false);
        console.log('✅ Successfully unsubscribed from push notifications');
      }
    } catch (error) {
      console.error('❌ Error unsubscribing:', error);
    }
  };

  return {
    isSubscribed,
    isSubscribing,
    subscribeToPush,
    unsubscribe,
    checkSubscriptionStatus
  };
}
