import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Fetch all active orders (not delivered or cancelled)
    const orders = await prisma.order.findMany({
      where: {
        status: {
          notIn: ['DELIVERED', 'CANCELLED']
        }
      },
      include: {
        restaurant: {
          select: {
            id: true,
            name: true,
            address: true,
            phone: true
          }
        },
        customer: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                phone: true,
                email: true
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
        },
        deliveryAddress: {
          select: {
            id: true,
            street: true,
            city: true,
            zipCode: true
          }
        },
        orderItems: {
          include: {
            menuItem: {
              select: {
                name: true,
                price: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Transform the data to match the expected format
    const transformedOrders = orders.map(order => ({
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      totalAmount: order.totalAmount,
      createdAt: order.createdAt.toISOString(),
      estimatedDeliveryTime: order.estimatedDeliveryTime?.toISOString() || '',
      pickupTime: order.estimatedDeliveryTime ? 
        new Date(order.estimatedDeliveryTime.getTime() - (order.estimatedPreparationTime * 60000)).toISOString() :
        new Date(order.createdAt.getTime() + (order.estimatedPreparationTime * 60000)).toISOString(),
      restaurant: order.restaurant,
      customer: {
        id: order.customer.user.id,
        name: order.customer.user.name || 'Unknown Customer',
        phone: order.customer.user.phone || '',
        email: order.customer.user.email
      },
      deliveryPartner: order.deliveryPartner ? {
        id: order.deliveryPartner.id,
        user: order.deliveryPartner.user
      } : null,
      deliveryAddress: {
        address: order.deliveryAddress.street,
        city: order.deliveryAddress.city,
        zipCode: order.deliveryAddress.zipCode
      },
      items: order.orderItems.map(item => ({
        id: item.id,
        quantity: item.quantity,
        menuItem: {
          name: item.menuItem.name,
          price: item.menuItem.price
        }
      }))
    }));

    return NextResponse.json({
      success: true,
      data: transformedOrders
    });

  } catch (error) {
    console.error('Error fetching active orders:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch active orders'
    }, { status: 500 });
  }
}
