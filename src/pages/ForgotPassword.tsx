import { useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useUserAuth } from "@/contexts/UserAuthContext";
import { Logo } from "@/components/shared/Logo";
import { AlertCircle, CheckCircle } from "lucide-react";

export default function ForgotPassword() {
  const { sendPasswordReset, error, clearError } = useUserAuth();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [fieldError, setFieldError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setFieldError("");
    if (!email.trim()) {
      setFieldError("البريد الإلكتروني مطلوب");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setFieldError("البريد الإلكتروني غير صحيح");
      return;
    }
    setIsSubmitting(true);
    const ok = await sendPasswordReset(email.trim());
    setIsSubmitting(false);
    if (ok) setSent(true);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col" dir="rtl">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent" />
        <div className="relative pt-12 pb-6 px-6">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center shadow-lg">
            <Logo size="lg" showText={false} />
          </div>
          <h1 className="text-2xl font-bold text-foreground text-center mb-1">
            استعادة كلمة المرور
          </h1>
          <p className="text-muted-foreground text-sm text-center">
            أدخل بريدك وسنرسل لك رابط إعادة التعيين
          </p>
        </div>
      </div>

      <div className="flex-1 px-6 pb-8">
        <Card className="max-w-md mx-auto border-2">
          <CardContent className="pt-6">
            {sent ? (
              <div className="space-y-4 text-center">
                <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-primary" />
                </div>
                <p className="text-foreground">
                  تم إرسال رابط إعادة التعيين إلى بريدك الإلكتروني.
                </p>
                <p className="text-sm text-muted-foreground">
                  تحقق من صندوق الوارد أو البريد المزعج.
                </p>
                <Button asChild className="w-full mt-4">
                  <Link to="/login">
                    <ArrowRight className="h-4 w-4 ml-2" />
                    العودة لتسجيل الدخول
                  </Link>
                </Button>
              </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="email">البريد الإلكتروني</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="example@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={fieldError ? "border-destructive" : ""}
                      disabled={isSubmitting}
                      autoComplete="email"
                    />
                    {fieldError && (
                      <p className="text-destructive text-xs">{fieldError}</p>
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
                      "إرسال الرابط"
                    )}
                  </Button>
                </form>
              )}
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-6">
          <Link
            to="/login"
            className="text-primary font-medium hover:underline"
          >
            ← العودة لتسجيل الدخول
          </Link>
        </p>
      </div>
    </div>
  );
}
