import { useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "@/firebase";
import {
  FirestoreCountry,
  FirestoreCategory,
  FirestoreStore,
  FirestoreCoupon,
  Coupon,
  Store,
  Category,
  CouponVariant,
} from "@/data/types";

// Placeholder image for coupons without store logo
const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=400&h=200&fit=crop";

// Convert Firestore coupon to app format with resolved store data
function firestoreCouponToApp(
  fc: FirestoreCoupon,
  storesMap: Map<string, FirestoreStore>,
  categoriesMap: Map<string, FirestoreCategory>
): Coupon {
  const store = storesMap.get(fc.storeId);
  const category = categoriesMap.get(fc.categoryId);

  // Warn on missing relations
  if (!store) {
    console.warn("[useAppData] Missing store for coupon", fc.id, {
      storeId: fc.storeId,
    });
  }
  if (!category) {
    console.warn("[useAppData] Missing category for coupon", fc.id, {
      categoryId: fc.categoryId,
    });
  }

  // Transform variants if they exist
  const variants: CouponVariant[] | undefined = fc.variants?.map((v) => ({
    id: v.id,
    labelAr: v.labelAr,
    labelEn: v.labelEn,
    code: v.code,
    discountLabel: v.discountLabel,
    descriptionAr: v.descriptionAr,
    descriptionEn: v.descriptionEn,
    linkUrl: v.linkUrl,
    isDefault: v.isDefault,
  }));  
  const anyFc = fc as any;

const ticketDescriptionAr =
  (anyFc.ticketDescriptionAr ?? "") ||
  (typeof anyFc.terms?.ticketDescriptionAr === "string" ? anyFc.terms.ticketDescriptionAr : "") ||
  (Array.isArray(anyFc.terms)
    ? // لو متخزن جوه terms array كـ object
      (anyFc.terms.find((t: any) => t && typeof t === "object" && typeof t.ticketDescriptionAr === "string")
        ?.ticketDescriptionAr ?? "")
    : "");

  
  return {
    id: fc.id,
    storeId: fc.storeId,
    categoryId: fc.categoryId,
    countryCode: "SA", // Legacy field, not used for filtering
    countryId: fc.countryId,
    title: fc.titleAr || "",
    description: fc.descriptionAr || "",
    code: fc.code || "",
    discount: fc.discountLabel || "",
    discountType: "percentage",
    // Image: prefer store banner for background, else logo, else placeholder
    image: store?.bannerUrl || store?.logoUrl || PLACEHOLDER_IMAGE,
    terms: Array.isArray(anyFc.terms) ? anyFc.terms.filter((t: any) => typeof t === "string") : [],

    expiryDate: fc.expiryDate?.toDate?.()?.toISOString?.()?.split("T")[0] || "",
    isPopular: fc.isPopular || false,
    usageCount: fc.usageCount || 0,
    createdAt:
      fc.createdAt?.toDate?.()?.toISOString?.() || new Date().toISOString(),
    isActive: fc.isActive,
    // Resolved display fields for CouponCard
    titleAr: fc.titleAr,
    titleEn: fc.titleEn,
    descriptionAr: fc.descriptionAr,
    descriptionEn: fc.descriptionEn,
    discountLabel: fc.discountLabel,
    linkUrl: fc.linkUrl || store?.websiteUrl || "",
    // Store display fields (pre-resolved)
    storeName: store?.nameAr || store?.nameEn || "متجر",
    storeLogoUrl: store?.logoUrl || "",
    // Category display fields (pre-resolved)
    categoryName: category?.nameAr || category?.nameEn || "",
    ticketDescriptionAr,


    // Variants for different user types
    variants,
    
  };
}

function firestoreStoreToApp(fs: FirestoreStore): Store {
  return {
    id: fs.id,
    name: fs.nameAr || fs.nameEn || "",
    nameEn: fs.nameEn || "",
    logo: "🏪",
    color: "#6366f1",
    nameAr: fs.nameAr,
    logoUrl: fs.logoUrl,
    bannerUrl: fs.bannerUrl,
    websiteUrl: fs.websiteUrl,
    countryId: fs.countryId,
    isActive: fs.isActive,
  };
}

function firestoreCategoryToApp(fc: FirestoreCategory): Category {
  return {
    id: fc.id,
    name: fc.nameAr || fc.nameEn || "",
    nameEn: fc.nameEn || "",
    icon: fc.icon || "🏷️",
    nameAr: fc.nameAr,
    sortOrder: fc.sortOrder,
    isActive: fc.isActive,
  };
}

// Hook to get active coupons for user app with resolved store/category data
// Uses real-time listeners (onSnapshot) for automatic updates when admin changes data
export function useActiveCoupons(countryId?: string) {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [storesMap, setStoresMap] = useState<Map<string, FirestoreStore>>(
    new Map()
  );
  const [categoriesMap, setCategoriesMap] = useState<
    Map<string, FirestoreCategory>
  >(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dataLoaded, setDataLoaded] = useState({
    stores: false,
    categories: false,
    coupons: false,
  });
  const [couponsData, setCouponsData] = useState<FirestoreCoupon[]>([]);

  // Load stores
  useEffect(() => {
    console.log("[useActiveCoupons] Loading stores...");
    const q = query(collection(db, "stores"), where("isActive", "==", true));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const map = new Map<string, FirestoreStore>();
        snapshot.docs.forEach((docSnap) => {
          const store = { id: docSnap.id, ...docSnap.data() } as FirestoreStore;
          map.set(docSnap.id, store);
        });
        console.log("[useActiveCoupons] Stores loaded:", map.size);
        setStoresMap(map);
        setDataLoaded((prev) => ({ ...prev, stores: true }));
      },
      (err) => {
        console.error("[useActiveCoupons] Error fetching stores:", err);
        setError(err.message);
        setDataLoaded((prev) => ({ ...prev, stores: true }));
      }
    );
    return () => unsubscribe();
  }, []);

  // Load categories
  useEffect(() => {
    console.log("[useActiveCoupons] Loading categories...");
    const q = query(
      collection(db, "categories"),
      where("isActive", "==", true)
    );
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const map = new Map<string, FirestoreCategory>();
        snapshot.docs.forEach((docSnap) => {
          const category = {
            id: docSnap.id,
            ...docSnap.data(),
          } as FirestoreCategory;
          map.set(docSnap.id, category);
        });
        console.log("[useActiveCoupons] Categories loaded:", map.size);
        setCategoriesMap(map);
        setDataLoaded((prev) => ({ ...prev, categories: true }));
      },
      (err) => {
        console.error("[useActiveCoupons] Error fetching categories:", err);
        setError(err.message);
        setDataLoaded((prev) => ({ ...prev, categories: true }));
      }
    );
    return () => unsubscribe();
  }, []);

  // Load coupons
  useEffect(() => {
    console.log("[useActiveCoupons] Loading coupons for country:", countryId);
    const constraints = [where("isActive", "==", true)];
    if (countryId) {
      constraints.push(where("countryId", "==", countryId));
    }

    const q = query(collection(db, "coupons"), ...constraints);

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        })) as FirestoreCoupon[];
        console.log("[useActiveCoupons] Coupons loaded:", items.length);
        setCouponsData(items);
        setDataLoaded((prev) => ({ ...prev, coupons: true }));
      },
      (err) => {
        console.error("[useActiveCoupons] Error fetching coupons:", err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [countryId]);

  // Merge coupons with stores and categories when all are ready
  useEffect(() => {
    if (!dataLoaded.stores || !dataLoaded.categories || !dataLoaded.coupons) {
      console.log("[useActiveCoupons] Waiting for data...", dataLoaded);
      return;
    }

    console.log("[useActiveCoupons] Merging data:", {
      coupons: couponsData.length,
      stores: storesMap.size,
      categories: categoriesMap.size,
    });

    const converted = couponsData.map((fc) =>
      firestoreCouponToApp(fc, storesMap, categoriesMap)
    );

    console.log("[useActiveCoupons] Final coupons:", converted.length);
    console.log("[useActiveCoupons] Sample coupon:", converted[0]);

    setCoupons(converted);
    setLoading(false);
    setError(null);
  }, [dataLoaded, storesMap, categoriesMap, couponsData]);

  return { coupons, loading, error };
}

// Hook to get active categories
export function useActiveCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const q = query(
      collection(db, "categories"),
      where("isActive", "==", true)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        })) as FirestoreCategory[];

        // Sort in-memory by sortOrder
        items.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

        // Add "All" category at start
        const allCategory: Category = {
          id: "all",
          name: "الكل",
          nameEn: "All",
          icon: "🏷️",
        };
        const converted = items.map(firestoreCategoryToApp);

        console.log(
          "[useActiveCategories] Loaded:",
          items.length,
          "categories"
        );
        setCategories([allCategory, ...converted]);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error("[useActiveCategories] Error:", err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { categories, loading, error };
}

// Hook to get active stores
export function useActiveStores(countryId?: string) {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const constraints = [where("isActive", "==", true)];
    if (countryId) {
      constraints.push(where("countryId", "==", countryId));
    }

    const q = query(collection(db, "stores"), ...constraints);

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        })) as FirestoreStore[];

        console.log("[useActiveStores] Loaded:", items.length, "stores");
        setStores(items.map(firestoreStoreToApp));
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error("[useActiveStores] Error:", err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [countryId]);

  return { stores, loading, error };
}

// Hook to get active countries from Firestore
export function useActiveCountries() {
  const [countries, setCountries] = useState<FirestoreCountry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, "countries"), where("isActive", "==", true));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        })) as FirestoreCountry[];

        console.log("[useActiveCountries] Loaded:", items.length, "countries");
        setCountries(items);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error("[useActiveCountries] Error:", err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { countries, loading, error };
}

// Get single coupon by ID with resolved relations
export async function getCouponByIdForUser(id: string): Promise<{
  coupon: Coupon | null;
  store: Store | null;
  category: Category | null;
}> {
  try {
    const couponDoc = await getDoc(doc(db, "coupons", id));

    if (!couponDoc.exists()) {
      return { coupon: null, store: null, category: null };
    }

    const couponData = {
      id: couponDoc.id,
      ...couponDoc.data(),
    } as FirestoreCoupon;

    // Build maps for single coupon
    const storesMap = new Map<string, FirestoreStore>();
    const categoriesMap = new Map<string, FirestoreCategory>();

    // Get store
    let store: Store | null = null;
    if (couponData.storeId) {
      const storeDoc = await getDoc(doc(db, "stores", couponData.storeId));
      if (storeDoc.exists()) {
        const storeData = {
          id: storeDoc.id,
          ...storeDoc.data(),
        } as FirestoreStore;
        storesMap.set(storeDoc.id, storeData);
        store = firestoreStoreToApp(storeData);
      }
    }

    // Get category
    let category: Category | null = null;
    if (couponData.categoryId) {
      const categoryDoc = await getDoc(
        doc(db, "categories", couponData.categoryId)
      );
      if (categoryDoc.exists()) {
        const categoryData = {
          id: categoryDoc.id,
          ...categoryDoc.data(),
        } as FirestoreCategory;
        categoriesMap.set(categoryDoc.id, categoryData);
        category = firestoreCategoryToApp(categoryData);
      }
    }

    const coupon = firestoreCouponToApp(couponData, storesMap, categoriesMap);

    return { coupon, store, category };
  } catch (error) {
    console.error("[getCouponByIdForUser] Error:", error);
    throw error;
  }
}

// Get store by ID
export function useStoreById(storeId: string | undefined) {
  const [store, setStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!storeId) {
      setLoading(false);
      return;
    }

    getDoc(doc(db, "stores", storeId))
      .then((docSnap) => {
        if (docSnap.exists()) {
          setStore(
            firestoreStoreToApp({
              id: docSnap.id,
              ...docSnap.data(),
            } as FirestoreStore)
          );
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("[useStoreById] Error:", err);
        setError(err.message);
        setLoading(false);
      });
  }, [storeId]);

  return { store, loading, error };
}
