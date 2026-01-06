export function CouponCardSkeleton() {
  return (
    <div className="bg-card rounded-2xl overflow-hidden shadow-sm border border-border">
      {/* Image skeleton */}
      <div className="relative h-36 animate-shimmer" />

      {/* Content */}
      <div className="p-4">
        {/* Store skeleton */}
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-lg animate-shimmer" />
          <div className="h-4 w-20 rounded animate-shimmer" />
        </div>

        {/* Title skeleton */}
        <div className="space-y-2 mb-2">
          <div className="h-4 w-full rounded animate-shimmer" />
          <div className="h-4 w-3/4 rounded animate-shimmer" />
        </div>

        {/* Footer skeleton */}
        <div className="flex items-center justify-between">
          <div className="h-3 w-24 rounded animate-shimmer" />
          <div className="h-3 w-20 rounded animate-shimmer" />
        </div>
      </div>
    </div>
  );
}
