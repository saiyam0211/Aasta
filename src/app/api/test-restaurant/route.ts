import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const restaurants = await prisma.restaurant.findMany({
      select: {
        id: true,
        name: true,
        restaurantPricePercentage: true,
        aastaPricePercentage: true,
        minimumOrderAmount: true,
        averagePreparationTime: true,
        deliveryRadius: true,
      }
    });

    console.log('All restaurants with pricing fields:', restaurants);

    return NextResponse.json({
      success: true,
      count: restaurants.length,
      restaurants: restaurants
    });

  } catch (error) {
    console.error('Error fetching restaurants:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
