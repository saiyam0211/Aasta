# 🔍 Debug Latest Build - Console Log Check

Since you're on the latest build and it's still crashing, we need to see what's happening.

## Step 1: Connect iPad & Check Console Logs

### Open Console in Xcode

1. Connect your iPad to Mac via USB
2. Open Xcode
3. Go to: **Window** → **Devices and Simulators**
4. Select your iPad
5. Click **"Open Console"** button (bottom right)

### Launch App & Watch Logs

1. Keep Console window open
2. Launch Aasta from TestFlight on iPad
3. Watch for these critical lines:

#### ✅ If Working - You Should See:
```
📱 [AppDelegate] APNs token registered successfully
📱 [AppDelegate] Token: ab12cd34ef56789...
📱 [AppDelegate] Using SANDBOX APNs token (for TestFlight)
```

#### ❌ If Broken - You'll See:
```
❌ [AppDelegate] Failed to register for remote notifications: <error message>
```

OR **No APNs logs at all** (means registration never happened)

## Step 2: Check Notification Permissions

### On iPad:

1. Go to: **Settings** → **Aasta**
2. Tap **Notifications**
3. Check: Is **"Allow Notifications"** turned **ON** or **OFF**?

### If OFF:

**This is the problem!** Firebase Phone Auth REQUIRES notifications.

**Fix**:
1. Turn it ON manually
2. Or delete app and reinstall
3. Tap "Allow" when popup appears

## Step 3: Test Phone Auth & Check Logs

With Console still open:

1. Navigate to sign-in in app
2. Enter phone: `+1 650-555-1234`
3. Click "Send OTP"
4. **Watch console logs**

### ✅ Expected (Working):
```
[Native Auth] 📱 Sending OTP to: +1 650-555-1234
[Native Auth] ℹ️ Waiting for APNs token...
[Native Auth] 📞 Initiating phone verification...
📬 [AppDelegate] Received remote notification
[Native Auth] ✅ OTP sent successfully via native SDK
[Native Auth] Verification ID: AMx...
```

### ❌ If Still Crashing:
```
[Native Auth] 📱 Sending OTP to: +1 650-555-1234
[Native Auth] ℹ️ Waiting for APNs token...
[Native Auth] 📞 Initiating phone verification...
💥 CRASH (no logs after this)
```

## What To Look For

### Scenario A: No APNs Token Logs on Launch

**Problem**: APNs registration is not happening at all

**Cause**: 
- Notification permissions denied
- Or APNs entitlement not properly set

**Fix**: Check notification permissions in Settings

### Scenario B: APNs Token Registered BUT Still Crashes

**Problem**: Firebase can't use the token

**Cause**:
- APNs key mismatch in Firebase Console
- Wrong APNs environment

**Fix**: Verify Firebase Console APNs configuration

### Scenario C: "Failed to Register for Remote Notifications"

**Problem**: iOS is blocking APNs registration

**Cause**:
- Provisioning profile issue
- Entitlements mismatch
- Apple Developer account issue

**Fix**: Check provisioning profile in Xcode

## Quick Test: Explicit Permission Request

Let's add explicit permission request before phone auth to rule out permissions issue.

Add this to your sign-in page:

```typescript
import { PushNotifications } from '@capacitor/push-notifications';

// Add this function
const requestNotificationPermissions = async () => {
  try {
    const result = await PushNotifications.checkPermissions();
    console.log('📱 Current permissions:', result);
    
    if (result.receive !== 'granted') {
      console.log('⚠️ Requesting notification permissions...');
      const requested = await PushNotifications.requestPermissions();
      console.log('📱 Permission result:', requested);
      
      if (requested.receive !== 'granted') {
        alert('Notification permissions are required for phone authentication!');
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.error('❌ Permission check failed:', error);
    return false;
  }
};

// Call this BEFORE sendNativeOtp
const handleSendOTP = async () => {
  // Check/request permissions first
  const hasPermissions = await requestNotificationPermissions();
  if (!hasPermissions) {
    console.error('Cannot send OTP without notification permissions');
    return;
  }
  
  // Then proceed with OTP
  await sendNativeOtp(phoneNumber);
};
```

## Firebase Console Double-Check

### Verify APNs Configuration:

1. Go to: **Firebase Console** → **Project Settings** → **Cloud Messaging**
2. Find your iOS app
3. Under **APNs Authentication Key**:
   - Should show: "Uploaded"
   - Key ID: JUYAM6C4NN (from your .p8 file)
   - Team ID: Should match your Apple Developer Team ID

### Check Phone Provider:

1. Go to: **Firebase Console** → **Authentication** → **Sign-in method**
2. Find **Phone**
3. Should be: **Enabled** (green)

## Next Steps

1. **Connect iPad to Xcode** → Open Console
2. **Launch app** → Check for APNs token logs
3. **Check notification permissions** → Settings → Aasta → Notifications
4. **Test phone auth** → Watch console logs
5. **Report back**: What logs do you see?

---

**Please share the console logs you see when:**
1. App launches
2. You try to send OTP

This will tell us exactly what's failing! 🔍

