import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get restaurant statistics
    const [
      totalRestaurants,
      activeRestaurants,
      todayOrders,
      todayRevenue,
      averageRating,
      assignedPartners
    ] = await Promise.all([
      prisma.restaurant.count(),
      prisma.restaurant.count({
        where: { status: 'ACTIVE' }
      }),
      prisma.order.count({
        where: {
          createdAt: {
            gte: today,
            lt: tomorrow
          }
        }
      }),
      prisma.order.aggregate({
        where: {
          createdAt: {
            gte: today,
            lt: tomorrow
          },
          status: 'DELIVERED'
        },
        _sum: {
          totalAmount: true
        }
      }),
      prisma.restaurant.aggregate({
        _avg: {
          rating: true
        }
      }),
      prisma.deliveryPartner.count({
        where: { status: 'AVAILABLE' }
      })
    ]);

    const stats = {
      totalRestaurants,
      activeRestaurants,
      todayOrders,
      todayRevenue: todayRevenue._sum.totalAmount || 0,
      averageRating: averageRating._avg.rating || 0,
      assignedPartners
    };

    return NextResponse.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Error fetching restaurant stats:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch restaurant statistics' },
      { status: 500 }
    );
  }
}
