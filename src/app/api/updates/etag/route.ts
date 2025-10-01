import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Returns a monotonic "etag" that bumps whenever restaurants or menu_items change recently
export async function GET(_req: NextRequest) {
  try {
    // Use aggregates that also change when stockLeft changes (even if updatedAt is not bumped)
    const [rAgg, mAgg] = await Promise.all([
      prisma.restaurant.aggregate({ _max: { updatedAt: true }, _count: { _all: true } }),
      prisma.menuItem.aggregate({ _max: { updatedAt: true }, _sum: { stockLeft: true }, _count: { _all: true } }),
    ]);
    const rMax = (rAgg as any)?._max?.updatedAt as Date | null;
    const mMax = (mAgg as any)?._max?.updatedAt as Date | null;
    const mSumStock = Number((mAgg as any)?._sum?.stockLeft || 0);
    const rCount = Number((rAgg as any)?._count?._all || 0);
    const mCount = Number((mAgg as any)?._count?._all || 0);
    const parts = [
      rMax ? rMax.getTime() : 0,
      mMax ? mMax.getTime() : 0,
      mSumStock,
      rCount,
      mCount,
    ];
    const etag = parts.join('-');
    const res = NextResponse.json({ success: true, etag });
    res.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    return res;
  } catch (e) {
    return NextResponse.json({ success: false, etag: '0' });
  }
}


