import { prisma } from './prisma';

export class OrderService {
  async createOrder(orderData: any) {
    // Calculate totals
    const subtotal = orderData.items.reduce((sum: number, item: any) => 
      sum + (item.unitPrice * item.quantity), 0
    );
    const deliveryFee = orderData.deliveryFee || 50;
    const taxes = subtotal * 0.05; // 5% tax
    const discountAmount = orderData.discountAmount || 0;
    const totalAmount = subtotal + deliveryFee + taxes - discountAmount;

    // Generate unique order number
    const orderNumber = `ORD${Date.now()}`;
    const verificationCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerId: orderData.customerId,
        restaurantId: orderData.restaurantId,
        deliveryAddressId: orderData.deliveryAddressId,
        subtotal,
        deliveryFee,
        taxes,
        discountAmount,
        totalAmount,
        estimatedPreparationTime: orderData.estimatedPreparationTime || 30,
        verificationCode,
        status: 'PLACED',
        specialInstructions: orderData.specialInstructions,
        orderItems: {
          create: orderData.items.map((item: any) => ({
            menuItemId: item.menuItemId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.unitPrice * item.quantity,
            customizations: item.customizations || {}
          }))
        }
      },
      include: {
        orderItems: true,
        customer: true,
        restaurant: true,
        deliveryAddress: true,
      },
    });

    return order;
  }

  async updateOrderStatus(orderId: string, status: 'PLACED' | 'CONFIRMED' | 'PREPARING' | 'READY_FOR_PICKUP' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED') {
    const order = await prisma.order.update({
      where: { id: orderId },
      data: { status },
      include: {
        orderItems: true,
        customer: true,
        restaurant: true,
      },
    });

    return order;
  }

  async assignDeliveryPartner(orderId: string) {
    // Find available delivery partners
    const availablePartners = await prisma.deliveryPartner.findMany({
      where: {
        status: 'AVAILABLE',
      },
      orderBy: {
        completedDeliveries: 'asc', // Assign to partner with fewest completed deliveries
      },
      take: 1,
    });

    if (availablePartners.length === 0) {
      throw new Error('No delivery partners available');
    }

    const partner = availablePartners[0];

    // Update order with delivery partner
    const order = await prisma.order.update({
      where: { id: orderId },
      data: { deliveryPartnerId: partner.id },
      include: {
        orderItems: true,
        customer: true,
        restaurant: true,
        deliveryPartner: true,
      },
    });

    return order;
  }

  async getOrders(customerId?: string, page = 1, limit = 10) {
    const where = customerId ? { customerId } : {};
    
    const orders = await prisma.order.findMany({
      where,
      include: {
        orderItems: true,
        restaurant: true,
        deliveryPartner: true,
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return orders;
  }
}
