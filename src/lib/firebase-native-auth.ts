/**
 * Native Firebase Authentication Service for Capacitor
 * 
 * This service uses native Firebase Auth SDKs through @capacitor-firebase/authentication
 * to avoid reCAPTCHA issues on iOS and Android platforms.
 * 
 * Benefits:
 * - No reCAPTCHA required for phone authentication
 * - Native SDK performance and reliability
 * - Automatic handling of SMS verification
 * - Better user experience on native platforms
 */

import { FirebaseAuthentication } from '@capacitor-firebase/authentication';
import { Capacitor } from '@capacitor/core';

export interface PhoneAuthResult {
  verificationId: string;
  verificationCode?: string;
}

export interface PhoneSignInResult {
  user: {
    uid: string;
    phoneNumber: string | null;
  };
  credential: {
    providerId: string;
  };
}

/**
 * Check if we're running on a native platform (iOS/Android)
 */
export function isNativePlatform(): boolean {
  return Capacitor.isNativePlatform();
}

/**
 * Initialize native Firebase Authentication
 * This should be called once when the app starts
 */
export async function initializeNativeAuth(): Promise<void> {
  if (!isNativePlatform()) {
    console.log('[Native Auth] Not on native platform, skipping initialization');
    return;
  }

  try {
    console.log('[Native Auth] Initializing native Firebase Auth...');
    // The plugin auto-initializes with the Firebase config from native projects
    // No explicit initialization needed
    console.log('[Native Auth] Native Firebase Auth initialized successfully');
  } catch (error) {
    console.error('[Native Auth] Failed to initialize:', error);
    throw error;
  }
}

/**
 * Send OTP to phone number using native Firebase Auth
 * This uses the native SDK which doesn't require reCAPTCHA
 * 
 * @param phoneNumber - Phone number in E.164 format (e.g., +919999999999)
 * @returns Promise<PhoneAuthResult> - Contains verificationId for OTP verification
 */
export async function sendNativeOtp(
  phoneNumber: string
): Promise<PhoneAuthResult> {
  if (!isNativePlatform()) {
    throw new Error('Native auth is only available on iOS/Android platforms');
  }

  try {
    console.log('[Native Auth] 📱 Sending OTP to:', phoneNumber);
    
    // Use native phone sign-in which automatically sends SMS
    const result = await FirebaseAuthentication.signInWithPhoneNumber({
      phoneNumber,
    });

    console.log('[Native Auth] ✅ OTP sent successfully via native SDK');
    console.log('[Native Auth] Verification ID:', result.verificationId);

    return {
      verificationId: result.verificationId,
    };
  } catch (error: any) {
    console.error('[Native Auth] ❌ Failed to send OTP:', error);
    throw new Error(error.message || 'Failed to send OTP');
  }
}

/**
 * Verify OTP code using native Firebase Auth
 * 
 * @param verificationId - The verification ID returned from sendNativeOtp
 * @param verificationCode - The OTP code entered by the user
 * @returns Promise<PhoneSignInResult> - Contains user data and credential
 */
export async function verifyNativeOtp(
  verificationId: string,
  verificationCode: string
): Promise<PhoneSignInResult> {
  if (!isNativePlatform()) {
    throw new Error('Native auth is only available on iOS/Android platforms');
  }

  try {
    console.log('[Native Auth] 🔐 Verifying OTP...');
    
    // Complete phone sign-in with verification code
    const result = await FirebaseAuthentication.confirmVerificationCode({
      verificationId,
      verificationCode,
    });

    console.log('[Native Auth] ✅ OTP verified successfully');
    console.log('[Native Auth] User UID:', result.user?.uid);

    if (!result.user) {
      throw new Error('No user returned from verification');
    }

    return {
      user: {
        uid: result.user.uid,
        phoneNumber: result.user.phoneNumber || null,
      },
      credential: {
        providerId: 'phone',
      },
    };
  } catch (error: any) {
    console.error('[Native Auth] ❌ Failed to verify OTP:', error);
    throw new Error(error.message || 'Failed to verify OTP');
  }
}

/**
 * Get current user from native Firebase Auth
 */
export async function getCurrentNativeUser() {
  if (!isNativePlatform()) {
    return null;
  }

  try {
    const result = await FirebaseAuthentication.getCurrentUser();
    return result.user;
  } catch (error) {
    console.error('[Native Auth] Failed to get current user:', error);
    return null;
  }
}

/**
 * Sign out from native Firebase Auth
 */
export async function signOutNative(): Promise<void> {
  if (!isNativePlatform()) {
    return;
  }

  try {
    await FirebaseAuthentication.signOut();
    console.log('[Native Auth] ✅ Signed out successfully');
  } catch (error) {
    console.error('[Native Auth] Failed to sign out:', error);
    throw error;
  }
}

/**
 * Get ID token from current user (for API authentication)
 */
export async function getNativeIdToken(): Promise<string | null> {
  if (!isNativePlatform()) {
    return null;
  }

  try {
    const result = await FirebaseAuthentication.getIdToken();
    return result.token;
  } catch (error) {
    console.error('[Native Auth] Failed to get ID token:', error);
    return null;
  }
}

/**
 * Listen to auth state changes
 */
export function addNativeAuthStateListener(
  callback: (user: any) => void
): () => void {
  if (!isNativePlatform()) {
    return () => {};
  }

  const handle = FirebaseAuthentication.addListener('authStateChange', (result) => {
    callback(result.user);
  });

  // Return unsubscribe function
  return () => {
    handle.remove();
  };
}

