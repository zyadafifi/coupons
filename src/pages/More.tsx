import { useState } from "react";
import { ChevronLeft, HelpCircle, MessageSquare, Loader2 } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useApp } from "@/contexts/AppContext";
import { useActiveCountries } from "@/hooks/useAppData";
import { addStoreRequest } from "@/hooks/useFirestore";
import { getDeviceId } from "@/hooks/useLeads";

export default function More() {
  const { selectedCountry } = useApp();
  const { countries } = useActiveCountries();
  const [requestSheetOpen, setRequestSheetOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [requestForm, setRequestForm] = useState({
    storeName: "",
    storeUrl: "",
    notes: "",
    countryId: "",
  });

  const handleRequestSubmit = async () => {
    // Validation
    if (!requestForm.storeName.trim()) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال اسم المتجر",
        variant: "destructive",
      });
      return;
    }

    const countryId = requestForm.countryId || selectedCountry;
    if (!countryId) {
      toast({
        title: "خطأ",
        description: "يرجى اختيار الدولة",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const deviceId = getDeviceId();

      await addStoreRequest({
        storeName: requestForm.storeName.trim(),
        storeUrl: requestForm.storeUrl.trim() || undefined,
        notes: requestForm.notes.trim() || undefined,
        countryId,
        deviceId,
      });

      toast({
        title: "تم إرسال الطلب بنجاح",
        description: "سنراجع طلبك في أقرب وقت",
      });

      setRequestForm({ storeName: "", storeUrl: "", notes: "", countryId: "" });
      setRequestSheetOpen(false);
    } catch (error) {
      console.error("Error submitting store request:", error);
      toast({
        title: "حدث خطأ",
        description: "يرجى المحاولة مرة أخرى",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const menuItems = [
    {
      icon: MessageSquare,
      label: "طلب متجر جديد",
      sublabel: "اقترح متجراً لإضافته",
      action: () => setRequestSheetOpen(true),
      hasArrow: true,
    },
    {
      icon: HelpCircle,
      label: "المساعدة والدعم",
      sublabel: "الأسئلة الشائعة",
      action: () =>
        toast({ title: "قريباً", description: "صفحة المساعدة قيد الإنشاء" }),
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
                  <p className="text-sm text-muted-foreground">
                    {item.sublabel}
                  </p>
                </div>
                {item.hasArrow && (
                  <ChevronLeft className="w-5 h-5 text-muted-foreground" />
                )}
              </button>
            );
          })}
        </div>
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
                onChange={(e) =>
                  setRequestForm((prev) => ({
                    ...prev,
                    storeName: e.target.value,
                  }))
                }
                placeholder="مثال: متجر نون"
                className="h-12 rounded-xl"
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                الدولة *
              </label>
              <Select
                value={requestForm.countryId || selectedCountry || ""}
                onValueChange={(value) =>
                  setRequestForm((prev) => ({ ...prev, countryId: value }))
                }
                disabled={isSubmitting}
              >
                <SelectTrigger className="h-12 rounded-xl">
                  <SelectValue placeholder="اختر الدولة" />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((country) => (
                    <SelectItem key={country.id} value={country.id}>
                      <div className="flex items-center gap-2">
                        <span>{country.flag}</span>
                        <span>{country.nameAr}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                رابط المتجر
              </label>
              <Input
                value={requestForm.storeUrl}
                onChange={(e) =>
                  setRequestForm((prev) => ({
                    ...prev,
                    storeUrl: e.target.value,
                  }))
                }
                placeholder="https://example.com"
                className="h-12 rounded-xl"
                dir="ltr"
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                ملاحظات إضافية
              </label>
              <Textarea
                value={requestForm.notes}
                onChange={(e) =>
                  setRequestForm((prev) => ({ ...prev, notes: e.target.value }))
                }
                placeholder="أي معلومات إضافية..."
                className="rounded-xl resize-none"
                rows={3}
                disabled={isSubmitting}
              />
            </div>

            <Button
              onClick={handleRequestSubmit}
              disabled={isSubmitting}
              className="w-full h-12 text-base font-semibold rounded-xl"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  جاري الإرسال...
                </>
              ) : (
                "إرسال الطلب"
              )}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
