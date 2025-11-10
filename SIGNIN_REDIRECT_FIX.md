# 🔄 Sign-In Redirect Loop - FIXED

## The Problem

After entering OTP and clicking verify, users would:
1. See loading state
2. Get sent to home page briefly
3. Get redirected back to sign-in page
4. **Stuck in loop!**

---

## Root Causes

### Cause 1: Not Checking signIn Response ❌
```typescript
// Before (BAD):
const res = await signIn('phone-otp', {...});
window.location.assign('/'); // Redirects even if sign-in failed!
```

**Problem**: If `signIn()` returns an error or `ok: false`, we were still redirecting to home page, which would then redirect back to sign-in (no session = no auth).

### Cause 2: Database Connection Issues
- Prisma query fails
- User creation fails
- authorize() returns null
- NextAuth returns `{ ok: false }`

### Cause 3: Session Not Set Before Redirect
- Window redirects before cookie is set
- Middleware checks for token before it exists
- Middleware redirects back to sign-in

---

## The Fix

### Fix 1: Check signIn Response ✅

```typescript
// After (GOOD):
const res = await signIn('phone-otp', {...});

// Check for errors
if (res?.error) {
  console.error('[AUTH] ❌ NextAuth signIn error:', res.error);
  setError('Failed to create session. Please try again.');
  return; // STOP! Don't redirect
}

// Check if sign-in succeeded
if (!res?.ok) {
  console.error('[AUTH] ❌ NextAuth signIn not OK:', res);
  setError('Failed to sign in. Please try again.');
  return; // STOP! Don't redirect
}

// Only redirect if successful
console.log('[AUTH] ✅ NextAuth signIn successful, redirecting...');
window.location.assign('/');
```

**Result**: Only redirects if sign-in actually succeeded!

---

## What Happens Now

### Scenario 1: Successful Sign-In ✅
```
User enters OTP
  ↓
Firebase verifies OTP
  ↓
Call NextAuth signIn()
  ↓
Create/find user in database
  ↓
Create session token
  ↓
res = { ok: true, url: '/' }
  ↓
✅ Check passed!
  ↓
Redirect to home page
  ↓
✅ Success! User sees home page
```

### Scenario 2: Database Error ❌ (Now Handled!)
```
User enters OTP
  ↓
Firebase verifies OTP
  ↓
Call NextAuth signIn()
  ↓
Database query fails
  ↓
authorize() returns null
  ↓
res = { ok: false, error: 'CredentialsSignin' }
  ↓
❌ Check failed!
  ↓
Show error: "Failed to sign in. Please try again."
  ↓
✅ Stay on sign-in page (no loop!)
```

### Scenario 3: Session Creation Fails ❌ (Now Handled!)
```
User enters OTP
  ↓
Firebase verifies OTP
  ↓
Call NextAuth signIn()
  ↓
User created but session creation fails
  ↓
res = { ok: false }
  ↓
❌ Check failed!
  ↓
Show error: "Failed to create session. Please try again."
  ↓
✅ Stay on sign-in page (no loop!)
```

---

## Console Logs to Watch For

### ✅ Successful Sign-In:
```
[AUTH] ✅ Web Firebase confirm OK (+234ms)
[AUTH] 🎫 NextAuth signIn completed (+567ms) { ok: true, url: '/', ... }
[AUTH] ✅ NextAuth signIn successful, redirecting...
[AUTH] ↪️ Fallback redirect to home page
```

### ❌ Failed Sign-In (Database Error):
```
[AUTH] ✅ Web Firebase confirm OK (+234ms)
Phone OTP authorize error: PrismaClientKnownRequestError: ...
[AUTH] 🎫 NextAuth signIn completed (+567ms) { ok: false, error: 'CredentialsSignin' }
[AUTH] ❌ NextAuth signIn error: CredentialsSignin
```

### ❌ Failed Sign-In (Session Error):
```
[AUTH] ✅ Web Firebase confirm OK (+234ms)
[AUTH] 🎫 NextAuth signIn completed (+567ms) { ok: false }
[AUTH] ❌ NextAuth signIn not OK: { ok: false }
```

---

## Testing

### Test 1: Normal Sign-In ✅
```bash
1. Enter phone number
2. Click "Send OTP"
3. Enter correct OTP
4. Click "Verify"
✅ Should redirect to home page
✅ Should stay on home page (no loop!)
```

### Test 2: Database Connection Issue ⚠️
```bash
1. Disconnect database (for testing)
2. Enter phone number
3. Click "Send OTP"
4. Enter correct OTP
5. Click "Verify"
✅ Should show error: "Failed to sign in"
✅ Should stay on sign-in page
✅ No redirect loop!
```

### Test 3: Multiple Retries ✅
```bash
1. Sign in fails (error shown)
2. Click "Verify" again
3. Sign in succeeds
✅ Should redirect to home page
✅ No loop!
```

---

## Additional Debugging

If sign-in still fails, check console for:

### 1. Database Connection
```
Phone OTP authorize error: Can't reach database server at ...
```
**Fix**: Check database URL in `.env`

### 2. Prisma Schema Issue
```
Phone OTP authorize error: Unknown field 'phone' on model 'User'
```
**Fix**: Run `npx prisma generate`

### 3. Missing Customer Record
```
Created user: abc123
Error: Foreign key constraint failed
```
**Fix**: Check customer creation code

### 4. Session Token Not Set
```
[AUTH] ✅ NextAuth signIn successful, redirecting...
(redirects to home)
(middleware redirects back to sign-in)
```
**Fix**: Check cookie settings in auth.ts

---

## Middleware Behavior

The middleware checks for a token:

```typescript
// src/middleware.ts
if (!token) {
  // No session = redirect to sign-in
  return NextResponse.redirect('/auth/signin');
}
```

**Important**: This is why we MUST check that sign-in succeeded before redirecting!

If we redirect to home without a session token, middleware will immediately redirect back to sign-in → **LOOP!**

---

## Cookie Debugging

If sign-in succeeds but session is not persisted:

### Check Cookies in Console:
```javascript
// In Chrome DevTools Console:
console.log(document.cookie)

// Expected:
"next-auth.session-token=eyJhbGci..."
```

### If Cookie Missing:
1. Check cookie settings in `auth.ts`
2. Check if `secure: true` and you're on HTTP (should be false for localhost)
3. Check if cookies are blocked
4. Check SameSite settings

---

## Summary of Changes

| File | Change | Purpose |
|------|--------|---------|
| `src/app/auth/signin/page.tsx` | Added `res?.error` check | Stop redirect if sign-in errors |
| `src/app/auth/signin/page.tsx` | Added `!res?.ok` check | Stop redirect if sign-in fails |
| `src/app/auth/signin/page.tsx` | Added detailed logging | Debug sign-in issues |
| `src/app/auth/signin/page.tsx` | Added user-friendly errors | Show "Failed to sign in" message |

---

## Next Steps

1. ⏱️ **Wait 2-3 minutes** for Vercel deployment
2. 📱 **Test sign-in** on Android/iOS
3. ✅ **Verify** you reach home page without loop
4. 🐛 **Check console** for any error messages

---

**The redirect loop is fixed! Users will now see proper error messages if sign-in fails, instead of getting stuck in a loop.** ✅

