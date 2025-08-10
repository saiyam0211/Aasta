import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Simple operations authentication check
function isOperationsAuthenticated(request: NextRequest) {
  // Since operations uses localStorage, we'll skip authentication for now
  // In production, you'd want to implement proper JWT or similar
  return true;
}

export async function GET(request: NextRequest) {
  try {
    if (!isOperationsAuthenticated(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // First, test basic query
    console.log('Attempting to fetch delivery partners...');
    
    // Get all delivery partners with their user data - simplified version
    const deliveryPartners = await prisma.deliveryPartner.findMany({
      include: {
        user: {
          select: {
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

    console.log(`Found ${deliveryPartners.length} delivery partners`);

    // Transform the data to match the expected format - simplified
    const transformedPartners = deliveryPartners.map(partner => ({
      id: partner.id,
      userId: partner.userId,
      user: partner.user,
      assignedRestaurants: partner.assignedRestaurants || [],
      status: partner.status,
      rating: partner.rating || 5.0,
      completedDeliveries: partner.completedDeliveries || 0,
      todayEarnings: partner.todayEarnings || 0,
      totalEarnings: partner.totalEarnings || 0,
      telegramPhone: partner.telegramPhone,
      currentLatitude: partner.currentLatitude,
      currentLongitude: partner.currentLongitude,
    }));

    console.log('Transformed partners:', transformedPartners.length);

    return NextResponse.json({ 
      success: true,
      data: transformedPartners 
    });

  } catch (error) {
    console.error('Error fetching delivery partners:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
    return NextResponse.json({ 
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!isOperationsAuthenticated(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();

    // Handle two scenarios: creating with userId OR creating new user + partner
    if (data.userId) {
      // Existing scenario - create delivery partner for existing user
      const deliveryPartner = await prisma.deliveryPartner.create({
        data: {
          userId: data.userId,
          telegramPhone: data.telegramPhone,
          status: 'OFFLINE',
          rating: 5.0,
          completedDeliveries: 0,
          todayEarnings: 0,
          totalEarnings: 0,
          assignedRestaurants: [],
        },
        include: {
          user: {
            select: {
              name: true,
              email: true,
              phone: true,
            },
          },
        },
      });

      return NextResponse.json({ 
        success: true,
        message: 'Delivery partner created successfully',
        data: deliveryPartner
      }, { status: 201 });
    } else {
      // New scenario - create user and delivery partner together
      // Validate required fields for new user creation
      const requiredFields = ['name', 'email', 'telegramPhone'];
      for (const field of requiredFields) {
        if (!data[field]) {
          return NextResponse.json({ 
            success: false,
            error: `Missing required field: ${field}` 
          }, { status: 400 });
        }
      }

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: data.email }
      });

      if (existingUser) {
        return NextResponse.json({ 
          success: false,
          error: 'User with this email already exists' 
        }, { status: 400 });
      }

      // Create user and delivery partner in a transaction
      const result = await prisma.$transaction(async (tx) => {
        // Create the user first
        const user = await tx.user.create({
          data: {
            name: data.name,
            email: data.email,
            phone: data.telegramPhone,
            role: 'DELIVERY_PARTNER',
          },
        });

        // Then create the delivery partner
        const deliveryPartner = await tx.deliveryPartner.create({
          data: {
            userId: user.id,
            telegramPhone: data.telegramPhone,
            status: 'OFFLINE',
            rating: 5.0,
            completedDeliveries: 0,
            todayEarnings: 0,
            totalEarnings: 0,
            assignedRestaurants: [],
          },
          include: {
            user: {
              select: {
                name: true,
                email: true,
                phone: true,
              },
            },
          },
        });

        return deliveryPartner;
      });

      return NextResponse.json({ 
        success: true,
        message: 'Delivery partner created successfully',
        data: result
      }, { status: 201 });
    }

  } catch (error) {
    console.error('Error creating delivery partner:', error);
    return NextResponse.json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    }, { status: 500 });
  }
}
