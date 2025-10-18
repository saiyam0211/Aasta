'use client';

import { useEffect } from 'react';
import { useFCM } from '@/hooks/useFCM';

export default function FCMInitializer() {
  const { initializeFCM } = useFCM();

  useEffect(() => {
    // Initialize FCM when the app starts
    initializeFCM();
  }, [initializeFCM]);

  return null; // This component doesn't render anything
}
