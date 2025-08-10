import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET all menu items
export async function GET() {
  try {
    const menuItems = await prisma.menuItem.findMany({
      include: {
        restaurant: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    const formattedItems = menuItems.map(item => ({
      id: item.id,
      name: item.name,
      price: item.price,
      description: item.description,
      category: item.category,
      restaurant: item.restaurant?.name
    }));

    return NextResponse.json({
      success: true,
      data: formattedItems
    });

  } catch (error) {
    console.error('Error fetching menu items:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch menu items' },
      { status: 500 }
    );
  }
}

// POST new menu item
export async function POST(request: Request) {
  try {
    const { name, price, description, category, restaurantId } = await request.json();

    // For now, we'll use the first restaurant if no restaurantId is provided
    let targetRestaurantId = restaurantId;
    if (!targetRestaurantId) {
      const firstRestaurant = await prisma.restaurant.findFirst();
      if (!firstRestaurant) {
        return NextResponse.json(
          { success: false, error: 'No restaurant found' },
          { status: 400 }
        );
      }
      targetRestaurantId = firstRestaurant.id;
    }

    const menuItem = await prisma.menuItem.create({
      data: {
        name,
        price: parseFloat(price),
        description,
        category,
        restaurantId: targetRestaurantId,
        available: true
      }
    });

    return NextResponse.json({
      success: true,
      data: menuItem
    });

  } catch (error) {
    console.error('Error creating menu item:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create menu item' },
      { status: 500 }
    );
  }
}

// DELETE menu item
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Menu item ID is required' },
        { status: 400 }
      );
    }

    await prisma.menuItem.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: 'Menu item deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting menu item:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete menu item' },
      { status: 500 }
    );
  }
}
