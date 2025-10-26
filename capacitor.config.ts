import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'food.aasta.app',
  appName: 'aasta',
  webDir: 'public',
  server: {
    // PRODUCTION: Point to Vercel deployment
    // This is the CORRECT approach for Next.js with API routes
    url: 'https://aastadelivery.vercel.app',
    androidScheme: 'https',
    allowNavigation: ['*'],
    cleartext: false,
  },
  android: {
    allowMixedContent: false,
  },
  plugins: {
    FCM: {
      android: {
        channelId: 'food_delivery',
        channelName: "Aasta's Notifications",
        channelDescription: 'Order updates and promotions',
        sound: 'default',
        importance: 'high',
        visibility: 'public',
        icon: 'ic_stat_aasta',
        iconColor: '#ffd500'
      },
      ios: {
        // FCM automatically handles iOS APNs configuration
        // No additional iOS-specific config needed
      }
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert']
    },
    Haptics: {
      android: {
        // Enable haptic feedback on Android
        enabled: true
      },
      ios: {
        // Enable haptic feedback on iOS
        enabled: true
      }
    },
    SplashScreen: {
      launchShowDuration: 0,
      launchAutoHide: true,
      backgroundColor: "#002a01",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
      androidSpinnerStyle: "large",
      iosSpinnerStyle: "small",
      spinnerColor: "#d1f86a",
      splashFullScreen: true,
      splashImmersive: true,
      layoutName: "launch_screen",
      useDialog: true
    }
  }
};

export default config;
