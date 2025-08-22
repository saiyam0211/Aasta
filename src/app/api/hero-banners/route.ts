import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // For now, we'll return static banners
    // Later, these can be stored in the database and managed by admins
    const heroBanners = [
      {
        id: 1,
        title: 'Night Delivery is Live!',
        subtitle: 'Premium food delivery from 9 PM to 12 AM',
        description:
          'Get your favorite food delivered fresh to your doorstep during late night hours',
        image: '/images/banners/aasta-banner.jpg',
        backgroundColor: '#1a365d',
        textColor: 'text-white',
        ctaText: 'Order Now',
        ctaUrl: '/restaurants',
        isActive: true,
        order: 1,
      },
      {
        id: 2,
        title: 'Free Delivery Weekend',
        subtitle: 'No delivery charges on orders above ₹299',
        description:
          'Save more on your favorite meals with free delivery all weekend long',
        image: '/images/banners/free-delivery-banner.jpg',
        backgroundColor: '#2d5016',
        textColor: 'text-white',
        ctaText: 'Explore Offers',
        ctaUrl: '/restaurants?filter=offers',
        isActive: true,
        order: 2,
      },
      {
        id: 3,
        title: 'New Restaurant Alert!',
        subtitle: '50+ new restaurants added this week',
        description:
          'Discover exciting new cuisines and flavors from recently added restaurants',
        image: '/images/banners/new-restaurant-banner.jpg',
        backgroundColor: '#7c2d12',
        textColor: 'text-white',
        ctaText: 'Discover New',
        ctaUrl: '/restaurants?filter=new',
        isActive: true,
        order: 3,
      },
    ];

    return NextResponse.json({
      success: true,
      data: heroBanners
        .filter((banner) => banner.isActive)
        .sort((a, b) => a.order - b.order),
      total: heroBanners.length,
    });
  } catch (error) {
    console.error('Error fetching hero banners:', error);
    return NextResponse.json(
      { error: 'Failed to fetch hero banners' },
      { status: 500 }
    );
  }
}
