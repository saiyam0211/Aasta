import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { canUpdateOrderStatus, ORDER_STATUSES, type OrderStatus } from '@/lib/order-utils';

interface UpdateStatusRequest {
  status: OrderStatus;
  notes?: string;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { orderId } = params;
    const body: UpdateStatusRequest = await request.json();
    const { status, notes } = body;

    if (!status) {
      return NextResponse.json(
        { error: 'Status is required' },
        { status: 400 }
      );
    }

    // Find the order
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        restaurant: true
      }
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Check permissions
    const isCustomer = session.user.role === 'CUSTOMER' && session.user.id === order.customerId;
    const isRestaurantOwner = session.user.role === 'RESTAURANT' && session.user.id === order.restaurant.ownerId;
    const isAdmin = session.user.role === 'ADMIN';
    const isDeliveryPartner = session.user.role === 'DELIVERY_PARTNER';

    if (!isCustomer && !isRestaurantOwner && !isAdmin && !isDeliveryPartner) {
      return NextResponse.json(
        { error: 'Unauthorized to update this order' },
        { status: 403 }
      );
    }

    // Check role-based status update permissions
    if (isCustomer && status !== ORDER_STATUSES.CANCELLED) {
      return NextResponse.json(
        { error: 'Customers can only cancel orders' },
        { status: 403 }
      );
    }

    if (isRestaurantOwner && ![
      ORDER_STATUSES.CONFIRMED,
      ORDER_STATUSES.PREPARING,
      ORDER_STATUSES.READY,
      ORDER_STATUSES.CANCELLED
    ].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status for restaurant' },
        { status: 403 }
      );
    }

    if (isDeliveryPartner && ![
      ORDER_STATUSES.PICKED_UP,
      ORDER_STATUSES.OUT_FOR_DELIVERY,
      ORDER_STATUSES.DELIVERED
    ].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status for delivery partner' },
        { status: 403 }
      );
    }

    // Validate status transition
    if (!canUpdateOrderStatus(order.status as OrderStatus, status)) {
      return NextResponse.json(
        { error: `Cannot update from ${order.status} to ${status}` },
        { status: 400 }
      );
    }

    // Additional validation for cancellation
    if (status === ORDER_STATUSES.CANCELLED) {
      if (![ORDER_STATUSES.PENDING, ORDER_STATUSES.CONFIRMED].includes(order.status as OrderStatus)) {
        return NextResponse.json(
          { error: 'Order cannot be cancelled at this stage' },
          { status: 400 }
        );
      }
    }

    // Update order status
    const updatedOrder = await prisma.$transaction(async (tx) => {
      const updated = await tx.order.update({
        where: { id: orderId },
        data: {
          status,
          ...(status === ORDER_STATUSES.DELIVERED && {
            deliveredAt: new Date()
          }),
          ...(status === ORDER_STATUSES.CANCELLED && {
            cancelledAt: new Date(),
            cancelReason: notes
          })
        },
        include: {
          customer: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true
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
          deliveryAddress: true,
          orderItems: {
            include: {
              menuItem: {
                select: {
                  id: true,
                  name: true,
                  description: true,
                  imageUrl: true
                }
              }
            }
          }
        }
      });

      // Create status history entry
      await tx.orderStatusHistory.create({
        data: {
          orderId,
          status,
          updatedBy: session.user.id,
          notes,
          timestamp: new Date()
        }
      });

      return updated;
    });

    // TODO: Send notifications to relevant parties
    // - Customer notification for status updates
    // - Restaurant notification for new orders
    // - Delivery partner notification for pickup ready

    return NextResponse.json({
      success: true,
      data: {
        order: updatedOrder,
        message: 'Order status updated successfully'
      }
    });

  } catch (error) {
    console.error('Error updating order status:', error);
    return NextResponse.json(
      { error: 'Failed to update order status' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { orderId } = params;

    // Get order status history
    const statusHistory = await prisma.orderStatusHistory.findMany({
      where: { orderId },
      include: {
        updatedByUser: {
          select: {
            id: true,
            name: true,
            role: true
          }
        }
      },
      orderBy: { timestamp: 'asc' }
    });

    return NextResponse.json({
      success: true,
      data: {
        statusHistory
      }
    });

  } catch (error) {
    console.error('Error fetching order status history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch order status history' },
      { status: 500 }
    );
  }
}
