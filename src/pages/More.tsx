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
import { parseAndValidatePhone } from "@/security/phone";
import { phoneCountries } from "@/data/phone-countries";

export default function More() {
  const { selectedCountry } = useApp();
  const { countries } = useActiveCountries();
  const [requestSheetOpen, setRequestSheetOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [requestForm, setRequestForm] = useState({
    storeName: "",
    email: "",
    phone: "",
    contactPersonName: "",
    storeUrl: "",
    countryId: "",
  });

  const handleRequestSubmit = async () => {
    // Validation
    if (!requestForm.storeName.trim()) {
      toast({
        title: "Error",
        description: "Please enter the store name",
        variant: "destructive",
      });
      return;
    }

    if (!requestForm.email.trim()) {
      toast({
        title: "Error",
        description: "Please enter your email address",
        variant: "destructive",
      });
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(requestForm.email.trim())) {
      toast({
        title: "Error",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    if (!requestForm.phone.trim()) {
      toast({
        title: "Error",
        description: "Please enter your phone number",
        variant: "destructive",
      });
      return;
    }

    const countryId = requestForm.countryId || selectedCountry;
    if (!countryId) {
      toast({
        title: "Error",
        description: "Please select a country",
        variant: "destructive",
      });
      return;
    }

    // Get country code for phone validation
    const selectedCountryData = countries.find((c) => c.id === countryId);
    if (!selectedCountryData) {
      toast({
        title: "Error",
        description: "The selected country is invalid",
        variant: "destructive",
      });
      return;
    }

    // Map country to phone country code by matching flag or name
    const phoneCountry = phoneCountries.find(
      (pc) => pc.flag === selectedCountryData.flag || pc.nameAr === selectedCountryData.nameAr
    );
    
    if (!phoneCountry) {
      toast({
        title: "Error",
        description: "Cannot validate phone number for this country",
        variant: "destructive",
      });
      return;
    }

    // Phone validation
    const phoneValidation = parseAndValidatePhone(
      requestForm.phone.trim(),
      phoneCountry.code
    );

    if (!phoneValidation.isValid) {
      toast({
        title: "Error",
        description: phoneValidation.error || "Invalid phone number",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const deviceId = getDeviceId();

      // Build payload without undefined fields (Firestore doesn't allow undefined)
      const payload: {
        storeName: string;
        email: string;
        phone: string;
        countryId: string;
        deviceId: string;
        contactPersonName?: string;
        storeUrl?: string;
      } = {
        storeName: requestForm.storeName.trim(),
        email: requestForm.email.trim().toLowerCase(),
        phone: phoneValidation.e164 || requestForm.phone.trim(),
        countryId,
        deviceId,
      };

      // Only include optional fields if they have values
      const contactPersonName = requestForm.contactPersonName.trim();
      if (contactPersonName) {
        payload.contactPersonName = contactPersonName;
      }

      const storeUrl = requestForm.storeUrl.trim();
      if (storeUrl) {
        payload.storeUrl = storeUrl;
      }

      await addStoreRequest(payload);

      toast({
        title: "Request Submitted",
        description: "We will review your request soon",
      });

      setRequestForm({
        storeName: "",
        email: "",
        phone: "",
        contactPersonName: "",
        storeUrl: "",
        countryId: "",
      });
      setRequestSheetOpen(false);
    } catch (error) {
      console.error("Error submitting store request:", error);
      toast({
        title: "Error",
        description: "Please try again",
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
        <SheetContent 
          side="bottom" 
          className="rounded-t-3xl max-h-[90vh] flex flex-col p-0" 
          dir="ltr"
        >
          <div className="px-6 pt-6 pb-4">
            <SheetHeader className="text-left">
              <SheetTitle>Store Addition Request</SheetTitle>
            </SheetHeader>
          </div>

          <div className="flex-1 overflow-y-auto px-6 pb-6 min-h-0">
            <div className="space-y-5 pb-32 pt-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground block">
                Store Name *
              </label>
              <Input
                value={requestForm.storeName}
                onChange={(e) =>
                  setRequestForm((prev) => ({
                    ...prev,
                    storeName: e.target.value,
                  }))
                }
                placeholder="Example: Noon Store"
                className="h-12 rounded-xl text-base"
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground block">
                Email *
              </label>
              <Input
                type="email"
                value={requestForm.email}
                onChange={(e) =>
                  setRequestForm((prev) => ({
                    ...prev,
                    email: e.target.value,
                  }))
                }
                placeholder="example@email.com"
                className="h-12 rounded-xl text-base"
                dir="ltr"
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground block">
                Phone Number *
              </label>
              <Input
                type="tel"
                value={requestForm.phone}
                onChange={(e) =>
                  setRequestForm((prev) => ({
                    ...prev,
                    phone: e.target.value,
                  }))
                }
                placeholder="05XXXXXXXX"
                className="h-12 rounded-xl text-base"
                dir="ltr"
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground block">
                Name
              </label>
              <Input
                value={requestForm.contactPersonName}
                onChange={(e) =>
                  setRequestForm((prev) => ({
                    ...prev,
                    contactPersonName: e.target.value,
                  }))
                }
                placeholder="Example: Ahmed Mohamed"
                className="h-12 rounded-xl text-base"
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground block">
                Country *
              </label>
              <Select
                value={requestForm.countryId || selectedCountry || ""}
                onValueChange={(value) =>
                  setRequestForm((prev) => ({ ...prev, countryId: value }))
                }
                disabled={isSubmitting}
              >
                <SelectTrigger className="h-12 rounded-xl text-base">
                  <SelectValue placeholder="Select Country" />
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

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground block">
                Store Link
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
                className="h-12 rounded-xl text-base"
                dir="ltr"
                disabled={isSubmitting}
              />
            </div>

            <Button
              onClick={handleRequestSubmit}
              disabled={isSubmitting}
              className="w-full h-12 text-base font-semibold rounded-xl mt-6"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Request"
              )}
            </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
