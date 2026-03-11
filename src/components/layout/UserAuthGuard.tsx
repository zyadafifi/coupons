import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { hasSubmittedLead } from "@/hooks/useLeads";
import { isAdminEnabled } from "@/config/env";
import { useUserAuth } from "@/contexts/UserAuthContext";

interface UserAuthGuardProps {
  children: React.ReactNode;
}

/**
 * UserAuthGuard - Controls access based on signed-in user OR lead submission (Option B).
 *
 * Rules:
 * - /login, /signup, /onboarding, /forgot-password are ALWAYS accessible.
 * - /admin/* routes are accessible when VITE_ENABLE_ADMIN=true (admin protection is separate).
 * - All other routes require: signed-in user (UserAuthContext) OR hasSubmittedLead().
 * - If neither, redirect to /login.
 */
export function UserAuthGuard({ children }: UserAuthGuardProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isLoading } = useUserAuth();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const alwaysExcludedRoutes = [
      "/onboarding",
      "/login",
      "/signup",
      "/forgot-password",
    ];
    const adminExcludedRoutes = isAdminEnabled() ? ["/admin"] : [];
    const excludedRoutes = [...alwaysExcludedRoutes, ...adminExcludedRoutes];

    const isExcluded = excludedRoutes.some((route) =>
      location.pathname.startsWith(route)
    );

    if (import.meta.env.DEV) {
      console.log("[UserAuthGuard]", {
        pathname: location.pathname,
        hasUser: !!user,
        hasSubmittedLead: hasSubmittedLead(),
        isExcluded,
      });
    }

    if (isExcluded) {
      setIsChecking(false);
      return;
    }

    if (isLoading) {
      return;
    }

    const hasAccess = user !== null || hasSubmittedLead();
    if (!hasAccess) {
      navigate("/login", { replace: true });
      return;
    }
    setIsChecking(false);
  }, [location.pathname, navigate, user, isLoading]);

  if (isChecking || isLoading) {
    return null;
  }

  const alwaysExcluded = [
    "/onboarding",
    "/login",
    "/signup",
    "/forgot-password",
  ].some((r) => location.pathname.startsWith(r));
  const adminExcluded =
    isAdminEnabled() && location.pathname.startsWith("/admin");
  const allowedWithoutAccess = alwaysExcluded || adminExcluded;
  const hasAccess = user !== null || hasSubmittedLead();

  if (!allowedWithoutAccess && !hasAccess) {
    return null;
  }

  return <>{children}</>;
}
