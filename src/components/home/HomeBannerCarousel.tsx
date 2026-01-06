import { useEffect, useState, useCallback, useRef } from "react";
import { cn } from "@/lib/utils";

const banners = [
  {
    id: "1",
    imageUrl:
      "https://cdn13674550.b-cdn.net/Coupon%20Application%20media/banner-delivery1.png",
  },
  {
    id: "2",
    imageUrl:
      "https://cdn13674550.b-cdn.net/Coupon%20Application%20media/banner-shopping(1)(1).png",
  },
  {
    id: "3",
    imageUrl:
      "https://cdn13674550.b-cdn.net/Coupon%20Application%20media/banner-travel(1)(1).png",
  },
];

export function HomeBannerCarousel() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const isDraggingRef = useRef(false);
  const autoPlayIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const pauseTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Update current index based on scroll position
  const updateIndexFromScroll = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const scrollLeft = container.scrollLeft;
    const containerWidth = container.clientWidth;
    const newIndex = Math.round(scrollLeft / containerWidth);

    if (
      newIndex !== currentIndex &&
      newIndex >= 0 &&
      newIndex < banners.length
    ) {
      setCurrentIndex(newIndex);
    }
  }, [currentIndex]);

  // Scroll to specific index
  const scrollToIndex = useCallback((index: number, smooth = true) => {
    const container = containerRef.current;
    if (!container) return;

    const containerWidth = container.clientWidth;
    const targetScroll = containerWidth * index;

    container.scrollTo({
      left: targetScroll,
      behavior: smooth ? "smooth" : "auto",
    });
  }, []);

  // Auto-play function
  const startAutoPlay = useCallback(() => {
    // Clear existing interval
    if (autoPlayIntervalRef.current) {
      clearInterval(autoPlayIntervalRef.current);
      autoPlayIntervalRef.current = null;
    }

    // Start new interval (3.5 seconds)
    autoPlayIntervalRef.current = setInterval(() => {
      if (!isDraggingRef.current && containerRef.current) {
        const container = containerRef.current;
        const containerWidth = container.clientWidth;
        const currentScroll = container.scrollLeft;
        const currentIdx = Math.round(currentScroll / containerWidth);
        const nextIndex = (currentIdx + 1) % banners.length;
        scrollToIndex(nextIndex, true);
      }
    }, 3500);
  }, [scrollToIndex]);

  // Handle scroll events to update index
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      scrollTimeoutRef.current = setTimeout(() => {
        updateIndexFromScroll();
      }, 50);
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      container.removeEventListener("scroll", handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [updateIndexFromScroll]);

  // Handle drag start/end to pause auto-play
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handlePointerDown = () => {
      isDraggingRef.current = true;
      // Clear any existing auto-play
      if (autoPlayIntervalRef.current) {
        clearInterval(autoPlayIntervalRef.current);
        autoPlayIntervalRef.current = null;
      }
    };

    const handlePointerUp = () => {
      isDraggingRef.current = false;
      // Resume auto-play after a short delay
      if (pauseTimeoutRef.current) {
        clearTimeout(pauseTimeoutRef.current);
      }
      pauseTimeoutRef.current = setTimeout(() => {
        startAutoPlay();
      }, 1000);
    };

    container.addEventListener("pointerdown", handlePointerDown);
    container.addEventListener("pointerup", handlePointerUp);
    container.addEventListener("touchstart", handlePointerDown);
    container.addEventListener("touchend", handlePointerUp);

    return () => {
      container.removeEventListener("pointerdown", handlePointerDown);
      container.removeEventListener("pointerup", handlePointerUp);
      container.removeEventListener("touchstart", handlePointerDown);
      container.removeEventListener("touchend", handlePointerUp);
    };
  }, [startAutoPlay]);

  // Start auto-play on mount (after container is measured)
  useEffect(() => {
    // Wait for container to be measured
    const timer = setTimeout(() => {
      startAutoPlay();
    }, 100);

    return () => {
      clearTimeout(timer);
      if (autoPlayIntervalRef.current) {
        clearInterval(autoPlayIntervalRef.current);
        autoPlayIntervalRef.current = null;
      }
      if (pauseTimeoutRef.current) {
        clearTimeout(pauseTimeoutRef.current);
        pauseTimeoutRef.current = null;
      }
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
        scrollTimeoutRef.current = null;
      }
    };
  }, [startAutoPlay]);

  return (
    <div className="px-4 mt-4">
      <div
        dir="ltr"
        ref={containerRef}
        className="overflow-x-auto scroll-smooth scrollbar-hide rounded-2xl shadow-md"
        style={{
          scrollSnapType: "x mandatory",
          WebkitOverflowScrolling: "touch",
        }}
      >
        <div className="flex">
          {banners.map((banner) => (
            <div
              key={banner.id}
              className="basis-full shrink-0 snap-start"            >
              <div className="relative h-[150px] sm:h-[160px] md:h-[180px] rounded-2xl overflow-hidden bg-muted">
                <img
                  src={banner.imageUrl}
                  alt={`Promotional banner ${banner.id}`}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pagination Dots */}
      <div className="flex justify-center gap-1.5 mt-3">
        {banners.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              scrollToIndex(index, true);
              // Pause auto-play briefly when user clicks
              if (autoPlayIntervalRef.current) {
                clearInterval(autoPlayIntervalRef.current);
                autoPlayIntervalRef.current = null;
              }
              setTimeout(() => {
                startAutoPlay();
              }, 2000);
            }}
            className={cn(
              "w-2 h-2 rounded-full transition-all duration-300",
              currentIndex === index ? "bg-primary w-4" : "bg-border"
            )}
            aria-label={`Go to banner ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
