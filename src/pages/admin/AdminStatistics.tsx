import { useState, useMemo } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter } from 'lucide-react';
import { useCoupons, useStores, useCategories, useCountries, useCouponEvents } from '@/hooks/useFirestore';
import { useReports } from '@/hooks/useReports';
import { CompactCouponStats } from '@/components/admin/CompactCouponStats';
import { CouponUsageByStoreAccordion } from '@/components/admin/CouponUsageByStoreAccordion';

export default function AdminStatistics() {
  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStoreId, setSelectedStoreId] = useState<string>('all');
  const [selectedCountryId, setSelectedCountryId] = useState<string>('all');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [dateRange, setDateRange] = useState<string>('today');

  // Fetch all data
  const { data: allCoupons, loading: couponsLoading } = useCoupons();
  const { data: stores, loading: storesLoading } = useStores();
  const { data: categories, loading: categoriesLoading } = useCategories();
  const { data: countries, loading: countriesLoading } = useCountries();
  const { reports, loading: reportsLoading } = useReports();

  // Calculate date range for events
  const eventDateRange = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch (dateRange) {
      case 'today':
        return { from: startOfToday, to: new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000) };
      case 'last7days': {
        const from = new Date(startOfToday.getTime() - 7 * 24 * 60 * 60 * 1000);
        return { from, to: new Date() };
      }
      case 'last30days': {
        const from = new Date(startOfToday.getTime() - 30 * 24 * 60 * 60 * 1000);
        return { from, to: new Date() };
      }
      default:
        return { from: startOfToday, to: new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000) };
    }
  }, [dateRange]);

  // Fetch events with date range and filters
  const { events, loading: eventsLoading } = useCouponEvents({
    from: eventDateRange.from,
    to: eventDateRange.to,
    eventTypes: ['copy', 'copy_and_shop'],
    storeId: selectedStoreId !== 'all' ? selectedStoreId : undefined,
    countryId: selectedCountryId !== 'all' ? selectedCountryId : undefined,
    categoryId: selectedCategoryId !== 'all' ? selectedCategoryId : undefined,
  });

  // Catalog: filter by store/country/category only (no search). Used for summary + usage table.
  const couponsForCatalog = useMemo(() => {
    return allCoupons.filter((coupon) => {
      if (selectedStoreId !== 'all' && coupon.storeId !== selectedStoreId) return false;
      if (selectedCountryId !== 'all' && coupon.countryId !== selectedCountryId) return false;
      if (selectedCategoryId !== 'all' && coupon.categoryId !== selectedCategoryId) return false;
      return true;
    });
  }, [allCoupons, selectedStoreId, selectedCountryId, selectedCategoryId]);

  const loading = couponsLoading || storesLoading || categoriesLoading || countriesLoading || eventsLoading || reportsLoading;

  return (
    <AdminLayout title="الإحصائيات">
      <div className="space-y-6">
        {/* Search and Filters */}
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="ابحث عن متجر أو كوبون..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10"
            />
          </div>

          {/* Filters Row */}
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-4 h-4 text-muted-foreground shrink-0" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 flex-1">
              {/* Store Filter */}
              <Select value={selectedStoreId} onValueChange={setSelectedStoreId}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="كل المتاجر" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">كل المتاجر</SelectItem>
                  {stores.map((store) => (
                    <SelectItem key={store.id} value={store.id}>
                      {store.nameAr}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Country Filter */}
              <Select value={selectedCountryId} onValueChange={setSelectedCountryId}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="كل الدول" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">كل الدول</SelectItem>
                  {countries.map((country) => (
                    <SelectItem key={country.id} value={country.id}>
                      {country.nameAr}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Category Filter */}
              <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="كل الأقسام" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">كل الأقسام</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.nameAr}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Date Range Filter */}
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="اليوم" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">اليوم</SelectItem>
                  <SelectItem value="last7days">آخر 7 أيام</SelectItem>
                  <SelectItem value="last30days">آخر 30 يوم</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Summary card */}
        <div>
          <CompactCouponStats
            coupons={couponsForCatalog}
            events={events}
            loading={loading}
            storeName={selectedStoreId !== 'all' ? stores.find(s => s.id === selectedStoreId)?.nameAr : undefined}
          />
        </div>

        {/* Store accordion (main view) */}
        <div>
          <CouponUsageByStoreAccordion
            coupons={couponsForCatalog}
            events={events}
            reports={reports}
            stores={stores}
            categories={categories}
            countries={countries}
            searchQuery={searchQuery}
            loading={loading}
          />
        </div>
      </div>
    </AdminLayout>
  );
}
