import { Link } from 'react-router-dom';
import { useState, useMemo } from 'react';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Globe, Tags, Store, Ticket, LogOut, LayoutDashboard, Users, Settings, AlertCircle, Filter } from 'lucide-react';
import { useCoupons, useStores, useCategories, useCountries, useCouponEvents } from '@/hooks/useFirestore';
import { useReports } from '@/hooks/useReports';
import { CouponStatsPanel } from '@/components/admin/CouponStatsPanel';

export default function AdminDashboard() {
  const { user, logout } = useAdminAuth();

  // Filters state
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

  // Filter coupons based on selected filters
  const filteredCoupons = useMemo(() => {
    return allCoupons.filter((coupon) => {
      if (selectedStoreId !== 'all' && coupon.storeId !== selectedStoreId) return false;
      if (selectedCountryId !== 'all' && coupon.countryId !== selectedCountryId) return false;
      if (selectedCategoryId !== 'all' && coupon.categoryId !== selectedCategoryId) return false;
      return true;
    });
  }, [allCoupons, selectedStoreId, selectedCountryId, selectedCategoryId]);

  // Filter reports based on filtered coupons
  const filteredReports = useMemo(() => {
    const couponIds = new Set(filteredCoupons.map((c) => c.id));
    return reports.filter((r) => couponIds.has(r.couponId));
  }, [reports, filteredCoupons]);

  const loading = couponsLoading || storesLoading || categoriesLoading || countriesLoading || eventsLoading || reportsLoading;

  const menuItems = [
    {
      title: 'إدارة الدول',
      description: 'إضافة وتعديل وحذف الدول',
      icon: Globe,
      href: '/admin/countries',
      color: 'bg-blue-500',
    },
    {
      title: 'إدارة التصنيفات',
      description: 'إضافة وتعديل وحذف التصنيفات',
      icon: Tags,
      href: '/admin/categories',
      color: 'bg-green-500',
    },
    {
      title: 'إدارة المتاجر',
      description: 'إضافة وتعديل وحذف المتاجر',
      icon: Store,
      href: '/admin/stores',
      color: 'bg-purple-500',
    },
    {
      title: 'إدارة الكوبونات',
      description: 'إضافة وتعديل وحذف الكوبونات',
      icon: Ticket,
      href: '/admin/coupons',
      color: 'bg-orange-500',
    },
    {
      title: 'العملاء المحتملين',
      description: 'عرض وتصدير بيانات العملاء',
      icon: Users,
      href: '/admin/leads',
      color: 'bg-pink-500',
    },
    {
      title: 'تقارير الكوبونات',
      description: 'عرض البلاغات عن الكوبونات غير العاملة',
      icon: AlertCircle,
      href: '/admin/reports',
      color: 'bg-red-500',
    },
    {
      title: 'الإعدادات',
      description: 'إعدادات التطبيق واللوجو والبنرات',
      icon: Settings,
      href: '/admin/settings',
      color: 'bg-gray-500',
    },
  ];

  return (
    <div className="min-h-screen bg-muted/30" dir="rtl">
      {/* Header */}
      <div className="bg-background border-b">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <LayoutDashboard className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-bold text-lg">لوحة التحكم</h1>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={logout}>
            <LogOut className="w-4 h-4 ml-2" />
            تسجيل الخروج
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Panel with Filters */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">لوحة الإحصائيات</h2>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">فلاتر</span>
            </div>
          </div>

          {/* Filters Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            {/* Store Filter */}
            <Select value={selectedStoreId} onValueChange={setSelectedStoreId}>
              <SelectTrigger>
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
              <SelectTrigger>
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
              <SelectTrigger>
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
              <SelectTrigger>
                <SelectValue placeholder="اليوم" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">اليوم</SelectItem>
                <SelectItem value="last7days">آخر 7 أيام</SelectItem>
                <SelectItem value="last30days">آخر 30 يوم</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Stats Panel */}
          <CouponStatsPanel
            coupons={filteredCoupons}
            stores={stores}
            categories={categories}
            countries={countries}
            events={events}
            reports={filteredReports}
            loading={loading}
            storeId={selectedStoreId !== 'all' ? selectedStoreId : undefined}
            countryId={selectedCountryId !== 'all' ? selectedCountryId : undefined}
            categoryId={selectedCategoryId !== 'all' ? selectedCategoryId : undefined}
          />
        </div>

        {/* Admin Menu Grid */}
        <h2 className="text-xl font-bold mb-6 mt-12">مرحباً بك في لوحة التحكم</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {menuItems.map((item) => (
            <Link key={item.href} to={item.href}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 ${item.color} rounded-lg flex items-center justify-center`}>
                      <item.icon className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-lg">{item.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">{item.description}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
