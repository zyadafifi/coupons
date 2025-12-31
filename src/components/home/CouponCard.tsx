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
      {/* Side Cutouts */}
      <div className="absolute left-0 top-[52px] -translate-y-1/2 w-4 h-4 rounded-full z-10 bg-background" />
      <div className="absolute right-0 top-[52px] -translate-y-1/2 w-4 h-4 rounded-full z-10 bg-background" />

      {/* Main Ticket Card */}
      <div className="relative overflow-hidden rounded-xl shadow-card bg-card">
        {/* Header Section */}
        <div className="relative px-3 py-3 pb-5 bg-primary">
          <div className="flex items-center gap-3">
            {/* Store Logo */}
            <div className="shrink-0">
              {storeLogoUrl ? (
                <img
                  src={storeLogoUrl}
                  alt={storeName}
                  className="w-10 h-10 rounded-full object-contain bg-card p-1 shadow-md"
                />
              ) : (
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg bg-card shadow-md">
                  🏪
                </div>
              )}
            </div>

            {/* Store Name & Code */}
            <div className="flex-1 text-primary-foreground min-w-0">
              <p className="text-sm font-medium opacity-90 truncate">
                {storeName}
              </p>
              <p className="font-mono font-bold text-lg tracking-wider truncate">
                {code || discount}
              </p>
            </div>

            {/* Discount Badge */}
            {code && discount && (
              <div className="shrink-0 bg-card/20 backdrop-blur-sm px-2 py-1 rounded-lg">
                <span className="text-primary-foreground font-bold text-sm">
                  {discount}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Zigzag Divider */}
        <div className="relative h-3 overflow-hidden bg-primary">
          <svg
            className="absolute bottom-0 left-0 w-full"
            height="12"
            viewBox="0 0 400 12"
            preserveAspectRatio="none"
          >
            <path
              d="M0,12 L0,6 Q5,0 10,6 T20,6 T30,6 T40,6 T50,6 T60,6 T70,6 T80,6 T90,6 T100,6 T110,6 T120,6 T130,6 T140,6 T150,6 T160,6 T170,6 T180,6 T190,6 T200,6 T210,6 T220,6 T230,6 T240,6 T250,6 T260,6 T270,6 T280,6 T290,6 T300,6 T310,6 T320,6 T330,6 T340,6 T350,6 T360,6 T370,6 T380,6 T390,6 T400,6 L400,12 Z"
              fill="hsl(var(--card))"
            />
          </svg>
        </div>

        {/* Description Section */}
        <div className="bg-card px-3 py-2">
          {description ? (
            <p
              className="text-xs text-muted-foreground line-clamp-2 leading-relaxed"
              dir="rtl"
            >
              {description.replace(/<[^>]*>/g, "")}
            </p>
          ) : (
            <p className="text-xs text-primary text-center">اضغط للتفاصيل</p>
          )}
        </div>
      </div>
    </div>
  );
}
