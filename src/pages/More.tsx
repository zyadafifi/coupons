import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, HelpCircle, Info, MessageSquare, RotateCcw } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useApp } from '@/contexts/AppContext';
import { toast } from '@/hooks/use-toast';
import { resetOnboarding } from '@/hooks/useLeads';
import { cn } from '@/lib/utils';

export default function More() {
  const navigate = useNavigate();
  const [requestSheetOpen, setRequestSheetOpen] = useState(false);
  const [requestForm, setRequestForm] = useState({ storeName: '', storeUrl: '', notes: '' });
  const [resetDialogOpen, setResetDialogOpen] = useState(false);

  const handleResetOnboarding = () => {
    resetOnboarding();
    toast({ 
      title: "تم إعادة تعيين التسجيل", 
      description: "سيتم توجيهك إلى صفحة التسجيل" 
    });
    setResetDialogOpen(false);
    navigate('/onboarding', { replace: true });
  };

  const handleRequestSubmit = () => {
    if (!requestForm.storeName) {
      toast({ title: "يرجى إدخال اسم المتجر", variant: "destructive" });
      return;
    }
    toast({ title: "تم إرسال الطلب بنجاح", description: "سنراجع طلبك في أقرب وقت" });
    setRequestForm({ storeName: '', storeUrl: '', notes: '' });
    setRequestSheetOpen(false);
  };

  const menuItems = [
    {
      icon: MessageSquare,
      label: 'طلب متجر جديد',
      sublabel: 'اقترح متجراً لإضافته',
      action: () => setRequestSheetOpen(true),
      hasArrow: true,
    },
    {
      icon: HelpCircle,
      label: 'المساعدة والدعم',
      sublabel: 'الأسئلة الشائعة',
      action: () => toast({ title: "قريباً", description: "صفحة المساعدة قيد الإنشاء" }),
      hasArrow: true,
    },
    {
      icon: Info,
      label: 'عن التطبيق',
      sublabel: 'الإصدار 1.0.0',
      action: () => toast({ title: "كوبونات", description: "الإصدار 1.0.0 - تطبيق كوبونات الخصم" }),
      hasArrow: true,
    },
    {
      icon: RotateCcw,
      label: 'إعادة التسجيل',
      sublabel: 'إعادة تعيين بيانات التسجيل',
      action: () => setResetDialogOpen(true),
      hasArrow: true,
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="px-4 pt-12 pb-4">
        <h1 className="text-2xl font-bold text-foreground">المزيد</h1>
        <p className="text-muted-foreground text-sm">الإعدادات والمساعدة</p>
      </div>

      {/* Menu Items */}
      <div className="px-4 pb-4">
        <div className="bg-card rounded-2xl overflow-hidden border border-border">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                onClick={item.action}
                className={cn(
                  "flex items-center gap-4 w-full p-4 text-right transition-colors hover:bg-secondary/50",
                  index !== menuItems.length - 1 && "border-b border-border"
                )}
              >
                <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-primary">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground">{item.label}</p>
                  <p className="text-sm text-muted-foreground">{item.sublabel}</p>
                </div>
                {item.hasToggle ? (
                  <Switch checked={item.toggleValue} />
                ) : item.hasArrow ? (
                  <ChevronLeft className="w-5 h-5 text-muted-foreground" />
                ) : null}
              </button>
            );
          })}
        </div>

        {/* Version */}
        <p className="text-center text-xs text-muted-foreground mt-6">
          كوبونات الإصدار 1.0.0
        </p>
      </div>

      {/* Request Store Sheet */}
      <Sheet open={requestSheetOpen} onOpenChange={setRequestSheetOpen}>
        <SheetContent side="bottom" className="rounded-t-3xl" dir="rtl">
          <SheetHeader className="text-right">
            <SheetTitle>طلب إضافة متجر</SheetTitle>
          </SheetHeader>
          
          <div className="mt-6 space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                اسم المتجر *
              </label>
              <Input
                value={requestForm.storeName}
                onChange={(e) => setRequestForm(prev => ({ ...prev, storeName: e.target.value }))}
                placeholder="مثال: متجر نون"
                className="h-12 rounded-xl"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                رابط المتجر
              </label>
              <Input
                value={requestForm.storeUrl}
                onChange={(e) => setRequestForm(prev => ({ ...prev, storeUrl: e.target.value }))}
                placeholder="https://example.com"
                className="h-12 rounded-xl"
                dir="ltr"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                ملاحظات إضافية
              </label>
              <Textarea
                value={requestForm.notes}
                onChange={(e) => setRequestForm(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="أي معلومات إضافية..."
                className="rounded-xl resize-none"
                rows={3}
              />
            </div>
            
            <Button 
              onClick={handleRequestSubmit} 
              className="w-full h-12 text-base font-semibold rounded-xl"
            >
              إرسال الطلب
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Reset Onboarding Dialog */}
      <AlertDialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>إعادة التسجيل</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من إعادة تعيين بيانات التسجيل؟ سيتم حذف معلوماتك الحالية وإعادة توجيهك إلى صفحة التسجيل.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={handleResetOnboarding} className="bg-destructive hover:bg-destructive/90">
              إعادة التسجيل
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
