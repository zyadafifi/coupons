import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Heart,
  Share2,
  Lightbulb,
  Loader2,
  AlertCircle,
  Check,
  Copy,
} from "lucide-react";
import { sanitizeRichText } from "@/security/sanitizeHtml";
import { getCouponByIdForUser } from "@/hooks/useAppData";
import { ProgressiveImage } from "@/components/shared/ProgressiveImage";
import { useApp } from "@/contexts/AppContext";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Coupon, Store, Category } from "@/data/types";
import { CountrySelector } from "@/components/home/CountrySelector";
import { CountryPickerModal } from "@/components/home/CountryPickerModal";
import { CouponTicket } from "@/components/coupon/CouponTicket";
import { couponsCopy } from "@/content/couponsCopy.ar";

export default function CouponDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toggleFavorite, isFavorite } = useApp();
  const { toast } = useToast();
  const [copiedVariantId, setCopiedVariantId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const [store, setStore] = useState<Store | null>(null);
  const [, setCategory] = useState<Category | null>(null);

  // Parallax scroll state
  const [scrollY, setScrollY] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parallax scroll effect
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      setScrollY(container.scrollTop);
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  // Selected variant state
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    null
  );

  useEffect(() => {
    async function loadCoupon() {
      if (!id) {
        setLoading(false);
        setError("معرف الكوبون غير صالح");
        return;
      }

      try {
        const result = await getCouponByIdForUser(id);

        if (result.coupon) {
          setCoupon(result.coupon);
          setStore(result.store);
          setCategory(result.category);

          // Set default variant if exists
          if (result.coupon.variants && result.coupon.variants.length > 0) {
            const defaultVariant =
              result.coupon.variants.find((v) => v.isDefault) ||
              result.coupon.variants[0];
            setSelectedVariantId(defaultVariant.id);
          }
        } else {
          setError("الكوبون غير موجود");
        }
      } catch (err) {
        console.error("Error loading coupon:", err);
        setError("فشل في تحميل الكوبون");
      }

      setLoading(false);
    }

    loadCoupon();
  }, [id]);

  // Get selected variant or null if no variants
  const selectedVariant = useMemo(() => {
    if (!coupon?.variants || coupon.variants.length === 0) return null;
    return (
      coupon.variants.find((v) => v.id === selectedVariantId) ||
      coupon.variants[0]
    );
  }, [coupon?.variants, selectedVariantId]);

  // Get current code, description, discount based on variant or main coupon
  const currentCode = selectedVariant?.code || coupon?.code || "";
  const currentDescription =
    selectedVariant?.descriptionAr || coupon?.description || "";
  const currentDiscount =
    selectedVariant?.discountLabel || coupon?.discount || "";

  const favorite = coupon ? isFavorite(coupon.id) : false;

  const handleCopyCode = useCallback(
    (code: string, variantId: string) => {
      if (code) {
        navigator.clipboard.writeText(code);
        setCopiedVariantId(variantId);
        toast({
          title: couponsCopy.modal.copySuccess,
          description: code,
        });
        setTimeout(() => setCopiedVariantId(null), 2000);
      }
    },
    [toast]
  );

  // Helper to open external URL
  const openExternalUrl = useCallback(async (url: string) => {
    try {
      // Check if Capacitor is available (mobile app)
      const capacitor = (window as any).Capacitor;
      if (capacitor?.Plugins?.Browser) {
        const { Browser } = capacitor.Plugins;
        await Browser.open({ url });
      } else {
        // Web fallback
        window.open(url, "_blank", "noopener,noreferrer");
      }
    } catch (error) {
      console.error("Error opening URL:", error);
      // Fallback to window.open
      window.open(url, "_blank", "noopener,noreferrer");
    }
  }, []);

  const handleCopyAndShop = useCallback(async () => {
    const storeUrl = selectedVariant?.linkUrl || coupon?.linkUrl;
    if (!storeUrl) return;

    // Copy code if not already copied
    if (currentCode && !copiedVariantId) {
      await handleCopyCode(currentCode, selectedVariantId || coupon?.id || "");
    }

    // Open store URL
    await openExternalUrl(storeUrl);
  }, [
    currentCode,
    copiedVariantId,
    selectedVariantId,
    coupon,
    selectedVariant,
    handleCopyCode,
    openExternalUrl,
  ]);

  const handleShare = async () => {
    if (coupon && navigator.share) {
      try {
        await navigator.share({
          title: coupon.title,
          text: `استخدم كود ${currentCode} للحصول على ${currentDiscount}`,
          url: window.location.href,
        });
      } catch {
        // User cancelled or share failed
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "تم نسخ الرابط",
      });
    }
  };

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center bg-background"
        dir="rtl"
      >
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !coupon) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center gap-4 p-4"
        dir="rtl"
      >
        <AlertCircle className="w-12 h-12 text-destructive" />
        <p className="text-muted-foreground text-center">
          {error || "الكوبون غير موجود"}
        </p>
        <Button variant="outline" onClick={() => navigate(-1)}>
          العودة
        </Button>
      </div>
    );
  }

  // Use store logo URL or fallback
  const storeLogoUrl = store?.logoUrl;
  const storeLogo = store?.logo || "🏪";
  const storeColor = store?.color || "#6366f1";

  // Calculate parallax transform
  const parallaxOffset = Math.min(scrollY * 0.4, 100);

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-background flex flex-col overflow-y-auto"
      dir="rtl"
    >
      {/* Hero Image Section - Responsive height with Parallax */}
      <div className="relative w-full h-[38vh] sm:h-[42vh] md:h-[48vh] min-h-[240px] max-h-[420px] overflow-hidden">
        <div
          className="absolute inset-0 w-full"
          style={{
            height: "110%",
            transform: `translateY(-${parallaxOffset}px)`,
            willChange: "transform",
          }}
        >
          <ProgressiveImage
            src={coupon.image}
            alt={coupon.title}
            className="w-full h-full"
            objectPosition="center center"
          />
        </div>

        {/* Gradient Overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60 z-10" />

        {/* Floating Navigation Buttons */}
        <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-4 pt-safe z-30">
          {/* Right side: Back (appears on right in RTL) */}
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="w-11 h-11 rounded-full bg-card/90 flex items-center justify-center shadow-lg transition-transform active:scale-95 cursor-pointer"
          >
            <ArrowRight className="w-5 h-5 text-foreground pointer-events-none" />
          </button>

          {/* Left side: Country, Share & Favorite (appears on left in RTL) */}
          <div className="flex items-center gap-2">
            <CountrySelector />
            <button
              type="button"
              onClick={() => toggleFavorite(coupon.id)}
              className={cn(
                "w-11 h-11 rounded-full flex items-center justify-center transition-all active:scale-95 cursor-pointer",
                favorite
                  ? "bg-destructive"
                  : "bg-foreground/30 backdrop-blur-sm"
              )}
            >
              <Heart
                className="w-5 h-5 text-card pointer-events-none"
                fill={favorite ? "currentColor" : "none"}
              />
            </button>
            <button
              type="button"
              onClick={handleShare}
              className="w-11 h-11 rounded-full bg-foreground/30 backdrop-blur-sm flex items-center justify-center transition-transform active:scale-95 cursor-pointer"
            >
              <Share2 className="w-5 h-5 text-card pointer-events-none" />
            </button>
          </div>
        </div>

        {/* Centered Store Logo */}
        <div className="absolute inset-0 flex items-center justify-center">
          {storeLogoUrl ? (
            <img
              src={storeLogoUrl}
              alt={store?.name || ""}
              className="w-28 h-28 rounded-2xl object-contain bg-card/90 p-3 shadow-2xl"
            />
          ) : (
            <div
              className="w-28 h-28 rounded-2xl flex items-center justify-center text-5xl bg-card/90 shadow-2xl"
              style={{ color: storeColor }}
            >
              {storeLogo}
            </div>
          )}
        </div>

        {/* قسيمة Logo at bottom of hero */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center">
          <span className="text-card text-sm font-medium">قسيمة</span>
        </div>
      </div>

      {/* Curved Content Section */}
      <div className="flex-1 -mt-6 rounded-t-[32px] bg-background relative z-10 pt-6 px-5 pb-28">
        {/* Title */}
        <div className="text-center mb-4">
          <h2 className="font-bold text-lg text-foreground">
            {couponsCopy.detail.title}
          </h2>
        </div>

        {/* Description - changes based on selected variant */}
        <div className="text-center mb-6">
          {currentDescription ? (
            <div
              key={selectedVariantId}
              className="text-foreground text-sm leading-relaxed mb-3 prose prose-sm max-w-none [&_h1]:text-xl [&_h1]:font-bold [&_h2]:text-lg [&_h2]:font-semibold [&_p]:my-1 animate-fade-in"
              dangerouslySetInnerHTML={{
                __html: sanitizeRichText(currentDescription),
              }}
            />
          ) : (
            <div className="text-foreground text-sm leading-relaxed mb-3 text-right space-y-1.5">
              <p className="font-semibold mb-2">
                استمتع بتجربة تسوق استثنائية 😍
              </p>
              <p>
                {couponsCopy.detail.descriptionBullet} أكبر موقع وتطبيق للمكياج
                والعطور والعناية
              </p>
              <p>
                {couponsCopy.detail.descriptionBullet} كل احتياجاتك من منتجات
                التجميل بأسعار مميزة
              </p>
              <p>
                {couponsCopy.detail.descriptionBullet} عروض متجددة وتخفيضات
                حصرية يوميًا
              </p>
            </div>
          )}
        </div>

        {/* Help/Tip Section */}
        <div className="bg-muted/50 rounded-2xl p-4 mb-6">
          <div className="flex items-start gap-2 text-sm mb-2">
            <Lightbulb className="w-4 h-4 mt-0.5 shrink-0 text-primary" />
            <div className="flex-1">
              <p className="font-semibold text-foreground mb-1">
                {couponsCopy.detail.helpTitle}
              </p>
              <p className="text-muted-foreground text-xs">
                {couponsCopy.detail.helpSubtitle}
              </p>
            </div>
          </div>
        </div>

        {/* Horizontal Scrollable Coupon Cards with Navigation */}
        {(() => {
          const variants =
            coupon.variants && coupon.variants.length > 0
              ? coupon.variants
              : [
                  {
                    id: coupon.id,
                    code: coupon.code,
                    discountLabel: coupon.discount,
                  },
                ];

          const scrollToVariant = (direction: "prev" | "next") => {
            const currentIdx = variants.findIndex(
              (v) => v.id === selectedVariantId
            );
            let newIdx = direction === "next" ? currentIdx + 1 : currentIdx - 1;
            if (newIdx < 0) newIdx = variants.length - 1;
            if (newIdx >= variants.length) newIdx = 0;
            const newVariant = variants[newIdx];
            setSelectedVariantId(newVariant.id);
            document.getElementById(`card-${newVariant.id}`)?.scrollIntoView({
              behavior: "smooth",
              block: "nearest",
              inline: "center",
            });
          };

          // Touch swipe handling
          let touchStartX = 0;
          let touchEndX = 0;
          const minSwipeDistance = 50;

          const handleTouchStart = (e: React.TouchEvent) => {
            touchStartX = e.touches[0].clientX;
          };

          const handleTouchMove = (e: React.TouchEvent) => {
            touchEndX = e.touches[0].clientX;
          };

          const handleTouchEnd = () => {
            const swipeDistance = touchStartX - touchEndX;
            if (Math.abs(swipeDistance) > minSwipeDistance) {
              // RTL: swipe left = next, swipe right = prev
              if (swipeDistance > 0) {
                scrollToVariant("prev");
              } else {
                scrollToVariant("next");
              }
            }
          };

          return (
            <>
              <div className="relative mb-6">
                {/* Cards Container with Touch Swipe */}
                <div
                  className="-mx-5 overflow-x-scroll scrollbar-hide snap-x snap-mandatory overscroll-x-contain"
                  style={{
                    WebkitOverflowScrolling: "touch",
                    scrollSnapStop: "always",
                  }}
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                >
                  <div
                    className="flex gap-1.5 coupon-scroll-padding"
                    style={{ width: "max-content" }}
                  >
                    {coupon.variants && coupon.variants.length > 0 ? (
                      coupon.variants.map((variant) => (
                        <div
                          key={variant.id}
                          id={`card-${variant.id}`}
                          className="flex-shrink-0 w-[78vw] sm:w-[55vw] md:w-[45vw] lg:w-[35vw] snap-start"
                          style={{ scrollSnapStop: "always" }}
                        >
                          <CouponTicket
                            code={variant.code}
                            discount={variant.discountLabel}
                            descriptionAr={
                              variant.descriptionAr ||
                              coupon?.descriptionAr ||
                              coupon?.description ||
                              ""
                            }
                            storeLogo={storeLogo}
                            storeLogoUrl={storeLogoUrl}
                            ticketDescriptionAr={coupon.ticketDescriptionAr}
                            isSelected={selectedVariantId === variant.id}
                            onSelect={() => {
                              setSelectedVariantId(variant.id);
                              document
                                .getElementById(`card-${variant.id}`)
                                ?.scrollIntoView({
                                  behavior: "smooth",
                                  block: "nearest",
                                  inline: "center",
                                });
                            }}
                            usageCount={coupon.usageCount}
                            isPopular={coupon.isPopular}
                          />
                        </div>
                      ))
                    ) : (
                      <div
                        className="flex-shrink-0 w-[78vw] sm:w-[55vw] md:w-[45vw] lg:w-[35vw] snap-start"
                        style={{ scrollSnapStop: "always" }}
                      >
                        <CouponTicket
                          code={coupon.code}
                          discount={coupon.discount}
                          descriptionAr={
                            coupon.descriptionAr || coupon.description || ""
                          }
                          ticketDescriptionAr={coupon.ticketDescriptionAr}
                          storeLogo={storeLogo}
                          storeLogoUrl={storeLogoUrl}
                          isSelected={true}
                          usageCount={coupon.usageCount}
                          isPopular={coupon.isPopular}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          );
        })()}
      </div>

      {/* Urgency Line */}
      {coupon.expiryDate && (
        <div className="text-center mb-4">
          <p className="text-xs text-muted-foreground">
            {couponsCopy.detail.urgency}
          </p>
        </div>
      )}

      {/* Sticky Bottom Buttons */}
      <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border px-4 py-3 pb-safe z-20">
        <div className="space-y-2">
          {/* Primary Button - Copy and Shop */}
          {selectedVariant?.linkUrl || coupon.linkUrl ? (
            <>
              <button
                onClick={handleCopyAndShop}
                className={cn(
                  "w-full py-3.5 rounded-xl font-bold text-base transition-all duration-300 relative overflow-hidden shadow-lg hover:brightness-110 hover:contrast-105"
                )}
                style={{
                  backgroundImage: "url('/assets/high-lights2.png')",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  backgroundRepeat: "no-repeat",
                }}
              >
                {/* FIRST LETTER – NO BACKGROUND, JUST TEXT */}
                {!copiedVariantId && currentCode && (
                  <span
                    className="absolute select-none pointer-events-none"
                    style={{
                      left: "3px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      fontSize: "24px",
                      fontWeight: 900,
                      mixBlendMode: "multiply",
                    }}
                  >
                    {currentCode.charAt(0).toUpperCase()}
                  </span>
                )}

                {/* Button content */}
                <div
                  className="relative z-10 flex items-center justify-center gap-2 text-primary-foreground"
                  style={{
                    paddingLeft: currentCode && !copiedVariantId ? "18px" : "0",
                  }}
                >
                  <span>{couponsCopy.detail.copyAndShopNow}</span>
                </div>
              </button>
              <p className="text-xs text-center text-muted-foreground">
                {couponsCopy.detail.externalHint}
              </p>
            </>
          ) : null}

          {/* Secondary Button - Copy Only */}
          <button
            onClick={() =>
              handleCopyCode(currentCode, selectedVariantId || coupon.id)
            }
            className={cn(
              "w-full py-3 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center justify-center gap-2 border-2 border-primary/30 text-foreground hover:bg-primary/5 active:scale-[0.98]",
              !(selectedVariant?.linkUrl || coupon.linkUrl) && "bg-primary/10"
            )}
          >
            {copiedVariantId ? (
              <>
                <Check className="w-4 h-4" />
                <span>{couponsCopy.detail.copyOnly}</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>{couponsCopy.detail.copyOnly}</span>
              </>
            )}
          </button>

          {/* Feedback Action */}
          <button
            onClick={() => {
              // Placeholder - no backend logic
              toast({
                title: "شكرًا لك",
                description: "تم إرسال البلاغ بنجاح",
              });
            }}
            className="w-full py-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            {couponsCopy.detail.reportIssue}
          </button>
        </div>
      </div>

      {/* Country Picker Modal */}
      <CountryPickerModal />
    </div>
  );
}
