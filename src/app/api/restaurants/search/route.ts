import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface SearchRequest {
  query?: string; // Restaurant name or keyword
  latitude: number;
  longitude: number;
  radius?: number; // Default 3km for proximity search
}

// Function to calculate distance between two coordinates using Haversine formula
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return distance;
}

// Helper function to check if restaurant is currently open
function isRestaurantOpen(operatingHours: any): boolean {
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentTime = currentHour * 60 + currentMinute;

  // Night delivery operates from 9 PM to 12 AM (21:00 to 00:00)
  const openTime = 21 * 60; // 9 PM in minutes
  const closeTime = 24 * 60; // 12 AM in minutes (midnight)

  // Check if current time is within operating hours
  if (currentTime >= openTime || currentTime < 60) {
    // Allow until 1 AM for late orders
    return true;
  }

  return false;
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query') || '';
    const latitude = parseFloat(searchParams.get('latitude') || '0');
    const longitude = parseFloat(searchParams.get('longitude') || '0');
    const radius = parseFloat(searchParams.get('radius') || '3'); // Default 3km

    if (!latitude || !longitude) {
      return NextResponse.json(
        { error: 'Latitude and longitude are required' },
        { status: 400 }
      );
    }

    // Enhanced search conditions - search by restaurant name OR menu items
    const searchConditions: any = {
      status: 'ACTIVE',
    };

    // If query is provided, search by restaurant name OR menu items
    if (query && query.trim().length > 0) {
      const searchTerm = query.trim();
      searchConditions.OR = [
        // Search by restaurant name
        {
          name: {
            contains: searchTerm,
            mode: 'insensitive',
          },
        },
        // Search by menu items (dishes)
        {
          menuItems: {
            some: {
              AND: [
                { available: true },
                {
                  OR: [
                    {
                      name: {
                        contains: searchTerm,
                        mode: 'insensitive',
                      },
                    },
                    {
                      description: {
                        contains: searchTerm,
                        mode: 'insensitive',
                      },
                    },
                    {
                      category: {
                        contains: searchTerm,
                        mode: 'insensitive',
                      },
                    },
                  ],
                },
              ],
            },
          },
        },
      ];
    }

    // Get restaurants from database
    const allRestaurants = await prisma.restaurant.findMany({
      where: searchConditions,
      include: {
        menuItems: {
          where: { available: true },
          select: {
            id: true,
            name: true,
            description: true,
            price: true,
            originalPrice: true,
            category: true,
            imageUrl: true,
            dietaryTags: true,
            spiceLevel: true,
            featured: true,
            preparationTime: true,
          },
        },
      },
    });

    // Filter restaurants by distance (within specified radius)
    const nearbyRestaurants = allRestaurants
      .map((restaurant) => {
        const distance = calculateDistance(
          latitude,
          longitude,
          restaurant.latitude,
          restaurant.longitude
        );

        return {
          ...restaurant,
          distance: Math.round(distance * 100) / 100, // Round to 2 decimal places
        };
      })
      .filter((restaurant) => restaurant.distance <= radius)
      .sort((a, b) => {
        // Sort by distance first, then by rating
        const distanceDiff = a.distance - b.distance;
        if (Math.abs(distanceDiff) < 0.1) {
          return b.rating - a.rating;
        }
        return distanceDiff;
      });

    // Transform data for client
    const clientRestaurants = nearbyRestaurants.map((restaurant) => ({
      id: restaurant.id,
      name: restaurant.name,
      ownerName: restaurant.ownerName,
      address: restaurant.address,
      phone: restaurant.phone,
      email: restaurant.email,
      imageUrl: restaurant.imageUrl,
      latitude: restaurant.latitude,
      longitude: restaurant.longitude,
      cuisineTypes: restaurant.cuisineTypes,
      rating: restaurant.rating,
      totalOrders: restaurant.totalOrders,
      averagePreparationTime: restaurant.averagePreparationTime,
      minimumOrderAmount: restaurant.minimumOrderAmount,
      deliveryRadius: restaurant.deliveryRadius,
      distance: restaurant.distance,
      isOpen: isRestaurantOpen(restaurant.operatingHours),
      menuItems: restaurant.menuItems.map((item) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        originalPrice: item.originalPrice,
        category: item.category,
        imageUrl: item.imageUrl,
        dietaryTags: item.dietaryTags,
        spiceLevel: item.spiceLevel,
        featured: item.featured,
        discount: item.originalPrice
          ? Math.round(
              ((item.originalPrice - item.price) / item.originalPrice) * 100
            )
          : 0,
      })),
      featuredItems: restaurant.menuItems
        .filter((item) => item.featured)
        .slice(0, 3),
    }));

    return NextResponse.json({
      success: true,
      data: {
        restaurants: clientRestaurants,
        total: clientRestaurants.length,
        query: query,
        searchLocation: { latitude, longitude },
        searchRadius: radius,
        message:
          clientRestaurants.length === 0
            ? `No restaurants found${query ? ` matching "${query}"` : ''} within ${radius}km of your location.`
            : `Found ${clientRestaurants.length} restaurant${clientRestaurants.length > 1 ? 's' : ''}${query ? ` matching "${query}"` : ''} within ${radius}km.`,
      },
    });
  } catch (error) {
    console.error('Error searching restaurants:', error);
    return NextResponse.json(
      { error: 'Failed to search restaurants' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body: SearchRequest = await request.json();
    const { query = '', latitude, longitude, radius = 3 } = body;

    if (!latitude || !longitude) {
      return NextResponse.json(
        { error: 'Latitude and longitude are required' },
        { status: 400 }
      );
    }

    // Convert to GET request params and reuse GET logic
    const searchParams = new URLSearchParams({
      query: query.toString(),
      latitude: latitude.toString(),
      longitude: longitude.toString(),
      radius: radius.toString(),
    });

    const getRequest = new NextRequest(`${request.url}?${searchParams}`, {
      method: 'GET',
      headers: Object.fromEntries(request.headers.entries()),
    });

    return await GET(getRequest);
  } catch (error) {
    console.error('Error in POST search restaurants:', error);
    return NextResponse.json(
      { error: 'Failed to search restaurants' },
      { status: 500 }
    );
  }
}
