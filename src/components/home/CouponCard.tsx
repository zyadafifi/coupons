import { useNavigate } from "react-router-dom";
import { Coupon } from "@/data/types";
import { couponsCopy } from "@/content/couponsCopy.ar";
import { formatCurrency, getCurrencyFromCountry } from "@/utils/formatCurrency";
import { useApp } from "@/contexts/AppContext";
import { useActiveCountries } from "@/hooks/useAppData";
import { useMemo } from "react";

interface CouponCardProps {
  coupon: Coupon;
}

export function CouponCard({ coupon }: CouponCardProps) {
  const navigate = useNavigate();
  const { selectedCountry } = useApp();
  const { countries } = useActiveCountries();

  const storeName = coupon.storeName || "متجر";
  const storeLogoUrl = coupon.storeLogoUrl;
  const discount = coupon.discount || coupon.discountLabel || "";
  const code = coupon.code || "";
  const description = coupon.descriptionAr || coupon.description || "";

  // Get country code for currency formatting
  const currentCountry = countries.find((c) => c.id === selectedCountry);
  const countryCode = currentCountry?.code || "SA";
  const currencyCode = getCurrencyFromCountry(countryCode);

  // Generate deterministic usage count if not available (based on coupon id hash)
  const usageCount = useMemo(() => {
    if (coupon.usageCount) return coupon.usageCount;
    // Simple hash-based deterministic number between 50-5000
    let hash = 0;
    for (let i = 0; i < coupon.id.length; i++) {
      hash = ((hash << 5) - hash) + coupon.id.charCodeAt(i);
      hash = hash & hash;
    }
    return Math.abs(hash % 4950) + 50;
  }, [coupon.id, coupon.usageCount]);

  // Parse conditions from terms array
  const conditions = useMemo(() => {
    const conds: string[] = [];
    if (!coupon.terms || coupon.terms.length === 0) return conds;

    coupon.terms.forEach((term) => {
      const termLower = term.toLowerCase();
      // Look for minimum spend patterns
      const minSpendMatch = term.match(/(\d+)\s*(?:ريال|ر\.س|د\.إ|ج\.م|د\.ك|ر\.ع|د\.ب|ر\.ق|sar|aed|egp|kwd|omr|bhd|qar)/i);
      if (minSpendMatch) {
        const amount = parseFloat(minSpendMatch[1]);
        conds.push(couponsCopy.conditions.minSpend.replace("{amount}", formatCurrency(amount, undefined, countryCode)));
        return;
      }
      // Look for maximum discount patterns
      const maxDiscountMatch = term.match(/حد\s*أقصى|حد\s*أقصى\s*للخصم|maximum\s*discount/i);
      if (maxDiscountMatch) {
        const amountMatch = term.match(/(\d+)/);
        if (amountMatch) {
          const amount = parseFloat(amountMatch[1]);
          conds.push(couponsCopy.conditions.maxDiscount.replace("{amount}", formatCurrency(amount, undefined, countryCode)));
        }
        return;
      }
      // Look for selected products
      if (termLower.includes("منتجات مختارة") || termLower.includes("selected products")) {
        conds.push(couponsCopy.conditions.selectedProducts);
        return;
      }
      // Look for limited time
      if (termLower.includes("فترة محدودة") || termLower.includes("limited time")) {
        conds.push(couponsCopy.conditions.limitedTime);
        return;
      }
    });

    return conds.slice(0, 3); // Max 3 conditions
  }, [coupon.terms, countryCode]);

  // Generate title based on discount and cashback
  const cardTitle = useMemo(() => {
    const discountText = discount || "";
    // Check if description or terms mention cashback
    const hasCashback = description.includes("كاش باك") || 
                       coupon.terms?.some(t => t.toLowerCase().includes("كاش باك") || t.toLowerCase().includes("cashback"));
    
    if (hasCashback && discountText) {
      // Extract cashback percentage if available
      const cashbackMatch = description.match(/(\d+)%\s*كاش\s*باك/i) || 
                           coupon.terms?.find(t => t.match(/(\d+)%\s*كاش\s*باك/i))?.match(/(\d+)%/i);
      const cashback = cashbackMatch ? cashbackMatch[1] : "15";
      return couponsCopy.card.titleTemplate.discountAndCashback
        .replace("{discount}", discountText)
        .replace("{cashback}", cashback);
    } else if (discountText) {
      // Check if first order
      const isFirstOrder = description.includes("أول طلب") || 
                          coupon.terms?.some(t => t.toLowerCase().includes("أول طلب") || t.toLowerCase().includes("first order"));
      if (isFirstOrder) {
        return couponsCopy.card.titleTemplate.firstOrder.replace("{discount}", discountText);
      }
      return couponsCopy.card.titleTemplate.discountOnly.replace("{discount}", discountText);
    }
    return coupon.titleAr || coupon.title || storeName;
  }, [discount, description, coupon.terms, coupon.titleAr, coupon.title, storeName]);

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

                {/* Store Name */}
                <div className="flex-1 text-primary-foreground min-w-0">
                  <p className="text-sm font-medium opacity-90 truncate mt-2">
                    {storeName}
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

              {/* Title */}
              <h3 className="text-base font-bold text-primary-foreground mb-2 line-clamp-2">
                {cardTitle}
              </h3>

              {/* Description */}
              <p className="text-xs text-primary-foreground/80 mb-3 leading-relaxed">
                {couponsCopy.card.description}
              </p>

              {/* Conditions */}
              {conditions.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {conditions.map((cond, idx) => (
                    <span
                      key={idx}
                      className="text-xs text-primary-foreground/70 bg-white/30 px-2 py-1 rounded-md"
                    >
                      {cond}
                    </span>
                  ))}
                </div>
              )}

              {/* Apply Code Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/coupon/${coupon.id}`);
                }}
                className="w-full rounded-full border border-white/9 bg-white/80 py-2.5 font-semibold text-primary-foreground text-sm transition-all duration-200 hover:bg-white/90 active:scale-[0.98] shadow-sm"
              >
                {couponsCopy.card.showCode}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
