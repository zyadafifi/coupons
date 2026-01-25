import { useState, useMemo } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  useCoupons,
  useCountries,
  useCategories,
  useStores,
  addCoupon,
  updateCoupon,
  deleteCoupon,
  timestampToString,
} from "@/hooks/useFirestore";
import { FirestoreCoupon, CouponVariant } from "@/data/types";
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Search,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { toast } from "sonner";
import { Timestamp } from "firebase/firestore";
import { cn } from "@/lib/utils";

// Generate unique ID for variants
function generateVariantId() {
  return `var_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export default function AdminCoupons() {
  const { data: coupons = [], loading } = useCoupons();
  const { data: countries = [] } = useCountries();
  const { data: categories = [] } = useCategories();
  const { data: allStores = [] } = useStores();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<FirestoreCoupon | null>(
    null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCountry, setFilterCountry] = useState<string>("");
  const [filterCategory, setFilterCategory] = useState<string>("");
  const [filterStore] = useState<string>("");
  const [sortBy, setSortBy] = useState<"newest" | "popular">("newest");

  const [formData, setFormData] = useState({
    titleAr: "",
    descriptionAr: "",
    code: "",
    discountLabel: "",
    storeId: "",
    ticketDescriptionAr: "",
    categoryId: "",
    countryId: "",
    linkUrl: "",
    offerButtonLabel: "",
    bannerUrl: "",
    expiryDate: "",
    terms: [] as string[],
    isPopular: false,
    isActive: true,
    usageCount: 0,
    variants: [] as CouponVariant[],
  });
  const [newTerm, setNewTerm] = useState("");
  const [showVariantsSection, setShowVariantsSection] = useState(false);

  // Filter stores by selected country
  const filteredStoresForForm = useMemo(() => {
    if (!formData.countryId) return allStores;
    return allStores.filter((s) => s.countryId === formData.countryId);
  }, [allStores, formData.countryId]);

  // Filter and sort coupons
  const filteredCoupons = useMemo(() => {
    let result = [...coupons];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (c) =>
          c.titleAr?.toLowerCase().includes(query) ||
          c.code?.toLowerCase().includes(query)
      );
    }

    if (filterCountry && filterCountry !== "ALL") {
      result = result.filter((c) => c.countryId === filterCountry);
    }

    if (filterCategory && filterCategory !== "ALL") {
      result = result.filter((c) => c.categoryId === filterCategory);
    }

    if (filterStore && filterStore !== "ALL") {
      result = result.filter((c) => c.storeId === filterStore);
    }

    if (sortBy === "newest") {
      result.sort((a, b) => {
        const dateA = a.createdAt?.toDate?.() || new Date(0);
        const dateB = b.createdAt?.toDate?.() || new Date(0);
        return dateB.getTime() - dateA.getTime();
      });
    } else {
      result.sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0));
    }

    return result;
  }, [
    coupons,
    searchQuery,
    filterCountry,
    filterCategory,
    filterStore,
    sortBy,
  ]);

  const resetForm = () => {
    setFormData({
      titleAr: "",
      descriptionAr: "",
      code: "",
      ticketDescriptionAr: "",
      discountLabel: "",
      storeId: "",
      categoryId: "",
      countryId: "",
      linkUrl: "",
      offerButtonLabel: "",
      bannerUrl: "",
      expiryDate: "",
      terms: [],
      isPopular: false,
      isActive: true,
      usageCount: 0,
      variants: [],
    });
    setNewTerm("");
    setEditingCoupon(null);
    setShowVariantsSection(false);
  };

  const openCreateDialog = () => {
    resetForm();
    setDialogOpen(true);
  };

  const openEditDialog = (coupon: FirestoreCoupon) => {
    setEditingCoupon(coupon);
    // Defensive: Filter terms to only strings (in case old data has objects)
    const cleanTerms = Array.isArray(coupon.terms)
      ? coupon.terms.filter((t) => typeof t === "string")
      : [];
    setFormData({
      titleAr: coupon.titleAr || "",
      descriptionAr: coupon.descriptionAr || "",
      code: coupon.code || "",
      discountLabel: coupon.discountLabel || "",
      storeId: coupon.storeId || "",
      ticketDescriptionAr: coupon.ticketDescriptionAr || "",
      categoryId: coupon.categoryId || "",
      countryId: coupon.countryId || "",
      linkUrl: coupon.linkUrl || "",
      offerButtonLabel: (coupon as any).offerButtonLabel || "",
      bannerUrl: (coupon as any).bannerUrl || "",
      expiryDate: timestampToString(coupon.expiryDate),
      terms: cleanTerms,
      isPopular: coupon.isPopular || false,
      isActive: coupon.isActive ?? true,
      usageCount: coupon.usageCount || 0,
      variants: coupon.variants || [],
    });
    setShowVariantsSection((coupon.variants?.length || 0) > 0);
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Defensive: Filter terms to only strings (in case formData has objects from old data)
      const cleanTerms = Array.isArray(formData.terms)
        ? formData.terms.filter((t) => typeof t === "string")
        : [];

      // Build data object, excluding undefined values
      const data: Record<string, any> = {
        titleAr: formData.titleAr,
        titleEn: formData.titleAr, // Use Arabic for both
        descriptionAr: formData.descriptionAr,
        descriptionEn: formData.descriptionAr, // Use Arabic for both
        ticketDescriptionAr: formData.ticketDescriptionAr ?? "",
        code: formData.code,
        discountLabel: formData.discountLabel,
        storeId: formData.storeId,
        categoryId: formData.categoryId,
        countryId: formData.countryId,
        linkUrl: formData.linkUrl,
        offerButtonLabel: formData.offerButtonLabel,
        bannerUrl: formData.bannerUrl || null,
        terms: cleanTerms,
        isPopular: formData.isPopular,
        isActive: formData.isActive,
        usageCount: formData.usageCount,
        expiryDate: formData.expiryDate
          ? Timestamp.fromDate(new Date(formData.expiryDate))
          : null,
      };

      // Only add variants if there are any
      if (formData.variants.length > 0) {
        data.variants = formData.variants;
      }

      if (editingCoupon) {
        await updateCoupon(editingCoupon.id, data);
        toast.success("تم تحديث الكوبون بنجاح");
      } else {
        await addCoupon(data as any);
        toast.success("تم إضافة الكوبون بنجاح");
      }
      setDialogOpen(false);
      resetForm();
    } catch (error: any) {
      const errorMessage = error?.message || error?.code || String(error);
      console.error("❌ Coupon Submit Error:", {
        error,
        message: errorMessage,
        code: error?.code,
        details: error?.details,
      });
      toast.error(`خطأ: ${errorMessage}`);
    }

    setIsSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا الكوبون؟")) return;

    try {
      await deleteCoupon(id);
      toast.success("تم حذف الكوبون بنجاح");
    } catch (error: any) {
      const errorMessage = error?.message || error?.code || String(error);
      console.error("❌ Coupon Delete Error:", error);
      toast.error(`خطأ في الحذف: ${errorMessage}`);
    }
  };

  const handleToggleActive = async (coupon: FirestoreCoupon) => {
    try {
      await updateCoupon(coupon.id, { isActive: !coupon.isActive });
      toast.success("تم تحديث الحالة");
    } catch (error: any) {
      const errorMessage = error?.message || error?.code || String(error);
      console.error("❌ Toggle Active Error:", error);
      toast.error(`خطأ: ${errorMessage}`);
    }
  };

  const addTerm = () => {
    if (newTerm.trim()) {
      setFormData({ ...formData, terms: [...formData.terms, newTerm.trim()] });
      setNewTerm("");
    }
  };

  const removeTerm = (index: number) => {
    setFormData({
      ...formData,
      terms: formData.terms.filter((_, i) => i !== index),
    });
  };

  // Variant management functions
  const addVariant = () => {
    const newVariant: CouponVariant = {
      id: generateVariantId(),
      labelAr: "",
      code: "",
      discountLabel: "",
      descriptionAr: "",
      linkUrl: "",
      offerButtonLabel: "",
      isDefault: formData.variants.length === 0, // First variant is default
    };
    setFormData({ ...formData, variants: [...formData.variants, newVariant] });
  };

  const updateVariant = (index: number, updates: Partial<CouponVariant>) => {
    const updatedVariants = [...formData.variants];
    updatedVariants[index] = { ...updatedVariants[index], ...updates };
    setFormData({ ...formData, variants: updatedVariants });
  };

  const removeVariant = (index: number) => {
    const updatedVariants = formData.variants.filter((_, i) => i !== index);
    // If we removed the default, make the first one default
    if (formData.variants[index]?.isDefault && updatedVariants.length > 0) {
      updatedVariants[0].isDefault = true;
    }
    setFormData({ ...formData, variants: updatedVariants });
  };

  const setDefaultVariant = (index: number) => {
    const updatedVariants = formData.variants.map((v, i) => ({
      ...v,
      isDefault: i === index,
    }));
    setFormData({ ...formData, variants: updatedVariants });
  };

  const getStoreName = (storeId: string) => {
    const store = allStores.find((s) => s.id === storeId);
    return store?.nameAr || storeId;
  };

  const getCountryFlag = (countryId: string) => {
    const country = countries.find((c) => c.id === countryId);
    return country?.flag || "";
  };

  return (
    <AdminLayout title="إدارة الكوبونات">
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-2xl font-bold">الكوبونات</h1>
          <Button onClick={openCreateDialog}>
            <Plus className="w-4 h-4 ml-2" />
            إضافة كوبون
          </Button>
        </div>

        {/* Filters */}
        <div className="bg-background p-4 rounded-lg border space-y-3">
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="بحث بالعنوان أو الكود..."
                className="pr-10"
              />
            </div>
            <Select value={filterCountry} onValueChange={setFilterCountry}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="الدولة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">الكل</SelectItem>
                {countries.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.flag} {c.nameAr}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="التصنيف" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">الكل</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.icon} {c.nameAr}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
              <SelectTrigger className="w-[130px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">الأحدث</SelectItem>
                <SelectItem value="popular">الأكثر استخداماً</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="bg-background rounded-lg border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-center">الكود</TableHead>
                  <TableHead className="text-center">العنوان</TableHead>
                  <TableHead className="text-center">المتجر</TableHead>
                  <TableHead className="text-center">الخصم</TableHead>
                  <TableHead className="text-center">الدولة</TableHead>
                  <TableHead className="text-center">المتغيرات</TableHead>
                  <TableHead className="text-center">الحالة</TableHead>
                  <TableHead className="text-center">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCoupons.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="text-center text-muted-foreground py-8"
                    >
                      لا توجد كوبونات
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCoupons.map((coupon) => (
                    <TableRow key={coupon.id}>
                      <TableCell className="font-mono text-sm text-center">
                        {coupon.code}
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate text-center">
                        {coupon.titleAr}
                      </TableCell>
                      <TableCell className="text-center">{getStoreName(coupon.storeId)}</TableCell>
                      <TableCell className="text-center">{coupon.discountLabel}</TableCell>
                      <TableCell className="text-center">{getCountryFlag(coupon.countryId)}</TableCell>
                      <TableCell className="text-center">
                        {coupon.variants && coupon.variants.length > 0 ? (
                          <span className="bg-primary/10 text-primary px-2 py-1 rounded text-xs">
                            {coupon.variants.length} متغير
                          </span>
                        ) : (
                          <span className="text-muted-foreground text-xs">
                            -
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex justify-center">
                          <Switch
                            checked={coupon.isActive}
                            onCheckedChange={() => handleToggleActive(coupon)}
                          />
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditDialog(coupon)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(coupon.id)}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent
          dir="rtl"
          className="max-w-2xl max-h-[90vh] overflow-y-auto"
        >
          <DialogHeader>
            <DialogTitle>
              {editingCoupon ? "تعديل الكوبون" : "إضافة كوبون جديد"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>كود الكوبون الرئيسي</Label>
                <Input
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      code: e.target.value.toUpperCase(),
                    })
                  }
                  placeholder="SAVE20"
                  required
                  className="font-mono"
                />
              </div>
              <div className="space-y-2">
                <Label>الخصم الرئيسي</Label>
                <Input
                  value={formData.discountLabel}
                  onChange={(e) =>
                    setFormData({ ...formData, discountLabel: e.target.value })
                  }
                  placeholder="20% أو شحن مجاني"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>الدولة</Label>
                <Select
                  value={formData.countryId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, countryId: value, storeId: "" })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر" />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.flag} {c.nameAr}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>المتجر</Label>
                <Select
                  value={formData.storeId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, storeId: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredStoresForForm.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.nameAr}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>التصنيف</Label>
                <Select
                  value={formData.categoryId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, categoryId: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.icon} {c.nameAr}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>العنوان</Label>
              <Input
                value={formData.titleAr}
                onChange={(e) =>
                  setFormData({ ...formData, titleAr: e.target.value })
                }
                placeholder="خصم 20% على جميع المنتجات"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>الوصف (يدعم HTML)</Label>
              <RichTextEditor
                value={formData.descriptionAr}
                onChange={(value) =>
                  setFormData({ ...formData, descriptionAr: value })
                }
                dir="rtl"
              />
            </div>
            <div className="space-y-2">
              <Label>وصف التذكرة</Label>
              <Input
                value={(formData as any).ticketDescriptionAr || ""}
                onChange={(e) =>
                  setFormData({
                    ...(formData as any),
                    ticketDescriptionAr: e.target.value,
                  })
                }
                placeholder="مثال: *الشروط والأحكام"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>رابط العرض</Label>
                <Input
                  value={formData.linkUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, linkUrl: e.target.value })
                  }
                  placeholder="https://store.com/offer"
                  type="url"
                />
              </div>
              <div className="space-y-2">
                <Label>اسم زر العرض</Label>
                <Input
                  value={formData.offerButtonLabel}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      offerButtonLabel: e.target.value,
                    })
                  }
                  placeholder="احصل على العرض"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>رابط صورة البنر</Label>
              <Input
                value={formData.bannerUrl}
                onChange={(e) =>
                  setFormData({ ...formData, bannerUrl: e.target.value })
                }
                placeholder="https://example.com/banner.jpg"
                type="url"
              />
              {formData.bannerUrl && (
                <div className="mt-2 p-2 bg-muted rounded-lg">
                  <img 
                    src={formData.bannerUrl} 
                    alt="معاينة البنر" 
                    className="w-full h-32 object-cover rounded"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                سيتم استخدام هذه الصورة كخلفية في صفحة تفاصيل الكوبون. إذا لم يتم تحديد رابط، سيتم استخدام الصورة الافتراضية.
              </p>
            </div>

            <div className="space-y-2">
              <Label>تاريخ الانتهاء</Label>
              <Input
                value={formData.expiryDate}
                onChange={(e) =>
                  setFormData({ ...formData, expiryDate: e.target.value })
                }
                type="date"
              />
            </div>

            {/* Variants Section */}
            <div className="border rounded-lg overflow-hidden">
              <button
                type="button"
                onClick={() => setShowVariantsSection(!showVariantsSection)}
                className="w-full flex items-center justify-between p-4 bg-muted/50 hover:bg-muted transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="font-medium">📦 متغيرات الكوبون</span>
                  {formData.variants.length > 0 && (
                    <span className="bg-primary text-primary-foreground px-2 py-0.5 rounded text-xs">
                      {formData.variants.length}
                    </span>
                  )}
                </div>
                {showVariantsSection ? (
                  <ChevronUp className="w-5 h-5" />
                ) : (
                  <ChevronDown className="w-5 h-5" />
                )}
              </button>

              {showVariantsSection && (
                <div className="p-4 space-y-4">
                  <p className="text-sm text-muted-foreground">
                    أضف متغيرات مختلفة للكوبون (مثل: للمستخدم الجديد، للمستخدم
                    القديم)
                  </p>

                  {/* Variants List */}
                  {formData.variants.map((variant, index) => (
                    <div
                      key={variant.id}
                      className={cn(
                        "border rounded-lg p-4 space-y-3",
                        variant.isDefault && "border-primary bg-primary/5"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <input
                            type="radio"
                            checked={variant.isDefault}
                            onChange={() => setDefaultVariant(index)}
                            className="w-4 h-4 text-primary"
                          />
                          <span className="text-sm font-medium">
                            {variant.isDefault
                              ? "افتراضي"
                              : "متغير " + (index + 1)}
                          </span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeVariant(index)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>

                      <div className="space-y-1">
                        <Label className="text-xs">اسم المتغير</Label>
                        <Input
                          value={variant.labelAr}
                          onChange={(e) =>
                            updateVariant(index, { labelAr: e.target.value })
                          }
                          placeholder="للمستخدم الجديد"
                          className="h-9"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs">الكود</Label>
                          <Input
                            value={variant.code}
                            onChange={(e) =>
                              updateVariant(index, {
                                code: e.target.value.toUpperCase(),
                              })
                            }
                            placeholder="NEW20"
                            className="h-9 font-mono"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">الخصم</Label>
                          <Input
                            value={variant.discountLabel}
                            onChange={(e) =>
                              updateVariant(index, {
                                discountLabel: e.target.value,
                              })
                            }
                            placeholder="30% + هدية"
                            className="h-9"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <Label className="text-xs">الوصف (يدعم HTML)</Label>
                        <RichTextEditor
                          value={variant.descriptionAr || ""}
                          onChange={(value) =>
                            updateVariant(index, { descriptionAr: value })
                          }
                          dir="rtl"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs">رابط خاص</Label>
                          <Input
                            value={variant.linkUrl || ""}
                            onChange={(e) =>
                              updateVariant(index, { linkUrl: e.target.value })
                            }
                            placeholder="https://store.com/new-user-offer"
                            type="url"
                            className="h-9"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">اسم زر العرض</Label>
                          <Input
                            value={variant.offerButtonLabel || ""}
                            onChange={(e) =>
                              updateVariant(index, {
                                offerButtonLabel: e.target.value,
                              })
                            }
                            placeholder="احصل على العرض"
                            className="h-9"
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  <Button
                    type="button"
                    variant="outline"
                    onClick={addVariant}
                    className="w-full"
                  >
                    <Plus className="w-4 h-4 ml-2" />
                    إضافة متغير
                  </Button>
                </div>
              )}
            </div>

            {/* Terms */}
            <div className="space-y-2">
              <Label>الشروط والأحكام</Label>
              <div className="flex gap-2">
                <Input
                  value={newTerm}
                  onChange={(e) => setNewTerm(e.target.value)}
                  placeholder="أضف شرطاً..."
                  onKeyDown={(e) =>
                    e.key === "Enter" && (e.preventDefault(), addTerm())
                  }
                />
                <Button type="button" variant="outline" onClick={addTerm}>
                  إضافة
                </Button>
              </div>
              {formData.terms.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.terms.map((term, i) => (
                    <span
                      key={i}
                      className="bg-muted px-2 py-1 rounded text-sm flex items-center gap-1"
                    >
                      {term}
                      <button type="button" onClick={() => removeTerm(i)}>
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>عدد الاستخدامات</Label>
                <Input
                  type="number"
                  value={formData.usageCount}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      usageCount: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>
              <div className="flex items-center gap-2 pt-6">
                <Switch
                  checked={formData.isPopular}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, isPopular: checked })
                  }
                />
                <Label>شائع</Label>
              </div>
              <div className="flex items-center gap-2 pt-6">
                <Switch
                  checked={formData.isActive}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, isActive: checked })
                  }
                />
                <Label>مفعّل</Label>
              </div>
            </div>

            <DialogFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : editingCoupon ? (
                  "تحديث"
                ) : (
                  "إضافة"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
