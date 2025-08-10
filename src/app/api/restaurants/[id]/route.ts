import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: restaurantId } = await params;

    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        menuItems: {
          select: {
            id: true,
            name: true,
            price: true,
            available: true,
            category: true,
            description: true,
          }
        },
        _count: {
          select: {
            menuItems: true,
          }
        }
      }
    });

    if (!restaurant) {
      return NextResponse.json(
        { success: false, error: 'Restaurant not found' },
        { status: 404 }
      );
    }

    // Mock some additional stats for now (replace with real data when available)
    const restaurantWithStats = {
      ...restaurant,
      totalOrders: Math.floor(Math.random() * 1000) + 100,
      totalMenuItems: restaurant._count.menuItems,
      activeMenuItems: restaurant.menuItems.filter(item => item.available).length,
    };

    return NextResponse.json({
      success: true,
      data: restaurantWithStats
    });

  } catch (error) {
    console.error('Error fetching restaurant details:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: restaurantId } = await params;
    const data = await request.json();

    console.log('Updating restaurant:', restaurantId, 'with data:', data);

    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId }
    });

    if (!restaurant) {
      return NextResponse.json(
        { success: false, error: 'Restaurant not found' },
        { status: 404 }
      );
    }

    console.log('Current restaurant data:', {
      restaurantPricePercentage: restaurant.restaurantPricePercentage,
      aastaPricePercentage: restaurant.aastaPricePercentage
    });

    // Prepare update data with proper defaults
    const updateData: any = {};
    
    if (data.status !== undefined) {
      updateData.status = data.status;
    }
    
    if (data.restaurantPricePercentage !== undefined) {
      updateData.restaurantPricePercentage = data.restaurantPricePercentage;
    }
    
    if (data.aastaPricePercentage !== undefined) {
      updateData.aastaPricePercentage = data.aastaPricePercentage;
    }
    
    if (data.minimumOrderAmount !== undefined) {
      updateData.minimumOrderAmount = data.minimumOrderAmount;
    }
    
    if (data.averagePreparationTime !== undefined) {
      updateData.averagePreparationTime = data.averagePreparationTime;
    }
    
    if (data.deliveryRadius !== undefined) {
      updateData.deliveryRadius = data.deliveryRadius;
    }

    console.log('Update data to apply:', updateData);

    // Update restaurant with only the provided fields
    const updatedRestaurant = await prisma.restaurant.update({
      where: { id: restaurantId },
      data: updateData
    });

    console.log('Restaurant updated successfully');

    return NextResponse.json({
      success: true,
      data: updatedRestaurant
    });

  } catch (error) {
    console.error('Error updating restaurant:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace'
    });
    return NextResponse.json(
      { success: false, error: `Internal server error: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}
