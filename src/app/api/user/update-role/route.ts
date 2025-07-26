import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { PrismaClient } from '@prisma/client';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { userId, role } = await request.json();

    // Verify the user is updating their own role
    if (session.user.id !== userId) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Validate role
    const validRoles = ['CUSTOMER', 'DELIVERY_PARTNER', 'RESTAURANT_OWNER'];
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role' },
        { status: 400 }
      );
    }

    // Update user role and create role-specific profile
    const result = await prisma.$transaction(async (tx: PrismaClient) => {
      // Update user role
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: { role },
      });

      // Create role-specific profile
      switch (role) {
        case 'CUSTOMER':
          await tx.customer.upsert({
            where: { userId },
            create: {
              userId,
              favoriteRestaurants: [],
            },
            update: {},
          });
          break;

        case 'DELIVERY_PARTNER':
          await tx.deliveryPartner.upsert({
            where: { userId },
            create: {
              userId,
              assignedRestaurants: [],
              status: 'OFFLINE',
            },
            update: {},
          });
          break;

        case 'RESTAURANT_OWNER':
          // Restaurant profile will be created during restaurant onboarding
          break;
      }

      return updatedUser;
    });

    return NextResponse.json({
      success: true,
      user: result,
    });

  } catch (error) {
    console.error('Error updating user role:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 