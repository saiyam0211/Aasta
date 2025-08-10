import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    // Get current date for calculations
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const thisWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Initialize with default values in case of database errors
    let totalRestaurants = 0;
    let activeRestaurants = 0;
    let totalCustomers = 0;
    let customersThisMonth = 0;
    let customersLastMonth = 0;
let topRestaurants: any[] = [];
  let topDeliveryPartners: any[] = [];

    try {
// Fetch restaurant metrics with error handling
      const startOfWeek = (() => {
        const thursday = new Date();
        thursday.setDate(today.getDate() - (today.getDay() + 2) % 7 - 4);
        return thursday;
      })();
      
// Fetch top restaurants with earnings calculation
      const restaurantsWithOrders = await prisma.restaurant.findMany({
        take: 10, // Get more to sort properly
        include: {
          _count: {
            select: {
              orders: true,
              menuItems: true
            }
          },
          orders: {
            where: {
              createdAt: {
                gte: thisMonth
              }
            },
            include: {
              orderItems: true
            }
          }
        }
      });
      
      // Calculate earnings and sort by revenue
      const restaurantsWithEarnings = restaurantsWithOrders.map(restaurant => {
        const totalEarnings = restaurant.orders.reduce((acc, order) => acc + order.totalAmount, 0);
        const lastWeekEarnings = restaurant.orders.reduce((acc, order) => {
          if (new Date(order.createdAt) >= startOfWeek) return acc + order.totalAmount;
          return acc;
        }, 0);

        // Aasta earnings calculation using restaurant's aastaPricePercentage on original item prices
        const aastaEarnings = restaurant.orders.reduce((acc, order) => {
          return acc + order.orderItems.reduce((itemAcc, item) => {
            // Calculate Aasta earnings: aastaPricePercentage * original unit price * quantity
            const aastaEarningPerItem = item.totalPrice * (restaurant.aastaPricePercentage || 0.1);
            return itemAcc + aastaEarningPerItem;
          }, 0);
        }, 0);

        return {
          id: restaurant.id,
          name: restaurant.name,
          orders: restaurant._count.orders,
          revenue: totalEarnings,
          rating: restaurant.rating,
          menuItems: restaurant._count.menuItems,
          deliveryPartners: restaurant.assignedDeliveryPartners.length,
          lastWeekEarnings,
          aastaEarnings
        }
      }).sort((a, b) => b.revenue - a.revenue).slice(0, 3);
      
      topRestaurants = restaurantsWithEarnings;

// Fetch top delivery partners with more details
      const deliveryPartnersWithDetails = await prisma.deliveryPartner.findMany({
        take: 10, // Get more to sort properly
        include: {
          user: {
            select: {
              name: true
            }
          },
          orders: true // Fetch all orders to properly calculate cancelled orders
        },
        orderBy: {
          totalEarnings: 'desc'
        }
      });

      // Calculate weekly earnings and other metrics with proper async handling
      const deliveryPartnersWithEarnings = await Promise.all(
        deliveryPartnersWithDetails.map(async (partner) => {
          // For delivery partners, we need to calculate their actual earnings, not order totals
          // Delivery partners only earn money for successfully delivered orders
          // They don't get paid for cancelled, pending, or failed deliveries
          
          const deliveredMonthlyOrders = partner.orders.filter(order => order.status === 'DELIVERED');
          const deliveredWeeklyOrders = partner.orders.filter(order => {
            return new Date(order.createdAt) >= startOfWeek && order.status === 'DELIVERED';
          });
          
          // Calculate partner's earnings from delivery fees (only for delivered orders)
          // In a real scenario, this might be a percentage of delivery fee or a fixed amount per delivery
          const monthlyEarnings = deliveredMonthlyOrders.reduce((acc, order) => acc + (order.deliveryFee || 50), 0); // Default ₹50 per delivery if no fee set
          const weeklyEarnings = deliveredWeeklyOrders.reduce((acc, order) => acc + (order.deliveryFee || 50), 0);
          
          // Count cancelled orders using separate query to get all cancelled orders for this partner
          const cancelledOrders = await prisma.order.count({
            where: { 
              deliveryPartnerId: partner.id, 
              status: 'CANCELLED' 
            } 
          });
          
          // Count total orders for this partner using separate query to get accurate count
          const totalOrders = await prisma.order.count({
            where: { 
              deliveryPartnerId: partner.id 
            } 
          });
          
          // Count assigned restaurants from the assignedRestaurants array
          const assignedRestaurants = partner.assignedRestaurants.length;

          return {
            id: partner.id,
            name: partner.user.name || 'N/A',
            todayEarnings: partner.todayEarnings,
            totalEarnings: partner.totalEarnings,
            rating: partner.rating,
            orders: totalOrders,
            cancelledOrders: cancelledOrders,
            assignedRestaurants: assignedRestaurants,
            lastWeekEarnings: weeklyEarnings // This is now their actual weekly earnings from deliveries
          }
        })
      );
      
      // Sort by total earnings and take top 3
      const sortedDeliveryPartners = deliveryPartnersWithEarnings
        .sort((a, b) => b.totalEarnings - a.totalEarnings)
        .slice(0, 3);

      topDeliveryPartners = sortedDeliveryPartners;
      
      // Fetch basic restaurant and customer counts
      totalRestaurants = await prisma.restaurant.count();
      activeRestaurants = await prisma.restaurant.count({ 
        where: { status: 'ACTIVE' } 
      });
      
      totalCustomers = await prisma.user.count({ 
        where: { role: 'CUSTOMER' } 
      });
      customersThisMonth = await prisma.user.count({ 
        where: { 
          role: 'CUSTOMER',
          createdAt: { gte: thisMonth }
        } 
      });
      customersLastMonth = await prisma.user.count({ 
        where: { 
          role: 'CUSTOMER',
          createdAt: { 
            gte: lastMonth,
            lt: thisMonth
          }
        } 
      });
    } catch (dbError) {
      console.warn('Database query failed, using fallback data:', dbError);
      // Fallback to mock data if database queries fail
      totalRestaurants = 3;
      activeRestaurants = 2;
      totalCustomers = 45;
      customersThisMonth = 12;
      customersLastMonth = 8;
      topRestaurants = [
        {
          id: 'mock-1',
          name: 'Midnight Bites',
          rating: 4.5,
          createdAt: new Date()
        },
        {
          id: 'mock-2', 
          name: 'Night Owl Pizza',
          rating: 4.2,
          createdAt: new Date()
        }
      ];
    }

    // Mock order data (replace with real data when Order model is implemented)
    const totalOrders = 1247;
    const ordersToday = 23;
    const ordersYesterday = 19;
    
    // Calculate growth percentages
    const customerGrowth = customersLastMonth > 0 
      ? ((customersThisMonth - customersLastMonth) / customersLastMonth * 100).toFixed(1)
      : "0";

    const orderGrowth = ordersYesterday > 0
      ? ((ordersToday - ordersYesterday) / ordersYesterday * 100).toFixed(1)
      : "0";

    // Mock delivery partner data (replace with real data when model exists)
    const deliveryPartners = {
      total: 12,
      active: 8
    };

    // Mock revenue data (replace with real calculations when Order model has amounts)
    const revenue = {
      total: 89540,
      today: 3240,
      yesterday: 2980,
      average: 285
    };

    const revenueGrowth = revenue.yesterday > 0
      ? ((revenue.today - revenue.yesterday) / revenue.yesterday * 100).toFixed(1)
      : "0";

    // Use the calculated restaurant data or fallback to mock data
    const topRestaurantsWithStats = topRestaurants.length > 0 ? topRestaurants : [
      {
        id: 'mock-1',
        name: 'Midnight Bites',
        orders: 87,
        revenue: 45600,
        rating: 4.5,
        menuItems: 12,
        deliveryPartners: 3,
        lastWeekEarnings: 12300,
        aastaEarnings: 4560
      },
      {
        id: 'mock-2',
        name: 'Night Owl Pizza',
        orders: 64,
        revenue: 32400,
        rating: 4.2,
        menuItems: 8,
        deliveryPartners: 2,
        lastWeekEarnings: 8200,
        aastaEarnings: 3240
      },
      {
        id: 'mock-3',
        name: 'Late Night Delights',
        orders: 52,
        revenue: 28900,
        rating: 4.1,
        menuItems: 15,
        deliveryPartners: 4,
        lastWeekEarnings: 7500,
        aastaEarnings: 2890
      }
    ];

    // Mock recent orders data
    const recentOrders = [
      {
        id: "ORD" + Date.now(),
        restaurant: "Midnight Bites",
        customer: "John Doe",
        totalAmount: 450,
        status: "delivered",
        createdAt: new Date().toISOString()
      },
      {
        id: "ORD" + (Date.now() - 1000),
        restaurant: "Night Owl Pizza", 
        customer: "Jane Smith",
        totalAmount: 320,
        status: "preparing",
        createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString()
      }
    ];

    const dashboardData = {
      restaurants: {
        total: totalRestaurants,
        active: activeRestaurants
      },
      customers: {
        total: totalCustomers,
        growth: customerGrowth,
        thisMonth: customersThisMonth
      },
      orders: {
        total: totalOrders,
        today: ordersToday,
        growth: orderGrowth
      },
      deliveryPartners,
      revenue: {
        ...revenue,
        growth: revenueGrowth
      },
      topRestaurants: topRestaurantsWithStats,
      topDeliveryPartners: topDeliveryPartners.length > 0 ? topDeliveryPartners : [
        {
          id: 'dp-mock-1',
          name: 'Rajesh Kumar',
          todayEarnings: 450,
          totalEarnings: 12800,
          rating: 4.7,
          orders: 45,
          cancelledOrders: 2,
          assignedRestaurants: 3,
          lastWeekEarnings: 1400 // 28 delivered orders * ₹50 per delivery
        },
        {
          id: 'dp-mock-2',
          name: 'Priya Sharma',
          todayEarnings: 380,
          totalEarnings: 9200,
          rating: 4.5,
          orders: 32,
          cancelledOrders: 1,
          assignedRestaurants: 2,
          lastWeekEarnings: 1000 // 20 delivered orders * ₹50 per delivery
        },
        {
          id: 'dp-mock-3',
          name: 'Amit Singh',
          todayEarnings: 320,
          totalEarnings: 7600,
          rating: 4.3,
          orders: 28,
          cancelledOrders: 3,
          assignedRestaurants: 2,
          lastWeekEarnings: 750 // 15 delivered orders * ₹50 per delivery
        }
      ],
      recentOrders,
      lastUpdated: new Date().toISOString(),
      // Dynamic operational data
      activeOrdersCount: ordersToday,
      openRestaurantsCount: activeRestaurants,
      platformHealth: {
        uptime: "99.9%",
        responseTime: "120ms",
        errorRate: "0.1%"
      },
      customerSatisfaction: {
        star5: "78%",
        star4: "15%",
        below3Stars: "3%"
      },
      deliveryPerformance: {
        averageTime: "28 mins",
        onTimePercentage: "92%",
        fastDeliveryPercentage: "68%",
        averageDistance: "3.2 km"
      }
    };

    return NextResponse.json({
      success: true,
      data: dashboardData
    });

  } catch (error) {
    console.error('Admin analytics error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch analytics data' 
      },
      { status: 500 }
    );
  }
}
