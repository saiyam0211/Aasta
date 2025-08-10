import nodemailer from 'nodemailer';
import webPush from 'web-push';
import { prisma } from '@/lib/prisma';
import { getSocketManager } from '@/lib/socket-server';

interface NotificationData {
  title: string;
  body: string;
  data?: any;
  userId: string;
  type: 'ORDER_UPDATE' | 'DELIVERY_ALERT' | 'PROMOTION' | 'SYSTEM_ANNOUNCEMENT' | 'RESTAURANT_NOTIFICATION';
}

class NotificationService {
  // Email setup
  private transporter = nodemailer.createTransport({
    service: 'gmail', // Example service
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  // Web-push setup
  constructor() {
    webPush.setVapidDetails(
      'mailto:example@domain.com',
      process.env.VAPID_PUBLIC_KEY!,
      process.env.VAPID_PRIVATE_KEY!
    );
  }

  // Send order update notification
  async sendOrderUpdate(orderId: string, status: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        customer: {
          include: {
            user: true
          }
        },
        restaurant: true
      }
    });

    if (order) {
      // Send notifications here
      const payload = JSON.stringify({
        title: 'Order Update',
        body: `Your order status is now: ${status}`
      });

      // Socket.io
      const socketManager = getSocketManager();
      socketManager?.sendOrderUpdate(orderId, status);

      // Email
      await this.sendEmail(order.customer.user.email, 'Order Update', payload);

      // Push
      await this.sendPushNotification(order.customer.id, payload);
    }
  }

  // Send delivery alert
  async sendDeliveryAlert(deliveryPartnerId: string, message: string) {
    const partner = await prisma.deliveryPartner.findUnique({
      where: { id: deliveryPartnerId },
      include: {
        user: true
      }
    });

    if (partner) {
      const payload = JSON.stringify({
        title: 'Delivery Alert',
        body: message
      });

      // Socket.io
      const socketManager = getSocketManager();
      socketManager?.sendDeliveryAlert(deliveryPartnerId, message);

      // Telegram notification could go here
    }
  }

  // Send email
  private async sendEmail(to: string, subject: string, text: string) {
    try {
      await this.transporter.sendMail({
        from: process.env.EMAIL_USER,
        to,
        subject,
        text
      });
    } catch (error) {
      console.error('Email error:', error);
    }
  }

  // Send push notification
  private async sendPushNotification(userId: string, payload: string) {
    const subscriptions = await prisma.pushSubscription.findMany({
      where: {
        userId,
        active: true
      }
    });

    for (const subscription of subscriptions) {
      const pushSubscription = {
        endpoint: subscription.endpoint,
        keys: {
          auth: subscription.auth,
          p256dh: subscription.p256dh
        }
      };

      try {
        await webPush.sendNotification(pushSubscription, payload);
      } catch (error) {
        console.error('Push notification error:', error);
      }
    }
  }
}

export const notificationService = new NotificationService();
