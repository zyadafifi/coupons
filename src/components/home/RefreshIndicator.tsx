import { cn } from '@/lib/utils';

interface RefreshIndicatorProps {
  isVisible: boolean;
}

export function RefreshIndicator({ isVisible }: RefreshIndicatorProps) {
  return (
    <div 
      className={cn(
        "flex items-center justify-center gap-2 py-2 text-sm text-muted-foreground transition-all duration-200",
        isVisible ? "opacity-100 max-h-10" : "opacity-0 max-h-0 overflow-hidden"
      )}
    >
      <span>⏳</span>
      <span>جاري تحديث العروض…</span>
    </div>
  );
}
