import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, Loader2, Save, Image, GripVertical } from 'lucide-react';
import { toast } from 'sonner';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/firebase';

interface Banner {
  id: string;
  imageUrl: string;
  alt: string;
  linkUrl?: string;
  sortOrder: number;
}

interface AppSettings {
  appName: string;
  logoUrl: string;
  banners: Banner[];
}

const defaultSettings: AppSettings = {
  appName: 'قسيمة',
  logoUrl: 'https://i.ibb.co/QjTHRZTj/Generated-Image-December-20-2025-8-48-AM-Photoroom.png',
  banners: [],
};

export default function AdminSettings() {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const docRef = doc(db, 'settings', 'app');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setSettings(docSnap.data() as AppSettings);
      }
    } catch (error: any) {
      console.error('Error loading settings:', error);
      toast.error('خطأ في تحميل الإعدادات');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const docRef = doc(db, 'settings', 'app');
      await setDoc(docRef, settings);
      toast.success('تم حفظ الإعدادات بنجاح');
    } catch (error: any) {
      console.error('Error saving settings:', error);
      toast.error(`خطأ: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const addBanner = () => {
    const newBanner: Banner = {
      id: Date.now().toString(),
      imageUrl: '',
      alt: '',
      linkUrl: '',
      sortOrder: settings.banners.length,
    };
    setSettings({
      ...settings,
      banners: [...settings.banners, newBanner],
    });
  };

  const updateBanner = (id: string, field: keyof Banner, value: string | number) => {
    setSettings({
      ...settings,
      banners: settings.banners.map((banner) =>
        banner.id === id ? { ...banner, [field]: value } : banner
      ),
    });
  };

  const removeBanner = (id: string) => {
    setSettings({
      ...settings,
      banners: settings.banners.filter((banner) => banner.id !== id),
    });
  };

  const moveBanner = (index: number, direction: 'up' | 'down') => {
    const newBanners = [...settings.banners];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= newBanners.length) return;
    [newBanners[index], newBanners[newIndex]] = [newBanners[newIndex], newBanners[index]];
    // Update sort orders
    newBanners.forEach((banner, i) => {
      banner.sortOrder = i;
    });
    setSettings({ ...settings, banners: newBanners });
  };

  if (isLoading) {
    return (
      <AdminLayout title="إعدادات التطبيق">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="إعدادات التطبيق">
      <div className="space-y-6 max-w-4xl">
        {/* App Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Image className="w-5 h-5" />
              معلومات التطبيق
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="appName">اسم التطبيق</Label>
                <Input
                  id="appName"
                  value={settings.appName}
                  onChange={(e) => setSettings({ ...settings, appName: e.target.value })}
                  placeholder="أدخل اسم التطبيق"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="logoUrl">رابط اللوجو</Label>
                <Input
                  id="logoUrl"
                  value={settings.logoUrl}
                  onChange={(e) => setSettings({ ...settings, logoUrl: e.target.value })}
                  placeholder="https://example.com/logo.png"
                  dir="ltr"
                />
              </div>
            </div>
            {settings.logoUrl && (
              <div className="mt-4">
                <Label>معاينة اللوجو</Label>
                <div className="mt-2 p-4 bg-muted rounded-lg inline-block">
                  <img
                    src={settings.logoUrl}
                    alt="Logo Preview"
                    className="h-12 object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/placeholder.svg';
                    }}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Banners */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Image className="w-5 h-5" />
              البنرات الإعلانية
            </CardTitle>
            <Button onClick={addBanner} size="sm">
              <Plus className="w-4 h-4 ml-2" />
              إضافة بنر
            </Button>
          </CardHeader>
          <CardContent>
            {settings.banners.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                لا توجد بنرات. أضف بنر جديد للبدء.
              </div>
            ) : (
              <div className="space-y-4">
                {settings.banners
                  .sort((a, b) => a.sortOrder - b.sortOrder)
                  .map((banner, index) => (
                    <div
                      key={banner.id}
                      className="border rounded-lg p-4 space-y-4 bg-muted/30"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <GripVertical className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">بنر {index + 1}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => moveBanner(index, 'up')}
                            disabled={index === 0}
                          >
                            ↑
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => moveBanner(index, 'down')}
                            disabled={index === settings.banners.length - 1}
                          >
                            ↓
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => removeBanner(banner.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label>رابط الصورة</Label>
                          <Input
                            value={banner.imageUrl}
                            onChange={(e) => updateBanner(banner.id, 'imageUrl', e.target.value)}
                            placeholder="https://example.com/banner.jpg"
                            dir="ltr"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>النص البديل</Label>
                          <Input
                            value={banner.alt}
                            onChange={(e) => updateBanner(banner.id, 'alt', e.target.value)}
                            placeholder="وصف البنر"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>رابط عند الضغط (اختياري)</Label>
                        <Input
                          value={banner.linkUrl || ''}
                          onChange={(e) => updateBanner(banner.id, 'linkUrl', e.target.value)}
                          placeholder="https://example.com/offer"
                          dir="ltr"
                        />
                      </div>

                      {banner.imageUrl && (
                        <div className="mt-2">
                          <Label>معاينة</Label>
                          <div className="mt-2 rounded-lg overflow-hidden bg-muted">
                            <img
                              src={banner.imageUrl}
                              alt={banner.alt}
                              className="w-full h-32 object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/placeholder.svg';
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={isSaving} size="lg">
            {isSaving ? (
              <Loader2 className="w-4 h-4 ml-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 ml-2" />
            )}
            حفظ الإعدادات
          </Button>
        </div>
      </div>
    </AdminLayout>
  );
}
