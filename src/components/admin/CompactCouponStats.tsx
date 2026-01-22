import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { FirestoreCoupon, FirestoreCouponEvent } from '@/data/types';
import { getBestDiscount } from '@/utils/couponHelpers';

interface CompactCouponStatsProps {
  coupons: FirestoreCoupon[];
  events: FirestoreCouponEvent[];
  loading?: boolean;
  storeName?: string;
}

interface StatRowProps {
  label: string;
  value: string | number;
  highlight?: boolean;
}

/** RTL: label right, value left */
function StatRow({ label, value, highlight }: StatRowProps) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-border last:border-0 gap-3">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={`font-medium text-base tabular-nums ${highlight ? 'text-primary' : 'text-foreground'}`}>
        {value}
      </span>
    </div>
  );
}

export function CompactCouponStats({
  coupons,
  events,
  loading,
  storeName,
}: CompactCouponStatsProps) {
  const stats = useMemo(() => {
    if (loading) return null;

    // Filter events for "copy" and "copy_and_shop" (usage events)
    const usageEvents = events.filter((e) => e.eventType === 'copy' || e.eventType === 'copy_and_shop');
    
    // Total offers count
    const totalOffers = coupons.length;

    // Total coupon codes (base + variants)
    const totalCodes = coupons.reduce((sum, coupon) => {
      return sum + 1 + (coupon.variants?.length || 0);
    }, 0);

    // Best discount
    const allDiscounts = coupons.map((c) => getBestDiscount(c.discountLabel, c.variants));
    const bestDiscount = allDiscounts.length > 0
      ? Math.max(...allDiscounts.filter((d): d is number => d !== null))
      : 0;

    return {
      codesUsedToday: usageEvents.length,
      totalOffers,
      totalCodes,
      bestDiscount,
    };
  }, [coupons, events, loading]);

  const title = storeName ? `إحصائيات كوبونات ${storeName}` : 'إحصائيات الكوبونات';

  if (loading) {
    return (
      <Card className="w-full" dir="rtl">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-14" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!stats) return null;

  return (
    <Card className="w-full" dir="rtl">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <StatRow label="أكواد استخدمت اليوم:" value={stats.codesUsedToday} highlight />
        <StatRow label="كل العروض:" value={stats.totalOffers} />
        <StatRow label="أكواد كوبونات:" value={stats.totalCodes} />
        <StatRow label="أفضل خصم:" value={stats.bestDiscount > 0 ? `${stats.bestDiscount}%` : 'N/A'} highlight />
      </CardContent>
    </Card>
  );
}
