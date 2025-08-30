import webpush from 'web-push';
import { prisma } from '@/lib/prisma';
import { notificationBroadcaster } from '@/lib/notification-broadcaster';

// Configure web-push
webpush.setVapidDetails(
  'mailto:hi@aasta.food',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ||
    'BLrXB9jwTEIXyAEQNlQZqW-9OGDajzUW4m0AwrLI2G89Qe3Xc7dejs9XdXDlhNIG_PJFFE_WjisPKxPNAPqopPo',
  process.env.VAPID_PRIVATE_KEY || 'XSSX_s-7Xw_6T8iE-6BQUydeQMHsnFKhBK2u5VtRjtA'
);

export interface NotificationData {
  title: string;
  body: string;
  image?: string; // URL to image for notification
  icon?: string;
  badge?: string;
  data?: any;
  url?: string;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
  requireInteraction?: boolean;
  vibrate?: number[];
  tag?: string; // For grouping notifications
  silent?: boolean;
}

export interface ScheduledNotification {
  id: string;
  title: string;
  body: string;
  image?: string;
  scheduledFor: Date;
  userIds?: string[]; // Specific users, if empty sends to all
  data?: any;
  type: 'SCHEDULED' | 'ORDER_STATUS' | 'INSTANT' | 'BROADCAST';
}

class EnhancedNotificationService {
  // Send instant notification to specific user
  async sendToUser(userId: string, notification: NotificationData): Promise<boolean> {
    try {
      const subscription = await prisma.pushSubscription.findFirst({
        where: { userId, active: true },
      });

      if (!subscription) {
        console.log(`No active subscription found for user: ${userId}`);
        return false;
      }

      const payload = JSON.stringify({
        title: notification.title,
        body: notification.body,
        icon: notification.image || notification.icon || '/icons/icon-192x192.png',
        badge: notification.badge || '/icons/icon-72x72.png',
        image: notification.image, // Add image for rich notifications
        data: {
          url: notification.url || '/',
          ...notification.data,
        },
        actions: notification.actions || [
          {
            action: 'view',
            title: 'View Details',
            icon: '/icons/icon-72x72.png',
          },
        ],
        requireInteraction: notification.requireInteraction ?? true,
        vibrate: notification.vibrate || [200, 100, 200],
        tag: notification.tag,
        silent: notification.silent ?? false,
      });

      await webpush.sendNotification(
        {
          endpoint: subscription.endpoint,
          keys: {
            p256dh: subscription.p256dh,
            auth: subscription.auth,
          },
        },
        payload
      );

      // Log notification
      await prisma.notificationHistory.create({
        data: {
          userId,
          type: 'INSTANT',
          channel: 'PUSH',
          title: notification.title,
          message: notification.body,
          data: notification.data || {},
          status: 'SENT',
          sentAt: new Date(),
        },
      });

      console.log(`✅ Instant notification sent to user: ${userId}`);
      return true;
    } catch (error) {
      console.error(`❌ Failed to send instant notification to user ${userId}:`, error);
      
      // Log failed notification
      await prisma.notificationHistory.create({
        data: {
          userId,
          type: 'INSTANT',
          channel: 'PUSH',
          title: notification.title,
          message: notification.body,
          status: 'FAILED',
          errorMsg: error instanceof Error ? error.message : 'Unknown error',
        },
      });
      
      return false;
    }
  }

  // Send notification to multiple specific users
  async sendToUsers(userIds: string[], notification: NotificationData): Promise<{
    success: string[];
    failed: string[];
  }> {
    const results = await Promise.allSettled(
      userIds.map(userId => this.sendToUser(userId, notification))
    );

    const success: string[] = [];
    const failed: string[] = [];

    results.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value) {
        success.push(userIds[index]);
      } else {
        failed.push(userIds[index]);
      }
    });

    return { success, failed };
  }

  // Send notification to all PWA users
  async sendToAllPWAUsers(notification: NotificationData): Promise<{
    total: number;
    success: number;
    failed: number;
  }> {
    const subscriptions = await prisma.pushSubscription.findMany({
      where: { active: true },
      include: { user: true },
    });

    console.log(`📤 Sending notification to ${subscriptions.length} PWA users`);

    const results = await Promise.allSettled(
      subscriptions.map(subscription => 
        this.sendToUser(subscription.userId, notification)
      )
    );

    const success = results.filter(r => r.status === 'fulfilled' && r.value).length;
    const failed = results.length - success;

    return { total: subscriptions.length, success, failed };
  }

  // Send order status update notification
  async sendOrderStatusUpdate(
    userId: string, 
    orderNumber: string, 
    status: string, 
    restaurantName: string,
    estimatedTime?: string
  ): Promise<boolean> {
    const statusMessages = {
      'PLACED': 'Your order has been placed successfully!',
      'CONFIRMED': 'Your order has been confirmed by the restaurant!',
      'PREPARING': 'Your order is being prepared!',
      'READY_FOR_PICKUP': 'Your order is ready for pickup!',
      'OUT_FOR_DELIVERY': 'Your order is out for delivery!',
      'DELIVERED': 'Your order has been delivered! Enjoy your meal!',
    };

    const message = statusMessages[status as keyof typeof statusMessages] || 
      `Your order status has been updated to: ${status}`;

    const notification: NotificationData = {
      title: `Order ${orderNumber} Update`,
      body: `${message}${estimatedTime ? ` (${estimatedTime})` : ''}`,
      image: '/images/order-status-update.jpg', // Add order status image
      data: {
        type: 'ORDER_STATUS_UPDATE',
        orderNumber,
        status,
        restaurantName,
        url: `/orders/${orderNumber}`,
      },
      tag: `order-${orderNumber}`, // Group notifications by order
      requireInteraction: false,
    };

    return this.sendToUser(userId, notification);
  }

  // Send order placement confirmation
  async sendOrderConfirmation(
    userId: string,
    orderNumber: string,
    restaurantName: string,
    totalAmount: number,
    estimatedDeliveryTime: string
  ): Promise<boolean> {
    const notification: NotificationData = {
      title: 'Order Confirmed! 🎉',
      body: `Your order #${orderNumber} from ${restaurantName} has been confirmed. Total: ₹${totalAmount}. Estimated delivery: ${estimatedDeliveryTime}`,
      image: '/images/order-confirmed.jpg', // Add confirmation image
      data: {
        type: 'ORDER_CONFIRMATION',
        orderNumber,
        restaurantName,
        totalAmount,
        estimatedDeliveryTime,
        url: `/orders/${orderNumber}`,
      },
      tag: `order-confirmation-${orderNumber}`,
      requireInteraction: true,
    };

    return this.sendToUser(userId, notification);
  }

  // Schedule a notification
  async scheduleNotification(scheduledNotification: ScheduledNotification): Promise<string> {
    const notificationId = `scheduled_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Store in database for processing
    await prisma.scheduledNotification.create({
      data: {
        id: notificationId,
        title: scheduledNotification.title,
        body: scheduledNotification.body,
        image: scheduledNotification.image,
        scheduledFor: scheduledNotification.scheduledFor,
        userIds: scheduledNotification.userIds || [],
        data: scheduledNotification.data || {},
        type: scheduledNotification.type,
        status: 'SCHEDULED',
      },
    });

    console.log(`📅 Scheduled notification: ${notificationId} for ${scheduledNotification.scheduledFor}`);
    return notificationId;
  }

  // Get all PWA users for targeting
  async getPWAUsers(): Promise<Array<{
    id: string;
    name: string;
    email: string;
    phone: string;
    hasActiveSubscription: boolean;
    lastActive: Date;
  }>> {
    const users = await prisma.user.findMany({
      where: {
        pushSubscriptions: {
          some: {
            active: true,
          },
        },
      },
      include: {
        pushSubscriptions: {
          where: { active: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return users.map(user => ({
      id: user.id,
      name: user.name || 'Unknown User',
      email: user.email || '',
      phone: user.phone || '',
      hasActiveSubscription: user.pushSubscriptions.length > 0,
      lastActive: user.updatedAt,
    }));
  }

  // Process scheduled notifications (should be called by a cron job)
  async processScheduledNotifications(): Promise<void> {
    const now = new Date();
    const scheduledNotifications = await prisma.scheduledNotification.findMany({
      where: {
        scheduledFor: { lte: now },
        status: 'SCHEDULED',
      },
    });

    for (const scheduled of scheduledNotifications) {
      try {
        const notification: NotificationData = {
          title: scheduled.title,
          body: scheduled.body,
          image: scheduled.image,
          data: scheduled.data,
        };

        if (scheduled.userIds.length > 0) {
          // Send to specific users
          await this.sendToUsers(scheduled.userIds, notification);
        } else {
          // Send to all PWA users
          await this.sendToAllPWAUsers(notification);
        }

        // Mark as processed
        await prisma.scheduledNotification.update({
          where: { id: scheduled.id },
          data: { status: 'SENT', sentAt: new Date() },
        });

        console.log(`✅ Processed scheduled notification: ${scheduled.id}`);
      } catch (error) {
        console.error(`❌ Failed to process scheduled notification ${scheduled.id}:`, error);
        
        // Mark as failed
        await prisma.scheduledNotification.update({
          where: { id: scheduled.id },
          data: { 
            status: 'FAILED', 
            errorMsg: error instanceof Error ? error.message : 'Unknown error' 
          },
        });
      }
    }
  }
}

export const enhancedNotificationService = new EnhancedNotificationService();
