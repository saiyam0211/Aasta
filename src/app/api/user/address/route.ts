import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // First find the customer record for this user
    const customer = await prisma.customer.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });

    if (!customer) {
      return NextResponse.json(
        { success: false, message: 'Customer profile not found' },
        { status: 404 }
      );
    }

    const addresses = await prisma.address.findMany({
      where: { customerId: customer.id },
      orderBy: { isDefault: 'desc' },
    });

    return NextResponse.json({
      success: true,
      addresses,
    });
  } catch (error) {
    console.error('Address fetch error:', error);
    return NextResponse.json(
      { success: false, message: 'Error fetching addresses' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // First find the customer record for this user
    const customer = await prisma.customer.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });

    if (!customer) {
      return NextResponse.json(
        { success: false, message: 'Customer profile not found' },
        { status: 404 }
      );
    }

    const {
      street,
      city,
      state,
      zipCode,
      landmark,
      instructions,
      type,
      latitude,
      longitude,
      isDefault,
    } = await request.json();

    // Validate required fields
    if (!street || !city || !state || !zipCode) {
      return NextResponse.json(
        {
          success: false,
          message: 'Street, city, state, and zip code are required',
        },
        { status: 400 }
      );
    }

    // Check for duplicate address
    const existingAddress = await prisma.address.findFirst({
      where: {
        customerId: customer.id,
        street: { equals: street.trim(), mode: 'insensitive' },
        city: { equals: city.trim(), mode: 'insensitive' },
        state: { equals: state.trim(), mode: 'insensitive' },
        zipCode: zipCode.trim(),
      },
    });

    if (existingAddress) {
      return NextResponse.json(
        { success: false, message: 'This address already exists' },
        { status: 400 }
      );
    }

    // If this address is being set as default, make sure to unset other defaults
    if (isDefault) {
      await prisma.address.updateMany({
        where: { customerId: customer.id },
        data: { isDefault: false },
      });
    }

    const newAddress = await prisma.address.create({
      data: {
        customerId: customer.id,
        street,
        city,
        state,
        zipCode,
        landmark,
        instructions,
        type: type || 'HOME',
        latitude,
        longitude,
        isDefault: isDefault || false,
      },
    });

    return NextResponse.json(
      {
        success: true,
        address: newAddress,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Add address error:', error);
    return NextResponse.json(
      { success: false, message: 'Error adding address' },
      { status: 500 }
    );
  }
}
