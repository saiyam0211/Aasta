import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // First get the delivery partner record
    const deliveryPartner = await prisma.deliveryPartner.findUnique({
      where: { userId: session.user.id }
    });

    if (!deliveryPartner) {
      return NextResponse.json(
        { success: false, error: 'Delivery partner not found' },
        { status: 404 }
      );
    }

    // Get orders assigned to this delivery partner
    const orders = await prisma.order.findMany({
      where: {
        deliveryPartnerId: deliveryPartner.id,
        status: {
          in: ['CONFIRMED', 'PREPARING', 'READY_FOR_PICKUP', 'OUT_FOR_DELIVERY']
        }
      },
      include: {
        restaurant: {
          select: {
            name: true,
            address: true,
          }
        },
        deliveryAddress: {
          select: {
            street: true,
            city: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({
      success: true,
      data: orders
    });
  } catch (error) {
    console.error('Error fetching delivery partner orders:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}
