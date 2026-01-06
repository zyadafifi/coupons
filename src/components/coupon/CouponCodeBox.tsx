import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { couponsCopy } from "@/content/couponsCopy.ar";

interface CouponCodeBoxProps {
  code: string;
  discount?: string;
  onCopyAndShop?: () => void;
}

export function CouponCodeBox({
  code,
  discount,
  onCopyAndShop,
}: CouponCodeBoxProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast({
        title: couponsCopy.modal.copySuccess,
        description: code,
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: couponsCopy.modal.copyFailed,
        description: couponsCopy.modal.tryAgain,
        variant: "destructive",
      });
    }
  };

  const handleCopyAndShop = async () => {
    if (!copied) {
      await handleCopy();
    }
    onCopyAndShop?.();
  };

  return (
    <div className="bg-secondary rounded-2xl p-4 space-y-4">
      {/* Title with discount if available */}
      {discount && (
        <div className="text-center">
          <h3 className="text-lg font-bold text-foreground">{discount}</h3>
        </div>
      )}

      {/* Subtitle */}
      <p className="text-sm text-muted-foreground text-center">
        {couponsCopy.modal.subtitle}
      </p>

      {/* Code field */}
      <div>
        <p className="text-sm text-muted-foreground mb-2">
          {couponsCopy.modal.title}
        </p>
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
            {copied ? (
              <Check className="w-6 h-6" />
            ) : (
              <Copy className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Copy and Shop CTA */}
      {onCopyAndShop && (
        <button
          onClick={handleCopyAndShop}
          className="w-full py-3.5 rounded-xl font-bold text-base transition-all duration-300 bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg active:scale-[0.98]"
        >
          {couponsCopy.modal.copyAndShopButton}
        </button>
      )}
    </div>
  );
}
