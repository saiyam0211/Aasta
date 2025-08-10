import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderNumber: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { orderNumber } = await params;
    
    // First, find the customer record for this user
    const customer = await prisma.customer.findUnique({
      where: { userId: session.user.id }
    });
    
    if (!customer) {
      return NextResponse.json(
        { success: false, error: "Customer not found" },
        { status: 404 }
      );
    }
    
    // Fetch order with all related data
    const order = await prisma.order.findFirst({
      where: {
        orderNumber,
        customerId: customer.id // Use customer.id instead of session.user.id
      },
      include: {
        orderItems: {
          include: {
            menuItem: {
              select: {
                name: true,
                imageUrl: true
              }
            }
          }
        },
        restaurant: {
          select: {
            id: true,
            name: true,
            phone: true,
            address: true
          }
        },
        deliveryAddress: true
      }
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    // Transform the order data to match frontend expectations
    const transformedOrder = {
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      paymentStatus: order.paymentStatus,
      total: order.totalAmount,
      subtotal: order.subtotal,
      taxes: order.taxes,
      deliveryFee: order.deliveryFee,
      deliveryAddress: `${order.deliveryAddress.street}, ${order.deliveryAddress.city}, ${order.deliveryAddress.state} ${order.deliveryAddress.zipCode}`,
      estimatedDeliveryTime: order.estimatedDeliveryTime || new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      createdAt: order.createdAt.toISOString(),
      verificationCode: order.status === 'OUT_FOR_DELIVERY' ? order.verificationCode : undefined,
      items: order.orderItems.map(item => ({
        id: item.id,
        menuItemId: item.menuItemId,
        quantity: item.quantity,
        price: item.unitPrice,
        itemName: item.menuItem.name,
        menuItem: {
          name: item.menuItem.name,
          imageUrl: item.menuItem.imageUrl
        }
      })),
      restaurant: order.restaurant
    };

    return NextResponse.json({ 
      success: true, 
      order: transformedOrder
    });
  } catch (error) {
    console.error("Failed to fetch order:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch order" },
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
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { status } = body;
    const { orderNumber } = await params;

    // Validate status
    const validStatuses = ['PLACED', 'CONFIRMED', 'PREPARING', 'READY_FOR_PICKUP', 'OUT_FOR_DELIVERY', 'DELIVERED'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, error: "Invalid order status" },
        { status: 400 }
      );
    }

    // Check user permissions
    const order = await prisma.order.findFirst({
      where: { orderNumber },
      include: { restaurant: true }
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    // Only restaurant owners or delivery partners can update order status
    const userRole = session.user.role;
    if (userRole !== 'RESTAURANT_OWNER' && userRole !== 'DELIVERY_PARTNER' && userRole !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    // Update order status
    const updatedOrder = await prisma.order.update({
      where: { orderNumber },
      data: { 
        status,
        updatedAt: new Date()
      },
      include: {
        orderItems: {
          include: {
            menuItem: true
          }
        },
        restaurant: true
      }
    });

    return NextResponse.json({ success: true, order: updatedOrder });
  } catch (error) {
    console.error("Failed to update order:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update order" },
      { status: 500 }
    );
  }
}
