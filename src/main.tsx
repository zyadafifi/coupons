import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

/**
 * HashRouter Redirect Fix
 * 
 * HashRouter only works with /#/... URLs. When users visit /login directly
 * (without hash), HashRouter treats it as "/" and OnboardingGuard redirects.
 * 
 * This fix redirects hash-less URLs to their hash equivalents BEFORE React renders.
 * 
 * Routes that need hash:
 * - /login, /onboarding (always)
 * - /admin, /admin/* (when admin is enabled)
 */
function redirectHashlessRoutes() {
  // Only redirect if hash is empty (user came from direct URL)
  if (window.location.hash) {
    return; // Already has hash, let HashRouter handle it
  }

  const pathname = window.location.pathname;
  const search = window.location.search;

  // Routes that always need hash redirect
  // Note: /login redirects to /onboarding, but we still handle hash redirect for it
  const alwaysHashRoutes = ["/login", "/onboarding"];

  // Admin routes that need hash redirect (only when admin is enabled)
  // Check via environment variable (available at build time)
  const adminEnabled = import.meta.env.VITE_ENABLE_ADMIN === "true";
  const adminHashRoutes = adminEnabled
    ? [
        "/admin",
        "/admin/login",
        "/admin/countries",
        "/admin/categories",
        "/admin/stores",
        "/admin/coupons",
        "/admin/leads",
        "/admin/settings",
      ]
    : [];

  // Check if pathname matches any route that needs hash
  const needsHash =
    alwaysHashRoutes.includes(pathname) ||
    adminHashRoutes.includes(pathname) ||
    (adminEnabled && pathname.startsWith("/admin/"));

  if (needsHash) {
    // Redirect to hash URL: /login -> /#/login
    const hashPath = `/#${pathname}${search}`;
    window.location.replace(hashPath);
  }
}

// Run redirect BEFORE React renders
redirectHashlessRoutes();

createRoot(document.getElementById("root")!).render(<App />);
