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
 * The plugin uses an event-driven approach:
 * 1. Set up a listener for phoneCodeSent event
 * 2. Call signInWithPhoneNumber (returns void)
 * 3. The listener receives the verificationId
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

  return new Promise(async (resolve, reject) => {
    let handle: any = null;
    const timeoutId = setTimeout(() => {
      if (handle) handle.remove();
      reject(new Error('Phone verification timeout. Please ensure:\n1. Phone provider is enabled in Firebase Console\n2. APNs certificates are configured\n3. You are testing on a real device (not simulator)'));
    }, 60000); // 60 second timeout

    try {
      console.log('[Native Auth] 📱 Sending OTP to:', phoneNumber);
      console.log('[Native Auth] ℹ️ Waiting for APNs token and Firebase initialization...');
      
      // Set up listener for verification ID
      handle = await FirebaseAuthentication.addListener(
        'phoneCodeSent',
        (event) => {
          clearTimeout(timeoutId);
          console.log('[Native Auth] ✅ OTP sent successfully via native SDK');
          console.log('[Native Auth] Verification ID:', event.verificationId);
          
          // Clean up listener
          if (handle) handle.remove();
          
          resolve({
            verificationId: event.verificationId,
          });
        }
      );

      // Small delay to ensure APNs token is available
      await new Promise(r => setTimeout(r, 500));

      console.log('[Native Auth] 📞 Initiating phone verification...');
      
      // Trigger phone sign-in (this will trigger the phoneCodeSent event)
      await FirebaseAuthentication.signInWithPhoneNumber({
        phoneNumber,
      });
      
      console.log('[Native Auth] ⏳ Phone verification initiated, waiting for SMS...');
    } catch (error: any) {
      clearTimeout(timeoutId);
      if (handle) handle.remove();
      
      console.error('[Native Auth] ❌ Failed to send OTP:', error);
      console.error('[Native Auth] Error details:', {
        code: error.code,
        message: error.message,
        stack: error.stack,
      });
      
      // Provide helpful error messages
      let errorMessage = error.message || 'Failed to send OTP';
      
      if (errorMessage.includes('nil')) {
        errorMessage = 'Phone authentication initialization failed. Please ensure:\n' +
          '1. You are testing on a real iOS device (not simulator)\n' +
          '2. Push Notifications are enabled in Xcode Capabilities\n' +
          '3. APNs certificates are configured in Firebase Console\n' +
          '4. Phone provider is enabled in Firebase Authentication';
      }
      
      reject(new Error(errorMessage));
    }
  });
}

/**
 * Verify OTP code using native Firebase Auth
 * 
 * @param verificationId - The verification ID returned from sendNativeOtp
 * @param verificationCode - The OTP code entered by the user
 * @returns Promise<void> - Completes the sign-in process
 */
export async function verifyNativeOtp(
  verificationId: string,
  verificationCode: string
): Promise<void> {
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
    console.log('[Native Auth] User Phone:', result.user?.phoneNumber);

    if (!result.user) {
      throw new Error('No user returned from verification');
    }
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
 * Returns a promise that resolves to an unsubscribe function
 */
export async function addNativeAuthStateListener(
  callback: (user: any) => void
): Promise<() => void> {
  if (!isNativePlatform()) {
    return () => {};
  }

  const handle = await FirebaseAuthentication.addListener('authStateChange', (result) => {
    callback(result.user);
  });

  // Return unsubscribe function
  return () => {
    handle.remove();
  };
}

