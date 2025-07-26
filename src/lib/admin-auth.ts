import { NextRequest } from 'next/server';

export interface AdminUser {
  email: string;
  role: 'admin';
  name: string;
}

// Hardcoded admin credentials
const ADMIN_CREDENTIALS = {
  email: 'hi@aasta.food',
  password: '@asta.food',
  name: 'Aasta Admin'
};

export function validateAdminCredentials(email: string, password: string): AdminUser | null {
  if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
    return {
      email: ADMIN_CREDENTIALS.email,
      role: 'admin',
      name: ADMIN_CREDENTIALS.name
    };
  }
  return null;
}

export function isValidAdminSession(sessionData: any): boolean {
  return sessionData?.user?.email === ADMIN_CREDENTIALS.email && sessionData?.user?.role === 'admin';
}

// Admin session management using localStorage (client-side)
export const adminSession = {
  set: (user: AdminUser) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('admin_session', JSON.stringify({
        user,
        timestamp: Date.now()
      }));
    }
  },
  
  get: (): AdminUser | null => {
    if (typeof window !== 'undefined') {
      const session = localStorage.getItem('admin_session');
      if (session) {
        const parsed = JSON.parse(session);
        // Check if session is less than 24 hours old
        if (Date.now() - parsed.timestamp < 24 * 60 * 60 * 1000) {
          return parsed.user;
        }
      }
    }
    return null;
  },
  
  clear: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('admin_session');
    }
  }
};
