import { useState, useEffect } from 'react';
import {
  collection,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
  QueryConstraint,
} from 'firebase/firestore';
import { db } from '@/firebase';
import {
  FirestoreCountry,
  FirestoreCategory,
  FirestoreStore,
  FirestoreCoupon,
  FirestoreStoreRequest,
  FirestoreNotification,
} from '@/data/types';

// Generic hook for Firestore collection
export function useCollection<T>(
  collectionName: string,
  constraints: QueryConstraint[] = []
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, collectionName), ...constraints);
    
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as T[];
        setData(items);
        setLoading(false);
      },
      (err) => {
        console.error('Firestore error:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [collectionName, JSON.stringify(constraints)]);

  return { data, loading, error };
}

// Countries
export function useCountries(activeOnly = false) {
  const constraints: QueryConstraint[] = [];
  if (activeOnly) {
    constraints.push(where('isActive', '==', true));
  }
  return useCollection<FirestoreCountry>('countries', constraints);
}

export async function addCountry(data: Omit<FirestoreCountry, 'id'>) {
  const docRef = await addDoc(collection(db, 'countries'), data);
  return docRef.id;
}

export async function updateCountry(id: string, data: Partial<FirestoreCountry>) {
  await updateDoc(doc(db, 'countries', id), data);
}

export async function deleteCountry(id: string) {
  await deleteDoc(doc(db, 'countries', id));
}

// Categories
export function useCategories(activeOnly = false) {
  const constraints: QueryConstraint[] = [orderBy('sortOrder', 'asc')];
  if (activeOnly) {
    constraints.unshift(where('isActive', '==', true));
  }
  return useCollection<FirestoreCategory>('categories', constraints);
}

export async function addCategory(data: Omit<FirestoreCategory, 'id'>) {
  const docRef = await addDoc(collection(db, 'categories'), data);
  return docRef.id;
}

export async function updateCategory(id: string, data: Partial<FirestoreCategory>) {
  await updateDoc(doc(db, 'categories', id), data);
}

export async function deleteCategory(id: string) {
  await deleteDoc(doc(db, 'categories', id));
}

// Stores
export function useStores(activeOnly = false, countryId?: string) {
  const constraints: QueryConstraint[] = [];
  if (activeOnly) {
    constraints.push(where('isActive', '==', true));
  }
  if (countryId) {
    constraints.push(where('countryId', '==', countryId));
  }
  return useCollection<FirestoreStore>('stores', constraints);
}

export async function addStore(data: Omit<FirestoreStore, 'id'>) {
  const docRef = await addDoc(collection(db, 'stores'), data);
  return docRef.id;
}

export async function updateStore(id: string, data: Partial<FirestoreStore>) {
  await updateDoc(doc(db, 'stores', id), data);
}

export async function deleteStore(id: string) {
  await deleteDoc(doc(db, 'stores', id));
}

// Coupons
export function useCoupons(filters?: {
  activeOnly?: boolean;
  countryId?: string;
  categoryId?: string;
  storeId?: string;
}) {
  const constraints: QueryConstraint[] = [];
  
  if (filters?.activeOnly) {
    constraints.push(where('isActive', '==', true));
  }
  if (filters?.countryId) {
    constraints.push(where('countryId', '==', filters.countryId));
  }
  if (filters?.categoryId) {
    constraints.push(where('categoryId', '==', filters.categoryId));
  }
  if (filters?.storeId) {
    constraints.push(where('storeId', '==', filters.storeId));
  }
  
  return useCollection<FirestoreCoupon>('coupons', constraints);
}

export async function getCouponById(id: string): Promise<FirestoreCoupon | null> {
  const docSnap = await getDoc(doc(db, 'coupons', id));
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as FirestoreCoupon;
  }
  return null;
}

export async function addCoupon(data: Omit<FirestoreCoupon, 'id'>) {
  const docRef = await addDoc(collection(db, 'coupons'), {
    ...data,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
  return docRef.id;
}

export async function updateCoupon(id: string, data: Partial<FirestoreCoupon>) {
  await updateDoc(doc(db, 'coupons', id), {
    ...data,
    updatedAt: Timestamp.now(),
  });
}

export async function deleteCoupon(id: string) {
  await deleteDoc(doc(db, 'coupons', id));
}

// Helper to convert Firestore Timestamp to string
export function timestampToString(timestamp: any): string {
  if (!timestamp) return '';
  if (timestamp.toDate) {
    return timestamp.toDate().toISOString().split('T')[0];
  }
  return timestamp;
}

// Store Requests
export function useStoreRequests(statusFilter?: 'pending' | 'approved' | 'rejected') {
  const constraints: QueryConstraint[] = [orderBy('createdAt', 'desc')];
  if (statusFilter) {
    constraints.unshift(where('status', '==', statusFilter));
  }
  return useCollection<FirestoreStoreRequest>('store_requests', constraints);
}

export async function addStoreRequest(data: Omit<FirestoreStoreRequest, 'id' | 'createdAt' | 'status'>) {
  const docRef = await addDoc(collection(db, 'store_requests'), {
    ...data,
    status: 'pending',
    createdAt: Timestamp.now(),
  });
  return docRef.id;
}

export async function updateStoreRequest(id: string, data: Partial<FirestoreStoreRequest>) {
  await updateDoc(doc(db, 'store_requests', id), data);
}

export async function approveStoreRequest(
  requestId: string,
  storeData: Omit<FirestoreStore, 'id'>,
  reviewedBy: string
): Promise<string> {
  // Create the store first
  const storeId = await addStore(storeData);
  
  // Update the request
  await updateDoc(doc(db, 'store_requests', requestId), {
    status: 'approved',
    reviewedAt: Timestamp.now(),
    reviewedBy,
    storeId,
  });
  
  return storeId;
}

export async function rejectStoreRequest(
  requestId: string,
  adminReply: string,
  reviewedBy: string
) {
  await updateDoc(doc(db, 'store_requests', requestId), {
    status: 'rejected',
    reviewedAt: Timestamp.now(),
    reviewedBy,
    adminReply,
  });
}

// Notifications
// Note: We intentionally avoid using orderBy to prevent needing a composite index
// (deviceId + createdAt). Since notification volume per device is small, we sort client-side.
export function useNotifications(deviceId: string) {
  const [data, setData] = useState<FirestoreNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Only filter by deviceId to avoid composite index requirement
    const q = query(
      collection(db, 'notifications'),
      where('deviceId', '==', deviceId)
    );
    
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as FirestoreNotification[];
        
        // Client-side sorting by createdAt DESC
        // Safely handle Firestore Timestamps and missing values
        const toMillis = (timestamp: any): number => {
          if (!timestamp) return 0;
          if (timestamp.toMillis) return timestamp.toMillis();
          if (timestamp.seconds) return timestamp.seconds * 1000;
          return 0;
        };
        
        items.sort((a, b) => toMillis(b.createdAt) - toMillis(a.createdAt));
        
        setData(items);
        setLoading(false);
      },
      (err) => {
        console.error('Firestore error:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [deviceId]);

  return { data, loading, error };
}

export async function addNotification(data: Omit<FirestoreNotification, 'id' | 'createdAt' | 'isRead'>) {
  const docRef = await addDoc(collection(db, 'notifications'), {
    ...data,
    isRead: false,
    createdAt: Timestamp.now(),
  });
  return docRef.id;
}

export async function markNotificationAsRead(id: string) {
  await updateDoc(doc(db, 'notifications', id), {
    isRead: true,
  });
}
