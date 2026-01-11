import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { CountrySelector } from "@/components/home/CountrySelector";
import { Logo } from "@/components/shared/Logo";
interface TopBarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
}
export function TopBar({ searchQuery, onSearchChange }: TopBarProps) {
  return (
    <header className="sticky top-0 z-50 pt-[env(safe-area-inset-top)]">
      {/* Decorative Background */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-primary/5 to-transparent" />
        <div className="absolute top-0 left-0 w-24 h-24 bg-primary/15 rounded-full -translate-x-1/2 -translate-y-1/2 blur-2xl" />
        <div className="absolute top-10 right-0 w-20 h-20 bg-primary/10 rounded-full translate-x-1/2 blur-xl" />

        <div className="relative bg-card/80 backdrop-blur-md border-b border-border/50 shadow-sm">
          <div className="px-4 py-3 flex items-center gap-3">
            {/* Search Input */}
            <div className="flex-1 relative">
              <Input
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="البحث عن الكوبونات والعروض..."
                className="h-11 rounded-2xl bg-background/80 border-2 border-border/50 pr-4 pl-10 text-sm placeholder:text-muted-foreground/60 focus:border-primary focus:bg-background transition-all duration-200 shadow-sm"
                dir="rtl"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
            </div>

            {/* Country Selector & Logo */}
            <div className="flex items-center gap-2">
              <CountrySelector />
              <div className="w-8 h-8 flex items-center justify-center">
                <Logo size="md" showText={false} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
