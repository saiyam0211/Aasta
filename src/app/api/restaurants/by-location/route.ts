import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

// GET - Fetch restaurants by location ID
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
    const locationId = searchParams.get('locationId');
    const limit = parseInt(searchParams.get('limit') || '12');
    const vegOnly = searchParams.get('veg') === '1';

    if (!locationId) {
      return NextResponse.json(
        { error: 'Location ID is required' },
        { status: 400 }
      );
    }

    // Find the location first to get its details
    const location = await prisma.location.findUnique({
      where: { id: locationId },
    });

    if (!location) {
      return NextResponse.json(
        { error: 'Location not found' },
        { status: 404 }
      );
    }

    // Get restaurants in this location
    const restaurants = await prisma.restaurant.findMany({
      where: {
        locationId: locationId,
        status: { in: ['ACTIVE', 'INACTIVE'] as any },
        ...(vegOnly && {
          menuItems: {
            some: {
              available: true,
              dietaryTags: {
                has: 'Veg',
              },
            },
          },
        }),
      },
      include: {
        _count: {
          select: {
            orders: {
              where: {
                createdAt: {
                  gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                },
              },
            },
          },
        },
      },
      orderBy: { rating: 'desc' },
      take: limit,
    });

    // Get menu items for all restaurants
    const restaurantIds = restaurants.map((r) => r.id);
    const items = restaurantIds.length
      ? await prisma.menuItem.findMany({
          where: {
            restaurantId: { in: restaurantIds },
            available: true,
            ...(vegOnly && { dietaryTags: { has: 'Veg' } }),
          },
          select: {
            id: true,
            restaurantId: true,
            name: true,
            imageUrl: true,
            price: true,
            originalPrice: true,
            dietaryTags: true,
            featured: true,
            hackOfTheDay: true,
            preparationTime: true,
            category: true,
            spiceLevel: true,
            available: true,
            stockLeft: true,
            description: true,
          },
          orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
        })
      : [];

    // Group items per restaurant and split into buckets
    const itemsByRestaurant: Record<string, {
      featured: any[];
      hack: any[];
      nonFeatured: any[];
    }> = {};

    for (const it of items) {
      const restaurantId = it.restaurantId;
      if (!itemsByRestaurant[restaurantId]) {
        itemsByRestaurant[restaurantId] = {
          featured: [],
          hack: [],
          nonFeatured: [],
        };
      }

      if (it.featured) {
        itemsByRestaurant[restaurantId].featured.push(it);
      } else if (it.hackOfTheDay) {
        itemsByRestaurant[restaurantId].hack.push(it);
      } else {
        itemsByRestaurant[restaurantId].nonFeatured.push(it);
      }
    }

    // Transform restaurants with their items
    const restaurantsWithItems = restaurants.map((restaurant) => {
      const restaurantItems = itemsByRestaurant[restaurant.id] || {
        featured: [],
        hack: [],
        nonFeatured: [],
      };

      return {
        id: restaurant.id,
        name: restaurant.name,
        address: restaurant.address,
        image: restaurant.imageUrl,
        bannerImage: restaurant.imageUrl, // Use same image for banner
        cuisineTypes: restaurant.cuisineTypes,
        rating: restaurant.rating,
        deliveryTime: `${restaurant.averagePreparationTime}-${restaurant.averagePreparationTime + 10} min`,
        distance: 0, // No distance calculation needed for location-based filtering
        minimumOrderAmount: restaurant.minimumOrderAmount,
        isOpen: restaurant.status === 'ACTIVE',
        featuredItems: restaurantItems.featured.map((item) => ({
          id: item.id,
          name: item.name,
          image: item.imageUrl || '/images/dish-placeholder.svg',
          price: item.price,
          originalPrice: item.originalPrice,
          dietaryTags: item.dietaryTags,
          stockLeft: item.stockLeft,
                 soldOut: item.stockLeft === 0 || item.stockLeft === null,
          preparationTime: item.preparationTime,
          category: item.category,
          spiceLevel: item.spiceLevel,
          description: item.description,
        })),
        hackItems: restaurantItems.hack.map((item) => ({
          id: item.id,
          name: item.name,
          image: item.imageUrl || '/images/dish-placeholder.svg',
          price: item.price,
          originalPrice: item.originalPrice,
          dietaryTags: item.dietaryTags,
          stockLeft: item.stockLeft,
                 soldOut: item.stockLeft === 0 || item.stockLeft === null,
          preparationTime: item.preparationTime,
          category: item.category,
          spiceLevel: item.spiceLevel,
          description: item.description,
        })),
        nonFeaturedItems: restaurantItems.nonFeatured.map((item) => ({
          id: item.id,
          name: item.name,
          image: item.imageUrl || '/images/dish-placeholder.svg',
          price: item.price,
          originalPrice: item.originalPrice,
          dietaryTags: item.dietaryTags,
          stockLeft: item.stockLeft,
                 soldOut: item.stockLeft === 0 || item.stockLeft === null,
          preparationTime: item.preparationTime,
          category: item.category,
          spiceLevel: item.spiceLevel,
          description: item.description,
        })),
        orderCount: restaurant._count.orders,
      };
    });

    return NextResponse.json({
      success: true,
      data: restaurantsWithItems,
      location: {
        id: location.id,
        name: location.name,
        city: location.city,
        state: location.state,
        country: location.country,
      },
    });
  } catch (error) {
    console.error('Error fetching restaurants by location:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch restaurants' },
      { status: 500 }
    );
  }
}
