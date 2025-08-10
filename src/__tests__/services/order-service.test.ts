import { OrderService } from '@/lib/order-service';

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    order: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
    },
    deliveryPartner: {
      findMany: jest.fn(),
    },
  },
}));

describe('OrderService', () => {
  let orderService: OrderService;

  beforeEach(() => {
    orderService = new OrderService();
    jest.clearAllMocks();
  });

  describe('createOrder', () => {
    it('should create an order successfully', async () => {
      const mockOrder = {
        id: '1',
        customerId: 'customer1',
        restaurantId: 'restaurant1',
        total: 25.99,
        status: 'PENDING',
      };

      const { prisma } = require('@/lib/prisma');
      prisma.order.create.mockResolvedValue(mockOrder);

      const orderData = {
        customerId: 'customer1',
        restaurantId: 'restaurant1',
        items: [
          { menuItemId: 'item1', quantity: 2, price: 12.99 }
        ],
        deliveryAddress: {
          street: '123 Main St',
          city: 'Test City',
          postalCode: '12345',
        },
      };

      const result = await orderService.createOrder(orderData);

      expect(result).toEqual(mockOrder);
      expect(prisma.order.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          customerId: orderData.customerId,
          restaurantId: orderData.restaurantId,
        }),
        include: expect.any(Object),
      });
    });

    it('should throw error for invalid order data', async () => {
      const invalidOrderData = {
        customerId: '',
        restaurantId: '',
        items: [],
      };

      await expect(orderService.createOrder(invalidOrderData as any))
        .rejects.toThrow('Invalid order data');
    });
  });

  describe('updateOrderStatus', () => {
    it('should update order status successfully', async () => {
      const orderId = '1';
      const status = 'CONFIRMED';
      const mockUpdatedOrder = {
        id: orderId,
        status,
        customerId: 'customer1',
      };

      const { prisma } = require('@/lib/prisma');
      prisma.order.update.mockResolvedValue(mockUpdatedOrder);

      const result = await orderService.updateOrderStatus(orderId, status);

      expect(result).toEqual(mockUpdatedOrder);
      expect(prisma.order.update).toHaveBeenCalledWith({
        where: { id: orderId },
        data: { status },
        include: expect.any(Object),
      });
    });
  });

  describe('assignDeliveryPartner', () => {
    it('should assign available delivery partner', async () => {
      const orderId = '1';
      const mockPartners = [
        { id: 'partner1', isActive: true, currentOrders: 0 },
        { id: 'partner2', isActive: true, currentOrders: 1 },
      ];

      const { prisma } = require('@/lib/prisma');
      prisma.deliveryPartner.findMany.mockResolvedValue(mockPartners);
      prisma.order.update.mockResolvedValue({
        id: orderId,
        deliveryPartnerId: 'partner1',
      });

      const result = await orderService.assignDeliveryPartner(orderId);

      expect(result.deliveryPartnerId).toBe('partner1');
      expect(prisma.order.update).toHaveBeenCalledWith({
        where: { id: orderId },
        data: { deliveryPartnerId: 'partner1' },
        include: expect.any(Object),
      });
    });

    it('should throw error when no delivery partners available', async () => {
      const orderId = '1';
      const { prisma } = require('@/lib/prisma');
      prisma.deliveryPartner.findMany.mockResolvedValue([]);

      await expect(orderService.assignDeliveryPartner(orderId))
        .rejects.toThrow('No available delivery partners');
    });
  });
});
