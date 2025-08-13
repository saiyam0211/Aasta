import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import {
  generateOrderNumber,
  generateVerificationCode,
} from '@/lib/order-utils';

interface CreateOrderRequest {
  restaurantId: string;
  deliveryAddressId?: string;
  deliveryAddress?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    latitude: number;
    longitude: number;
  };
  items: {
    menuItemId: string;
    quantity: number;
    customizations?: Record<string, any>;
    specialInstructions?: string;
  }[];
  paymentMethodId?: string;
  specialInstructions?: string;
  scheduledDeliveryTime?: string;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body: CreateOrderRequest = await request.json();
    const {
      restaurantId,
      deliveryAddressId,
      deliveryAddress,
      items,
      paymentMethodId,
      specialInstructions,
      scheduledDeliveryTime,
    } = body;

    // Validation
    if (!restaurantId || !items || items.length === 0) {
      return NextResponse.json(
        { error: 'Restaurant ID and items are required' },
        { status: 400 }
      );
    }

    if (!deliveryAddressId && !deliveryAddress) {
      return NextResponse.json(
        { error: 'Delivery address is required' },
        { status: 400 }
      );
    }

    // Validate restaurant exists and is active
    const restaurant = await prisma.restaurant.findFirst({
      where: {
        id: restaurantId,
        status: 'ACTIVE',
      },
    });

    if (!restaurant) {
      return NextResponse.json(
        { error: 'Restaurant not found or inactive' },
        { status: 404 }
      );
    }

    // Check if restaurant is currently operational
    const now = new Date();
    const currentHour = now.getHours();
    if (currentHour < 21 && currentHour >= 1) {
      return NextResponse.json(
        {
          error:
            'Restaurant is currently closed. Operating hours: 9 PM - 12 AM',
        },
        { status: 400 }
      );
    }

    // Validate menu items and calculate totals
    const menuItemIds = items.map((item) => item.menuItemId);
    const menuItems = await prisma.menuItem.findMany({
      where: {
        id: { in: menuItemIds },
        restaurantId: restaurantId,
        available: true,
      },
    });

    if (menuItems.length !== items.length) {
      return NextResponse.json(
        { error: 'Some menu items are not available' },
        { status: 400 }
      );
    }

    // Calculate order totals
    let subtotal = 0;
    const orderItems = items.map((item) => {
      const menuItem = menuItems.find((mi) => mi.id === item.menuItemId);
      if (!menuItem) {
        throw new Error(`Menu item ${item.menuItemId} not found`);
      }

      const itemTotal = menuItem.price * item.quantity;
      subtotal += itemTotal;

      return {
        menuItemId: item.menuItemId,
        quantity: item.quantity,
        unitPrice: menuItem.price,
        totalPrice: itemTotal,
        customizations: item.customizations || {},
        specialInstructions: item.specialInstructions,
      };
    });

    // Check minimum order amount
    if (subtotal < restaurant.minimumOrderAmount) {
      return NextResponse.json(
        { error: `Minimum order amount is ₹${restaurant.minimumOrderAmount}` },
        { status: 400 }
      );
    }

    // Calculate fees and taxes
    const deliveryFee = 25; // Base delivery fee
    const platformFee = Math.round(subtotal * 0.02); // 2% platform fee
    const gst = Math.round((subtotal + deliveryFee + platformFee) * 0.05); // 5% GST
    const totalAmount = subtotal + deliveryFee + platformFee + gst;

    // Handle delivery address
    let finalDeliveryAddressId = deliveryAddressId;
    if (!deliveryAddressId && deliveryAddress) {
      // First find or create the customer record
      let customer = await prisma.customer.findUnique({
        where: { userId: session.user.id },
      });

      if (!customer) {
        customer = await prisma.customer.create({
          data: {
            userId: session.user.id,
            favoriteRestaurants: [],
          },
        });
      }

      const newAddress = await prisma.address.create({
        data: {
          ...deliveryAddress,
          customerId: customer.id,
          type: 'OTHER',
        },
      });
      finalDeliveryAddressId = newAddress.id;
    }

    // Generate order number and verification code
    const orderNumber = generateOrderNumber();
    const verificationCode = generateVerificationCode();

    // Find or create customer for order
    let customer = await prisma.customer.findUnique({
      where: { userId: session.user.id },
    });

    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          userId: session.user.id,
          favoriteRestaurants: [],
        },
      });
    }

    // Create order with transaction
    const order = await prisma.$transaction(async (tx) => {
      // Create the order
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          customerId: customer.id,
          restaurantId,
          deliveryAddressId: finalDeliveryAddressId!,
          status: 'PLACED',
          subtotal,
          deliveryFee,
          taxes: gst,
          totalAmount,
          paymentStatus: 'pending',
          estimatedPreparationTime: restaurant.averagePreparationTime,
          specialInstructions,
          verificationCode,
          estimatedDeliveryTime: new Date(
            Date.now() + (restaurant.averagePreparationTime + 30) * 60000
          ), // Add 30 min buffer
        },
      });

      // Create order items
      await tx.orderItem.createMany({
        data: orderItems.map((item) => ({
          orderId: newOrder.id,
          menuItemId: item.menuItemId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
          customizations: item.customizations,
        })),
      });

      // Update restaurant statistics
      await tx.restaurant.update({
        where: { id: restaurantId },
        data: {
          totalOrders: { increment: 1 },
        },
      });

      return newOrder;
    });

    // Fetch complete order data for response
    const completeOrder = await prisma.order.findUnique({
      where: { id: order.id },
      include: {
        restaurant: {
          select: {
            id: true,
            name: true,
            phone: true,
            address: true,
          },
        },
        deliveryAddress: true,
        orderItems: {
          include: {
            menuItem: {
              select: {
                id: true,
                name: true,
                description: true,
                imageUrl: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          order: completeOrder,
          message: 'Order created successfully',
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const restaurantId = searchParams.get('restaurantId');

    const skip = (page - 1) * limit;

    // Build where clause based on user role
    let where: any = {};

    if (session.user.role === 'CUSTOMER') {
      // For customers, find their customer record first
      const customer = await prisma.customer.findUnique({
        where: { userId: session.user.id },
      });

      if (!customer) {
        return NextResponse.json({
          success: true,
          data: {
            orders: [],
            pagination: {
              page: 1,
              limit: 10,
              total: 0,
              totalPages: 0,
              hasNext: false,
              hasPrev: false,
            },
          },
        });
      }

      where.customerId = customer.id;
    } else if (session.user.role === 'RESTAURANT_OWNER') {
      // Find restaurant for this user
      const restaurant = await prisma.restaurant.findFirst({
        where: { ownerId: session.user.id },
      });

      if (!restaurant) {
        return NextResponse.json(
          { error: 'Restaurant not found' },
          { status: 404 }
        );
      }

      where.restaurantId = restaurant.id;
    } else if (session.user.role === 'DELIVERY_PARTNER') {
      // Find delivery partner for this user
      const deliveryPartner = await prisma.deliveryPartner.findUnique({
        where: { userId: session.user.id },
      });

      if (!deliveryPartner) {
        return NextResponse.json(
          { error: 'Delivery partner not found' },
          { status: 404 }
        );
      }

      // Delivery partners can see orders assigned to them
      where.deliveryPartnerId = deliveryPartner.id;
    } else if (session.user.role === 'ADMIN') {
      // Admin can see all orders
      if (restaurantId) {
        where.restaurantId = restaurantId;
      }
    } else {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    if (status) {
      where.status = status;
    }

    const [orders, totalCount] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          customer: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  phone: true,
                },
              },
            },
          },
          restaurant: {
            select: {
              id: true,
              name: true,
              phone: true,
              address: true,
            },
          },
          deliveryAddress: true,
          orderItems: {
            include: {
              menuItem: {
                select: {
                  id: true,
                  name: true,
                  description: true,
                  imageUrl: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.order.count({ where }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      success: true,
      data: {
        orders,
        pagination: {
          page,
          limit,
          total: totalCount,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}
