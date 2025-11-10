# 🔐 Session Persistence - Stay Logged In

## Summary

Users will stay logged in even after:
- ✅ Closing the Capacitor app
- ✅ Removing app from recent apps
- ✅ Device restart
- ✅ App update

Users will only be logged out if:
- ❌ They explicitly click "Logout"
- ❌ They clear app data (Settings → Apps → Aasta → Clear Data)
- ❌ Session expires after 30 days of inactivity

---

## How It Works

### 1. Firebase Auth Persistence (LOCAL)

```typescript
// src/lib/firebase-client.ts
setPersistence(auth, browserLocalPersistence)
```

**What this does:**
- Stores Firebase Auth state in **IndexedDB/LocalStorage**
- Persists across app restarts
- Survives app being removed from recent apps
- Survives device reboots

**Without this:** User would be logged out on every app restart.

---

### 2. NextAuth JWT Session (30 Days)

```typescript
// src/lib/auth.ts
session: {
  strategy: 'jwt',
  maxAge: 30 * 24 * 60 * 60, // 30 days
}
```

**What this does:**
- Creates a JWT token stored in cookies
- Token is valid for **30 days**
- Automatically refreshed on each request
- Secure HttpOnly cookie (can't be accessed by JavaScript)

**Without this:** Session would expire after default 24 hours.

---

### 3. Cookie Configuration

```typescript
// src/lib/auth.ts
cookies: {
  sessionToken: {
    name: `next-auth.session-token`,
    options: {
      httpOnly: true,          // Secure (no JS access)
      sameSite: 'lax',         // CSRF protection
      path: '/',               // Available everywhere
      secure: true,            // HTTPS only (production)
      maxAge: 30 * 24 * 60 * 60, // 30 days
    },
  },
}
```

**What this does:**
- Stores session token in cookies
- Cookies persist across app restarts
- Capacitor WebView maintains cookies
- Secure configuration prevents attacks

---

## User Flow

### Scenario 1: Normal App Usage ✅
```
User logs in
  ↓
Uses app
  ↓
Closes app (swipe away)
  ↓
Opens app next day
  ↓
✅ Still logged in! (sees home screen)
```

### Scenario 2: Device Restart ✅
```
User logs in
  ↓
Device restarts
  ↓
Opens app
  ↓
✅ Still logged in! (sees home screen)
```

### Scenario 3: App Update ✅
```
User logs in
  ↓
App updates (from TestFlight/Play Store)
  ↓
Opens updated app
  ↓
✅ Still logged in! (sees home screen)
```

### Scenario 4: Explicit Logout ❌
```
User logs in
  ↓
User clicks "Logout"
  ↓
Opens app later
  ↓
❌ Logged out (sees sign-in screen)
```

### Scenario 5: Clear Data ❌
```
User logs in
  ↓
User clears app data (Settings)
  ↓
Opens app
  ↓
❌ Logged out (sees sign-in screen)
```

### Scenario 6: 30 Days Inactivity ❌
```
User logs in
  ↓
Doesn't open app for 30+ days
  ↓
Opens app
  ↓
❌ Session expired (sees sign-in screen)
```

---

## Technical Details

### Where Session Data is Stored

#### 1. Firebase Auth State
- **Location**: IndexedDB (`firebaseLocalStorageDb`)
- **Persistence**: LOCAL (survives app restart)
- **Contains**: Firebase user ID, phone number, auth token
- **Platform**: Web, iOS, Android

#### 2. NextAuth Session Token
- **Location**: Cookies (`next-auth.session-token`)
- **Persistence**: 30 days or until cleared
- **Contains**: JWT with user ID, email, phone, role
- **Platform**: Web, iOS, Android (Capacitor WebView)

#### 3. Native Firebase Auth (iOS Only)
- **Location**: iOS Keychain
- **Persistence**: Until app uninstall or explicit logout
- **Contains**: Firebase credentials
- **Platform**: iOS only (when using native auth)

---

## Testing Session Persistence

### Test 1: Close and Reopen
```bash
1. Sign in to the app
2. Use app normally
3. Close app (swipe from recent apps)
4. Wait 5 minutes
5. Reopen app
✅ Should be logged in automatically
```

### Test 2: Remove from Recent Apps
```bash
1. Sign in to the app
2. Close app
3. Remove from recent apps
4. Reopen app
✅ Should be logged in automatically
```

### Test 3: Device Restart
```bash
1. Sign in to the app
2. Restart device
3. Open app
✅ Should be logged in automatically
```

### Test 4: App Update
```bash
1. Sign in to the app
2. Update app (TestFlight/Play Store)
3. Open updated app
✅ Should be logged in automatically
```

### Test 5: Explicit Logout
```bash
1. Sign in to the app
2. Click "Logout" button
3. Reopen app
❌ Should see sign-in screen
```

---

## Debugging Session Issues

### Check Firebase Auth State

Open Chrome DevTools (chrome://inspect on Android):

```javascript
// In Console:
console.log('Firebase Auth State:', firebase.auth().currentUser)
```

**Expected:**
- If logged in: `{ uid: '...', phoneNumber: '+91...' }`
- If logged out: `null`

---

### Check NextAuth Session

```javascript
// In Console:
fetch('/api/auth/session')
  .then(r => r.json())
  .then(console.log)
```

**Expected:**
- If logged in: `{ user: { email, phone, name }, expires }`
- If logged out: `{}`

---

### Check Cookies

```javascript
// In Console:
console.log(document.cookie)
```

**Expected:**
- Should see: `next-auth.session-token=...`
- If missing → session cookie was cleared

---

### Check IndexedDB

```javascript
// In Chrome DevTools:
// Application tab → IndexedDB → firebaseLocalStorageDb
```

**Expected:**
- Should see Firebase auth data
- If empty → Firebase persistence not working

---

## Common Issues and Fixes

### Issue 1: Logged Out After App Restart

**Cause**: Firebase persistence not set or cookies not persisting

**Fix**: Already fixed in `firebase-client.ts`:
```typescript
setPersistence(auth, browserLocalPersistence)
```

---

### Issue 2: Logged Out After 24 Hours

**Cause**: Default NextAuth session expiry

**Fix**: Already fixed in `auth.ts`:
```typescript
maxAge: 30 * 24 * 60 * 60 // 30 days
```

---

### Issue 3: Session Lost on iOS

**Cause**: iOS WebView clearing cookies

**Fix**: Already handled - using native auth on iOS + IndexedDB

---

### Issue 4: Session Lost After App Update

**Cause**: App data not preserved during update

**Fix**: Sessions should persist - if not, check:
1. Capacitor WebView settings
2. iOS/Android manifest permissions
3. Cookie secure flag (should be false for local testing)

---

## Security Notes

### Session Token Security

- ✅ **HttpOnly**: JavaScript can't access token
- ✅ **SameSite: lax**: CSRF protection
- ✅ **Secure (production)**: HTTPS only
- ✅ **MaxAge**: Auto-expires after 30 days

### Firebase Auth Security

- ✅ **Token rotation**: Tokens refresh automatically
- ✅ **Keychain (iOS)**: Secure credential storage
- ✅ **Local storage**: Encrypted on device

---

## Configuration Summary

| Setting | Value | Purpose |
|---------|-------|---------|
| Firebase Persistence | `browserLocalPersistence` | Survives app restart |
| Session Strategy | `jwt` | Client-side token |
| Session MaxAge | 30 days | Long-term login |
| Cookie MaxAge | 30 days | Matches session |
| Cookie HttpOnly | `true` | Security |
| Cookie SameSite | `lax` | CSRF protection |
| Cookie Secure | `prod only` | HTTPS only |

---

## Deployment Checklist

✅ Firebase persistence configured  
✅ NextAuth session 30 days  
✅ Cookie configuration set  
✅ Native auth persistence (iOS)  
✅ Tested on Android  
✅ Tested on iOS  
✅ Tested app restart  
✅ Tested device reboot  
✅ Tested app update  

---

**Your users will stay logged in! 🎉**

No more annoying re-login after closing the app!

