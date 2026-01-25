import { useState, useMemo } from 'react';
import { Search, AlertCircle, X, Trash2 } from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useReports, formatReportDate, deleteReport } from '@/hooks/useReports';
import { useCoupons, useStores, useCountries } from '@/hooks/useFirestore';
import { toast } from 'sonner';

export default function AdminReports() {
  const { reports, loading: reportsLoading, error } = useReports();
  const { data: coupons = [], loading: couponsLoading } = useCoupons();
  const { data: stores = [] } = useStores();
  const { data: countries = [] } = useCountries();
  const [searchQuery, setSearchQuery] = useState('');

  const loading = reportsLoading || couponsLoading;

  // Create maps for quick lookup
  const couponsMap = useMemo(() => {
    const map = new Map();
    coupons.forEach(coupon => {
      map.set(coupon.id, coupon);
    });
    return map;
  }, [coupons]);

  const storesMap = useMemo(() => {
    const map = new Map();
    stores.forEach(store => {
      map.set(store.id, store);
    });
    return map;
  }, [stores]);

  const countriesMap = useMemo(() => {
    const map = new Map();
    countries.forEach(country => {
      map.set(country.id, country);
    });
    return map;
  }, [countries]);

  // Filter reports
  const filteredReports = useMemo(() => {
    return reports.filter(report => {
      // Search filter by code or store name
      const searchLower = searchQuery.toLowerCase();
      const coupon = couponsMap.get(report.couponId);
      const store = coupon ? storesMap.get(coupon.storeId) : null;
      const storeName = store?.nameAr || store?.nameEn || '';
      
      const matchesSearch = 
        !searchQuery ||
        report.code.toLowerCase().includes(searchLower) ||
        storeName.toLowerCase().includes(searchLower);

      return matchesSearch;
    });
  }, [reports, searchQuery, couponsMap, storesMap]);

  // Handle delete report
  const handleDelete = async (reportId: string, code: string) => {
    if (!window.confirm(`هل أنت متأكد من حذف البلاغ عن الكود "${code}"؟`)) {
      return;
    }

    try {
      await deleteReport(reportId);
      toast.success('تم حذف البلاغ بنجاح');
    } catch (error) {
      console.error('Error deleting report:', error);
      toast.error('فشل حذف البلاغ. يرجى المحاولة مرة أخرى');
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
  };

  const hasActiveFilters = !!searchQuery;

  return (
    <AdminLayout title="تقارير الكوبونات">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-card border rounded-lg p-4">
            <p className="text-sm text-muted-foreground">إجمالي التقارير</p>
            <p className="text-2xl font-bold">{reports.length}</p>
          </div>
          <div className="bg-card border rounded-lg p-4">
            <p className="text-sm text-muted-foreground">تقارير اليوم</p>
            <p className="text-2xl font-bold">
              {reports.filter(r => {
                if (!r.createdAt) return false;
                try {
                  const date = r.createdAt.toDate ? r.createdAt.toDate() : new Date(r.createdAt);
                  const today = new Date();
                  return date.toDateString() === today.toDateString();
                } catch {
                  return false;
                }
              }).length}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="بحث بالكود أو المتجر..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          {hasActiveFilters && (
            <Button variant="ghost" size="icon" onClick={clearFilters}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Active Filters Badge */}
        {hasActiveFilters && (
          <div className="flex gap-2">
            <Badge variant="secondary" className="self-center">
              {filteredReports.length} نتيجة
            </Badge>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-destructive/10 text-destructive p-4 rounded-lg flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            <span>خطأ في تحميل البيانات: {error}</span>
          </div>
        )}

        {/* Table */}
        <div className="bg-card border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-center">الكود</TableHead>
                <TableHead className="text-center">المتجر</TableHead>
                <TableHead className="text-center">الدولة</TableHead>
                <TableHead className="text-center">تاريخ البلاغ</TableHead>
                <TableHead className="text-center">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  </TableRow>
                ))
              ) : filteredReports.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    {reports.length === 0 ? 'لا توجد تقارير بعد' : 'لا توجد نتائج مطابقة'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredReports.map((report) => {
                  const coupon = couponsMap.get(report.couponId);
                  const store = coupon ? storesMap.get(coupon.storeId) : null;
                  const country = coupon ? countriesMap.get(coupon.countryId) : null;
                  
                  return (
                    <TableRow key={report.id}>
                      <TableCell className="font-medium font-mono text-center">
                        {report.code}
                      </TableCell>
                      <TableCell className="text-center">
                        {store ? (store.nameAr || store.nameEn || '—') : '—'}
                      </TableCell>
                      <TableCell className="text-center">
                        {country ? (country.flag || '—') : '—'}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm text-center">
                        {formatReportDate(report.createdAt)}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex justify-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(report.id, report.code)}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </AdminLayout>
  );
}
