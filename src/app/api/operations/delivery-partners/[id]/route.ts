import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Simple operations authentication check
function isOperationsAuthenticated(request: NextRequest) {
  // Since operations uses localStorage, we'll skip authentication for now
  // In production, you'd want to implement proper JWT or similar
  return true;
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    if (!isOperationsAuthenticated(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    const data = await request.json();

    // Validate the partner exists
    const existingPartner = await prisma.deliveryPartner.findUnique({
      where: { id },
      include: {
        user: true,
      },
    });

    if (!existingPartner) {
      return NextResponse.json(
        {
          success: false,
          error: 'Delivery partner not found',
        },
        { status: 404 }
      );
    }

    // If assignedRestaurants is being updated, we need to maintain bidirectional relationship
    if (data.assignedRestaurants) {
      // Get current assigned restaurants to know what changed
      const currentAssignedRestaurants = existingPartner.assignedRestaurants;
      const newAssignedRestaurants = data.assignedRestaurants;

      // Find restaurants to remove and add
      const restaurantsToRemove = currentAssignedRestaurants.filter(
        (r: string) => !newAssignedRestaurants.includes(r)
      );
      const restaurantsToAdd = newAssignedRestaurants.filter(
        (r: string) => !currentAssignedRestaurants.includes(r)
      );

      // Remove this partner from restaurants that are no longer assigned
      for (const restaurantId of restaurantsToRemove) {
        const restaurant = await prisma.restaurant.findUnique({
          where: { id: restaurantId },
        });

        if (restaurant) {
          const updatedPartners = restaurant.assignedDeliveryPartners.filter(
            (p) => p !== id
          );
          await prisma.restaurant.update({
            where: { id: restaurantId },
            data: {
              assignedDeliveryPartners: updatedPartners,
            },
          });
        }
      }

      // Add this partner to newly assigned restaurants
      for (const restaurantId of restaurantsToAdd) {
        const restaurant = await prisma.restaurant.findUnique({
          where: { id: restaurantId },
        });

        if (restaurant) {
          const updatedPartners = [...restaurant.assignedDeliveryPartners];
          if (!updatedPartners.includes(id)) {
            updatedPartners.push(id);
          }
          await prisma.restaurant.update({
            where: { id: restaurantId },
            data: {
              assignedDeliveryPartners: updatedPartners,
            },
          });
        }
      }
    }

    // Update the delivery partner
    const updatedPartner = await prisma.deliveryPartner.update({
      where: { id },
      data: {
        telegramPhone: data.telegramPhone,
        assignedRestaurants: data.assignedRestaurants,
        // Add other fields that might be updated
        ...(data.status && { status: data.status }),
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Delivery partner updated successfully',
      data: updatedPartner,
    });
  } catch (error) {
    console.error('Error updating delivery partner:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    if (!isOperationsAuthenticated(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;

    const partner = await prisma.deliveryPartner.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    if (!partner) {
      return NextResponse.json(
        {
          success: false,
          error: 'Delivery partner not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: partner,
    });
  } catch (error) {
    console.error('Error fetching delivery partner:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}
