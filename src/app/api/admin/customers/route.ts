import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    
    const skip = (page - 1) * limit;

    // Build where clause for search
    const where: any = {
      role: 'CUSTOMER'
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [customers, totalCount] = await Promise.all([
      prisma.user.findMany({
        where,
        include: {
          customer: {
            include: {
              addresses: true,
              orders: {
                include: {
                  restaurant: {
                    select: { name: true }
                  },
                  orderItems: {
                    include: {
                      menuItem: {
                        select: { name: true, price: true }
                      }
                    }
                  }
                },
                orderBy: { createdAt: 'desc' }
              },
              _count: {
                select: {
                  orders: true,
                  addresses: true
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.user.count({ where })
    ]);

    // Calculate customer statistics
    const customersWithStats = await Promise.all(
      customers.map(async (customer) => {
        if (!customer.customer) return customer;

        const orders = customer.customer.orders;
        const totalOrders = orders.length;
        const totalSpent = orders.reduce((sum, order) => sum + order.totalAmount, 0);
        const averageOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;
        
        // Find highest and lowest order amounts
        const orderAmounts = orders.map(order => order.totalAmount);
        const highestSpent = orderAmounts.length > 0 ? Math.max(...orderAmounts) : 0;
        const lowestSpent = orderAmounts.length > 0 ? Math.min(...orderAmounts) : 0;

        // Get recent orders (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const recentOrders = orders.filter(order => 
          new Date(order.createdAt) >= thirtyDaysAgo
        );

        // Get favorite restaurants
        const restaurantFrequency = orders.reduce((acc, order) => {
          const restaurantName = order.restaurant.name;
          acc[restaurantName] = (acc[restaurantName] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        const favoriteRestaurants = Object.entries(restaurantFrequency)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 5)
          .map(([name, count]) => ({ name, orderCount: count }));

        return {
          ...customer,
          stats: {
            totalOrders,
            totalSpent,
            averageOrderValue,
            highestSpent,
            lowestSpent,
            recentOrdersCount: recentOrders.length,
            favoriteRestaurants,
            lastOrderDate: orders.length > 0 ? orders[0].createdAt : null
          }
        };
      })
    );

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      success: true,
      data: {
        customers: customersWithStats,
        pagination: {
          page,
          limit,
          total: totalCount,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Error fetching customers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch customers' },
      { status: 500 }
    );
  }
}
