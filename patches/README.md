# Patches

This directory contains patches for third-party dependencies.

## firebase-auth-podspec.patch

**Purpose**: Updates the Capacitor Firebase Authentication plugin's podspec to use FirebaseAuth 11.15.0 instead of 11.7.0, resolving version conflicts with the FCM plugin.

**Affected File**: 
```
node_modules/.pnpm/@capacitor-firebase+authentication@7.3.1_@capacitor+core@7.4.3_firebase@12.3.0/node_modules/@capacitor-firebase/authentication/CapacitorFirebaseAuthentication.podspec
```

**Changes**:
- iOS deployment target: 14.0 → 15.0
- FirebaseAuth version: ~> 11.7.0 → ~> 11.15.0

### When to Apply

Apply this patch if you encounter the following error after reinstalling dependencies:

```
[!] CocoaPods could not find compatible versions for pod "FirebaseAuth":
  In Podfile:
    CapacitorFirebaseAuthentication (...) was resolved to 7.3.1, which depends on
      FirebaseAuth (~> 11.7.0)
```

### How to Apply Manually

```bash
# Navigate to project root
cd /Users/saiyam0211/Desktop/Aasta/main

# Apply the patch
patch -p1 < patches/firebase-auth-podspec.patch

# Or manually edit the file:
# 1. Open the podspec file
# 2. Change line 14: s.ios.deployment_target = '15.0'
# 3. Change line 16: s.dependency 'FirebaseAuth', '~> 11.15.0'

# Then reinstall pods
cd ios/App
pod install
```

### Using patch-package (Recommended)

If you want to persist this patch automatically, you can use `patch-package`:

```bash
# Install patch-package
pnpm add -D patch-package

# Add postinstall script to package.json
"scripts": {
  "postinstall": "patch-package"
}

# Generate the patch (after manually editing the file)
npx patch-package @capacitor-firebase/authentication
```

This will create a proper patch file that's automatically applied after `pnpm install`.

