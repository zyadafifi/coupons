import { useEffect, useRef } from 'react';
import { useActiveCategories } from '@/hooks/useAppData';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface CategoryChipsProps {
  activeCategory: string;
  onSelectCategory: (categoryId: string) => void;
}

export function CategoryChips({ activeCategory, onSelectCategory }: CategoryChipsProps) {
  const { categories, loading, error } = useActiveCategories();
  const activeChipRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    activeChipRef.current?.scrollIntoView({ inline: 'nearest', behavior: 'smooth', block: 'nearest' });
  }, [activeCategory]);

  // Show skeleton while loading
  if (loading) {
    return (
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide px-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-24 rounded-full shrink-0" />
        ))}
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="px-4 text-center text-sm text-muted-foreground">
        فشل في تحميل التصنيفات
      </div>
    );
  }

  // Show empty state if no categories
  if (categories.length === 0) {
    return (
      <div className="px-4 text-center text-sm text-muted-foreground">
        لا توجد تصنيفات
      </div>
    );
  }

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide px-4">
      {categories.map((category) => (
        <button
          key={category.id}
          ref={activeCategory === category.id ? activeChipRef : undefined}
          onClick={() => onSelectCategory(category.id)}
          className={cn(
            "flex items-center gap-1.5 px-4 py-2 rounded-full whitespace-nowrap transition-all text-sm font-medium shrink-0",
            activeCategory === category.id
              ? "bg-primary text-primary-foreground"
              : "bg-card text-muted-foreground border border-border hover:border-primary/30"
          )}
        >
          <span>{category.name}</span>
          {category.icon && <span>{category.icon}</span>}
        </button>
      ))}
    </div>
  );
}
