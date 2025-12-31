import { cn } from "@/lib/utils";

interface CouponTicketProps {
  code: string;
  discount: string;
  storeLogo?: string;
  storeLogoUrl?: string;
  isSelected?: boolean;
  onSelect?: () => void;
}

export function CouponTicket({
  code,
  discount,
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
      {/* Side Cutouts - positioned at the zigzag divider */}
      <div className="absolute left-0 top-[105px] sm:top-[115px] md:top-[120px] -translate-y-1/2 w-5 h-5 sm:w-6 sm:h-6 rounded-full z-10 bg-background" />
      <div className="absolute right-0 top-[105px] sm:top-[115px] md:top-[120px] -translate-y-1/2 w-5 h-5 sm:w-6 sm:h-6 rounded-full z-10 bg-background" />

      {/* Main Ticket Card */}
      <div
        className={cn(
          "relative overflow-hidden rounded-2xl shadow-lg bg-card transition-all duration-200",
          isSelected &&
            "ring-2 ring-primary ring-offset-2 ring-offset-background"
        )}
      >
        {/* Header Section - Using App Primary Color */}
        <div className="relative px-4 py-5 pb-7 sm:px-5 sm:py-6 sm:pb-8 bg-primary">
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Store Logo */}
            <div className="shrink-0">
              {storeLogoUrl ? (
                <img
                  src={storeLogoUrl}
                  alt=""
                  className="w-11 h-11 sm:w-14 sm:h-14 rounded-full object-contain bg-card p-1 sm:p-1.5 shadow-md"
                />
              ) : (
                <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-full flex items-center justify-center text-xl sm:text-2xl bg-card shadow-md">
                  {storeLogo || "🏪"}
                </div>
              )}
            </div>

            {/* Discount & Code */}
            <div className="flex-1 text-primary-foreground">
              <p className="text-base sm:text-lg font-medium mb-0.5 sm:mb-1 opacity-95">
                {discount}
              </p>
              <p className="font-mono font-bold text-xl sm:text-2xl tracking-wider">
                {code}
              </p>
            </div>
          </div>
        </div>

        {/* Zigzag Divider */}
        <div className="relative h-4 overflow-hidden bg-primary">
          <svg
            className="absolute bottom-0 left-0 w-full"
            height="16"
            viewBox="0 0 400 16"
            preserveAspectRatio="none"
          >
            <path
              d="M0,16 L0,8 Q5,0 10,8 T20,8 T30,8 T40,8 T50,8 T60,8 T70,8 T80,8 T90,8 T100,8 T110,8 T120,8 T130,8 T140,8 T150,8 T160,8 T170,8 T180,8 T190,8 T200,8 T210,8 T220,8 T230,8 T240,8 T250,8 T260,8 T270,8 T280,8 T290,8 T300,8 T310,8 T320,8 T330,8 T340,8 T350,8 T360,8 T370,8 T380,8 T390,8 T400,8 L400,16 Z"
              fill="hsl(var(--card))"
            />
          </svg>
        </div>

        {/* Content Section */}
        <div className="bg-card px-4 py-2 sm:px-5 sm:py-3">
          {/* Terms Link */}
          <p className="text-xs text-primary text-center">*الشروط والأحكام</p>
        </div>
      </div>
    </div>
  );
}
