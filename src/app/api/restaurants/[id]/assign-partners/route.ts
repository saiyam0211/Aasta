import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: restaurantId } = await params;
    const body = await request.json();
    const { deliveryPartnerIds } = body;

    if (!Array.isArray(deliveryPartnerIds)) {
      return NextResponse.json(
        { success: false, error: 'deliveryPartnerIds must be an array' },
        { status: 400 }
      );
    }

    // Verify restaurant exists
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId }
    });

    if (!restaurant) {
      return NextResponse.json(
        { success: false, error: 'Restaurant not found' },
        { status: 404 }
      );
    }

    // Update restaurant with assigned delivery partners
    const updatedRestaurant = await prisma.restaurant.update({
      where: { id: restaurantId },
      data: {
        assignedDeliveryPartners: deliveryPartnerIds
      }
    });

    // Update delivery partners to include this restaurant in their assigned list
    // First, remove this restaurant from all partners' assigned list
    await prisma.deliveryPartner.updateMany({
      where: {
        assignedRestaurants: {
          has: restaurantId
        }
      },
      data: {
        assignedRestaurants: {
          set: []
        }
      }
    });

    // Then add this restaurant to the selected partners' assigned list
    if (deliveryPartnerIds.length > 0) {
      for (const partnerId of deliveryPartnerIds) {
        const partner = await prisma.deliveryPartner.findUnique({
          where: { id: partnerId }
        });

        if (partner) {
          const updatedAssignedRestaurants = [...partner.assignedRestaurants];
          if (!updatedAssignedRestaurants.includes(restaurantId)) {
            updatedAssignedRestaurants.push(restaurantId);
          }

          await prisma.deliveryPartner.update({
            where: { id: partnerId },
            data: {
              assignedRestaurants: updatedAssignedRestaurants
            }
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: updatedRestaurant
    });
  } catch (error) {
    console.error('Error assigning delivery partners:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to assign delivery partners' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: restaurantId } = await params;

    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId },
      select: {
        id: true,
        name: true,
        assignedDeliveryPartners: true
      }
    });

    if (!restaurant) {
      return NextResponse.json(
        { success: false, error: 'Restaurant not found' },
        { status: 404 }
      );
    }

    // Get assigned delivery partners details
    const assignedPartners = await prisma.deliveryPartner.findMany({
      where: {
        id: { in: restaurant.assignedDeliveryPartners }
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        restaurant,
        assignedPartners
      }
    });
  } catch (error) {
    console.error('Error fetching assigned partners:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch assigned partners' },
      { status: 500 }
    );
  }
}
