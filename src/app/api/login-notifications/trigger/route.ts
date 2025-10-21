import { NextRequest, NextResponse } from 'next/server';
import { loginNotificationService } from '@/lib/login-notification-service';

// POST - Trigger login notification for a user
export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }
    
    console.log(`🎉 Triggering login notification for user: ${userId}`);
    
    // Schedule the login notification (10 seconds delay)
    const result = await loginNotificationService.scheduleLoginNotification(userId);
    
    console.log(`Login notification scheduling result: ${result}`);

    return NextResponse.json({ 
      success: true, 
      message: 'Login notification scheduled (10 seconds delay)',
      result: result
    });
  } catch (error) {
    console.error('Error triggering login notification:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
