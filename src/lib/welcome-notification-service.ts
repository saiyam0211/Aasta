import { prisma } from './prisma';
import { NotificationService } from './notification-service';

export class WelcomeNotificationService {
  private notificationService: NotificationService;

  constructor() {
    this.notificationService = new NotificationService();
  }

  /**
   * Send a welcome notification to a user based on their login status
   */
  async sendWelcomeNotification(userId: string): Promise<boolean> {
    try {
      // Get user details
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          fcmToken: true,
          welcomeNotificationSent: true,
          createdAt: true
        }
      });

      if (!user || !user.fcmToken) {
        console.log('User not found or no FCM token');
        return false;
      }

      // Determine notification type
      const isNewUser = !user.welcomeNotificationSent;
      const notificationType = isNewUser ? 'NEW_USER' : 'RETURNING_USER';

      // Get random active notification for this type
      const notifications = await prisma.welcomeNotification.findMany({
        where: {
          type: notificationType,
          isActive: true
        }
      });

      if (notifications.length === 0) {
        console.log(`No active notifications found for type: ${notificationType}`);
        return false;
      }

      // Select random notification
      const randomNotification = notifications[Math.floor(Math.random() * notifications.length)];

      // Send the notification
      const result = await this.notificationService.sendToUser(userId, {
        title: randomNotification.title,
        body: randomNotification.body,
        imageUrl: randomNotification.imageUrl || undefined,
        data: randomNotification.data as Record<string, any> || {},
        actions: randomNotification.actions as Array<{id: string; title: string}> || undefined
      });

      if (result) {
        // Update user's welcome notification flag
        await prisma.user.update({
          where: { id: userId },
          data: { welcomeNotificationSent: true }
        });

        console.log(`Welcome notification sent to user ${userId} (${notificationType})`);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error sending welcome notification:', error);
      return false;
    }
  }

  /**
   * Schedule a welcome notification to be sent after 5 seconds
   */
  async scheduleWelcomeNotification(userId: string): Promise<void> {
    setTimeout(async () => {
      await this.sendWelcomeNotification(userId);
    }, 5000); // 5 seconds delay
  }
}

export const welcomeNotificationService = new WelcomeNotificationService();
