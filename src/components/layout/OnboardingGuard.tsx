import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { hasSubmittedLead } from '@/hooks/useLeads';
import { isAdminEnabled } from '@/config/env';

interface OnboardingGuardProps {
  children: React.ReactNode;
}

// Routes that should skip the onboarding check
// Admin routes are only excluded when admin is enabled
const EXCLUDED_ROUTES = isAdminEnabled() 
  ? ['/onboarding', '/admin'] 
  : ['/onboarding'];

export function OnboardingGuard({ children }: OnboardingGuardProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Skip check for excluded routes
    const isExcluded = EXCLUDED_ROUTES.some(route => 
      location.pathname.startsWith(route)
    );

    if (isExcluded) {
      setIsChecking(false);
      return;
    }

    // Check if user has submitted lead
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
