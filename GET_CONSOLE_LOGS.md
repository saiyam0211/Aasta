# 🔍 GET CONSOLE LOGS - Critical Diagnostic

Notification permissions are ON and you're on latest build, but still crashing.

**We NEED to see console logs to find the issue!**

## Step-by-Step: Get Console Logs

### 1. Connect iPad to Mac

Use USB cable to connect your iPad to your Mac

### 2. Open Xcode Console

```
1. Open Xcode (if not already open)
2. Menu: Window → Devices and Simulators
3. Left sidebar: Select your iPad
4. Bottom right: Click "Open Console" button
```

A console window will open showing live logs from your iPad.

### 3. Clear Console & Launch App

```
1. In Console window: Click the trash icon (🗑️) to clear old logs
2. On iPad: Launch Aasta from TestFlight
3. Watch the console for logs
```

### 4. Look for APNs Logs

**Copy/paste everything between app launch and when you see these:**

Look for lines starting with:
- `📱 [AppDelegate]`
- `🔥 Firebase`
- `FirebaseAuth`
- `APNs`
- `Push Notifications`

### 5. Test Phone Auth

```
1. Keep console open
2. Navigate to sign-in
3. Enter: +1 650-555-1234
4. Click "Send OTP"
5. Copy all logs that appear
```

## What We're Looking For

### ✅ Expected (If APNs is working):
```
📱 [AppDelegate] APNs token registered successfully
📱 [AppDelegate] Token: ab12cd34ef56789...
📱 [AppDelegate] Using SANDBOX APNs token (for TestFlight)
```

### ❌ If APNs Registration Fails:
```
❌ [AppDelegate] Failed to register for remote notifications: ...
```

### ❌ If No APNs Logs At All:
This means `registerForRemoteNotifications()` isn't being called

### ❌ If Firebase Error:
```
FirebaseAuth: Error...
```

## Alternative: Test on Real Device Build

If you can't get console logs, let's try running directly from Xcode instead of TestFlight:

### Run from Xcode (With Full Console):

```bash
# Open in Xcode
npx cap open ios
```

Then in Xcode:
1. Select your iPad as the target device (top toolbar)
2. Click ▶️ Run button (or press ⌘R)
3. App will install and run on your iPad
4. Console appears automatically in bottom panel
5. Watch for logs as app launches
6. Try phone auth and watch logs

This gives you FULL console output in Xcode's debug area!

## Possible Issues (Based on Symptoms)

Since notifications are ON but still crashing:

### Issue 1: APNs Token Never Arrives
**Symptom**: No APNs logs at all
**Cause**: Registration code not running
**Check**: Make sure AppDelegate.swift has the changes

### Issue 2: APNs Token Arrives but Wrong Type
**Symptom**: Logs show token, but then crash
**Cause**: Token type still wrong somehow
**Check**: Should say "Using SANDBOX APNs token"

### Issue 3: Firebase Can't Verify
**Symptom**: APNs token logged but Firebase error
**Cause**: APNs key mismatch in Firebase Console
**Check**: Firebase Console → Cloud Messaging → APNs key

### Issue 4: Provisioning Profile Issue
**Symptom**: "Failed to register" error
**Cause**: Provisioning profile doesn't have Push Notifications
**Check**: Xcode → Signing & Capabilities

## Quick Verification

Let's verify the AppDelegate changes are actually there:

```bash
cd /Users/saiyam0211/Desktop/Aasta/main
cat ios/App/App/AppDelegate.swift | grep -A 10 "didRegisterForRemoteNotificationsWithDeviceToken"
```

Should show:
```swift
func application(_ application: UIApplication, didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data) {
    print("📱 [AppDelegate] APNs token registered successfully")
    print("📱 [AppDelegate] Token: \(deviceToken.map { String(format: "%02.2hhx", $0) }.joined())")
    
    Auth.auth().setAPNSToken(deviceToken, type: .sandbox)
    print("📱 [AppDelegate] Using SANDBOX APNs token (for TestFlight)")
}
```

## What To Share

Please share:

1. **Console logs from app launch** (look for 📱 [AppDelegate] lines)
2. **Console logs when clicking "Send OTP"** (all logs that appear)
3. **Any error messages** you see in console

OR

Just run from Xcode (▶️ button) and share what appears in the debug console!

---

**Without console logs, we're flying blind!** 

The logs will tell us exactly what's failing. 🔍

