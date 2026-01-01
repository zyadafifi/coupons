import { useNavigate } from "react-router-dom";
import { Coupon } from "@/data/types";

interface CouponCardProps {
  coupon: Coupon;
}

export function CouponCard({ coupon }: CouponCardProps) {
  const navigate = useNavigate();

  const storeName = coupon.storeName || "متجر";
  const storeLogoUrl = coupon.storeLogoUrl;
  const discount = coupon.discount || coupon.discountLabel || "";
  const code = coupon.code || "";
  const description = coupon.description || "";

  return (
    <div
      onClick={() => navigate(`/coupon/${coupon.id}`)}
      className="relative cursor-pointer transition-transform duration-200 hover:scale-[1.01] active:scale-[0.99]"
    >
      {/* Main Ticket Card */}
      <div
        className="relative overflow-hidden rounded-2xl shadow-sm bg-white"
        dir="ltr"
      >
        <div className="flex items-stretch">
          {/* Left Vertical Strip with high-lights3.png */}
          <div
            className="relative w-[92px] shrink-0 self-stretch rounded-l-2xl"
            style={{
              backgroundImage: "url('/assets/high-lights3.png')",
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            }}
          >
            
          </div>

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col rounded-r-2xl" dir="rtl">
            {/* Top Section - Yellow Coupon Body */}
            <div className="relative bg-card px-4 py-4">
              <div className="flex items-start gap-3 mb-3">
                {/* Store Logo */}
                <div className="shrink-0">
                  {storeLogoUrl ? (
                    <img
                      src={storeLogoUrl}
                      alt={storeName}
                      className="w-10 h-10 rounded-full object-contain bg-white p-1 shadow-md"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg bg-white shadow-md">
                      🏪
                    </div>
                  )}
                </div>

                {/* Store Name & Code */}
                <div className="flex-1 text-primary-foreground min-w-0">
                  <p className="text-sm font-medium opacity-90 truncate mt-2">
                    {storeName}
                  </p>
                  <p className="font-mono font-bold text-lg tracking-wider truncate">
                    {code || discount}
                  </p>
                </div>

                {/* Discount Badge */}
                {code && discount && (
                  <div className="shrink-0 bg-white/20 backdrop-blur-sm px-2 py-1 rounded-lg">
                    <span className="text-primary-foreground font-bold text-sm">
                      {discount}
                    </span>
                  </div>
                )}
              </div>

              {/* Apply Code Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/coupon/${coupon.id}`);
                }}
                className="w-full rounded-full border border-white/9 bg-white/80 py-2.5 font-semibold text-primary-foreground text-sm transition-all duration-200 hover:bg-white/90 active:scale-[0.98] shadow-sm mb-3"
              >
                اضغط للتفاصيل
              </button>

              {/* Description - moved from bottom section */}
              {description ? (
                <p className="text-xs text-primary-foreground/80 line-clamp-2 leading-relaxed">
                  {description.replace(/<[^>]*>/g, "")}
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
