import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
// import { UserRole } from '@prisma/client'; // Will uncomment after Prisma client generation

// Hardcoded admin credentials
const ADMIN_CREDENTIALS = {
  email: 'hi@aasta.food',
  password: '@asta.food',
  name: 'Aasta Admin',
};

export const authOptions: NextAuthOptions = {
  // Remove adapter to avoid OAuthAccountNotLinked errors
  // adapter: PrismaAdapter(prisma) as any,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
        },
      },
    }),
    CredentialsProvider({
      id: 'admin-credentials',
      name: 'Admin Login',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (
          credentials?.email === ADMIN_CREDENTIALS.email &&
          credentials?.password === ADMIN_CREDENTIALS.password
        ) {
          return {
            id: 'admin',
            email: ADMIN_CREDENTIALS.email,
            name: ADMIN_CREDENTIALS.name,
            role: 'ADMIN',
          } as any;
        }
        return null;
      },
    }),
    CredentialsProvider({
      id: 'restaurant-credentials',
      name: 'Restaurant Login',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          // Find user in database
          const user = await prisma.user.findUnique({
            where: {
              email: credentials.email,
              role: 'RESTAURANT_OWNER',
            } as any,
          });

          if (!user || !user.password) {
            return null;
          }

          // Verify password
          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!isPasswordValid) {
            return null;
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          } as any;
        } catch (error) {
          console.error('Restaurant auth error:', error);
          return null;
        }
      },
    }),
    CredentialsProvider({
      id: 'phone-otp',
      name: 'Phone OTP',
      credentials: {
        phone: { label: 'Phone', type: 'text' },
        name: { label: 'Name', type: 'text' },
      },
      async authorize(credentials) {
        const phoneRaw = credentials?.phone?.toString().trim();
        if (!phoneRaw) return null;
        const providedName = credentials?.name?.toString().trim();
        // Expect E.164 from client (+<country><number>)
        const phone = phoneRaw.startsWith('+') ? phoneRaw : `+91${phoneRaw}`;

        try {
          let user = await prisma.user.findFirst({ where: { phone } as any });
          if (!user) {
            user = await prisma.user.create({
              data: {
                phone,
                role: 'CUSTOMER',
                name:
                  providedName && providedName.length > 0
                    ? providedName
                    : 'Aasta User',
              } as any,
            });
            await prisma.customer.create({
              data: {
                userId: user.id,
                favoriteRestaurants: [],
              },
            });
          } else if (providedName && !user.name) {
            // Backfill name on first sign-in if it was missing
            user = await prisma.user.update({
              where: { id: user.id },
              data: { name: providedName },
            });
          }
          return {
            id: user.id,
            name: user.name || providedName || 'Asta User',
            email: user.email,
            role: user.role,
            phone: (user as any).phone || phone,
          } as any;
        } catch (error) {
          console.error('Phone OTP authorize error:', error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  callbacks: {
    async signIn({ user, account }) {
      try {
        // Allow if admin
        if ((user as any).role === 'ADMIN') {
          return true;
        }

        const userHasEmail = !!user.email;
        const userHasPhone = !!(user as any).phone;
        if (!userHasEmail && !userHasPhone) return false;

        // When signing in with Google, ensure user exists (by email)
        if (account?.provider === 'google' && userHasEmail) {
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email as string },
          });
          if (!existingUser) {
            const newUser = await prisma.user.create({
              data: {
                email: user.email!,
                name: user.name,
                image: user.image,
                googleId: account?.providerAccountId,
                role: 'CUSTOMER',
              },
            });
            await prisma.customer.create({
              data: {
                userId: newUser.id,
                favoriteRestaurants: [],
              },
            });
          }
          return true;
        }

        // When signing in with phone credentials, ensure user exists (by phone)
        if (account?.provider === 'phone-otp' && userHasPhone) {
          const phone = (user as any).phone as string;
          const existingByPhone = await prisma.user.findFirst({
            where: { phone } as any,
          });
          if (!existingByPhone) {
            const newUser = await prisma.user.create({
              data: {
                phone,
                name: user.name || 'Aasta User',
                role: 'CUSTOMER',
              } as any,
            });
            await prisma.customer.create({
              data: {
                userId: newUser.id,
                favoriteRestaurants: [],
              },
            });
          }
          return true;
        }

        return true;
      } catch (error) {
        console.error('Sign in error:', error);
        return false;
      }
    },
    async jwt({ token, user }) {
      // Set initial data on first login
      if (user) {
        token.email = (user.email as any) || '';
        (token as any).phone = (user as any).phone as any;
        token.name = user.name;

        // Handle admin user - don't query database
        if ((user as any).role === 'ADMIN') {
          (token as any).id = 'admin';
          (token as any).role = 'ADMIN';
          return token;
        }
      }

      // Handle admin token on subsequent requests
      if (
        token.email === ADMIN_CREDENTIALS.email &&
        (token as any).role === 'ADMIN'
      ) {
        return token;
      }

      // Always fetch fresh user data from database (by email or phone)
      try {
        const dbUser = await prisma.user.findFirst({
          where: {
            OR: [
              token.email ? { email: token.email as string } : undefined,
              (token as any).phone
                ? { phone: (token as any).phone as string }
                : undefined,
            ].filter(Boolean) as any,
          },
          include: {
            customer: true,
            deliveryPartner: true,
          },
        });

        if (dbUser) {
          (token as any).id = dbUser.id;
          (token as any).role = dbUser.role;
          (token as any).phone = (dbUser as any).phone;
          token.email = (dbUser.email as any) || '';

          // Add role-specific data
          if (dbUser.role === 'CUSTOMER' && dbUser.customer) {
            (token as any).customerId = dbUser.customer.id;
          } else if (
            dbUser.role === 'DELIVERY_PARTNER' &&
            dbUser.deliveryPartner
          ) {
            (token as any).deliveryPartnerId = dbUser.deliveryPartner.id;
          } else if (dbUser.role === 'RESTAURANT_OWNER') {
            const restaurant = await prisma.restaurant.findUnique({
              where: { ownerId: dbUser.id },
              select: { id: true },
            });
            if (restaurant) {
              (token as any).restaurantId = restaurant.id;
            }
          }
        }
      } catch (error) {
        console.error('JWT callback error:', error);
      }

      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).id = (token as any).id as string;
        (session.user as any).role = (token as any).role as any;
        (session.user as any).phone = (token as any).phone as string;
        session.user.email = (token as any).email as string;
        (session.user as any).customerId = (token as any).customerId as string;
        (session.user as any).deliveryPartnerId = (token as any)
          .deliveryPartnerId as string;
        (session.user as any).restaurantId = (token as any)
          .restaurantId as string;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      console.log('Redirect URL:', url, 'Base URL:', baseUrl);

      // If the URL is from our domain, allow it
      if (url.startsWith(baseUrl)) {
        return url;
      }

      // Check if this is admin sign-in
      if (url.includes('/admin/') || url.includes('admin')) {
        return `${baseUrl}/admin/dashboard`;
      }

      // Check if this is a restaurant sign-in by looking at the referrer or URL
      if (url.includes('/restaurant/') || url.includes('restaurant')) {
        return `${baseUrl}/restaurant/dashboard`;
      }

      // Check if this is a delivery partner sign-in
      if (url.includes('/delivery/') || url.includes('delivery')) {
        return `${baseUrl}/delivery/dashboard`;
      }

      // Default to home page for customers
      return baseUrl;
    },
  },
  events: {
    async signIn({ user, isNewUser }) {
      if (isNewUser) {
        console.log(`New user signed up: ${user?.email}`);
      }
    },
    async signOut({ session }) {
      console.log(`User signed out: ${session?.user?.email}`);
    },
  },
  debug: process.env.NODE_ENV === 'development',
};

// Helper function to get user role from session
export async function getUserRole(email: string): Promise<string | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { role: true },
    });
    return user?.role || null;
  } catch (error) {
    console.error('Error getting user role:', error);
    return null;
  }
}

// Helper function to check if user has required role
export function hasRole(userRole: string, requiredRoles: string[]): boolean {
  return requiredRoles.includes(userRole);
}

// Helper function to get user with complete profile
export async function getUserProfile(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        customer: {
          include: {
            addresses: true,
          },
        },
        deliveryPartner: true,
      },
    });

    if (!user) return null;

    // If user is a restaurant owner, fetch restaurant separately
    if (user.role === 'RESTAURANT_OWNER') {
      const restaurant = await prisma.restaurant.findUnique({
        where: { ownerId: userId },
        include: {
          menuItems: true,
        },
      });
      return {
        ...user,
        restaurant,
      };
    }

    return user;
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
}
