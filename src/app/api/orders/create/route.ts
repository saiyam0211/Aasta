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
    const { cart, deliveryAddress, orderType, addressId } = body as any;
    const isPickup = orderType === 'PICKUP';

    const userId = session.user.id;

    // Validate cart
    if (!cart || !Array.isArray(cart.items) || cart.items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Cart is empty' },
        { status: 400 }
      );
    }

    // Validate delivery address only for delivery orders
    if (!isPickup && (!deliveryAddress || !deliveryAddress.address)) {
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

    // Validate menu items availability and stock
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

    // Check stock availability for each item
    for (const cartItem of cart.items) {
      const menuItem = menuItems.find(item => item.id === cartItem.menuItemId);
      if (menuItem) {
        const currentStock = menuItem.stockLeft || 0;
        if (currentStock < cartItem.quantity) {
          return NextResponse.json(
            { 
              success: false, 
              error: `Insufficient stock for ${menuItem.name}. Available: ${currentStock}, Requested: ${cartItem.quantity}` 
            },
            { status: 400 }
          );
        }
      }
    }

    // Calculate totals
    const subtotal = cart.items.reduce((total: number, item: any) => {
      return total + item.menuItem.price * item.quantity;
    }, 0);

    const taxes = subtotal * 0.05; // 5% tax
    const deliveryFee = isPickup ? 0 : (cart.deliveryFee ?? 25);
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

    // Resolve delivery/pickup address without creating duplicates
    let createdDeliveryAddress: any = null;
    if (isPickup) {
      createdDeliveryAddress = {
        id: 'pickup-temp',
        latitude: restaurant.latitude || 0,
        longitude: restaurant.longitude || 0,
        street: restaurant.address || 'Pickup at restaurant',
        city: 'Bengaluru',
      };
    } else {
      if (addressId) {
        const existing = await prisma.address.findFirst({
          where: { id: addressId, customerId: customer.id },
        });
        if (!existing) {
          return NextResponse.json(
            { success: false, error: 'Invalid address selected' },
            { status: 400 }
          );
        }
        createdDeliveryAddress = existing;
      } else {
        const addrText = (deliveryAddress && deliveryAddress.address) || '';
        const maybeExisting = await prisma.address.findFirst({
          where: { customerId: customer.id, street: addrText },
        });
        if (maybeExisting) {
          createdDeliveryAddress = maybeExisting;
        } else {
          createdDeliveryAddress = await prisma.address.create({
            data: {
              customerId: customer.id,
              type: 'OTHER',
              street: addrText,
              city: (deliveryAddress && deliveryAddress.city) || 'Bengaluru',
              state: (deliveryAddress && deliveryAddress.state) || 'Karnataka',
              zipCode: (deliveryAddress && deliveryAddress.zipCode) || '560001',
              latitude: (deliveryAddress && deliveryAddress.latitude) || 0,
              longitude: (deliveryAddress && deliveryAddress.longitude) || 0,
              isDefault: false,
            },
          });
        }
      }
    }

    // Calculate distance and ETA using Google Maps API
    let deliveryDistance: number | null = null;
    let estimatedDeliveryDuration: number | null = null;
    let calculatedDeliveryTime: Date | null = null;

    try {
      if (!isPickup) {
        // Validate coordinates before making API call
        const restaurantLat: number = Number(restaurant.latitude || 0);
        const restaurantLng: number = Number(restaurant.longitude || 0);
        const customerLat: number = Number(
          createdDeliveryAddress.latitude || 0
        );
        const customerLng: number = Number(
          createdDeliveryAddress.longitude || 0
        );

        // Validate coordinates
        const isValidCoordinate = (lat: number, lng: number): boolean => {
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

          deliveryDistance = Number(deliveryCalculation.distance || 0);
          estimatedDeliveryDuration = Number(deliveryCalculation.duration || 0);
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
        deliveryAddressId:
          createdDeliveryAddress && createdDeliveryAddress.id !== 'pickup-temp'
            ? createdDeliveryAddress.id
            : undefined,
        estimatedPreparationTime: restaurant.averagePreparationTime,
        estimatedDeliveryTime:
          calculatedDeliveryTime || new Date(Date.now() + 45 * 60 * 1000), // Use calculated time or fallback to 45 minutes
        deliveryDistance: deliveryDistance, // Store calculated distance in km
        estimatedDeliveryDuration: estimatedDeliveryDuration, // Store calculated ETA in minutes
        orderType: isPickup ? 'PICKUP' : 'DELIVERY',
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

    // Reduce stock for each ordered item
    for (const item of cart.items) {
      await prisma.menuItem.update({
        where: { id: item.menuItemId },
        data: {
          stockLeft: {
            decrement: item.quantity,
          },
          // Keep available as true even if stock reaches 0
          available: true,
        },
      });
    }

    // Note: Do not notify delivery partners here. Notifications should be sent only after payment confirmation.

    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error('Order creation failed:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create order' },
      { status: 500 }
    );
  }
}
