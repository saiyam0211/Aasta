import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { uploadBufferToS3, deleteFromS3 } from '@/lib/s3';

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
      return NextResponse.json(
        {
          success: false,
          error: 'Menu item not found',
        },
        { status: 404 }
      );
    }

    // Update only the provided fields
    const updatedItem = await prisma.menuItem.update({
      where: { id },
      data: {
        available:
          data.available !== undefined
            ? data.available
            : existingItem.available,
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedItem,
      message: 'Menu item updated successfully',
    });
  } catch (error) {
    console.error('Error updating menu item:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update menu item',
      },
      { status: 500 }
    );
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
      return NextResponse.json(
        {
          success: false,
          error: 'Menu item not found',
        },
        { status: 404 }
      );
    }

    let imageUrl = existingItem.imageUrl;

    // Handle image upload if provided
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
        // Delete old image from S3 if it exists and was stored in S3
        if (
          existingItem.imageUrl &&
          existingItem.imageUrl.includes('amazonaws.com')
        ) {
          try {
            await deleteFromS3(existingItem.imageUrl);
          } catch (error) {
            console.error(
              'Failed to delete old menu item image from S3:',
              error
            );
          }
        }
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

    // Update the menu item
    const updateData: any = {
      name: data.name ? (data.name as string) : existingItem.name,
      description: data.description
        ? (data.description as string)
        : existingItem.description,
      price: data.price
        ? parseFloat(data.price as string)
        : existingItem.price,
      originalPrice: data.originalPrice
        ? parseFloat(data.originalPrice as string)
        : existingItem.originalPrice,
      category: data.category
        ? (data.category as string)
        : existingItem.category,
      preparationTime: data.preparationTime
        ? parseInt(data.preparationTime as string)
        : existingItem.preparationTime,
      imageUrl: imageUrl,
      dietaryTags: data.dietaryType
        ? [data.dietaryType as string]
        : existingItem.dietaryTags,
      spiceLevel: data.spiceLevel
        ? (data.spiceLevel as string)
        : existingItem.spiceLevel,
      available: true, // ALWAYS keep available as true - never allow false
      featured:
        data.featured !== undefined
          ? data.featured === 'true'
          : existingItem.featured,
      stockLeft: data.stockLeft ? parseInt(data.stockLeft as string) : null,
    };

    console.log('API: Updating menu item:', {
      itemId: id,
      itemName: existingItem.name,
      receivedAvailable: data.available,
      finalAvailable: updateData.available,
      stockLeft: updateData.stockLeft,
      originalAvailable: existingItem.available
    });

    // Only add hackOfTheDay if it exists on the existing item or is being set
    if (data.hackOfTheDay !== undefined || existingItem.hackOfTheDay !== undefined) {
      const newHackStatus = data.hackOfTheDay !== undefined
        ? data.hackOfTheDay === 'true'
        : (existingItem.hackOfTheDay || false);
      
      // If setting hack of the day to true, validate global limits
      if (newHackStatus && !existingItem.hackOfTheDay) {
        // Get all current hack of the day items
        const allHackItems = await prisma.menuItem.findMany({
          where: {
            hackOfTheDay: true,
            available: true,
            id: { not: id }, // Exclude current item
          },
          include: {
            restaurant: {
              select: {
                name: true,
              },
            },
          },
        });

        // Determine dietary type of current item
        const currentItemDietaryTags = data.dietaryType 
          ? [data.dietaryType as string]
          : existingItem.dietaryTags || [];
        
        // Check if current item is vegetarian
        const isCurrentItemVeg = data.dietaryType === 'Veg' || 
          currentItemDietaryTags.includes('Veg') || 
          currentItemDietaryTags.some(tag => 
            tag.toLowerCase().includes('veg') && !tag.toLowerCase().includes('non')
          );

        console.log('Hack of the day validation:', {
          currentItemId: id,
          dietaryType: data.dietaryType,
          dietaryTags: currentItemDietaryTags,
          isCurrentItemVeg: isCurrentItemVeg,
          allHackItems: allHackItems.map(item => ({
            id: item.id,
            name: item.name,
            dietaryTags: item.dietaryTags,
            restaurant: item.restaurant.name
          }))
        });

        // Check if there's already a veg or non-veg hack item
        const existingVegItem = allHackItems.find(item => 
          item.dietaryTags?.includes('Veg') || 
          item.dietaryTags?.some(tag => 
            tag.toLowerCase().includes('veg') && !tag.toLowerCase().includes('non')
          )
        );
        
        const existingNonVegItem = allHackItems.find(item => 
          item.dietaryTags?.includes('Non-Veg') ||
          item.dietaryTags?.some(tag => 
            tag.toLowerCase().includes('non') && tag.toLowerCase().includes('veg')
          ) ||
          (!item.dietaryTags?.includes('Veg') && 
           !item.dietaryTags?.some(tag => tag.toLowerCase().includes('veg')))
        );

        if (isCurrentItemVeg && existingVegItem) {
          return NextResponse.json(
            {
              success: false,
              error: `Only one vegetarian hack of the day is allowed globally. Please uncheck "${existingVegItem.name}" from ${existingVegItem.restaurant.name} first.`,
            },
            { status: 400 }
          );
        }

        if (!isCurrentItemVeg && existingNonVegItem) {
          return NextResponse.json(
            {
              success: false,
              error: `Only one non-vegetarian hack of the day is allowed globally. Please uncheck "${existingNonVegItem.name}" from ${existingNonVegItem.restaurant.name} first.`,
            },
            { status: 400 }
          );
        }
      }
      
      updateData.hackOfTheDay = newHackStatus;
    }

    const updatedItem = await prisma.menuItem.update({
      where: { id },
      data: updateData,
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

    return NextResponse.json({
      success: true,
      data: updatedItem,
      message: 'Menu item updated successfully',
    });
  } catch (error) {
    console.error('Error updating menu item:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update menu item',
      },
      { status: 500 }
    );
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
      return NextResponse.json(
        {
          success: false,
          error: 'Menu item not found',
        },
        { status: 404 }
      );
    }

    // Delete the menu item
    await prisma.menuItem.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Menu item deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting menu item:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete menu item',
      },
      { status: 500 }
    );
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
        restaurant: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!menuItem) {
      return NextResponse.json(
        {
          success: false,
          error: 'Menu item not found',
        },
        { status: 404 }
      );
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
        hackOfTheDay: menuItem.hackOfTheDay,
        stockLeft: menuItem.stockLeft,
        restaurantId: menuItem.restaurantId,
        restaurantName: menuItem.restaurant.name,
      },
      message: 'Menu item fetched successfully',
    });
  } catch (error) {
    console.error('Error fetching menu item:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch menu item',
      },
      { status: 500 }
    );
  }
}
