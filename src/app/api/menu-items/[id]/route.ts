import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { writeFile } from 'fs/promises';
import { join } from 'path';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    // Update only the provided fields
    const updatedItem = await prisma.menuItem.update({
      where: { id },
      data: {
        available: data.available !== undefined ? data.available : existingItem.available,
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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const formData = await request.formData();
    const data = Object.fromEntries(formData.entries());
    const image = formData.get('image') as File | null;

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

    let imageUrl = existingItem.imageUrl;

    // Handle image upload if provided
    if (image) {
      const bytes = await image.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Save the image to the public/uploads/menu-items directory
      const imageName = `${Date.now()}_${image.name.replace(/\s/g, '_')}`;
      const imagePath = join(process.cwd(), 'public', 'uploads', 'menu-items', imageName);
      await writeFile(imagePath, buffer);
      imageUrl = `/uploads/menu-items/${imageName}`;
    }

    // Update the menu item
    const updatedItem = await prisma.menuItem.update({
      where: { id },
      data: {
        name: data.name ? data.name as string : existingItem.name,
        description: data.description ? data.description as string : existingItem.description,
        price: data.price ? parseFloat(data.price as string) : existingItem.price,
        originalPrice: data.originalPrice ? parseFloat(data.originalPrice as string) : existingItem.originalPrice,
        category: data.category ? data.category as string : existingItem.category,
        preparationTime: data.preparationTime ? parseInt(data.preparationTime as string) : existingItem.preparationTime,
        imageUrl: imageUrl,
        dietaryTags: data.dietaryType ? [data.dietaryType as string] : existingItem.dietaryTags,
        spiceLevel: data.spiceLevel ? data.spiceLevel as string : existingItem.spiceLevel,
        available: data.available !== undefined ? data.available === 'true' : existingItem.available,
        featured: data.featured !== undefined ? data.featured === 'true' : existingItem.featured,
        stockLeft: data.stockLeft ? parseInt(data.stockLeft as string) : null,
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

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
        stockLeft: menuItem.stockLeft,
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
