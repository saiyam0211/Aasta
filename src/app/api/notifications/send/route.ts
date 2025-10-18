import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { notificationService } from '@/lib/notification-service';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const requestBody = await request.json();
    const { 
      type, 
      title, 
      body, 
      imageUrl, 
      targetUsers, 
      targetType, 
      data, 
      actions,
      scheduleTime 
    } = requestBody;

    // Validate required fields
    if (!title || !body) {
      return NextResponse.json(
        { error: 'Title and body are required' },
        { status: 400 }
      );
    }

    const notification = {
      title,
      body,
      imageUrl,
      data,
      actions
    };

    let result;

    if (scheduleTime) {
      // Schedule notification for later
      const scheduleDate = new Date(scheduleTime);
      if (scheduleDate <= new Date()) {
        return NextResponse.json(
          { error: 'Schedule time must be in the future' },
          { status: 400 }
        );
      }

      if (targetType === 'specific' && targetUsers?.length > 0) {
        // Schedule for specific users
        for (const userId of targetUsers) {
          await notificationService.scheduleNotification(userId, notification, scheduleDate);
        }
        result = { message: 'Notifications scheduled successfully' };
      } else {
        return NextResponse.json(
          { error: 'Scheduled notifications require specific target users' },
          { status: 400 }
        );
      }
    } else {
      // Send immediately
      if (targetType === 'all') {
        // Send to all users with FCM tokens
        const users = await prisma.user.findMany({
          where: { fcmToken: { not: null } },
          select: { id: true }
        });
        
        const userIds = users.map(user => user.id);
        result = await notificationService.sendToMultipleUsers(userIds, notification);
      } else if (targetType === 'specific' && targetUsers?.length > 0) {
        // Send to specific users
        result = await notificationService.sendToMultipleUsers(targetUsers, notification);
      } else {
        return NextResponse.json(
          { error: 'Invalid target type or no target users specified' },
          { status: 400 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Notification sent successfully',
      result
    });

  } catch (error) {
    console.error('Error sending notification:', error);
    return NextResponse.json(
      { error: 'Failed to send notification' },
      { status: 500 }
    );
  }
}
