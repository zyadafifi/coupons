import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronDown, Loader2, Check, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { phoneCountries } from '@/data/phone-countries';
import { PhoneCountry } from '@/data/types';
import { addLead, getDeviceId, hasSubmittedLead, markLeadSubmitted, resetOnboarding } from '@/hooks/useLeads';
import { toast } from 'sonner';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Logo } from '@/components/shared/Logo';
import { parseAndValidatePhone } from '@/security/phone';

export default function Onboarding() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checked, setChecked] = useState(false);
  const [shouldShow, setShouldShow] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<PhoneCountry>(phoneCountries[0]);
  const [countryPickerOpen, setCountryPickerOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
  });
  
  const [errors, setErrors] = useState({
    name: '',
    phone: '',
  });

  // Handle reset query parameter (must run first)
  useEffect(() => {
    const resetParam = searchParams.get('resetOnboarding');
    if (resetParam === '1') {
      resetOnboarding();
      // Remove query param from URL
      navigate('/onboarding', { replace: true });
      setShouldShow(true);
      setChecked(true);
      return;
    }
  }, [searchParams, navigate]);

  // Check if already submitted (prevent flash)
  useEffect(() => {
    if (checked) return; // Already checked (including after reset)
    
    if (hasSubmittedLead()) {
      // Don't render UI, just navigate
      navigate('/', { replace: true });
      return;
    }
    
    // Not submitted, show onboarding
    setShouldShow(true);
    setChecked(true);
  }, [navigate, checked]);

  const validate = (): boolean => {
    const newErrors = { name: '', phone: '' };
    let isValid = true;

    // Validate name
    if (!formData.name.trim()) {
      newErrors.name = 'الاسم مطلوب';
      isValid = false;
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'الاسم قصير جداً';
      isValid = false;
    }

    // Validate phone using libphonenumber-js
    const phoneValidation = parseAndValidatePhone(
      formData.phone,
      selectedCountry.code,
      selectedCountry.dialCode
    );

    if (!phoneValidation.isValid) {
      newErrors.phone = phoneValidation.error || 'رقم الهاتف غير صحيح';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;

    setIsSubmitting(true);
    
    try {
      // Parse and normalize phone to E.164 format
      const phoneValidation = parseAndValidatePhone(
        formData.phone,
        selectedCountry.code,
        selectedCountry.dialCode
      );

      // Store normalized E.164 format
      const phoneToStore = phoneValidation.e164 || formData.phone.replace(/\s/g, '');

      const leadId = await addLead({
        name: formData.name.trim(),
        phone: phoneToStore, // Store E.164 format
        countryCode: selectedCountry.dialCode,
        country: selectedCountry.code,
        deviceId: getDeviceId(),
      });

      // Mark as submitted with lead ID
      markLeadSubmitted(leadId);

      toast.success('تم التسجيل بنجاح!');
      navigate('/', { replace: true });
    } catch (error: any) {
      const errorMessage = error?.message || error?.code || String(error);
      console.error('❌ Lead Submit Error:', {
        error,
        message: errorMessage,
        code: error?.code,
        details: error?.details,
      });
      toast.error(`خطأ: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: keyof typeof formData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Validate phone on blur
  const handlePhoneBlur = () => {
    if (!formData.phone.trim()) return; // Don't validate empty on blur
    
    const phoneValidation = parseAndValidatePhone(
      formData.phone,
      selectedCountry.code,
      selectedCountry.dialCode
    );

    if (!phoneValidation.isValid) {
      setErrors(prev => ({ ...prev, phone: phoneValidation.error || 'رقم الهاتف غير صحيح' }));
    }
  };

  // Re-validate phone when country changes
  const handleCountryChange = (country: PhoneCountry) => {
    setSelectedCountry(country);
    setCountryPickerOpen(false);
    
    // Re-validate phone if already entered
    if (formData.phone.trim()) {
      const phoneValidation = parseAndValidatePhone(
        formData.phone,
        country.code,
        country.dialCode
      );

      if (!phoneValidation.isValid) {
        setErrors(prev => ({ ...prev, phone: phoneValidation.error || 'رقم الهاتف غير صحيح' }));
      } else {
        // Clear error if now valid
        setErrors(prev => ({ ...prev, phone: '' }));
      }
    }
  };

  // Don't render until checked (prevents flash)
  if (!checked || !shouldShow) {
    return null;
  }

  // Dev-only reset button handler
  const handleDevReset = () => {
    resetOnboarding();
    toast.success('تم إعادة تعيين التسجيل (وضع التطوير)');
    // Reload to clear form state
    window.location.reload();
  };

  return (
    <div 
      className="min-h-screen bg-background flex flex-col"
      dir="rtl"
    >
      {/* Dev-only reset button */}
      {import.meta.env.DEV && (
        <div className="fixed top-4 left-4 z-50">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDevReset}
            className="bg-destructive/10 hover:bg-destructive/20 text-destructive border-destructive/30"
          >
            <RotateCcw className="w-4 h-4 ml-2" />
            Reset (Dev)
          </Button>
        </div>
      )}
      {/* Decorative Header with Primary Color */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent" />
        <div className="absolute top-0 left-0 w-32 h-32 bg-primary/20 rounded-full -translate-x-1/2 -translate-y-1/2 blur-2xl" />
        <div className="absolute top-20 right-0 w-24 h-24 bg-primary/15 rounded-full translate-x-1/2 blur-xl" />
        
        <div className="relative pt-16 pb-10 px-6 animate-fade-in">
          {/* Logo */}
          <div 
            className="w-20 h-20 mx-auto mb-6 bg-primary rounded-2xl flex items-center justify-center shadow-lg animate-slide-up"
            style={{ animationDelay: '0.1s' }}
          >
            <Logo size="lg" showText={false} />
          </div>
          
          <h1 
            className="text-2xl font-bold text-foreground mb-2 text-center animate-slide-up"
            style={{ animationDelay: '0.2s' }}
          >
            إيه هو رقم موبايلك؟
          </h1>
          <p 
            className="text-muted-foreground text-sm text-center animate-slide-up"
            style={{ animationDelay: '0.3s' }}
          >
            هنبعتلك أفضل الكوبونات والعروض الحصرية
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 px-6 pb-8">
        <form onSubmit={handleSubmit} className="space-y-5 max-w-md mx-auto">
          {/* Phone Input with Country Picker */}
          <div 
            className="space-y-2 animate-slide-up"
            style={{ animationDelay: '0.4s' }}
          >
            <div 
              className={cn(
                "flex items-center h-14 bg-card rounded-2xl border-2 border-border overflow-hidden transition-all duration-200 shadow-card",
                errors.phone ? "border-destructive" : "focus-within:border-primary focus-within:shadow-md"
              )}
              dir="ltr"
            >
              {/* Country Picker */}
              <Popover open={countryPickerOpen} onOpenChange={setCountryPickerOpen}>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="flex items-center gap-2 h-full px-4 border-r border-border bg-muted/30 hover:bg-muted/60 transition-colors"
                  >
                    <span className="text-xl">{selectedCountry.flag}</span>
                    <span className="text-sm font-semibold text-foreground">{selectedCountry.dialCode}</span>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-[240px] p-0 rounded-xl overflow-hidden" align="start">
                  <div className="max-h-[300px] overflow-y-auto">
                    {phoneCountries.map((country, index) => (
                      <button
                        key={country.code}
                        type="button"
                        onClick={() => handleCountryChange(country)}
                        className={cn(
                          'flex items-center gap-3 w-full px-4 py-3 hover:bg-primary/10 transition-all duration-200',
                          selectedCountry.code === country.code && 'bg-primary/15'
                        )}
                        style={{ animationDelay: `${index * 0.05}s` }}
                      >
                        <span className="text-xl">{country.flag}</span>
                        <span className="flex-1 text-right text-sm font-medium">{country.nameAr}</span>
                        <span className="text-xs text-muted-foreground font-mono">{country.dialCode}</span>
                        {selectedCountry.code === country.code && (
                          <Check className="h-4 w-4 text-primary" />
                        )}
                      </button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>

              {/* Phone Number Input */}
              <Input
                type="tel"
                placeholder={selectedCountry.placeholder}
                value={formData.phone}
                onChange={handleChange('phone')}
                onBlur={handlePhoneBlur}
                className="flex-1 h-full border-0 bg-transparent text-base font-medium focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/50"
                autoComplete="tel"
              />
            </div>
            {errors.phone && (
              <p className="text-destructive text-xs animate-fade-in pr-2" dir="rtl">{errors.phone}</p>
            )}
          </div>

          {/* Name Input */}
          <div 
            className="space-y-2 animate-slide-up"
            style={{ animationDelay: '0.5s' }}
          >
            <div 
              className={cn(
                "flex items-center h-14 bg-card rounded-2xl border-2 border-border overflow-hidden transition-all duration-200 shadow-card",
                errors.name ? "border-destructive" : "focus-within:border-primary focus-within:shadow-md"
              )}
            >
              <Input
                type="text"
                placeholder="اسمك الكريم"
                value={formData.name}
                onChange={handleChange('name')}
                className="flex-1 h-full border-0 bg-transparent text-base font-medium focus-visible:ring-0 focus-visible:ring-offset-0 text-right px-5 placeholder:text-muted-foreground/50"
                autoComplete="name"
              />
            </div>
            {errors.name && (
              <p className="text-destructive text-xs animate-fade-in pr-2">{errors.name}</p>
            )}
          </div>

          {/* Country Badge */}
          <div 
            className="flex items-center justify-center gap-2 py-3 animate-slide-up"
            style={{ animationDelay: '0.6s' }}
          >
            <span className="text-lg">{selectedCountry.flag}</span>
            <span className="text-sm text-muted-foreground">{selectedCountry.nameAr}</span>
          </div>

          {/* Submit Button */}
          <div 
            className="animate-slide-up pt-2"
            style={{ animationDelay: '0.7s' }}
          >
            <Button 
              type="submit" 
              className="w-full h-14 text-base font-bold rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              disabled={isSubmitting || !!errors.phone || !!errors.name}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin ml-2" />
                  جاري التسجيل...
                </>
              ) : (
                'التالي ←'
              )}
            </Button>
          </div>

          {/* Skip link */}
          <button
            type="button"
            onClick={() => {
              markLeadSubmitted();
              navigate('/');
            }}
            className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors py-3 animate-slide-up"
            style={{ animationDelay: '0.8s' }}
          >
            تخطي الآن
          </button>
        </form>
      </div>
    </div>
  );
}
