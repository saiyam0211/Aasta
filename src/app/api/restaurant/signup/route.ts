import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { email, password, restaurantName, ownerName, phone } = await request.json();

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user with RESTAURANT_OWNER role
    const user = await prisma.user.create({
      data: {
        email,
        name: ownerName || email.split('@')[0], // Use part of email as name if not provided
        phone: phone || null,
        password: hashedPassword, // Store hashed password
        role: 'RESTAURANT_OWNER',
      }
    });
    
    return NextResponse.json({
      success: true,
      message: 'Restaurant account created successfully',
      userId: user.id
    });

  } catch (error) {
    console.error('Restaurant signup error:', error);
    return NextResponse.json(
      { error: 'Failed to create account' },
      { status: 500 }
    );
  }
}
