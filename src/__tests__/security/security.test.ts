import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth/next';

// Import API handlers
import { GET as adminRestaurantsGET } from '../../app/api/admin/restaurants/route';
import { POST as restaurantsPOST } from '../../app/api/restaurants/route';

// Mock next-auth session
const mockAdminSession = {
  user: {
    id: '1',
    email: 'admin@example.com',
    name: 'Admin User',
    role: 'ADMIN',
  },
};

const mockCustomerSession = {
  user: {
    id: '2',
    email: 'customer@example.com',
    name: 'Customer User',
    role: 'CUSTOMER',
  },
};

jest.mocked(getServerSession).mockResolvedValue(mockAdminSession);

describe('Security Tests', () => {
  describe('Authentication Tests', () => {
    it('should require authentication for admin routes', async () => {
      jest.mocked(getServerSession).mockResolvedValueOnce(null);

      const request = new NextRequest(
        'http://localhost:3000/api/admin/restaurants',
        {
          method: 'GET',
        }
      );

      const response = await adminRestaurantsGET(request);

      expect(response.status).toBe(401);
    });
  });

  describe('Authorization Tests', () => {
    it('should prevent customers from accessing admin resources', async () => {
      jest.mocked(getServerSession).mockResolvedValueOnce(mockCustomerSession);

      const request = new NextRequest(
        'http://localhost:3000/api/admin/restaurants',
        {
          method: 'GET',
        }
      );

      const response = await adminRestaurantsGET(request);

      expect(response.status).toBe(403);
    });
  });

  describe('Input Validation Tests', () => {
    it('should prevent SQL Injection and similar attacks', async () => {
      const maliciousPayload = {
        name: "Robert'); DROP TABLE Students;--",
        email: 'hacker@example.com',
      };

      const request = new NextRequest('http://localhost:3000/api/restaurants', {
        method: 'POST',
        body: JSON.stringify(maliciousPayload),
        headers: {
          'content-type': 'application/json',
        },
      });

      const response = await restaurantsPOST(request);

      expect(response.status).toBe(400);
    });
  });
});
