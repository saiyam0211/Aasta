import admin from './firebase-admin';
import { prisma } from './prisma';

export interface NotificationData {
  title: string;
  body: string;
  imageUrl?: string;
  data?: Record<string, string>;
  actions?: Array<{
    id: string;
    title: string;
  }>;
}

export interface OrderNotificationData {
  orderId: string;
  status: string;
  restaurantName?: string;
  customerName?: string;
}

export class NotificationService {
  // Send notification to specific user
  async sendToUser(userId: string, notification: NotificationData) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { fcmToken: true, name: true }
      });

      if (!user?.fcmToken) {
        throw new Error('User FCM token not found');
      }

      const message = {
        token: user.fcmToken,
        notification: {
          title: notification.title,
          body: notification.body,
          imageUrl: notification.imageUrl ? `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}${notification.imageUrl}` : undefined
        },
        data: {
          type: 'custom',
          ...notification.data
        },
        android: {
          notification: {
            imageUrl: notification.imageUrl ? `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}${notification.imageUrl}` : undefined,
            sound: 'default',
            channelId: 'food_delivery',
            icon: 'ic_stat_aasta',
            color: '#ffd500'
          }
        },
        apns: {
          payload: {
            aps: {
              alert: {
                title: notification.title,
                body: notification.body
              },
              sound: 'default',
              badge: 1,
              'mutable-content': 1,
              'category': 'FOOD_DELIVERY'
            }
          }
        }
      };

      const result = await admin.messaging().send(message);
      console.log('Notification sent successfully:', result);
      
      // Log the notification
      await this.logNotification(userId, notification, result);
      
      return result;
    } catch (error) {
      console.error('Error sending notification:', error);
      throw error;
    }
  }

  // Send notification to multiple users
  async sendToMultipleUsers(userIds: string[], notification: NotificationData) {
    try {
      const users = await prisma.user.findMany({
        where: { 
          id: { in: userIds },
          fcmToken: { not: null }
        },
        select: { id: true, fcmToken: true, name: true }
      });

      if (users.length === 0) {
        throw new Error('No users with FCM tokens found');
      }

      const tokens = users.map(user => user.fcmToken).filter(Boolean) as string[];

      const message = {
        tokens,
        notification: {
          title: notification.title,
          body: notification.body,
          imageUrl: notification.imageUrl ? `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}${notification.imageUrl}` : undefined
        },
        data: {
          type: 'broadcast',
          ...notification.data
        },
        android: {
          notification: {
            imageUrl: notification.imageUrl ? `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}${notification.imageUrl}` : undefined,
            sound: 'default',
            channelId: 'food_delivery',
            icon: 'ic_stat_aasta',
            color: '#ffd500'
          }
        },
        apns: {
          payload: {
            aps: {
              alert: {
                title: notification.title,
                body: notification.body
              },
              sound: 'default',
              badge: 1,
              'mutable-content': 1,
              'category': 'FOOD_DELIVERY'
            }
          }
        }
      };

      console.log('📤 Sending multicast message:', JSON.stringify(message, null, 2));
      const result = await admin.messaging().sendEachForMulticast(message);
      console.log('✅ Multicast notification sent:', result);
      console.log('📊 Success count:', result.successCount);
      console.log('❌ Failure count:', result.failureCount);
      if (result.responses) {
        result.responses.forEach((response, index) => {
          if (response.success) {
            console.log(`✅ Message ${index} sent successfully:`, response.messageId);
          } else {
            console.log(`❌ Message ${index} failed:`, response.error);
          }
        });
      }
      
      // Log notifications for successful sends and collect invalid tokens
      const invalidTokens: string[] = [];
      for (let i = 0; i < result.responses.length; i++) {
        const response = result.responses[i];
        if (response.success && users[i] && users[i].id) {
          await this.logNotification(users[i].id, notification, response);
        } else if (!response.success && response.error?.code === 'messaging/registration-token-not-registered' && users[i]?.fcmToken) {
          invalidTokens.push(users[i].fcmToken!);
        }
      }
      
      // Clean up invalid tokens
      if (invalidTokens.length > 0) {
        await this.cleanupInvalidTokens(invalidTokens);
      }
      
      return result;
    } catch (error) {
      console.error('Error sending multicast notification:', error);
      throw error;
    }
  }

  // Send order update notification
  async sendOrderUpdate(orderData: OrderNotificationData) {
    const order = await prisma.order.findUnique({
      where: { orderNumber: orderData.orderId },
      include: {
        customer: {
          include: {
            user: { select: { fcmToken: true, name: true } }
          }
        },
        restaurant: { select: { name: true } }
      }
    });

    if (!order?.customer?.user?.fcmToken) {
      throw new Error('Order user FCM token not found');
    }

    const notification = this.getOrderNotification(orderData.status, orderData);
    
    const message = {
      token: order.customer.user.fcmToken,
      notification: {
        title: notification.title,
        body: notification.body,
        imageUrl: notification.imageUrl
      },
      data: {
        orderId: orderData.orderId,
        type: 'order_update',
        status: orderData.status,
        screen: 'order_details'
      },
      android: {
        notification: {
          imageUrl: notification.imageUrl,
          sound: 'default',
          channelId: 'order_updates',
          icon: 'ic_notification',
          color: '#ffd500',
          actions: notification.actions
        }
      },
      apns: {
        payload: {
          aps: {
            alert: {
              title: notification.title,
              body: notification.body
            },
            sound: 'default',
            badge: 1,
            'mutable-content': 1,
            'category': 'ORDER_UPDATE'
          }
        }
      }
    };

    return await admin.messaging().send(message);
  }

  // Get order notification based on status
  private getOrderNotification(status: string, orderData: OrderNotificationData) {
    const notifications = {
      CONFIRMED: {
        title: '✅ Order Confirmed!',
        body: `Your order from ${orderData.restaurantName} has been placed successfully`,
        imageUrl: 'https://your-cdn.com/order-confirmed.gif',
        actions: [
          { id: 'view_order', title: 'View Order' },
          { id: 'track_order', title: 'Track Order' }
        ]
      },
      PREPARING: {
        title: '🍕 Your order is being prepared!',
        body: `Chef at ${orderData.restaurantName} is cooking your delicious meal`,
        imageUrl: 'https://your-cdn.com/cooking-animation.gif',
        actions: [
          { id: 'view_order', title: 'View Order' },
          { id: 'contact_restaurant', title: 'Contact Restaurant' }
        ]
      },
      OUT_FOR_DELIVERY: {
        title: '🚚 Your order is out for delivery!',
        body: `Our delivery partner is on the way with your order from ${orderData.restaurantName}`,
        imageUrl: 'https://your-cdn.com/delivery-truck.jpg',
        actions: [
          { id: 'track_delivery', title: 'Track Delivery' },
          { id: 'contact_driver', title: 'Contact Driver' }
        ]
      },
      DELIVERED: {
        title: '🎉 Order Delivered!',
        body: `Enjoy your meal from ${orderData.restaurantName}! Rate your experience`,
        imageUrl: 'https://your-cdn.com/delivered.jpg',
        actions: [
          { id: 'rate_order', title: 'Rate Order' },
          { id: 'reorder', title: 'Reorder' }
        ]
      },
      CANCELLED: {
        title: '❌ Order Cancelled',
        body: `Your order from ${orderData.restaurantName} has been cancelled`,
        imageUrl: 'https://your-cdn.com/cancelled.jpg',
        actions: [
          { id: 'view_order', title: 'View Order' },
          { id: 'order_again', title: 'Order Again' }
        ]
      }
    };

    return notifications[status as keyof typeof notifications] || {
      title: 'Order Update',
      body: `Your order status has been updated to ${status}`,
      actions: [
        { id: 'view_order', title: 'View Order' }
      ]
    };
  }

  // Send marketing notification
  async sendMarketingNotification(userIds: string[], campaign: string, notification: NotificationData) {
    return await this.sendToMultipleUsers(userIds, {
      ...notification,
      data: {
        type: 'marketing',
        campaign,
        screen: 'home'
      }
    });
  }

  // Schedule notification for later
  async scheduleNotification(userId: string, notification: NotificationData, scheduleTime: Date) {
    // Store in database for scheduled sending
    await prisma.scheduledNotification.create({
      data: {
        userId,
        title: notification.title,
        body: notification.body,
        imageUrl: notification.imageUrl,
        data: notification.data,
        actions: notification.actions,
        scheduledFor: scheduleTime,
        status: 'PENDING'
      }
    });

    console.log(`Notification scheduled for ${scheduleTime}`);
  }

  // Schedule notification for multiple users
  async scheduleNotificationForMultipleUsers(userIds: string[], notification: NotificationData, scheduleTime: Date) {
    const scheduledNotifications = userIds.map(userId => ({
      userId,
      title: notification.title,
      body: notification.body,
      imageUrl: notification.imageUrl,
      data: notification.data,
      actions: notification.actions,
      scheduledFor: scheduleTime,
      status: 'PENDING' as const
    }));

    await prisma.scheduledNotification.createMany({
      data: scheduledNotifications
    });

    console.log(`Notifications scheduled for ${userIds.length} users at ${scheduleTime}`);
  }

  // Log notification to database
  private async logNotification(userId: string, notification: NotificationData, result: any) {
    try {
      await prisma.notificationLog.create({
        data: {
          userId,
          title: notification.title,
          body: notification.body,
          imageUrl: notification.imageUrl,
          data: notification.data,
          actions: notification.actions,
          sentAt: new Date(),
          status: 'SENT',
          messageId: result.messageId || result
        }
      });
    } catch (error) {
      console.error('Error logging notification:', error);
    }
  }

  // Clean up invalid FCM tokens
  async cleanupInvalidTokens(invalidTokens: string[]) {
    try {
      await prisma.user.updateMany({
        where: {
          fcmToken: {
            in: invalidTokens
          }
        },
        data: {
          fcmToken: null
        }
      });
      console.log(`Cleaned up ${invalidTokens.length} invalid FCM tokens`);
    } catch (error) {
      console.error('Error cleaning up invalid tokens:', error);
    }
  }

  // Get notification statistics
  async getNotificationStats() {
    const stats = await prisma.notificationLog.aggregate({
      _count: {
        id: true
      }
    });

    return {
      totalSent: stats._count.id,
      // Add more statistics as needed
    };
  }
}

export const notificationService = new NotificationService();