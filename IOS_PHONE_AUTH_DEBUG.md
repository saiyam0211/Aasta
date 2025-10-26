# iOS Phone Authentication Debug Guide

## Current Status
✅ Phone provider is enabled in Firebase Console  
✅ APNs keys uploaded to Firebase  
✅ Info.plist configured with location permissions  
✅ Testing on real iOS device  
❌ **App crashes when sending OTP**

## The Crash Reason

The crash at `PhoneAuthProvider.verifyPhoneNumber` with "Unexpectedly found nil" happens because Firebase Phone Auth requires:
1. **APNs device token** to be registered
2. **Push Notifications capability** enabled in Xcode
3. **Proper app signing** with Push Notifications entitlement

## Fix Steps

### 1. Enable Push Notifications in Xcode

**IMPORTANT**: Open Xcode and verify this setting:

```bash
npx cap open ios
```

Then in Xcode:

1. Select **App** target (blue icon at top of project navigator)
2. Go to **"Signing & Capabilities"** tab
3. Check if **"Push Notifications"** is listed under capabilities
   - ✅ If YES: Good, it's enabled
   - ❌ If NO: Click **"+ Capability"** → Search "Push" → Add **"Push Notifications"**
4. Also verify **"Background Modes"** capability exists:
   - If not, add it: **"+ Capability"** → "Background Modes"
   - Check the box for **"Remote notifications"**

### 2. Rebuild and Clean

After enabling Push Notifications:

```bash
# Clean build
cd ios/App
rm -rf build
rm -rf DerivedData

# Sync Capacitor
cd ../..
npx cap sync ios

# Rebuild
npx cap run ios
```

### 3. Test Again

When testing:
1. Make sure you're on a **real device** (not simulator)
2. When the app starts, **grant notification permissions** when prompted
3. Wait 1-2 seconds after the app loads before clicking "Send OTP"
4. Use your real phone number or test number: `+1 650-555-1234`

## What Should Happen

### Before Fix (Current):
```
[AUTH] Send OTP clicked
[Native Auth] Sending OTP to: +91...
💥 CRASH: "Unexpectedly found nil"
```

### After Fix (Expected):
```
[AUTH] Send OTP clicked
[Native Auth] Sending OTP to: +91...
[Native Auth] Waiting for APNs token...
[Native Auth] Initiating phone verification...
[Native Auth] ✅ OTP sent successfully
[Native Auth] Verification ID: xxx...
```

## Common Issues

### Issue 1: "App not properly signed"
**Solution**: Make sure your Apple Developer account is set up in Xcode → Preferences → Accounts

### Issue 2: "APNs token not received"
**Solution**: 
- Check notification permissions are granted
- Restart the app
- Verify APNs keys in Firebase are for the correct environment (Development vs Production)

### Issue 3: Still crashes
**Solution**: Check Xcode console for the full error message. The crash log will show exactly what's nil.

## Verification Checklist

Before testing, verify ALL of these:

- [ ] Push Notifications capability enabled in Xcode
- [ ] Background Modes → Remote notifications checked
- [ ] APNs keys uploaded to Firebase Console (Development + Production)
- [ ] Phone provider enabled in Firebase Console
- [ ] Testing on real iOS device (not simulator)
- [ ] App signed with valid provisioning profile
- [ ] Notification permissions granted when app starts
- [ ] Bundle ID matches: `food.aasta.app`

## Need More Help?

If still crashing, check:
1. Xcode console for detailed error message
2. Firebase Console → Authentication → Usage for any errors
3. Device logs in Xcode → Window → Devices and Simulators → View Device Logs

## Test Phone Numbers (For Development)

Add these in Firebase Console → Authentication → Phone → Testing:
- `+1 650-555-1234` → Code: `123456`
- `+1 650-555-9999` → Code: `654321`

These bypass real SMS and work immediately!

