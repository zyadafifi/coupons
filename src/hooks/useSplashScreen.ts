import { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { SplashScreen } from '@capacitor/splash-screen';

export function useSplashScreen() {
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    const hideSplash = async () => {
      try {
        // Hide splash screen after app is loaded
        // The splash screen will auto-hide based on capacitor.config.ts settings
        // But we can manually hide it here for more control
        await SplashScreen.hide();
        console.log('[SplashScreen] Hidden successfully');
      } catch (error) {
        console.error('[SplashScreen] Error hiding:', error);
      }
    };

    // Wait a bit for the app to fully render
    const timer = setTimeout(hideSplash, 500);

    return () => clearTimeout(timer);
  }, []);
}

