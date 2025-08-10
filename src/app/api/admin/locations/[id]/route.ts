import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

// GET - Fetch specific location
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Admin access required.' },
        { status: 401 }
      );
    }

    const locationId = params.id;

    const location = await prisma.location.findUnique({
      where: { id: locationId },
      include: {
        restaurants: {
          select: {
            id: true,
            name: true,
            status: true
          }
        },
        _count: {
          select: {
            restaurants: true
          }
        }
      }
    });

    if (!location) {
      return NextResponse.json(
        { success: false, error: 'Location not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      location: {
        ...location,
        restaurantCount: location._count.restaurants
      }
    });
  } catch (error) {
    console.error('Error fetching location:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch location' },
      { status: 500 }
    );
  }
}

// PUT - Update location
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Admin access required.' },
        { status: 401 }
      );
    }

    const locationId = params.id;

    const body = await req.json();
    const { name, city, state, country, isActive } = body;

    // Validate required fields
    if (!name || !city || !state || !country) {
      return NextResponse.json(
        { success: false, error: 'Name, city, state, and country are required' },
        { status: 400 }
      );
    }

    // Check if location exists
    const existingLocation = await prisma.location.findUnique({
      where: { id: locationId }
    });

    if (!existingLocation) {
      return NextResponse.json(
        { success: false, error: 'Location not found' },
        { status: 404 }
      );
    }

    // Check if another location with same name already exists (excluding current location)
    const duplicateLocation = await prisma.location.findFirst({
      where: {
        name: name.trim(),
        id: { not: locationId }
      }
    });

    if (duplicateLocation) {
      return NextResponse.json(
        { success: false, error: 'Location with this name already exists' },
        { status: 409 }
      );
    }

    const updatedLocation = await prisma.location.update({
      where: { id: locationId },
      data: {
        name: name.trim(),
        city: city.trim(),
        state: state.trim(),
        country: country.trim(),
        isActive: isActive !== undefined ? isActive : existingLocation.isActive
      }
    });

    return NextResponse.json({
      success: true,
      location: updatedLocation,
      message: 'Location updated successfully'
    });
  } catch (error) {
    console.error('Error updating location:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update location' },
      { status: 500 }
    );
  }
}

// DELETE - Delete location (soft delete by setting isActive to false)
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Admin access required.' },
        { status: 401 }
      );
    }

    const locationId = params.id;

    // Check if location exists
    const existingLocation = await prisma.location.findUnique({
      where: { id: locationId },
      include: {
        _count: {
          select: {
            restaurants: true
          }
        }
      }
    });

    if (!existingLocation) {
      return NextResponse.json(
        { success: false, error: 'Location not found' },
        { status: 404 }
      );
    }

    // Check if location has active restaurants
    const activeRestaurants = await prisma.restaurant.count({
      where: {
        locationId: locationId,
        status: 'ACTIVE'
      }
    });

    if (activeRestaurants > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Cannot delete location. ${activeRestaurants} active restaurant(s) are using this location. Please deactivate or reassign restaurants first.` 
        },
        { status: 400 }
      );
    }

    // Soft delete by setting isActive to false
    const deletedLocation = await prisma.location.update({
      where: { id: locationId },
      data: { isActive: false }
    });

    return NextResponse.json({
      success: true,
      location: deletedLocation,
      message: 'Location deactivated successfully'
    });
  } catch (error) {
    console.error('Error deleting location:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete location' },
      { status: 500 }
    );
  }
}
