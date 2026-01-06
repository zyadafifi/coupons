import { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface ProgressiveImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholderClassName?: string;
  objectPosition?: string;
}

export function ProgressiveImage({ 
  src, 
  alt, 
  className,
  placeholderClassName,
  objectPosition = 'center center'
}: ProgressiveImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
  }, []);

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {/* Placeholder */}
      {!isLoaded && (
        <div 
          className={cn(
            "absolute inset-0 bg-muted animate-pulse",
            placeholderClassName
          )} 
        />
      )}
      {/* Actual Image */}
      <img
        src={src}
        alt={alt}
        onLoad={handleLoad}
        style={{ objectPosition }}
        className={cn(
          "w-full h-full object-cover transition-opacity duration-300",
          isLoaded ? "opacity-100" : "opacity-0"
        )}
      />
    </div>
  );
}
