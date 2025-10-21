import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/prisma';
import { uploadBufferToS3 } from '@/lib/s3';

// GET request to fetch menu items
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const restaurantId = searchParams.get('restaurantId');
    const vegOnly = searchParams.get('veg') === '1';
    const showAll = searchParams.get('showAll') === '1'; // For restaurant operations

    if (!restaurantId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Restaurant ID is required',
        },
        { status: 400 }
      );
    }

    // Build where clause based on context
    const whereClause: any = {
      restaurantId,
      ...(vegOnly && { dietaryTags: { has: 'Veg' } }),
    };

    // Show all items regardless of stock status
    // Items with stock <= 0 will be marked as soldOut on the frontend

    // Get menu items for the restaurant
    const menuItems = await prisma.menuItem.findMany({
      where: whereClause,
      select: {
        id: true,
        restaurantId: true,
        name: true,
        description: true,
        price: true,
        originalPrice: true,
        category: true,
        preparationTime: true,
        imageUrl: true,
        dietaryTags: true,
        spiceLevel: true,
        available: true,
        featured: true,
        hackOfTheDay: true,
        createdAt: true,
        updatedAt: true,
        stockLeft: true,
        rating: true,
        ratingCount: true,
      },
      orderBy: {
        name: 'asc',
      },
    });


    // Transform menu items to include dietaryType computed from dietaryTags
    const transformedMenuItems = menuItems.map(item => {
      let dietaryType: 'Veg' | 'Non-Veg' = 'Veg'; // Default to Veg
      
      if (item.dietaryTags && item.dietaryTags.length > 0) {
        const hasVegTag = item.dietaryTags.some(tag => 
          tag.toLowerCase().includes('veg') && !tag.toLowerCase().includes('non')
        );
        const hasNonVegTag = item.dietaryTags.some(tag => 
          tag.toLowerCase().includes('non') && tag.toLowerCase().includes('veg')
        );
        
        if (hasVegTag) {
          dietaryType = 'Veg';
        } else if (hasNonVegTag) {
          dietaryType = 'Non-Veg';
        } else {
          // If no clear dietary tags, check if any tag contains 'veg'
          const isVeg = item.dietaryTags.some(tag => 
            tag.toLowerCase().includes('veg')
          );
          dietaryType = isVeg ? 'Veg' : 'Non-Veg';
        }
      }
      
      return {
        ...item,
        dietaryType
      };
    });


    return NextResponse.json({
      success: true,
      data: transformedMenuItems,
      message: 'Menu items fetched successfully',
    });
  } catch (error) {
    console.error('Error fetching menu items:', {
      error,
      restaurantId: new URL(request.url).searchParams.get('restaurantId'),
      vegOnly: new URL(request.url).searchParams.get('veg') === '1',
    });
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}

// POST request to create a new menu item with image upload
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const data = Object.fromEntries(formData.entries());
    const image = formData.get('image') as File | null;

    // Validate required fields
    const requiredFields = [
      'restaurantId',
      'name',
      'price',
      'preparationTime',
      'dietaryType',
    ];
    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json(
          {
            success: false,
            error: `Missing required field: ${field}`,
          },
          { status: 400 }
        );
      }
    }

    let imageUrl = (data.imageUrl as string) || null;

    if (image) {
      const bytes = await image.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Upload image to S3
      const uploadResult = await uploadBufferToS3(
        buffer,
        image.name,
        image.type,
        'menu-items'
      );

      if (uploadResult.success) {
        imageUrl = uploadResult.imageUrl ?? null;
      } else {
        return NextResponse.json(
          {
            success: false,
            error: uploadResult.error,
          },
          { status: 400 }
        );
      }
    }

    // Validate numeric fields
    const parsedPrice = parseFloat(data.price as string);
    if (Number.isNaN(parsedPrice)) {
      return NextResponse.json(
        { success: false, error: 'Invalid price' },
        { status: 400 }
      );
    }

    const parsedOriginalPrice = data.originalPrice
      ? parseFloat(data.originalPrice as string)
      : null;
    if (data.originalPrice && Number.isNaN(parsedOriginalPrice as number)) {
      return NextResponse.json(
        { success: false, error: 'Invalid originalPrice' },
        { status: 400 }
      );
    }

    const parsedPreparationTime = parseInt(
      (data.preparationTime as string) || '15',
      10
    );
    if (Number.isNaN(parsedPreparationTime)) {
      return NextResponse.json(
        { success: false, error: 'Invalid preparationTime' },
        { status: 400 }
      );
    }

    const parsedStockLeft = data.stockLeft
      ? parseInt(data.stockLeft as string, 10)
      : 10; // Default stock of 10 if not provided
    if (data.stockLeft && Number.isNaN(parsedStockLeft as number)) {
      return NextResponse.json(
        { success: false, error: 'Invalid stockLeft' },
        { status: 400 }
      );
    }

    // Create the menu item
    const menuItem = await prisma.menuItem.create({
      data: {
        restaurantId: data.restaurantId as string,
        name: data.name as string,
        description: (data.description as string) || '',
        price: parsedPrice,
        originalPrice: parsedOriginalPrice,
        category: 'General', // Default category since we removed it from form
        preparationTime: parsedPreparationTime,
        dietaryTags: [data.dietaryType as string], // Store dietary type in dietaryTags for now
        imageUrl: imageUrl,
        featured: data.featured === 'true',
        hackOfTheDay: data.hackOfTheDay === 'true',
        stockLeft: parsedStockLeft,
      },
      select: {
        id: true,
        restaurantId: true,
        name: true,
        description: true,
        price: true,
        originalPrice: true,
        category: true,
        preparationTime: true,
        imageUrl: true,
        dietaryTags: true,
        spiceLevel: true,
        available: true,
        featured: true,
        hackOfTheDay: true,
        createdAt: true,
        updatedAt: true,
        stockLeft: true,
        rating: true,
        ratingCount: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: menuItem,
        message: 'Menu item created successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating menu item:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}
