import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { hasSubmittedLead } from "@/hooks/useLeads";
import { isAdminEnabled } from "@/config/env";

interface OnboardingGuardProps {
  children: React.ReactNode;
}

/**
 * OnboardingGuard - Controls access based on lead submission status
 *
 * Rules:
 * - /login, /onboarding are ALWAYS accessible (regardless of auth/onboarding status)
 * - /admin/* routes are accessible when VITE_ENABLE_ADMIN=true (handled by route config)
 * - All other routes require lead submission (onboarding completion)
 *
 * Sanity Test Checklist:
 * ✅ Unauthenticated user can open /login (if route exists)
 * ✅ Unauthenticated user can open /onboarding
 * ✅ Authenticated user (lead submitted) can open home (/)
 * ✅ Mobile build (VITE_ENABLE_ADMIN=false) cannot access /admin/*
 * ✅ Web build (VITE_ENABLE_ADMIN=true) can access /admin/login
 * ✅ User without lead submission is redirected to /onboarding (except excluded routes)
 */
export function OnboardingGuard({ children }: OnboardingGuardProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Routes that should ALWAYS be accessible (no onboarding check)
    // These routes are excluded from onboarding redirect logic
    const alwaysExcludedRoutes = ["/onboarding", "/login"];

    // Admin routes are excluded when admin is enabled
    // Note: Admin route protection is handled by AdminProtectedRoute component
    const adminExcludedRoutes = isAdminEnabled() ? ["/admin"] : [];

    // Combine all excluded routes
    const excludedRoutes = [...alwaysExcludedRoutes, ...adminExcludedRoutes];

    // Check if current path should skip onboarding check
    const isExcluded = excludedRoutes.some((route) =>
      location.pathname.startsWith(route)
    );

    // Log for debugging (only in development)
    if (import.meta.env.DEV) {
      console.log("[OnboardingGuard]", {
        pathname: location.pathname,
        adminEnabled: isAdminEnabled(),
        excludedRoutes,
        isExcluded,
        hasSubmittedLead: hasSubmittedLead(),
      });
    }

    // Always allow excluded routes (login, onboarding, admin when enabled)
    if (isExcluded) {
      setIsChecking(false);
      return;
    }

    // For non-excluded routes, check if user has submitted lead
    // If not, redirect to onboarding (NEVER redirect to /admin routes)
    if (!hasSubmittedLead()) {
      navigate("/onboarding", { replace: true });
    } else {
      setIsChecking(false);
    }
  }, [location.pathname, navigate]);

  // Show nothing while checking (prevents flash)
  if (isChecking) {
    return null;
  }

  return <>{children}</>;
}
