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
  messagingSenderId: '629804234684',
  appId: '1:629804234684:web:c9d49ee282594651c41db9',
  measurementId: 'G-FT4JT14DPJ',
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
export const auth = getAuth(app);

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
  const verifier = new RecaptchaVerifier(auth, containerId, { size });
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
