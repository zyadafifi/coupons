import { cn } from "@/lib/utils";

interface CouponTicketProps {
  code: string;
  discount: string;
  descriptionAr?: string;
  storeLogo?: string;
  storeLogoUrl?: string;
  isSelected?: boolean;
  onSelect?: () => void;
}

export function CouponTicket({
  code,
  discount,
  descriptionAr,
  storeLogo,
  storeLogoUrl,
  isSelected = false,
  onSelect,
}: CouponTicketProps) {
  const handleCardClick = () => {
    onSelect?.();
  };

  return (
    <div
      className={cn(
        "ticket-container relative mx-auto w-full max-w-md px-3 cursor-pointer transition-transform duration-200 hover:scale-[1.02]",
        isSelected && "scale-[1.02]"
      )}
      onClick={handleCardClick}
    >
      {/* Main Ticket Card - Rounded container with shadow */}
      <div
  className={cn(
    "relative overflow-hidden rounded-[20px] sm:rounded-[24px] shadow-lg bg-card transition-all duration-200"
  )}
>

        {/* Top Panel - Green section with high-lights.png background */}
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
            <div className="flex-1 text-white">
              <p className="text-base sm:text-lg font-medium mb-1 sm:mb-2">
                {discount}
              </p>
              <p className="font-mono font-bold text-2xl sm:text-3xl tracking-wider uppercase">
                {code}
              </p>
            </div>
          </div>
        </div>

        {/* Perforation Effect - Dashed Line with Side Notches */}
        <div className="relative h-3 overflow-visible">
          

          {/* Dashed Line Divider */}
          <div className="absolute bottom-0 left-0 right-0 h-px border-t-2 border-dashed border-border/50" />
        </div>

        {/* Bottom Panel - White section */}
        <div className="bg-card px-4 py-4 sm:px-5 sm:py-5">
          {/* Discount Text */}
          <p className="text-base sm:text-lg font-bold text-foreground mb-2">
            {discount}
          </p>

          {/* Description Text */}
          {descriptionAr && (
            <p className="text-sm sm:text-base text-foreground mb-3 leading-relaxed">
              {descriptionAr}
            </p>
          )}

          {/* Terms Text */}
          <p className="text-xs sm:text-sm text-primary mb-4">
            *الشروط والأحكام
          </p>

          {/* Apply Code Button (Visual Only) */}
          <div className="text-center">
            <div className="inline-block px-6 py-2.5   text-foreground font-medium text-sm sm:text-base cursor-default">
              الشروط و الأحكام
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
