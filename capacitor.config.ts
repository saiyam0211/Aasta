import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'food.aasta.app',
  appName: 'aasta',
  webDir: 'public',
  server: {
    url: 'https://aastadelivery.vercel.app',
    cleartext: false,
  },
  android: {
    allowMixedContent: false,
  },
};

export default config;
