import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Simple operations authentication check
function isOperationsAuthenticated(request: NextRequest) {
  // Since operations uses localStorage, we'll skip authentication for now
  // In production, you'd want to implement proper JWT or similar
  return true;
}

export async function GET(request: NextRequest) {
  try {
    if (!isOperationsAuthenticated(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all restaurants with their order count
    const restaurants = await prisma.restaurant.findMany({
      include: {
        _count: {
          select: {
            orders: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Transform the data to match the expected format
    const transformedRestaurants = restaurants.map((restaurant) => ({
      id: restaurant.id,
      name: restaurant.name,
      ownerName: restaurant.ownerName,
      address: restaurant.address,
      phone: restaurant.phone,
      email: restaurant.email,
      cuisineTypes: restaurant.cuisineTypes,
      rating: restaurant.rating,
      totalOrders: restaurant._count.orders,
      status: restaurant.status,
      minimumOrderAmount: restaurant.minimumOrderAmount,
      deliveryRadius: restaurant.deliveryRadius,
      averagePreparationTime: restaurant.averagePreparationTime,
      assignedDeliveryPartners: restaurant.assignedDeliveryPartners,
      createdAt: restaurant.createdAt.toISOString(),
      latitude: restaurant.latitude,
      longitude: restaurant.longitude,
    }));

    return NextResponse.json({
      success: true,
      data: transformedRestaurants,
    });
  } catch (error) {
    console.error('Error fetching restaurants:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!isOperationsAuthenticated(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();

    // Validate required fields
    const requiredFields = [
      'name',
      'ownerName',
      'phone',
      'address',
      'email',
      'locationId',
    ];

    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json(
          {
            success: false,
            error: `Missing required field: ${field}`,
          },
          { status: 400 }
        );
      }
    }

    // First, create a user for the restaurant owner
    const owner = await prisma.user.create({
      data: {
        email: data.email,
        name: data.ownerName,
        phone: data.phone,
        role: 'RESTAURANT_OWNER',
      },
    });

    // Create the restaurant
    const restaurant = await prisma.restaurant.create({
      data: {
        name: data.name,
        ownerName: data.ownerName,
        ownerId: owner.id,
        latitude: data.latitude || 0,
        longitude: data.longitude || 0,
        address: data.address,
        phone: data.phone,
        email: data.email,
        locationId: data.locationId,
        cuisineTypes: data.cuisineTypes || [],
        averagePreparationTime: data.averagePreparationTime || 20,
        minimumOrderAmount: data.minimumOrderAmount || 200,
        deliveryRadius: data.deliveryRadius || 5,
        operatingHours: data.operatingHours || { monday: '09:00-21:00' },
        status: data.status || 'ACTIVE',
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Restaurant created successfully',
        data: restaurant,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating restaurant:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}
