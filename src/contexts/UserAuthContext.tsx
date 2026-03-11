import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
  ReactNode,
} from "react";
import {
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithPhoneNumber,
  RecaptchaVerifier,
  ConfirmationResult,
} from "firebase/auth";
import { auth } from "@/firebase";

export interface UserAuthContextType {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
  signUpWithEmail: (email: string, password: string) => Promise<boolean>;
  signInWithEmail: (email: string, password: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  signInWithPhone: (phoneNumber: string) => Promise<boolean>;
  confirmPhoneCode: (code: string) => Promise<boolean>;
  sendPasswordReset: (email: string) => Promise<boolean>;
  recaptchaContainerId: string;
}

const UserAuthContext = createContext<UserAuthContextType | undefined>(undefined);

const RECAPTCHA_CONTAINER_ID = "recaptcha-container";

export function UserAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const confirmationResultRef = useRef<ConfirmationResult | null>(null);
  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);

  const clearError = useCallback(() => setError(null), []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signUpWithEmail = async (
    email: string,
    password: string
  ): Promise<boolean> => {
    setError(null);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      return true;
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code;
      if (code === "auth/email-already-in-use") {
        setError("البريد الإلكتروني مستخدم بالفعل");
      } else if (code === "auth/weak-password") {
        setError("كلمة المرور ضعيفة (6 أحرف على الأقل)");
      } else if (code === "auth/invalid-email") {
        setError("البريد الإلكتروني غير صحيح");
      } else {
        setError("حدث خطأ أثناء إنشاء الحساب");
      }
      return false;
    }
  };

  const signInWithEmail = async (
    email: string,
    password: string
  ): Promise<boolean> => {
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return true;
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code;
      if (
        code === "auth/user-not-found" ||
        code === "auth/wrong-password" ||
        code === "auth/invalid-credential"
      ) {
        setError("البريد الإلكتروني أو كلمة المرور غير صحيحة");
      } else if (code === "auth/too-many-requests") {
        setError("تم تجاوز عدد المحاولات، حاول لاحقاً");
      } else {
        setError("حدث خطأ أثناء تسجيل الدخول");
      }
      return false;
    }
  };

  const signOutUser = async () => {
    setError(null);
    confirmationResultRef.current = null;
    if (recaptchaVerifierRef.current) {
      try {
        recaptchaVerifierRef.current.clear?.();
      } catch {
        // ignore
      }
      recaptchaVerifierRef.current = null;
    }
    await signOut(auth);
  };

  const getOrCreateRecaptchaVerifier = (): RecaptchaVerifier => {
    if (recaptchaVerifierRef.current) {
      return recaptchaVerifierRef.current;
    }
    const container = document.getElementById(RECAPTCHA_CONTAINER_ID);
    if (!container) {
      throw new Error("Recaptcha container not found");
    }
    const verifier = new RecaptchaVerifier(auth, RECAPTCHA_CONTAINER_ID, {
      size: "invisible",
      callback: () => {},
      "expired-callback": () => {},
    });
    recaptchaVerifierRef.current = verifier;
    return verifier;
  };

  const signInWithPhone = async (phoneNumber: string): Promise<boolean> => {
    setError(null);
    try {
      const verifier = getOrCreateRecaptchaVerifier();
      const result = await signInWithPhoneNumber(auth, phoneNumber, verifier);
      confirmationResultRef.current = result;
      return true;
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code;
      if (code === "auth/invalid-phone-number") {
        setError("رقم الهاتف غير صحيح");
      } else if (code === "auth/too-many-requests") {
        setError("تم تجاوز عدد المحاولات، حاول لاحقاً");
      } else if (code === "auth/captcha-check-failed") {
        setError("فشل التحقق، حاول مرة أخرى");
      } else {
        setError("حدث خطأ أثناء إرسال الرمز");
      }
      return false;
    }
  };

  const confirmPhoneCode = async (code: string): Promise<boolean> => {
    const result = confirmationResultRef.current;
    if (!result) {
      setError("لم يتم إرسال رمز التحقق بعد");
      return false;
    }
    setError(null);
    try {
      await result.confirm(code);
      confirmationResultRef.current = null;
      if (recaptchaVerifierRef.current) {
        try {
          recaptchaVerifierRef.current.clear?.();
        } catch {
          // ignore
        }
        recaptchaVerifierRef.current = null;
      }
      return true;
    } catch (err: unknown) {
      const codeErr = (err as { code?: string })?.code;
      if (codeErr === "auth/invalid-verification-code") {
        setError("رمز التحقق غير صحيح");
      } else {
        setError("فشل التحقق من الرمز");
      }
      return false;
    }
  };

  const sendPasswordReset = async (email: string): Promise<boolean> => {
    setError(null);
    try {
      await sendPasswordResetEmail(auth, email);
      return true;
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code;
      if (code === "auth/user-not-found") {
        setError("لا يوجد حساب بهذا البريد");
      } else {
        setError("حدث خطأ أثناء إرسال رابط إعادة التعيين");
      }
      return false;
    }
  };

  return (
    <UserAuthContext.Provider
      value={{
        user,
        isLoading,
        error,
        clearError,
        signUpWithEmail,
        signInWithEmail,
        signOut: signOutUser,
        signInWithPhone,
        confirmPhoneCode,
        sendPasswordReset,
        recaptchaContainerId: RECAPTCHA_CONTAINER_ID,
      }}
    >
      {children}
    </UserAuthContext.Provider>
  );
}

export function useUserAuth() {
  const context = useContext(UserAuthContext);
  if (!context) {
    throw new Error("useUserAuth must be used within UserAuthProvider");
  }
  return context;
}
