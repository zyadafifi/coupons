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
import { FirestoreLead } from '@/data/types';

// Get app version from package.json or env
function getAppVersion(): string {
  // Try to get from env first (can be set at build time)
  if (import.meta.env.VITE_APP_VERSION) {
    return import.meta.env.VITE_APP_VERSION;
  }
  // Fallback to package.json version (requires import, but we'll use a constant)
  // For now, use a default version - can be updated via build script
  return '1.0.0';
}

// Lead submission data schema
interface LeadSubmissionData {
  submitted: boolean;
  leadId: string;
  submittedAt: number;
  appVersion: string;
}

// Generate or get device ID
export function getDeviceId(): string {
  const key = 'app_device_id';
  let deviceId = localStorage.getItem(key);
  
  if (!deviceId) {
    deviceId = 'device_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
    localStorage.setItem(key, deviceId);
  }
  
  return deviceId;
}

// Clear device ID (for reset)
export function clearDeviceId(): void {
  localStorage.removeItem('app_device_id');
}

// Check if user has already submitted a lead (validates object structure)
export function hasSubmittedLead(): boolean {
  try {
    const stored = localStorage.getItem('lead_submitted');
    if (!stored) return false;
    
    // Handle legacy string format for backward compatibility
    if (stored === 'true') {
      return true;
    }
    
    // Parse and validate object structure
    const data: LeadSubmissionData = JSON.parse(stored);
    return data.submitted === true && !!data.leadId && !!data.submittedAt;
  } catch {
    return false;
  }
}

// Mark lead as submitted with versioned data
export function markLeadSubmitted(leadId?: string): void {
  const data: LeadSubmissionData = {
    submitted: true,
    leadId: leadId || 'unknown',
    submittedAt: Date.now(),
    appVersion: getAppVersion(),
  };
  localStorage.setItem('lead_submitted', JSON.stringify(data));
}

// Clear lead submission (for reset/testing)
export function clearLeadSubmission(): void {
  localStorage.removeItem('lead_submitted');
}

// Reset onboarding data (clears lead and device ID)
export function resetOnboarding(): void {
  clearLeadSubmission();
  clearDeviceId();
}

// Hook for leads collection (admin)
export function useLeads() {
  const [leads, setLeads] = useState<FirestoreLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const q = query(
      collection(db, 'leads'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as FirestoreLead[];
        setLeads(items);
        setLoading(false);
      },
      (err) => {
        console.error('Leads fetch error:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { leads, loading, error };
}

// Add a new lead
export async function addLead(data: Omit<FirestoreLead, 'id' | 'createdAt'>): Promise<string> {
  const docRef = await addDoc(collection(db, 'leads'), {
    ...data,
    createdAt: Timestamp.now(),
  });
  markLeadSubmitted();
  return docRef.id;
}

// Format timestamp for display
export function formatLeadDate(timestamp: any): string {
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
