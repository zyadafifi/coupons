import { useApp } from '@/contexts/AppContext';
import { useActiveCountries } from '@/hooks/useAppData';
import { useAppSettings } from '@/hooks/useAppSettings';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
export function CountryPickerModal() {
  const {
    showCountryPicker,
    setShowCountryPicker,
    setSelectedCountry,
    selectedCountry
  } = useApp();
  const {
    countries,
    loading
  } = useActiveCountries();
  const {
    settings
  } = useAppSettings();

  // Check if this is first time (no country selected)
  const isFirstTime = !selectedCountry;
  const handleOpenChange = (open: boolean) => {
    // Don't allow closing if it's first time and no country selected
    if (!open && isFirstTime) {
      return;
    }
    console.log('[CountryPickerModal] onOpenChange:', open);
    setShowCountryPicker(open);
  };
  const handleSelect = (countryId: string) => {
    console.log('[CountryPickerModal] Country selected:', countryId);
    setSelectedCountry(countryId);
  };
  return <Dialog open={showCountryPicker} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden border-0 bg-background" hideCloseButton={isFirstTime} onPointerDownOutside={isFirstTime ? e => e.preventDefault() : undefined} onEscapeKeyDown={isFirstTime ? e => e.preventDefault() : undefined}>
        {/* Decorative Header - matching Onboarding design */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent" />
          <div className="absolute top-0 left-0 w-32 h-32 bg-primary/20 rounded-full -translate-x-1/2 -translate-y-1/2 blur-2xl" />
          <div className="absolute top-20 right-0 w-24 h-24 bg-primary/15 rounded-full translate-x-1/2 blur-xl" />
          
          <div className="relative pt-8 pb-6 px-6 animate-fade-in">
            {/* Logo from settings */}
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center shadow-lg animate-slide-up overflow-hidden" style={{
            animationDelay: '0.1s'
          }}>
              <img src={settings.logoUrl} alt={settings.appName} onError={e => {
              (e.target as HTMLImageElement).src = '/placeholder.svg';
            }} className="w-10 h-10 object-contain border-white/0" />
            </div>
            
            <h2 className="text-xl font-bold text-foreground mb-2 text-center animate-slide-up" style={{
            animationDelay: '0.2s'
          }}>
              🌍 اختر بلدك
            </h2>
            <p className="text-muted-foreground text-sm text-center animate-slide-up" style={{
            animationDelay: '0.3s'
          }}>
              {isFirstTime ? 'مرحباً بك! اختر بلدك لعرض الكوبونات المتاحة لك' : 'اختر بلدك لعرض الكوبونات المتاحة'}
            </p>
          </div>
        </div>

        {/* Countries Grid */}
        <div className="px-6 pb-6">
          {loading ? <div className="grid grid-cols-2 gap-3">
              {Array.from({
            length: 4
          }).map((_, i) => <Skeleton key={i} className="h-16 rounded-2xl" />)}
            </div> : countries.length === 0 ? <p className="text-center text-muted-foreground py-4">لا توجد دول متاحة</p> : <div className="grid grid-cols-2 gap-3">
              {countries.map((country, index) => <button key={country.id} onClick={() => handleSelect(country.id)} className={cn("relative flex items-center gap-3 p-4 rounded-2xl border-2 bg-card transition-all duration-200 animate-slide-up shadow-card hover:shadow-md", selectedCountry === country.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-primary/5")} style={{
            animationDelay: `${0.4 + index * 0.1}s`
          }}>
                  <span className="text-3xl">{country.flag}</span>
                  <span className="font-semibold text-foreground">{country.nameAr}</span>
                  
                  {/* Selected indicator */}
                  {selectedCountry === country.id && <div className="absolute top-2 left-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center animate-scale-in">
                      <Check className="h-3 w-3 text-primary-foreground" />
                    </div>}
                </button>)}
            </div>}
        </div>
      </DialogContent>
    </Dialog>;
}