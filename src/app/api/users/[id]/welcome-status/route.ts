import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Check if user has already received welcome notification
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        welcomeNotificationSent: true
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      userId: user.id,
      welcomeNotificationSent: user.welcomeNotificationSent
    });
  } catch (error) {
    console.error('Error checking welcome status:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
