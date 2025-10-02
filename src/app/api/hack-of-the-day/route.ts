import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const latitude = searchParams.get('lat');
    const longitude = searchParams.get('lng');
    const radius = parseInt(searchParams.get('radius') || '5');
    const vegOnly = searchParams.get('veg') === '1';

    if (!latitude || !longitude) {
      return NextResponse.json(
        {
          success: false,
          error: 'Latitude and longitude are required',
        },
        { status: 400 }
      );
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    // Get hack of the day items from all restaurants for now (simplified)
    const hackItems = await prisma.menuItem.findMany({
      where: {
        hackOfTheDay: true,
        available: true,
        restaurant: {
          status: 'ACTIVE',
        },
      },
      include: {
        restaurant: {
          include: {
            location: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Helper function to determine if item is vegetarian
    const checkIfVegetarian = (item: any) => {
      return item.dietaryTags?.includes('Veg') || 
             item.dietaryTags?.some((tag: string) => tag.toLowerCase() === 'veg');
    };

    console.log('Found hack items:', hackItems.length);
    hackItems.forEach(item => {
      console.log(`Item: ${item.name}, dietaryTags: ${JSON.stringify(item.dietaryTags)}, isVeg: ${checkIfVegetarian(item)}`);
    });

    // Filter veg items if vegOnly is true
    let filteredItems = hackItems;
    if (vegOnly) {
      filteredItems = hackItems.filter(item => 
        item.dietaryTags?.includes('Veg') || 
        item.dietaryTags?.some(tag => tag.toLowerCase().includes('veg'))
      );
    }

    // Ensure we have at most 2 items (1 veg, 1 non-veg) with proper ordering
    const vegItem = filteredItems.find(item => checkIfVegetarian(item));
    const nonVegItem = filteredItems.find(item => !checkIfVegetarian(item));

    const finalItems = [];
    // Always show veg item first if available
    if (vegItem) finalItems.push(vegItem);
    // Show non-veg item second if available and not veg-only mode
    if (nonVegItem && !vegOnly) finalItems.push(nonVegItem);

    // Transform to match the expected format
    const transformedItems = finalItems.map(item => {
      let distanceText = 'Near you';
      
      // Only calculate distance if location data exists
      if (item.restaurant.latitude && item.restaurant.longitude) {
        try {
          distanceText = calculateDistance(
            lat, 
            lng, 
            item.restaurant.latitude, 
            item.restaurant.longitude
          );
        } catch (error) {
          console.error('Error calculating distance:', error);
          distanceText = 'Near you';
        }
      }

      return {
        id: item.id,
        name: item.name,
        image: item.imageUrl || '/images/dish-placeholder.svg',
        price: item.price,
        originalPrice: item.originalPrice,
        preparationTime: item.preparationTime,
        servingSize: 'Serves 1', // Default serving size
        isVegetarian: checkIfVegetarian(item),
        restaurant: item.restaurant.name,
        restaurantId: item.restaurantId,
        stockLeft: item.stockLeft ?? null,
        description: item.description,
        distanceText: distanceText,
      };
    });

    return NextResponse.json({
      success: true,
      data: transformedItems,
      message: 'Hack of the day items fetched successfully',
    });
  } catch (error) {
    console.error('Error fetching hack of the day items:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// Helper function to calculate distance between two points
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): string {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;

  if (distance < 1) {
    return `${Math.round(distance * 1000)}m`;
  } else {
    return `${distance.toFixed(1)}km`;
  }
}
