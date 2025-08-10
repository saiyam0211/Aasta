import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, role } = body;

    // Validate required fields
    if (!name || !email || !phone || !role) {
      return NextResponse.json(
        { success: false, error: 'Name, email, phone, and role are required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Create the user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        role: role as any, // Will be validated by Prisma schema
      }
    });

    return NextResponse.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create user' },
      { status: 500 }
    );
  }
}
