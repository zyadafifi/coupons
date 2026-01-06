import { couponsCopy } from "@/content/couponsCopy.ar";

export function CouponBanner() {
  return (
    <div
      className="relative overflow-hidden rounded-3xl shadow-xl bg-gradient-to-br from-primary/25 via-primary/15 to-primary/10 border-2 border-primary/40 backdrop-blur-sm"
      dir="rtl"
    >
      {/* Background decoration - enhanced */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 right-0 w-40 h-40 bg-primary rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl" />
        <div className="absolute top-1/2 left-1/2 w-24 h-24 bg-primary/50 rounded-full -translate-x-1/2 -translate-y-1/2 blur-xl" />
      </div>

      {/* Content */}
      <div className="relative px-6 py-6 text-center">
        <div className="inline-block">
          <p className="text-lg font-bold text-foreground whitespace-pre-line leading-relaxed drop-shadow-sm">
            {couponsCopy.banner.text}
          </p>
        </div>
      </div>

      {/* Bottom accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
    </div>
  );
}

