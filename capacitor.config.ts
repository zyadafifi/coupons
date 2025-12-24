import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.coupons.app',
  appName: 'كوبونات',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    iosScheme: 'https',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#7c3aed',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_INSIDE', // Changed from CENTER_CROP to prevent logo cropping
      showSpinner: false,
      androidSpinnerStyle: 'large',
      iosSpinnerStyle: 'small',
      spinnerColor: '#ffffff',
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#7c3aed',
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
    Keyboard: {
      resize: 'ionic',
      style: 'dark',
      resizeOnFullScreen: true,
    },
    App: {
      // Deep linking configuration
    },
  },
  android: {
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: true,
  },
  ios: {
    contentInset: 'automatic',
    scrollEnabled: true,
  },
};

export default config;

