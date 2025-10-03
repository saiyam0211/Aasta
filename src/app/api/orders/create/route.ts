import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';
import { generateOrderNumber } from '@/lib/order-utils';
import { googleMapsService } from '@/lib/google-maps';
import PaymentService from '@/lib/payment-service';

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

    // Prepare queries in parallel to reduce latency
    const restaurantPromise = prisma.restaurant.findUnique({
      where: { id: cart.restaurantId },
      select: {
        id: true,
        name: true,
        ownerId: true,
        latitude: true,
        longitude: true,
        address: true,
        averagePreparationTime: true,
        minimumOrderAmount: true,
        deliveryRadius: true,
        commissionRate: true,
        status: true,
        aastaPricePercentage: true,
        restaurantPricePercentage: true,
      },
    });

    // (moved below after Promise.all)

    // Validate menu items availability and stock
    const menuItemIds = cart.items.map((item: any) => item.menuItemId);
    const menuItemsPromise = prisma.menuItem.findMany({
      where: {
        id: { in: menuItemIds },
        restaurantId: cart.restaurantId,
        available: true,
      },
      select: {
        id: true,
        name: true,
        price: true,
        originalPrice: true,
        stockLeft: true,
      },
    });

    const [restaurant, menuItems] = await Promise.all([
      restaurantPromise,
      menuItemsPromise,
    ]);


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
      select: { 
        id: true,
        user: {
          select: {
            phone: true,
            email: true,
          }
        }
      },
    });

    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          userId,
          favoriteRestaurants: [],
        },
        select: { 
          id: true,
          user: {
            select: {
              phone: true,
              email: true,
            }
          }
        },
      });
    }

    console.log('Customer found/created:', { id: customer.id, hasUser: !!customer.user });

    // Resolve delivery/pickup address without creating duplicates
    let createdDeliveryAddress: any = null;
    if (isPickup) {
      createdDeliveryAddress = null; // No address needed for pickup orders
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

    // Skip Google Maps ETA/distance to avoid blocking order creation
    let deliveryDistance: number | null = null;
    let estimatedDeliveryDuration: number | null = null;
    const calculatedDeliveryTime: Date | null = null;

    // Generate a verification code
    const verificationCode = Math.floor(1000 + Math.random() * 9000).toString();

    // Create order
    const order = await prisma.$transaction(async (tx) => {
      // For pickup orders, create a temporary pickup address
      let finalDeliveryAddressId = createdDeliveryAddress?.id;
      

      console.log('Creating order with deliveryAddressId:', finalDeliveryAddressId);


      const created = await tx.order.create({
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
          deliveryAddressId: finalDeliveryAddressId || null,
          estimatedPreparationTime: restaurant.averagePreparationTime,
          estimatedDeliveryTime:
            calculatedDeliveryTime || new Date(Date.now() + (restaurant.averagePreparationTime || 30) * 60 * 1000),
          deliveryDistance: deliveryDistance,
          estimatedDeliveryDuration: estimatedDeliveryDuration,
          orderType: isPickup ? 'PICKUP' : 'DELIVERY',
          verificationCode: verificationCode,
          // Defer order items to bulk create below for speed
        },
        select: {
          id: true,
          orderNumber: true,
          totalAmount: true,
          paymentStatus: true,
          razorpayOrderId: true,
        },
      });

      // Bulk insert order items for lower latency
      const orderItemsData = cart.items.map((item: any) => {
        const originalPrice = item.menuItem.originalPrice || item.menuItem.price;
        return {
          orderId: created.id,
          menuItemId: item.menuItemId,
          quantity: item.quantity,
          unitPrice: item.menuItem.price,
          totalPrice: item.menuItem.price * item.quantity,
          originalUnitPrice: originalPrice,
          totalOriginalPrice: originalPrice * item.quantity,
          restaurantEarningsPerItem:
            originalPrice * (restaurant.restaurantPricePercentage || 0.4),
          restaurantTotalEarnings:
            originalPrice * (restaurant.restaurantPricePercentage || 0.4) * item.quantity,
          aastaEarningsPerItem:
            originalPrice * (restaurant.aastaPricePercentage || 0.1),
          aastaTotalEarnings:
            originalPrice * (restaurant.aastaPricePercentage || 0.1) * item.quantity,
        };
      });
      await tx.orderItem.createMany({ data: orderItemsData });

      return created;
    });

    // Create Razorpay payment order immediately to avoid another HTTP roundtrip (idempotent)
    let razorpayOrderId = order.razorpayOrderId as string | null;
    let razorpayOrder: any = null;

    if (!razorpayOrderId) {
      const paymentService = new PaymentService();
      razorpayOrder = await paymentService.createPaymentOrder(
        order.totalAmount,
        order.orderNumber
      );

      // Persist payment linkage
      await prisma.order.update({
        where: { id: order.id },
        data: {
          razorpayOrderId: razorpayOrder.id,
          paymentStatus: 'PENDING',
        },
      });

      await prisma.payment.create({
        data: {
          orderId: order.id,
          razorpayOrderId: razorpayOrder.id,
          amount: order.totalAmount,
          currency: 'INR',
          status: 'CREATED',
          paymentMethod: 'RAZORPAY',
        },
      });
      razorpayOrderId = razorpayOrder.id;
    } else {
      // If already linked, hydrate minimal shape for client
      razorpayOrder = { id: razorpayOrderId, amount: Math.round(order.totalAmount * 100), currency: 'INR' };
    }

    // Note: Do not notify delivery partners here. Notifications should be sent only after payment confirmation.

    return NextResponse.json({
      success: true,
      order,
      razorpayOrder: {
        id: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        key: process.env.RAZORPAY_KEY_ID,
      },
    });
  } catch (error) {
    console.error('Order creation failed:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create order' },
      { status: 500 }
    );
  }
}
