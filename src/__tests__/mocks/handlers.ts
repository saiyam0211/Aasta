import { http, HttpResponse } from 'msw';

export const handlers = [
  // Mock API endpoints
  http.get('/api/admin/restaurants', () => {
    return HttpResponse.json([
      {
        id: '1',
        name: 'Test Restaurant',
        description: 'A test restaurant',
        imageUrl: 'https://example.com/image.jpg',
        isActive: true,
        createdAt: new Date().toISOString(),
      },
    ]);
  }),

  http.get('/api/admin/users', () => {
    return HttpResponse.json([
      {
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        role: 'CUSTOMER',
        createdAt: new Date().toISOString(),
      },
    ]);
  }),

  http.get('/api/analytics/metrics', () => {
    return HttpResponse.json({
      data: {
        totalOrders: 100,
        totalRevenue: 50000,
        activeDeliveryPartners: 10,
        activeRestaurants: 5,
      },
    });
  }),

  http.get('/api/delivery-partners', () => {
    return HttpResponse.json([
      {
        id: '1',
        userId: '1',
        status: 'AVAILABLE',
        currentLocation: {
          lat: 28.6139,
          lng: 77.209,
        },
        createdAt: new Date().toISOString(),
      },
    ]);
  }),

  http.get('/api/orders', () => {
    return HttpResponse.json([
      {
        id: '1',
        orderNumber: 'ORD-001',
        status: 'PENDING',
        totalAmount: 500,
        customerId: '1',
        restaurantId: '1',
        createdAt: new Date().toISOString(),
      },
    ]);
  }),

  http.post('/api/orders/create', async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({
      id: '1',
      orderNumber: 'ORD-001',
      status: 'PENDING',
      ...body,
      createdAt: new Date().toISOString(),
    });
  }),

  http.get('/api/restaurants', () => {
    return HttpResponse.json([
      {
        id: '1',
        name: 'Test Restaurant',
        description: 'A test restaurant',
        imageUrl: 'https://example.com/image.jpg',
        isActive: true,
        createdAt: new Date().toISOString(),
      },
    ]);
  }),

  http.post('/api/restaurants', async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({
      id: '1',
      ...body,
      createdAt: new Date().toISOString(),
    });
  }),

  http.get('/api/payments/create-order', () => {
    return HttpResponse.json({
      id: 'order_test_123',
      amount: 50000,
      currency: 'INR',
      receipt: 'receipt_123',
    });
  }),

  http.post('/api/payments/verify-payment', async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({
      success: true,
      orderId: body.orderId,
    });
  }),
];
