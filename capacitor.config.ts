import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'food.aasta.app',
  appName: 'aasta',
  webDir: 'public',
  server: {
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
    }
  }
};

export default config;
