'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

// Mock FCM for development (replace with actual FCM when packages are installed)
const mockFCM = {
  requestPermissions: async () => ({ receive: 'granted' }),
  getToken: async () => 'mock-fcm-token-' + Math.random().toString(36).substr(2, 9),
  addListener: (event: string, callback: (data: any) => void) => {
    console.log(`Mock FCM listener added for ${event}`);
    return { remove: () => console.log(`Mock FCM listener removed for ${event}`) };
  }
};

export const useFCM = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const router = useRouter();

  const initializeFCM = async () => {
    try {
      console.log('🚀 Initializing FCM...');
      
      // Request permissions
      const permission = await mockFCM.requestPermissions();
      
      if (permission.receive === 'granted') {
        // Get FCM token
        const token = await mockFCM.getToken();
        setFcmToken(token);
        console.log('📱 FCM Token:', token);
        
        // Send token to backend
        try {
          const response = await fetch('/api/notifications/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token })
          });
          
          if (response.ok) {
            console.log('✅ FCM token registered successfully');
          } else {
            console.error('❌ Failed to register FCM token');
          }
        } catch (error) {
          console.error('❌ Error registering FCM token:', error);
        }
        
        // Listen for notifications
        mockFCM.addListener('notification', (notification) => {
          console.log('📨 Notification received:', notification);
          
          // Handle deep linking based on notification data
          if (notification.data?.screen) {
            switch (notification.data.screen) {
              case 'order_details':
                router.push(`/orders/${notification.data.orderId}`);
                break;
              case 'order_tracking':
                router.push(`/orders/${notification.data.orderId}/tracking`);
                break;
              case 'restaurant':
                router.push(`/restaurants/${notification.data.restaurantId}`);
                break;
              case 'home':
                router.push('/');
                break;
              default:
                router.push('/');
            }
          }
        });
        
        // Handle notification actions
        mockFCM.addListener('notificationAction', (action) => {
          console.log('🔘 Notification action:', action);
          
          switch (action.actionId) {
            case 'view_order':
              router.push(`/orders/${action.data.orderId}`);
              break;
            case 'track_delivery':
              router.push(`/orders/${action.data.orderId}/tracking`);
              break;
            case 'rate_order':
              router.push(`/orders/${action.data.orderId}/rate`);
              break;
            case 'reorder':
              router.push(`/restaurants/${action.data.restaurantId}`);
              break;
            case 'view_restaurant':
              router.push(`/restaurants/${action.data.restaurantId}`);
              break;
            case 'browse_menu':
              router.push(`/restaurants/${action.data.restaurantId}`);
              break;
            case 'view_cart':
              router.push('/cart');
              break;
            case 'checkout':
              router.push('/cart');
              break;
            default:
              router.push('/');
          }
        });
        
        setIsInitialized(true);
        console.log('✅ FCM initialized successfully');
      } else {
        console.warn('⚠️ FCM permission denied');
      }
    } catch (error) {
      console.error('❌ Error initializing FCM:', error);
    }
  };

  useEffect(() => {
    initializeFCM();
  }, []);

  return {
    isInitialized,
    fcmToken,
    initializeFCM
  };
};
