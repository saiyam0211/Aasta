import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const deliveryPartner = await prisma.deliveryPartner.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    if (!deliveryPartner) {
      return NextResponse.json(
        { success: false, error: 'Delivery partner not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: deliveryPartner,
    });
  } catch (error) {
    console.error('Error fetching delivery partner:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch delivery partner' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const {
      status,
      telegramPhone,
      currentLatitude,
      currentLongitude,
      assignedRestaurants,
    } = body;

    // Verify partner exists
    const existingPartner = await prisma.deliveryPartner.findUnique({
      where: { id },
    });

    if (!existingPartner) {
      return NextResponse.json(
        { success: false, error: 'Delivery partner not found' },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData: any = {};
    if (status !== undefined) updateData.status = status;
    if (telegramPhone !== undefined) updateData.telegramPhone = telegramPhone;
    if (currentLatitude !== undefined)
      updateData.currentLatitude = currentLatitude;
    if (currentLongitude !== undefined)
      updateData.currentLongitude = currentLongitude;
    if (assignedRestaurants !== undefined)
      updateData.assignedRestaurants = assignedRestaurants;

    const updatedPartner = await prisma.deliveryPartner.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedPartner,
    });
  } catch (error) {
    console.error('Error updating delivery partner:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update delivery partner' },
      { status: 500 }
    );
  }
}
