# Firebase Native Auth Build Fix

## Issue
TypeScript compilation error during Vercel build:
```
Type error: Property 'verificationId' does not exist on type 'void'.
```

## Root Cause
The `@capacitor-firebase/authentication` plugin uses an event-driven pattern for phone authentication, not a direct return value pattern.

## Solution

### API Pattern
1. **`signInWithPhoneNumber()`** - Returns `Promise<void>` (not a verificationId)
2. **`phoneCodeSent` event** - Provides the verificationId via event listener
3. **`confirmVerificationCode()`** - Completes sign-in with verificationId + code

### Implementation
```typescript
// Set up event listener for verification ID
const handle = await FirebaseAuthentication.addListener(
  'phoneCodeSent',
  (event) => {
    console.log('Verification ID:', event.verificationId);
    handle.remove(); // Clean up listener
    resolve({ verificationId: event.verificationId });
  }
);

// Trigger phone sign-in (this fires the phoneCodeSent event)
await FirebaseAuthentication.signInWithPhoneNumber({ phoneNumber });
```

## Changes Made
1. Updated `sendNativeOtp()` to use Promise with event listener pattern
2. Changed `verifyNativeOtp()` return type from `PhoneSignInResult` to `void`
3. Fixed `addNativeAuthStateListener()` to properly await the listener handle

## Testing
The build should now pass on Vercel. Test by:
1. Pushing changes to trigger Vercel build
2. Testing on iOS device: `npx cap run ios`
3. Testing on Android device: `npx cap run android`

## Next Steps After Successful Build
1. Enable Phone Authentication in Firebase Console
2. Add SHA fingerprints for Android
3. Test on real devices (simulators may not support SMS)

