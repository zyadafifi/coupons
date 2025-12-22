import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/firebase';

const ADMIN_EMAIL = 'amr@leadintop.com';

interface AdminAuthContextType {
  user: User | null;
  isAdmin: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isAdmin = user?.email === ADMIN_EMAIL;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        if (firebaseUser.email === ADMIN_EMAIL) {
          setUser(firebaseUser);
          setError(null);
        } else {
          // Not the admin email, sign out
          await signOut(auth);
          setUser(null);
          setError('غير مصرح لك بالدخول');
        }
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setError(null);
    setIsLoading(true);
    
    try {
      if (email !== ADMIN_EMAIL) {
        setError('غير مصرح لك بالدخول');
        setIsLoading(false);
        return false;
      }

      const result = await signInWithEmailAndPassword(auth, email, password);
      
      if (result.user.email !== ADMIN_EMAIL) {
        await signOut(auth);
        setError('غير مصرح لك بالدخول');
        setIsLoading(false);
        return false;
      }

      setUser(result.user);
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
