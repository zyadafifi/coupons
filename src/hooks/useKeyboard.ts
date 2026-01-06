import { useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { Keyboard } from '@capacitor/keyboard';

export function useKeyboard() {
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    // Listen for keyboard show event
    const showListener = Keyboard.addListener('keyboardWillShow', (info) => {
      console.log('[Keyboard] Will show with height:', info.keyboardHeight);
      setKeyboardVisible(true);
      setKeyboardHeight(info.keyboardHeight);
    });

    // Listen for keyboard hide event
    const hideListener = Keyboard.addListener('keyboardWillHide', () => {
      console.log('[Keyboard] Will hide');
      setKeyboardVisible(false);
      setKeyboardHeight(0);
    });

    return () => {
      showListener.remove();
      hideListener.remove();
    };
  }, []);

  return { keyboardVisible, keyboardHeight };
}

