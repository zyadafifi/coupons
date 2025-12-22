import { useApp } from '@/contexts/AppContext';
import { usePushNotifications } from '@/hooks/usePushNotifications';

export function PushNotificationHandler() {
  const { selectedCountry } = useApp();
  
  // Initialize push notifications with the selected country
  usePushNotifications(selectedCountry);
  
  // This component doesn't render anything
  return null;
}
