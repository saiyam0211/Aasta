import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { writeFile } from 'fs/promises';
import { join } from 'path';

// GET request to fetch menu items
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const restaurantId = searchParams.get('restaurantId');

    if (!restaurantId) {
      return NextResponse.json({ 
        success: false,
        error: 'Restaurant ID is required' 
      }, { status: 400 });
    }

    // Get menu items for the restaurant
    const menuItems = await prisma.menuItem.findMany({
      where: { restaurantId },
      orderBy: {
        name: 'asc'
      }
    });

    return NextResponse.json({ 
      success: true,
      data: menuItems,
      message: 'Menu items fetched successfully'
    });

  } catch (error) {
    console.error('Error fetching menu items:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

// POST request to create a new menu item with image upload
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const data = Object.fromEntries(formData.entries());
    const image = formData.get('image') as File | null;

    // Validate required fields
    const requiredFields = ['restaurantId', 'name', 'price', 'preparationTime', 'dietaryType'];
    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json({ 
          success: false,
          error: `Missing required field: ${field}` 
        }, { status: 400 });
      }
    }

    let imageUrl = data.imageUrl as string || null;

    if (image) {
      const bytes = await image.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Save the image to the public/uploads/menu-items directory
      const imageName = `${Date.now()}_${image.name.replace(/\s/g, '_')}`;
      const imagePath = join(process.cwd(), 'public', 'uploads', 'menu-items', imageName);
      await writeFile(imagePath, buffer);
      imageUrl = `/uploads/menu-items/${imageName}`;
    }

    // Create the menu item
    const menuItem = await prisma.menuItem.create({
      data: {
        restaurantId: data.restaurantId as string,
        name: data.name as string,
        description: data.description as string || '',
        price: parseFloat(data.price as string),
        originalPrice: data.originalPrice ? parseFloat(data.originalPrice as string) : null,
        category: 'General', // Default category since we removed it from form
        preparationTime: parseInt(data.preparationTime as string) || 15,
        dietaryTags: [data.dietaryType as string], // Store dietary type in dietaryTags for now
        imageUrl: imageUrl,
        featured: data.featured === 'true',
        stockLeft: data.stockLeft ? parseInt(data.stockLeft as string) : null,
      },
    });

    return NextResponse.json({ 
      success: true,
      data: menuItem,
      message: 'Menu item created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating menu item:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
