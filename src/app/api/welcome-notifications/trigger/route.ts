import { NextRequest, NextResponse } from 'next/server';
import { welcomeNotificationService } from '@/lib/welcome-notification-service';

// POST - Trigger welcome notification for a user
export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }
    
    // No authentication required - this endpoint is called from the client

    // Schedule the welcome notification (5 seconds delay)
    welcomeNotificationService.scheduleWelcomeNotification(userId);

    return NextResponse.json({ 
      success: true, 
      message: 'Welcome notification scheduled' 
    });
  } catch (error) {
    console.error('Error triggering welcome notification:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
