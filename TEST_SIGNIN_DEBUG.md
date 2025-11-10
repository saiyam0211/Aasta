# 🔍 Sign-In Debug Instructions

## Issue: Redirects to Step 1 Instead of Home

You said after entering OTP, it goes back to step 1 instead of home page.

---

## Debug Steps

### Step 1: Check Console Logs

After clicking "Verify OTP", look for these logs in Chrome DevTools:

```
Expected Success Flow:
[AUTH] 🔑 Verify clicked at...
[AUTH] Using web Firebase Auth verification
[AUTH] ✅ Web Firebase confirm OK
[AUTH] 📱 Sending to NextAuth - Phone: +918901825390 Name: YourName
[AUTH] 🎫 NextAuth signIn completed { ok: true, url: '/' }
[AUTH] ✅ NextAuth signIn successful, redirecting...
[AUTH] ↪️ Fallback redirect to home page
```

**What to look for:**

1. **Is phone formatted correctly?**
   ```
   [AUTH] 📱 Sending to NextAuth - Phone: +918901825390
   ```
   - ✅ Should be: `+918901825390` (no spaces/dashes)
   - ❌ NOT: `+91 890-182-5390` (has spaces/dashes)

2. **Is signIn successful?**
   ```
   [AUTH] 🎫 NextAuth signIn completed { ok: true, url: '/' }
   ```
   - ✅ Should have: `ok: true`
   - ❌ NOT: `ok: false` or `error: 'CredentialsSignin'`

3. **Is redirect happening?**
   ```
   [AUTH] ✅ NextAuth signIn successful, redirecting...
   ```
   - ✅ Should see this message
   - ❌ If missing, sign-in failed

---

### Step 2: Check for Errors

Look for these ERROR messages:

```
❌ Bad Signs:
[AUTH] ❌ NextAuth signIn error: CredentialsSignin
[AUTH] ❌ NextAuth signIn not OK: { ok: false }
Phone OTP authorize error: ...
Invalid code, try again
```

**If you see any of these:**
- The sign-in is failing
- Check database connection
- Check console for database errors
- Share the full error message

---

### Step 3: Test with Fresh Data

1. **Clear all app data**
   ```
   Settings → Apps → Aasta → Storage → Clear Data
   ```

2. **Restart app**

3. **Try sign-in again**
   - Enter name
   - Enter phone
   - Get OTP
   - Enter OTP
   - Click Verify

4. **Watch console** for the logs above

---

### Step 4: Share These Logs

Copy and paste these specific logs:

1. **Phone formatting log:**
   ```
   [AUTH] 📱 Sending to NextAuth - Phone: ??? Name: ???
   ```

2. **SignIn result log:**
   ```
   [AUTH] 🎫 NextAuth signIn completed (...) { ??? }
   ```

3. **Any error logs** (if present)

---

## Common Issues

### Issue 1: Phone Number Has Spaces

**Symptom:**
```
[AUTH] 📱 Sending to NextAuth - Phone: +91 890-182-5390
```

**Problem:** Phone still has spaces/dashes

**Fix:** Already deployed - wait 2-3 min for Vercel

**After fix, should see:**
```
[AUTH] 📱 Sending to NextAuth - Phone: +918901825390
```

---

### Issue 2: SignIn Fails (ok: false)

**Symptom:**
```
[AUTH] 🎫 NextAuth signIn completed { ok: false, error: 'CredentialsSignin' }
[AUTH] ❌ NextAuth signIn error: CredentialsSignin
```

**Problem:** Database error or user creation failed

**Check for:**
```
Phone OTP authorize error: PrismaClientKnownRequestError...
```

**Fix:** Check database connection and Prisma schema

---

### Issue 3: No Redirect Message

**Symptom:**
```
[AUTH] ✅ Web Firebase confirm OK
[AUTH] 🎫 NextAuth signIn completed { ok: true }
(No redirect message - stops here)
```

**Problem:** Code is not reaching the redirect logic

**Possible causes:**
- res.ok is false (check actual res object)
- Error thrown before redirect
- Window.location blocked by browser

---

### Issue 4: Redirect Happens But Goes to Step 1

**Symptom:**
```
[AUTH] ↪️ Fallback redirect to home page
(Page loads, then immediately goes back to step 1)
```

**Problem:** Session not being set before redirect

**Check:**
1. Are cookies being set?
   ```javascript
   console.log(document.cookie)
   // Should see: next-auth.session-token=...
   ```

2. Is middleware redirecting back?
   - Middleware checks for token
   - No token = redirect to signin
   - This creates the "back to step 1" effect

**Fix:** Session persistence already configured - might need to wait for cookie to set

---

## Quick Test

### Test with Firebase Test Number

1. **Add test number in Firebase Console:**
   - Phone: `+919999999999`
   - Code: `123456`

2. **Sign in with test number:**
   - Name: Test User
   - Phone: +91 999-999-9999
   - OTP: 123456

3. **Should work without database queries**
   - If this works → Database issue
   - If this fails → Code issue

---

## Next Steps

After checking console logs:

1. ✅ **If phone is formatted correctly** (+918901825390)
   → Check signIn response

2. ✅ **If signIn response is ok: true**
   → Check cookies and session

3. ❌ **If signIn response is ok: false**
   → Check database and share error

4. ❌ **If phone is NOT formatted correctly**
   → Wait for Vercel deployment (2-3 min)

---

## Deployment Status

✅ **Just deployed fix for:**
- Phone number cleaning in verifyOtp
- Now removes spaces/dashes before NextAuth

⏱️ **Wait 2-3 minutes** for Vercel to deploy

Then test again and share console logs!

---

**Please share the console logs after testing!** 🔍

