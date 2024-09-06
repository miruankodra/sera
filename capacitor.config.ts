import type {CapacitorConfig} from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'al.1Acre.sera',
  appName: 'sera-fe',
  webDir: 'dist/sera-fe/browser',
  plugins: {
    CapacitorHttp: {
      enabled: true
    }
  }
};

export default config;
