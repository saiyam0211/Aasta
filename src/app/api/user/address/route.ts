import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { Prisma } from '@prisma/client';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const customer = await prisma.customer.findUnique({
      where: { userId: session.user.id },
    });
    if (!customer) {
      return NextResponse.json({ success: true, addresses: [] });
    }

    const addresses = await prisma.address.findMany({
      where: { customerId: customer.id },
      orderBy: { isDefault: 'desc' },
    });
    return NextResponse.json({ success: true, addresses });
  } catch (error) {
    console.error('List addresses error:', error);
    return NextResponse.json(
      { success: false, message: 'Error fetching addresses' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Ensure a customer profile exists for this user. If not, create one.
    let customer = await prisma.customer.findUnique({
      where: { userId: session.user.id },
    });
    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          userId: session.user.id,
          favoriteRestaurants: [],
        },
      });
    }

    const body = await request.json();
    const {
      street,
      landmark,
      instructions,
      type,
      latitude,
      longitude,
      isDefault,
      // Newly supported fields for richer addresses
      houseNumber,
      locality,
      contactPhone,
      city,
      state,
      zipCode,
    } = body || {};

    // Coerce numeric values safely
    const lat = typeof latitude === 'string' ? Number(latitude) : latitude;
    const lng = typeof longitude === 'string' ? Number(longitude) : longitude;

    // Build whitelist of fields known to exist across schemas
    const addressData: any = {
      customerId: customer.id,
      street: street ?? undefined,
      landmark: landmark ?? undefined,
      instructions: instructions ?? undefined,
      type: (type as any) ?? 'HOME',
      latitude: typeof lat === 'number' && !Number.isNaN(lat) ? lat : undefined,
      longitude:
        typeof lng === 'number' && !Number.isNaN(lng) ? lng : undefined,
      isDefault: !!isDefault,
      // Newly persisted fields if present
      houseNumber: (houseNumber as string | undefined) ?? undefined,
      locality: (locality as string | undefined) ?? undefined,
      contactPhone: (contactPhone as string | undefined) ?? undefined,
      city:
        (city as string | undefined) ?? process.env.DEFAULT_CITY ?? 'Bengaluru',
      state:
        (state as string | undefined) ??
        process.env.DEFAULT_STATE ??
        'Karnataka',
      zipCode:
        (zipCode as string | undefined) ?? process.env.DEFAULT_ZIP ?? '560001',
    };

    // Use a transaction to ensure default flags are consistent
    const created = await prisma.$transaction(async (tx) => {
      if (isDefault) {
        await tx.address.updateMany({
          where: { customerId: customer!.id },
          data: { isDefault: false },
        });
      }
      try {
        // First attempt with full data
        const a = await tx.address.create({ data: addressData });
        if (isDefault) {
          // Best-effort: update customer's defaultAddressId if column exists in DB
          try {
            await tx.customer.update({
              where: { id: customer!.id },
              data: { defaultAddressId: a.id } as any,
            });
          } catch (e) {
            // Ignore if older schema doesn't have defaultAddressId
            console.warn(
              'defaultAddressId update skipped:',
              (e as any)?.code || e
            );
          }
        }
        return a;
      } catch (e: any) {
        // Fallback for older schemas that might not have the new columns
        const fallbackData: any = {
          customerId: customer!.id,
          street: addressData.street,
          landmark: addressData.landmark,
          instructions: addressData.instructions,
          type: addressData.type,
          latitude: addressData.latitude,
          longitude: addressData.longitude,
          isDefault: addressData.isDefault,
          city: addressData.city,
          state: addressData.state,
          zipCode: addressData.zipCode,
        };
        const a = await tx.address.create({ data: fallbackData });
        if (isDefault) {
          try {
            await tx.customer.update({
              where: { id: customer!.id },
              data: { defaultAddressId: a.id } as any,
            });
          } catch (e2) {
            console.warn(
              'defaultAddressId update skipped:',
              (e2 as any)?.code || e2
            );
          }
        }
        return a;
      }
    });

    return NextResponse.json({ success: true, address: created });
  } catch (error: any) {
    console.error('Create address error:', error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return NextResponse.json(
        {
          success: false,
          message: 'Database error',
          code: error.code,
          meta: (error as any).meta,
        },
        { status: 500 }
      );
    }
    // Fall back to a safe error message without leaking details
    return NextResponse.json(
      { success: false, message: 'Error creating address' },
      { status: 500 }
    );
  }
}
