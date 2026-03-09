import { useMemo } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Category } from "@/data/types";

export type SortOption = "popular" | "a-z" | "z-a";

interface FilterSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  selectedCategoryId: string;
  onCategoryChange: (categoryId: string) => void;
  categories: Category[];
  onApply: () => void;
}

const sortOptions: { value: SortOption; label: string }[] = [
  { value: "popular", label: "الأكثر شعبية" },
  { value: "z-a", label: "ي - أ" },
  { value: "a-z", label: "أ - ي" },
];

const ALL_CATEGORY = { id: "all", name: "الكل", nameEn: "All", icon: "🏷️" } as Category;

export function FilterSheet({
  open,
  onOpenChange,
  sortBy,
  onSortChange,
  selectedCategoryId,
  onCategoryChange,
  categories,
  onApply,
}: FilterSheetProps) {
  const hasActiveFilters = useMemo(
    () => sortBy !== "popular" || selectedCategoryId !== "all",
    [sortBy, selectedCategoryId]
  );

  const triggerHaptic = () => {
    if (navigator.vibrate) navigator.vibrate(10);
  };

  const handleReset = () => {
    triggerHaptic();
    onSortChange("popular");
    onCategoryChange("all");
  };

  const handleSortChange = (sort: SortOption) => {
    triggerHaptic();
    onSortChange(sort);
  };

  const handleCategoryChange = (categoryId: string) => {
    triggerHaptic();
    onCategoryChange(categoryId);
  };

  const categoryList = useMemo(() => [ALL_CATEGORY, ...categories], [categories]);

  const handleApply = () => {
    triggerHaptic();
    onApply();
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        dir="rtl"
        className="rounded-t-[24px] max-h-[85vh] p-0 bg-[#F5F5F5] data-[state=open]:duration-300 data-[state=closed]:duration-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4">
          {/* Right: Close button (RTL) */}
          <button
            onClick={() => onOpenChange(false)}
            className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm"
          >
            <ArrowRight className="w-5 h-5 text-gray-700" />
          </button>

          {/* Center: Title */}
          <h2 className="text-lg font-bold text-foreground">تحديد النتائج</h2>

          {/* Left: Clear all */}
          <button
            onClick={handleReset}
            className={cn(
              "text-sm font-medium transition-opacity",
              hasActiveFilters ? "text-[#0891B2]" : "text-muted-foreground/40 pointer-events-none"
            )}
          >
            حذف الكل
          </button>
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto max-h-[calc(85vh-64px-88px)] bg-[#F5F5F5] px-5">
          {/* Sort Section */}
          <div className="pb-5">
            <h4 className="text-sm font-medium text-foreground text-right mb-3">ترتيب حسب:</h4>
            <div className="flex flex-wrap gap-2 justify-end">
              {sortOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleSortChange(option.value)}
                  className={cn(
                    "px-4 h-10 rounded-full text-sm font-medium border-2 transition-all",
                    sortBy === option.value
                      ? "bg-white border-gray-400 text-foreground"
                      : "bg-transparent border-gray-300 text-muted-foreground"
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Categories Section - الأقسام */}
          <div className="pb-5">
            <h4 className="text-sm font-medium text-foreground text-right mb-3">الأقسام:</h4>
            <div className="flex flex-wrap gap-2 justify-end">
              {categoryList.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleCategoryChange(category.id)}
                  className={cn(
                    "flex items-center gap-1.5 px-4 h-10 rounded-full text-sm font-medium border-2 transition-all shrink-0",
                    selectedCategoryId === category.id
                      ? "bg-white border-gray-400 text-foreground"
                      : "bg-transparent border-gray-300 text-muted-foreground"
                  )}
                >
                  <span>{category.name}</span>
                  {category.icon && <span aria-hidden>{category.icon}</span>}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Button - Sticky */}
        <div className="sticky bottom-0 bg-[#F5F5F5] px-5 pb-8 pt-4">
          <button
            onClick={handleApply}
            className="w-full h-14 rounded-2xl bg-[#D4EDE4] text-foreground text-lg font-bold transition-all active:scale-[0.98]"
          >
            ابحث
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
