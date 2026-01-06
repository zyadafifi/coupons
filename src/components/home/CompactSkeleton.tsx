import { Skeleton } from '@/components/ui/skeleton';

export function CompactSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div 
          key={i} 
          className="bg-card rounded-[20px] shadow-card p-4 min-h-[96px] flex items-center relative"
        >
          {/* Logo skeleton - right */}
          <Skeleton className="absolute right-4 w-16 h-16 rounded-full" />
          
          {/* Content skeleton - center */}
          <div className="flex-1 mr-20 ml-16 space-y-2">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-4 w-16" />
          </div>
          
          {/* Discount skeleton - left */}
          <Skeleton className="absolute left-4 h-7 w-12" />
        </div>
      ))}
    </div>
  );
}
