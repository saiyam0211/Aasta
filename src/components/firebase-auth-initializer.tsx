'use client';

import { useEffect } from 'react';
import { initializeNativeAuth, isNativePlatform } from '@/lib/firebase-native-auth';

export default function FirebaseAuthInitializer() {
  useEffect(() => {
    if (!isNativePlatform()) {
      return;
    }

    // Initialize native Firebase Auth after a short delay to ensure APNs token is registered
    const initAuth = async () => {
      try {
        await initializeNativeAuth();
      } catch (error) {
        console.error('[FirebaseAuthInitializer] Failed to initialize:', error);
      }
    };

    // Wait for app to be fully loaded
    const timer = setTimeout(initAuth, 2000);

    return () => clearTimeout(timer);
  }, []);

  return null;
}

