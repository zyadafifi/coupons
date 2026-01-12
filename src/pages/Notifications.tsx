import { useEffect } from 'react';
import { useNotifications, markNotificationAsRead } from '@/hooks/useFirestore';
import { getDeviceId } from '@/hooks/useLeads';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Bell, Check, X, Package } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Notifications() {
  const deviceId = getDeviceId();
  const { data: notifications, loading } = useNotifications(deviceId);

  // Mark all as read when viewing
  useEffect(() => {
    const unreadNotifications = notifications.filter((n) => !n.isRead);
    unreadNotifications.forEach((notification) => {
      markNotificationAsRead(notification.id).catch(console.error);
    });
  }, [notifications]);

  const formatDate = (timestamp: any) => {
    if (!timestamp?.toDate) return '';
    const date = timestamp.toDate();
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'الآن';
    if (diffMins < 60) return `منذ ${diffMins} دقيقة`;
    if (diffHours < 24) return `منذ ${diffHours} ساعة`;
    if (diffDays < 7) return `منذ ${diffDays} يوم`;

    return new Intl.DateTimeFormat('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'store_request_approved':
        return <Check className="w-5 h-5 text-green-600" />;
      case 'store_request_rejected':
        return <X className="w-5 h-5 text-red-600" />;
      default:
        return <Bell className="w-5 h-5 text-primary" />;
    }
  };

  const getNotificationStyle = (type: string) => {
    switch (type) {
      case 'store_request_approved':
        return 'bg-green-50 border-green-200';
      case 'store_request_rejected':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-background border-border';
    }
  };

  return (
    <div className="min-h-screen pb-20 bg-background">
      {/* Header */}
      <div className="px-4 pt-12 pb-4 border-b bg-background sticky top-0 z-10">
        <h1 className="text-2xl font-bold text-foreground">الإشعارات</h1>
        <p className="text-sm text-muted-foreground mt-1">
          تحديثات حول طلباتك وعروضك
        </p>
      </div>

      {/* Notifications List */}
      <div className="px-4 py-4">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-card rounded-2xl p-4 border">
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-3 w-full mb-2" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 mx-auto bg-muted rounded-2xl flex items-center justify-center mb-4">
              <Bell className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              لا توجد إشعارات
            </h3>
            <p className="text-sm text-muted-foreground">
              سنرسل لك إشعاراً عند توفر تحديثات جديدة
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={cn(
                  'rounded-2xl p-4 border transition-all',
                  getNotificationStyle(notification.type)
                )}
              >
                <div className="flex gap-3">
                  <div className="shrink-0 w-10 h-10 rounded-xl bg-background/50 flex items-center justify-center">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground mb-1">
                      {notification.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
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
        )}
      </div>
    </div>
  );
}
