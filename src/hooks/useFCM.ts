'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Capacitor } from '@capacitor/core';
import { FCM } from '@capacitor-community/fcm';
import { PushNotifications } from '@capacitor/push-notifications';

export const useFCM = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const router = useRouter();

  const initializeFCM = useCallback(async () => {
    try {
      console.log('🚀 Initializing FCM...');
      
      // Check if running on native platform
      if (!Capacitor.isNativePlatform()) {
        console.log('📱 Not running on native platform, skipping FCM initialization');
        return;
      }
      
      // Request permissions
      const permission = await PushNotifications.requestPermissions();
      
      if (permission.receive === 'granted') {
        console.log('✅ Push notification permissions granted');
        
        // Register for push notifications
        await PushNotifications.register();
        
        // Get FCM token (this will generate a new one)
        const tokenResult = await FCM.getToken();
        const token = tokenResult.token;
        setFcmToken(token);
        console.log('📱 New FCM Token:', token);
        
        // Send token to backend
        try {
          const response = await fetch('/api/notifications/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token })
          });
          
          if (response.ok) {
            console.log('✅ FCM token registered successfully');
          } else {
            console.error('❌ Failed to register FCM token');
          }
        } catch (error) {
          console.error('❌ Error registering FCM token:', error);
        }
        
        // Note: FCM listeners will be added in a future update
        // For now, we focus on token registration
        console.log('📱 FCM token registered, listeners will be added later');
        
        setIsInitialized(true);
        console.log('✅ FCM initialized successfully');
      } else {
        console.warn('⚠️ FCM permission denied');
      }
    } catch (error) {
      console.error('❌ Error initializing FCM:', error);
    }
  }, [router]);

  useEffect(() => {
    if (!isInitialized) {
      initializeFCM();
    }
  }, [initializeFCM, isInitialized]);

  return {
    isInitialized,
    fcmToken,
    initializeFCM
  };
};
