export interface Store {
  id: string;
  name: string;
  nameEn: string;
  logo: string;
  color: string;
  // Firestore fields
  nameAr?: string;
  logoUrl?: string;
  bannerUrl?: string;
  websiteUrl?: string;
  countryId?: string;
  isActive?: boolean;
}

export interface Category {
  id: string;
  name: string;
  nameEn: string;
  icon: string;
  // Firestore fields
  nameAr?: string;
  sortOrder?: number;
  isActive?: boolean;
}

export type CountryCode = "SA" | "AE" | "EG" | "KW" | "OM" | "BH" | "QA";

export interface Country {
  code: CountryCode;
  name: string;
  flag: string;
  // Firestore fields
  id?: string;
  nameAr?: string;
  nameEn?: string;
  isActive?: boolean;
}

export interface Coupon {
  id: string;
  storeId: string;
  categoryId: string;
  countryCode: CountryCode;
  title: string;
  description: string;
  code: string;
  discount: string;
  discountType: "percentage" | "fixed" | "free_shipping";
  image: string;
  ticketDescriptionAr?: string;
  terms: string[];
  expiryDate: string;
  isPopular: boolean;
  usageCount: number;
  createdAt: string;
  // Firestore fields
  titleAr?: string;
  titleEn?: string;
  descriptionAr?: string;
  descriptionEn?: string;
  discountLabel?: string;
  countryId?: string;
  linkUrl?: string;
  offerButtonLabel?: string;
  isActive?: boolean;
  updatedAt?: string;
  // Pre-resolved display fields
  storeName?: string;
  storeLogoUrl?: string;
  categoryName?: string;
  // Variants for different user types
  variants?: CouponVariant[];
}

// Firestore-specific types
export interface FirestoreCountry {
  id: string;
  nameAr: string;
  nameEn: string;
  flag: string;
  isActive: boolean;
}

export interface FirestoreCategory {
  id: string;
  nameAr: string;
  nameEn: string;
  icon: string;
  sortOrder: number;
  isActive: boolean;
}

export interface FirestoreStore {
  id: string;
  nameAr: string;
  nameEn: string;
  logoUrl: string;
  bannerUrl?: string;
  websiteUrl: string;
  countryId: string;
  isActive: boolean;
}

// Coupon Variant for different user types (new user, old user, etc.)
export interface CouponVariant {
  id: string;
  labelAr: string;
  labelEn?: string;
  code: string;
  discountLabel: string;
  descriptionAr?: string;
  descriptionEn?: string;
  linkUrl?: string;
  offerButtonLabel?: string;
  isDefault?: boolean;
}

export interface FirestoreCoupon {
  id: string;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  ticketDescriptionAr?: string;
  code: string;
  discountLabel: string;
  storeId: string;
  categoryId: string;
  countryId: string;
  linkUrl: string;
  expiryDate: any; // Firestore Timestamp
  terms: string[];
  isPopular: boolean;
  isActive: boolean;
  usageCount: number;
  createdAt: any; // Firestore Timestamp
  updatedAt: any; // Firestore Timestamp
  variants?: CouponVariant[]; // Multiple code variants for different user types
}

// Lead type for onboarding data collection
export interface FirestoreLead {
  id: string;
  name: string;
  phone: string; // E.164 format (e.g., "+966501234567", "+201012345678")
  countryCode: string; // e.g., "+966", "+971"
  country: string; // ISO-2 code (e.g., "SA", "AE")
  deviceId: string;
  createdAt: any; // Firestore Timestamp
}

// Phone country for the picker
export interface PhoneCountry {
  code: string; // ISO code like "SA"
  name: string;
  nameAr: string;
  dialCode: string; // e.g., "+966"
  flag: string;
  placeholder: string; // e.g., "5XXXXXXXX"
}

// Store Request
export interface FirestoreStoreRequest {
  id: string;
  storeName: string;
  storeUrl?: string;
  notes?: string;
  countryId: string;
  deviceId: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: any; // Firestore Timestamp
  reviewedAt?: any; // Firestore Timestamp
  reviewedBy?: string;
  adminReply?: string;
  storeId?: string; // Created store ID if approved
}

// User Notification
export interface FirestoreNotification {
  id: string;
  deviceId: string;
  title: string;
  message: string;
  type: 'store_request_approved' | 'store_request_rejected' | 'general';
  relatedId?: string; // Store request ID, coupon ID, etc.
  isRead: boolean;
  createdAt: any; // Firestore Timestamp
}
