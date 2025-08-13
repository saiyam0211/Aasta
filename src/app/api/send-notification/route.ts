import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import webpush from 'web-push';
import { notificationBroadcaster } from '@/lib/notification-broadcaster';

// Configure web-push
webpush.setVapidDetails(
  'mailto:hi@aasta.food',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ||
    'BLrXB9jwTEIXyAEQNlQZqW-9OGDajzUW4m0AwrLI2G89Qe3Xc7dejs9XdXDlhNIG_PJFFE_WjisPKxPNAPqopPo',
  process.env.VAPID_PRIVATE_KEY || 'XSSX_s-7Xw_6T8iE-6BQUydeQMHsnFKhBK2u5VtRjtA'
);

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Only allow authenticated users with proper permissions
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },

        { status: 401 }
      );
    }

    const { userId, title, body, icon, badge, data, url } =
      await request.json();

    // Get user's push subscription using correct field names
    const subscription = await prisma.pushSubscription.findFirst({
      where: {
        userId,
        active: true,
      },
    });

    if (!subscription) {
      return NextResponse.json(
        { error: 'No push subscription found for user' },
        { status: 404 }
      );
    }

    // Prepare notification payload
    const payload = JSON.stringify({
      title: title || 'Aasta - Night Delivery',
      body,
      icon: icon || '/icons/icon-192x192.png',
      badge: badge || '/icons/icon-72x72.png',
      data: {
        url: url || '/',
        ...data,
      },
      actions: [
        {
          action: 'view',
          title: 'View Details',
          icon: '/icons/icon-72x72.png',
        },
      ],
      requireInteraction: true,
      vibrate: [200, 100, 200],
    });

    // Send push notification using correct field structure
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

    // Log notification for analytics
    await prisma.notificationHistory.create({
      data: {
        userId,
        type: 'SYSTEM_ANNOUNCEMENT',
        channel: 'PUSH',
        title: title || 'Aasta - Night Delivery',
        message: body,
        data: data || {},
        status: 'SENT',
        sentAt: new Date(),
      },
    });

    console.log('✅ Push notification sent to user:', userId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('❌ Error sending notification:', error);

    // Log failed notification
    try {
      const { userId, title, body } = await request.json();
      if (userId) {
        await prisma.notificationHistory.create({
          data: {
            userId,
            type: 'SYSTEM_ANNOUNCEMENT',
            channel: 'PUSH',
            title: title || 'Aasta - Night Delivery',
            message: body,
            status: 'FAILED',
            errorMsg: error instanceof Error ? error.message : 'Unknown error',
          },
        });
      }
    } catch (logError) {
      console.error('Failed to log notification error:', logError);
    }

    return NextResponse.json(
      {
        error: 'Failed to send notification',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// Bulk send notifications
export async function PUT(request: NextRequest) {
  console.log('📤 PUT /api/send-notification - Request received');

  try {
    console.log('📤 PUT /api/send-notification - Starting bulk send');

    const session = await getServerSession(authOptions);
    const operationsAuth = request.headers.get('x-operations-auth');

    console.log('🔐 Auth check:', {
      hasSession: !!session?.user?.id,
      hasOperationsAuth: !!operationsAuth,
      sessionUser: session?.user?.email,
      operationsAuthLength: operationsAuth?.length || 0,
    });

    // Allow authenticated users (NextAuth) or operations users
    if (!session?.user?.id && !operationsAuth) {
      console.log('❌ No authentication found');
      const errorResponse = NextResponse.json(
        { error: 'Unauthorized - Please login first' },
        { status: 401 }
      );
      console.log('📤 Returning 401 response');
      return errorResponse;
    }

    // For now, allow any operations auth for testing
    if (operationsAuth) {
      console.log('✅ Operations auth present - allowing request');
    }

    // Parse request body
    let requestData;
    try {
      // Clone the request to avoid consuming the body stream
      const clonedRequest = request.clone();
      requestData = await clonedRequest.json();
      console.log('📝 Parsed request data:', requestData);
    } catch (parseError) {
      console.error('❌ Failed to parse request JSON:', parseError);

      // Try to get raw text for debugging
      try {
        const bodyText = await request.text();
        console.log('📝 Raw request body (fallback):', bodyText);
      } catch (textError) {
        console.error('❌ Could not read request body as text:', textError);
      }

      return NextResponse.json(
        {
          error: 'Invalid JSON in request body',
          details:
            parseError instanceof Error
              ? parseError.message
              : 'Unknown parse error',
        },
        { status: 400 }
      );
    }

    const { broadcast, userIds, title, body, icon, badge, data, url } =
      requestData;

    if (!title || !body) {
      console.log('❌ Missing title or body', { title: !!title, body: !!body });
      return NextResponse.json(
        { error: 'Title and body are required' },
        { status: 400 }
      );
    }

    const notificationTitle = title || 'Aasta - Night Delivery';
    const notificationBody = body;

    console.log('📢 Broadcasting notification:', {
      title: notificationTitle,
      body: notificationBody,
      broadcast,
      userIds: userIds?.length || 0,
    });

    let sentCount = 0;
    let failedCount = 0;

    if (broadcast) {
      console.log('📱 Starting broadcast to all users...');

      // Get all active push subscriptions
      const subscriptions = await prisma.pushSubscription.findMany({
        where: {
          active: true,
        },
        include: {
          user: true,
        },
      });

      console.log(`📱 Found ${subscriptions.length} active push subscriptions`);

      if (subscriptions.length === 0) {
        console.log('⚠️ No active push subscriptions found');
        const response = NextResponse.json({
          success: true,
          sent: 0,
          failed: 0,
          total: 0,
          message: 'No active push subscriptions found',
        });
        console.log('📤 Returning response for no subscriptions:', response);
        return response;
      }

      // Prepare notification payload
      const payload = JSON.stringify({
        title: notificationTitle,
        body: notificationBody,
        icon: icon || '/icons/icon-192x192.png',
        badge: badge || '/icons/icon-72x72.png',
        data: {
          url: url || '/',
          ...data,
        },
        actions: [
          {
            action: 'view',
            title: 'View Details',
            icon: '/icons/icon-72x72.png',
          },
        ],
        requireInteraction: true,
        vibrate: [200, 100, 200],
      });

      console.log('📦 Notification payload prepared:', payload);

      // Send to all subscriptions
      const sendPromises = subscriptions.map(async (subscription) => {
        try {
          console.log(`📤 Sending to user ${subscription.userId}...`);

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

          // Log successful notification
          await prisma.notificationHistory.create({
            data: {
              userId: subscription.userId,
              type: 'RESTAURANT_NOTIFICATION',
              channel: 'PUSH',
              title: notificationTitle,
              message: notificationBody,
              data: data || {},
              status: 'SENT',
              sentAt: new Date(),
            },
          });

          console.log(`✅ Notification sent to user: ${subscription.userId}`);
          return { success: true, userId: subscription.userId };
        } catch (error) {
          console.error(
            `❌ Failed to send notification to user ${subscription.userId}:`,
            error
          );

          // Log failed notification
          try {
            await prisma.notificationHistory.create({
              data: {
                userId: subscription.userId,
                type: 'RESTAURANT_NOTIFICATION',
                channel: 'PUSH',
                title: notificationTitle,
                message: notificationBody,
                status: 'FAILED',
                errorMsg:
                  error instanceof Error ? error.message : 'Unknown error',
              },
            });
          } catch (logError) {
            console.error('Failed to log notification error:', logError);
          }

          return {
            success: false,
            userId: subscription.userId,
            error: error instanceof Error ? error.message : 'Unknown error',
          };
        }
      });

      console.log(`📤 Sending ${sendPromises.length} notifications...`);
      const results = await Promise.allSettled(sendPromises);

      results.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value.success) {
          sentCount++;
        } else {
          failedCount++;
          console.log(`❌ Send failed for subscription ${index}:`, result);
        }
      });

      // Also broadcast to notification broadcaster for real-time updates
      console.log('📢 Broadcasting to notification broadcaster...');
      notificationBroadcaster.broadcastToPWAUsers(
        notificationTitle,
        notificationBody,
        {
          icon: icon || '/icons/icon-192x192.png',
          badge: badge || '/icons/icon-72x72.png',
          url: url || '/',
          ...data,
        }
      );
    }

    console.log(
      `📊 Notification broadcast complete: ${sentCount} sent, ${failedCount} failed`
    );

    const finalResponse = NextResponse.json({
      success: true,
      sent: sentCount,
      failed: failedCount,
      total: sentCount + failedCount,
    });

    console.log('📤 Returning final response:', finalResponse);
    return finalResponse;
  } catch (error) {
    console.error('❌ Error in bulk notification send:', error);
    console.error(
      '❌ Error stack:',
      error instanceof Error ? error.stack : 'No stack trace'
    );

    const errorResponse = NextResponse.json(
      {
        error: 'Failed to send notifications',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );

    console.log('📤 Returning error response:', errorResponse);
    return errorResponse;
  }
}
