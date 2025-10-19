import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
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

    // Clear all FCM tokens from the database
    const result = await prisma.user.updateMany({
      where: { fcmToken: { not: null } },
      data: { fcmToken: null }
    });

    console.log('🧹 Cleared FCM tokens for', result.count, 'users');

    return NextResponse.json({
      success: true,
      message: `Cleared FCM tokens for ${result.count} users. Users will need to re-register their tokens.`,
      clearedCount: result.count
    });

  } catch (error) {
    console.error('Error clearing FCM tokens:', error);
    return NextResponse.json(
      { error: 'Failed to clear FCM tokens' },
      { status: 500 }
    );
  }
}
