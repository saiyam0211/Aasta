import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { dietaryType, currentItemId } = await request.json();

    if (!dietaryType) {
      return NextResponse.json(
        {
          success: false,
          error: 'Dietary type is required',
        },
        { status: 400 }
      );
    }

    // Get all hack of the day items across all restaurants
    const allHackItems = await prisma.menuItem.findMany({
      where: {
        hackOfTheDay: true,
        available: true,
      },
      include: {
        restaurant: {
          select: {
            name: true,
          },
        },
      },
    });

    // Filter out current item if editing
    const filteredItems = currentItemId 
      ? allHackItems.filter(item => item.id !== currentItemId)
      : allHackItems;

    // Check dietary type limits
    const vegItems = filteredItems.filter(item => 
      item.dietaryTags?.includes('Veg') || 
      item.dietaryTags?.some(tag => tag.toLowerCase().includes('veg'))
    );

    const nonVegItems = filteredItems.filter(item => 
      !item.dietaryTags?.includes('Veg') && 
      !item.dietaryTags?.some(tag => tag.toLowerCase().includes('veg'))
    );

    let isValid = true;
    let errorMessage = '';

    if (dietaryType === 'Veg' && vegItems.length >= 1) {
      isValid = false;
      const existingVegItem = vegItems[0];
      errorMessage = `Only one vegetarian hack of the day is allowed globally. Please uncheck "${existingVegItem.name}" from ${existingVegItem.restaurant.name} first.`;
    }

    if (dietaryType === 'Non-Veg' && nonVegItems.length >= 1) {
      isValid = false;
      const existingNonVegItem = nonVegItems[0];
      errorMessage = `Only one non-vegetarian hack of the day is allowed globally. Please uncheck "${existingNonVegItem.name}" from ${existingNonVegItem.restaurant.name} first.`;
    }

    return NextResponse.json({
      success: true,
      isValid,
      errorMessage,
      currentCounts: {
        veg: vegItems.length,
        nonVeg: nonVegItems.length,
      },
    });

  } catch (error) {
    console.error('Error validating hack of the day:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to validate hack of the day',
      },
      { status: 500 }
    );
  }
}
