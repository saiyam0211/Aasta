import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const data = await request.json();

    // Check if menu item exists
    const existingItem = await prisma.menuItem.findUnique({
      where: { id },
    });

    if (!existingItem) {
      return NextResponse.json({
        success: false,
        error: 'Menu item not found'
      }, { status: 404 });
    }

    // Update the menu item
    const updatedItem = await prisma.menuItem.update({
      where: { id },
      data: {
        name: data.name || existingItem.name,
        description: data.description || existingItem.description,
        price: data.price ? parseFloat(data.price) : existingItem.price,
        originalPrice: data.originalPrice ? parseFloat(data.originalPrice) : existingItem.originalPrice,
        category: data.category || existingItem.category,
        preparationTime: data.preparationTime ? parseInt(data.preparationTime) : existingItem.preparationTime,
        imageUrl: data.imageUrl !== undefined ? data.imageUrl : existingItem.imageUrl,
        dietaryTags: data.dietaryTags || existingItem.dietaryTags,
        spiceLevel: data.spiceLevel || existingItem.spiceLevel,
        available: data.available !== undefined ? data.available : existingItem.available,
        featured: data.featured !== undefined ? data.featured : existingItem.featured,
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedItem,
      message: 'Menu item updated successfully'
    });

  } catch (error) {
    console.error('Error updating menu item:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update menu item'
    }, { status: 500 });
  }
}

// DELETE - Delete menu item
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Check if menu item exists
    const existingItem = await prisma.menuItem.findUnique({
      where: { id },
    });

    if (!existingItem) {
      return NextResponse.json({
        success: false,
        error: 'Menu item not found'
      }, { status: 404 });
    }

    // Delete the menu item
    await prisma.menuItem.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Menu item deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting menu item:', error);
    return NextResponse.json({
      success: false,  
      error: 'Failed to delete menu item'
    }, { status: 500 });
  }
}
// GET - Get single menu item
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const menuItem = await prisma.menuItem.findUnique({
      where: { id },
      include: {
        restaurant: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!menuItem) {
      return NextResponse.json({
        success: false,
        error: 'Menu item not found'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        id: menuItem.id,
        name: menuItem.name,
        description: menuItem.description,
        price: menuItem.price,
        originalPrice: menuItem.originalPrice || undefined,
        category: menuItem.category,
        preparationTime: menuItem.preparationTime,
        imageUrl: menuItem.imageUrl || undefined,
        dietaryTags: menuItem.dietaryTags || [],
        spiceLevel: menuItem.spiceLevel,
        available: menuItem.available,
        featured: menuItem.featured,
        restaurantId: menuItem.restaurantId,
        restaurantName: menuItem.restaurant.name,
      },
      message: 'Menu item fetched successfully'
    });

  } catch (error) {
    console.error('Error fetching menu item:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch menu item'
    }, { status: 500 });
  }
}
