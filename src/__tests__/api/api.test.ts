import { createMocks } from 'node-mocks-http'
import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth/next'

// Import API handlers
import { GET as adminRestaurantsGET, POST as adminRestaurantsPOST } from '../../app/api/admin/restaurants/route'
import { GET as adminUsersGET } from '../../app/api/admin/users/route'
import { GET as analyticsMetricsGET } from '../../app/api/analytics/metrics/route'
import { GET as deliveryPartnersGET, POST as deliveryPartnersPOST } from '../../app/api/delivery-partners/route'
import { GET as ordersGET, POST as ordersPOST } from '../../app/api/orders/route'
import { POST as ordersCreatePOST } from '../../app/api/orders/create/route'
import { GET as restaurantsGET, POST as restaurantsPOST } from '../../app/api/restaurants/route'
import { POST as paymentsCreateOrderPOST } from '../../app/api/payments/create-order/route'
import { POST as paymentsVerifyPOST } from '../../app/api/payments/verify-payment/route'

// Mock next-auth session
const mockSession = {
  user: {
    id: '1',
    email: 'test@example.com',
    name: 'Test User',
    role: 'ADMIN',
  },
}

jest.mocked(getServerSession).mockResolvedValue(mockSession)

describe('API Integration Tests', () => {
  describe('/api/admin/restaurants', () => {
    it('should retrieve all restaurants (GET)', async () => {
      const { req } = createMocks({
        method: 'GET',
      })
      
      const request = new NextRequest('http://localhost:3000/api/admin/restaurants', {
        method: 'GET',
      })
      
      const response = await adminRestaurantsGET(request)
      const data = await response.json()
      
      expect(response.status).toBe(200)
      expect(Array.isArray(data)).toBe(true)
    })

    it('should create a new restaurant (POST)', async () => {
      const restaurantData = {
        name: 'New Test Restaurant',
        description: 'A new test restaurant',
        address: '123 Test Street',
        phone: '+1234567890',
        email: 'restaurant@test.com',
      }
      
      const request = new NextRequest('http://localhost:3000/api/admin/restaurants', {
        method: 'POST',
        body: JSON.stringify(restaurantData),
        headers: {
          'content-type': 'application/json',
        },
      })
      
      const response = await adminRestaurantsPOST(request)
      const data = await response.json()
      
      expect(response.status).toBe(201)
      expect(data).toHaveProperty('id')
      expect(data.name).toBe(restaurantData.name)
    })
  })

  describe('/api/admin/users', () => {
    it('should retrieve all users', async () => {
      const request = new NextRequest('http://localhost:3000/api/admin/users', {
        method: 'GET',
      })
      
      const response = await adminUsersGET(request)
      const data = await response.json()
      
      expect(response.status).toBe(200)
      expect(Array.isArray(data)).toBe(true)
    })
  })

  describe('/api/analytics/metrics', () => {
    it('should retrieve analytics metrics', async () => {
      const request = new NextRequest('http://localhost:3000/api/analytics/metrics', {
        method: 'GET',
      })
      
      const response = await analyticsMetricsGET(request)
      const data = await response.json()
      
      expect(response.status).toBe(200)
      expect(data).toHaveProperty('data')
      expect(data.data).toHaveProperty('totalOrders')
      expect(data.data).toHaveProperty('totalRevenue')
    })
  })

  describe('/api/delivery-partners', () => {
    it('should retrieve delivery partners (GET)', async () => {
      const request = new NextRequest('http://localhost:3000/api/delivery-partners', {
        method: 'GET',
      })
      
      const response = await deliveryPartnersGET(request)
      const data = await response.json()
      
      expect(response.status).toBe(200)
      expect(Array.isArray(data)).toBe(true)
    })

    it('should create a new delivery partner (POST)', async () => {
      const partnerData = {
        name: 'Test Partner',
        email: 'partner@test.com',
        phone: '+1234567890',
        vehicleType: 'BIKE',
      }
      
      const request = new NextRequest('http://localhost:3000/api/delivery-partners', {
        method: 'POST',
        body: JSON.stringify(partnerData),
        headers: {
          'content-type': 'application/json',
        },
      })
      
      const response = await deliveryPartnersPOST(request)
      const data = await response.json()
      
      expect(response.status).toBe(201)
      expect(data).toHaveProperty('id')
      expect(data.name).toBe(partnerData.name)
    })
  })

  describe('/api/orders', () => {
    it('should retrieve orders (GET)', async () => {
      const request = new NextRequest('http://localhost:3000/api/orders', {
        method: 'GET',
      })
      
      const response = await ordersGET(request)
      const data = await response.json()
      
      expect(response.status).toBe(200)
      expect(Array.isArray(data)).toBe(true)
    })
  })

  describe('/api/orders/create', () => {
    it('should create a new order', async () => {
      const orderData = {
        restaurantId: '1',
        items: [
          {
            id: '1',
            name: 'Test Item',
            price: 500,
            quantity: 2,
          },
        ],
        deliveryAddress: {
          street: '123 Test Street',
          city: 'Test City',
          postalCode: '12345',
        },
        paymentMethod: 'ONLINE',
      }
      
      const request = new NextRequest('http://localhost:3000/api/orders/create', {
        method: 'POST',
        body: JSON.stringify(orderData),
        headers: {
          'content-type': 'application/json',
        },
      })
      
      const response = await ordersCreatePOST(request)
      const data = await response.json()
      
      expect(response.status).toBe(201)
      expect(data).toHaveProperty('id')
      expect(data).toHaveProperty('orderNumber')
      expect(data.status).toBe('PENDING')
    })
  })

  describe('/api/restaurants', () => {
    it('should retrieve restaurants (GET)', async () => {
      const request = new NextRequest('http://localhost:3000/api/restaurants', {
        method: 'GET',
      })
      
      const response = await restaurantsGET(request)
      const data = await response.json()
      
      expect(response.status).toBe(200)
      expect(Array.isArray(data)).toBe(true)
    })

    it('should create a restaurant (POST)', async () => {
      const restaurantData = {
        name: 'Test Restaurant',
        description: 'A test restaurant',
        address: '123 Test Street',
        phone: '+1234567890',
        email: 'test@restaurant.com',
      }
      
      const request = new NextRequest('http://localhost:3000/api/restaurants', {
        method: 'POST',
        body: JSON.stringify(restaurantData),
        headers: {
          'content-type': 'application/json',
        },
      })
      
      const response = await restaurantsPOST(request)
      const data = await response.json()
      
      expect(response.status).toBe(201)
      expect(data).toHaveProperty('id')
      expect(data.name).toBe(restaurantData.name)
    })
  })

  describe('/api/payments/create-order', () => {
    it('should create a payment order', async () => {
      const paymentData = {
        amount: 50000,
        currency: 'INR',
        receipt: 'receipt_123',
      }
      
      const request = new NextRequest('http://localhost:3000/api/payments/create-order', {
        method: 'POST',
        body: JSON.stringify(paymentData),
        headers: {
          'content-type': 'application/json',
        },
      })
      
      const response = await paymentsCreateOrderPOST(request)
      const data = await response.json()
      
      expect(response.status).toBe(200)
      expect(data).toHaveProperty('id')
      expect(data.amount).toBe(paymentData.amount)
      expect(data.currency).toBe(paymentData.currency)
    })
  })

  describe('/api/payments/verify-payment', () => {
    it('should verify payment', async () => {
      const verificationData = {
        razorpay_order_id: 'order_test_123',
        razorpay_payment_id: 'pay_test_123',
        razorpay_signature: 'signature_test_123',
      }
      
      const request = new NextRequest('http://localhost:3000/api/payments/verify-payment', {
        method: 'POST',
        body: JSON.stringify(verificationData),
        headers: {
          'content-type': 'application/json',
        },
      })
      
      const response = await paymentsVerifyPOST(request)
      const data = await response.json()
      
      expect(response.status).toBe(200)
      expect(data).toHaveProperty('success')
      expect(data.success).toBe(true)
    })
  })

  // Error handling tests
  describe('Error Handling', () => {
    it('should handle missing authentication', async () => {
      jest.mocked(getServerSession).mockResolvedValueOnce(null)
      
      const request = new NextRequest('http://localhost:3000/api/admin/restaurants', {
        method: 'GET',
      })
      
      const response = await adminRestaurantsGET(request)
      
      expect(response.status).toBe(401)
    })

    it('should handle invalid request data', async () => {
      const invalidData = {
        // Missing required fields
      }
      
      const request = new NextRequest('http://localhost:3000/api/restaurants', {
        method: 'POST',
        body: JSON.stringify(invalidData),
        headers: {
          'content-type': 'application/json',
        },
      })
      
      const response = await restaurantsPOST(request)
      
      expect(response.status).toBe(400)
    })
  })
})

