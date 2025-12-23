import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/firebase';

/**
 * SECURITY: Admin Authorization
 * 
 * This context uses Firebase Auth with custom claims for admin verification.
 * 
 * RECOMMENDED APPROACH:
 * Set custom claims via Firebase Admin SDK (server-side):
 *   admin.auth().setCustomUserClaims(uid, { admin: true })
 * 
 * FALLBACK APPROACH:
 * Check Firestore /admins/{uid} document for allowlist
 * 
 * Client-side checks are for UI only - REAL SECURITY is in Firestore rules!
 */

// FALLBACK: Admin UID allowlist (use if custom claims not set up yet)
// Replace with actual admin UIDs
const ADMIN_UID_ALLOWLIST: string[] = [
  // 'REPLACE_WITH_ACTUAL_ADMIN_UID',
];

interface AdminAuthContextType {
  user: User | null;
  isAdmin: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

// Check if user is admin via multiple methods
async function checkIsAdmin(user: User): Promise<boolean> {
  try {
    // Method 1: Check custom claims (PREFERRED)
    const tokenResult = await user.getIdTokenResult();
    if (tokenResult.claims.admin === true) {
      console.log('[Admin Auth] ✅ Admin verified via custom claim');
      return true;
    }

    // Method 2: Check UID allowlist (FALLBACK)
    if (ADMIN_UID_ALLOWLIST.includes(user.uid)) {
      console.log('[Admin Auth] ✅ Admin verified via UID allowlist');
      return true;
    }

    // Method 3: Check Firestore /admins/{uid} document (FALLBACK)
    const adminDoc = await getDoc(doc(db, 'admins', user.uid));
    if (adminDoc.exists()) {
      console.log('[Admin Auth] ✅ Admin verified via Firestore allowlist');
      return true;
    }

    console.log('[Admin Auth] ❌ User is not an admin');
    return false;
  } catch (error) {
    console.error('[Admin Auth] Error checking admin status:', error);
    return false;
  }
}

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Check if user is admin
        const adminStatus = await checkIsAdmin(firebaseUser);
        
        if (adminStatus) {
          setUser(firebaseUser);
          setIsAdmin(true);
          setError(null);
        } else {
          // Not an admin, sign out
          await signOut(auth);
          setUser(null);
          setIsAdmin(false);
          setError('غير مصرح لك بالدخول');
        }
      } else {
        setUser(null);
        setIsAdmin(false);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setError(null);
    setIsLoading(true);
    
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      
      // Check if user is admin
      const adminStatus = await checkIsAdmin(result.user);
      
      if (!adminStatus) {
        await signOut(auth);
        setError('غير مصرح لك بالدخول');
        setIsLoading(false);
        return false;
      }

      setUser(result.user);
      setIsAdmin(true);
      setIsLoading(false);
      return true;
    } catch (err: any) {
      let errorMessage = 'حدث خطأ أثناء تسجيل الدخول';
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        errorMessage = 'البريد الإلكتروني أو كلمة المرور غير صحيحة';
      } else if (err.code === 'auth/too-many-requests') {
        errorMessage = 'تم تجاوز عدد المحاولات، حاول لاحقاً';
      }
      setError(errorMessage);
      setIsLoading(false);
      return false;
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setIsAdmin(false);
  };

  return (
    <AdminAuthContext.Provider value={{ user, isAdmin, isLoading, error, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within AdminAuthProvider');
  }
  return context;
}
