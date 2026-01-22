import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { FirestoreCoupon, FirestoreStore, FirestoreCategory, FirestoreCountry, FirestoreCouponEvent, FirestoreReport } from '@/data/types';
import { getBestDiscount, extractPercent, calculateAverageDiscount } from '@/utils/couponHelpers';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface CouponStatsPanelProps {
  coupons: FirestoreCoupon[];
  stores: FirestoreStore[];
  categories: FirestoreCategory[];
  countries: FirestoreCountry[];
  events: FirestoreCouponEvent[];
  reports: FirestoreReport[];
  loading?: boolean;
  // Filters
  storeId?: string;
  countryId?: string;
  categoryId?: string;
}

interface StatRowProps {
  label: string;
  value: string | number;
  trend?: 'up' | 'down' | 'neutral';
  highlight?: boolean;
}

function StatRow({ label, value, trend, highlight }: StatRowProps) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-border last:border-0">
      <div className="flex items-center gap-2">
        <span className={`font-bold text-xl ${highlight ? 'text-primary' : 'text-foreground'}`}>
          {value}
        </span>
        {trend && (
          <span className="text-xs">
            {trend === 'up' && <TrendingUp className="w-4 h-4 text-green-500" />}
            {trend === 'down' && <TrendingDown className="w-4 h-4 text-red-500" />}
            {trend === 'neutral' && <Minus className="w-4 h-4 text-muted-foreground" />}
          </span>
        )}
      </div>
      <span className="text-sm text-muted-foreground">{label}</span>
    </div>
  );
}

export function CouponStatsPanel({
  coupons,
  stores,
  categories,
  countries,
  events,
  reports,
  loading,
}: CouponStatsPanelProps) {
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

    // Active vs Inactive
    const activeCoupons = coupons.filter((c) => c.isActive).length;
    const inactiveCoupons = coupons.filter((c) => !c.isActive).length;

    // Popular coupons
    const popularCoupons = coupons.filter((c) => c.isPopular).length;

    // Expiring soon (within 7 days) and expired
    const now = new Date();
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    let expiringSoon = 0;
    let expired = 0;

    coupons.forEach((coupon) => {
      if (coupon.expiryDate) {
        const expiryDate = coupon.expiryDate.toDate ? coupon.expiryDate.toDate() : new Date(coupon.expiryDate);
        if (expiryDate < now) {
          expired++;
        } else if (expiryDate <= sevenDaysFromNow) {
          expiringSoon++;
        }
      }
    });

    // Average discount
    const avgDiscount = calculateAverageDiscount(allDiscounts);

    // Top 5 coupons by usageCount
    const topCouponsByUsage = [...coupons]
      .sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0))
      .slice(0, 5)
      .map((c) => {
        const store = stores.find((s) => s.id === c.storeId);
        return {
          code: c.code,
          storeName: store?.nameAr || store?.nameEn || 'Unknown',
          usageCount: c.usageCount || 0,
        };
      });

    // Reports insights
    const totalReports = reports.length;
    const unresolvedReports = reports.filter((r) => !r.isResolved).length;

    // Top 3 most reported couponIds
    const reportCountByCoupon = reports.reduce((acc, report) => {
      acc[report.couponId] = (acc[report.couponId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topReportedCoupons = Object.entries(reportCountByCoupon)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([couponId, count]) => {
        const coupon = coupons.find((c) => c.id === couponId);
        const store = stores.find((s) => s.id === coupon?.storeId);
        return {
          code: coupon?.code || 'N/A',
          storeName: store?.nameAr || store?.nameEn || 'Unknown',
          count,
        };
      });

    // Top 5 stores by number of coupons
    const couponsByStore = coupons.reduce((acc, coupon) => {
      acc[coupon.storeId] = (acc[coupon.storeId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topStores = Object.entries(couponsByStore)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([storeId, count]) => {
        const store = stores.find((s) => s.id === storeId);
        return {
          name: store?.nameAr || store?.nameEn || 'Unknown',
          count,
        };
      });

    // Top 5 countries by number of coupons
    const couponsByCountry = coupons.reduce((acc, coupon) => {
      acc[coupon.countryId] = (acc[coupon.countryId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topCountries = Object.entries(couponsByCountry)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([countryId, count]) => {
        const country = countries.find((c) => c.id === countryId);
        return {
          name: country?.nameAr || country?.nameEn || 'Unknown',
          count,
        };
      });

    // Top 5 categories by number of coupons
    const couponsByCategory = coupons.reduce((acc, coupon) => {
      acc[coupon.categoryId] = (acc[coupon.categoryId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topCategories = Object.entries(couponsByCategory)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([categoryId, count]) => {
        const category = categories.find((c) => c.id === categoryId);
        return {
          name: category?.nameAr || category?.nameEn || 'Unknown',
          count,
        };
      });

    return {
      codesUsedToday: usageEvents.length,
      totalOffers,
      totalCodes,
      bestDiscount,
      activeCoupons,
      inactiveCoupons,
      popularCoupons,
      expiringSoon,
      expired,
      avgDiscount,
      topCouponsByUsage,
      totalReports,
      unresolvedReports,
      topReportedCoupons,
      topStores,
      topCountries,
      topCategories,
    };
  }, [coupons, stores, categories, countries, events, reports, loading]);

  if (loading) {
    return (
      <Card className="w-full" dir="rtl">
        <CardHeader>
          <CardTitle>إحصائيات الكوبونات</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center justify-between py-3">
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-4 w-32" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-6" dir="rtl">
      {/* Main Stats Card */}
      <Card className="w-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-xl">إحصائيات الكوبونات</CardTitle>
        </CardHeader>
        <CardContent>
          <StatRow label="استخدامات اليوم" value={stats.codesUsedToday} highlight />
          <StatRow label="إجمالي العروض" value={stats.totalOffers} />
          <StatRow label="إجمالي أكواد الكوبونات" value={stats.totalCodes} />
          <StatRow label="أفضل خصم" value={stats.bestDiscount > 0 ? `${stats.bestDiscount}%` : 'N/A'} highlight />
          <StatRow label="متوسط الخصم" value={stats.avgDiscount ? `${stats.avgDiscount.toFixed(1)}%` : 'N/A'} />
        </CardContent>
      </Card>

      {/* Status Breakdown */}
      <Card className="w-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">حالة الكوبونات</CardTitle>
        </CardHeader>
        <CardContent>
          <StatRow label="كوبونات نشطة" value={stats.activeCoupons} trend="up" />
          <StatRow label="كوبونات غير نشطة" value={stats.inactiveCoupons} trend="down" />
          <StatRow label="كوبونات شائعة" value={stats.popularCoupons} />
          <StatRow label="تنتهي قريبًا (خلال 7 أيام)" value={stats.expiringSoon} />
          <StatRow label="منتهية الصلاحية" value={stats.expired} />
        </CardContent>
      </Card>

      {/* Top Coupons by Usage */}
      {stats.topCouponsByUsage.length > 0 && (
        <Card className="w-full">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">أكثر الكوبونات استخدامًا</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.topCouponsByUsage.map((coupon, idx) => (
                <div key={idx} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm bg-muted px-2 py-1 rounded">{coupon.code}</span>
                    <span className="text-xs text-muted-foreground">({coupon.storeName})</span>
                  </div>
                  <span className="font-bold text-primary">{coupon.usageCount}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reports Insights */}
      <Card className="w-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">إحصائيات التقارير</CardTitle>
        </CardHeader>
        <CardContent>
          <StatRow label="إجمالي التقارير" value={stats.totalReports} />
          <StatRow label="تقارير غير محلولة" value={stats.unresolvedReports} trend={stats.unresolvedReports > 0 ? 'down' : 'neutral'} />
          {stats.topReportedCoupons.length > 0 && (
            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-sm font-medium text-muted-foreground mb-3">أكثر الكوبونات المبلغ عنها</p>
              <div className="space-y-2">
                {stats.topReportedCoupons.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-sm py-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs bg-destructive/10 text-destructive px-2 py-0.5 rounded">{item.code}</span>
                      <span className="text-xs text-muted-foreground">({item.storeName})</span>
                    </div>
                    <span className="font-bold text-destructive">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top Stores */}
      {stats.topStores.length > 0 && (
        <Card className="w-full">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">أكثر المتاجر نشاطًا</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats.topStores.map((store, idx) => (
                <div key={idx} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <span className="text-sm">{store.name}</span>
                  <span className="font-bold text-primary">{store.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top Countries */}
      {stats.topCountries.length > 0 && (
        <Card className="w-full">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">أكثر الدول نشاطًا</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats.topCountries.map((country, idx) => (
                <div key={idx} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <span className="text-sm">{country.name}</span>
                  <span className="font-bold text-primary">{country.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top Categories */}
      {stats.topCategories.length > 0 && (
        <Card className="w-full">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">أكثر التصنيفات نشاطًا</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats.topCategories.map((category, idx) => (
                <div key={idx} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <span className="text-sm">{category.name}</span>
                  <span className="font-bold text-primary">{category.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
