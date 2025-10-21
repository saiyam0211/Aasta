import { NextRequest, NextResponse } from 'next/server';
import { welcomeNotificationService } from '@/lib/welcome-notification-service';

// POST - Trigger welcome notification for a user
export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }
    
    console.log(`Triggering welcome notification for user: ${userId}`);
    
    // No authentication required - this endpoint is called from the client

    // Schedule the welcome notification (5 seconds delay)
    const result = await welcomeNotificationService.scheduleWelcomeNotification(userId);
    
    console.log(`Welcome notification scheduling result: ${result}`);

    return NextResponse.json({ 
      success: true, 
      message: 'Welcome notification scheduled',
      result: result
    });
  } catch (error) {
    console.error('Error triggering welcome notification:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
