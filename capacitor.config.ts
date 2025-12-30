import { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.coupons.app",
  appName: "كوبونات",
  webDir: "dist",
  server: {
    androidScheme: "https",
    iosScheme: "https",
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 0, // Instant - user should never see native splash
      launchAutoHide: true, // Auto-dismiss immediately
      backgroundColor: "#000000", // Plain black - no branding
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_INSIDE", // Doesn't matter since it's instant
      showSpinner: false,
      androidSpinnerStyle: "large",
      iosSpinnerStyle: "small",
      spinnerColor: "#ffffff",
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      style: "DARK",
      backgroundColor: "#7c3aed",
    },
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"],
    },
    Keyboard: {
      resize: "ionic",
      style: "dark",
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
    contentInset: "automatic",
    scrollEnabled: true,
  },
};

export default config;
