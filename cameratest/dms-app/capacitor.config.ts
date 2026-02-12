import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.renault.gaia',
  appName: 'Gaia',
  webDir: 'dist',
  server: {
    // Allow loading from local server on bench
    cleartext: true,
    androidScheme: 'http'
  },
  android: {
    allowMixedContent: true
  }
};

export default config;
