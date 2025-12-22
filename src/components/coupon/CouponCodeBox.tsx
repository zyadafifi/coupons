import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface CouponCodeBoxProps {
  code: string;
}

export function CouponCodeBox({ code }: CouponCodeBoxProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast({
        title: "تم نسخ الكود",
        description: code,
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "فشل النسخ",
        description: "حاول مرة أخرى",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="bg-secondary rounded-2xl p-4">
      <p className="text-sm text-muted-foreground mb-2">كود الخصم</p>
      <div className="flex items-center gap-3">
        <div className="flex-1 bg-background rounded-xl px-4 py-3 border-2 border-dashed border-primary">
          <span className="text-xl font-bold text-primary tracking-wider">
            {code}
          </span>
        </div>
        <button
          onClick={handleCopy}
          className={cn(
            "w-14 h-14 rounded-xl flex items-center justify-center transition-all",
            copied 
              ? "bg-green-500 text-white" 
              : "bg-primary text-primary-foreground hover:bg-primary/90"
          )}
        >
          {copied ? <Check className="w-6 h-6" /> : <Copy className="w-6 h-6" />}
        </button>
      </div>
    </div>
  );
}
