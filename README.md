# Aasta - Food Delivery Platform

Aasta is a comprehensive food delivery platform built with Next.js and Capacitor, enabling seamless food ordering experiences across web, Android, and iOS platforms.

## 🚀 Overview

Aasta is a full-stack food delivery application that connects customers, restaurants, and delivery partners. The platform supports multiple user roles with distinct interfaces and functionalities for each role type.

### Key Features

- **Multi-Platform Support**: Web, Android, and iOS applications
- **Role-Based Access**: Customer, Restaurant Owner, Delivery Partner, Admin, and Operations roles
- **Real-time Order Tracking**: Live order status updates
- **Payment Integration**: Razorpay payment gateway integration
- **Push Notifications**: Firebase Cloud Messaging (FCM) for real-time notifications
- **Location Services**: Google Maps integration for location-based services
- **Order Management**: Complete order lifecycle management
- **Analytics Dashboard**: Comprehensive analytics for all stakeholders

## 🏗️ Tech Stack

### Frontend
- **Next.js 15.4.4** - React framework with App Router
- **React 19.1.0** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS 4** - Styling
- **Framer Motion** - Animations
- **Radix UI** - UI components
- **TanStack Query** - Data fetching and caching

### Mobile
- **Capacitor 7.4.2** - Native mobile runtime
- **Capacitor Plugins**:
  - Firebase Authentication
  - Push Notifications (FCM)
  - Geolocation
  - Haptics
  - Local Notifications
  - App & Browser APIs

### Backend
- **Next.js API Routes** - Serverless API endpoints
- **NextAuth.js** - Authentication
- **Prisma** - ORM
- **PostgreSQL** - Database
- **Socket.io** - Real-time communication

### Services & Integrations
- **Firebase** - Authentication & Push Notifications
- **Razorpay** - Payment processing
- **Google Maps API** - Location services
- **AWS S3** - Image storage
- **Telegram Bot** - Delivery partner notifications
- **Redis** - Caching (optional)

## 📁 Project Structure

```
.
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API routes
│   │   ├── admin/             # Admin dashboard pages
│   │   ├── auth/              # Authentication pages
│   │   ├── delivery/          # Delivery partner pages
│   │   ├── operations/        # Operations team pages
│   │   ├── restaurant/        # Restaurant owner pages
│   │   └── [customer pages]   # Customer-facing pages
│   ├── components/            # React components
│   ├── lib/                   # Utilities and services
│   ├── hooks/                 # Custom React hooks
│   ├── types/                 # TypeScript types
│   └── middleware.ts          # Next.js middleware
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── migrations/            # Database migrations
├── android/                   # Android native project
├── ios/                       # iOS native project
├── public/                    # Static assets
├── docs/                      # Documentation
│   ├── API.md                 # API documentation
│   ├── ROLES.md               # Roles and routes
│   └── CAPACITOR.md           # Capacitor setup guide
├── capacitor.config.ts        # Capacitor configuration
└── next.config.ts             # Next.js configuration
```

## 🚦 Getting Started

### Prerequisites

- Node.js 20+ and npm/pnpm
- PostgreSQL database
- Firebase project with Authentication and Cloud Messaging enabled
- Google Maps API key
- Razorpay account (for payments)
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/saiyam0211/aasta
   cd aasta
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   # Database
   DATABASE_URL="postgresql://user:password@localhost:5432/aasta"

   # NextAuth
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key"

   # Google OAuth
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"

   # Firebase
   FIREBASE_PROJECT_ID="your-firebase-project-id"
   FIREBASE_PRIVATE_KEY="your-firebase-private-key"
   FIREBASE_CLIENT_EMAIL="your-firebase-client-email"

   # Google Maps
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="your-google-maps-api-key"

   # Razorpay
   RAZORPAY_KEY_ID="your-razorpay-key-id"
   RAZORPAY_KEY_SECRET="your-razorpay-key-secret"

   # AWS S3 (for image uploads)
   AWS_ACCESS_KEY_ID="your-aws-access-key"
   AWS_SECRET_ACCESS_KEY="your-aws-secret-key"
   AWS_REGION="your-aws-region"
   AWS_S3_BUCKET_NAME="your-s3-bucket-name"

   # Telegram Bot (optional)
   TELEGRAM_BOT_TOKEN="your-telegram-bot-token"
   ```

4. **Set up the database**
   ```bash
   # Generate Prisma client
   npm run db:generate

   # Run migrations
   npm run db:migrate

   # Seed database (optional)
   npm run db:seed
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📱 Mobile Development

For mobile app development with Capacitor, see the [CAPACITOR.md](docs/CAPACITOR.md) guide for detailed instructions on:
- Setting up Android development
- Setting up iOS development
- Building and running mobile apps
- Capacitor plugin configuration

## 📚 Documentation

Comprehensive documentation is available in the `docs/` folder:

- **[API.md](docs/API.md)** - Complete API reference with all endpoints
- **[ROLES.md](docs/ROLES.md)** - User roles, routes, and access control
- **[CAPACITOR.md](docs/CAPACITOR.md)** - Capacitor setup and mobile development guide

## 🎭 User Roles

The platform supports five distinct user roles:

1. **CUSTOMER** - Browse restaurants, place orders, track deliveries
2. **RESTAURANT_OWNER** - Manage restaurant, menu, and orders
3. **DELIVERY_PARTNER** - Accept and deliver orders
4. **ADMIN** - Platform administration and analytics
5. **OPERATIONS** - Operations team dashboard

For detailed information about each role and their routes, see [ROLES.md](docs/ROLES.md).

## 🔌 API Endpoints

The application provides a comprehensive REST API. All endpoints are documented in [API.md](docs/API.md).

Key API categories:
- Authentication (`/api/auth`)
- Orders (`/api/orders`)
- Restaurants (`/api/restaurants`)
- Payments (`/api/payments`)
- Notifications (`/api/notifications`)
- Admin (`/api/admin`)
- Operations (`/api/operations`)

## 🛠️ Available Scripts

### Development
- `npm run dev` - Start development server
- `npm run dev:web` - Start web development server
- `npm run dev:bot` - Start Telegram bot
- `npm run dev:both` - Start both web and bot

### Building
- `npm run build` - Build for production
- `npm run build:mobile` - Build and sync with Capacitor
- `npm run build:android` - Build and open Android Studio
- `npm run build:ios` - Build and open Xcode

### Database
- `npm run db:migrate` - Run database migrations
- `npm run db:generate` - Generate Prisma client
- `npm run db:seed` - Seed database with sample data
- `npm run db:studio` - Open Prisma Studio
- `npm run db:reset` - Reset and reseed database

### Testing
- `npm test` - Run Jest tests
- `npm run test:e2e` - Run Playwright E2E tests
- `npm run test:coverage` - Generate test coverage

### Code Quality
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting

## 🔐 Authentication

The application uses NextAuth.js with multiple authentication providers:
- Google OAuth
- Phone OTP (via Firebase)
- Credentials (for restaurant owners and admin)

Authentication is handled through middleware that protects routes based on user roles.

## 📦 Deployment

### Web Deployment (Vercel)

1. Push your code to GitHub
2. Import project in Vercel
3. Configure environment variables
4. Deploy

The Capacitor configuration points to your Vercel deployment URL for mobile apps.

### Mobile App Deployment

1. Build the Next.js app: `npm run build`
2. Sync with Capacitor: `npx cap sync`
3. Build native apps in Android Studio / Xcode
4. Follow platform-specific deployment guides

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Run tests and linting
4. Submit a pull request

## 📄 License

[Your License Here]

## 🆘 Support

For issues, questions, or contributions, please open an issue on the repository.

---

**Built with ❤️ by the Aasta team**
