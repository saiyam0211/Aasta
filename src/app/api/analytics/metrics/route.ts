import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Get date range from query parameters
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Default to last 30 days if no date range provided
    const defaultStartDate = new Date();
    defaultStartDate.setDate(defaultStartDate.getDate() - 30);
    
    const dateFilter = {
      gte: startDate ? new Date(startDate) : defaultStartDate,
      lte: endDate ? new Date(endDate) : new Date()
    };

    // Get platform metrics
    const platformMetrics = await prisma.platformMetrics.findMany({
      where: {
        date: dateFilter
      },
      orderBy: {
        date: 'desc'
      }
    });

    // Get order statistics
    const orderStats = await prisma.order.groupBy({
      by: ['status'],
      _count: {
        status: true
      },
      where: {
        createdAt: dateFilter
      }
    });

    // Get user activity
    const userActivity = await prisma.userActivity.groupBy({
      by: ['action'],
      _count: {
        action: true
      },
      where: {
        createdAt: dateFilter
      }
    });

    // Get performance metrics
    const performanceMetrics = await prisma.performanceMetrics.findMany({
      where: {
        date: dateFilter
      },
      include: {
        restaurant: {
          select: {
            id: true,
            name: true
          }
        },
        deliveryPartner: {
          include: {
            user: {
              select: {
                name: true
              }
            }
          }
        }
      },
      orderBy: {
        date: 'desc'
      }
    });

    // Calculate real-time metrics
    const totalOrders = await prisma.order.count({
      where: {
        createdAt: dateFilter
      }
    });

    const totalRevenue = await prisma.order.aggregate({
      _sum: {
        totalAmount: true
      },
      where: {
        createdAt: dateFilter,
        status: 'DELIVERED'
      }
    });

    const averageOrderValue = totalRevenue._sum.totalAmount && totalOrders > 0 
      ? totalRevenue._sum.totalAmount / totalOrders 
      : 0;

    // Get active users count
    const activeUsers = await prisma.userActivity.findMany({
      distinct: ['userId'],
      where: {
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
        }
      },
      select: {
        userId: true
      }
    });

    const analytics = {
      platformMetrics,
      orderStats,
      userActivity,
      performanceMetrics,
      realTimeMetrics: {
        totalOrders,
        totalRevenue: totalRevenue._sum.totalAmount || 0,
        averageOrderValue,
        activeUsers: activeUsers.length
      }
    };

    return NextResponse.json({
      success: true,
      data: analytics
    });

  } catch (error) {
    console.error('Error fetching analytics metrics:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch analytics metrics'
    }, { status: 500 });
  }
}
