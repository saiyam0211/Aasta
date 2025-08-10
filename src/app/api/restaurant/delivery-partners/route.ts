import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the user and restaurant
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        restaurant: true,
      },
    });

    if (!user?.restaurant) {
      return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 });
    }

    const restaurant = user.restaurant;

    // Get assigned delivery partners
    const deliveryPartners = await prisma.deliveryPartner.findMany({
      where: {
        id: {
          in: restaurant.assignedDeliveryPartners,
        },
      },
      include: {
        user: {
          select: {
            name: true,
          },
        },
      },
    });

    // Format the response
    const formattedPartners = deliveryPartners.map(partner => ({
      id: partner.id,
      name: partner.user.name || 'Unknown',
      status: partner.status,
      rating: partner.rating,
      completedDeliveries: partner.completedDeliveries,
    }));

    return NextResponse.json({
      success: true,
      partners: formattedPartners,
    });

  } catch (error) {
    console.error('Error fetching delivery partners:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
