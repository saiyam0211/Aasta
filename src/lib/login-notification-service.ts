import { prisma } from './prisma';
import { NotificationService } from './notification-service';

export class LoginNotificationService {
  private notificationService: NotificationService;
  private sentNotifications: Set<string> = new Set();
  private processingNotifications: Set<string> = new Set();

  constructor() {
    this.notificationService = new NotificationService();
  }

  /**
   * Send a welcome notification only on actual login (not page loads)
   */
  async sendLoginNotification(userId: string): Promise<boolean> {
    try {
      console.log(`🔍 Checking login notification for user: ${userId}`);
      
      // Check if we already sent notification in this session
      if (this.sentNotifications.has(userId)) {
        console.log(`⏭️ Login notification already sent for user: ${userId}`);
        return false;
      }

      // Check if we're already processing a notification for this user
      if (this.processingNotifications.has(userId)) {
        console.log(`⏳ Login notification already processing for user: ${userId}`);
        return false;
      }

      // Mark as processing
      this.processingNotifications.add(userId);

      // Get user details from database
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          fcmToken: true,
          welcomeNotificationSent: true,
          createdAt: true
        }
      });

      console.log('User found:', user ? 'Yes' : 'No');
      console.log('FCM Token:', user?.fcmToken ? 'Present' : 'Missing');
      console.log('Welcome notification sent:', user?.welcomeNotificationSent);

      if (!user || !user.fcmToken) {
        console.log('User not found or no FCM token');
        return false;
      }

      // Determine notification type
      const isNewUser = !user.welcomeNotificationSent;
      const notificationType = isNewUser ? 'NEW_USER' : 'RETURNING_USER';
      
      console.log(`Notification type: ${notificationType} (isNewUser: ${isNewUser})`);

      // Get random active notification for this type
      const notifications = await prisma.welcomeNotification.findMany({
        where: {
          type: notificationType,
          isActive: true
        }
      });

      console.log(`Found ${notifications.length} notifications for type: ${notificationType}`);

      if (notifications.length === 0) {
        console.log(`No active notifications found for type: ${notificationType}`);
        return false;
      }

      // Select random notification
      const randomNotification = notifications[Math.floor(Math.random() * notifications.length)];
      console.log(`Selected notification: ${randomNotification.title}`);

      // Send the notification
      console.log('Sending login notification...');
      const result = await this.notificationService.sendToUser(userId, {
        title: randomNotification.title,
        body: randomNotification.body,
        imageUrl: randomNotification.imageUrl || undefined,
        data: randomNotification.data as Record<string, any> || {},
        actions: randomNotification.actions as Array<{id: string; title: string}> || undefined
      });

      console.log('Login notification send result:', result);

      if (result) {
        // Update user's welcome notification flag
        await prisma.user.update({
          where: { id: userId },
          data: { welcomeNotificationSent: true }
        });

        // Mark as sent in this session
        this.sentNotifications.add(userId);

        console.log(`Login notification sent to user ${userId} (${notificationType})`);
        return true;
      }

      console.log('Failed to send login notification');
      return false;
    } catch (error) {
      console.error('Error sending login notification:', error);
      return false;
    } finally {
      // Remove from processing set
      this.processingNotifications.delete(userId);
    }
  }

  /**
   * Schedule a login notification with 10 second delay
   */
  async scheduleLoginNotification(userId: string): Promise<void> {
    console.log(`📅 Scheduling login notification for user: ${userId} (10 seconds delay)`);
    
    // Use a Promise-based delay for serverless compatibility
    await new Promise(resolve => setTimeout(resolve, 10000));
    
    console.log(`⏰ Executing login notification for user: ${userId}`);
    await this.sendLoginNotification(userId);
  }
}

export const loginNotificationService = new LoginNotificationService();
