import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { WelcomeNotificationType } from '@prisma/client';

// GET - Fetch all welcome notifications
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const notifications = await prisma.welcomeNotification.findMany({
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ notifications });
  } catch (error) {
    console.error('Error fetching welcome notifications:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create a new welcome notification
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { type, title, body: notificationBody, imageUrl, data, actions } = body;

    if (!type || !title || !notificationBody) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const notification = await prisma.welcomeNotification.create({
      data: {
        type: type as WelcomeNotificationType,
        title,
        body: notificationBody,
        imageUrl,
        data,
        actions
      }
    });

    return NextResponse.json({ notification });
  } catch (error) {
    console.error('Error creating welcome notification:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
