import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import admin from '@/lib/firebase-admin';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get all users with FCM tokens
    const users = await prisma.user.findMany({
      where: { fcmToken: { not: null } },
      select: { id: true, fcmToken: true, name: true }
    });

    console.log('🔍 Users with FCM tokens:', users);

    if (users.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'No users with FCM tokens found',
        users: []
      });
    }

    // Test sending a simple notification
    const testMessage = {
      token: users[0].fcmToken!,
      notification: {
        title: 'Test Notification',
        body: 'This is a test notification from the server'
      },
      data: {
        type: 'test',
        timestamp: new Date().toISOString()
      }
    };

    console.log('📤 Sending test message:', testMessage);

    try {
      const result = await admin.messaging().send(testMessage);
      console.log('✅ Test notification sent successfully:', result);
      
      return NextResponse.json({
        success: true,
        message: 'Test notification sent successfully',
        result,
        users: users.map(u => ({ id: u.id, name: u.name, hasToken: !!u.fcmToken }))
      });
    } catch (error) {
      console.error('❌ Error sending test notification:', error);
      return NextResponse.json({
        success: false,
        message: 'Failed to send test notification',
        error: error instanceof Error ? error.message : 'Unknown error',
        users: users.map(u => ({ id: u.id, name: u.name, hasToken: !!u.fcmToken }))
      });
    }

  } catch (error) {
    console.error('Error in test FCM:', error);
    return NextResponse.json(
      { error: 'Failed to test FCM' },
      { status: 500 }
    );
  }
}
