import { cn } from "@/lib/utils";
import { couponsCopy } from "@/content/couponsCopy.ar";
import { useMemo } from "react";
import { Copy } from "lucide-react";

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
  onCopyAndShop?: () => void;
  onCopyOnly?: () => void;
  onReportIssue?: () => void;
  linkUrl?: string;
  copied?: boolean;
}

export function CouponTicket({
  code,
  discount,
  storeLogo,
  storeLogoUrl,
  ticketDescriptionAr,
  isSelected = false,
  onSelect,
  onCopyAndShop,
  onCopyOnly,
  onReportIssue,
  linkUrl,
  copied = false,
}: CouponTicketProps) {
  const handleCardClick = () => {
    onSelect?.();
  };

  const ticketText =
    ticketDescriptionAr?.trim() || " متفوتش الفرصة و استفيد بالعرض";

  // Extract discount percentage for large background text
  const discountPercentage = useMemo(() => {
    if (!discount) return "";
    const percentMatch = discount.match(/(\d+)%/);
    if (percentMatch) {
      return percentMatch[1] + "%";
    }
    // Try to extract any number
    const numberMatch = discount.match(/(\d+)/);
    return numberMatch ? numberMatch[1] + "%" : "";
  }, [discount]);

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
        "ticket-container relative w-full block transition-transform duration-200 mb-4",
        isSelected && "scale-[1.02]"
      )}
      onClick={handleCardClick}
    >
      {/* Main Ticket Card - Rounded container with shadow */}
      <div
        className={cn(
          "relative w-full overflow-hidden rounded-[20px] sm:rounded-[24px] shadow-lg bg-white transition-all duration-200"
        )}
      >
        {/* SECTION 1: Top Yellow Panel */}
        <div
          className="relative px-5 py-6 pb-8 sm:px-6 sm:py-7 sm:pb-9"
          style={{
            backgroundImage: "url('/assets/Asset-4.png')",
            backgroundSize: "100% 100%",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        >
          {/* Large Discount Percentage Background Text */}
          {discountPercentage && (
            <div className="absolute left-0 top-1/2 -translate-y-1/2 text-[100px] sm:text-[120px] font-black text-white/25 select-none pointer-events-none leading-none">
              {discountPercentage}
            </div>
          )}

          {/* Left side: Arabic description text positioned near faded numbers */}
          <div className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 z-10 max-w-[100px]">
            <div className="flex flex-col leading-tight">
              <span className="text-md sm:text-base font-bold text-black">
                {ticketText.split(" ").slice(0, 2).join(" ")}
              </span>
              {ticketText.split(" ").slice(2).length > 0 && (
                <span className="text-md sm:text-base font-bold text-black text-center">
                  {ticketText.split(" ").slice(2).join(" ")}
                </span>
              )}
            </div>
          </div>

          <div className="relative flex items-start justify-between gap-4">
            {/* Right side: Store Logo - Far right */}
            <div className="shrink-0 flex items-center">
              {storeLogoUrl ? (
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white flex items-center justify-center shadow-md">
                  <img
                    src={storeLogoUrl}
                    alt=""
                    className="w-8 h-8 sm:w-10 sm:h-10 object-contain"
                  />
                </div>
              ) : (
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white flex items-center justify-center text-lg sm:text-xl shadow-md">
                  <span className="font-bold">{storeLogo || "🏪"}</span>
                </div>
              )}
            </div>

            {/* Left of logo: Text Content - Discount, Code, Badge */}
            <div className="flex-1 text-right space-y-0.5">
              {/* Discount label */}
              <p
                className="text-lg sm:text-xl font-bold text-white leading-none"
                style={{
                  textRendering: "optimizeLegibility",
                  WebkitFontSmoothing: "antialiased",
                }}
              >
                {formattedDiscount}
              </p>
              {/* Code */}
              <p
                className="font-mono text-xl sm:text-2xl font-extrabold text-white leading-none tracking-wider uppercase"
                style={{
                  textRendering: "optimizeLegibility",
                  WebkitFontSmoothing: "antialiased",
                }}
              >
                {code}
              </p>
              {/* Yellow Badge - Verified Today */}
              <div className="inline-block">
                <span
                  className="inline-block bg-[#FFE082] text-white text-[10px] sm:text-xs font-bold px-3 py-0.5 rounded-full"
                  style={{
                    textRendering: "optimizeLegibility",
                    WebkitFontSmoothing: "antialiased",
                  }}
                >
                  {couponsCopy.badges.verifiedToday}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Perforated dividing line with side notches */}
        <div className="relative w-full h-4 overflow-visible -top-1/2">
          {/* Dashed line */}
          <div
            className="absolute left-5 right-5 h-px -translate-y-1/2 z-0"
            style={{
              background:
                "repeating-linear-gradient(to right, #D1D5DB 0px, #D1D5DB 6px, transparent 6px, transparent 12px)",
            }}
          />

          {/* Left notch - semicircle indentation */}
          <div
            className="pointer-events-none absolute left-0 w-6 h-6 -translate-x-0.5 -translate-y-3 rounded-full z-10 border border-gray-200 bg-white shadow-[0_2px_6px_rgba(0,0,0,0.08)]"
            style={{
              clipPath: "inset(5% 0 0 27%)",
            }}
          />

          {/* Right notch - semicircle indentation */}
          <div
            className="pointer-events-none absolute right-0 w-6 h-6 translate-x-1.5  -translate-y-4 rounded-full z-10 border border-gray-200 bg-white shadow-[0_2px_6px_rgba(0,0,0,0.08)]"
            style={{
              clipPath: "inset(7% 0 0 0)",
            }}
          />
        </div>

        {/* SECTION 2: Middle White Section */}
        <div className="bg-white px-5  sm:px-6">
          {/* Headline */}
          <h3 className="text-center text-[15px] sm:text-base font-bold text-black mb-3.5">
            تأكد من استخدام الكود قبل الدفع
          </h3>

          {/* Grey Divider */}
          <div className="h-[0.25px] bg-[#c2bfbf] mb-3.5 -mx-5 sm:-mx-6"></div>

          {/* Label */}
          <p className="text-[11px] text-gray-400 text-center mb-2.5">
            {couponsCopy.detail.copyOnly}
          </p>

          {/* Code Input Field (match screenshot) */}
          <div className="relative mb-3 flex justify-center">
            <div
              className="
              flex items-center justify-between gap-2
              bg-white
               h-10
                px-2
                 rounded-xl
               border border-gray-200
             shadow-[0_6px_14px_rgba(0,0,0,0.08)]
               w-[200px]
               "
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onCopyOnly?.();
                }}
                className="
        shrink-0
        w-5 h-5
        flex items-center justify-center
        rounded-lg
        bg-white
        border border-gray-200
        shadow-[0_2px_6px_rgba(0,0,0,0.06)]
        hover:bg-gray-50
        transition
      "
                aria-label="Copy code"
              >
                <Copy className="w-4.5 h-4.5 text-gray-600" />
              </button>
              <div className="flex-1 text-center">
                <span className="font-mono font-semibold text-base text-gray-700 tracking-wide">
                  {code}
                </span>
              </div>

              
            </div>
          </div>

          {/* External Link Hint */}
          {linkUrl && (
            <p className="text-xs text-gray-400 text-center">
              {couponsCopy.detail.externalHint}
            </p>
          )}
        </div>

        {/* SECTION 3: Bottom Action Buttons */}
        <div className="bg-white px-5 pb-5 pt-1 sm:px-6 sm:pb-6 sm:pt-2">
          {/* Main CTA Button - Copy & Shop */}
          {linkUrl && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onCopyAndShop?.();
              }}
              className="w-full relative mb-2.5 py-3.5 rounded-xl font-bold text-base sm:text-lg transition-all duration-300 overflow-hidden shadow-md hover:brightness-110 hover:contrast-105 active:scale-[0.98]"
              style={{
                backgroundImage: "url('/assets/high-lights2.png')",
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
              }}
            >
              {/* Orange/Gold Diagonal Tab with Letter */}
              {!copied && code && (
                <div
                  className="absolute left-0 top-0 bottom-0 w-14 flex items-center justify-center select-none pointer-events-none"
                  style={{
                    background:
                      "linear-gradient(135deg, #FF8C00 0%, #FFA726 100%)",
                    clipPath: "polygon(0 0, 100% 0, 82% 100%, 0 100%)",
                  }}
                >
                  <span className="text-white text-[26px] font-black -mr-1">
                    {code.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}

              {/* Button Text */}
              <span
                className="relative z-10 text-black font-bold"
                style={{
                  paddingLeft: code && !copied ? "28px" : "0",
                }}
              >
                {couponsCopy.detail.copyAndShopNow}
              </span>
            </button>
          )}

          {/* Report Issue Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onReportIssue?.();
            }}
            className="w-full py-2 text-[13px] font-semibold text-red-500 hover:text-red-600 transition-colors"
          >
            {couponsCopy.detail.reportIssue}
          </button>
        </div>
      </div>
    </div>
  );
}
