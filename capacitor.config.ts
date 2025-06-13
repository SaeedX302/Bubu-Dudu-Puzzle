import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.bubududu.puzzle',
  appName: 'Bubu Dudu Puzzle',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
