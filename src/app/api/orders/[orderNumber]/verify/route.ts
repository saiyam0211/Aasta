import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ orderNumber: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is a restaurant owner
    if (session.user.role !== 'RESTAURANT_OWNER') {
      return NextResponse.json(
        {
          success: false,
          error: 'Access denied. Restaurant owner role required.',
        },
        { status: 403 }
      );
    }

    const { orderNumber } = await params;
    const body = await request.json();
    const { verificationCode } = body;

    if (!verificationCode) {
      return NextResponse.json(
        { success: false, error: 'Verification code is required' },
        { status: 400 }
      );
    }

    // Find the order and verify it belongs to the restaurant owner's restaurant
    const order = await prisma.order.findUnique({
      where: { orderNumber },
      include: {
        restaurant: {
          select: {
            id: true,
            ownerId: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    // Check if this order belongs to the authenticated restaurant owner
    if (order.restaurant.ownerId !== session.user.id) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Access denied. This order does not belong to your restaurant.',
        },
        { status: 403 }
      );
    }

    // Check if order is in the correct status for verification
    if (order.status !== 'READY_FOR_PICKUP') {
      return NextResponse.json(
        { success: false, error: 'Order is not ready for pickup verification' },
        { status: 400 }
      );
    }

    // Verify the code matches
    if (order.verificationCode !== verificationCode.trim()) {
      return NextResponse.json(
        { success: false, error: 'Invalid verification code' },
        { status: 400 }
      );
    }

    // Update order status to OUT_FOR_DELIVERY
    const updatedOrder = await prisma.order.update({
      where: { orderNumber },
      data: {
        status: 'OUT_FOR_DELIVERY',
        updatedAt: new Date(),
      },
    });

    // Log the successful verification
    console.log(
      `Order ${orderNumber} verified and handed over to delivery partner`
    );

    return NextResponse.json({
      success: true,
      message: 'Order verified successfully',
      order: {
        orderNumber: updatedOrder.orderNumber,
        status: updatedOrder.status,
        updatedAt: updatedOrder.updatedAt,
      },
    });
  } catch (error) {
    console.error('Order verification failed:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to verify order' },
      { status: 500 }
    );
  }
}
