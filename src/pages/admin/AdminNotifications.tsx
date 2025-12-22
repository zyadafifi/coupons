import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { Send, Bell, Globe, CheckCircle, XCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

interface AdminNotification {
  id: string;
  title: string;
  body: string;
  target_topic: string;
  country_code: string | null;
  status: string;
  created_at: string;
  sent_at: string | null;
}

const COUNTRIES = [
  { code: 'eg', name: 'مصر', flag: '🇪🇬' },
  { code: 'sa', name: 'السعودية', flag: '🇸🇦' },
  { code: 'ae', name: 'الإمارات', flag: '🇦🇪' },
  { code: 'kw', name: 'الكويت', flag: '🇰🇼' },
  { code: 'qa', name: 'قطر', flag: '🇶🇦' },
  { code: 'bh', name: 'البحرين', flag: '🇧🇭' },
  { code: 'om', name: 'عُمان', flag: '🇴🇲' },
];

export default function AdminNotifications() {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [target, setTarget] = useState<'all' | 'country'>('all');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [sending, setSending] = useState(false);
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAdminAuth();

  // Fetch notification history
  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      // Get Firebase ID token for authentication
      const idToken = await user?.getIdToken();
      if (!idToken) {
        throw new Error('Not authenticated');
      }

      // Use edge function to fetch notifications securely (bypasses RLS with service role)
      const { data, error } = await supabase.functions.invoke('get-admin-notifications', {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });

      if (error) throw error;
      setNotifications(data?.notifications || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!title.trim() || !body.trim()) {
      toast({
        title: 'خطأ',
        description: 'يرجى إدخال العنوان والمحتوى',
        variant: 'destructive',
      });
      return;
    }

    if (target === 'country' && !selectedCountry) {
      toast({
        title: 'خطأ',
        description: 'يرجى اختيار الدولة',
        variant: 'destructive',
      });
      return;
    }

    setSending(true);

    try {
      // Get Firebase ID token for authentication
      const idToken = await user?.getIdToken();
      if (!idToken) {
        throw new Error('Not authenticated');
      }

      const targetTopic = target === 'all' ? 'all' : `country_${selectedCountry}`;
      
      const response = await supabase.functions.invoke('send-push-notification', {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
        body: {
          title,
          body,
          topic: targetTopic,
          countryCode: target === 'country' ? selectedCountry : null,
        },
      });

      if (response.error) throw response.error;

      toast({
        title: 'تم الإرسال',
        description: 'تم إرسال الإشعار بنجاح',
      });

      // Reset form
      setTitle('');
      setBody('');
      setTarget('all');
      setSelectedCountry('');

      // Refresh list
      fetchNotifications();
    } catch (error: any) {
      console.error('Error sending notification:', error);
      toast({
        title: 'خطأ',
        description: error.message || 'حدث خطأ أثناء إرسال الإشعار',
        variant: 'destructive',
      });
    } finally {
      setSending(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sent':
        return <Badge className="bg-green-500"><CheckCircle className="w-3 h-3 ml-1" />تم الإرسال</Badge>;
      case 'failed':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 ml-1" />فشل</Badge>;
      default:
        return <Badge variant="secondary"><Clock className="w-3 h-3 ml-1" />قيد الانتظار</Badge>;
    }
  };

  const getCountryName = (code: string | null) => {
    if (!code) return 'الكل';
    const country = COUNTRIES.find(c => c.code === code);
    return country ? `${country.flag} ${country.name}` : code;
  };

  return (
    <AdminLayout title="الإشعارات">
      <div className="space-y-6">
        {/* Send Notification Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              إرسال إشعار جديد
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">العنوان</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="عنوان الإشعار"
                maxLength={100}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="body">المحتوى</Label>
              <Textarea
                id="body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="محتوى الإشعار"
                rows={3}
                maxLength={500}
              />
            </div>

            <div className="space-y-2">
              <Label>الهدف</Label>
              <RadioGroup value={target} onValueChange={(v) => setTarget(v as 'all' | 'country')}>
                <div className="flex items-center gap-4">
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <RadioGroupItem value="all" id="all" />
                    <Label htmlFor="all" className="flex items-center gap-1 cursor-pointer">
                      <Globe className="w-4 h-4" />
                      جميع المستخدمين
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <RadioGroupItem value="country" id="country" />
                    <Label htmlFor="country" className="cursor-pointer">دولة محددة</Label>
                  </div>
                </div>
              </RadioGroup>
            </div>

            {target === 'country' && (
              <div className="space-y-2">
                <Label>اختر الدولة</Label>
                <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الدولة" />
                  </SelectTrigger>
                  <SelectContent>
                    {COUNTRIES.map((country) => (
                      <SelectItem key={country.code} value={country.code}>
                        {country.flag} {country.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <Button onClick={handleSend} disabled={sending} className="w-full">
              {sending ? (
                'جاري الإرسال...'
              ) : (
                <>
                  <Send className="w-4 h-4 ml-2" />
                  إرسال الإشعار
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Notification History */}
        <Card>
          <CardHeader>
            <CardTitle>سجل الإشعارات</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-20 w-full" />
                ))}
              </div>
            ) : notifications.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">لا توجد إشعارات مرسلة</p>
            ) : (
              <div className="space-y-3">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className="border rounded-lg p-4 space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <h4 className="font-medium">{notif.title}</h4>
                        <p className="text-sm text-muted-foreground line-clamp-2">{notif.body}</p>
                      </div>
                      {getStatusBadge(notif.status)}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>الهدف: {getCountryName(notif.country_code)}</span>
                      <span>
                        {format(new Date(notif.created_at), 'dd MMM yyyy HH:mm', { locale: ar })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
