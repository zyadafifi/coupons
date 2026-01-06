import { useEffect, useState, useCallback } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { cn } from '@/lib/utils';
import { useAppSettings } from '@/hooks/useAppSettings';
import { Skeleton } from '@/components/ui/skeleton';


export function HeroCarousel() {
  const { settings, loading } = useAppSettings();
  const slides = settings.banners.sort((a, b) => a.sortOrder - b.sortOrder);

  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    loop: true,
    direction: 'rtl',
    align: 'center',
  });
  const [selectedIndex, setSelectedIndex] = useState(0);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi, onSelect]);

  // Auto-scroll every 3 seconds
  useEffect(() => {
    if (!emblaApi) return;
    const interval = setInterval(() => {
      emblaApi.scrollNext();
    }, 3000);
    return () => clearInterval(interval);
  }, [emblaApi]);

  if (loading) {
    return (
      <div className="px-4 mt-4">
        <Skeleton className="h-[180px] w-full rounded-2xl" />
      </div>
    );
  }

  // Don't render carousel if no banners
  if (slides.length === 0) {
    return null;
  }

  const handleBannerClick = (linkUrl?: string) => {
    if (linkUrl) {
      window.open(linkUrl, '_blank');
    }
  };

  return (
    <div className="px-4 mt-4">
      <div className="overflow-hidden rounded-2xl" ref={emblaRef}>
        <div className="flex gap-3">
          {slides.map((slide) => (
            <div
              key={slide.id}
              className="flex-[0_0_100%] min-w-0"
            >
              <div 
                className={cn(
                  "relative h-[180px] rounded-2xl overflow-hidden bg-muted",
                  slide.linkUrl && "cursor-pointer"
                )}
                onClick={() => handleBannerClick(slide.linkUrl)}
              >
                <img
                  src={slide.imageUrl}
                  alt={slide.alt}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dot Indicators */}
      <div className="flex justify-center gap-1.5 mt-3">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => emblaApi?.scrollTo(index)}
            className={cn(
              "w-2 h-2 rounded-full transition-all",
              selectedIndex === index
                ? "bg-primary w-4"
                : "bg-border"
            )}
            aria-label={`انتقل للشريحة ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
