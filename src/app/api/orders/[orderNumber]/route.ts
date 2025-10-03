import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderNumber: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { orderNumber } = await params;

    // Fetch order with related data and the owning customer's userId for auth
    const order = await prisma.order.findFirst({
      where: { orderNumber },
      include: {
        orderItems: {
          include: {
            menuItem: {
              select: {
                name: true,
                imageUrl: true,
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
        deliveryPartner: {
          include: {
            user: { select: { name: true, phone: true } },
          },
        },
        deliveryAddress: true,
        review: { select: { id: true } },
        customer: { include: { user: { select: { id: true } } } },
      },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    // Authorization: ensure this order belongs to the signed-in user
    if (order.customer?.user?.id !== session.user.id) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Transform the order data to match frontend expectations
    // Compute savings based on original vs actual item totals
    const itemsTotalOriginal = (order as any).orderItems.reduce(
      (sum: number, item: any) => {
        const originalUnit = item.originalUnitPrice ?? item.unitPrice;
        const totalOriginal =
          item.totalOriginalPrice ?? originalUnit * item.quantity;
        return sum + Number(totalOriginal || 0);
      },
      0
    );
    const itemsTotal = (order as any).orderItems.reduce(
      (sum: number, item: any) => {
        // Try multiple ways to get the item total
        let total = 0;
        if (item.totalPrice) {
          total = Number(item.totalPrice);
        } else if (item.unitPrice && item.quantity) {
          total = Number(item.unitPrice) * Number(item.quantity);
        } else if (item.price) {
          total = Number(item.price) * Number(item.quantity);
        }

        const itemTotal = Number(total || 0);
        console.log('Item calculation:', {
          itemName: item.menuItem?.name,
          unitPrice: item.unitPrice,
          price: item.price,
          quantity: item.quantity,
          totalPrice: item.totalPrice,
          calculatedTotal: itemTotal,
        });
        return sum + itemTotal;
      },
      0
    );
    const savings = Math.max(0, Math.round(itemsTotalOriginal - itemsTotal));

    // Calculate proper totals
    const subtotal = itemsTotal;
    const taxes = (order as any).taxes || 0;
    const deliveryFee = (order as any).deliveryFee || 0;
    const total = subtotal + taxes + deliveryFee;

    console.log('Order calculation debug:', {
      orderNumber: order.orderNumber,
      itemsTotal,
      itemsTotalOriginal,
      subtotal,
      taxes,
      deliveryFee,
      total,
      totalAmount: (order as any).totalAmount,
      orderItems: (order as any).orderItems.length,
    });

    const transformedOrder = {
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      paymentStatus: order.paymentStatus,
      total: total,
      subtotal: subtotal,
      taxes: taxes,
      deliveryFee: deliveryFee,
      deliveryAddress: (order as any).deliveryAddress 
        ? `${(order as any).deliveryAddress.street}, ${(order as any).deliveryAddress.city}, ${(order as any).deliveryAddress.state} ${(order as any).deliveryAddress.zipCode}`
        : (order as any).orderType === 'PICKUP' 
          ? 'Pickup at restaurant'
          : 'Address not available',
      estimatedDeliveryTime:
        order.estimatedDeliveryTime ||
        new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      createdAt: order.createdAt.toISOString(),
      verificationCode: order.verificationCode || undefined,
      items: (order as any).orderItems.map((item: any) => {
        // Calculate item total
        let itemTotal = 0;
        if (item.totalPrice) {
          itemTotal = Number(item.totalPrice);
        } else if (item.unitPrice && item.quantity) {
          itemTotal = Number(item.unitPrice) * Number(item.quantity);
        } else if (item.price && item.quantity) {
          itemTotal = Number(item.price) * Number(item.quantity);
        }

        return {
          id: item.id,
          menuItemId: item.menuItemId,
          quantity: item.quantity,
          price: item.unitPrice || item.price || 0,
          total: itemTotal,
          itemName: item.menuItem.name,
          menuItem: {
            name: item.menuItem.name,
            imageUrl: item.menuItem.imageUrl,
          },
        };
      }),
      restaurant: (order as any).restaurant,
      deliveryPartner: (order as any).deliveryPartner
        ? {
            id: (order as any).deliveryPartner.id,
            name:
              (order as any).deliveryPartner.user?.name || 'Delivery Partner',
            phone: (order as any).deliveryPartner.user?.phone || null,
            latitude: (order as any).deliveryPartner.currentLatitude ?? null,
            longitude: (order as any).deliveryPartner.currentLongitude ?? null,
          }
        : null,
      deliveryDistance: (order as any).deliveryDistance,
      estimatedPreparationTime: (order as any).estimatedPreparationTime,
      estimatedDeliveryDuration:
        (order as any).estimatedDeliveryDuration ?? null,
      orderType: (order as any).orderType,
      savings,
      reviewSubmitted: Boolean((order as any).review),
    };

    return NextResponse.json({
      success: true,
      order: transformedOrder,
    });
  } catch (error) {
    console.error('Failed to fetch order:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch order' },
      { status: 500 }
    );
  }
}

// Generate a simple 4-digit verification code
function generateVerificationCode(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

// Update order status (for restaurant/delivery partner use)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ orderNumber: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { status } = body;
    const { orderNumber } = await params;

    // Validate status
    const validStatuses = [
      'PLACED',
      'CONFIRMED',
      'PREPARING',
      'READY_FOR_PICKUP',
      'OUT_FOR_DELIVERY',
      'DELIVERED',
    ];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Invalid order status' },
        { status: 400 }
      );
    }

    // Check user permissions
    const order = await prisma.order.findFirst({
      where: { orderNumber },
      include: { restaurant: true },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    // Only restaurant owners or delivery partners can update order status
    const userRole = session.user.role;
    if (
      userRole !== 'RESTAURANT_OWNER' &&
      userRole !== 'DELIVERY_PARTNER' &&
      userRole !== 'ADMIN'
    ) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Update order status
    const updatedOrder = await prisma.order.update({
      where: { orderNumber },
      data: {
        status,
        updatedAt: new Date(),
      },
      include: {
        orderItems: {
          include: {
            menuItem: true,
          },
        },
        restaurant: true,
      },
    });

    return NextResponse.json({ success: true, order: updatedOrder });
  } catch (error) {
    console.error('Failed to update order:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update order' },
      { status: 500 }
    );
  }
}
