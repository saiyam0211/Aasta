# 🔐 Enable reCAPTCHA for Android Phone Auth

## The Problem

SafetyNet is failing for real phone numbers. Firebase needs reCAPTCHA as a fallback.

## Solution: Enable App Verification in Firebase

### Step 1: Go to Firebase Console

1. Open: https://console.firebase.google.com/
2. Select your **"aasta"** project
3. Go to **Authentication** → **Settings** tab

### Step 2: Enable App Verification

1. Scroll to **"App verification"** section
2. Find **"Enable reCAPTCHA Enterprise"** or **"App Check"** settings
3. Make sure phone authentication is allowed without app attestation

### Step 3: Configure Android App Verification

1. In Firebase Console, go to **Project Settings**
2. Select your **Android app** (food.aasta.app)
3. Scroll to **"App Check"** section
4. Click **"Register"** if not already registered
5. Choose **"reCAPTCHA Enterprise"** or **"reCAPTCHA v3"**

### Step 4: Update Firebase Settings

1. Still in Project Settings → Your Android app
2. Make sure SHA fingerprints are present (you already did this)
3. Download the latest `google-services.json`
4. Replace your local file

---

## Alternative: Disable SafetyNet, Use Web reCAPTCHA

If the above doesn't work, we can configure the app to always use web reCAPTCHA.

### Update android/app/build.gradle

Add this to force reCAPTCHA verification:

```gradle
android {
    defaultConfig {
        // ... existing config
        
        // Force reCAPTCHA verification for phone auth
        resValue "bool", "firebase_phone_auth_use_recaptcha", "true"
    }
}
```

This tells Firebase to always show the reCAPTCHA UI instead of using SafetyNet.

---

## What This Will Do

After enabling reCAPTCHA:

1. User enters phone number
2. Click "Send OTP"
3. **reCAPTCHA popup appears** (solve the puzzle)
4. After solving, **SMS is sent!**
5. User enters OTP
6. ✅ Success!

This is **completely normal** and how most production apps handle phone auth when SafetyNet isn't available.

---

## Expected Flow

```
User clicks "Send OTP"
  ↓
reCAPTCHA verification popup
  ↓
User solves: "I'm not a robot"
  ↓
✅ Verification complete
  ↓
📱 SMS sent to phone
  ↓
User enters OTP
  ↓
✅ Signed in!
```

Total time: ~10-30 seconds (including reCAPTCHA solve)

---

**This is the standard production flow when SafetyNet isn't available!**

