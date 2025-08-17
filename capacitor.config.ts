import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'food.aasta.app',
  appName: 'aasta',
  webDir: 'public',
  server: {
    url: 'https://aasta.food',
    cleartext: false,
  },
  android: {
    allowMixedContent: false,
  },
};

export default config;
