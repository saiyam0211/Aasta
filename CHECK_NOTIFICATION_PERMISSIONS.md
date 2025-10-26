# ⚠️ CRITICAL: Notification Permissions Check

## The Crash is Still Happening - Here's Why

Even with APNs token registration in AppDelegate, the crash continues because:

### Issue 1: Wrong APNs Token Type ❌
The code was using `.unknown` instead of `.sandbox` for TestFlight.

**FIXED**: Changed to use `.sandbox` for DEBUG builds (TestFlight) and `.prod` for RELEASE builds (App Store).

### Issue 2: Notification Permissions ⚠️
The app might not be requesting or receiving notification permissions properly.

## Critical Test: Did You Grant Notification Permissions?

When you installed the TestFlight build:

1. Did you see a popup asking for notification permissions? 
2. Did you tap **"Allow"**?
3. Check: iOS Settings → Aasta → Notifications → Is "Allow Notifications" **ON**?

### If Permissions Were Denied:

Firebase Phone Auth **cannot work** without notification permissions because it needs to send a silent push notification.

## Verification Steps

### 1. Check Console Logs in Xcode

When you run the app, you should see in Xcode console:

```
✅ Expected logs:
📱 [AppDelegate] APNs token registered successfully
📱 [AppDelegate] Token: <hex string>
📱 [AppDelegate] Using SANDBOX APNs token
```

```
❌ If you see this instead:
❌ [AppDelegate] Failed to register for remote notifications: <error>
```

This means APNs registration is failing!

### 2. Check Notification Permissions

Add this code to check permissions before sending OTP:

```typescript
// In your sign-in page, before calling sendNativeOtp:
import { PushNotifications } from '@capacitor/push-notifications';

const checkPermissions = async () => {
  const result = await PushNotifications.checkPermissions();
  console.log('📱 Notification permissions:', result);
  
  if (result.receive !== 'granted') {
    console.log('⚠️ Requesting notification permissions...');
    const requested = await PushNotifications.requestPermissions();
    console.log('📱 Permission result:', requested);
  }
};

// Call this before sendNativeOtp
await checkPermissions();
```

## Most Likely Causes

| Cause | How to Check | Fix |
|-------|-------------|-----|
| **Permissions Denied** | Settings → Aasta → Notifications | Delete app, reinstall, tap "Allow" |
| **Wrong APNs Type** | Check Xcode console logs | ✅ Just fixed - need to archive again |
| **APNs Key Mismatch** | Firebase Console → Cloud Messaging | Verify key is for correct Apple Team ID |
| **Timing Issue** | APNs token arrives after verifyPhoneNumber call | Add delay (already in code) |

## Firebase Console Check

### Verify APNs Configuration:

1. Go to: **Firebase Console** → **Project Settings** → **Cloud Messaging**
2. Click on your iOS app
3. Under **APNs Certificates**:
   - ✅ Should show: "APNs Authentication Key" uploaded
   - ✅ Key ID should match your `.p8` file
   - ✅ Team ID should match your Apple Developer account

### Verify APNs Key Environment:

For TestFlight, you need **BOTH**:
- ✅ Development APNs key (for internal testing)
- ✅ Production APNs key (for external testing and App Store)

**Most common issue**: Only Production key is uploaded, but TestFlight needs Development key too!

## Action Plan

### Step 1: Verify Permissions on Device

```
iOS Device:
1. Go to Settings → Aasta
2. Tap "Notifications"
3. Make sure "Allow Notifications" is ON
4. If OFF, turn it ON
5. Delete app and reinstall from TestFlight
6. Tap "Allow" when prompted
```

### Step 2: Archive New Build with Fixed APNs Type

```bash
# Open Xcode
npx cap open ios

# Clean & Archive
Product → Clean Build Folder (⇧⌘K)
Product → Archive
Distribute → App Store Connect → Upload
```

### Step 3: Check Console Logs

When testing the new build:

1. Connect iPad to Mac
2. Open Xcode → Window → Devices and Simulators
3. Select your iPad → Click "Open Console"
4. Install and run app from TestFlight
5. **Look for APNs token logs**

### Step 4: Test with Explicit Permission Request

If crash continues, the app might need to explicitly request permissions before phone auth.

## Expected Console Output (Working)

```
App Launch:
📱 [AppDelegate] APNs token registered successfully
📱 [AppDelegate] Token: ab12cd34ef56...
📱 [AppDelegate] Using SANDBOX APNs token
✅ Push notification permissions granted

On Send OTP:
[Native Auth] 📱 Sending OTP to: +1 650-555-1234
[Native Auth] ℹ️ Waiting for APNs token...
[Native Auth] 📞 Initiating phone verification...
📬 [AppDelegate] Received remote notification
[Native Auth] ✅ OTP sent successfully
```

## Expected Console Output (Failing)

```
App Launch:
❌ [AppDelegate] Failed to register for remote notifications: User has notifications disabled
OR
(No APNs logs at all - means registration never happened)

On Send OTP:
[Native Auth] 📱 Sending OTP to: +1 650-555-1234
[Native Auth] ℹ️ Waiting for APNs token...
[Native Auth] 📞 Initiating phone verification...
💥 CRASH: Unexpectedly found nil
```

## Next Steps

1. ✅ Archive new build with fixed APNs token type
2. ⏰ Wait for TestFlight processing (15-30 min)
3. 📱 Install on device
4. ⚠️ **GRANT NOTIFICATION PERMISSIONS**
5. 🔍 Check console logs for APNs token
6. 🧪 Test phone auth

If it still crashes:
- Share the Xcode console logs (especially APNs lines)
- Confirm notification permissions are granted
- Verify Firebase APNs key configuration

---

**Key Point**: Without notification permissions, Firebase Phone Auth **cannot work**. The silent push is essential for verification.

