import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { RefreshCw, SlidersHorizontal, X } from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { HeroCarousel } from "@/components/home/HeroCarousel";
import { HomeBannerCarousel } from "@/components/home/HomeBannerCarousel";
import { CategoryChips } from "@/components/home/CategoryChips";
import { CouponCard } from "@/components/home/CouponCard";
import { CompactSkeleton } from "@/components/home/CompactSkeleton";
import { RefreshIndicator } from "@/components/home/RefreshIndicator";
import { PullToRefresh } from "@/components/shared/PullToRefresh";
import { CountryPickerModal } from "@/components/home/CountryPickerModal";
import { FilterSheet, SortOption } from "@/components/shared/FilterSheet";
import { useActiveCoupons, useActiveCategories } from "@/hooks/useAppData";
import { useApp } from "@/contexts/AppContext";
import { couponsCopy } from "@/content/couponsCopy.ar";
import type { Coupon } from "@/data/types";

type CategorySection = { categoryId: string; coupons: Coupon[] };

export default function Home() {
  const { selectedCountry } = useApp();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("popular");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [scrollSyncedCategory, setScrollSyncedCategory] = useState("all");
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const hasInitialized = useRef(false);
  const [showInitialSkeleton, setShowInitialSkeleton] = useState(
    !hasInitialized.current
  );

  const countryId = selectedCountry || undefined;

  const {
    coupons,
    loading: couponsLoading,
    error: couponsError,
  } = useActiveCoupons(countryId);
  const { categories, loading: categoriesLoading, error: categoriesError } =
    useActiveCategories();

  const isLoading = couponsLoading || categoriesLoading;
  const hasError = couponsError || categoriesError;

  const hasSearchQuery = searchQuery.trim().length > 0;
  const hasActiveFilters = sortBy !== "popular" || selectedCategory !== "all";

  const clearFilters = useCallback(() => {
    if (navigator.vibrate) navigator.vibrate(10);
    setSortBy("popular");
    setSelectedCategory("all");
  }, []);

  // First launch: show skeleton for 500ms to avoid jank
  useEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      const timer = setTimeout(() => setShowInitialSkeleton(false), 500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    setIsRefreshing(false);
  }, []);

  const filteredCoupons = useMemo(() => {
    let result = [...coupons];

    if (selectedCategory !== "all") {
      result = result.filter((c) => c.categoryId === selectedCategory);
    }
    if (searchQuery) {
      const q = searchQuery.trim().toLowerCase();
      if (q) {
        result = result.filter(
          (coupon) =>
            coupon.title.toLowerCase().includes(q) ||
            coupon.code.toLowerCase().includes(q) ||
            (coupon.storeName && coupon.storeName.toLowerCase().includes(q)) ||
            (coupon.storeNameEn && coupon.storeNameEn.toLowerCase().includes(q))
        );
      }
    }

    return result;
  }, [coupons, searchQuery, selectedCategory]);

  const sortCoupons = useCallback(
    (list: Coupon[]) => {
      if (sortBy === "popular") {
        return [...list].sort((a, b) => b.usageCount - a.usageCount);
      }
      if (sortBy === "a-z") {
        return [...list].sort((a, b) => a.title.localeCompare(b.title, "ar"));
      }
      if (sortBy === "z-a") {
        return [...list].sort((a, b) => b.title.localeCompare(a.title, "ar"));
      }
      return list;
    },
    [sortBy]
  );

  const sections = useMemo(() => {
    const categoryOrder = categories.filter((c) => c.id !== "all").map((c) => c.id);
    const byCategory = new Map<string, Coupon[]>();
    for (const coupon of filteredCoupons) {
      const id = coupon.categoryId;
      if (!byCategory.has(id)) byCategory.set(id, []);
      byCategory.get(id)!.push(coupon);
    }
    const ordered = categoryOrder
      .map((categoryId) => ({
        categoryId,
        coupons: sortCoupons(byCategory.get(categoryId) ?? []),
      }))
      .filter((s) => s.coupons.length > 0);
    const seen = new Set(categoryOrder);
    const rest = Array.from(byCategory.entries())
      .filter(([id]) => !seen.has(id))
      .map(([categoryId, coupons]) => ({ categoryId, coupons: sortCoupons(coupons) }))
      .filter((s) => s.coupons.length > 0);
    return [...ordered, ...rest];
  }, [filteredCoupons, categories, sortCoupons]);

  const getEmptyStateContent = () => {
    if (hasSearchQuery) {
      return {
        icon: "🔍",
        title: couponsCopy.empty.noResults,
        description: couponsCopy.empty.noResultsDescription.replace("{query}", searchQuery),
      };
    }
    return {
      icon: "🎟️",
      title: couponsCopy.empty.noCoupons,
      description: couponsCopy.empty.noCouponsDescription,
    };
  };

  const handleScrollToSection = useCallback((categoryId: string) => {
    if (navigator.vibrate) navigator.vibrate(10);
    if (categoryId === "all") {
      const root = scrollContainerRef.current;
      if (root) root.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    const el = document.querySelector(`[data-category-id="${categoryId}"]`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  useEffect(() => {
    const root = scrollContainerRef.current;
    if (!root) return;

    const sentinel = document.querySelector("[data-category-id=\"all\"]");
    const sectionEls = sections
      .map((s) => document.querySelector(`[data-category-id="${s.categoryId}"]`))
      .filter(Boolean) as Element[];

    const observed = sentinel ? [sentinel, ...sectionEls] : sectionEls;
    if (observed.length === 0) return;

    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length === 0) return;
        const byRatio = [...visible].sort((a, b) => (b.intersectionRatio ?? 0) - (a.intersectionRatio ?? 0));
        const top = byRatio[0]?.target;
        if (!top) return;
        const id = (top as HTMLElement).getAttribute("data-category-id") ?? "all";
        setScrollSyncedCategory(id);
      },
      { root, rootMargin: "-20% 0px -60% 0px", threshold: [0, 0.1, 0.5, 1] }
    );

    observed.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [sections]);

  return (
    <>
      <CountryPickerModal />
      <div className="flex flex-col h-full min-h-0 bg-background">
        {/* Fixed: Top Bar, Banner, Categories — do not scroll */}
        <div className="shrink-0">
          <TopBar searchQuery={searchQuery} onSearchChange={setSearchQuery} />
          <HomeBannerCarousel />
          <HeroCarousel />
          <div className="pt-4 pb-3">
            <div className="flex items-center gap-2 px-4">
              <button
                onClick={() => setIsFilterOpen(true)}
                className={`relative flex items-center justify-center w-10 h-10 rounded-2xl border-2 transition-all duration-200 shadow-sm hover:shadow-md active:scale-95 ${
                  hasActiveFilters
                    ? "bg-primary/10 border-primary text-primary"
                    : "bg-card border-border text-muted-foreground hover:bg-primary/5 hover:border-primary/50"
                }`}
              >
                <SlidersHorizontal className="w-5 h-5" />
                {hasActiveFilters && (
                  <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-primary rounded-full animate-pulse" />
                )}
              </button>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1.5 px-3.5 h-9 rounded-2xl bg-destructive/10 text-destructive text-sm font-semibold transition-all duration-200 hover:bg-destructive/20 active:scale-95 shadow-sm"
                >
                  <X className="w-4 h-4" />
                  <span>مسح</span>
                </button>
              )}
              <div className="flex-1 overflow-hidden">
                <CategoryChips
                  activeCategory={scrollSyncedCategory}
                  onSelectCategory={handleScrollToSection}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable: only the coupon list area */}
        <div className="flex-1 min-h-0 flex flex-col">
          <PullToRefresh
            onRefresh={handleRefresh}
            scrollContainerRef={(el) => {
              (scrollContainerRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
            }}
          >
            <div className="pb-4">
              <RefreshIndicator isVisible={isRefreshing} />
              {hasError && (
                <div className="mx-4 mb-4 p-4 bg-card border-2 border-border rounded-2xl shadow-card animate-fade-in">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-destructive/10 flex items-center justify-center shrink-0">
                      <span className="text-2xl">⚠️</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground mb-1">
                        تعذر تحميل البيانات
                      </p>
                      <p className="text-xs text-muted-foreground mb-3">
                        تحقق من اتصالك بالإنترنت وحاول مرة أخرى
                      </p>
                      <button
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-primary-foreground bg-primary hover:bg-primary/90 transition-all duration-200 disabled:opacity-50 shadow-sm hover:shadow-md active:scale-95"
                      >
                        <RefreshCw
                          className={`w-4 h-4 ${
                            isRefreshing ? "animate-spin" : ""
                          }`}
                        />
                        إعادة المحاولة
                      </button>
                    </div>
                  </div>
                </div>
              )}
              {/* Coupons List (grouped by category for scroll spy) */}
              <div className="px-4 space-y-3">
            {showInitialSkeleton || isLoading ? (
              <CompactSkeleton />
            ) : filteredCoupons.length > 0 ? (
              <>
                <div data-category-id="all" aria-hidden className="h-0 overflow-hidden" />
                {sections.map(({ categoryId, coupons: sectionCoupons }) => (
                  <section
                    key={categoryId}
                    data-category-id={categoryId}
                    className="space-y-3"
                  >
                    {sectionCoupons.map((coupon, index) => (
                      <div key={coupon.id}>
                        <div
                          className="animate-slide-up"
                          style={{ animationDelay: `${0.1 + index * 0.08}s` }}
                        >
                          <CouponCard coupon={coupon} />
                        </div>
                      </div>
                    ))}
                  </section>
                ))}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 px-8 text-center animate-fade-in">
                <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-5 shadow-sm">
                  <span className="text-5xl">
                    {getEmptyStateContent().icon}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">
                  {getEmptyStateContent().title}
                </h3>
                <p className="text-muted-foreground text-sm max-w-xs">
                  {getEmptyStateContent().description}
                </p>
              </div>
            )}
              </div>
            </div>
          </PullToRefresh>
        </div>
      </div>

      {/* Filter Sheet: sort + categories in one place */}
      <FilterSheet
        open={isFilterOpen}
        onOpenChange={setIsFilterOpen}
        sortBy={sortBy}
        onSortChange={setSortBy}
        selectedCategoryId={selectedCategory}
        onCategoryChange={setSelectedCategory}
        categories={categories}
        onApply={() => {
          setIsFilterOpen(false);
          if (selectedCategory !== "all") {
            setTimeout(() => handleScrollToSection(selectedCategory), 100);
          }
        }}
      />
    </>
  );
}
