import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { locationService } from '@/lib/location-service';

export const revalidate = 0; // always dynamic
export const dynamic = 'force-dynamic';

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
    const radius = parseInt(
      searchParams.get('radius') || process.env.RADIUS_KM || '5'
    );
    const limit = parseInt(searchParams.get('limit') || '12');
    const vegOnly = searchParams.get('veg') === '1';

    if (!latitude || !longitude) {
      return NextResponse.json(
        { error: 'Latitude and longitude are required' },
        { status: 400 }
      );
    }

    // Calculate a quick bounding box to reduce DB candidates
    const latDelta = radius / 111; // ~111km per degree latitude
    const lonDelta = radius / (111 * Math.cos((latitude * Math.PI) / 180) || 1);

    // Pre-filter restaurants by status and bounding box; include INACTIVE so we can show closed
    const candidateRestaurants = await prisma.restaurant.findMany({
      where: {
        status: { in: ['ACTIVE', 'INACTIVE'] as any },
        latitude: { gte: latitude - latDelta, lte: latitude + latDelta },
        longitude: { gte: longitude - lonDelta, lte: longitude + lonDelta },
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
      take: Math.max(limit * 4, 50), // overfetch a bit before precise distance filter
    });

    // Compute precise distances and apply radius filter
    const withinRadius = candidateRestaurants
      .map((restaurant) => {
        const distance = locationService.calculateDistance(
          { latitude, longitude },
          { latitude: restaurant.latitude, longitude: restaurant.longitude }
        );
        return { ...restaurant, distance };
      })
      .filter((r) => r.distance <= radius)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, limit);

    const restaurantIds = withinRadius.map((r) => r.id);

    // Batch fetch menu items for all restaurants in range (show all items, let frontend handle out of stock overlay)
    const items = restaurantIds.length
      ? await prisma.menuItem.findMany({
          where: {
            restaurantId: { in: restaurantIds },
            available: true,
            // Remove stockLeft filter to show all items including out of stock
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
      const key = it.restaurantId;
      if (!itemsByRestaurant[key]) {
        itemsByRestaurant[key] = { featured: [], hack: [], nonFeatured: [] };
      }
      // Prioritize hackOfTheDay bucket if true (even if also featured)
      if ((it as any).hackOfTheDay) {
        itemsByRestaurant[key].hack.push(it);
      } else if (it.featured) {
        itemsByRestaurant[key].featured.push(it);
      } else {
        itemsByRestaurant[key].nonFeatured.push(it);
      }
    }

    // If vegOnly: drop restaurants with zero items
    const filteredWithinRadius = vegOnly
      ? withinRadius.filter((r) => {
          const buckets = itemsByRestaurant[r.id] || {
            featured: [],
            hack: [],
            nonFeatured: [],
          };
          return (
            buckets.featured.length +
              buckets.hack.length +
              buckets.nonFeatured.length >
            0
          );
        })
      : withinRadius;

    // Transform for client, capping per-bucket sizes
    const clientRestaurants = filteredWithinRadius.map((restaurant) => {
      const buckets = itemsByRestaurant[restaurant.id] || {
        featured: [],
        hack: [],
        nonFeatured: [],
      };
      const mapItem = (it: any) => {
        const rawTags: string[] = Array.isArray(it.dietaryTags)
          ? it.dietaryTags
          : [];
        const lower = rawTags.map((t) => String(t).toLowerCase());
        // Detect explicit veg (avoid matching inside "non-veg")
        const hasVeg = lower.some((t) =>
          /(\bveg\b|vegetarian|vegan)/i.test(t) && !/(non[-\s]?veg)/i.test(t)
        );
        // Detect explicit non-veg only (non-veg/non veg/nonveg)
        const hasNonVeg = lower.some((t) => /(non[-\s]?veg)/i.test(t));
        const normalized = new Set<string>(rawTags);
        if (hasVeg) normalized.add('Veg');
        if (hasNonVeg) normalized.add('Non-Veg');
        return {
          id: it.id,
          name: it.name,
          price: it.price,
          originalPrice: it.originalPrice ?? undefined,
          image: it.imageUrl || '/images/dish-placeholder.svg',
          stockLeft: it.stockLeft ?? null,
          dietaryTags: Array.from(normalized),
          preparationTime: it.preparationTime ?? 15,
          category: it.category || '',
          spiceLevel: it.spiceLevel || 'mild',
          restaurantId: it.restaurantId,
          soldOut:
            it.available === false ||
            (typeof it.stockLeft === 'number' && it.stockLeft <= 0) ||
            (it.stockLeft === null) ||
            String(restaurant.status || '').toUpperCase() !== 'ACTIVE',
        };
      };

      return {
        id: restaurant.id,
        name: restaurant.name,
        image: restaurant.imageUrl || '/images/restaurant-placeholder.svg',
        cuisineTypes: restaurant.cuisineTypes,
        rating: restaurant.rating,
        reviewCount: restaurant._count.orders,
        deliveryTime: `${restaurant.averagePreparationTime + 10}-${
          restaurant.averagePreparationTime + 20
        } min`,
        deliveryFee: restaurant.minimumOrderAmount > 250 ? 0 : 25,
        distance: parseFloat(restaurant.distance.toFixed(1)),
        status: restaurant.status,
        isOpen: String(restaurant.status || '').toUpperCase() === 'ACTIVE',
        minOrderAmount: restaurant.minimumOrderAmount,
        avgCostForTwo: restaurant.minimumOrderAmount * 2,
        // Ensure we surface hack items prominently - limit to 2 items globally
        hackItems: (buckets.hack || []).slice(0, 2).map(mapItem),
        featuredItems: (buckets.featured || []).slice(0, 6).map(mapItem),
        nonFeaturedItems: (buckets.nonFeatured || [])
          .slice(0, 24)
          .map(mapItem),
      };
    });

    const res = NextResponse.json({
      success: true,
      data: clientRestaurants,
      total: clientRestaurants.length,
      searchLocation: { latitude, longitude },
      searchRadius: radius,
    });
    res.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    return res;
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
