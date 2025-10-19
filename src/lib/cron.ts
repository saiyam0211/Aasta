import { notificationService } from './notification-service';
import { prisma } from './prisma';

export async function processScheduledNotifications() {
  try {
    console.log('🕐 Processing scheduled notifications...');
    
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
      console.log('✅ No scheduled notifications to process');
      return;
    }

    console.log(`📬 Found ${scheduledNotifications.length} scheduled notifications to process`);

    let successCount = 0;
    let failureCount = 0;

    // Process each scheduled notification
    for (const scheduled of scheduledNotifications) {
      try {
        if (scheduled.user.fcmToken) {
          const notification = {
            title: scheduled.title,
            body: scheduled.body,
            imageUrl: scheduled.imageUrl,
            data: scheduled.data,
            actions: scheduled.actions
          };

          await notificationService.sendToUser(scheduled.userId, notification);
          
          // Update status to sent
          await prisma.scheduledNotification.update({
            where: { id: scheduled.id },
            data: { status: 'SENT' }
          });
          
          successCount++;
          console.log(`✅ Sent scheduled notification to ${scheduled.user.name}`);
        } else {
          // Update status to failed (no FCM token)
          await prisma.scheduledNotification.update({
            where: { id: scheduled.id },
            data: { status: 'FAILED' }
          });
          
          failureCount++;
          console.log(`❌ Failed to send scheduled notification to ${scheduled.user.name} (no FCM token)`);
        }
      } catch (error) {
        console.error(`❌ Error processing scheduled notification ${scheduled.id}:`, error);
        
        // Update status to failed
        await prisma.scheduledNotification.update({
          where: { id: scheduled.id },
          data: { status: 'FAILED' }
        });
        
        failureCount++;
      }
    }

    console.log(`🎉 Processed scheduled notifications: ${successCount} success, ${failureCount} failed`);

  } catch (error) {
    console.error('❌ Error processing scheduled notifications:', error);
  }
}

// Run the processor every minute
export function startScheduledNotificationProcessor() {
  console.log('🚀 Starting scheduled notification processor...');
  
  // Process immediately
  processScheduledNotifications();
  
  // Then process every minute
  setInterval(processScheduledNotifications, 60 * 1000);
}
