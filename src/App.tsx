import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppProvider } from "@/contexts/AppContext";
import { OnboardingGuard } from "@/components/layout/OnboardingGuard";
import { AppLayout } from "@/components/layout/AppLayout";
import { useStatusBar } from "@/hooks/useStatusBar";
import { useSplashScreen } from "@/hooks/useSplashScreen";
import { isAdminEnabled } from "@/config/env";
import Home from "./pages/Home";
import CouponDetail from "./pages/CouponDetail";
import Favorites from "./pages/Favorites";
import More from "./pages/More";
import NotFound from "./pages/NotFound";
import Onboarding from "./pages/Onboarding";
import { AndroidBackButtonHandler } from "./components/mobile/AndroidBackButtonHandler";
import { AnimatedSplash } from "./components/mobile/AnimatedSplash";

// Conditionally import admin components only if admin is enabled
import { AdminAuthProvider } from "@/contexts/AdminAuthContext";
import { AdminProtectedRoute } from "@/components/admin/AdminProtectedRoute";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminCountries from "./pages/admin/AdminCountries";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminStores from "./pages/admin/AdminStores";
import AdminStoreRequests from "./pages/admin/AdminStoreRequests";
import AdminCoupons from "./pages/admin/AdminCoupons";
import AdminLeads from "./pages/admin/AdminLeads";
import AdminSettings from "./pages/admin/AdminSettings";

// Component to redirect admin routes to home when admin is disabled
const AdminRedirect = () => <Navigate to="/" replace />;

const queryClient = new QueryClient();

const App = () => {
  // Initialize mobile-specific features
  useStatusBar();
  useSplashScreen();

  return (
    <QueryClientProvider client={queryClient}>
      <AdminAuthProvider>
        <AppProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <AnimatedSplash />
            <HashRouter>
              <AndroidBackButtonHandler />
              <OnboardingGuard>
                <Routes>
                  {/* Admin Routes - Only available when VITE_ENABLE_ADMIN=true */}
                  {isAdminEnabled() ? (
                    <>
                      <Route path="/admin/login" element={<AdminLogin />} />
                      <Route
                        path="/admin"
                        element={
                          <AdminProtectedRoute>
                            <AdminDashboard />
                          </AdminProtectedRoute>
                        }
                      />
                      <Route
                        path="/admin/countries"
                        element={
                          <AdminProtectedRoute>
                            <AdminCountries />
                          </AdminProtectedRoute>
                        }
                      />
                      <Route
                        path="/admin/categories"
                        element={
                          <AdminProtectedRoute>
                            <AdminCategories />
                          </AdminProtectedRoute>
                        }
                      />
                      <Route
                        path="/admin/stores"
                        element={
                          <AdminProtectedRoute>
                            <AdminStores />
                          </AdminProtectedRoute>
                        }
                      />
                      <Route
                        path="/admin/store-requests"
                        element={
                          <AdminProtectedRoute>
                            <AdminStoreRequests />
                          </AdminProtectedRoute>
                        }
                      />
                      <Route
                        path="/admin/coupons"
                        element={
                          <AdminProtectedRoute>
                            <AdminCoupons />
                          </AdminProtectedRoute>
                        }
                      />
                      <Route
                        path="/admin/leads"
                        element={
                          <AdminProtectedRoute>
                            <AdminLeads />
                          </AdminProtectedRoute>
                        }
                      />
                      <Route
                        path="/admin/settings"
                        element={
                          <AdminProtectedRoute>
                            <AdminSettings />
                          </AdminProtectedRoute>
                        }
                      />
                    </>
                  ) : (
                    <>
                      {/* Redirect all admin routes to home when admin is disabled */}
                      <Route path="/admin/*" element={<AdminRedirect />} />
                    </>
                  )}

                  {/* Auth Routes - Always accessible */}
                  {/* /login redirects to /onboarding (phone-based user entry) */}
                  <Route path="/login" element={<Navigate to="/onboarding" replace />} />
                  <Route path="/onboarding" element={<Onboarding />} />

                  {/* User Routes */}
                  <Route
                    path="/"
                    element={
                      <AppLayout>
                        <Home />
                      </AppLayout>
                    }
                  />
                  <Route
                    path="/coupon/:id"
                    element={
                      <AppLayout>
                        <CouponDetail />
                      </AppLayout>
                    }
                  />
                  <Route
                    path="/favorites"
                    element={
                      <AppLayout>
                        <Favorites />
                      </AppLayout>
                    }
                  />
                  <Route
                    path="/more"
                    element={
                      <AppLayout>
                        <More />
                      </AppLayout>
                    }
                  />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </OnboardingGuard>
            </HashRouter>
          </TooltipProvider>
        </AppProvider>
      </AdminAuthProvider>
    </QueryClientProvider>
  );
};

export default App;
