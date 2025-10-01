import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { uploadBufferToS3 } from '@/lib/s3';

// GET request to fetch menu items
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const restaurantId = searchParams.get('restaurantId');
    const vegOnly = searchParams.get('veg') === '1';

    if (!restaurantId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Restaurant ID is required',
        },
        { status: 400 }
      );
    }

    // Get menu items for the restaurant (only available items)
    const menuItems = await prisma.menuItem.findMany({
      where: {
        restaurantId,
        available: true,
        ...(vegOnly && { dietaryTags: { has: 'Veg' } }),
      },
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json({
      success: true,
      data: menuItems,
      message: 'Menu items fetched successfully',
    });
  } catch (error) {
    console.error('Error fetching menu items:', error);
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

    // Create the menu item
    const menuItem = await prisma.menuItem.create({
      data: {
        restaurantId: data.restaurantId as string,
        name: data.name as string,
        description: (data.description as string) || '',
        price: parseFloat(data.price as string),
        originalPrice: data.originalPrice
          ? parseFloat(data.originalPrice as string)
          : null,
        category: 'General', // Default category since we removed it from form
        preparationTime: parseInt(data.preparationTime as string) || 15,
        dietaryTags: [data.dietaryType as string], // Store dietary type in dietaryTags for now
        imageUrl: imageUrl,
        featured: data.featured === 'true',
        hackOfTheDay: data.hackOfTheDay === 'true',
        stockLeft: data.stockLeft ? parseInt(data.stockLeft as string) : null,
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
