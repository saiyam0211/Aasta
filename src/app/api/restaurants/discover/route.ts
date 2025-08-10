import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { locationService } from '@/lib/location-service';
import type { RestaurantFilters } from '@/types';

interface DiscoverRequest {
  latitude: number;
  longitude: number;
  radius?: number;
  filters?: RestaurantFilters;
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

    const body: DiscoverRequest = await request.json();
    const { latitude, longitude, radius = 5, filters } = body;

    if (!latitude || !longitude) {
      return NextResponse.json(
        { error: 'Latitude and longitude are required' },
        { status: 400 }
      );
    }

    // Get restaurants from database
    console.log('🔍 Discover API - Searching for restaurants near:', { latitude, longitude, radius });
    
    const allRestaurants = await prisma.restaurant.findMany({
      where: {
        status: 'ACTIVE',
        // Remove strict lat/lng filtering - we'll filter by distance calculation instead
      },
      include: {
        menuItems: {
          where: { available: true },
          select: {
            id: true,
            name: true,
            price: true,
            category: true,
            dietaryTags: true,
          },
        },
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
    });

    console.log(`📊 Found ${allRestaurants.length} total restaurants in database`);
    
    // Calculate distances and filter by radius
    const nearbyRestaurants = allRestaurants
      .map((restaurant) => {
        const distance = locationService.calculateDistance(
          { latitude, longitude },
          { latitude: restaurant.latitude, longitude: restaurant.longitude }
        );

        console.log(`📍 Restaurant "${restaurant.name}" - Distance: ${distance.toFixed(2)}km`);

        return {
          ...restaurant,
          distance,
          estimatedDeliveryTime: null as number | null,
        };
      })
      .filter((restaurant) => {
        const isWithinRadius = restaurant.distance <= radius;
        if (!isWithinRadius) {
          console.log(`❌ "${restaurant.name}" is ${restaurant.distance.toFixed(2)}km away (outside ${radius}km radius)`);
        } else {
          console.log(`✅ "${restaurant.name}" is ${restaurant.distance.toFixed(2)}km away (within ${radius}km radius)`);
        }
        return isWithinRadius;
      });
      
    console.log(`🎯 ${nearbyRestaurants.length} restaurants found within ${radius}km radius`);

    // Apply additional filters
    let filteredRestaurants = nearbyRestaurants;

    if (filters) {
      // Filter by cuisine types
      if (filters.cuisineTypes && filters.cuisineTypes.length > 0) {
        filteredRestaurants = filteredRestaurants.filter((restaurant) =>
          restaurant.cuisineTypes.some((cuisine) =>
            filters.cuisineTypes!.includes(cuisine)
          )
        );
      }

      // Filter by rating
      if (filters.rating !== undefined) {
        filteredRestaurants = filteredRestaurants.filter(
          (restaurant) => restaurant.rating >= filters.rating!
        );
      }

      // Filter by price range (based on menu items)
      if (filters.priceRange) {
        filteredRestaurants = filteredRestaurants.filter((restaurant) => {
          const menuPrices = restaurant.menuItems.map((item) => item.price);
          if (menuPrices.length === 0) return false;
          
          const avgPrice = menuPrices.reduce((sum, price) => sum + price, 0) / menuPrices.length;
          return avgPrice >= filters.priceRange!.min && avgPrice <= filters.priceRange!.max;
        });
      }
    }

    // Calculate estimated delivery times for filtered restaurants
    const restaurantsWithETA = await Promise.all(
      filteredRestaurants.map(async (restaurant) => {
        try {
          const eta = await locationService.getETA(
            { latitude: restaurant.latitude, longitude: restaurant.longitude },
            { latitude, longitude },
            restaurant.averagePreparationTime
          );
          
          return {
            ...restaurant,
            estimatedDeliveryTime: eta,
          };
        } catch (error) {
          console.error(`Error calculating ETA for restaurant ${restaurant.id}:`, error);
          return {
            ...restaurant,
            estimatedDeliveryTime: restaurant.averagePreparationTime + 30, // Fallback
          };
        }
      })
    );

    // Filter by delivery time if specified
    if (filters?.deliveryTime) {
      filteredRestaurants = restaurantsWithETA.filter(
        (restaurant) => restaurant.estimatedDeliveryTime! <= filters.deliveryTime!
      );
    } else {
      filteredRestaurants = restaurantsWithETA;
    }

    // Sort restaurants by distance (primary) and rating (secondary)
    filteredRestaurants.sort((a, b) => {
      const distanceDiff = a.distance - b.distance;
      if (Math.abs(distanceDiff) < 0.5) {
        // If restaurants are within 500m of each other, sort by rating
        return b.rating - a.rating;
      }
      return distanceDiff;
    });

    // Transform data for client
    const clientRestaurants = filteredRestaurants.map((restaurant) => ({
      id: restaurant.id,
      name: restaurant.name,
      address: restaurant.address,
      phone: restaurant.phone,
      email: restaurant.email,
      latitude: restaurant.latitude,
      longitude: restaurant.longitude,
      cuisineTypes: restaurant.cuisineTypes,
      rating: restaurant.rating,
      averagePreparationTime: restaurant.averagePreparationTime,
      minimumOrderAmount: restaurant.minimumOrderAmount,
      deliveryRadius: restaurant.deliveryRadius,
      isOpen: isRestaurantOpen(restaurant.operatingHours),
      distance: restaurant.distance,
      estimatedDeliveryTime: restaurant.estimatedDeliveryTime,
      totalOrders: restaurant._count.orders,
      menuCategories: getMenuCategories(restaurant.menuItems),
      featuredItems: restaurant.menuItems
        .filter((item) => item.category === 'featured')
        .slice(0, 3),
    }));

    return NextResponse.json({
      success: true,
      data: {
        restaurants: clientRestaurants,
        total: clientRestaurants.length,
        searchLocation: { latitude, longitude },
        searchRadius: radius,
      },
    });

  } catch (error) {
    console.error('Error discovering restaurants:', error);
    return NextResponse.json(
      { error: 'Failed to discover restaurants' },
      { status: 500 }
    );
  }
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
  if (currentTime >= openTime || currentTime < 60) { // Allow until 1 AM for late orders
    return true;
  }

  return false;
}

// Helper function to extract unique menu categories
function getMenuCategories(menuItems: any[]): string[] {
  const categories = new Set<string>();
  menuItems.forEach((item) => {
    if (item.category) {
      categories.add(item.category);
    }
  });
  return Array.from(categories);
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const latitude = parseFloat(searchParams.get('latitude') || '0');
    const longitude = parseFloat(searchParams.get('longitude') || '0');
    const radius = parseInt(searchParams.get('radius') || '5');

    if (!latitude || !longitude) {
      return NextResponse.json(
        { error: 'Latitude and longitude are required' },
        { status: 400 }
      );
    }

    // Create a POST-like request body for reuse
    const body = {
      latitude,
      longitude,
      radius,
      filters: {
        cuisineTypes: searchParams.get('cuisines')?.split(',') || undefined,
        rating: searchParams.get('rating') ? parseFloat(searchParams.get('rating')!) : undefined,
        deliveryTime: searchParams.get('deliveryTime') ? parseInt(searchParams.get('deliveryTime')!) : undefined,
      },
    };

    // Reuse POST logic
    const postRequest = new NextRequest(request.url, {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json',
        ...Object.fromEntries(request.headers.entries()),
      },
    });

    return await POST(postRequest);

  } catch (error) {
    console.error('Error in GET discover restaurants:', error);
    return NextResponse.json(
      { error: 'Failed to discover restaurants' },
      { status: 500 }
    );
  }
}
