import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const resolvedParams = await params;
    const customerId = resolvedParams.id;

    // Fetch customer with all related data
    const customer = await prisma.user.findUnique({
      where: {
        id: customerId,
        role: 'CUSTOMER'
      },
      include: {
        customer: {
          include: {
            addresses: {
              orderBy: { createdAt: 'desc' }
            },
            orders: {
              include: {
                restaurant: {
                  select: { 
                    id: true, 
                    name: true, 
                    address: true, 
                    phone: true,
                    imageUrl: true
                  }
                },
                deliveryAddress: true,
                orderItems: {
                  include: {
                    menuItem: {
                      select: { 
                        id: true, 
                        name: true, 
                        price: true, 
                        imageUrl: true,
                        category: true
                      }
                    }
                  }
                },
                deliveryPartner: {
                  include: {
                    user: {
                      select: { 
                        name: true, 
                        phone: true 
                      }
                    }
                  }
                }
              },
              orderBy: { createdAt: 'desc' }
            },
            reviews: {
              include: {
                restaurant: {
                  select: { name: true }
                },
                order: {
                  select: { orderNumber: true }
                }
              },
              orderBy: { createdAt: 'desc' }
            }
          }
        }
      }
    });

    if (!customer || !customer.customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    const orders = customer.customer.orders;
    const addresses = customer.customer.addresses;
    const reviews = customer.customer.reviews;

    // Calculate comprehensive statistics
    const totalOrders = orders.length;
    const totalSpent = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const averageOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;
    
    // Order amount statistics
    const orderAmounts = orders.map(order => order.totalAmount);
    const highestSpent = orderAmounts.length > 0 ? Math.max(...orderAmounts) : 0;
    const lowestSpent = orderAmounts.length > 0 ? Math.min(...orderAmounts) : 0;

    // Order status breakdown
    const orderStatusBreakdown = orders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Monthly spending analysis
    const monthlySpending = orders.reduce((acc, order) => {
      const monthKey = new Date(order.createdAt).toISOString().slice(0, 7); // YYYY-MM
      acc[monthKey] = (acc[monthKey] || 0) + order.totalAmount;
      return acc;
    }, {} as Record<string, number>);

    // Recent activity (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentOrders = orders.filter(order => 
      new Date(order.createdAt) >= thirtyDaysAgo
    );

    // Favorite restaurants analysis
    const restaurantFrequency = orders.reduce((acc, order) => {
      const restaurantId = order.restaurant.id;
      const restaurantName = order.restaurant.name;
      if (!acc[restaurantId]) {
        acc[restaurantId] = { 
          name: restaurantName, 
          orderCount: 0, 
          totalSpent: 0,
          restaurant: order.restaurant
        };
      }
      acc[restaurantId].orderCount += 1;
      acc[restaurantId].totalSpent += order.totalAmount;
      return acc;
    }, {} as Record<string, any>);

    const favoriteRestaurants = Object.values(restaurantFrequency)
      .sort((a: any, b: any) => b.orderCount - a.orderCount)
      .slice(0, 10);

    // Favorite food categories
    const categoryFrequency = orders.reduce((acc, order) => {
      order.orderItems.forEach(item => {
        const category = item.menuItem.category;
        acc[category] = (acc[category] || 0) + item.quantity;
      });
      return acc;
    }, {} as Record<string, number>);

    const favoriteCategories = Object.entries(categoryFrequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([category, count]) => ({ category, orderCount: count }));

    // Order timing analysis
    const orderHours = orders.map(order => new Date(order.createdAt).getHours());
    const hourFrequency = orderHours.reduce((acc, hour) => {
      acc[hour] = (acc[hour] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    const peakOrderingHour = Object.entries(hourFrequency)
      .sort(([,a], [,b]) => b - a)[0];

    // Address usage statistics
    const addressUsage = addresses.map(address => ({
      ...address,
      orderCount: orders.filter(order => order.deliveryAddressId === address.id).length
    }));

    // Review statistics
    const averageRating = reviews.length > 0 
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
      : 0;

    const reviewsGiven = reviews.length;
    const ratingDistribution = reviews.reduce((acc, review) => {
      acc[review.rating] = (acc[review.rating] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    // Customer loyalty metrics
    const daysSinceFirstOrder = orders.length > 0 
      ? Math.floor((Date.now() - new Date(orders[orders.length - 1].createdAt).getTime()) / (1000 * 60 * 60 * 24))
      : 0;

    const daysSinceLastOrder = orders.length > 0 
      ? Math.floor((Date.now() - new Date(orders[0].createdAt).getTime()) / (1000 * 60 * 60 * 24))
      : 0;

    // Calculate customer lifetime value and activity
    const orderFrequency = totalOrders > 0 && daysSinceFirstOrder > 0 
      ? totalOrders / (daysSinceFirstOrder / 30) // orders per month
      : 0;

    const detailedStats = {
      totalOrders,
      totalSpent,
      averageOrderValue,
      highestSpent,
      lowestSpent,
      recentOrdersCount: recentOrders.length,
      orderStatusBreakdown,
      monthlySpending: Object.entries(monthlySpending)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([month, amount]) => ({ month, amount })),
      favoriteRestaurants,
      favoriteCategories,
      peakOrderingHour: peakOrderingHour ? {
        hour: parseInt(peakOrderingHour[0]),
        count: peakOrderingHour[1]
      } : null,
      addressUsage,
      averageRating,
      reviewsGiven,
      ratingDistribution,
      daysSinceFirstOrder,
      daysSinceLastOrder,
      orderFrequency,
      lastOrderDate: orders.length > 0 ? orders[0].createdAt : null,
      firstOrderDate: orders.length > 0 ? orders[orders.length - 1].createdAt : null
    };

    return NextResponse.json({
      success: true,
      data: {
        customer: {
          ...customer,
          stats: detailedStats
        }
      }
    });

  } catch (error) {
    console.error('Error fetching customer details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch customer details' },
      { status: 500 }
    );
  }
}
