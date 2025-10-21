#!/bin/bash

# Production build script for Capacitor apps
# This builds the Next.js app and syncs with Capacitor

echo "🏗️  Building Next.js app for Capacitor..."
pnpm build

echo "📱 Syncing with Capacitor..."
npx cap sync android
npx cap sync ios

echo "✅ Build complete! Open Android Studio or Xcode to build the app:"
echo "   Android: npx cap open android"
echo "   iOS: npx cap open ios"

