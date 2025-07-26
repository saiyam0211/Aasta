import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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
      orderBy: [
        { category: 'asc' },
        { name: 'asc' }
      ]
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

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Validate required fields
    const requiredFields = ['restaurantId', 'name', 'price', 'category'];
    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json({ 
          success: false,
          error: `Missing required field: ${field}` 
        }, { status: 400 });
      }
    }

    // Create the menu item
    const menuItem = await prisma.menuItem.create({
      data: {
        restaurantId: data.restaurantId,
        name: data.name,
        description: data.description || '',
        price: parseFloat(data.price),
        originalPrice: data.originalPrice ? parseFloat(data.originalPrice) : null,
        category: data.category,
        preparationTime: parseInt(data.preparationTime) || 15,
        imageUrl: data.imageUrl || null,
        dietaryTags: data.dietaryTags || [],
        spiceLevel: data.spiceLevel || 'Mild',
        available: data.available !== undefined ? data.available : true,
        featured: data.featured || false,
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
