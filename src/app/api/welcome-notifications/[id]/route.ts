import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// PUT - Update a welcome notification
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json();
    const { type, title, body: notificationBody, imageUrl, data, actions, isActive } = body;
    const { id } = await params;

    const notification = await prisma.welcomeNotification.update({
      where: { id },
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.welcomeNotification.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    console.error('Error deleting welcome notification:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
