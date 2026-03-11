import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/firebase';
import { useUserAuth } from '@/contexts/UserAuthContext';

type Language = 'ar' | 'en';

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  favorites: string[];
  toggleFavorite: (couponId: string) => void;
  isFavorite: (couponId: string) => boolean;
  // selectedCountry is now a Firestore document ID (string)
  selectedCountry: string | null;
  setSelectedCountry: (countryId: string) => void;
  showCountryPicker: boolean;
  setShowCountryPicker: (show: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Safe localStorage helpers
const getStoredValue = <T,>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
};

const setStoredValue = <T,>(key: string, value: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Silently fail if localStorage is not available
  }
};

export function AppProvider({ children }: { children: ReactNode }) {
  const { user } = useUserAuth();
  const [language, setLanguage] = useState<Language>(() => 
    getStoredValue<Language>('language', 'ar')
  );
  const [favorites, setFavorites] = useState<string[]>(() => 
    getStoredValue<string[]>('favorites', [])
  );
  // selectedCountry is now a Firestore document ID (string), not CountryCode
  const [selectedCountry, setSelectedCountryState] = useState<string | null>(() => 
    getStoredValue<string | null>('country', null)
  );
  const [showCountryPicker, setShowCountryPicker] = useState(() => 
    !getStoredValue<string | null>('country', null)
  );

  const setSelectedCountry = (countryId: string) => {
    setSelectedCountryState(countryId);
    setShowCountryPicker(false);
  };

  // Persist to localStorage on changes
  useEffect(() => {
    setStoredValue('language', language);
  }, [language]);

  useEffect(() => {
    setStoredValue('favorites', favorites);
  }, [favorites]);

  // Load and merge favorites from Firestore when user signs in
  useEffect(() => {
    if (!user?.uid) return;
    let cancelled = false;
    getDoc(doc(db, 'user_favorites', user.uid))
      .then((snap) => {
        if (cancelled) return;
        const data = snap.data();
        const remote = (data?.couponIds as string[] | undefined) || [];
        setFavorites((prev) => [...new Set([...prev, ...remote])]);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [user?.uid]);

  // Persist favorites to Firestore when user is signed in
  useEffect(() => {
    if (!user?.uid) return;
    setDoc(doc(db, 'user_favorites', user.uid), {
      couponIds: favorites,
    }).catch(() => {});
  }, [user?.uid, favorites]);

  useEffect(() => {
    if (selectedCountry) {
      setStoredValue('country', selectedCountry);
    }
  }, [selectedCountry]);

  const toggleFavorite = (couponId: string) => {
    setFavorites(prev => 
      prev.includes(couponId) 
        ? prev.filter(id => id !== couponId)
        : [...prev, couponId]
    );
  };

  const isFavorite = (couponId: string) => favorites.includes(couponId);

  return (
    <AppContext.Provider value={{
      language,
      setLanguage,
      favorites,
      toggleFavorite,
      isFavorite,
      selectedCountry,
      setSelectedCountry,
      showCountryPicker,
      setShowCountryPicker,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
