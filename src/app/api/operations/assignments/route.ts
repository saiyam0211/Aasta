import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Fetch all orders that have been assigned to delivery partners (not delivered or cancelled)
    const assignments = await prisma.order.findMany({
      where: {
        deliveryPartnerId: {
          not: null,
        },
        status: {
          notIn: ['DELIVERED', 'CANCELLED'],
        },
      },
      include: {
        deliveryPartner: {
          include: {
            user: {
              select: {
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
            address: true,
            phone: true,
          },
        },
        customer: {
          include: {
            user: {
              select: {
                name: true,
                phone: true,
              },
            },
          },
        },
        deliveryAddress: {
          select: {
            street: true,
            city: true,
            zipCode: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    // Transform the data to match the expected Assignment interface format
    const transformedAssignments = assignments.map((order) => ({
      id: order.id, // Using order ID as assignment ID since there's no separate assignment model
      deliveryPartnerId: order.deliveryPartnerId!,
      orderId: order.id,
      assignedAt: order.updatedAt.toISOString(), // Using updated time as assigned time
      status: getAssignmentStatus(order.status),
      deliveryPartner: {
        id: order.deliveryPartner!.id,
        userId: order.deliveryPartner!.userId,
        user: {
          name: order.deliveryPartner!.user.name || 'Unknown Partner',
          email: order.deliveryPartner!.user.email,
          phone: order.deliveryPartner!.user.phone || '',
        },
        status: order.deliveryPartner!.status,
        currentLatitude: order.deliveryPartner!.currentLatitude,
        currentLongitude: order.deliveryPartner!.currentLongitude,
      },
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        totalAmount: order.totalAmount,
        estimatedDeliveryTime: order.estimatedDeliveryTime?.toISOString() || '',
        pickupTime: order.estimatedDeliveryTime
          ? new Date(
              order.estimatedDeliveryTime.getTime() -
                order.estimatedPreparationTime * 60000
            ).toISOString()
          : new Date(
              order.createdAt.getTime() + order.estimatedPreparationTime * 60000
            ).toISOString(),
        restaurant: order.restaurant,
        customer: {
          name: order.customer.user.name || 'Unknown Customer',
          phone: order.customer.user.phone || '',
        },
        deliveryAddress: {
          address: order.deliveryAddress.street,
          city: order.deliveryAddress.city,
          zipCode: order.deliveryAddress.zipCode,
        },
      },
    }));

    return NextResponse.json({
      success: true,
      data: transformedAssignments,
    });
  } catch (error) {
    console.error('Error fetching assignments:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch assignments',
      },
      { status: 500 }
    );
  }
}

// Helper function to map order status to assignment status
function getAssignmentStatus(
  orderStatus: string
): 'ASSIGNED' | 'PICKED_UP' | 'DELIVERED' {
  switch (orderStatus) {
    case 'OUT_FOR_DELIVERY':
      return 'PICKED_UP';
    case 'DELIVERED':
      return 'DELIVERED';
    case 'READY_FOR_PICKUP':
    case 'CONFIRMED':
    case 'PREPARING':
    default:
      return 'ASSIGNED';
  }
}
