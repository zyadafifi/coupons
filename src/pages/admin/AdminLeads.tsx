import { useState, useMemo } from 'react';
import { Search, Download, Copy, Filter, X } from 'lucide-react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useLeads, formatLeadDate } from '@/hooks/useLeads';
import { phoneCountries } from '@/data/phone-countries';
import { toast } from 'sonner';

export default function AdminLeads() {
  const { leads, loading, error } = useLeads();
  const [searchQuery, setSearchQuery] = useState('');
  const [countryFilter, setCountryFilter] = useState<string>('all');

  // Get unique countries from leads
  const availableCountries = useMemo(() => {
    const countries = new Set(leads.map(l => l.country));
    return phoneCountries.filter(c => countries.has(c.code));
  }, [leads]);

  // Filter leads
  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      // Search filter
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = 
        !searchQuery ||
        lead.name.toLowerCase().includes(searchLower) ||
        lead.phone.includes(searchQuery);

      // Country filter
      const matchesCountry = countryFilter === 'all' || lead.country === countryFilter;

      return matchesSearch && matchesCountry;
    });
  }, [leads, searchQuery, countryFilter]);

  // Get country info
  const getCountryInfo = (code: string) => {
    return phoneCountries.find(c => c.code === code);
  };

  // Export to CSV
  const exportToCSV = () => {
    const headers = ['الاسم', 'رقم الهاتف', 'البلد', 'تاريخ التسجيل'];
    const rows = filteredLeads.map(lead => {
      const country = getCountryInfo(lead.country);
      return [
        lead.name,
        `${lead.countryCode}${lead.phone}`,
        country?.nameAr || lead.country,
        formatLeadDate(lead.createdAt),
      ];
    });

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');

    // Add BOM for Arabic support
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `leads_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    toast.success(`تم تصدير ${filteredLeads.length} سجل`);
  };

  // Copy all to clipboard
  const copyToClipboard = () => {
    const text = filteredLeads.map(lead => {
      const country = getCountryInfo(lead.country);
      return `${lead.name} | ${lead.countryCode}${lead.phone} | ${country?.nameAr || lead.country}`;
    }).join('\n');

    navigator.clipboard.writeText(text);
    toast.success('تم نسخ البيانات');
  };

  const clearFilters = () => {
    setSearchQuery('');
    setCountryFilter('all');
  };

  const hasActiveFilters = searchQuery || countryFilter !== 'all';

  return (
    <AdminLayout title="العملاء المحتملين">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-card border rounded-lg p-4">
            <p className="text-sm text-muted-foreground">إجمالي العملاء</p>
            <p className="text-2xl font-bold">{leads.length}</p>
          </div>
          {availableCountries.slice(0, 3).map(country => (
            <div key={country.code} className="bg-card border rounded-lg p-4">
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <span>{country.flag}</span>
                {country.nameAr}
              </p>
              <p className="text-2xl font-bold">
                {leads.filter(l => l.country === country.code).length}
              </p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="بحث بالاسم أو الهاتف..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={countryFilter} onValueChange={setCountryFilter}>
            <SelectTrigger className="w-[180px]">
              <Filter className="h-4 w-4 ml-2" />
              <SelectValue placeholder="فلترة بالبلد" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع البلدان</SelectItem>
              {availableCountries.map(country => (
                <SelectItem key={country.code} value={country.code}>
                  <span className="flex items-center gap-2">
                    <span>{country.flag}</span>
                    {country.nameAr}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {hasActiveFilters && (
            <Button variant="ghost" size="icon" onClick={clearFilters}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportToCSV} disabled={filteredLeads.length === 0}>
            <Download className="h-4 w-4 ml-2" />
            تصدير CSV
          </Button>
          <Button variant="outline" onClick={copyToClipboard} disabled={filteredLeads.length === 0}>
            <Copy className="h-4 w-4 ml-2" />
            نسخ الكل
          </Button>
          {hasActiveFilters && (
            <Badge variant="secondary" className="self-center">
              {filteredLeads.length} نتيجة
            </Badge>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="bg-destructive/10 text-destructive p-4 rounded-lg">
            خطأ في تحميل البيانات: {error}
          </div>
        )}

        {/* Table */}
        <div className="bg-card border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">الاسم</TableHead>
                <TableHead className="text-right">رقم الهاتف</TableHead>
                <TableHead className="text-right">البلد</TableHead>
                <TableHead className="text-right">تاريخ التسجيل</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  </TableRow>
                ))
              ) : filteredLeads.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    {leads.length === 0 ? 'لا توجد بيانات بعد' : 'لا توجد نتائج مطابقة'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredLeads.map((lead) => {
                  const country = getCountryInfo(lead.country);
                  return (
                    <TableRow key={lead.id}>
                      <TableCell className="font-medium">{lead.name}</TableCell>
                      <TableCell dir="ltr" className="text-right">
                        <a 
                          href={`tel:${lead.countryCode}${lead.phone}`}
                          className="text-primary hover:underline"
                        >
                          {lead.countryCode} {lead.phone}
                        </a>
                      </TableCell>
                      <TableCell>
                        <span className="flex items-center gap-1.5">
                          <span>{country?.flag}</span>
                          <span className="text-sm">{country?.nameAr || lead.country}</span>
                        </span>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {formatLeadDate(lead.createdAt)}
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
