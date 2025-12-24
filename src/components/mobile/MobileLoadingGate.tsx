import { useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';

interface MobileLoadingGateProps {
  /**
   * Optional: Control when the gate should hide based on app readiness
   * If not provided, will auto-hide after ~1000ms
   */
  isReady?: boolean;
  
  /**
   * Optional: Minimum display time in ms (default: 800)
   * Ensures the gate is visible long enough for smooth UX
   */
  minDisplayTime?: number;
}

/**
 * MobileLoadingGate
 * 
 * A premium full-screen loading overlay that appears ONLY on native platforms.
 * Shows after the native splash screen disappears, creating a seamless transition.
 * 
 * Features:
 * - Gradient background matching native splash (#7c3aed → #5b21b6)
 * - Centered yellow logo (brand asset)
 * - Animated 3 dots at bottom (bounce effect)
 * - Auto-hides after app is ready or timeout
 * - Does NOT appear on web builds
 */
export function MobileLoadingGate({ isReady = false, minDisplayTime = 800 }: MobileLoadingGateProps) {
  const [gateVisible, setGateVisible] = useState(true);
  const [mountTime] = useState(() => Date.now());

  useEffect(() => {
    // Only show on native platforms
    if (!Capacitor.isNativePlatform()) {
      setGateVisible(false);
      return;
    }

    // Hide gate when ready, but respect minimum display time
    const hideGate = () => {
      const elapsed = Date.now() - mountTime;
      const remaining = Math.max(0, minDisplayTime - elapsed);

      setTimeout(() => {
        setGateVisible(false);
      }, remaining);
    };

    // If isReady is provided and true, hide immediately (with min time)
    if (isReady) {
      hideGate();
      return;
    }

    // Otherwise, auto-hide after 1000ms + minDisplayTime
    const autoHideTimer = setTimeout(() => {
      hideGate();
    }, 1000);

    return () => {
      clearTimeout(autoHideTimer);
    };
  }, [isReady, minDisplayTime, mountTime]);

  // Don't render anything if not visible
  if (!gateVisible) {
    return null;
  }

  return (
    <div 
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
      style={{
        background: 'linear-gradient(180deg, #7c3aed 0%, #5b21b6 100%)',
      }}
    >
      {/* Centered Logo */}
      <div className="flex-1 flex items-center justify-center">
        <img
          src="https://i.ibb.co/QjTHRZTj/Generated-Image-December-20-2025-8-48-AM-Photoroom.png"
          alt="Logo"
          className="w-48 h-48 object-contain animate-pulse-slow"
          style={{
            animation: 'pulse-slow 2s ease-in-out infinite'
          }}
        />
      </div>

      {/* Animated 3 Dots at Bottom */}
      <div className="mb-16 flex items-center justify-center gap-2">
        <div 
          className="dot-bounce"
          style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            backgroundColor: '#ffc515',
            animation: 'bounce-dot 1.4s infinite ease-in-out',
            animationDelay: '0ms',
          }}
        />
        <div 
          className="dot-bounce"
          style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            backgroundColor: '#ffc515',
            animation: 'bounce-dot 1.4s infinite ease-in-out',
            animationDelay: '150ms',
          }}
        />
        <div 
          className="dot-bounce"
          style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            backgroundColor: '#ffc515',
            animation: 'bounce-dot 1.4s infinite ease-in-out',
            animationDelay: '300ms',
          }}
        />
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes bounce-dot {
          0%, 80%, 100% {
            transform: scale(0.8) translateY(0);
            opacity: 0.7;
          }
          40% {
            transform: scale(1.2) translateY(-12px);
            opacity: 1;
          }
        }

        @keyframes pulse-slow {
          0%, 100% {
            opacity: 0.9;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.02);
          }
        }
      `}</style>
    </div>
  );
}

