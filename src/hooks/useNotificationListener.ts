'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';

// Function to show notifications using Service Worker or fallback to browser notifications
const showNotification = async (notification: any) => {
  try {
    // Check if service worker is available and active
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready;
      if (registration && registration.active) {
        // Use Service Worker notification
        await registration.showNotification(notification.title, {
          body: notification.body,
          icon: notification.icon || '/icons/icon-192x192.png',
          tag: notification.id || 'aasta-notification',
          requireInteraction: true,
          data: {
            url: notification.url,
            id: notification.id,
          },
        });
        console.log('📱 Service Worker notification shown');
        return;
      }
    }

    // Fallback to regular browser notification
    const browserNotification = new Notification(notification.title, {
      body: notification.body,
      icon: notification.icon || '/icons/icon-192x192.png',
      tag: notification.id || 'aasta-notification',
      requireInteraction: true,
    });

    // Handle notification click
    browserNotification.onclick = () => {
      window.focus();
      browserNotification.close();
      if (notification.url) {
        window.location.href = notification.url;
      }
    };

    // Auto-close after 10 seconds
    setTimeout(() => {
      browserNotification.close();
    }, 10000);

    console.log('🔔 Browser notification shown');
  } catch (error) {
    console.error('❌ Error showing notification:', error);
  }
};

export function useNotificationListener() {
  const { data: session } = useSession();

  useEffect(() => {
    if (!session?.user?.id) return;

    // Create EventSource for Server-Sent Events
    let eventSource: EventSource | null = null;

    const setupSSE = () => {
      try {
        // Use session ID for SSE connection
        const sessionId = sessionStorage.getItem('client-session-id');
        if (!sessionId) return;

        eventSource = new EventSource(
          `/api/notifications/stream?sessionId=${sessionId}`
        );

        eventSource.onopen = () => {
          console.log('📡 Notification SSE connection opened');
        };

        eventSource.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            console.log('📡 Received SSE message:', message);

            // Only show notifications for actual notification messages, ignore heartbeats and connection messages
            if (
              message.type === 'notification' &&
              message.title &&
              message.body
            ) {
              console.log('📢 Processing notification:', message);

              // Show browser notification if permission is granted
              if (
                'Notification' in window &&
                Notification.permission === 'granted'
              ) {
                showNotification(message);
              }
            } else if (message.type === 'heartbeat') {
              console.log('💓 Heartbeat received');
            } else if (message.type === 'connected') {
              console.log('✅ SSE connected successfully');
            } else {
              console.log('🔄 Ignoring SSE message type:', message.type);
            }
          } catch (error) {
            console.error('Error processing SSE message:', error);
          }
        };

        eventSource.onerror = (error) => {
          console.error('📡 SSE error:', error);
          eventSource?.close();

          // Retry connection after 5 seconds
          setTimeout(setupSSE, 5000);
        };
      } catch (error) {
        console.error('Error setting up SSE:', error);
      }
    };

    // Setup SSE connection
    setupSSE();

    // Cleanup on unmount
    return () => {
      if (eventSource) {
        eventSource.close();
        console.log('📡 SSE connection closed');
      }
    };
  }, [session?.user?.id]);

  return null; // This hook doesn't return anything, just sets up the listener
}
