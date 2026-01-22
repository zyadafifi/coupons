import { useState, useMemo, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import {
  FirestoreCoupon,
  FirestoreStore,
  FirestoreCategory,
  FirestoreCountry,
  FirestoreCouponEvent,
  CouponVariant,
} from '@/data/types';

const PAGE_SIZE = 50;

/** Normalize Firestore Timestamp to Date */
function toDate(ts: unknown): Date | null {
  if (!ts) return null;
  const t = ts as { toDate?: () => Date };
  if (typeof t.toDate === 'function') return t.toDate();
  if (ts instanceof Date) return ts;
  const d = new Date(ts as string | number);
  return isNaN(d.getTime()) ? null : d;
}

/** Format "Last used" for display */
function formatLastUsed(ts: Date | null): string {
  if (!ts) return '—';
  return ts.toLocaleDateString('ar-SA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export interface CodeCatalogRow {
  key: string;
  couponId: string;
  variantId: string | null;
  code: string;
  type: 'base' | 'variant';
  variantLabel: string | null;
  storeId: string;
  countryId: string;
  categoryId: string;
  storeName: string;
  countryName: string;
  categoryName: string;
  uses: number;
  uniqueUsers: number;
  lastUsed: Date | null;
}

interface UsageMapEntry {
  usesCount: number;
  deviceIds: Set<string>;
  lastUsed: Date | null;
}

export interface CouponUsageTableProps {
  coupons: FirestoreCoupon[];
  events: FirestoreCouponEvent[];
  stores: FirestoreStore[];
  categories: FirestoreCategory[];
  countries: FirestoreCountry[];
  /** Filters table rows by code or store name */
  searchQuery: string;
  loading?: boolean;
}

type SortKey = 'uses' | 'lastUsed';
type SortDir = 'asc' | 'desc';

export function CouponUsageTable({
  coupons,
  events,
  stores,
  categories,
  countries,
  searchQuery,
  loading,
}: CouponUsageTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('uses');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [page, setPage] = useState(0);

  useEffect(() => {
    setPage(0);
  }, [searchQuery]);

  const storeMap = useMemo(() => {
    const m = new Map<string, FirestoreStore>();
    stores.forEach((s) => m.set(s.id, s));
    return m;
  }, [stores]);

  const categoryMap = useMemo(() => {
    const m = new Map<string, FirestoreCategory>();
    categories.forEach((c) => m.set(c.id, c));
    return m;
  }, [categories]);

  const countryMap = useMemo(() => {
    const m = new Map<string, FirestoreCountry>();
    countries.forEach((c) => m.set(c.id, c));
    return m;
  }, [countries]);

  const catalog: CodeCatalogRow[] = useMemo(() => {
    const rows: CodeCatalogRow[] = [];
    for (const coupon of coupons) {
      const store = storeMap.get(coupon.storeId);
      const category = categoryMap.get(coupon.categoryId);
      const country = countryMap.get(coupon.countryId);
      const storeName = store?.nameAr || store?.nameEn || '—';
      const categoryName = category?.nameAr || category?.nameEn || '—';
      const countryName = country?.nameAr || country?.nameEn || '—';

      rows.push({
        key: `${coupon.id}::base`,
        couponId: coupon.id,
        variantId: null,
        code: coupon.code ?? '',
        type: 'base',
        variantLabel: null,
        storeId: coupon.storeId,
        countryId: coupon.countryId,
        categoryId: coupon.categoryId,
        storeName,
        countryName,
        categoryName,
        uses: 0,
        uniqueUsers: 0,
        lastUsed: null,
      });

      const variants = coupon.variants ?? [];
      variants.forEach((v, idx) => {
        const vid = v?.id ?? '';
        const vcode = (v as CouponVariant)?.code ?? '';
        const vlabel = (v as CouponVariant)?.labelAr || (v as CouponVariant)?.labelEn || 'Variant';
        const uniqueKey = vid || `v${idx}`;
        rows.push({
          key: `${coupon.id}::${uniqueKey}`,
          couponId: coupon.id,
          variantId: vid || null,
          code: vcode,
          type: 'variant',
          variantLabel: vlabel,
          storeId: coupon.storeId,
          countryId: coupon.countryId,
          categoryId: coupon.categoryId,
          storeName,
          countryName,
          categoryName,
        uses: 0,
        uniqueUsers: 0,
        lastUsed: null,
        });
      });
    }
    return rows;
  }, [coupons, storeMap, categoryMap, countryMap]);

  const usageMap = useMemo(() => {
    const m = new Map<string, UsageMapEntry>();
    const usageTypes = ['copy', 'copy_and_shop'];
    for (const e of events) {
      if (!usageTypes.includes(e.eventType)) continue;
      const eventKey = `${e.couponId}::${e.variantId ?? 'base'}`;
      let entry = m.get(eventKey);
      if (!entry) {
        entry = { usesCount: 0, deviceIds: new Set<string>(), lastUsed: null };
        m.set(eventKey, entry);
      }
      entry.usesCount += 1;
      if (e.deviceId) entry.deviceIds.add(e.deviceId);
      const d = toDate(e.createdAt);
      if (d && (!entry.lastUsed || d > entry.lastUsed)) entry.lastUsed = d;
    }
    return m;
  }, [events]);

  const merged = useMemo(() => {
    return catalog.map((row) => {
      const entry = usageMap.get(row.key);
      return {
        ...row,
        uses: entry?.usesCount ?? 0,
        uniqueUsers: entry?.deviceIds?.size ?? 0,
        lastUsed: entry?.lastUsed ?? null,
      };
    });
  }, [catalog, usageMap]);

  const searched = useMemo(() => {
    if (!searchQuery.trim()) return merged;
    const q = searchQuery.trim().toLowerCase();
    return merged.filter((row) => {
      const codeMatch = (row.code ?? '').toLowerCase().includes(q);
      const storeMatch = (row.storeName ?? '').toLowerCase().includes(q);
      return codeMatch || storeMatch;
    });
  }, [merged, searchQuery]);

  const sorted = useMemo(() => {
    const arr = [...searched];
    arr.sort((a, b) => {
      if (sortKey === 'uses') {
        const diff = a.uses - b.uses;
        if (diff !== 0) return sortDir === 'desc' ? -diff : diff;
        const aDate = a.lastUsed?.getTime() ?? -1;
        const bDate = b.lastUsed?.getTime() ?? -1;
        return bDate - aDate;
      }
      const aDate = a.lastUsed?.getTime() ?? -1;
      const bDate = b.lastUsed?.getTime() ?? -1;
      const diff = aDate - bDate;
      if (diff !== 0) return sortDir === 'desc' ? -diff : diff;
      return b.uses - a.uses;
    });
    return arr;
  }, [searched, sortKey, sortDir]);

  const paginated = useMemo(() => {
    const end = (page + 1) * PAGE_SIZE;
    return sorted.slice(0, end);
  }, [sorted, page]);

  const hasMore = paginated.length < sorted.length;
  const totalRows = sorted.length;

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'desc' ? 'asc' : 'desc'));
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
    setPage(0);
  };

  const SortIcon = ({ column }: { column: SortKey }) => {
    if (sortKey !== column) return <ArrowUpDown className="w-3.5 h-3.5 inline opacity-50" />;
    return sortDir === 'desc' ? (
      <ArrowDown className="w-3.5 h-3.5 inline" />
    ) : (
      <ArrowUp className="w-3.5 h-3.5 inline" />
    );
  };

  if (loading) {
    return (
      <Card className="w-full" dir="rtl">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">جميع الأكواد واستخدامها</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  {[...Array(8)].map((_, i) => (
                    <TableHead key={i}>
                      <Skeleton className="h-4 w-16" />
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...Array(10)].map((_, i) => (
                  <TableRow key={i}>
                    {[...Array(8)].map((_, j) => (
                      <TableCell key={j}>
                        <Skeleton className="h-4 w-20" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full" dir="rtl">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">جميع الأكواد واستخدامها</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="rounded-md border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-right font-medium w-[100px]">الكود</TableHead>
                <TableHead className="text-right font-medium">المتجر</TableHead>
                <TableHead className="text-right font-medium w-[90px]">النوع</TableHead>
                <TableHead
                  className="text-right font-medium w-[70px] cursor-pointer select-none"
                  onClick={() => toggleSort('uses')}
                >
                  <span className="inline-flex items-center gap-1">
                    الاستخدامات
                    <SortIcon column="uses" />
                  </span>
                </TableHead>
                <TableHead className="text-right font-medium w-[80px]">مستخدمون فريدون</TableHead>
                <TableHead
                  className="text-right font-medium w-[110px] cursor-pointer select-none"
                  onClick={() => toggleSort('lastUsed')}
                >
                  <span className="inline-flex items-center gap-1">
                    آخر استخدام
                    <SortIcon column="lastUsed" />
                  </span>
                </TableHead>
                <TableHead className="text-right font-medium w-[70px]">الدولة</TableHead>
                <TableHead className="text-right font-medium w-[70px]">القسم</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                    لا توجد صفوف تطابق الفلاتر أو البحث.
                  </TableCell>
                </TableRow>
              ) : (
                paginated.map((row) => (
                  <TableRow key={row.key}>
                    <TableCell className="font-mono text-xs py-2">{row.code || '—'}</TableCell>
                    <TableCell className="text-xs py-2">{row.storeName}</TableCell>
                    <TableCell className="text-xs py-2">
                      {row.type === 'base' ? 'أساسي' : `متغير · ${row.variantLabel ?? '—'}`}
                    </TableCell>
                    <TableCell className="text-xs py-2 font-medium">{row.uses}</TableCell>
                    <TableCell className="text-xs py-2">{row.uniqueUsers}</TableCell>
                    <TableCell className="text-xs py-2 text-muted-foreground">
                      {formatLastUsed(row.lastUsed)}
                    </TableCell>
                    <TableCell className="text-xs py-2 text-muted-foreground">{row.countryName}</TableCell>
                    <TableCell className="text-xs py-2 text-muted-foreground">{row.categoryName}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs text-muted-foreground">
            عرض {paginated.length} من {totalRows}
          </span>
          {hasMore && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p + 1)}
              className="text-xs"
            >
              تحميل المزيد
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
