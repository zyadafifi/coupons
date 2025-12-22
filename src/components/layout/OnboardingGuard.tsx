import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { hasSubmittedLead } from '@/hooks/useLeads';
import { isAdminEnabled } from '@/config/env';

interface OnboardingGuardProps {
  children: React.ReactNode;
}

export function OnboardingGuard({ children }: OnboardingGuardProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Define excluded routes based on current admin status
    // This is evaluated at runtime to ensure correct behavior
    const excludedRoutes = isAdminEnabled() 
      ? ['/onboarding', '/admin'] 
      : ['/onboarding'];
    
    // Check if current path should skip onboarding check
    const isExcluded = excludedRoutes.some(route => 
      location.pathname.startsWith(route)
    );

    // Log for debugging (only in development)
    if (import.meta.env.DEV) {
      console.log('[OnboardingGuard]', {
        pathname: location.pathname,
        adminEnabled: isAdminEnabled(),
        excludedRoutes,
        isExcluded,
      });
    }

    // Always allow excluded routes (including /admin when admin is enabled)
    if (isExcluded) {
      setIsChecking(false);
      return;
    }

    // For non-excluded routes, check if user has submitted lead
    if (!hasSubmittedLead()) {
      navigate('/onboarding', { replace: true });
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
