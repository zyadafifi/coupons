import { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';

export function useStatusBar() {
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    const setupStatusBar = async () => {
      try {
        // Set status bar style to dark content (for light background)
        await StatusBar.setStyle({ style: Style.Dark });
        
        // Set status bar background color to match app theme
        await StatusBar.setBackgroundColor({ color: '#7c3aed' });
        
        // Show status bar
        await StatusBar.show();
        
        console.log('[StatusBar] Configured successfully');
      } catch (error) {
        console.error('[StatusBar] Error configuring:', error);
      }
    };

    setupStatusBar();
  }, []);
}

