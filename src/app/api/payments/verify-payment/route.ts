import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import PaymentService from '@/lib/payment-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = body;

    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const paymentService = new PaymentService();
    const isValid = paymentService.verifyPayment({
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    });

    if (!isValid) {
      return NextResponse.json(
        { success: false, error: 'Invalid signature' },
        { status: 400 }
      );
    }

    // Find the payment first
    const existingPayment = await prisma.payment.findFirst({
      where: { razorpayOrderId: razorpay_order_id },
      include: { order: true },
    });

    if (!existingPayment) {
      return NextResponse.json(
        { success: false, error: 'Payment not found' },
        { status: 404 }
      );
    }

    // Update payment status
    const payment = await prisma.payment.update({
      where: { id: existingPayment.id },
      data: {
        razorpayPaymentId: razorpay_payment_id,
        status: 'COMPLETED',
        capturedAt: new Date(),
      },
    });

    // Mark order as paid
    const updatedOrder = await prisma.order.update({
      where: { id: existingPayment.orderId },
      data: {
        paymentStatus: 'COMPLETED',
      },
      include: {
        restaurant: true,
        customer: { include: { user: true } },
        deliveryAddress: true,
      },
    });

    // If DELIVERY order, notify available delivery partners now
    if (updatedOrder.orderType === 'DELIVERY') {
      try {
        const botToken = process.env.TELEGRAM_BOT_TOKEN;
        if (botToken && updatedOrder.restaurant.assignedDeliveryPartners.length > 0) {
          const { TelegramBotService } = await import('@/lib/telegram-bot-service');
          const telegramBot = new TelegramBotService(botToken);

          const partners = await prisma.deliveryPartner.findMany({
            where: {
              id: { in: updatedOrder.restaurant.assignedDeliveryPartners },
              status: 'AVAILABLE',
              telegramPhone: { not: null },
            },
            include: { user: true },
          });

          for (const partner of partners) {
            if (partner.telegramPhone) {
              await telegramBot.sendOrderNotificationWithDetails(
                partner.telegramPhone,
                updatedOrder.id,
                updatedOrder.orderNumber,
                updatedOrder.restaurant.name,
                updatedOrder.restaurant.address,
                updatedOrder.customer.user?.name || 'Customer',
                updatedOrder.totalAmount,
                updatedOrder.verificationCode,
                updatedOrder.restaurant.latitude,
                updatedOrder.restaurant.longitude,
                updatedOrder.deliveryAddress.latitude || 0,
                updatedOrder.deliveryAddress.longitude || 0,
                `${updatedOrder.deliveryAddress.street}, ${updatedOrder.deliveryAddress.city}`,
                (await prisma.orderItem.count({ where: { orderId: updatedOrder.id } }))
              );
            }
          }
        }
      } catch (e) {
        console.error('Failed to notify partners after payment:', e);
      }
    }

    return NextResponse.json({ success: true, payment });
  } catch (error) {
    console.error('Payment verification failed:', error);
    return NextResponse.json(
      { success: false, error: 'Payment verification failed' },
      { status: 500 }
    );
  }
}
