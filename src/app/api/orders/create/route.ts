import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';
import { generateOrderNumber } from '@/lib/order-utils';
import { googleMapsService } from '@/lib/google-maps';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { cart, deliveryAddress } = body;

    const userId = session.user.id;

    // Validate cart
    if (!cart || !Array.isArray(cart.items) || cart.items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Cart is empty' },
        { status: 400 }
      );
    }

    // Validate delivery address
    if (!deliveryAddress || !deliveryAddress.address) {
      return NextResponse.json(
        { success: false, error: 'Delivery address is required' },
        { status: 400 }
      );
    }

    // Fetch restaurant to validate
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: cart.restaurantId },
      include: { menuItems: true },
    });

    if (!restaurant) {
      return NextResponse.json(
        { success: false, error: 'Restaurant not found' },
        { status: 404 }
      );
    }

    // Check restaurant operating hours (simplified)
    if (restaurant.status !== 'ACTIVE') {
      return NextResponse.json(
        { success: false, error: 'Restaurant is currently closed' },
        { status: 400 }
      );
    }

    // Validate menu items availability
    const menuItemIds = cart.items.map((item: any) => item.menuItemId);
    const menuItems = await prisma.menuItem.findMany({
      where: {
        id: { in: menuItemIds },
        restaurantId: cart.restaurantId,
        available: true,
      },
    });

    if (menuItems.length !== cart.items.length) {
      return NextResponse.json(
        { success: false, error: 'Some items are no longer available' },
        { status: 400 }
      );
    }

    // Calculate totals
    const subtotal = cart.items.reduce((total: number, item: any) => {
      return total + item.menuItem.price * item.quantity;
    }, 0);

    const taxes = subtotal * 0.05; // 5% tax
    const deliveryFee = cart.deliveryFee || 25;
    const total = subtotal + taxes + deliveryFee;

    // Check minimum order amount
    if (subtotal < restaurant.minimumOrderAmount) {
      return NextResponse.json(
        {
          success: false,
          error: `Minimum order amount is ₹${restaurant.minimumOrderAmount}`,
        },
        { status: 400 }
      );
    }

    // Generate order number
    const orderNumber = generateOrderNumber();

    // First find or create the customer record
    let customer = await prisma.customer.findUnique({
      where: { userId },
      include: {
        user: true,
      },
    });

    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          userId,
          favoriteRestaurants: [],
        },
        include: {
          user: true,
        },
      });
    }

    // Create delivery address
    const createdDeliveryAddress = await prisma.address.create({
      data: {
        customerId: customer.id,
        type: 'OTHER',
        street: deliveryAddress.address,
        city: deliveryAddress.city || 'Bengaluru',
        state: deliveryAddress.state || 'Karnataka',
        zipCode: deliveryAddress.zipCode || '560001',
        latitude: deliveryAddress.latitude || 0,
        longitude: deliveryAddress.longitude || 0,
        isDefault: false,
      },
    });

    // Calculate distance and ETA using Google Maps API
    let deliveryDistance: number | null = null;
    let estimatedDeliveryDuration: number | null = null;
    let calculatedDeliveryTime: Date | null = null;

    try {
      // Validate coordinates before making API call
      const restaurantLat = restaurant.latitude;
      const restaurantLng = restaurant.longitude;
      const customerLat = createdDeliveryAddress.latitude || 0;
      const customerLng = createdDeliveryAddress.longitude || 0;

      // Validate coordinates
      const isValidCoordinate = (lat: number, lng: number) => {
        return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
      };

      if (
        isValidCoordinate(restaurantLat, restaurantLng) &&
        isValidCoordinate(customerLat, customerLng) &&
        customerLat !== 0 &&
        customerLng !== 0
      ) {
        console.log(`Calculating delivery metrics for order ${orderNumber}`);
        console.log(`Restaurant: ${restaurantLat}, ${restaurantLng}`);
        console.log(`Customer: ${customerLat}, ${customerLng}`);

        const deliveryCalculation =
          await googleMapsService.calculateDeliveryMetrics(
            restaurantLat,
            restaurantLng,
            customerLat,
            customerLng,
            restaurant.averagePreparationTime
          );

        deliveryDistance = deliveryCalculation.distance;
        estimatedDeliveryDuration = deliveryCalculation.duration;
        calculatedDeliveryTime =
          deliveryCalculation.estimatedDeliveryTime || null;

        console.log(`Delivery calculation completed:`);
        console.log(`Distance: ${deliveryDistance} km`);
        console.log(`Duration: ${estimatedDeliveryDuration} minutes`);
        console.log(
          `Estimated delivery time: ${calculatedDeliveryTime?.toISOString()}`
        );
      } else {
        console.warn(
          `Invalid coordinates for distance calculation. Restaurant: ${restaurantLat}, ${restaurantLng}, Customer: ${customerLat}, ${customerLng}`
        );
      }
    } catch (mapsError) {
      console.error('Error calculating delivery metrics:', mapsError);
      // Continue with order creation even if distance calculation fails
    }

    // Generate a verification code
    const verificationCode = Math.floor(1000 + Math.random() * 9000).toString();

    // Create order
    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerId: customer.id,
        restaurantId: cart.restaurantId,
        totalAmount: total,
        taxes,
        deliveryFee,
        subtotal,
        status: 'PLACED',
        paymentStatus: 'pending',
        deliveryAddressId: createdDeliveryAddress.id,
        estimatedPreparationTime: restaurant.averagePreparationTime,
        estimatedDeliveryTime:
          calculatedDeliveryTime || new Date(Date.now() + 45 * 60 * 1000), // Use calculated time or fallback to 45 minutes
        deliveryDistance: deliveryDistance, // Store calculated distance in km
        estimatedDeliveryDuration: estimatedDeliveryDuration, // Store calculated ETA in minutes
        verificationCode: verificationCode,
        orderItems: {
          create: cart.items.map((item: any) => {
            const originalPrice =
              item.menuItem.originalPrice || item.menuItem.price;
            return {
              menuItemId: item.menuItemId,
              quantity: item.quantity,
              unitPrice: item.menuItem.price, // Selling price
              totalPrice: item.menuItem.price * item.quantity, // Total selling price
              originalUnitPrice: originalPrice, // Original price per unit
              totalOriginalPrice: originalPrice * item.quantity, // Total original price
              restaurantEarningsPerItem:
                originalPrice * (restaurant.restaurantPricePercentage || 0.4),
              restaurantTotalEarnings:
                originalPrice *
                (restaurant.restaurantPricePercentage || 0.4) *
                item.quantity,
              aastaEarningsPerItem:
                originalPrice * (restaurant.aastaPricePercentage || 0.1),
              aastaTotalEarnings:
                originalPrice *
                (restaurant.aastaPricePercentage || 0.1) *
                item.quantity,
            };
          }),
        },
      },
      include: {
        orderItems: {
          include: {
            menuItem: true,
          },
        },
        restaurant: true,
        deliveryAddress: true,
      },
    });

    // Send notifications to ALL available delivery partners assigned to this restaurant
    try {
      if (restaurant.assignedDeliveryPartners.length > 0) {
        // Find available delivery partners assigned to this restaurant
        const availablePartners = await prisma.deliveryPartner.findMany({
          where: {
            id: { in: restaurant.assignedDeliveryPartners },
            status: 'AVAILABLE',
            telegramChatId: { not: null }, // Only partners with Telegram registered
          },
          include: {
            user: true,
          },
        });

        if (availablePartners.length > 0) {
          // Send notification to ALL available partners
          const botToken = process.env.TELEGRAM_BOT_TOKEN;
          if (botToken) {
            const { TelegramBotService } = await import(
              '@/lib/telegram-bot-service'
            );
            const telegramBot = new TelegramBotService(botToken);

            let notificationsSent = 0;

            for (const partner of availablePartners) {
              if (partner.telegramPhone) {
                try {
                  await telegramBot.sendOrderNotificationWithDetails(
                    partner.telegramPhone,
                    order.id,
                    order.orderNumber,
                    restaurant.name,
                    restaurant.address,
                    customer.user?.name || 'Anonymous',
                    order.totalAmount,
                    verificationCode,
                    restaurant.latitude,
                    restaurant.longitude,
                    createdDeliveryAddress.latitude || 0,
                    createdDeliveryAddress.longitude || 0,
                    `${createdDeliveryAddress.street}, ${createdDeliveryAddress.city}`,
                    order.orderItems.length
                  );
                  notificationsSent++;
                  console.log(
                    `Order notification sent to partner ${partner.user?.name}`
                  );
                } catch (notificationError) {
                  console.error(
                    `Failed to send Telegram notification to partner ${partner.user?.name}:`,
                    notificationError
                  );
                }
              }
            }

            console.log(
              `Order ${order.orderNumber} notifications sent to ${notificationsSent} available delivery partners`
            );
          }
        } else {
          console.log(
            `No available delivery partners found for restaurant ${restaurant.name}. Order ${order.orderNumber} will remain unassigned.`
          );
        }
      } else {
        console.log(
          `No delivery partners assigned to restaurant ${restaurant.name}. Order ${order.orderNumber} will remain unassigned.`
        );
      }
    } catch (assignmentError) {
      console.error(
        'Error sending notifications to delivery partners:',
        assignmentError
      );
      // Don't fail the order creation if assignment fails
    }

    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error('Order creation failed:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create order' },
      { status: 500 }
    );
  }
}
