# Firebase Native Authentication Setup for iOS/Android

This guide will help you set up native Firebase Authentication for phone sign-in on iOS and Android. This eliminates reCAPTCHA issues and provides a better user experience.

## What Changed

✅ **Before**: Used web Firebase Auth with reCAPTCHA (causing `auth/internal-error`)  
✅ **After**: Uses native Firebase Auth SDKs (no reCAPTCHA required)

## iOS Setup

### 1. Open iOS Project in Xcode
```bash
cd /Users/saiyam0211/Desktop/Aasta/main
npx cap open ios
```

### 2. Configure Firebase in Xcode

The Firebase configuration is already in place via `GoogleService-Info.plist`, but you need to ensure the Firebase SDK is properly linked.

### 3. Enable Phone Authentication in Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **aastatechnology**
3. Navigate to **Authentication** → **Sign-in method**
4. Enable **Phone** provider
5. Add your app's iOS App ID verification:
   - Go to **Authentication** → **Settings** → **Authorized domains**
   - Ensure your domain is listed

### 4. Update Info.plist (if needed)

The plugin should handle this automatically, but verify these keys exist in `ios/App/App/Info.plist`:

```xml
<key>CFBundleURLTypes</key>
<array>
  <dict>
    <key>CFBundleTypeRole</key>
    <string>Editor</string>
    <key>CFBundleURLSchemes</key>
    <array>
      <string>food.aasta.app</string>
    </array>
  </dict>
</array>
```

### 5. Sync Capacitor
```bash
npx cap sync ios
```

### 6. Build and Test
```bash
npx cap run ios
```

## Android Setup

### 1. Open Android Project in Android Studio
```bash
npx cap open android
```

### 2. Configure Firebase

Ensure `google-services.json` is in `android/app/` directory (should already be there).

### 3. Enable Phone Authentication

Same as iOS:
1. Go to Firebase Console
2. Enable **Phone** provider under **Authentication** → **Sign-in method**

### 4. Add SHA-1 and SHA-256 Fingerprints

Phone authentication requires your app's SHA fingerprints to be registered:

#### Get Debug SHA-1:
```bash
cd android
./gradlew signingReport
```

Look for the `SHA1` and `SHA-256` values under the `debug` variant.

#### Add to Firebase:
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Project Settings** → **Your apps** → Select Android app
4. Add SHA-1 and SHA-256 fingerprints
5. Download the updated `google-services.json` and replace `android/app/google-services.json`

### 5. Sync Capacitor
```bash
npx cap sync android
```

### 6. Build and Test
```bash
npx cap run android
```

## Testing Phone Authentication

### Test Phone Numbers (for Development)

You can add test phone numbers in Firebase Console:
1. Go to **Authentication** → **Sign-in method** → **Phone**
2. Scroll to **Phone numbers for testing**
3. Add test numbers with predefined OTP codes (e.g., +1 650-555-1234 → 123456)

### Real Phone Numbers

For production testing:
1. Use real phone numbers
2. SMS will be sent automatically
3. Verify you have SMS credits in your Firebase plan

## Common Issues & Solutions

### Issue: "This request is missing a valid app identifier"
**Solution**: Make sure you've added SHA-1/SHA-256 fingerprints (Android) or configured app bundle ID (iOS) in Firebase Console.

### Issue: "reCAPTCHA Enterprise required"
**Solution**: The native implementation bypasses this. Make sure you're running on a real device or simulator with proper Firebase config.

### Issue: "auth/invalid-app-credential"
**Solution**: 
- iOS: Regenerate `GoogleService-Info.plist` from Firebase Console
- Android: Regenerate `google-services.json` and add correct SHA fingerprints

### Issue: SMS not received
**Solution**:
1. Check Firebase Console quotas
2. Verify phone number format (E.164 format: +[country code][number])
3. Check if test phone numbers are set up correctly
4. Enable Cloud Functions if using Firebase Functions for SMS

## Platform Detection

The app automatically detects the platform:
- **Native platforms (iOS/Android)**: Uses `@capacitor-firebase/authentication` (no reCAPTCHA)
- **Web platform**: Falls back to web Firebase Auth with reCAPTCHA

You'll see logs like:
```
[AUTH] 🚀 Native platform detected, using native Firebase Auth
[AUTH] Using native Firebase Auth (no reCAPTCHA)
[AUTH] ✅ OTP sent via native SDK
```

## Additional Resources

- [Capacitor Firebase Authentication Plugin](https://github.com/capawesome-team/capacitor-firebase/tree/main/packages/authentication)
- [Firebase Phone Authentication Docs](https://firebase.google.com/docs/auth/ios/phone-auth)
- [Firebase Console](https://console.firebase.google.com/)

## Next Steps

1. Run `npx cap sync` to sync changes to native projects
2. Open native IDE and run the app on a device/simulator
3. Test phone authentication flow
4. Monitor logs for successful native auth

The changes are backward compatible - web builds will continue to use web Firebase Auth with reCAPTCHA.

