import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { App as CapApp } from "@capacitor/app";
import { Capacitor } from "@capacitor/core";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

/**
 * AndroidBackButtonHandler
 *
 * Handles Android back button behavior:
 * - If not on home route ("/"), navigates to home
 * - If on home route, shows exit confirmation dialog
 * - Only runs on native Android platform
 */
export function AndroidBackButtonHandler() {
  const location = useLocation();
  const navigate = useNavigate();
  const [showExitDialog, setShowExitDialog] = useState(false);

  useEffect(() => {
    // Only run on native platforms (Android/iOS), not on web
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    let removeListener: (() => void) | undefined;

    const setupBackButtonListener = async () => {
      const listener = await CapApp.addListener("backButton", () => {
        // If exit dialog is open, close it instead of exiting
        if (showExitDialog) {
          setShowExitDialog(false);
          return;
        }

        // Define home routes (main home and onboarding)
        const isOnHomeRoute =
          location.pathname === "/" || location.pathname === "";
        const isOnOnboarding = location.pathname === "/onboarding";

        // If on home route (but not onboarding), show exit confirmation
        if (isOnHomeRoute && !isOnOnboarding) {
          setShowExitDialog(true);
          return;
        }

        // If on any other route (including onboarding), navigate to home
        navigate("/", { replace: true });
      });

      removeListener = listener.remove;
    };

    setupBackButtonListener();

    // Cleanup listener on unmount
    return () => {
      if (removeListener) {
        removeListener();
      }
    };
  }, [location.pathname, navigate, showExitDialog]);

  const handleExitApp = async () => {
    setShowExitDialog(false);
    await CapApp.exitApp();
  };

  const handleCancelExit = () => {
    setShowExitDialog(false);
  };

  // Only render dialog content on native platforms
  if (!Capacitor.isNativePlatform()) {
    return null;
  }

  return (
    <AlertDialog open={showExitDialog} onOpenChange={setShowExitDialog}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>هل تريد الخروج من التطبيق؟</AlertDialogTitle>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-row gap-2">
          <AlertDialogAction onClick={handleExitApp} className="flex-1">
            نعم
          </AlertDialogAction>
          <AlertDialogCancel onClick={handleCancelExit} className="flex-1">
            لا
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
