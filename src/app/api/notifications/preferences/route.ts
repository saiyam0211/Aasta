import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'User ID is required'
      }, { status: 400 });
    }

    let preferences = await prisma.notificationPreference.findUnique({
      where: { userId }
    });

    // Create default preferences if none exist
    if (!preferences) {
      preferences = await prisma.notificationPreference.create({
        data: { userId }
      });
    }

    return NextResponse.json({
      success: true,
      data: preferences
    });

  } catch (error) {
    console.error('Error fetching notification preferences:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch notification preferences'
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, ...preferences } = body;

    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'User ID is required'
      }, { status: 400 });
    }

    const updatedPreferences = await prisma.notificationPreference.upsert({
      where: { userId },
      update: preferences,
      create: { userId, ...preferences }
    });

    return NextResponse.json({
      success: true,
      data: updatedPreferences
    });

  } catch (error) {
    console.error('Error updating notification preferences:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update notification preferences'
    }, { status: 500 });
  }
}
