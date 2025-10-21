'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useRef } from 'react';

export function LoginNotificationHandler() {
  const { data: session, status } = useSession();
  const notificationSentRef = useRef(false);
  const lastUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    // Only proceed if session is loaded and user is authenticated
    if (status === 'loading') return;
    if (!session?.user?.id) {
      // User logged out - reset flags
      notificationSentRef.current = false;
      lastUserIdRef.current = null;
      return;
    }

    const currentUserId = session.user.id;
    
    // Check if this is a new login (different user or first time)
    const isNewLogin = lastUserIdRef.current !== currentUserId;
    
    console.log('🔍 Login notification handler:', {
      currentUserId,
      lastUserId: lastUserIdRef.current,
      isNewLogin,
      notificationSent: notificationSentRef.current,
      status
    });

    if (isNewLogin && !notificationSentRef.current) {
      console.log('🎉 New login detected, triggering notification');
      notificationSentRef.current = true;
      lastUserIdRef.current = currentUserId;
      
      // Call the API endpoint to trigger login notification (10 seconds delay)
      fetch('/api/login-notifications/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUserId })
      }).catch(error => {
        console.error('Error triggering login notification:', error);
      });
    } else if (isNewLogin && notificationSentRef.current) {
      console.log('⏭️ Login notification already sent for this session');
    } else {
      console.log('🔄 Same user, no new login detected');
    }
  }, [session?.user?.id, status]);

  // This component doesn't render anything
  return null;
}
