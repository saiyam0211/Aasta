import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const deliveryPartners = await prisma.deliveryPartner.findMany({
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
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({
      success: true,
      data: deliveryPartners,
    });
  } catch (error) {
    console.error('Error fetching delivery partners:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch delivery partners' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, telegramPhone } = body;

    // Check if delivery partner already exists
    const existingPartner = await prisma.deliveryPartner.findUnique({
      where: { userId },
    });

    if (existingPartner) {
      return NextResponse.json(
        { success: false, error: 'Delivery partner already exists' },
        { status: 400 }
      );
    }

    const deliveryPartner = await prisma.deliveryPartner.create({
      data: {
        userId,
        assignedRestaurants: [],
        status: 'OFFLINE',
        todayEarnings: 0,
        totalEarnings: 0,
        rating: 0,
        completedDeliveries: 0,
        telegramPhone: telegramPhone || null,
      },
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
      data: deliveryPartner,
    });
  } catch (error) {
    console.error('Error creating delivery partner:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create delivery partner' },
      { status: 500 }
    );
  }
}
