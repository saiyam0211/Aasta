import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import PaymentService from "@/lib/payment-service";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { orderNumber } = body;

    if (!orderNumber) {
      return NextResponse.json(
        { success: false, error: "Order number is required" },
        { status: 400 }
      );
    }

    // First find the customer record
    const customer = await prisma.customer.findUnique({
      where: { userId: session.user.id }
    });
    
    if (!customer) {
      return NextResponse.json(
        { success: false, error: "Customer not found" },
        { status: 404 }
      );
    }
    
    // Find the order
    const order = await prisma.order.findFirst({
      where: {
        orderNumber,
        customerId: customer.id
      },
      include: {
        customer: {
          include: {
            user: {
              select: {
                email: true,
                phone: true
              }
            }
          }
        }
      }
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    // Check if order is already paid
    if (order.paymentStatus === 'COMPLETED') {
      return NextResponse.json(
        { success: false, error: "Order is already paid" },
        { status: 400 }
      );
    }

    // Create payment order with Razorpay
    const paymentService = new PaymentService();
    const razorpayOrder = await paymentService.createPaymentOrder(
      order.totalAmount,
      order.orderNumber,
      order.customer.user.email || undefined,
      order.customer.user.phone || undefined
    );

    // Update order with payment order ID
    await prisma.order.update({
      where: { id: order.id },
      data: {
        razorpayOrderId: razorpayOrder.id,
        paymentStatus: 'PENDING'
      }
    });

    // Create payment record
    await prisma.payment.create({
      data: {
        orderId: order.id,
        razorpayOrderId: razorpayOrder.id,
        amount: order.totalAmount,
        currency: 'INR',
        status: 'CREATED',
        paymentMethod: 'RAZORPAY'
      }
    });

    return NextResponse.json({
      success: true,
      razorpayOrder: {
        id: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        key: process.env.RAZORPAY_KEY_ID
      },
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        total: order.totalAmount
      }
    });
  } catch (error) {
    console.error("Payment order creation failed:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create payment order" },
      { status: 500 }
    );
  }
}
