// import { UserRole } from '@prisma/client'; // Will uncomment after Prisma client generation
import NextAuth from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
      role: string; // Will be properly typed after Prisma client generation
      phone?: string | null;
      customerId?: string;
      deliveryPartnerId?: string;
      restaurantId?: string;
      isNewUser?: boolean;
    };
  }

  interface User {
    id: string;
    email: string;
    name?: string | null;
    image?: string | null;
    role: string; // Will be properly typed after Prisma client generation
    phone?: string | null;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    email: string;
    role: string; // Will be properly typed after Prisma client generation
    phone?: string | null;
    customerId?: string;
    deliveryPartnerId?: string;
    restaurantId?: string;
    isNewUser?: boolean;
  }
}
