import { Tag, Clock, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { notifications } from '@/data/dummy-data';
import { EmptyState } from '@/components/shared/EmptyState';
import { cn } from '@/lib/utils';

export default function Notifications() {
  const navigate = useNavigate();

  const getIcon = (type: string) => {
    switch (type) {
      case 'new_coupon':
        return <Tag className="w-5 h-5" />;
      case 'expiring':
        return <Clock className="w-5 h-5" />;
      default:
        return <Info className="w-5 h-5" />;
    }
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case 'new_coupon':
        return 'bg-green-100 text-green-600';
      case 'expiring':
        return 'bg-orange-100 text-orange-600';
      default:
        return 'bg-blue-100 text-blue-600';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return 'الآن';
    if (diffHours < 24) return `منذ ${diffHours} ساعة`;
    if (diffDays === 1) return 'أمس';
    if (diffDays < 7) return `منذ ${diffDays} أيام`;
    return date.toLocaleDateString('ar-SA');
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="px-4 pt-12 pb-4">
        <h1 className="text-2xl font-bold text-foreground">الإشعارات</h1>
        <p className="text-muted-foreground text-sm">آخر التحديثات والعروض</p>
      </div>

      {/* Content */}
      <div className="px-4 pb-4">
        {notifications.length > 0 ? (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => notification.couponId && navigate(`/coupon/${notification.couponId}`)}
                className={cn(
                  "bg-card rounded-2xl p-4 border transition-all",
                  notification.isRead 
                    ? "border-border" 
                    : "border-primary/30 bg-primary/5",
                  notification.couponId && "cursor-pointer active:scale-[0.98]"
                )}
              >
                <div className="flex gap-3">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                    getIconColor(notification.type)
                  )}>
                    {getIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className={cn(
                        "font-semibold text-foreground",
                        !notification.isRead && "text-primary"
                      )}>
                        {notification.title}
                      </h3>
                      {!notification.isRead && (
                        <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-2" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {notification.message}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {formatDate(notification.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon="🔔"
            title="لا توجد إشعارات"
            description="ستظهر هنا الإشعارات الجديدة والعروض الحصرية"
          />
        )}
      </div>
    </div>
  );
}
