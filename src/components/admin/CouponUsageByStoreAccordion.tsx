import { useState, useMemo, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  FirestoreCoupon,
  FirestoreStore,
  FirestoreCategory,
  FirestoreCountry,
  FirestoreCouponEvent,
  FirestoreReport,
  CouponVariant,
} from '@/data/types';

const ROWS_PER_STORE = 50;

/** Normalize Firestore Timestamp to Date */
function toDate(ts: unknown): Date | null {
  if (!ts) return null;
  const t = ts as { toDate?: () => Date };
  if (typeof t.toDate === 'function') return t.toDate();
  if (ts instanceof Date) return ts;
  const d = new Date(ts as string | number);
  return isNaN(d.getTime()) ? null : d;
}

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

function formatExpiry(ts: unknown): string {
  const d = toDate(ts);
  if (!d) return '—';
  return d.toLocaleDateString('ar-SA', { year: 'numeric', month: 'short', day: 'numeric' });
}

export type CodeStatus = 'active' | 'inactive' | 'expiring_soon' | 'expired';

function getStatus(isActive: boolean, expiryDate: unknown): CodeStatus {
  const exp = toDate(expiryDate);
  const now = new Date();
  const sevenDays = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  if (exp && exp < now) return 'expired';
  if (exp && exp <= sevenDays) return 'expiring_soon';
  if (!isActive) return 'inactive';
  return 'active';
}

export interface CodeCatalogRow {
  key: string;
  couponId: string;
  variantId: string | null;
  code: string;
  type: 'base' | 'variant';
  variantLabel: string | null;
  discountLabel: string;
  isActive: boolean;
  expiryDate: unknown;
  status: CodeStatus;
  storeId: string;
  countryId: string;
  categoryId: string;
  storeName: string;
  countryName: string;
  categoryName: string;
  uses: number;
  lastUsed: Date | null;
  reportsCount: number;
}

interface UsageMapEntry {
  usesCount: number;
  lastUsed: Date | null;
}

interface StoreGroup {
  storeId: string;
  storeName: string;
  totalCodes: number;
  totalUses: number;
  lastUsed: Date | null;
  rows: CodeCatalogRow[];
}

export interface CouponUsageByStoreAccordionProps {
  coupons: FirestoreCoupon[];
  events: FirestoreCouponEvent[];
  reports: FirestoreReport[];
  stores: FirestoreStore[];
  categories: FirestoreCategory[];
  countries: FirestoreCountry[];
  searchQuery: string;
  loading?: boolean;
}

export function CouponUsageByStoreAccordion({
  coupons,
  events,
  reports,
  stores,
  categories,
  countries,
  searchQuery,
  loading,
}: CouponUsageByStoreAccordionProps) {
  const [expandedStore, setExpandedStore] = useState<string | null>(null);
  const [showAllByStore, setShowAllByStore] = useState<Record<string, boolean>>({});

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

  const reportsByCouponId = useMemo(() => {
    const m = new Map<string, number>();
    for (const r of reports) {
      m.set(r.couponId, (m.get(r.couponId) ?? 0) + 1);
    }
    return m;
  }, [reports]);

  const catalog: CodeCatalogRow[] = useMemo(() => {
    const rows: CodeCatalogRow[] = [];
    for (const coupon of coupons) {
      const store = storeMap.get(coupon.storeId);
      const category = categoryMap.get(coupon.categoryId);
      const country = countryMap.get(coupon.countryId);
      const storeName = store?.nameAr || store?.nameEn || '—';
      const categoryName = category?.nameAr || category?.nameEn || '—';
      const countryName = country?.nameAr || country?.nameEn || '—';
      const isActive = coupon.isActive ?? true;
      const expiryDate = coupon.expiryDate;

      const baseCode = coupon.code ?? '';
      const baseStatus = getStatus(isActive, expiryDate);
      const reportsCount = reportsByCouponId.get(coupon.id) ?? 0;

      rows.push({
        key: `${coupon.id}::base`,
        couponId: coupon.id,
        variantId: null,
        code: baseCode,
        type: 'base',
        variantLabel: null,
        discountLabel: coupon.discountLabel ?? '—',
        isActive,
        expiryDate,
        status: baseStatus,
        storeId: coupon.storeId,
        countryId: coupon.countryId,
        categoryId: coupon.categoryId,
        storeName,
        countryName,
        categoryName,
        uses: 0,
        lastUsed: null,
        reportsCount,
      });

      const variants = coupon.variants ?? [];
      variants.forEach((v, idx) => {
        const vid = (v as CouponVariant)?.id ?? '';
        const vcode = (v as CouponVariant)?.code ?? '';
        const vlabel = (v as CouponVariant)?.labelAr || (v as CouponVariant)?.labelEn || 'Variant';
        const vdiscount = (v as CouponVariant)?.discountLabel ?? coupon.discountLabel ?? '—';
        const uniqueKey = vid || `v${idx}`;

        rows.push({
          key: `${coupon.id}::${uniqueKey}`,
          couponId: coupon.id,
          variantId: vid || null,
          code: vcode,
          type: 'variant',
          variantLabel: vlabel,
          discountLabel: vdiscount,
          isActive,
          expiryDate,
          status: baseStatus,
          storeId: coupon.storeId,
          countryId: coupon.countryId,
          categoryId: coupon.categoryId,
          storeName,
          countryName,
          categoryName,
          uses: 0,
          lastUsed: null,
          reportsCount,
        });
      });
    }
    return rows;
  }, [coupons, storeMap, categoryMap, countryMap, reportsByCouponId]);

  const usageMap = useMemo(() => {
    const m = new Map<string, UsageMapEntry>();
    const usageTypes = ['copy', 'copy_and_shop'];
    for (const e of events) {
      if (!usageTypes.includes(e.eventType)) continue;
      const eventKey = `${e.couponId}::${e.variantId ?? 'base'}`;
      let entry = m.get(eventKey);
      if (!entry) {
        entry = { usesCount: 0, lastUsed: null };
        m.set(eventKey, entry);
      }
      entry.usesCount += 1;
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

  const groupedByStore = useMemo((): StoreGroup[] => {
    const byStore = new Map<string, CodeCatalogRow[]>();
    for (const row of searched) {
      const list = byStore.get(row.storeId) ?? [];
      list.push(row);
      byStore.set(row.storeId, list);
    }
    const groups: StoreGroup[] = [];
    byStore.forEach((rows, storeId) => {
      const store = storeMap.get(storeId);
      const storeName = store?.nameAr || store?.nameEn || '—';
      rows.sort((a, b) => {
        const u = b.uses - a.uses;
        if (u !== 0) return u;
        const ad = a.lastUsed?.getTime() ?? -1;
        const bd = b.lastUsed?.getTime() ?? -1;
        return bd - ad;
      });
      const totalUses = rows.reduce((s, r) => s + r.uses, 0);
      const lastUsed = rows.reduce<Date | null>((max, r) => {
        if (!r.lastUsed) return max;
        if (!max || r.lastUsed > max) return r.lastUsed;
        return max;
      }, null);
      groups.push({
        storeId,
        storeName,
        totalCodes: rows.length,
        totalUses,
        lastUsed,
        rows,
      });
    });
    groups.sort((a, b) => b.totalUses - a.totalUses);
    return groups;
  }, [searched, storeMap]);

  useEffect(() => {
    if (expandedStore !== null) return;
    const first = groupedByStore[0];
    if (first) setExpandedStore(first.storeId);
  }, [groupedByStore, expandedStore]);

  const toggleShowAll = (storeId: string) => {
    setShowAllByStore((prev) => ({ ...prev, [storeId]: !prev[storeId] }));
  };

  if (loading) {
    return (
      <div className="space-y-4" dir="rtl">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (groupedByStore.length === 0) {
    return (
      <div className="rounded-md border bg-muted/30 py-12 text-center text-sm text-muted-foreground" dir="rtl">
        لا توجد أكواد تطابق الفلاتر أو البحث.
      </div>
    );
  }

  const statusLabel: Record<CodeStatus, string> = {
    active: 'نشط',
    inactive: 'غير نشط',
    expiring_soon: 'ينتهي قريباً',
    expired: 'منتهي',
  };

  const statusVariant: Record<CodeStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    active: 'default',
    inactive: 'secondary',
    expiring_soon: 'outline',
    expired: 'destructive',
  };

  return (
    <Accordion
      type="single"
      collapsible
      value={expandedStore ?? undefined}
      onValueChange={(v) => setExpandedStore(v || null)}
      className="w-full"
      dir="rtl"
    >
      {groupedByStore.map((g) => {
        const showAll = showAllByStore[g.storeId];
        const visibleRows = showAll ? g.rows : g.rows.slice(0, ROWS_PER_STORE);
        const hasMore = g.rows.length > ROWS_PER_STORE;

        return (
          <AccordionItem key={g.storeId} value={g.storeId}>
            <AccordionTrigger className="hover:no-underline">
              <div className="flex flex-wrap items-center justify-between gap-4 text-right w-full pr-2">
                <span className="font-semibold">{g.storeName}</span>
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <span>الأكواد: {g.totalCodes}</span>
                  <span>الاستخدامات: {g.totalUses ? g.totalUses : '—'}</span>
                  <span>آخر استخدام: {formatLastUsed(g.lastUsed)}</span>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="text-center font-medium w-[100px]">الكود</TableHead>
                      <TableHead className="text-center font-medium w-[90px]">النوع</TableHead>
                      <TableHead className="text-center font-medium w-[80px]">الخصم</TableHead>
                      <TableHead className="text-center font-medium w-[90px]">الحالة</TableHead>
                      <TableHead className="text-center font-medium w-[70px]">الاستخدامات</TableHead>
                      <TableHead className="text-center font-medium w-[110px]">آخر استخدام</TableHead>
                      <TableHead className="text-center font-medium w-[85px]">انتهاء الصلاحية</TableHead>
                      <TableHead className="text-center font-medium w-[70px]">التقارير</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {visibleRows.map((row) => (
                      <TableRow key={row.key}>
                        <TableCell className="font-mono text-xs py-2 text-center">{row.code || '—'}</TableCell>
                        <TableCell className="text-xs py-2 text-center">
                          {row.type === 'base' ? 'أساسي' : `متغير · ${row.variantLabel ?? '—'}`}
                        </TableCell>
                        <TableCell className="text-xs py-2 text-center">{row.discountLabel}</TableCell>
                        <TableCell className="text-xs py-2 text-center">
                          <div className="flex justify-center">
                            <Badge variant={statusVariant[row.status]} className="text-xs">
                              {statusLabel[row.status]}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs py-2 font-medium text-center">{row.uses ? row.uses : '—'}</TableCell>
                        <TableCell className="text-xs py-2 text-muted-foreground text-center">
                          {formatLastUsed(row.lastUsed)}
                        </TableCell>
                        <TableCell className="text-xs py-2 text-muted-foreground text-center">
                          {formatExpiry(row.expiryDate)}
                        </TableCell>
                        <TableCell className="text-xs py-2 text-center">{row.reportsCount}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {hasMore && (
                <div className="mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleShowAll(g.storeId)}
                    className="text-xs"
                  >
                    {showAll ? 'إظهار أقل' : `عرض كل الأكواد (${g.rows.length})`}
                  </Button>
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}
