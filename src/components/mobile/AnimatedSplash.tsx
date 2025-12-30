import { useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';

interface AnimatedSplashProps {
  /**
   * Optional: Control when the splash should hide based on app readiness
   * If not provided, will auto-hide after ~2200ms
   */
  isReady?: boolean;
}

/**
 * AnimatedSplash
 * 
 * A full-screen animated WebP splash overlay that appears ONLY on native platforms.
 * Shows immediately on app start, replacing the old splash design.
 * 
 * Features:
 * - Full-screen fixed overlay with highest z-index
 * - Animated WebP from /splash-animation.webp
 * - Black background (#000000)
 * - Auto-hides after 2200ms or when isReady prop is true
 * - Smooth fade-out transition (250ms)
 * - Does NOT appear on web builds
 */
export function AnimatedSplash({ isReady = false }: AnimatedSplashProps) {
  const [fading, setFading] = useState(false);
  const [mounted, setMounted] = useState(true);
  const [mountTime] = useState(() => Date.now());

  useEffect(() => {
    // Only show on native platforms
    if (!Capacitor.isNativePlatform()) {
      setMounted(false);
      return;
    }

    // Preload the image to avoid flicker
    const img = new Image();
    img.src = '/splash-animation.webp';

    // Start fade-out after 2200ms or when ready
    const startFadeOut = () => {
      const elapsed = Date.now() - mountTime;
      const remaining = Math.max(0, 2200 - elapsed);

      setTimeout(() => {
        setFading(true);
        // Remove from DOM after fade completes
        setTimeout(() => {
          setMounted(false);
        }, 250);
      }, remaining);
    };

    // If isReady is provided and true, start fade immediately (with min time)
    if (isReady) {
      startFadeOut();
      return;
    }

    // Otherwise, auto-hide after 2200ms
    const autoHideTimer = setTimeout(() => {
      startFadeOut();
    }, 2200);

    return () => {
      clearTimeout(autoHideTimer);
    };
  }, [isReady, mountTime]);

  // Don't render anything if not mounted or not native platform
  if (!mounted || !Capacitor.isNativePlatform()) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center"
      style={{
        backgroundColor: '#000000',
        pointerEvents: 'all',
        transition: 'opacity 250ms ease-out',
        opacity: fading ? 0 : 1,
      }}
    >
      <img
        src="/splash-animation.webp"
        alt="Loading"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
        }}
      />
    </div>
  );
}

