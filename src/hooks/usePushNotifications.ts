import { useEffect, useState, useCallback } from 'react';

const vapidPublicKey = "BIjOSlLO8RFeIkCoB_UPvDhBWJYdBvTHHBzBxALCb_NWZOPULCOnb3d3TIE9YbB6K5xjMQC63TCkDWZ_YSo-TiY";

export function usePushNotifications(userId: string | undefined) {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);

  const subscribe = useCallback(async () => {
    if (!('PushManager' in window)) {
      console.log('Push notifications not supported');
      return;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      
      // Check if already subscribed
      const existingSubscription = await registration.pushManager.getSubscription();
      if (existingSubscription) {
        setSubscription(existingSubscription);
        setIsSubscribed(true);
        return;
      }

      // Subscribe to push
      const newSubscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey) as any
      });

      setSubscription(newSubscription);
      setIsSubscribed(true);

      // Send subscription to server
      if (userId) {
        await fetch('/api/push/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            subscription: newSubscription
          })
        });
      }
    } catch (error) {
      console.error('Failed to subscribe to push:', error);
    }
  }, [userId]);

  const unsubscribe = useCallback(async () => {
    if (!subscription) return;

    try {
      await subscription.unsubscribe();
      
      // Notify server
      if (userId) {
        await fetch('/api/push/unsubscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            subscription
          })
        });
      }

      setSubscription(null);
      setIsSubscribed(false);
    } catch (error) {
      console.error('Failed to unsubscribe:', error);
    }
  }, [subscription, userId]);

  // Auto-subscribe when user logs in
  useEffect(() => {
    if (userId && 'PushManager' in window) {
      subscribe();
    }
  }, [userId, subscribe]);

  return { isSubscribed, subscribe, unsubscribe };
}

// Helper function to convert VAPID key
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
