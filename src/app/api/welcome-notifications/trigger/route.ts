import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { welcomeNotificationService } from '@/lib/welcome-notification-service';

// POST - Trigger welcome notification for a user
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId } = await request.json();
    
    // Verify the user is requesting for themselves or is admin
    if (userId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

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
