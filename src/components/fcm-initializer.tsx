'use client';

import { useEffect } from 'react';
import { useFCM } from '@/hooks/useFCM';

export default function FCMInitializer() {
  const { initializeFCM, isInitialized } = useFCM();

  useEffect(() => {
    // Initialize FCM when the app starts
    if (!isInitialized) {
      initializeFCM();
    }
  }, [initializeFCM, isInitialized]);

  return null; // This component doesn't render anything
}
