import { useEffect, useRef, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';
import { PushNotifications, Token, PushNotificationSchema, ActionPerformed } from '@capacitor/push-notifications';
import { useNavigate } from 'react-router-dom';
import { useToast } from './use-toast';

export function usePushNotifications(selectedCountry: string | null) {
  const previousCountryRef = useRef<string | null>(null);
  const isInitializedRef = useRef(false);
  const fcmTokenRef = useRef<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Subscribe to a topic using FCM token
  const subscribeToTopic = useCallback(async (topic: string) => {
    if (!Capacitor.isNativePlatform()) {
      console.log('[Push] Web platform - topic subscription not available');
      return;
    }
    
    try {
      console.log('[Push] Subscribing to topic:', topic);
      
      // Store subscription locally for tracking
      localStorage.setItem(`push_topic_${topic}`, 'subscribed');
      
      // For native platforms, topic subscription is handled via Firebase SDK
      // The actual subscription happens in the native layer when FCM token is registered
      // You can send the token to your backend to manage subscriptions via Firebase Admin SDK
      
      if (fcmTokenRef.current) {
        console.log('[Push] FCM Token available for topic subscription:', fcmTokenRef.current);
        // TODO: Send to backend API to subscribe token to topic
        // await fetch('/api/subscribe-to-topic', {
        //   method: 'POST',
        //   body: JSON.stringify({ token: fcmTokenRef.current, topic })
        // });
      }
    } catch (error) {
      console.error('[Push] Error subscribing to topic:', error);
    }
  }, []);

  // Unsubscribe from a topic
  const unsubscribeFromTopic = useCallback(async (topic: string) => {
    if (!Capacitor.isNativePlatform()) return;
    
    try {
      console.log('[Push] Unsubscribing from topic:', topic);
      localStorage.removeItem(`push_topic_${topic}`);
      
      if (fcmTokenRef.current) {
        console.log('[Push] Unsubscribing token from topic:', topic);
        // TODO: Send to backend API to unsubscribe token from topic
        // await fetch('/api/unsubscribe-from-topic', {
        //   method: 'POST',
        //   body: JSON.stringify({ token: fcmTokenRef.current, topic })
        // });
      }
    } catch (error) {
      console.error('[Push] Error unsubscribing from topic:', error);
    }
  }, []);

  // Initialize push notifications
  const initializePushNotifications = useCallback(async () => {
    if (!Capacitor.isNativePlatform()) {
      console.log('[Push] Not a native platform, skipping initialization');
      return;
    }

    if (isInitializedRef.current) {
      console.log('[Push] Already initialized');
      return;
    }

    try {
      // Request permission
      const permResult = await PushNotifications.requestPermissions();
      console.log('[Push] Permission result:', permResult);

      if (permResult.receive !== 'granted') {
        console.log('[Push] Permission not granted');
        return;
      }

      // Register for push notifications
      await PushNotifications.register();
      console.log('[Push] Registered for push notifications');

      // Listen for registration success
      PushNotifications.addListener('registration', async (token: Token) => {
        console.log('[Push] FCM Token received:', token.value);
        fcmTokenRef.current = token.value;
        
        // Store token for later use
        localStorage.setItem('fcm_token', token.value);
        
        // Subscribe to "all" topic for general notifications
        await subscribeToTopic('all');
        
        // Subscribe to country-specific topic if selected
        if (selectedCountry) {
          await subscribeToTopic(`country_${selectedCountry}`);
          previousCountryRef.current = selectedCountry;
        }
        
        // Show success toast
        console.log('[Push] Push notifications enabled successfully');
      });

      // Listen for registration errors
      PushNotifications.addListener('registrationError', (error) => {
        console.error('[Push] Registration error:', error);
      });

      // Listen for push notifications received (when app is in foreground)
      PushNotifications.addListener('pushNotificationReceived', (notification: PushNotificationSchema) => {
        console.log('[Push] Notification received (foreground):', notification);
        
        // Show in-app notification toast
        if (notification.title && notification.body) {
          toast({
            title: notification.title,
            description: notification.body,
          });
        }
      });

      // Listen for notification action (when user taps notification)
      PushNotifications.addListener('pushNotificationActionPerformed', (notification: ActionPerformed) => {
        console.log('[Push] Notification tapped:', notification);
        
        const data = notification.notification.data;
        
        // Handle deep linking based on notification data
        if (data?.couponId) {
          // Navigate to coupon detail
          navigate(`/coupon/${data.couponId}`);
        } else if (data?.route) {
          // Navigate to specific route
          navigate(data.route);
        } else {
          // Default: navigate to home
          navigate('/');
        }
      });

      isInitializedRef.current = true;
    } catch (error) {
      console.error('[Push] Initialization error:', error);
    }
  }, [selectedCountry, subscribeToTopic, navigate]);

  // Handle country change
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;
    if (!isInitializedRef.current) return;

    const handleCountryChange = async () => {
      const prevCountry = previousCountryRef.current;
      
      if (prevCountry && prevCountry !== selectedCountry) {
        // Unsubscribe from old country topic
        await unsubscribeFromTopic(`country_${prevCountry}`);
      }
      
      if (selectedCountry && selectedCountry !== prevCountry) {
        // Subscribe to new country topic
        await subscribeToTopic(`country_${selectedCountry}`);
      }
      
      previousCountryRef.current = selectedCountry;
    };

    handleCountryChange();
  }, [selectedCountry, subscribeToTopic, unsubscribeFromTopic]);

  // Initialize on mount
  useEffect(() => {
    initializePushNotifications();
  }, [initializePushNotifications]);

  return {
    initializePushNotifications,
    subscribeToTopic,
    unsubscribeFromTopic,
  };
}
