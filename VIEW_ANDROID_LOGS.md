# 📱 How to View Android Console Logs

## 🥇 Method 1: Chrome DevTools (EASIEST & RECOMMENDED!)

### Step 1: Enable USB Debugging on Android

1. On your Android device, go to **Settings**
2. Scroll to **About phone** (or **About device**)
3. Find **Build number** and tap it **7 times**
4. You'll see "You are now a developer!"
5. Go back to Settings
6. Find **Developer options** (usually under System)
7. Enable **USB debugging**
8. Tap **OK** when prompted

### Step 2: Connect Device & Open Chrome Inspector

1. **Connect** your Android device to Mac with USB cable
2. On Mac, open **Google Chrome** browser
3. In address bar, go to: `chrome://inspect/#devices`
4. You should see your device name
5. Below it, you'll see running WebViews, including **"Aasta"** or `https://aastadelivery.vercel.app`
6. Click the **"inspect"** button next to it

### Step 3: View Console Logs

A Chrome DevTools window opens - this is your app's console!

- Click **"Console"** tab at the top
- You'll see all JavaScript console logs
- Including our debug logs like `[AUTH]`, `[Native Auth]`, etc.

### Step 4: Test & Capture Logs

1. Keep the Chrome DevTools window open
2. In your Android app, go to sign-in page
3. Enter phone number: `+91 890-182-5390`
4. Click "Send OTP"
5. **Watch the console logs appear in real-time!**

### Step 5: Save/Share Logs

**Option A: Copy-Paste**
- Select all text in console (Cmd+A)
- Copy (Cmd+C)
- Paste in a text file or message

**Option B: Save to File**
- Right-click anywhere in console
- Select **"Save as..."**
- Save as `android-logs.txt`

**Option C: Screenshot**
- Take screenshots of the console (Cmd+Shift+4)

---

## 🥈 Method 2: Android Studio Logcat (Native Logs)

This shows **ALL** Android logs, including native Java/Kotlin logs.

### Step 1: Open Android Studio

```bash
cd /Users/saiyam0211/Desktop/Aasta/main
npx cap open android
```

### Step 2: Run App from Android Studio

1. Make sure your device is connected via USB
2. Select your device from dropdown (top toolbar)
3. Click **▶️ Run** button

### Step 3: Open Logcat

1. At the bottom of Android Studio, click **"Logcat"** tab
2. You'll see ALL system logs

### Step 4: Filter Logs

To see only your app's logs:

**Option A: Filter by Package**
- In Logcat, find the dropdown that says "Show only selected application"
- Select **food.aasta.app**

**Option B: Search**
- In the search box, enter: `chromium` (shows WebView logs)
- Or enter: `[AUTH]` (shows our custom logs)
- Or enter: `[Native Auth]` (shows native Firebase auth logs)

### Step 5: Save Logs

- Right-click in Logcat
- Select **"Save Logcat to File..."**
- Save as `logcat-full.txt`

---

## 🥉 Method 3: Command Line (ADB)

For advanced users who want to see logs without opening any GUI.

### Prerequisites

```bash
# Check if adb is available
adb version

# If not found, add Android SDK to PATH:
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

### View Logs

```bash
# Check if device is connected
adb devices

# Clear old logs
adb logcat -c

# Start viewing logs (all)
adb logcat

# Filter by tag (WebView logs only)
adb logcat chromium:V *:S

# Filter by your app package
adb logcat | grep "food.aasta.app"

# Save logs to file
adb logcat > android-logs.txt
```

---

## 📋 What Logs to Look For

After clicking "Send OTP", you should see:

```
[AUTH] 🚀 Send OTP clicked at 2025-...
[AUTH] 📱 Cleaned phone number: +918901825390
[AUTH] Using native Firebase Auth (no reCAPTCHA)
[Native Auth] 📱 Sending OTP to: +918901825390
[Native Auth] ℹ️ Platform: android
[Native Auth] ℹ️ Waiting for SafetyNet/reCAPTCHA verification...
[Native Auth] 📞 Initiating phone verification...
[Native Auth] Phone number being sent: +918901825390
[Native Auth] Phone number length: 13
[Native Auth] Starts with +: true
[Native Auth] Contains only +digits: true
[Native Auth] ⏳ Phone verification initiated, waiting for SMS...
```

**Key logs to capture:**
- ✅ Cleaned phone number
- ✅ Phone number validation checks
- ✅ Any error messages
- ✅ Response after calling `signInWithPhoneNumber`

---

## 🎯 Quick Comparison

| Method | Pros | Cons | Best For |
|--------|------|------|----------|
| **Chrome DevTools** | ✅ Easy, shows JS logs, real-time | ❌ Only JavaScript logs | **Most users** |
| **Android Studio Logcat** | ✅ All logs (native+JS), powerful filters | ❌ Requires Android Studio open | Debugging crashes |
| **ADB Command** | ✅ Fast, scriptable, no GUI | ❌ Command line only | Advanced users |

---

## 🚀 Recommended: Use Chrome DevTools

**For your case (debugging phone auth), Chrome DevTools is perfect because:**
- ✅ Shows all our `console.log()` statements
- ✅ Shows JavaScript errors
- ✅ Easy to copy-paste
- ✅ Real-time updates
- ✅ No need to rebuild app

---

## 💡 Troubleshooting

### "Device not showing in chrome://inspect"

1. Make sure USB debugging is enabled
2. Disconnect and reconnect USB cable
3. On Android, tap "Allow" when "Allow USB debugging?" prompt appears
4. Try a different USB cable (some cables are charge-only)

### "No WebView showing"

1. Make sure the app is running on your device
2. Make sure you're on a page that uses WebView (the sign-in page)
3. Try closing and reopening the app

### "Logs not appearing"

1. Make sure you're on the "Console" tab in DevTools
2. Check if "Preserve log" is enabled (prevents clearing)
3. Make sure log level is set to "Verbose" (not filtered to "Errors" only)

---

## ⚡ Quick Start Command

Copy-paste this to get set up fast:

```bash
# 1. Make sure device is connected
adb devices

# 2. Open Chrome inspector URL
open "chrome://inspect/#devices"

# 3. In Chrome, click "inspect" next to your app
# 4. Click "Console" tab
# 5. Test in app and watch logs!
```

---

**Use Chrome DevTools (Method 1) - it's the easiest and shows exactly what we need!** 🎯

