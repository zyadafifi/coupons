import { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { SplashScreen } from '@capacitor/splash-screen';

export function useSplashScreen() {
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    let hasHidden = false;

    const hideSplash = async () => {
      // Prevent double-hide
      if (hasHidden) return;
      
      try {
        await SplashScreen.hide();
        hasHidden = true;
        
        // Log only in development
        if (import.meta.env.DEV) {
          console.log('[SplashScreen] Hidden successfully');
        }
      } catch (error) {
        // Only log errors in development
        if (import.meta.env.DEV) {
          console.error('[SplashScreen] Error hiding:', error);
        }
      }
    };

    // Wait for app to be ready before hiding
    // The splash will auto-hide after 2000ms (set in capacitor.config.ts)
    // But we can manually hide it sooner once the app is actually rendered
    // Increased from 500ms to 1500ms to ensure smooth transition
    const timer = setTimeout(hideSplash, 1500);

    return () => {
      clearTimeout(timer);
      // Ensure splash is hidden on unmount (shouldn't happen in normal flow)
      if (!hasHidden) {
        SplashScreen.hide().catch(() => {
          // Silently fail - splash might already be hidden
        });
      }
    };
  }, []);
}

