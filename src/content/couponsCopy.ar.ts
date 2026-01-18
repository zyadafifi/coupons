/**
 * Central Arabic copy for coupons app
 * Egyptian/Gulf light Arabic tone
 */

export const couponsCopy = {
  // Home screen
  home: {
    title: "كوبونات",
    subtitle: "كوبونات وعروض موفّرة من أشهر المتاجر",
    helperLine: "جرّب الكود قبل الدفع واستمتع بالخصم فورًا 💸",
  },

  // Filter chips
  filters: {
    todayOffers: "عروض اليوم",
    mostUsed: "الأكثر استخدامًا",
    bigDiscounts: "خصومات كبيرة",
    cashback: "كاش باك",
    freeShipping: "توصيل مجاني",
    newStores: "متاجر جديدة",
  },

  // Coupon card
  card: {
    showCode: "اعرض الكود",
    description: "استمتع بخصم فوري عند الدفع باستخدام الكود.",
    // Title templates (will be formatted with coupon data)
    titleTemplate: {
      discountAndCashback: "تخفيضات نهاية السنة: خصم حتى {discount} + {cashback} كاش باك",
      discountOnly: "عرض حصري: خصم حتى {discount}",
      firstOrder: "عرض حصري: خصم حتى {discount} على أول طلب",
    },
  },

  // Conditions
  conditions: {
    minSpend: "الحد الأدنى للطلب: {amount}",
    maxDiscount: "الحد الأقصى للخصم: {amount}",
    selectedProducts: "صالح على منتجات مختارة",
    limitedTime: "يسري لفترة محدودة",
  },

  // Trust badges
  badges: {
    verifiedToday: "✔ تم التحقق اليوم",
    mostUsed: "🔥 الأكثر استخدامًا",
    usedCount: "👥 تم استخدامه {count} مرة",
  },

  // Modal / Show code
  modal: {
    title: "كود الخصم",
    subtitle: "انسخ الكود واستخدمه عند الدفع داخل المتجر.",
    copyButton: "نسخ",
    copyAndShopButton: "انسخ الكود وتسوق",
    copySuccess: "✅ تم نسخ الكود بنجاح",
    copyFailed: "فشل النسخ",
    tryAgain: "حاول مرة أخرى",
  },

  // Banner
  banner: {
    text: "لجميع العملاء 🔥\nتوصيل مجاني على طلبك القادم",
    cta: "احصل على الكود",
  },

  // Store/Brand page
  store: {
    title: "كوبونات وعروض {storeName} الحصرية",
    subtitle: "أحدث أكواد الخصم المفعّلة حاليًا على {storeName}",
    labels: {
      mostPopular: "الأكثر شعبية",
      newest: "الأحدث",
      endingSoon: "ينتهي قريبًا",
      bigDiscount: "خصم كبير",
    },
  },

  // You may also like
  youMayAlsoLike: "قد يعجبك أيضًا",

  // Coupon Detail page
  detail: {
    title: "قبل ما تنسخ الكود…",
    descriptionBullet: "•",
    helpTitle: "الكود ما اشتغلش معاك؟ 🤔",
    helpSubtitle: "أحيانًا بيكون العرض له شروط معينة.",
    discountPrefix: "خصم",
    savePrefix: "وفر",
    copyAndUse: "انسخ الكود واستخدمه عند الدفع",
    tryAtCheckout: "جرّب الكود عند إتمام الطلب",
    copyAndShopNow: "انسخ الكود وتسوق الآن",
    copyOnly: "نسخ الكود فقط",
    externalHint: "سيتم فتح المتجر في نافذة خارجية",
    urgency: "⏳ العرض لفترة محدودة",
    reportIssue: "الكود لا يعمل؟ بلّغنا",
    termsPreview: "الحد الأدنى للطلب – منتجات مختارة – غير قابل للجمع",
  },

  // Empty states
  empty: {
    noResults: "لا توجد نتائج",
    noResultsDescription: "لم نجد كوبونات تطابق \"{query}\"",
    noCouponsInCategory: "لا توجد كوبونات في هذه الفئة",
    noCouponsInCategoryDescription: "جرب اختيار فئة أخرى",
    noCoupons: "لا توجد كوبونات",
    noCouponsDescription: "لم يتم العثور على كوبونات متاحة حالياً",
  },
} as const;

