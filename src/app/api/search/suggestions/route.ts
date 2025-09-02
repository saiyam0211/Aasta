import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = (searchParams.get('q') || '').trim();
    const limit = Number(searchParams.get('limit') || 5);

    if (!q || q.length < 2) {
      return NextResponse.json({
        success: true,
        data: { restaurants: [], menuItems: [] },
      });
    }

    const [restaurants, menuItems] = await Promise.all([
      prisma.restaurant.findMany({
        where: {
          status: 'ACTIVE',
          name: { contains: q, mode: 'insensitive' },
        },
        select: {
          id: true,
          name: true,
          imageUrl: true,
          cuisineTypes: true,
          rating: true,
        },
        take: Math.max(1, Math.min(limit, 8)),
        orderBy: { name: 'asc' },
      }),
      prisma.menuItem.findMany({
        where: {
          available: true,
          restaurant: {
            status: 'ACTIVE',
          },
          OR: [
            { name: { contains: q, mode: 'insensitive' } },
            { description: { contains: q, mode: 'insensitive' } },
            { category: { contains: q, mode: 'insensitive' } },
          ],
        },
        select: {
          id: true,
          name: true,
          imageUrl: true,
          price: true,
          category: true,
          restaurant: { select: { id: true, name: true } },
        },
        take: Math.max(3, Math.min(limit * 2, 10)),
        orderBy: [{ featured: 'desc' }, { name: 'asc' }],
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: { restaurants, menuItems },
    });
  } catch (error) {
    console.error('Search suggestions error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch suggestions' },
      { status: 500 }
    );
  }
}
