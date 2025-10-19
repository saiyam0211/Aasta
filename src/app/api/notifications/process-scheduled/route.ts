import { NextRequest, NextResponse } from 'next/server';
import { notificationService } from '@/lib/notification-service';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    // Get scheduled notifications that are due
    const now = new Date();
    const scheduledNotifications = await prisma.scheduledNotification.findMany({
      where: {
        status: 'PENDING',
        scheduledFor: {
          lte: now
        }
      },
      include: {
        user: {
          select: { fcmToken: true, name: true }
        }
      }
    });

    if (scheduledNotifications.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No scheduled notifications to process'
      });
    }

    let successCount = 0;
    let failureCount = 0;

    // Process each scheduled notification
    for (const scheduled of scheduledNotifications) {
      try {
        if (scheduled.user.fcmToken) {
          const notification = {
            title: scheduled.title,
            body: scheduled.body,
            imageUrl: scheduled.imageUrl || undefined,
            data: scheduled.data as Record<string, string> | undefined,
            actions: scheduled.actions as Array<{ id: string; title: string }> | undefined
          };

          await notificationService.sendToUser(scheduled.userId, notification);
          
          // Update status to sent
          await prisma.scheduledNotification.update({
            where: { id: scheduled.id },
            data: { status: 'SENT' }
          });
          
          successCount++;
        } else {
          // Update status to failed (no FCM token)
          await prisma.scheduledNotification.update({
            where: { id: scheduled.id },
            data: { status: 'FAILED' }
          });
          
          failureCount++;
        }
      } catch (error) {
        console.error(`Error processing scheduled notification ${scheduled.id}:`, error);
        
        // Update status to failed
        await prisma.scheduledNotification.update({
          where: { id: scheduled.id },
          data: { status: 'FAILED' }
        });
        
        failureCount++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${scheduledNotifications.length} scheduled notifications`,
      results: {
        success: successCount,
        failed: failureCount
      }
    });

  } catch (error) {
    console.error('Error processing scheduled notifications:', error);
    return NextResponse.json(
      { error: 'Failed to process scheduled notifications' },
      { status: 500 }
    );
  }
}
