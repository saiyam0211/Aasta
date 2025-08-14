import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
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

    // Get restaurant ID for this user
    const restaurant = await prisma.restaurant.findUnique({
      where: { ownerId: session.user.id },
      select: { id: true },
    });

    if (!restaurant) {
      return NextResponse.json(
        { success: false, error: 'Restaurant not found' },
        { status: 404 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit');
    const limitNum = limit ? parseInt(limit, 10) : undefined;

    // Fetch orders for this restaurant
    const orders = await prisma.order.findMany({
      where: {
        restaurantId: restaurant.id,
        paymentStatus: 'COMPLETED',
        status: {
          in: [
            'PLACED',
            'CONFIRMED',
            'PREPARING',
            'READY_FOR_PICKUP',
            'OUT_FOR_DELIVERY',
          ],
        },
      },
      include: {
        orderItems: {
          select: {
            id: true,
            menuItemId: true,
            quantity: true,
            unitPrice: true,
            totalPrice: true,
            menuItem: {
              select: {
                name: true,
              },
            },
          },
        },
        customer: {
          include: {
            user: {
              select: {
                name: true,
                phone: true,
              },
            },
          },
        },
        deliveryAddress: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      ...(limitNum && { take: limitNum }),
    });

    // Transform the data for frontend consumption
    const transformedOrders = orders.map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      orderType: order.orderType,
      status: order.status,
      totalAmount: order.totalAmount,
      subtotal: order.subtotal,
      createdAt: order.createdAt.toISOString(),
      estimatedDeliveryTime: order.estimatedDeliveryTime?.toISOString(),
      deliveryAddress: `${order.deliveryAddress.street}, ${order.deliveryAddress.city}`,
      customerName: order.customer.user.name || 'Unknown Customer',
      itemCount: order.orderItems.length,
      items: order.orderItems.map((item) => ({
        id: item.id,
        menuItemId: item.menuItemId,
        quantity: item.quantity,
        price: item.unitPrice,
        itemName: item.menuItem.name,
      })),
      customer: {
        name: order.customer.user.name || 'Unknown Customer',
        phone: order.customer.user.phone,
      },
    }));

    return NextResponse.json({
      success: true,
      orders: transformedOrders,
    });
  } catch (error) {
    console.error('Failed to fetch restaurant orders:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}
