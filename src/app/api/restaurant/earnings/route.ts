import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the user and restaurant
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        restaurant: true,
      },
    });

    if (!user?.restaurant) {
      return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 });
    }

    const restaurantId = user.restaurant.id;

    // Get today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get this week's date range
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    
    // Get this month's date range
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // Get orders for today
    const todayOrders = await prisma.order.findMany({
      where: {
        restaurantId,
        createdAt: {
          gte: today,
          lt: tomorrow,
        },
      },
      include: {
        orderItems: true,
      },
    });

    // Get orders for this week
    const weekOrders = await prisma.order.findMany({
      where: {
        restaurantId,
        createdAt: {
          gte: startOfWeek,
        },
      },
      include: {
        orderItems: true,
      },
    });

    // Get orders for this month
    const monthOrders = await prisma.order.findMany({
      where: {
        restaurantId,
        createdAt: {
          gte: startOfMonth,
        },
      },
      include: {
        orderItems: true,
      },
    });

    // Calculate earnings
    const calculateEarnings = (orders: any[]) => {
      return orders.reduce((total, order) => {
        const orderEarnings = order.orderItems.reduce((orderTotal: number, item: any) => {
          const earnings = Number(item.restaurantTotalEarnings) || 0;
          return orderTotal + earnings;
        }, 0);
        return total + orderEarnings;
      }, 0);
    };

    const todayEarnings = calculateEarnings(todayOrders);
    const weekEarnings = calculateEarnings(weekOrders);
    const monthEarnings = calculateEarnings(monthOrders);

    return NextResponse.json({
      success: true,
      earnings: {
        today: todayEarnings,
        thisWeek: weekEarnings,
        thisMonth: monthEarnings,
        totalOrders: todayOrders.length,
      },
    });

  } catch (error) {
    console.error('Error fetching restaurant earnings:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
