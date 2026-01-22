import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { FirestoreCoupon, FirestoreStore, FirestoreCouponEvent } from '@/data/types';
import { Copy, Eye, ShoppingBag, TrendingUp } from 'lucide-react';

interface CouponUsageTableProps {
  coupons: FirestoreCoupon[];
  stores: FirestoreStore[];
  events: FirestoreCouponEvent[];
  loading?: boolean;
}

interface CouponUsageData {
  couponId: string;
  code: string;
  storeName: string;
  copyCount: number;
  copyAndShopCount: number;
  totalUsage: number;
  variants: {
    variantId: string;
    code: string;
    copyCount: number;
  }[];
}

export function CouponUsageTable({
  coupons,
  stores,
  events,
  loading,
}: CouponUsageTableProps) {
  const usageData = useMemo(() => {
    if (loading) return [];

    // Count events for each coupon and variant
    const usageMap = new Map<string, CouponUsageData>();

    coupons.forEach((coupon) => {
      const store = stores.find((s) => s.id === coupon.storeId);
      const storeName = store?.nameAr || store?.nameEn || 'Unknown';

      // Count main coupon events
      const mainCopyEvents = events.filter(
        (e) => e.couponId === coupon.id && !e.variantId && e.eventType === 'copy'
      );
      const mainCopyAndShopEvents = events.filter(
        (e) => e.couponId === coupon.id && !e.variantId && e.eventType === 'copy_and_shop'
      );

      // Count variant events
      const variantUsage: { variantId: string; code: string; copyCount: number }[] = [];
      if (coupon.variants && coupon.variants.length > 0) {
        coupon.variants.forEach((variant) => {
          const variantCopyEvents = events.filter(
            (e) => e.couponId === coupon.id && e.variantId === variant.id
          );
          if (variantCopyEvents.length > 0) {
            variantUsage.push({
              variantId: variant.id,
              code: variant.code,
              copyCount: variantCopyEvents.length,
            });
          }
        });
      }

      const totalCopy = mainCopyEvents.length;
      const totalCopyAndShop = mainCopyAndShopEvents.length;
      const variantTotal = variantUsage.reduce((sum, v) => sum + v.copyCount, 0);
      const totalUsage = totalCopy + totalCopyAndShop + variantTotal;

      if (totalUsage > 0) {
        usageMap.set(coupon.id, {
          couponId: coupon.id,
          code: coupon.code,
          storeName,
          copyCount: totalCopy,
          copyAndShopCount: totalCopyAndShop,
          totalUsage,
          variants: variantUsage,
        });
      }
    });

    // Sort by total usage (descending)
    return Array.from(usageMap.values()).sort((a, b) => b.totalUsage - a.totalUsage);
  }, [coupons, stores, events, loading]);

  if (loading) {
    return (
      <Card className="w-full" dir="rtl">
        <CardHeader>
          <CardTitle>تفاصيل استخدام الكوبونات</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (usageData.length === 0) {
    return (
      <Card className="w-full" dir="rtl">
        <CardHeader>
          <CardTitle>تفاصيل استخدام الكوبونات</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Copy className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>لا توجد بيانات استخدام متاحة</p>
            <p className="text-sm mt-1">سيتم عرض البيانات عندما يبدأ المستخدمون بنسخ الكوبونات</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full" dir="rtl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          تفاصيل استخدام الكوبونات
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          إجمالي {usageData.length} كوبون تم استخدامه
        </p>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">#</TableHead>
                <TableHead className="text-right">الكود</TableHead>
                <TableHead className="text-right">المتجر</TableHead>
                <TableHead className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Copy className="w-4 h-4" />
                    نسخ
                  </div>
                </TableHead>
                <TableHead className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <ShoppingBag className="w-4 h-4" />
                    نسخ وتسوق
                  </div>
                </TableHead>
                <TableHead className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Eye className="w-4 h-4" />
                    المتغيرات
                  </div>
                </TableHead>
                <TableHead className="text-center font-bold">الإجمالي</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {usageData.map((item, index) => (
                <>
                  <TableRow key={item.couponId}>
                    <TableCell className="font-medium">{index + 1}</TableCell>
                    <TableCell>
                      <code className="bg-muted px-2 py-1 rounded text-sm font-mono">
                        {item.code}
                      </code>
                    </TableCell>
                    <TableCell className="text-sm">{item.storeName}</TableCell>
                    <TableCell className="text-center">
                      {item.copyCount > 0 ? (
                        <Badge variant="secondary">{item.copyCount}</Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {item.copyAndShopCount > 0 ? (
                        <Badge variant="default">{item.copyAndShopCount}</Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {item.variants.length > 0 ? (
                        <Badge variant="outline">
                          {item.variants.reduce((sum, v) => sum + v.copyCount, 0)}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center font-bold text-primary">
                      {item.totalUsage}
                    </TableCell>
                  </TableRow>
                  {/* Variant Details */}
                  {item.variants.length > 0 &&
                    item.variants.map((variant) => (
                      <TableRow key={variant.variantId} className="bg-muted/30">
                        <TableCell></TableCell>
                        <TableCell colSpan={2}>
                          <div className="flex items-center gap-2 pr-4">
                            <span className="text-xs text-muted-foreground">└─</span>
                            <code className="bg-background px-2 py-0.5 rounded text-xs font-mono">
                              {variant.code}
                            </code>
                            <span className="text-xs text-muted-foreground">(متغير)</span>
                          </div>
                        </TableCell>
                        <TableCell colSpan={3} className="text-center">
                          <Badge variant="outline" className="text-xs">
                            {variant.copyCount} نسخة
                          </Badge>
                        </TableCell>
                        <TableCell></TableCell>
                      </TableRow>
                    ))}
                </>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
