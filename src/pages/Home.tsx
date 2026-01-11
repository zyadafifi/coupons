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

export default function Home() {
  const { selectedCountry } = useApp();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState<SortOption>("popular");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
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
  const { loading: categoriesLoading, error: categoriesError } =
    useActiveCategories();

  const isLoading = couponsLoading || categoriesLoading;
  const hasError = couponsError || categoriesError;

  const hasSearchQuery = searchQuery.trim().length > 0;
  const hasActiveFilters = selectedCategory !== "all" || sortBy !== "popular";

  const clearFilters = useCallback(() => {
    // Haptic feedback
    if (navigator.vibrate) navigator.vibrate(10);
    setSelectedCategory("all");
    setSortBy("popular");
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

    // Filter by category
    if (selectedCategory && selectedCategory !== "all") {
      result = result.filter(
        (coupon) => coupon.categoryId === selectedCategory
      );
    }

    // Search filter
    if (searchQuery) {
      result = result.filter(
        (coupon) =>
          coupon.title.includes(searchQuery) ||
          coupon.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (coupon.storeName && coupon.storeName.includes(searchQuery))
      );
    }

    // Sort based on sortBy option
    if (sortBy === "popular") {
      result = [...result].sort((a, b) => b.usageCount - a.usageCount);
    } else if (sortBy === "a-z") {
      result = [...result].sort((a, b) => a.title.localeCompare(b.title, "ar"));
    } else if (sortBy === "z-a") {
      result = [...result].sort((a, b) => b.title.localeCompare(a.title, "ar"));
    }

    return result;
  }, [coupons, selectedCategory, searchQuery, sortBy]);

  // Determine empty state type
  const getEmptyStateContent = () => {
    if (hasSearchQuery) {
      return {
        icon: "🔍",
        title: couponsCopy.empty.noResults,
        description: couponsCopy.empty.noResultsDescription.replace("{query}", searchQuery),
      };
    }
    if (selectedCategory !== "all") {
      return {
        icon: "📂",
        title: couponsCopy.empty.noCouponsInCategory,
        description: couponsCopy.empty.noCouponsInCategoryDescription,
      };
    }
    return {
      icon: "🎟️",
      title: couponsCopy.empty.noCoupons,
      description: couponsCopy.empty.noCouponsDescription,
    };
  };

  return (
    <>
      <CountryPickerModal />
      <PullToRefresh onRefresh={handleRefresh}>
        <div className="min-h-screen pb-20 bg-background">
          {/* Top Bar */}
          <TopBar searchQuery={searchQuery} onSearchChange={setSearchQuery} />

          {/* Banner Carousel */}
          <HomeBannerCarousel />

          {/* Hero Carousel */}
          <HeroCarousel />

          {/* Header Section */}
          <div className="px-4 pt-8 pb-6 text-center">
            <div className="relative inline-block max-w-2xl mx-auto">
              {/* Decorative background */}
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 rounded-3xl blur-xl -z-10" />
              
              <div className="relative bg-gradient-to-br from-card/50 to-card/30 backdrop-blur-sm rounded-2xl px-6 py-5 border border-border/50 shadow-sm">
                <p className="text-base font-semibold text-foreground mb-2.5 leading-relaxed">
                  {couponsCopy.home.subtitle}
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {couponsCopy.home.helperLine}
                </p>
              </div>
            </div>
          </div>

          {/* Categories with Filter Button */}
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
              {/* Clear Filters Chip */}
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
                  selectedCategory={selectedCategory}
                  onSelectCategory={setSelectedCategory}
                />
              </div>
            </div>
          </div>

          {/* Refresh Indicator */}
          <RefreshIndicator isVisible={isRefreshing} />

          {/* Error Banner */}
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

          {/* Coupons List */}
          <div className="px-4 space-y-3">
            {showInitialSkeleton || isLoading ? (
              <CompactSkeleton />
            ) : filteredCoupons.length > 0 ? (
              filteredCoupons.map((coupon, index) => (
                <div key={coupon.id}>
                  <div
                    className="animate-slide-up"
                    style={{ animationDelay: `${0.1 + index * 0.08}s` }}
                  >
                    <CouponCard coupon={coupon} />
                  </div>
                </div>
              ))
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

      {/* Filter Sheet */}
      <FilterSheet
        open={isFilterOpen}
        onOpenChange={setIsFilterOpen}
        sortBy={sortBy}
        onSortChange={setSortBy}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        onApply={() => setIsFilterOpen(false)}
      />
    </>
  );
}
