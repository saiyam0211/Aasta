import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import {
  enhancedNotificationService,
  type NotificationData,
  type ScheduledNotification,
} from '@/lib/enhanced-notification-service';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      type,
      userIds,
      notification,
      scheduledFor,
      orderNumber,
      orderStatus,
      restaurantName,
      totalAmount,
      estimatedDeliveryTime,
    } = body;

    switch (type) {
      case 'SEND_TO_USER':
        if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
          return NextResponse.json(
            { error: 'User IDs required' },
            { status: 400 }
          );
        }

        const result = await enhancedNotificationService.sendToUsers(
          userIds,
          notification
        );
        return NextResponse.json({ success: true, result });

      case 'SEND_TO_ALL':
        const allResult =
          await enhancedNotificationService.sendToAllPWAUsers(notification);
        return NextResponse.json({ success: true, result: allResult });

      case 'ORDER_STATUS_UPDATE':
        if (!userIds?.[0] || !orderNumber || !orderStatus || !restaurantName) {
          return NextResponse.json(
            { error: 'Missing required fields for order status update' },
            { status: 400 }
          );
        }

        const statusResult =
          await enhancedNotificationService.sendOrderStatusUpdate(
            userIds[0],
            orderNumber,
            orderStatus,
            restaurantName,
            estimatedDeliveryTime
          );
        return NextResponse.json({ success: statusResult });

      case 'ORDER_CONFIRMATION':
        if (
          !userIds?.[0] ||
          !orderNumber ||
          !restaurantName ||
          !totalAmount ||
          !estimatedDeliveryTime
        ) {
          return NextResponse.json(
            { error: 'Missing required fields for order confirmation' },
            { status: 400 }
          );
        }

        const confirmationResult =
          await enhancedNotificationService.sendOrderConfirmation(
            userIds[0],
            orderNumber,
            restaurantName,
            totalAmount,
            estimatedDeliveryTime
          );
        return NextResponse.json({ success: confirmationResult });

      case 'SCHEDULE':
        if (!scheduledFor || !notification) {
          return NextResponse.json(
            { error: 'Scheduled time and notification required' },
            { status: 400 }
          );
        }

        const scheduledNotification: ScheduledNotification = {
          id: '',
          title: notification.title,
          body: notification.body,
          image: notification.image,
          scheduledFor: new Date(scheduledFor),
          userIds: userIds || [],
          data: notification.data,
          type: 'SCHEDULED',
        };

        const scheduledId =
          await enhancedNotificationService.scheduleNotification(
            scheduledNotification
          );
        return NextResponse.json({ success: true, scheduledId });

      default:
        return NextResponse.json(
          { error: 'Invalid notification type' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error in enhanced notifications API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    switch (action) {
      case 'get-pwa-users':
        const users = await enhancedNotificationService.getPWAUsers();
        return NextResponse.json({ success: true, users });

      case 'process-scheduled':
        await enhancedNotificationService.processScheduledNotifications();
        return NextResponse.json({
          success: true,
          message: 'Scheduled notifications processed',
        });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error in enhanced notifications GET API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
