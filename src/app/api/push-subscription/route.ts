import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import webpush from 'web-push';

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

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const subscription = await request.json();

    // Save subscription to database using correct field names
    await prisma.pushSubscription.upsert({
      where: {
        userId_endpoint: {
          userId: session.user.id,
          endpoint: subscription.endpoint,
        },
      },
      update: {
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
        userAgent: request.headers.get('user-agent') || '',
        active: true,
        updatedAt: new Date(),
      },
      create: {
        userId: session.user.id,
        endpoint: subscription.endpoint,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
        userAgent: request.headers.get('user-agent') || '',
        active: true,
      },
    });

    console.log('✅ Push subscription saved for user:', session.user.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving push subscription:', error);
    return NextResponse.json(
      { error: 'Failed to save subscription' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Remove subscription from database
    await prisma.pushSubscription.updateMany({
      where: {
        userId: session.user.id,
      },
      data: {
        active: false,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing push subscription:', error);
    return NextResponse.json(
      { error: 'Failed to remove subscription' },
      { status: 500 }
    );
  }
}
