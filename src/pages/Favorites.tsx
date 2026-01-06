import { useState, useCallback, useMemo } from 'react';
import { useApp } from '@/contexts/AppContext';
import { useActiveCoupons } from '@/hooks/useAppData';
import { CouponCard } from '@/components/home/CouponCard';
import { CouponCardSkeleton } from '@/components/home/CouponCardSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { PullToRefresh } from '@/components/shared/PullToRefresh';
import { AlertCircle } from 'lucide-react';

export default function Favorites() {
  const { favorites } = useApp();
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Fetch all coupons from Firestore (no country filter for favorites)
  const { coupons, loading, error } = useActiveCoupons();
  
  // Filter to only show favorited coupons
  const favoriteCoupons = useMemo(() => {
    return coupons.filter(coupon => favorites.includes(coupon.id));
  }, [coupons, favorites]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    setIsRefreshing(false);
  }, []);

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div className="min-h-screen">
        {/* Header */}
        <div className="px-4 pt-12 pb-4">
          <h1 className="text-2xl font-bold text-foreground">المفضلة</h1>
          <p className="text-muted-foreground text-sm">
            {favoriteCoupons.length > 0 
              ? `${favoriteCoupons.length} كوبون محفوظ`
              : "احفظ كوبوناتك المفضلة هنا"}
          </p>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mx-4 mb-4 p-4 bg-destructive/10 border border-destructive/20 rounded-xl flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-destructive shrink-0" />
            <p className="text-sm text-destructive">فشل في تحميل البيانات</p>
          </div>
        )}

        {/* Content */}
        <div className="px-4 pb-4">
          {loading || isRefreshing ? (
            <div className="space-y-4">
              {Array.from({ length: 2 }).map((_, i) => (
                <CouponCardSkeleton key={i} />
              ))}
            </div>
          ) : favoriteCoupons.length > 0 ? (
            <div className="space-y-4">
              {favoriteCoupons.map((coupon) => (
                <CouponCard key={coupon.id} coupon={coupon} />
              ))}
            </div>
          ) : favorites.length > 0 && coupons.length === 0 ? (
            <EmptyState
              icon="🔌"
              title="لا توجد بيانات"
              description="لم يتم العثور على الكوبونات المحفوظة في قاعدة البيانات"
            />
          ) : (
            <EmptyState
              icon="💖"
              title="لا توجد مفضلات"
              description="اضغط على أيقونة القلب لحفظ الكوبونات المفضلة لديك"
            />
          )}
        </div>
      </div>
    </PullToRefresh>
  );
}
