'use client';

import { useEffect } from 'react';
import { useFCM } from '@/hooks/useFCM';

export default function FCMInitializer() {
  const { initializeFCM, isInitialized } = useFCM();

  useEffect(() => {
    // Initialize FCM when the app starts
    if (!isInitialized) {
      // Force FCM token regeneration by clearing localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('fcm_token');
        localStorage.removeItem('fcm_token_timestamp');
      }
      initializeFCM();
    }
  }, [initializeFCM, isInitialized]);

  return null; // This component doesn't render anything
}
