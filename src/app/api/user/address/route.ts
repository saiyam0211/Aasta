import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { Prisma } from '@prisma/client';

export async function GET() {
	try {
		const session = await getServerSession(authOptions);
		if (!session || !session.user?.id) {
			return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
		}

		const customer = await prisma.customer.findUnique({ where: { userId: session.user.id } });
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
		return NextResponse.json({ success: false, message: 'Error fetching addresses' }, { status: 500 });
	}
}

export async function POST(request: NextRequest) {
	try {
		const session = await getServerSession(authOptions);
		if (!session || !session.user?.id) {
			return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
		}

		const customer = await prisma.customer.findUnique({ where: { userId: session.user.id } });
		if (!customer) {
			return NextResponse.json({ success: false, message: 'Customer profile not found' }, { status: 404 });
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

		if (isDefault) {
			await prisma.address.updateMany({ where: { customerId: customer.id }, data: { isDefault: false } });
		}

		const data: any = {
			customerId: customer.id,
			street: street ?? undefined,
			landmark: landmark ?? undefined,
			instructions: instructions ?? undefined,
			type: (type as any) ?? 'HOME',
			latitude: typeof lat === 'number' ? lat : undefined,
			longitude: typeof lng === 'number' ? lng : undefined,
			isDefault: !!isDefault,
			houseNumber: houseNumber ?? undefined,
			locality: locality ?? undefined,
			contactPhone: contactPhone ?? undefined,
			// Backward-compat defaults in case remote schema still requires these
			city: (city as string | undefined) ?? process.env.DEFAULT_CITY ?? 'Bengaluru',
			state: (state as string | undefined) ?? process.env.DEFAULT_STATE ?? 'Karnataka',
			zipCode: (zipCode as string | undefined) ?? process.env.DEFAULT_ZIP ?? '560001',
		};

		const created = await prisma.address.create({
			data,
		});

		return NextResponse.json({ success: true, address: created });
	} catch (error: any) {
		console.error('Create address error:', error);
		if (error instanceof Prisma.PrismaClientKnownRequestError) {
			return NextResponse.json(
				{ success: false, message: 'Database error', code: error.code, meta: (error as any).meta },
				{ status: 500 }
			);
		}
		return NextResponse.json(
			{ success: false, message: error?.message || 'Error creating address' },
			{ status: 500 }
		);
	}
}
