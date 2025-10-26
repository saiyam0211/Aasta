import { initializeApp, getApps } from 'firebase/app';
import {
  getAuth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
} from 'firebase/auth';

// Firebase configuration - different for web vs iOS
const getFirebaseConfig = () => {
  // Check if we're running in Capacitor (iOS/Android)
  const isCapacitor = typeof window !== 'undefined' && (window as any).Capacitor;
  
  if (isCapacitor) {
    // iOS/Android configuration
    return {
      apiKey: 'AIzaSyBqmt4JjXiQMXKev9lq3wq-_SKDYbFXZwQ', // iOS API key
      authDomain: 'aastatechnology.firebaseapp.com',
      projectId: 'aastatechnology',
      storageBucket: 'aastatechnology.firebasestorage.app',
      messagingSenderId: '629804234684',
      appId: '1:629804234684:ios:c5fc7cd893110fefc41db9', // iOS app ID
    };
  } else {
    // Web configuration
    return {
      apiKey: 'AIzaSyBt2iS9BP-x_Yp7_5Bro76vyLW34C1cacs', // Web API key
      authDomain: 'aastatechnology.firebaseapp.com',
      projectId: 'aastatechnology',
      storageBucket: 'aastatechnology.firebasestorage.app',
      messagingSenderId: '629804234684',
      appId: '1:629804234684:web:c9d49ee282594651c41db9', // Web app ID
      measurementId: 'G-FT4JT14DPJ',
    };
  }
};

const firebaseConfig = getFirebaseConfig();

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Debug logging for Firebase configuration
if (typeof window !== 'undefined') {
  const isCapacitor = (window as any).Capacitor;
  console.log('🔥 Firebase initialized:', {
    platform: isCapacitor ? 'Capacitor (iOS/Android)' : 'Web',
    appId: firebaseConfig.appId,
    apiKey: firebaseConfig.apiKey?.substring(0, 10) + '...',
  });
}

// Initialize Firebase Messaging (only in browser, not in Capacitor)
let messaging = null;
if (typeof window !== 'undefined' && !(window as any).Capacitor) {
  // Only initialize Firebase Messaging in web browsers, not in Capacitor
  import('firebase/messaging').then(({ getMessaging }) => {
    messaging = getMessaging(app);
  });
}
export { messaging };

if (typeof window !== 'undefined') {
  const disableForDev =
    process.env.NEXT_PUBLIC_FIREBASE_DISABLE_APP_VERIFICATION === 'true';
  if (disableForDev && (auth as any).settings) {
    (auth as any).settings.appVerificationDisabledForTesting = true;
  }
}

export function createInvisibleRecaptcha(
  containerId: string,
  size: 'invisible' | 'normal' = 'invisible'
) {
  // Check if we're running in Capacitor (iOS/Android)
  const isCapacitor = typeof window !== 'undefined' && (window as any).Capacitor;
  
  // For Capacitor environments, use a more compatible configuration
  const config = isCapacitor ? {
    size: 'normal' as const, // Use normal size for better compatibility in Capacitor
    callback: () => {
      console.log('reCAPTCHA solved automatically');
    },
    'expired-callback': () => {
      console.log('reCAPTCHA expired');
    },
  } : {
    size,
    callback: () => {
      console.log('reCAPTCHA solved automatically');
    },
    'expired-callback': () => {
      console.log('reCAPTCHA expired');
    },
  };

  const verifier = new RecaptchaVerifier(auth, containerId, config);

  // For Capacitor, always render the reCAPTCHA
  if (isCapacitor && typeof (verifier as any).render === 'function') {
    try {
      (verifier as any).render();
      console.log('✅ reCAPTCHA rendered for Capacitor');
    } catch (error) {
      console.warn('⚠️ reCAPTCHA render failed:', error);
    }
  } else if (!isCapacitor && size === 'normal' && typeof (verifier as any).render === 'function') {
    (verifier as any).render();
  }

  return verifier;
}

export async function sendOtp(
  phoneWithCountryCode: string,
  verifier: RecaptchaVerifier
) {
  try {
    console.log('📱 Sending OTP to:', phoneWithCountryCode);
    console.log('🔥 Firebase auth instance:', auth.app.name);
    console.log('🔐 reCAPTCHA verifier:', {
      type: typeof verifier,
      hasRender: typeof (verifier as any).render === 'function',
      size: (verifier as any).size || 'unknown',
    });
    
    const result = await signInWithPhoneNumber(auth, phoneWithCountryCode, verifier);
    console.log('✅ OTP sent successfully');
    return result;
  } catch (error: any) {
    console.error('❌ OTP send failed:', {
      code: error.code,
      message: error.message,
      phone: phoneWithCountryCode,
      authApp: auth.app.name,
      errorDetails: error,
    });
    
    // Additional debugging for reCAPTCHA issues
    if (error.code === 'auth/internal-error') {
      console.error('🔍 Internal error details:', {
        verifierType: typeof verifier,
        verifierSize: (verifier as any).size,
        isCapacitor: typeof window !== 'undefined' && !!(window as any).Capacitor,
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
      });
    }
    
    throw error;
  }
}
