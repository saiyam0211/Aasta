import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '7d'; // 7d, 30d, 90d, 1y
    const restaurantId = searchParams.get('restaurantId');

    const now = new Date();
    let startDate: Date;

    switch (period) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    // Build base filter
    const baseFilter: any = {
      createdAt: {
        gte: startDate,
        lte: now
      }
    };

    // Add restaurant filter if provided
    if (restaurantId) {
      baseFilter.order = {
        restaurantId: restaurantId
      };
    }

    // Get payment statistics
    const [
      totalRevenue,
      completedPayments,
      failedPayments,
      refunds,
      paymentMethods,
      revenueByDay
    ] = await Promise.all([
      // Total revenue
      prisma.payment.aggregate({
        where: {
          ...baseFilter,
          status: 'COMPLETED'
        },
        _sum: {
          amount: true
        }
      }),

      // Completed payments count
      prisma.payment.count({
        where: {
          ...baseFilter,
          status: 'COMPLETED'
        }
      }),

      // Failed payments count
      prisma.payment.count({
        where: {
          ...baseFilter,
          status: 'FAILED'
        }
      }),

      // Refunds
      prisma.refund.aggregate({
        where: {
          createdAt: {
            gte: startDate,
            lte: now
          }
        },
        _sum: {
          amount: true
        },
        _count: {
          id: true
        }
      }),

      // Payment methods breakdown
      prisma.payment.groupBy({
        by: ['paymentMethod'],
        where: {
          ...baseFilter,
          status: 'COMPLETED'
        },
        _sum: {
          amount: true
        },
        _count: {
          id: true
        }
      }),

      // Revenue by day
      prisma.$queryRaw`
        SELECT 
          DATE(createdAt) as date,
          SUM(amount) as revenue,
          COUNT(*) as transactions
        FROM Payment 
        WHERE createdAt >= ${startDate} 
          AND createdAt <= ${now}
          AND status = 'COMPLETED'
        GROUP BY DATE(createdAt)
        ORDER BY date DESC
      `
    ]);

    // Calculate metrics
    const totalTransactions = completedPayments + failedPayments;
    const successRate = totalTransactions > 0 ? (completedPayments / totalTransactions) * 100 : 0;
    const averageOrderValue = completedPayments > 0 ? (totalRevenue._sum.amount || 0) / completedPayments : 0;

    // Commission calculations (assuming 10% platform fee)
    const platformRevenue = (totalRevenue._sum.amount || 0) * 0.1;
    const restaurantRevenue = (totalRevenue._sum.amount || 0) * 0.9;

    return NextResponse.json({
      success: true,
      analytics: {
        overview: {
          totalRevenue: totalRevenue._sum.amount || 0,
          platformRevenue,
          restaurantRevenue,
          totalTransactions,
          completedPayments,
          failedPayments,
          successRate: Math.round(successRate * 100) / 100,
          averageOrderValue: Math.round(averageOrderValue * 100) / 100,
          totalRefunds: refunds._sum.amount || 0,
          refundCount: refunds._count.id || 0
        },
        paymentMethods: paymentMethods.map(method => ({
          method: method.paymentMethod,
          revenue: method._sum.amount || 0,
          transactions: method._count.id,
          percentage: totalRevenue._sum.amount ? 
            Math.round(((method._sum.amount || 0) / (totalRevenue._sum.amount || 1)) * 10000) / 100 : 0
        })),
        revenueByDay: revenueByDay,
        period: {
          start: startDate.toISOString(),
          end: now.toISOString(),
          period
        }
      }
    });
  } catch (error) {
    console.error("Payment analytics failed:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch payment analytics" },
      { status: 500 }
    );
  }
}
