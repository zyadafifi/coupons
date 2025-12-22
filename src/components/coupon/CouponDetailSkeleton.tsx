import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function CouponDetailSkeleton() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Header Image Skeleton */}
      <div className="relative h-56 animate-shimmer">
        {/* Top Navigation */}
        <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-4 pt-12">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
          <div className="w-10 h-10 rounded-full bg-background/20" />
        </div>

        {/* Discount Badge Skeleton */}
        <div className="absolute bottom-4 start-4 h-10 w-24 rounded-full bg-background/30" />
      </div>

      {/* Content */}
      <div className="px-4 py-6 space-y-6">
        {/* Store Info Skeleton */}
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-2xl animate-shimmer" />
          <div className="space-y-2">
            <div className="h-5 w-24 rounded animate-shimmer" />
            <div className="h-4 w-16 rounded animate-shimmer" />
          </div>
        </div>

        {/* Title & Description Skeleton */}
        <div className="space-y-3">
          <div className="h-6 w-3/4 rounded animate-shimmer" />
          <div className="space-y-2">
            <div className="h-4 w-full rounded animate-shimmer" />
            <div className="h-4 w-5/6 rounded animate-shimmer" />
          </div>
        </div>

        {/* Stats Skeleton */}
        <div className="flex gap-4">
          <div className="h-4 w-32 rounded animate-shimmer" />
          <div className="h-4 w-28 rounded animate-shimmer" />
        </div>

        {/* Code Box Skeleton */}
        <div className="h-16 w-full rounded-xl animate-shimmer" />

        {/* Terms Skeleton */}
        <div className="h-12 w-full rounded animate-shimmer" />
      </div>
    </div>
  );
}
