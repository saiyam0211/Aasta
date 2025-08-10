import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

// GET - Fetch all locations
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Admin access required.' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const includeInactive = searchParams.get('includeInactive') === 'true';

    const locations = await prisma.location.findMany({
      where: includeInactive ? {} : { isActive: true },
      include: {
        _count: {
          select: {
            restaurants: true
          }
        }
      },
      orderBy: [
        { isActive: 'desc' },
        { name: 'asc' }
      ]
    });

    return NextResponse.json({
      success: true,
      locations: locations.map(location => ({
        ...location,
        restaurantCount: location._count.restaurants
      }))
    });
  } catch (error) {
    console.error('Error fetching locations:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch locations' },
      { status: 500 }
    );
  }
}

// POST - Create new location
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Admin access required.' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { name, city, state, country } = body;

    // Validate required fields
    if (!name || !city || !state || !country) {
      return NextResponse.json(
        { success: false, error: 'Name, city, state, and country are required' },
        { status: 400 }
      );
    }

    // Check if location with same name already exists
    const existingLocation = await prisma.location.findUnique({
      where: { name: name.trim() }
    });

    if (existingLocation) {
      return NextResponse.json(
        { success: false, error: 'Location with this name already exists' },
        { status: 409 }
      );
    }

    const location = await prisma.location.create({
      data: {
        name: name.trim(),
        city: city.trim(),
        state: state.trim(),
        country: country.trim(),
        isActive: true
      }
    });

    return NextResponse.json({
      success: true,
      location,
      message: 'Location created successfully'
    });
  } catch (error) {
    console.error('Error creating location:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create location' },
      { status: 500 }
    );
  }
}
