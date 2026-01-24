import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/firebase';
import logoImage from '@/assets/logo.webp';

interface Banner {
  id: string;
  imageUrl: string;
  alt: string;
  linkUrl?: string;
  sortOrder: number;
}

interface AppSettings {
  appName: string;
  logoUrl: string;
  banners: Banner[];
}

const defaultSettings: AppSettings = {
  appName: 'قسيمة',
  logoUrl: logoImage,
  banners: [],
};

export function useAppSettings() {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const docRef = doc(db, 'settings', 'app');
    
    const unsubscribe = onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data() as AppSettings;
          console.log('📱 App Settings loaded:', data);
          setSettings(data);
        } else {
          console.log('📱 No settings found, using defaults');
        }
        setLoading(false);
      },
      (err) => {
        // Silently handle permission errors - fallback to defaults
        console.error('📱 Settings load error:', err.message);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { settings, loading, error };
}

export type { AppSettings, Banner };
