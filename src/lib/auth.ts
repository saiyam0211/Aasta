import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { prisma } from '@/lib/db';
// import { UserRole } from '@prisma/client'; // Will uncomment after Prisma client generation

export const authOptions: NextAuthOptions = {
  // Remove adapter to avoid OAuthAccountNotLinked errors
  // adapter: PrismaAdapter(prisma) as any,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
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
    async signIn({ user, account, profile }) {
      try {
        if (!user.email) return false;

        // Check if user exists in our database
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email },
        });

        if (!existingUser) {
          // Determine role based on the signin URL (this will be passed via state or we'll use a default)
          // For now, we'll create with CUSTOMER role and update it later if needed
          const newUser = await prisma.user.create({
            data: {
              email: user.email,
              name: user.name,
              image: user.image,
              googleId: account?.providerAccountId,
              role: 'CUSTOMER', // Default role, can be updated later
            },
          });

          // Create customer profile by default
          await prisma.customer.create({
            data: {
              userId: newUser.id,
              favoriteRestaurants: [],
            },
          });
        }

        return true;
      } catch (error) {
        console.error('Sign in error:', error);
        return false;
      }
    },
    async jwt({ token, user, account }) {
      if (user) {
        // Get user data from database with role
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email! },
          include: {
            customer: true,
            deliveryPartner: true,
            restaurant: true,
          },
        });

        if (dbUser) {
          token.id = dbUser.id;
          token.role = dbUser.role;
          token.phone = dbUser.phone;
          token.email = dbUser.email;
          
          // Add role-specific data
          if (dbUser.role === 'CUSTOMER' && dbUser.customer) {
            token.customerId = dbUser.customer.id;
          } else if (dbUser.role === 'DELIVERY_PARTNER' && dbUser.deliveryPartner) {
            token.deliveryPartnerId = dbUser.deliveryPartner.id;
          } else if (dbUser.role === 'RESTAURANT_OWNER' && dbUser.restaurant) {
            token.restaurantId = dbUser.restaurant.id;
          }
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as any;
        session.user.phone = token.phone as string;
        session.user.email = token.email as string;
        session.user.customerId = token.customerId as string;
        session.user.deliveryPartnerId = token.deliveryPartnerId as string;
        session.user.restaurantId = token.restaurantId as string;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      console.log('Redirect URL:', url, 'Base URL:', baseUrl);
      
      // Always redirect to home page
      return baseUrl;
    },
  },
  events: {
    async signIn({ user, account, isNewUser }) {
      if (isNewUser) {
        console.log(`New user signed up: ${user.email}`);
      }
    },
    async signOut({ session, token }) {
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
    return await prisma.user.findUnique({
      where: { id: userId },
      include: {
        customer: {
          include: {
            addresses: true,
          },
        },
        deliveryPartner: true,
        restaurant: {
          include: {
            menuItems: true,
          },
        },
      },
    });
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
} 