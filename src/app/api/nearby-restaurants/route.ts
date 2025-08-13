import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { locationService } from '@/lib/location-service';

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
    const latitude = parseFloat(searchParams.get('latitude') || '0');
    const longitude = parseFloat(searchParams.get('longitude') || '0');
    const radius = parseInt(searchParams.get('radius') || '5');
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!latitude || !longitude) {
      return NextResponse.json(
        { error: 'Latitude and longitude are required' },
        { status: 400 }
      );
    }

    // Get all active restaurants
    const allRestaurants = await prisma.restaurant.findMany({
      where: {
        status: 'ACTIVE',
      },
      include: {
        _count: {
          select: {
            orders: {
              where: {
                createdAt: {
                  gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
                },
              },
            },
          },
        },
      },
      orderBy: {
        rating: 'desc',
      },
    });

    // Calculate distances and filter by radius
    const nearbyRestaurants = allRestaurants
      .map((restaurant) => {
        const distance = locationService.calculateDistance(
          { latitude, longitude },
          { latitude: restaurant.latitude, longitude: restaurant.longitude }
        );

        return {
          ...restaurant,
          distance,
        };
      })
      .filter((restaurant) => restaurant.distance <= radius)
      .slice(0, limit);

    // Fetch a list of featured/available menu items for each restaurant
    const withFeaturedItems = await Promise.all(
      nearbyRestaurants.map(async (r) => {
        const items = await prisma.menuItem.findMany({
          where: { restaurantId: r.id, available: true },
          orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
          select: { name: true, price: true, imageUrl: true },
          take: 6,
        });
        return { restaurant: r, featuredItems: items };
      })
    );

    // Transform data for client
    const clientRestaurants = withFeaturedItems.map(
      ({ restaurant, featuredItems }) => ({
        id: restaurant.id,
        name: restaurant.name,
        image: restaurant.imageUrl || '/images/restaurant-placeholder.svg',
        cuisineTypes: restaurant.cuisineTypes,
        rating: restaurant.rating,
        reviewCount: restaurant._count.orders, // Using order count as proxy for reviews
        deliveryTime: `${restaurant.averagePreparationTime + 10}-${restaurant.averagePreparationTime + 20} min`,
        deliveryFee: restaurant.minimumOrderAmount > 250 ? 0 : 25, // Free delivery for orders above ₹250
        distance: parseFloat(restaurant.distance.toFixed(1)),
        isPromoted: false, // We can add a promoted field later
        isFavorite: false, // We can check against user favorites later
        discount:
          restaurant.minimumOrderAmount > 200 ? '20% OFF' : 'Free Delivery',
        minOrderAmount: restaurant.minimumOrderAmount,
        avgCostForTwo: restaurant.minimumOrderAmount * 2, // Rough estimate
        isOpen: isRestaurantOpen(),
        featuredItems: (featuredItems || []).map((it) => ({
          name: it.name,
          price: it.price,
          image: it.imageUrl || '/images/dish-placeholder.svg',
        })),
      })
    );

    return NextResponse.json({
      success: true,
      data: clientRestaurants,
      total: clientRestaurants.length,
      searchLocation: { latitude, longitude },
      searchRadius: radius,
    });
  } catch (error) {
    console.error('Error fetching nearby restaurants:', error);
    return NextResponse.json(
      { error: 'Failed to fetch nearby restaurants' },
      { status: 500 }
    );
  }
}

// Helper function to check if restaurants are open during night delivery hours
function isRestaurantOpen(): boolean {
  const now = new Date();
  const currentHour = now.getHours();

  // Night delivery operates from 9 PM to 12 AM (21:00 to 00:00)
  return currentHour >= 21 || currentHour < 1;
}
