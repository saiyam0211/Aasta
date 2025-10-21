import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// PUT - Update a welcome notification
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { type, title, body: notificationBody, imageUrl, data, actions, isActive } = body;

    const notification = await prisma.welcomeNotification.update({
      where: { id: params.id },
      data: {
        type,
        title,
        body: notificationBody,
        imageUrl,
        data,
        actions,
        isActive
      }
    });

    return NextResponse.json({ notification });
  } catch (error) {
    console.error('Error updating welcome notification:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Delete a welcome notification
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await prisma.welcomeNotification.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    console.error('Error deleting welcome notification:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
