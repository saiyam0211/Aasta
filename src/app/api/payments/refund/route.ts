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
    const { orderNumber, amount, reason } = body;

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
    
    // Find the order and payment
    const order = await prisma.order.findFirst({
      where: {
        orderNumber,
        customerId: customer.id
      },
      include: {
        payments: {
          where: {
            status: 'COMPLETED'
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

    if (order.payments.length === 0) {
      return NextResponse.json(
        { success: false, error: "No completed payment found for this order" },
        { status: 400 }
      );
    }

    const payment = order.payments[0];
    
    if (!payment.razorpayPaymentId) {
      return NextResponse.json(
        { success: false, error: "Payment ID not found" },
        { status: 400 }
      );
    }
    
    // Check if refund already exists
    const existingRefund = await prisma.refund.findFirst({
      where: {
        paymentId: payment.razorpayPaymentId
      }
    });

    if (existingRefund) {
      return NextResponse.json(
        { success: false, error: "Refund already processed for this order" },
        { status: 400 }
      );
    }

    // Process refund with Razorpay
    const paymentService = new PaymentService();
    const refundAmount = amount || payment.amount;
    
    const razorpayRefund = await paymentService.processRefund(
      payment.razorpayPaymentId!,
      refundAmount,
      reason
    );

    // Create refund record
    const refund = await prisma.refund.create({
      data: {
        razorpayRefundId: razorpayRefund.id,
        paymentId: payment.razorpayPaymentId!,
        amount: refundAmount,
        currency: 'INR',
        status: 'PROCESSING',
        reason: reason || 'Order cancellation'
      }
    });

    // Update order status if full refund
    if (refundAmount >= payment.amount) {
      await prisma.order.update({
        where: { id: order.id },
        data: {
          status: 'CANCELLED',
          paymentStatus: 'REFUNDED'
        }
      });
    }

    return NextResponse.json({
      success: true,
      refund: {
        id: refund.id,
        razorpayRefundId: refund.razorpayRefundId,
        amount: refund.amount,
        status: refund.status,
        reason: refund.reason
      }
    });
  } catch (error) {
    console.error("Refund processing failed:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process refund" },
      { status: 500 }
    );
  }
}
