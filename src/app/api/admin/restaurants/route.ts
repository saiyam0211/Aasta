import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    console.log('Admin restaurants API - Session:', JSON.stringify(session, null, 2));
    
    if (!session?.user?.email) {
      console.log('No session or email found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin (role should be set in NextAuth session)
    if (session.user.role !== 'ADMIN') {
      console.log('User is not admin:', session.user.email, session.user.role);
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Get all restaurants
    const restaurants = await prisma.restaurant.findMany({
      select: {
        id: true,
        name: true,
        address: true,
        status: true,
        ownerName: true,
        phone: true,
        email: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json({ 
      success: true,
      data: restaurants 
    });

  } catch (error) {
    console.error('Error fetching restaurants:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
