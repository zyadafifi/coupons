import { useState, useMemo } from 'react';
import { Search, AlertCircle, X } from 'lucide-react';
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
import { useReports, formatReportDate } from '@/hooks/useReports';

export default function AdminReports() {
  const { reports, loading, error } = useReports();
  const [searchQuery, setSearchQuery] = useState('');

  // Filter reports
  const filteredReports = useMemo(() => {
    return reports.filter(report => {
      // Search filter by code or coupon ID
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = 
        !searchQuery ||
        report.code.toLowerCase().includes(searchLower) ||
        report.couponId.toLowerCase().includes(searchLower) ||
        (report.variantId && report.variantId.toLowerCase().includes(searchLower));

      return matchesSearch;
    });
  }, [reports, searchQuery]);

  const clearFilters = () => {
    setSearchQuery('');
  };

  const hasActiveFilters = !!searchQuery;

  return (
    <AdminLayout title="تقارير الكوبونات">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
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
          <div className="bg-card border rounded-lg p-4">
            <p className="text-sm text-muted-foreground">كوبونات فريدة</p>
            <p className="text-2xl font-bold">
              {new Set(reports.map(r => r.couponId)).size}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="بحث بالكود أو معرف الكوبون..."
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
                <TableHead className="text-right">الكود</TableHead>
                <TableHead className="text-right">معرف الكوبون</TableHead>
                <TableHead className="text-right">معرف المتغير</TableHead>
                <TableHead className="text-right">تاريخ البلاغ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  </TableRow>
                ))
              ) : filteredReports.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    {reports.length === 0 ? 'لا توجد تقارير بعد' : 'لا توجد نتائج مطابقة'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredReports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell className="font-medium font-mono">
                      {report.code}
                    </TableCell>
                    <TableCell className="font-mono text-sm text-muted-foreground">
                      {report.couponId}
                    </TableCell>
                    <TableCell className="font-mono text-sm text-muted-foreground">
                      {report.variantId || '-'}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {formatReportDate(report.createdAt)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </AdminLayout>
  );
}
