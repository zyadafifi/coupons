import { useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { useStores, useCountries, addStore, updateStore, deleteStore } from '@/hooks/useFirestore';
import { FirestoreStore } from '@/data/types';
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminStores() {
  const { data: stores, loading } = useStores();
  const { data: countries } = useCountries();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingStore, setEditingStore] = useState<FirestoreStore | null>(null);
  const [formData, setFormData] = useState({
    nameAr: '',
    nameEn: '',
    logoUrl: '',
    bannerUrl: '',
    websiteUrl: '',
    countryId: '',
    isActive: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setFormData({
      nameAr: '',
      nameEn: '',
      logoUrl: '',
      bannerUrl: '',
      websiteUrl: '',
      countryId: '',
      isActive: true,
    });
    setEditingStore(null);
  };

  const openCreateDialog = () => {
    resetForm();
    setDialogOpen(true);
  };

  const openEditDialog = (store: FirestoreStore) => {
    setEditingStore(store);
    setFormData({
      nameAr: store.nameAr,
      nameEn: store.nameEn,
      logoUrl: store.logoUrl,
      bannerUrl: store.bannerUrl || '',
      websiteUrl: store.websiteUrl,
      countryId: store.countryId,
      isActive: store.isActive,
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (editingStore) {
        await updateStore(editingStore.id, formData);
        toast.success('تم تحديث المتجر بنجاح');
      } else {
        await addStore(formData);
        toast.success('تم إضافة المتجر بنجاح');
      }
      setDialogOpen(false);
      resetForm();
    } catch (error) {
      toast.error('حدث خطأ، حاول مرة أخرى');
    }

    setIsSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا المتجر؟')) return;
    
    try {
      await deleteStore(id);
      toast.success('تم حذف المتجر بنجاح');
    } catch (error) {
      toast.error('حدث خطأ أثناء الحذف');
    }
  };

  const handleToggleActive = async (store: FirestoreStore) => {
    try {
      await updateStore(store.id, { isActive: !store.isActive });
      toast.success('تم تحديث الحالة');
    } catch (error) {
      toast.error('حدث خطأ');
    }
  };

  const getCountryName = (countryId: string) => {
    const country = countries.find(c => c.id === countryId);
    return country ? `${country.flag} ${country.nameAr}` : countryId;
  };

  return (
    <AdminLayout title="إدارة المتاجر">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">المتاجر</h1>
          <Button onClick={openCreateDialog}>
            <Plus className="w-4 h-4 ml-2" />
            إضافة متجر
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="bg-background rounded-lg border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>الشعار</TableHead>
                  <TableHead>الاسم (عربي)</TableHead>
                  <TableHead>الاسم (إنجليزي)</TableHead>
                  <TableHead>الدولة</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stores.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      لا توجد متاجر
                    </TableCell>
                  </TableRow>
                ) : (
                  stores.map((store) => (
                    <TableRow key={store.id}>
                      <TableCell>
                        {store.logoUrl ? (
                          <img src={store.logoUrl} alt={store.nameAr} className="w-10 h-10 rounded object-cover" />
                        ) : (
                          <div className="w-10 h-10 bg-muted rounded flex items-center justify-center text-muted-foreground">
                            🏪
                          </div>
                        )}
                      </TableCell>
                      <TableCell>{store.nameAr}</TableCell>
                      <TableCell>{store.nameEn}</TableCell>
                      <TableCell>{getCountryName(store.countryId)}</TableCell>
                      <TableCell>
                        <Switch
                          checked={store.isActive}
                          onCheckedChange={() => handleToggleActive(store)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditDialog(store)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(store.id)}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent dir="rtl" className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingStore ? 'تعديل المتجر' : 'إضافة متجر جديد'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>الاسم بالعربي</Label>
              <Input
                value={formData.nameAr}
                onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                placeholder="نون"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>الاسم بالإنجليزي</Label>
              <Input
                value={formData.nameEn}
                onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                placeholder="Noon"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>رابط اللوجو</Label>
              <Input
                value={formData.logoUrl}
                onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                placeholder="https://example.com/logo.png"
              />
              {formData.logoUrl && (
                <div className="mt-2 p-2 bg-muted rounded-lg">
                  <img 
                    src={formData.logoUrl} 
                    alt="معاينة اللوجو" 
                    className="w-16 h-16 object-contain mx-auto"
                  />
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label>رابط البنر (الصورة الخلفية)</Label>
              <Input
                value={formData.bannerUrl}
                onChange={(e) => setFormData({ ...formData, bannerUrl: e.target.value })}
                placeholder="https://example.com/banner.png"
              />
              {formData.bannerUrl && (
                <div className="mt-2 p-2 bg-muted rounded-lg">
                  <img 
                    src={formData.bannerUrl} 
                    alt="معاينة البنر" 
                    className="w-full h-24 object-cover rounded"
                  />
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label>رابط الموقع</Label>
              <Input
                value={formData.websiteUrl}
                onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
                placeholder="https://noon.com"
              />
            </div>
            <div className="space-y-2">
              <Label>الدولة</Label>
              <Select
                value={formData.countryId}
                onValueChange={(value) => setFormData({ ...formData, countryId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر الدولة" />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((country) => (
                    <SelectItem key={country.id} value={country.id}>
                      {country.flag} {country.nameAr}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
              />
              <Label>مفعّل</Label>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : editingStore ? (
                  'تحديث'
                ) : (
                  'إضافة'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
