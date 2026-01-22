import { Link } from 'react-router-dom';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Globe, Tags, Store, Ticket, LogOut, LayoutDashboard, Users, Settings, AlertCircle, BarChart3, PackagePlus } from 'lucide-react';

export default function AdminDashboard() {
  const { user, logout } = useAdminAuth();

  const menuItems = [
    {
      title: 'الإحصائيات',
      description: 'عرض إحصائيات الكوبونات والاستخدام',
      icon: BarChart3,
      href: '/admin/statistics',
      color: 'bg-indigo-500',
    },
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
      title: 'طلبات المتاجر',
      description: 'مراجعة وقبول طلبات إضافة المتاجر',
      icon: PackagePlus,
      href: '/admin/store-requests',
      color: 'bg-cyan-500',
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
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h2 className="text-xl font-bold mb-6">مرحباً بك في لوحة التحكم</h2>
        
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
