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

    // Find the payment and order in one optimized query
    const existingPayment = await prisma.payment.findFirst({
      where: { razorpayOrderId: razorpay_order_id },
      select: {
        id: true,
        orderId: true,
        order: {
          select: {
            id: true,
            orderType: true,
            orderItems: {
              select: {
                menuItemId: true,
                quantity: true,
              },
            },
          },
        },
      },
    });

    if (!existingPayment) {
      return NextResponse.json(
        { success: false, error: 'Payment not found' },
        { status: 404 }
      );
    }

    // Update payment status and order in one transaction (optimized)
    const result = await prisma.$transaction(async (tx) => {
      // Update payment status
      const payment = await tx.payment.update({
        where: { id: existingPayment.id },
        data: {
          razorpayPaymentId: razorpay_payment_id,
          status: 'COMPLETED',
          capturedAt: new Date(),
        },
        select: { id: true, status: true },
      });

      // Update order status
      await tx.order.update({
        where: { id: existingPayment.orderId },
        data: { paymentStatus: 'COMPLETED' },
      });

      // Decrement stock for each ordered item (bulk operation)
      await Promise.all(
        existingPayment.order.orderItems.map((item) =>
          tx.menuItem.update({
            where: { id: item.menuItemId },
            data: {
              stockLeft: { decrement: item.quantity },
              available: true,
            },
          })
        )
      );

      return { payment, orderType: existingPayment.order.orderType };
    });

    // Return success immediately - Telegram notifications will be handled asynchronously
    const response = NextResponse.json({ success: true, payment: result.payment });

    // Handle Telegram notifications asynchronously (non-blocking)
    if (result.orderType === 'DELIVERY') {
      // Don't await this - let it run in background
      setImmediate(async () => {
        try {
          const botToken = process.env.TELEGRAM_BOT_TOKEN;
          if (botToken) {
            const { TelegramBotService } = await import('@/lib/telegram-bot-service');
            const telegramBot = new TelegramBotService(botToken);
            
            // Get order details for notification (lightweight query)
            const orderDetails = await prisma.order.findUnique({
              where: { id: existingPayment.orderId },
              select: {
                id: true,
                orderNumber: true,
                totalAmount: true,
                verificationCode: true,
                restaurant: {
                  select: {
                    name: true,
                    address: true,
                    latitude: true,
                    longitude: true,
                    assignedDeliveryPartners: true,
                  },
                },
                customer: {
                  select: {
                    user: { select: { name: true } },
                  },
                },
                deliveryAddress: {
                  select: {
                    latitude: true,
                    longitude: true,
                    street: true,
                    city: true,
                  },
                },
                _count: { select: { orderItems: true } },
              },
            });

            if (orderDetails?.restaurant?.assignedDeliveryPartners?.length && orderDetails.restaurant.assignedDeliveryPartners.length > 0) {
              const partners = await prisma.deliveryPartner.findMany({
                where: {
                  id: { in: orderDetails.restaurant.assignedDeliveryPartners },
                  status: 'AVAILABLE',
                  telegramPhone: { not: null },
                },
                select: { telegramPhone: true },
              });

              for (const partner of partners) {
                if (partner.telegramPhone && orderDetails) {
                  await telegramBot.sendOrderNotificationWithDetails(
                    partner.telegramPhone,
                    orderDetails.id,
                    orderDetails.orderNumber,
                    orderDetails.restaurant.name,
                    orderDetails.restaurant.address,
                    orderDetails.customer.user?.name || 'Customer',
                    orderDetails.totalAmount,
                    orderDetails.verificationCode,
                    orderDetails.restaurant.latitude,
                    orderDetails.restaurant.longitude,
                    orderDetails.deliveryAddress?.latitude || 0,
                    orderDetails.deliveryAddress?.longitude || 0,
                    orderDetails.deliveryAddress 
                      ? `${orderDetails.deliveryAddress.street}, ${orderDetails.deliveryAddress.city}`
                      : 'Pickup at restaurant',
                    orderDetails._count.orderItems
                  );
                }
              }
            }
          }
        } catch (e) {
          console.error('Failed to notify partners after payment:', e);
        }
      });
    }

    return response;
  } catch (error) {
    console.error('Payment verification failed:', error);
    return NextResponse.json(
      { success: false, error: 'Payment verification failed' },
      { status: 500 }
    );
  }
}
