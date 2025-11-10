#!/bin/bash

# Rebuild Android app after adding SHA fingerprints to Firebase

echo "🤖 Rebuilding Android app with new Firebase config..."

cd /Users/saiyam0211/Desktop/Aasta/main

# Sync Capacitor
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm use 20

echo "📱 Syncing Capacitor..."
npx cap sync android

echo "✅ Done! Now:"
echo ""
echo "1. Open Android Studio:"
echo "   npx cap open android"
echo ""
echo "2. In Android Studio:"
echo "   - Build → Clean Project"
echo "   - Build → Rebuild Project"
echo "   - Run (▶️ button)"
echo ""
echo "3. Test with YOUR real phone number!"
echo ""

