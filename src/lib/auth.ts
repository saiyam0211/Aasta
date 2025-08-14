import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { OAuth2Client } from 'google-auth-library';
// import { UserRole } from '@prisma/client'; // Will uncomment after Prisma client generation

// Hardcoded admin credentials
const ADMIN_CREDENTIALS = {
  email: 'hi@aasta.food',
  password: '@asta.food',
  name: 'Aasta Admin',
};

const GOOGLE_WEB_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!; // Web client used to verify ID tokens
const googleClient = new OAuth2Client(GOOGLE_WEB_CLIENT_ID);

export const authOptions: NextAuthOptions = {
  // Remove adapter to avoid OAuthAccountNotLinked errors
  // adapter: PrismaAdapter(prisma) as any,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          // Force Google to show the account chooser and consent screen
          prompt: 'select_account consent',
          access_type: 'offline',
          response_type: 'code',
        },
      },
    }),
    // Native Android Google sign-in via Capacitor (ID token verification)
    CredentialsProvider({
      id: 'native-google',
      name: 'Native Google',
      credentials: {
        idToken: { label: 'idToken', type: 'text' },
      },
      async authorize(credentials) {
        try {
          const idToken = credentials?.idToken;
          if (!idToken) return null;

          // Verify ID token
          const ticket = await googleClient.verifyIdToken({
            idToken,
            audience: GOOGLE_WEB_CLIENT_ID,
          });
          const payload = ticket.getPayload();
          if (!payload || !payload.email) return null;

          const email = payload.email;
          const name = payload.name || email.split('@')[0];
          const image = payload.picture || undefined;
          const googleId = payload.sub;

          // Find or create user
          let user = await prisma.user.findUnique({ where: { email } });
          if (!user) {
            user = await prisma.user.create({
              data: {
                email,
                name,
                image,
                googleId,
                role: 'CUSTOMER',
              },
            });
            await prisma.customer.create({ data: { userId: user.id, favoriteRestaurants: [] } });
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
            role: user.role,
          } as any;
        } catch (e) {
          console.error('Native Google authorize error:', e);
          return null;
        }
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
            },
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

        // Handle admin user - don't create database entry
        if ((user as any).role === 'ADMIN') {
          return true;
        }

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
              image: (user as any).image,
              googleId: (account as any)?.providerAccountId,
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
      // Set initial data on first login
      if (user) {
        token.email = (user as any).email;
        token.name = (user as any).name;

        // Handle admin user - don't query database
        if ((user as any).role === 'ADMIN') {
          (token as any).id = 'admin';
          (token as any).role = 'ADMIN';
          return token;
        }
      }

      // Handle admin token on subsequent requests
      if ((token as any).email === ADMIN_CREDENTIALS.email && (token as any).role === 'ADMIN') {
        return token;
      }

      // Always fetch fresh user data from database to ensure role is up-to-date (for non-admin users)
      if (token.email) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { email: token.email as string },
            include: {
              customer: true,
              deliveryPartner: true,
            },
          });

          if (dbUser) {
            (token as any).id = dbUser.id;
            (token as any).role = dbUser.role;
            (token as any).phone = dbUser.phone as any;
            token.email = dbUser.email;

            // Add role-specific data
            if (dbUser.role === 'CUSTOMER' && dbUser.customer) {
              (token as any).customerId = dbUser.customer.id;
            } else if (
              dbUser.role === 'DELIVERY_PARTNER' &&
              dbUser.deliveryPartner
            ) {
              (token as any).deliveryPartnerId = dbUser.deliveryPartner.id;
            } else if (dbUser.role === 'RESTAURANT_OWNER') {
              // For restaurant owners, we'll fetch the restaurant separately to avoid schema issues
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
          // Continue with existing token data if database query fails
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).id = (token as any).id as string;
        (session.user as any).role = (token as any).role as any;
        (session.user as any).phone = (token as any).phone as string;
        session.user.email = token.email as string;
        (session.user as any).customerId = (token as any).customerId as string;
        (session.user as any).deliveryPartnerId = (token as any).deliveryPartnerId as string;
        (session.user as any).restaurantId = (token as any).restaurantId as string;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      try {
        // If the URL is relative, resolve it against baseUrl (preserve /bridge/native-return)
        if (url.startsWith('/')) {
          return new URL(url, baseUrl).toString();
        }
        // If URL is same-origin, allow it
        const base = new URL(baseUrl);
        const target = new URL(url);
        if (target.origin === base.origin) {
          return url;
        }
      } catch (e) {
        // If URL parsing fails, fall through to baseUrl
      }
      // For external domains, block and return to base
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
