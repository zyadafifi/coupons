import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { hasSubmittedLead } from "@/hooks/useLeads";
import { isAdminEnabled } from "@/config/env";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);

    // Safe default redirect: If user is not onboarded and hits unknown route,
    // redirect to onboarding (but NOT if on /login or /admin when enabled)
    const isLoginRoute = location.pathname.startsWith("/login");
    const isAdminRoute = location.pathname.startsWith("/admin");
    const shouldRedirectToOnboarding =
      !hasSubmittedLead() &&
      !isLoginRoute &&
      !(isAdminRoute && isAdminEnabled());

    if (shouldRedirectToOnboarding) {
      navigate("/onboarding", { replace: true });
    }
  }, [location.pathname, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">404</h1>
        <p className="mb-4 text-xl text-muted-foreground">Oops! Page not found</p>
        <a href="/" className="text-primary underline hover:text-primary/90">
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;
