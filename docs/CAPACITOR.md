# Capacitor Integration Guide

This document explains how Capacitor is integrated with the Next.js application to create native Android and iOS mobile apps.

## Overview

Aasta uses **Capacitor 7.4.2** to wrap the Next.js web application as native mobile apps. The app runs as a WebView that loads the Next.js application from the production Vercel deployment.

## Architecture

### How It Works

1. **Next.js App**: The main application is built and deployed to Vercel
2. **Capacitor Wrapper**: Native Android/iOS apps use Capacitor to create a WebView
3. **WebView Loading**: The WebView loads the Next.js app from the Vercel URL
4. **Native Plugins**: Capacitor plugins provide native functionality (push notifications, geolocation, etc.)

### Configuration

The Capacitor configuration is in `capacitor.config.ts`:

```typescript
{
  appId: 'food.aasta.app',
  appName: 'aasta',
  webDir: 'public',
  server: {
    url: 'https://aastadelivery.vercel.app', // Production URL
    androidScheme: 'https',
    allowNavigation: ['*'],
    cleartext: false,
  }
}
```

**Key Points:**
- `webDir: 'public'` - Points to the Next.js `public` directory
- `server.url` - Points to the production Vercel deployment
- The app loads the web version, not a local build

---

## Prerequisites

### For Android Development

- **Android Studio** (latest version)
- **Java Development Kit (JDK)** 17 or higher
- **Android SDK** (installed via Android Studio)
- **Gradle** (comes with Android Studio)

### For iOS Development (macOS only)

- **Xcode** (latest version)
- **CocoaPods** (`sudo gem install cocoapods`)
- **macOS** (required for iOS development)

### General Requirements

- **Node.js** 20+ and npm/pnpm
- **Capacitor CLI**: `npm install -g @capacitor/cli`

---

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
# or
pnpm install
```

### 2. Build Next.js Application

```bash
npm run build
```

This creates an optimized production build in the `.next` directory and copies static assets to the `public` directory.

### 3. Sync with Capacitor

```bash
npx cap sync
```

This command:
- Copies the web assets to native projects
- Updates native dependencies
- Syncs plugin configurations

---

## Android Development

### Initial Setup

1. **Open Android Studio**
   ```bash
   npx cap open android
   ```

2. **Configure Android SDK**
   - Open Android Studio
   - Go to `File > Settings > Appearance & Behavior > System Settings > Android SDK`
   - Ensure Android SDK Platform 33+ is installed
   - Install Android SDK Build-Tools

3. **Set up Gradle**
   - Gradle is automatically configured
   - Sync project if prompted

### Building Android App

#### Development Build

1. **Build and sync**:
   ```bash
   npm run build:mobile
   # or
   npm run build:android
   ```

2. **Open in Android Studio**:
   ```bash
   npx cap open android
   ```

3. **Run on device/emulator**:
   - Connect Android device via USB (enable USB debugging)
   - Or start an Android emulator
   - Click "Run" in Android Studio

#### Production Build (APK/AAB)

1. **Generate signing key** (if not already done):
   ```bash
   keytool -genkey -v -keystore android/app/aasta-release.keystore \
     -alias aasta -keyalg RSA -keysize 2048 -validity 10000
   ```

2. **Configure signing** in `android/app/build.gradle`:
   ```gradle
   android {
       signingConfigs {
           release {
               storeFile file('aasta-release.keystore')
               storePassword 'your-password'
               keyAlias 'aasta'
               keyPassword 'your-password'
           }
       }
       buildTypes {
           release {
               signingConfig signingConfigs.release
           }
       }
   }
   ```

3. **Build release APK**:
   - In Android Studio: `Build > Generate Signed Bundle / APK`
   - Select "APK" or "Android App Bundle"
   - Choose release keystore
   - Build

4. **Build release AAB** (for Play Store):
   ```bash
   cd android
   ./gradlew bundleRelease
   ```
   Output: `android/app/build/outputs/bundle/release/app-release.aab`

### Android Project Structure

```
android/
├── app/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/food/aasta/app/
│   │   │   │   ├── MainActivity.java
│   │   │   │   └── NotificationStyler.kt
│   │   │   ├── AndroidManifest.xml
│   │   │   └── res/          # Resources (icons, splash screens)
│   │   └── build.gradle
│   └── build.gradle
├── build.gradle
└── settings.gradle
```

### Android-Specific Configuration

#### Permissions (`AndroidManifest.xml`)

The app requires these permissions:
- Internet access
- Location services
- Push notifications
- Camera (if needed for future features)

#### Firebase Configuration

1. Download `google-services.json` from Firebase Console
2. Place in `android/app/`
3. Sync Gradle files

#### Notification Icons

Custom notification icons are in:
- `android/app/src/main/res/drawable/ic_stat_aasta.png`
- `android/app/src/main/res/drawable/ic_stat_notification.xml`

---

## iOS Development

### Initial Setup

1. **Install CocoaPods dependencies**:
   ```bash
   cd ios/App
   pod install
   ```

2. **Open Xcode**:
   ```bash
   npx cap open ios
   ```

3. **Configure signing**:
   - Select project in Xcode
   - Go to "Signing & Capabilities"
   - Select your development team
   - Enable "Automatically manage signing"

### Building iOS App

#### Development Build

1. **Build and sync**:
   ```bash
   npm run build:mobile
   # or
   npm run build:ios
   ```

2. **Open in Xcode**:
   ```bash
   npx cap open ios
   ```

3. **Run on device/simulator**:
   - Select target device/simulator
   - Click "Run" (⌘R)

#### Production Build (App Store)

1. **Update version** in Xcode:
   - Select project
   - Update "Version" and "Build" numbers

2. **Archive**:
   - In Xcode: `Product > Archive`
   - Wait for archive to complete

3. **Distribute**:
   - Click "Distribute App"
   - Choose distribution method (App Store, Ad Hoc, Enterprise)
   - Follow prompts

### iOS Project Structure

```
ios/
├── App/
│   ├── App/
│   │   ├── AppDelegate.swift
│   │   ├── Info.plist
│   │   ├── GoogleService-Info.plist
│   │   └── public/          # Web assets
│   ├── App.xcodeproj/
│   ├── App.xcworkspace/
│   └── Podfile
└── Pods/                     # CocoaPods dependencies
```

### iOS-Specific Configuration

#### Info.plist

Key configurations:
- `NSLocationWhenInUseUsageDescription` - Location permission
- `NSLocationAlwaysUsageDescription` - Background location
- `NSUserNotificationsUsageDescription` - Push notifications

#### Firebase Configuration

1. Download `GoogleService-Info.plist` from Firebase Console
2. Place in `ios/App/App/`
3. Add to Xcode project

#### App Icons

App icons are in:
- `ios/App/App/Assets.xcassets/AppIcon.appiconset/`

---

## Capacitor Plugins

The app uses the following Capacitor plugins:

### Core Plugins

- **@capacitor/app** - App lifecycle and state
- **@capacitor/browser** - In-app browser
- **@capacitor/core** - Core Capacitor functionality

### Platform Plugins

- **@capacitor/android** - Android platform
- **@capacitor/ios** - iOS platform

### Feature Plugins

- **@capacitor-firebase/authentication** - Firebase phone authentication
- **@capacitor-community/fcm** - Firebase Cloud Messaging
- **@capacitor/push-notifications** - Push notifications
- **@capacitor/local-notifications** - Local notifications
- **@capacitor/geolocation** - Location services
- **@capacitor/haptics** - Haptic feedback
- **@capacitor/splash-screen** - Splash screen management
- **@capacitor/status-bar** - Status bar customization

### Plugin Configuration

Plugin configurations are in `capacitor.config.ts`:

```typescript
plugins: {
  FirebaseAuthentication: {
    skipNativeAuth: false,
    providers: ['phone'],
  },
  FCM: {
    android: {
      channelId: 'food_delivery',
      channelName: "Aasta's Notifications",
      // ... more config
    },
  },
  PushNotifications: {
    presentationOptions: ['badge', 'sound', 'alert']
  },
  Haptics: {
    android: { enabled: true },
    ios: { enabled: true }
  },
  SplashScreen: {
    launchShowDuration: 0,
    launchAutoHide: true,
    backgroundColor: "#002a01",
    // ... more config
  }
}
```

---

## Development Workflow

### Local Development

For local development with live reload:

1. **Start Next.js dev server**:
   ```bash
   npm run dev
   ```

2. **Update Capacitor config** (temporarily):
   ```typescript
   server: {
     url: 'http://localhost:3000',
     androidScheme: 'http',
   }
   ```

3. **Sync and run**:
   ```bash
   npx cap sync
   npx cap open android  # or ios
   ```

**Note**: For Android, you may need to configure network security to allow HTTP on localhost.

### Production Workflow

1. **Deploy Next.js app to Vercel**
2. **Build and sync**:
   ```bash
   npm run build:mobile
   ```
3. **Open native IDE and build**:
   ```bash
   npx cap open android  # or ios
   ```

---

## Common Commands

### Build Commands

```bash
# Build Next.js app
npm run build

# Build and sync with Capacitor
npm run build:mobile

# Build and open Android Studio
npm run build:android

# Build and open Xcode
npm run build:ios
```

### Capacitor Commands

```bash
# Sync web assets to native projects
npx cap sync

# Sync Android only
npx cap sync android

# Sync iOS only
npx cap sync ios

# Open Android Studio
npx cap open android

# Open Xcode
npx cap open ios

# Copy web assets only (faster)
npx cap copy

# Update native dependencies
npx cap update
```

### Platform-Specific Commands

#### Android

```bash
# Run on connected device
cd android
./gradlew installDebug

# Build release APK
./gradlew assembleRelease

# Build release AAB
./gradlew bundleRelease
```

#### iOS

```bash
# Install CocoaPods dependencies
cd ios/App
pod install

# Update CocoaPods
pod update
```

---

## Troubleshooting

### Android Issues

#### Build Errors

1. **Gradle sync failed**:
   - Check internet connection
   - Invalidate caches: `File > Invalidate Caches / Restart`
   - Clean project: `Build > Clean Project`

2. **SDK not found**:
   - Install required SDK versions in Android Studio
   - Check `local.properties` has correct SDK path

3. **Signing errors**:
   - Verify keystore file exists
   - Check keystore passwords in `build.gradle`

#### Runtime Issues

1. **App crashes on launch**:
   - Check logs: `adb logcat`
   - Verify `capacitor.config.json` is synced
   - Check network permissions

2. **WebView not loading**:
   - Check `server.url` in config
   - Verify network connectivity
   - Check `allowNavigation` settings

### iOS Issues

#### Build Errors

1. **CocoaPods errors**:
   ```bash
   cd ios/App
   pod deintegrate
   pod install
   ```

2. **Signing errors**:
   - Select development team in Xcode
   - Enable "Automatically manage signing"
   - Check bundle identifier matches

3. **Swift version errors**:
   - Update Xcode to latest version
   - Check Swift version in project settings

#### Runtime Issues

1. **App crashes on launch**:
   - Check device logs in Xcode
   - Verify `GoogleService-Info.plist` is present
   - Check Info.plist permissions

2. **WebView not loading**:
   - Check `server.url` in config
   - Verify App Transport Security settings
   - Check network permissions

### General Issues

#### Assets Not Updating

1. **Clear Capacitor cache**:
   ```bash
   rm -rf android/app/src/main/assets/public
   rm -rf ios/App/App/public
   npx cap sync
   ```

2. **Rebuild**:
   ```bash
   npm run build
   npx cap sync
   ```

#### Plugin Not Working

1. **Reinstall plugin**:
   ```bash
   npm uninstall @capacitor/plugin-name
   npm install @capacitor/plugin-name
   npx cap sync
   ```

2. **Check plugin configuration** in `capacitor.config.ts`

3. **Verify native code** was generated correctly

---

## Deployment

### Android (Google Play Store)

1. **Build release AAB**:
   ```bash
   cd android
   ./gradlew bundleRelease
   ```

2. **Upload to Play Console**:
   - Go to Google Play Console
   - Create new release
   - Upload `app-release.aab`
   - Complete store listing
   - Submit for review

### iOS (App Store)

1. **Archive in Xcode**:
   - `Product > Archive`
   - Wait for completion

2. **Distribute**:
   - Click "Distribute App"
   - Choose "App Store Connect"
   - Follow prompts
   - Submit for review

### TestFlight (iOS)

1. **Archive and distribute** as above
2. **Select "TestFlight & App Store"**
3. **Upload to TestFlight**
4. **Add testers** in App Store Connect

---

## Best Practices

1. **Always sync after changes**:
   - After updating `capacitor.config.ts`
   - After adding/removing plugins
   - After building Next.js app

2. **Test on real devices**:
   - Emulators/simulators don't fully represent real device behavior
   - Test push notifications on real devices
   - Test location services on real devices

3. **Version management**:
   - Update version numbers before each release
   - Use semantic versioning
   - Keep Android and iOS versions in sync

4. **Security**:
   - Never commit keystore files
   - Use environment variables for sensitive config
   - Keep Firebase config files secure

5. **Performance**:
   - Optimize Next.js build for mobile
   - Use image optimization
   - Minimize bundle size

---

## Additional Resources

- [Capacitor Documentation](https://capacitorjs.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Android Developer Guide](https://developer.android.com/)
- [iOS Developer Guide](https://developer.apple.com/documentation/)

---

## Support

For issues or questions:
1. Check Capacitor documentation
2. Review plugin-specific documentation
3. Check GitHub issues
4. Contact the development team

