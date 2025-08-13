import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Get live orders (not yet delivered)
    const liveOrders = await prisma.order.findMany({
      where: {
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
        restaurant: {
          select: {
            name: true,
          },
        },
        deliveryPartner: {
          include: {
            user: {
              select: {
                name: true,
                phone: true,
              },
            },
          },
        },
        orderItems: {
          include: {
            menuItem: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10, // Limit to recent 10 orders
    });

    const formattedOrders = liveOrders.map((order) => ({
      id: order.id,
      orderNumber: `ORD-${order.id.slice(-6).toUpperCase()}`,
      customerName: order.customer?.user?.name || 'Unknown Customer',
      items: order.orderItems.map(
        (item) => item.menuItem?.name || 'Unknown Item'
      ),
      total: order.totalAmount,
      status: order.status,
      createdAt: getTimeAgo(order.createdAt),
      estimatedTime: 30, // You can calculate this based on restaurant prep time
      deliveryPartner: order.deliveryPartner
        ? {
            name: order.deliveryPartner.user?.name || 'Unknown Partner',
            phone: order.deliveryPartner.user?.phone || 'N/A',
          }
        : undefined,
    }));

    return NextResponse.json({
      success: true,
      data: formattedOrders,
    });
  } catch (error) {
    console.error('Error fetching live orders:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch live orders' },
      { status: 500 }
    );
  }
}

function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffInMinutes = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60)
  );

  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes} min ago`;

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24)
    return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;

  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
}
