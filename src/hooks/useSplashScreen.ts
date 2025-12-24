import { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { SplashScreen } from '@capacitor/splash-screen';

/**
 * useSplashScreen Hook
 * 
 * Manages native splash screen behavior on mobile platforms.
 * Works in coordination with MobileLoadingGate for seamless loading UX:
 * 
 * Flow:
 * 1. Native splash shows immediately on app launch (gradient + logo)
 * 2. React app starts loading
 * 3. After ~300ms, hide native splash (fast transition)
 * 4. MobileLoadingGate (React) takes over showing same design + animated dots
 * 5. After ~1s total or when app ready, loading gate fades out
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
          console.log('[SplashScreen] Native splash hidden - LoadingGate taking over');
        }
      } catch (error) {
        // Only log errors in development
        if (import.meta.env.DEV) {
          console.error('[SplashScreen] Error hiding:', error);
        }
      }
    };

    // Hide native splash quickly (300ms) - LoadingGate will take over
    // This creates a smooth transition: native splash → React LoadingGate
    // LoadingGate shows the same design + animated dots for better UX
    const timer = setTimeout(hideSplash, 300);

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

