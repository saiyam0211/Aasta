import { NextRequest, NextResponse } from 'next/server';
import { enhancedNotificationService } from '@/lib/enhanced-notification-service';

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret to ensure this is called by the cron service
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get('secret');
    
    if (secret !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('🕐 Processing scheduled notifications...');
    
    // Process all scheduled notifications
    await enhancedNotificationService.processScheduledNotifications();
    
    console.log('✅ Scheduled notifications processed successfully');
    
    return NextResponse.json({ 
      success: true, 
      message: 'Scheduled notifications processed',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error processing scheduled notifications:', error);
    return NextResponse.json(
      { error: 'Failed to process scheduled notifications' },
      { status: 500 }
    );
  }
}
