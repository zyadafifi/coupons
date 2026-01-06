import { useEffect, useState, useRef } from "react";
import { Capacitor } from "@capacitor/core";

interface AnimatedSplashProps {
  /**
   * Optional: Control when the splash should hide based on app readiness
   * If not provided, will auto-hide after MIN_DURATION (3500ms)
   */
  isReady?: boolean;
}

const MIN_DURATION = 5000; // Minimum time to show splash (ms) - allows animation to complete
const MAX_DURATION = 7000; // Maximum time to show splash (ms) - failsafe
const FADE_OUT_DURATION = 250; // Fade-out transition duration (ms)

/**
 * AnimatedSplash
 *
 * A full-screen animated WebP splash overlay that appears ONLY on native platforms.
 * Shows immediately on app start, replacing the old splash design.
 *
 * Features:
 * - Full-screen fixed overlay with highest z-index
 * - Animated WebP from /splash-animation.webp (with @2x support)
 * - Yellow brand background (#FACC15)
 * - Prevents pixelation by not upscaling beyond native resolution
 * - Auto-hides after MIN_DURATION (3500ms) or when isReady prop is true
 * - Smooth fade-out transition (250ms)
 * - Does NOT appear on web builds
 */
export function AnimatedSplash({ isReady = false }: AnimatedSplashProps) {
  const [fading, setFading] = useState(false);
  const [mounted, setMounted] = useState(true);
  const [imageSrc, setImageSrc] = useState("/splash-animation.webp");
  const [imageSize, setImageSize] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const mountTime = useRef(Date.now());
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    // Only show on native platforms
    if (!Capacitor.isNativePlatform()) {
      setMounted(false);
      return;
    }

    // Detect device pixel ratio and check for @2x asset
    const dpr = window.devicePixelRatio || 1;
    const has2x = dpr >= 2;

    // Try to preload @2x version if available
    if (has2x) {
      const img2x = new Image();
      img2x.onload = () => {
        setImageSrc("/splash-animation@2x.webp");
      };
      img2x.onerror = () => {
        // @2x doesn't exist, use regular version
        setImageSrc("/splash-animation.webp");
      };
      img2x.src = "/splash-animation@2x.webp";
    } else {
      // Preload the regular image
      const img = new Image();
      img.src = "/splash-animation.webp";
    }

    // Start fade-out after MIN_DURATION or when ready (whichever is later)
    const startFadeOut = () => {
      const elapsed = Date.now() - mountTime.current;
      const minRemaining = Math.max(0, MIN_DURATION - elapsed);

      // Also respect MAX_DURATION failsafe
      const maxElapsed = Math.min(elapsed, MAX_DURATION);
      const actualRemaining = Math.min(minRemaining, MAX_DURATION - maxElapsed);

      setTimeout(() => {
        setFading(true);
        // Remove from DOM after fade completes
        setTimeout(() => {
          setMounted(false);
        }, FADE_OUT_DURATION);
      }, actualRemaining);
    };

    // If isReady is provided and true, start fade after MIN_DURATION
    if (isReady) {
      startFadeOut();
      return;
    }

    // Otherwise, auto-hide after MIN_DURATION (with MAX_DURATION failsafe)
    const autoHideTimer = setTimeout(() => {
      startFadeOut();
    }, MIN_DURATION);

    // Failsafe: force hide after MAX_DURATION
    const maxDurationTimer = setTimeout(() => {
      setFading(true);
      setTimeout(() => {
        setMounted(false);
      }, FADE_OUT_DURATION);
    }, MAX_DURATION);

    return () => {
      clearTimeout(autoHideTimer);
      clearTimeout(maxDurationTimer);
    };
  }, [isReady]);

  // Handle image load to check dimensions and prevent upscaling
  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    const naturalWidth = img.naturalWidth;
    const naturalHeight = img.naturalHeight;

    setImageSize({ width: naturalWidth, height: naturalHeight });

    // DEV warning if image is too small
    if (import.meta.env.DEV && naturalWidth < 1024) {
      console.warn(
        `[AnimatedSplash] Image is ${naturalWidth}x${naturalHeight}px, which may look pixelated on high-DPI screens. ` +
          `Consider exporting at 1440x1440 or 2048x2048 for better quality. ` +
          `You can also add /splash-animation@2x.webp for high-DPI support.`
      );
    }
  };

  // Don't render anything if not mounted or not native platform
  if (!mounted || !Capacitor.isNativePlatform()) {
    return null;
  }

  // Calculate display size to prevent upscaling
  const dpr = window.devicePixelRatio || 1;
  let displayStyle: React.CSSProperties = {
    objectFit: "contain",
    imageRendering: "auto",
  };

  if (imageSize) {
    // Don't upscale beyond native resolution
    const maxDisplayPx = imageSize.width / dpr;
    displayStyle = {
      ...displayStyle,
      width: `min(90vw, ${maxDisplayPx}px)`,
      height: "auto",
      maxWidth: `${maxDisplayPx}px`,
    };
  } else {
    // Before image loads, use full size but with contain
    displayStyle = {
      ...displayStyle,
      width: "90vw",
      height: "auto",
      maxWidth: "90vw",
    };
  }

  return (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center"
      style={{
        backgroundColor: "#FACC15",
        pointerEvents: "all",
        transition: "opacity 250ms ease-out",
        opacity: fading ? 0 : 1,
      }}
    >
      <img
        ref={imgRef}
        src={imageSrc}
        alt="Loading"
        onLoad={handleImageLoad}
        style={displayStyle}
      />
    </div>
  );
}
