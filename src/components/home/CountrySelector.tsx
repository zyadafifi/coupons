import { ChevronDown } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { useActiveCountries } from '@/hooks/useAppData';
import { Skeleton } from '@/components/ui/skeleton';

export function CountrySelector() {
  const { selectedCountry, setShowCountryPicker } = useApp();
  const { countries, loading } = useActiveCountries();
  
  // Find current country from Firestore data
  const currentCountry = countries.find(c => c.id === selectedCountry);

  const handleClick = () => {
    console.log('[CountrySelector] Button clicked, opening modal');
    setShowCountryPicker(true);
  };

  // Show loading skeleton
  if (loading) {
    return <Skeleton className="h-7 w-20 rounded-full" />;
  }

  return (
    <button 
      onClick={handleClick}
      className="flex items-center gap-1 bg-background/20 backdrop-blur-sm rounded-full px-2.5 py-1 text-xs font-medium"
    >
      {currentCountry ? (
        <>
          <span className="text-sm">{currentCountry.flag}</span>
          <span>{currentCountry.nameAr}</span>
        </>
      ) : (
        <>
          <span>🌍</span>
          <span>اختر بلد</span>
        </>
      )}
      <ChevronDown className="w-3.5 h-3.5" />
    </button>
  );
}
