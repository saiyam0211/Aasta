import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const params = await context.params;

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

    // Validate that the address belongs to the user
    const existingAddress = await prisma.address.findFirst({
      where: {
        id: params.id,
        customerId: customer.id,
      },
    });

    if (!existingAddress) {
      return NextResponse.json(
        { success: false, message: 'Address not found' },
        { status: 404 }
      );
    }

    // If this address is being set as default, make sure to unset other defaults
    if (isDefault && !existingAddress.isDefault) {
      await prisma.address.updateMany({
        where: { customerId: customer.id },
        data: { isDefault: false },
      });
    }

    const updatedAddress = await prisma.address.update({
      where: { id: params.id },
      data: {
        street: street || existingAddress.street,
        city: city || existingAddress.city,
        state: state || existingAddress.state,
        zipCode: zipCode || existingAddress.zipCode,
        landmark: landmark !== undefined ? landmark : existingAddress.landmark,
        instructions:
          instructions !== undefined
            ? instructions
            : existingAddress.instructions,
        type: type || existingAddress.type,
        latitude: latitude !== undefined ? latitude : existingAddress.latitude,
        longitude:
          longitude !== undefined ? longitude : existingAddress.longitude,
        isDefault:
          isDefault !== undefined ? isDefault : existingAddress.isDefault,
      },
    });

    return NextResponse.json({
      success: true,
      address: updatedAddress,
    });
  } catch (error) {
    console.error('Update address error:', error);
    return NextResponse.json(
      { success: false, message: 'Error updating address' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const params = await context.params;

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

    // Check if the address is linked to any orders
    const linkedOrders = await prisma.order.findMany({
      where: { deliveryAddressId: params.id },
      select: { id: true },
    });

    if (linkedOrders.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message:
            'This address is linked to existing orders and cannot be deleted. You can edit it instead.',
        },
        { status: 400 }
      );
    }

    // Validate that the address belongs to the user
    const existingAddress = await prisma.address.findFirst({
      where: {
        id: params.id,
        customerId: customer.id,
      },
    });

    if (!existingAddress) {
      return NextResponse.json(
        { success: false, message: 'Address not found' },
        { status: 404 }
      );
    }

    await prisma.address.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      success: true,
      message: 'Address deleted successfully',
    });
  } catch (error) {
    console.error('Delete address error:', error);
    return NextResponse.json(
      { success: false, message: 'Error deleting address' },
      { status: 500 }
    );
  }
}
