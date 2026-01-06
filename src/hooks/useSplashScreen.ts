import { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { SplashScreen } from '@capacitor/splash-screen';

/**
 * useSplashScreen Hook
 * 
 * Manages native splash screen behavior on mobile platforms.
 * Hides the native splash immediately so the animated WebP overlay can take over.
 * 
 * Flow:
 * 1. Native splash shows briefly (should be nearly instant with launchShowDuration: 0)
 * 2. React app starts loading
 * 3. Hide native splash immediately (no delay) - AnimatedSplash component takes over
 * 4. AnimatedSplash shows animated WebP for ~2200ms then fades out
 */
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
          console.log('[SplashScreen] Native splash hidden - AnimatedSplash taking over');
        }
      } catch (error) {
        // Only log errors in development
        if (import.meta.env.DEV) {
          console.error('[SplashScreen] Error hiding:', error);
        }
      }
    };

    // Hide native splash immediately - AnimatedSplash will show the animated WebP
    // No delay needed since native splash should be minimal/instant
    hideSplash();

    return () => {
      // Ensure splash is hidden on unmount (shouldn't happen in normal flow)
      if (!hasHidden) {
        SplashScreen.hide().catch(() => {
          // Silently fail - splash might already be hidden
        });
      }
    };
  }, []);
}

