import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.role !== 'RESTAURANT_OWNER') {
      return NextResponse.json({ error: 'User must be a restaurant owner' }, { status: 403 });
    }

    // Check if restaurant already exists for this user
    const existingRestaurant = await prisma.restaurant.findUnique({
      where: { ownerId: user.id },
    });

    if (existingRestaurant) {
      return NextResponse.json({ error: 'Restaurant already exists for this user' }, { status: 400 });
    }

    const data = await request.json();

    // Validate required fields for simplified onboarding
    const requiredFields = ['name', 'ownerName', 'phone', 'address', 'latitude', 'longitude', 'operatingHours'];
    
    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 });
      }
    }

    // Validate coordinates are not zero
    if (data.latitude === 0 || data.longitude === 0) {
      return NextResponse.json({ error: 'Valid location coordinates are required' }, { status: 400 });
    }

    // Create the restaurant with new schema
    const restaurant = await prisma.restaurant.create({
      data: {
        name: data.name,
        ownerName: data.ownerName,
        ownerId: user.id,
        latitude: data.latitude,
        longitude: data.longitude,
        address: data.address,
        phone: data.phone,
        email: user.email,
        // Default values for admin-controlled fields
        cuisineTypes: data.cuisineTypes || [], // Empty array, admin will set later
        averagePreparationTime: 20, // Default 20 minutes (admin controlled)
        minimumOrderAmount: 200, // Default ₹200 (admin controlled)
        deliveryRadius: 5, // Default 5km (admin controlled)
        operatingHours: data.operatingHours,
        status: 'ACTIVE',
      },
    });

    return NextResponse.json({ 
      message: 'Restaurant created successfully',
      restaurant: {
        id: restaurant.id,
        name: restaurant.name,
        status: restaurant.status,
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating restaurant:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        restaurant: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ restaurant: user.restaurant });

  } catch (error) {
    console.error('Error fetching restaurant:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
