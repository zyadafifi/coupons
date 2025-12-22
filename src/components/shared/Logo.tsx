import { cn } from '@/lib/utils';
import { useAppSettings } from '@/hooks/useAppSettings';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

// Default values (used as fallback)
const DEFAULT_LOGO_IMAGE = 'https://i.ibb.co/QjTHRZTj/Generated-Image-December-20-2025-8-48-AM-Photoroom.png';
const DEFAULT_LOGO_TEXT = 'قسيمة';

export function Logo({ className, size = 'md', showText = true }: LogoProps) {
  const { settings } = useAppSettings();
  
  const logoImage = settings.logoUrl || DEFAULT_LOGO_IMAGE;
  const logoText = settings.appName || DEFAULT_LOGO_TEXT;

  const imageSizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  const textSizeClasses = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-2xl',
  };

  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      {showText && (
        <span className={cn('font-bold text-foreground', textSizeClasses[size])}>
          {logoText}
        </span>
      )}
      <img 
        src={logoImage} 
        alt={logoText} 
        className={cn('object-contain', imageSizeClasses[size])}
      />
    </div>
  );
}

// Export constants for use elsewhere if needed
export { DEFAULT_LOGO_IMAGE as LOGO_IMAGE, DEFAULT_LOGO_TEXT as LOGO_TEXT };
