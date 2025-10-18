import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get notification statistics
    const [
      totalSent,
      totalScheduled,
      recentNotifications,
      userStats
    ] = await Promise.all([
      prisma.notificationLog.count(),
      prisma.scheduledNotification.count({
        where: { status: 'PENDING' }
      }),
      prisma.notificationLog.findMany({
        take: 10,
        orderBy: { sentAt: 'desc' },
        include: {
          user: {
            select: { name: true, email: true }
          }
        }
      }),
      prisma.user.count({
        where: { fcmToken: { not: null } }
      })
    ]);

    return NextResponse.json({
      success: true,
      data: {
        totalSent,
        totalScheduled,
        usersWithTokens: userStats,
        recentNotifications
      }
    });

  } catch (error) {
    console.error('Error fetching notification stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notification statistics' },
      { status: 500 }
    );
  }
}
