import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

function haversine(lat1: number, lon1: number, lat2: number, lon2: number) {
  const toRad = (v: number) => (v * Math.PI) / 180;
  const R = 6371000; // meters
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
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
    const limit = parseInt(searchParams.get('limit') || '6');
    const lat = parseFloat(searchParams.get('lat') || '0');
    const lng = parseFloat(searchParams.get('lng') || '0');
    const vegOnly = searchParams.get('veg') === '1';
    const hasCoords = !isNaN(lat) && !isNaN(lng) && (lat !== 0 || lng !== 0);

    // Get featured menu items from active restaurants
    const featuredDishes = await prisma.menuItem.findMany({
      where: {
        featured: true,
        available: true,
        restaurant: {
          status: 'ACTIVE',
        },
      },
      include: {
        restaurant: {
          select: {
            id: true,
            name: true,
            rating: true,
            averagePreparationTime: true,
            latitude: true,
            longitude: true,
          },
        },
      },
      orderBy: [{ restaurant: { rating: 'desc' } }, { createdAt: 'desc' }],
      take: limit,
    });

    // Transform data for client
    const clientFeaturedDishes = featuredDishes
      .map((dish) => {
        const tags = dish.dietaryTags || [];
        const isVegetarian = tags.includes('Veg');

      let distanceText: string | undefined;
      let distanceMeters: number | undefined;
      if (hasCoords && dish.restaurant.latitude && dish.restaurant.longitude) {
        distanceMeters = Math.round(
          haversine(
            lat,
            lng,
            dish.restaurant.latitude,
            dish.restaurant.longitude
          )
        );
        if (distanceMeters < 1000) distanceText = `${distanceMeters} m`;
        else distanceText = `${(distanceMeters / 1000).toFixed(1)} km`;
      }

      return {
        id: dish.id,
        name: dish.name,
        description: dish.description,
        image: dish.imageUrl || '/images/dish-placeholder.svg',
        price: dish.price,
        originalPrice: dish.originalPrice,
        rating: dish.restaurant.rating,
        preparationTime:
          dish.preparationTime || dish.restaurant.averagePreparationTime,
        restaurant: dish.restaurant.name,
        category: dish.category,
        isVegetarian,
        spiceLevel: dish.dietaryTags.includes('SPICY')
          ? 'spicy'
          : dish.dietaryTags.includes('MEDIUM_SPICY')
            ? 'medium'
            : 'mild',
        restaurantId: dish.restaurant.id,
        dietaryTags: dish.dietaryTags,
        distanceText,
        distanceMeters,
      };
    })
    .filter((dish) => !vegOnly || dish.isVegetarian);

    return NextResponse.json({
      success: true,
      data: clientFeaturedDishes,
      total: clientFeaturedDishes.length,
    });
  } catch (error) {
    console.error('Error fetching featured dishes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch featured dishes' },
      { status: 500 }
    );
  }
}
