import type {CapacitorConfig} from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'al.oneAcre.sera',
  appName: 'Sera',
  webDir: 'dist/sera/browser',
  plugins: {
    CapacitorHttp: {
      enabled: true
    }
  },
  server: {
    url: 'http://192.168.1.11:4200',
    cleartext: true,
  }
};

export default config;
