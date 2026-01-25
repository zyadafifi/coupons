import { useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
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
import { useCountries, addCountry, updateCountry, deleteCountry } from '@/hooks/useFirestore';
import { FirestoreCountry } from '@/data/types';
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminCountries() {
  const { data: countries, loading } = useCountries();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCountry, setEditingCountry] = useState<FirestoreCountry | null>(null);
  const [formData, setFormData] = useState({
    nameAr: '',
    nameEn: '',
    flag: '',
    isActive: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setFormData({ nameAr: '', nameEn: '', flag: '', isActive: true });
    setEditingCountry(null);
  };

  const openCreateDialog = () => {
    resetForm();
    setDialogOpen(true);
  };

  const openEditDialog = (country: FirestoreCountry) => {
    setEditingCountry(country);
    setFormData({
      nameAr: country.nameAr,
      nameEn: country.nameEn,
      flag: country.flag,
      isActive: country.isActive,
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (editingCountry) {
        await updateCountry(editingCountry.id, formData);
        toast.success('تم تحديث الدولة بنجاح');
      } else {
        await addCountry(formData);
        toast.success('تم إضافة الدولة بنجاح');
      }
      setDialogOpen(false);
      resetForm();
    } catch (error) {
      toast.error('حدث خطأ، حاول مرة أخرى');
    }

    setIsSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه الدولة؟')) return;
    
    try {
      await deleteCountry(id);
      toast.success('تم حذف الدولة بنجاح');
    } catch (error) {
      toast.error('حدث خطأ أثناء الحذف');
    }
  };

  const handleToggleActive = async (country: FirestoreCountry) => {
    try {
      await updateCountry(country.id, { isActive: !country.isActive });
      toast.success('تم تحديث الحالة');
    } catch (error) {
      toast.error('حدث خطأ');
    }
  };

  return (
    <AdminLayout title="إدارة الدول">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">الدول</h1>
          <Button onClick={openCreateDialog}>
            <Plus className="w-4 h-4 ml-2" />
            إضافة دولة
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="bg-background rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-center">العلم</TableHead>
                  <TableHead className="text-center">الاسم (عربي)</TableHead>
                  <TableHead className="text-center">الاسم (إنجليزي)</TableHead>
                  <TableHead className="text-center">الحالة</TableHead>
                  <TableHead className="text-center">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {countries.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      لا توجد دول
                    </TableCell>
                  </TableRow>
                ) : (
                  countries.map((country) => (
                    <TableRow key={country.id}>
                      <TableCell className="text-2xl text-center">{country.flag}</TableCell>
                      <TableCell className="text-center">{country.nameAr}</TableCell>
                      <TableCell className="text-center">{country.nameEn}</TableCell>
                      <TableCell className="text-center">
                        <div className="flex justify-center">
                          <Switch
                            checked={country.isActive}
                            onCheckedChange={() => handleToggleActive(country)}
                          />
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditDialog(country)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(country.id)}
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
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle>
              {editingCountry ? 'تعديل الدولة' : 'إضافة دولة جديدة'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>العلم (إيموجي)</Label>
              <Input
                value={formData.flag}
                onChange={(e) => setFormData({ ...formData, flag: e.target.value })}
                placeholder="🇸🇦"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>الاسم بالعربي</Label>
              <Input
                value={formData.nameAr}
                onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                placeholder="السعودية"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>الاسم بالإنجليزي</Label>
              <Input
                value={formData.nameEn}
                onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                placeholder="Saudi Arabia"
                required
              />
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
                ) : editingCountry ? (
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
