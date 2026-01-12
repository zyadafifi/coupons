import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  Globe, 
  Tags, 
  Store, 
  Ticket, 
  LogOut,
  Settings,
  ChevronRight,
  PackagePlus
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AdminLayoutProps {
  children: ReactNode;
  title: string;
}

export function AdminLayout({ children, title }: AdminLayoutProps) {
  const { user, logout } = useAdminAuth();
  const location = useLocation();

  const navItems = [
    { href: '/admin', label: 'الرئيسية', icon: LayoutDashboard },
    { href: '/admin/countries', label: 'الدول', icon: Globe },
    { href: '/admin/categories', label: 'التصنيفات', icon: Tags },
    { href: '/admin/stores', label: 'المتاجر', icon: Store },
    { href: '/admin/store-requests', label: 'طلبات المتاجر', icon: PackagePlus },
    { href: '/admin/coupons', label: 'الكوبونات', icon: Ticket },
    { href: '/admin/settings', label: 'الإعدادات', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-muted/30" dir="rtl">
      {/* Header */}
      <div className="bg-background border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/admin" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <LayoutDashboard className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-bold">لوحة التحكم</span>
            </Link>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">{title}</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden sm:block">{user?.email}</span>
            <Button variant="ghost" size="sm" onClick={logout}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto flex">
        {/* Sidebar */}
        <div className="w-48 shrink-0 border-l bg-background min-h-[calc(100vh-57px)] hidden md:block">
          <nav className="p-2 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors',
                  location.pathname === item.href
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted'
                )}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
