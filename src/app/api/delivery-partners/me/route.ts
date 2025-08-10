import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const deliveryPartner = await prisma.deliveryPartner.findUnique({
      where: { userId: session.user.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          }
        }
      }
    });

    if (!deliveryPartner) {
      return NextResponse.json(
        { success: false, error: 'Delivery partner not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: deliveryPartner
    });
  } catch (error) {
    console.error('Error fetching delivery partner data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch delivery partner data' },
      { status: 500 }
    );
  }
}
