import { Sheet, SheetContent } from "@/components/ui/sheet";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Category } from "@/data/types";

const ALL_CATEGORY: Category = {
  id: "all",
  name: "الكل",
  nameEn: "All",
  icon: "🏷️",
};

interface CategorySheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: Category[];
  activeCategoryId: string;
  onSelectCategory: (categoryId: string) => void;
}

export function CategorySheet({
  open,
  onOpenChange,
  categories,
  activeCategoryId,
  onSelectCategory,
}: CategorySheetProps) {
  const list = [ALL_CATEGORY, ...categories];

  const handleSelect = (categoryId: string) => {
    if (navigator.vibrate) navigator.vibrate(10);
    onSelectCategory(categoryId);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        dir="rtl"
        className="rounded-t-[24px] max-h-[85vh] p-0 bg-[#F5F5F5] data-[state=open]:duration-300 data-[state=closed]:duration-200"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-border/50">
          <button
            onClick={() => onOpenChange(false)}
            className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm"
            aria-label="إغلاق"
          >
            <ArrowRight className="w-5 h-5 text-gray-700" />
          </button>
          <h2 className="text-lg font-bold text-foreground">جميع التصنيفات</h2>
          <div className="w-8" />
        </div>

        <div className="overflow-y-auto max-h-[calc(85vh-64px)] p-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {list.map((category) => (
              <button
                key={category.id}
                onClick={() => handleSelect(category.id)}
                className={cn(
                  "flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-2 transition-all text-sm font-medium min-h-[80px]",
                  activeCategoryId === category.id
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card text-foreground border-border hover:border-primary/30 hover:bg-primary/5"
                )}
              >
                {category.icon && (
                  <span className="text-2xl" aria-hidden>
                    {category.icon}
                  </span>
                )}
                <span className="text-center line-clamp-2">{category.name}</span>
              </button>
            ))}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
