import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import PaymentService from "@/lib/payment-service";

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-razorpay-signature');

    if (!signature) {
      return NextResponse.json(
        { error: "Missing webhook signature" },
        { status: 400 }
      );
    }

    const paymentService = new PaymentService();
    const isValid = paymentService.verifyWebhookSignature(body, signature);

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid webhook signature" },
        { status: 400 }
      );
    }

    const event = JSON.parse(body);
    
    switch (event.event) {
      case 'payment.captured':
        await handlePaymentCaptured(event.payload.payment.entity);
        break;
      
      case 'payment.failed':
        await handlePaymentFailed(event.payload.payment.entity);
        break;
      
      case 'order.paid':
        await handleOrderPaid(event.payload.order.entity);
        break;
      
      case 'refund.created':
        await handleRefundCreated(event.payload.refund.entity);
        break;
      
      case 'refund.processed':
        await handleRefundProcessed(event.payload.refund.entity);
        break;
      
      default:
        console.log(`Unhandled webhook event: ${event.event}`);
    }

    return NextResponse.json({ status: 'success' });
  } catch (error) {
    console.error("Webhook processing failed:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

async function handlePaymentCaptured(payment: any) {
  try {
    // Find the payment first
    const existingPayment = await prisma.payment.findFirst({
      where: { razorpayOrderId: payment.order_id }
    });
    
    if (!existingPayment) {
      console.error('Payment not found for order:', payment.order_id);
      return;
    }
    
    await prisma.payment.update({
      where: { id: existingPayment.id },
      data: {
        razorpayPaymentId: payment.id,
        status: 'COMPLETED',
        capturedAt: new Date()
      }
    });

    await prisma.order.update({
      where: { id: existingPayment.orderId },
      data: {
        paymentStatus: 'completed'
      }
    });

    console.log(`Payment captured for order: ${payment.order_id}`);
  } catch (error) {
    console.error("Error handling payment captured:", error);
  }
}

async function handlePaymentFailed(payment: any) {
  try {
    // Find the payment first
    const existingPayment = await prisma.payment.findFirst({
      where: { razorpayOrderId: payment.order_id }
    });
    
    if (!existingPayment) {
      console.error('Payment not found for order:', payment.order_id);
      return;
    }
    
    await prisma.payment.update({
      where: { id: existingPayment.id },
      data: {
        razorpayPaymentId: payment.id,
        status: 'FAILED',
        failureReason: payment.error_description
      }
    });

    await prisma.order.update({
      where: { id: existingPayment.orderId },
      data: {
        paymentStatus: 'failed'
      }
    });

    console.log(`Payment failed for order: ${payment.order_id}`);
  } catch (error) {
    console.error("Error handling payment failed:", error);
  }
}

async function handleOrderPaid(order: any) {
  try {
    // Find the order by razorpayOrderId
    const existingOrder = await prisma.order.findFirst({
      where: { razorpayOrderId: order.id }
    });
    
    if (!existingOrder) {
      console.error('Order not found:', order.id);
      return;
    }
    
    await prisma.order.update({
      where: { id: existingOrder.id },
      data: {
        paymentStatus: 'completed',
        status: 'CONFIRMED'
      }
    });

    console.log(`Order paid: ${order.id}`);
  } catch (error) {
    console.error("Error handling order paid:", error);
  }
}

async function handleRefundCreated(refund: any) {
  try {
    await prisma.refund.create({
      data: {
        razorpayRefundId: refund.id,
        paymentId: refund.payment_id,
        amount: refund.amount / 100, // Convert paise to rupees
        currency: refund.currency,
        status: 'PROCESSING',
        reason: 'Order cancellation'
      }
    });

    console.log(`Refund created: ${refund.id}`);
  } catch (error) {
    console.error("Error handling refund created:", error);
  }
}

async function handleRefundProcessed(refund: any) {
  try {
    await prisma.refund.update({
      where: { razorpayRefundId: refund.id },
      data: {
        status: 'COMPLETED',
        processedAt: new Date()
      }
    });

    console.log(`Refund processed: ${refund.id}`);
  } catch (error) {
    console.error("Error handling refund processed:", error);
  }
}
