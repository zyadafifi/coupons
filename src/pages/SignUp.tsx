import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ChevronDown, Loader2, Check, Mail, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { phoneCountries } from "@/data/phone-countries";
import { PhoneCountry } from "@/data/types";
import { useUserAuth } from "@/contexts/UserAuthContext";
import { parseAndValidatePhone } from "@/security/phone";
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/firebase";
import { auth } from "@/firebase";
import { Logo } from "@/components/shared/Logo";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { AlertCircle } from "lucide-react";

type TabType = "email" | "phone";

export default function SignUp() {
  const navigate = useNavigate();
  const {
    signUpWithEmail,
    signInWithPhone,
    confirmPhoneCode,
    error,
    clearError,
    recaptchaContainerId,
  } = useUserAuth();

  const [tab, setTab] = useState<TabType>("email");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [phoneStep, setPhoneStep] = useState<"number" | "code">("number");
  const [selectedCountry, setSelectedCountry] = useState<PhoneCountry>(
    phoneCountries[0]
  );
  const [countryPickerOpen, setCountryPickerOpen] = useState(false);

  const [emailForm, setEmailForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
  });
  const [emailPhoneCountry, setEmailPhoneCountry] = useState<PhoneCountry>(
    phoneCountries[0]
  );
  const [emailCountryPickerOpen, setEmailCountryPickerOpen] = useState(false);
  const [phoneForm, setPhoneForm] = useState({
    phone: "",
    code: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    const newErrors: Record<string, string> = {};
    if (!emailForm.email.trim()) newErrors.email = "البريد الإلكتروني مطلوب";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailForm.email))
      newErrors.email = "البريد الإلكتروني غير صحيح";
    if (!emailForm.password) newErrors.password = "كلمة المرور مطلوبة";
    else if (emailForm.password.length < 6)
      newErrors.password = "كلمة المرور 6 أحرف على الأقل";
    if (emailForm.password !== emailForm.confirmPassword)
      newErrors.confirmPassword = "كلمة المرور غير متطابقة";
    const phoneValidation = parseAndValidatePhone(
      emailForm.phone,
      emailPhoneCountry.code,
      emailPhoneCountry.dialCode
    );
    if (!phoneValidation.isValid) {
      newErrors.phone =
        phoneValidation.error || "رقم الهاتف غير صحيح";
    }
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setIsSubmitting(true);
    const ok = await signUpWithEmail(emailForm.email, emailForm.password);
    if (ok) {
      if (auth.currentUser) {
        const phoneE164 =
          phoneValidation.e164 ||
          `${emailPhoneCountry.dialCode}${emailForm.phone.replace(/\D/g, "")}`;
        try {
          await setDoc(doc(db, "users", auth.currentUser.uid), {
            email: emailForm.email.trim(),
            phone: phoneE164,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        } catch {
          // non-blocking
        }
      }
      navigate("/", { replace: true });
    }
    setIsSubmitting(false);
  };

  const handlePhoneNumberSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    const validation = parseAndValidatePhone(
      phoneForm.phone,
      selectedCountry.code,
      selectedCountry.dialCode
    );
    if (!validation.isValid) {
      setErrors({ phone: validation.error || "رقم الهاتف غير صحيح" });
      return;
    }
    setErrors({});
    const phoneNumber = validation.e164 || `${selectedCountry.dialCode}${phoneForm.phone.replace(/\D/g, "")}`;
    setIsSubmitting(true);
    const ok = await signInWithPhone(phoneNumber);
    setIsSubmitting(false);
    if (ok) setPhoneStep("code");
  };

  const handlePhoneCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    if (!phoneForm.code.trim() || phoneForm.code.length < 6) {
      setErrors({ code: "أدخل رمز التحقق المكون من 6 أرقام" });
      return;
    }
    setErrors({});
    setIsSubmitting(true);
    const ok = await confirmPhoneCode(phoneForm.code.trim());
    setIsSubmitting(false);
    if (ok) navigate("/", { replace: true });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col" dir="rtl">
      <div id={recaptchaContainerId} />
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent" />
        <div className="relative pt-12 pb-6 px-6">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center shadow-lg">
            <Logo size="lg" showText={false} />
          </div>
          <h1 className="text-2xl font-bold text-foreground text-center mb-1">
            إنشاء حساب
          </h1>
          <p className="text-muted-foreground text-sm text-center">
            سجّل بالبريد أو برقم الموبايل
          </p>
        </div>
      </div>

      <div className="flex-1 px-6 pb-8">
        <Card className="max-w-md mx-auto border-2">
          <CardHeader className="pb-4">
            <div className="flex gap-2 p-1 bg-muted rounded-lg">
              <button
                type="button"
                onClick={() => {
                  setTab("email");
                  setPhoneStep("number");
                  setErrors({});
                  clearError();
                }}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-colors",
                  tab === "email"
                    ? "bg-background text-foreground shadow"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Mail className="h-4 w-4" />
                البريد
              </button>
              <button
                type="button"
                onClick={() => {
                  setTab("phone");
                  setPhoneStep("number");
                  setErrors({});
                  clearError();
                }}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-colors",
                  tab === "phone"
                    ? "bg-background text-foreground shadow"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Smartphone className="h-4 w-4" />
                الهاتف
              </button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {tab === "email" && (
              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">البريد الإلكتروني</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="example@email.com"
                    value={emailForm.email}
                    onChange={(e) =>
                      setEmailForm((p) => ({ ...p, email: e.target.value }))
                    }
                    className={cn(errors.email && "border-destructive")}
                    disabled={isSubmitting}
                    autoComplete="email"
                  />
                  {errors.email && (
                    <p className="text-destructive text-xs">{errors.email}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>رقم الموبايل</Label>
                  <div
                    className={cn(
                      "flex items-center h-12 rounded-xl border-2 overflow-hidden",
                      errors.phone ? "border-destructive" : "border-border"
                    )}
                    dir="ltr"
                  >
                    <Popover
                      open={emailCountryPickerOpen}
                      onOpenChange={setEmailCountryPickerOpen}
                    >
                      <PopoverTrigger asChild>
                        <button
                          type="button"
                          className="flex items-center gap-2 h-full px-3 border-l border-border bg-muted/30"
                        >
                          <span className="text-lg">
                            {emailPhoneCountry.flag}
                          </span>
                          <span className="text-sm font-semibold">
                            {emailPhoneCountry.dialCode}
                          </span>
                          <ChevronDown className="h-4 w-4" />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[220px] p-0" align="start">
                        <div className="max-h-[260px] overflow-y-auto">
                          {phoneCountries.map((c) => (
                            <button
                              key={c.code}
                              type="button"
                              onClick={() => {
                                setEmailPhoneCountry(c);
                                setEmailCountryPickerOpen(false);
                              }}
                              className={cn(
                                "flex items-center gap-3 w-full px-4 py-3 text-right hover:bg-primary/10",
                                emailPhoneCountry.code === c.code &&
                                  "bg-primary/15"
                              )}
                            >
                              <span className="text-lg">{c.flag}</span>
                              <span className="flex-1 text-sm">{c.nameAr}</span>
                              <span className="text-xs text-muted-foreground">
                                {c.dialCode}
                              </span>
                              {emailPhoneCountry.code === c.code && (
                                <Check className="h-4 w-4 text-primary" />
                              )}
                            </button>
                          ))}
                        </div>
                      </PopoverContent>
                    </Popover>
                    <Input
                      type="tel"
                      placeholder={emailPhoneCountry.placeholder}
                      value={emailForm.phone}
                      onChange={(e) =>
                        setEmailForm((p) => ({ ...p, phone: e.target.value }))
                      }
                      className="flex-1 border-0 focus-visible:ring-0 rounded-none"
                      disabled={isSubmitting}
                      autoComplete="tel"
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-destructive text-xs">{errors.phone}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">كلمة المرور</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="6 أحرف على الأقل"
                    value={emailForm.password}
                    onChange={(e) =>
                      setEmailForm((p) => ({ ...p, password: e.target.value }))
                    }
                    className={cn(errors.password && "border-destructive")}
                    disabled={isSubmitting}
                    autoComplete="new-password"
                  />
                  {errors.password && (
                    <p className="text-destructive text-xs">{errors.password}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">تأكيد كلمة المرور</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="أعد إدخال كلمة المرور"
                    value={emailForm.confirmPassword}
                    onChange={(e) =>
                      setEmailForm((p) => ({
                        ...p,
                        confirmPassword: e.target.value,
                      }))
                    }
                    className={cn(errors.confirmPassword && "border-destructive")}
                    disabled={isSubmitting}
                    autoComplete="new-password"
                  />
                  {errors.confirmPassword && (
                    <p className="text-destructive text-xs">
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>
                <Button
                  type="submit"
                  className="w-full h-12 rounded-xl"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <Loader2 className="h-5 w-5 animate-spin ml-2" />
                  ) : (
                    "إنشاء الحساب"
                  )}
                </Button>
              </form>
            )}

            {tab === "phone" && phoneStep === "number" && (
              <form onSubmit={handlePhoneNumberSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>رقم الموبايل</Label>
                  <div
                    className={cn(
                      "flex items-center h-12 rounded-xl border-2 overflow-hidden",
                      errors.phone ? "border-destructive" : "border-border"
                    )}
                    dir="ltr"
                  >
                    <Popover
                      open={countryPickerOpen}
                      onOpenChange={setCountryPickerOpen}
                    >
                      <PopoverTrigger asChild>
                        <button
                          type="button"
                          className="flex items-center gap-2 h-full px-3 border-l border-border bg-muted/30"
                        >
                          <span className="text-lg">{selectedCountry.flag}</span>
                          <span className="text-sm font-semibold">
                            {selectedCountry.dialCode}
                          </span>
                          <ChevronDown className="h-4 w-4" />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[220px] p-0" align="start">
                        <div className="max-h-[260px] overflow-y-auto">
                          {phoneCountries.map((c) => (
                            <button
                              key={c.code}
                              type="button"
                              onClick={() => {
                                setSelectedCountry(c);
                                setCountryPickerOpen(false);
                              }}
                              className={cn(
                                "flex items-center gap-3 w-full px-4 py-3 text-right hover:bg-primary/10",
                                selectedCountry.code === c.code && "bg-primary/15"
                              )}
                            >
                              <span className="text-lg">{c.flag}</span>
                              <span className="flex-1 text-sm">
                                {c.nameAr}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {c.dialCode}
                              </span>
                              {selectedCountry.code === c.code && (
                                <Check className="h-4 w-4 text-primary" />
                              )}
                            </button>
                          ))}
                        </div>
                      </PopoverContent>
                    </Popover>
                    <Input
                      type="tel"
                      placeholder={selectedCountry.placeholder}
                      value={phoneForm.phone}
                      onChange={(e) =>
                        setPhoneForm((p) => ({ ...p, phone: e.target.value }))
                      }
                      className="flex-1 border-0 focus-visible:ring-0 rounded-none"
                      disabled={isSubmitting}
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-destructive text-xs">{errors.phone}</p>
                  )}
                </div>
                <Button
                  type="submit"
                  className="w-full h-12 rounded-xl"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <Loader2 className="h-5 w-5 animate-spin ml-2" />
                  ) : (
                    "إرسال رمز التحقق"
                  )}
                </Button>
              </form>
            )}

            {tab === "phone" && phoneStep === "code" && (
              <form onSubmit={handlePhoneCodeSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="code">رمز التحقق (6 أرقام)</Label>
                  <Input
                    id="code"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="000000"
                    value={phoneForm.code}
                    onChange={(e) =>
                      setPhoneForm((p) => ({
                        ...p,
                        code: e.target.value.replace(/\D/g, ""),
                      }))
                    }
                    className={cn(errors.code && "border-destructive")}
                    disabled={isSubmitting}
                    autoComplete="one-time-code"
                  />
                  {errors.code && (
                    <p className="text-destructive text-xs">{errors.code}</p>
                  )}
                </div>
                <Button
                  type="submit"
                  className="w-full h-12 rounded-xl"
                  disabled={isSubmitting || phoneForm.code.length < 6}
                >
                  {isSubmitting ? (
                    <Loader2 className="h-5 w-5 animate-spin ml-2" />
                  ) : (
                    "تأكيد وإنشاء الحساب"
                  )}
                </Button>
                <button
                  type="button"
                  onClick={() => setPhoneStep("number")}
                  className="w-full text-sm text-muted-foreground hover:text-foreground"
                >
                  تغيير رقم الهاتف
                </button>
              </form>
            )}
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-6">
          لديك حساب؟{" "}
          <Link to="/login" className="text-primary font-medium hover:underline">
            تسجيل الدخول
          </Link>
        </p>
      </div>
    </div>
  );
}
