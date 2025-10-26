import { initializeApp, getApps } from 'firebase/app';
import {
  getAuth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyBt2iS9BP-x_Yp7_5Bro76vyLW34C1cacs',
  authDomain: 'aastatechnology.firebaseapp.com',
  projectId: 'aastatechnology',
  storageBucket: 'aastatechnology.firebasestorage.app',
  messagingSenderId: '629804234684', // Firebase Project Number (correct!)
  appId: '1:629804234684:web:c9d49ee282594651c41db9',
  measurementId: 'G-FT4JT14DPJ',
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
export const auth = getAuth(app);

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
  // For invisible reCAPTCHA, we don't need to render it visibly
  const verifier = new RecaptchaVerifier(auth, containerId, {
    size,
    callback: () => {
      // This callback will be called when reCAPTCHA is solved
      console.log('reCAPTCHA solved automatically');
    },
    'expired-callback': () => {
      // This callback will be called when reCAPTCHA expires
      console.log('reCAPTCHA expired');
    },
  });

  // Only render if it's normal size, invisible should not be rendered
  if (size === 'normal' && typeof (verifier as any).render === 'function') {
    (verifier as any).render();
  }

  return verifier;
}

export async function sendOtp(
  phoneWithCountryCode: string,
  verifier: RecaptchaVerifier
) {
  return await signInWithPhoneNumber(auth, phoneWithCountryCode, verifier);
}
