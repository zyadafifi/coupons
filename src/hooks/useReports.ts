import { useState, useEffect } from 'react';
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/firebase';
import { FirestoreReport } from '@/data/types';

// Hook for reports collection (admin)
export function useReports() {
  const [reports, setReports] = useState<FirestoreReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const q = query(
      collection(db, 'reports'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as FirestoreReport[];
        setReports(items);
        setLoading(false);
      },
      (err) => {
        console.error('Reports fetch error:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { reports, loading, error };
}

// Add a new report
export async function addReportIssue(
  couponId: string,
  code: string,
  variantId?: string
): Promise<string> {
  const docRef = await addDoc(collection(db, 'reports'), {
    couponId,
    code,
    variantId: variantId || null,
    createdAt: Timestamp.now(),
    isResolved: false,
  });
  return docRef.id;
}

// Format timestamp for display
export function formatReportDate(timestamp: any): string {
  if (!timestamp) return '-';
  
  try {
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return new Intl.DateTimeFormat('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return '-';
  }
}
