import { cn } from "@/lib/utils";
import { couponsCopy } from "@/content/couponsCopy.ar";
import { useMemo } from "react";

interface CouponTicketProps {
  code: string;
  discount: string;
  descriptionAr?: string;
  storeLogo?: string;
  storeLogoUrl?: string;
  ticketDescriptionAr?: string;
  isSelected?: boolean;
  onSelect?: () => void;
  usageCount?: number;
  isPopular?: boolean;
}

export function CouponTicket({
  code,
  discount,
  descriptionAr,
  storeLogo,
  storeLogoUrl,
  ticketDescriptionAr,
  isSelected = false,
  onSelect,
  usageCount = 0,
  isPopular = false,
}: CouponTicketProps) {
  const handleCardClick = () => {
    onSelect?.();
  };

  const ticketText = ticketDescriptionAr?.trim() || " متفوتش الفرصة و استفيد بالعرض";

  // Generate deterministic usage count if not provided
  const displayUsageCount = useMemo(() => {
    if (usageCount > 0) return usageCount;
    // Simple hash-based deterministic number between 50-5000
    let hash = 0;
    for (let i = 0; i < code.length; i++) {
      hash = (hash << 5) - hash + code.charCodeAt(i);
      hash = hash & hash;
    }
    return Math.abs(hash % 4950) + 50;
  }, [usageCount, code]);

  // Format discount label
  const formattedDiscount = useMemo(() => {
    if (!discount) return discount;
    // Check if discount already has prefix
    if (discount.includes("خصم") || discount.includes("وفر")) {
      return discount;
    }
    // Extract percentage or amount
    const percentMatch = discount.match(/(\d+)%/);
    if (percentMatch) {
      return `${couponsCopy.detail.discountPrefix} ${percentMatch[1]}%`;
    }
    return `${couponsCopy.detail.discountPrefix} ${discount}`;
  }, [discount]);

  return (
    <div
      className={cn(
        "ticket-container relative w-full block cursor-pointer transition-transform duration-200 hover:scale-[1.02] mb-4",
        isSelected && "scale-[1.02]"
      )}
      onClick={handleCardClick}
    >
      {/* Main Ticket Card - Rounded container with shadow */}
      <div
        className={cn(
          "relative w-full overflow-hidden rounded-[20px] sm:rounded-[24px] shadow-lg bg-card transition-all duration-200"
        )}
      >
        {/* Top Panel */}
        <div
          className="relative min-h-[55%] px-4 py-5 pb-6 sm:px-5 sm:py-6 sm:pb-7"
          style={{
            backgroundImage: "url('/assets/high-lights.png')",
            backgroundSize: "100% 100%",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        >
          <div className="flex items-start gap-3 sm:gap-4">
            {/* Store Logo */}
            <div className="shrink-0 pt-1">
              {storeLogoUrl ? (
                <img
                  src={storeLogoUrl}
                  alt=""
                  className="w-11 h-11 sm:w-14 sm:h-14 rounded-full object-contain bg-white/90 p-1 sm:p-1.5 shadow-md"
                />
              ) : (
                <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-full flex items-center justify-center text-xl sm:text-2xl bg-white/90 shadow-md">
                  {storeLogo || "🏪"}
                </div>
              )}
            </div>

            {/* Discount & Code */}
            <div className="flex-1 text-white mt-2">
              <p className="text-base sm:text-lg font-medium mb-1 sm:mb-2">
                {formattedDiscount}
              </p>
              <p className="font-mono font-bold text-2xl sm:text-3xl tracking-wider uppercase">
                {code}
              </p>
              {/* Trust Indicators */}
              <div className="flex flex-wrap items-center gap-1.5 mt-2 text-xs">
                <span className="bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded-full">
                  {couponsCopy.badges.verifiedToday}
                </span>
                {isPopular && (
                  <span className="bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded-full">
                    {couponsCopy.badges.mostUsed}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Panel - White section */}
        <div className="bg-[#F3F4F6] px-4 py-4 sm:px-5 sm:py-5">
          {/* Discount Text */}
          <p className="text-base sm:text-lg font-bold text-foreground mb-2">
            {formattedDiscount}
          </p>

         

          
          <div className="mt-3 text-xs sm:text-sm text-muted-foreground text-right space-y-1">
                <p>{ticketText}</p>
              </div>
          {/* Horizontal Line */}
          <div className="bg-[#d9dbdf] h-px my-4 -mx-4 sm:-mx-5"></div>

          {/* Terms & Conditions */}
          <div className="text-center">
            <details className="cursor-pointer">
              <summary className="inline-block px-6 py-2.5 text-foreground  text-md font-bold sm:text-base list-none">
                <span className="flex items-center justify-center gap-2">
                  <span>تأكد من إستخدام الكود قبل الدفع</span>
                </span>
              </summary>
              
            </details>
          </div>
        </div>
      </div>
    </div>
  );
}
