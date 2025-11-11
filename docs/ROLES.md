# Roles and Routes Documentation

This document explains all user roles in the Aasta platform, their access permissions, and the routes/pages available to each role.

## Overview

The Aasta platform supports five distinct user roles:

1. **CUSTOMER** - End users who browse restaurants and place orders
2. **RESTAURANT_OWNER** - Restaurant owners who manage their restaurant and orders
3. **DELIVERY_PARTNER** - Delivery partners who accept and deliver orders
4. **ADMIN** - Platform administrators with full access
5. **OPERATIONS** - Operations team managing day-to-day operations

---

## Role: CUSTOMER

**Default Role**: Yes  
**Description**: Customers are end users who browse restaurants, place orders, and track deliveries.

### Authentication Routes

- **`/auth/signin`** - Customer sign-in page
  - Supports Google OAuth
  - Supports Phone OTP (Firebase)
  - Redirects to home after successful login

- **`/auth/error`** - Authentication error page
  - Displays authentication errors

### Public Routes

- **`/`** - Home page
  - Browse restaurants
  - Search functionality
  - Featured dishes
  - Hero banners
  - Hack of the day

- **`/restaurants`** - Restaurant listing page
  - View all restaurants
  - Filter by location, cuisine, etc.
  - Search restaurants

- **`/restaurants/[id]`** - Restaurant details page
  - View restaurant information
  - Browse menu items
  - Add items to cart
  - View reviews and ratings

### Protected Routes (Requires Authentication)

- **`/cart`** - Shopping cart page
  - View cart items
  - Modify quantities
  - Proceed to checkout

- **`/orders`** - Orders listing page
  - View all past and current orders
  - Filter by status
  - Track order status

- **`/orders/[orderNumber]`** - Order details page
  - View order details
  - Track order status
  - View order items
  - Contact restaurant/delivery partner

- **`/payment/[orderNumber]`** - Payment page
  - Complete payment for order
  - Razorpay integration
  - Payment verification

- **`/profile`** - User profile page
  - View and edit profile
  - Manage addresses
  - View order history
  - Update notification preferences

- **`/settings/notifications`** - Notification settings
  - Configure notification preferences
  - Enable/disable notification types
  - Set quiet hours

- **`/onboarding/location`** - Location onboarding
  - Set default location
  - Enable location services

### API Access

Customers can access:
- `/api/orders/*` - Order management
- `/api/restaurants/*` - Restaurant browsing
- `/api/menu-items/*` - Menu item viewing
- `/api/payments/*` - Payment processing
- `/api/user/*` - Profile management
- `/api/reviews` - Review creation
- `/api/locations/*` - Location services
- `/api/nearby-restaurants` - Nearby restaurant search
- `/api/notifications/preferences` - Notification preferences

---

## Role: RESTAURANT_OWNER

**Default Role**: No  
**Description**: Restaurant owners manage their restaurant, menu, orders, and earnings.

### Authentication Routes

- **`/restaurant/auth/signin`** - Restaurant owner sign-in
  - Credentials-based authentication
  - Email and password login

- **`/restaurant/auth/signup`** - Restaurant owner signup
  - Create restaurant owner account
  - Initial restaurant setup

### Protected Routes (Requires Authentication)

- **`/restaurant/onboarding`** - Restaurant onboarding
  - Complete restaurant profile
  - Set location and operating hours
  - Initial setup wizard

- **`/restaurant/dashboard`** - Restaurant dashboard
  - Overview of restaurant performance
  - Recent orders
  - Statistics and metrics
  - Quick actions

- **`/restaurant/menu`** - Menu management
  - View all menu items
  - Add new menu items
  - Edit existing items
  - Manage item availability
  - Set featured items
  - Manage hack of the day

- **`/restaurant/orders`** - Order management
  - View all orders
  - Filter by status
  - Update order status
  - Accept/reject orders
  - View order details

- **`/restaurant/financials`** - Financial dashboard
  - View earnings
  - Transaction history
  - Commission breakdown
  - Payment summaries

- **`/restaurant/operations/notifications`** - Notification management
  - Send notifications to customers
  - Manage notification templates

### API Access

Restaurant owners can access:
- `/api/restaurants` - Restaurant management (own restaurant)
- `/api/menu-items/*` - Menu item management
- `/api/restaurant/orders` - Order management
- `/api/restaurant/earnings` - Earnings data
- `/api/restaurant/delivery-partners` - Assigned delivery partners
- `/api/upload/restaurant-image` - Image uploads

---

## Role: DELIVERY_PARTNER

**Default Role**: No  
**Description**: Delivery partners accept orders and deliver them to customers.

### Authentication Routes

- **`/delivery/auth/signin`** - Delivery partner sign-in
  - Phone OTP authentication
  - Firebase authentication

### Protected Routes (Requires Authentication)

- **`/delivery/dashboard`** - Delivery partner dashboard
  - View assigned orders
  - Update availability status
  - View earnings
  - Track current deliveries
  - View performance metrics

### API Access

Delivery partners can access:
- `/api/delivery-partners/me` - Profile management
- `/api/delivery-partners/me/orders` - Assigned orders
- `/api/orders/[orderNumber]/verify` - Order verification
- Update location and status

---

## Role: ADMIN

**Default Role**: No  
**Description**: Platform administrators with full access to manage the platform.

### Authentication Routes

- **`/admin/login`** - Admin login page
  - Credentials-based authentication
  - Hardcoded admin credentials (hi@aasta.food)

### Protected Routes (Requires Authentication)

- **`/admin`** - Admin root (redirects to dashboard)

- **`/admin/dashboard`** - Admin dashboard
  - Platform overview
  - Key metrics
  - Recent activities
  - Quick actions

- **`/admin/restaurants`** - Restaurant management
  - View all restaurants
  - Restaurant details
  - Approve/suspend restaurants
  - Manage restaurant settings

- **`/admin/restaurants/[id]`** - Restaurant details
  - View restaurant information
  - Edit restaurant settings
  - Manage delivery partner assignments
  - View restaurant analytics

- **`/admin/customers`** - Customer management
  - View all customers
  - Customer details
  - Customer analytics

- **`/admin/customers/[id]`** - Customer details
  - View customer information
  - Order history
  - Activity logs

- **`/admin/delivery-partners`** - Delivery partner management
  - View all delivery partners
  - Partner details
  - Performance metrics

- **`/admin/delivery-partners/[id]`** - Delivery partner details
  - View partner information
  - Delivery history
  - Earnings and ratings

- **`/admin/locations`** - Location management
  - View all locations
  - Add/edit locations
  - Manage location status

### API Access

Admins have full access to:
- `/api/admin/*` - All admin endpoints
- `/api/restaurants/*` - Restaurant management
- `/api/users/*` - User management
- `/api/notifications/*` - Notification management
- `/api/analytics/*` - Analytics endpoints
- `/api/payments/refund` - Refund processing
- All testing and utility endpoints

---

## Role: OPERATIONS

**Default Role**: No  
**Description**: Operations team manages day-to-day operations, order assignments, and restaurant support.

### Authentication Routes

- **`/operations/login`** - Operations team login
  - Credentials-based authentication

### Protected Routes (Requires Authentication)

#### Restaurant Operations

- **`/operations/restaurant`** - Restaurant operations root
- **`/operations/restaurant/dashboard`** - Restaurant operations dashboard
  - Overview of all restaurants
  - Active orders across restaurants
  - Performance metrics

- **`/operations/restaurant/orders`** - Restaurant orders management
  - View orders from all restaurants
  - Filter and search orders
  - Order status management

- **`/operations/restaurant/partners`** - Delivery partner assignments
  - Manage restaurant-delivery partner assignments
  - View assignment history

- **`/operations/restaurant/analytics`** - Restaurant analytics
  - Restaurant performance metrics
  - Order analytics
  - Revenue analytics

- **`/operations/restaurant/restaurants`** - Restaurant management
  - View and manage restaurants
  - Restaurant details and settings

#### Delivery Operations

- **`/operations/delivery`** - Delivery operations root
- **`/operations/delivery/dashboard`** - Delivery operations dashboard
  - Overview of delivery operations
  - Active deliveries
  - Delivery partner status

- **`/operations/delivery/orders`** - Delivery order management
  - View all delivery orders
  - Assign delivery partners
  - Track deliveries

- **`/operations/delivery/assignments`** - Order assignments
  - Assign orders to delivery partners
  - Manage batch assignments
  - Optimize delivery routes

- **`/operations/delivery/partners`** - Delivery partner management
  - View all delivery partners
  - Partner status and availability
  - Performance tracking

- **`/operations/delivery/analytics`** - Delivery analytics
  - Delivery performance metrics
  - Partner performance
  - Delivery time analytics

### API Access

Operations team can access:
- `/api/operations/*` - All operations endpoints
- `/api/operations/active-orders` - Active orders management
- `/api/operations/assignments` - Order assignments
- `/api/operations/restaurants/*` - Restaurant operations
- `/api/operations/delivery-partners/*` - Delivery partner management
- `/api/operations/validate-hack-of-the-day` - Content validation

---

## Route Protection

### Middleware

The application uses Next.js middleware (`src/middleware.ts`) to protect routes:

1. **Public Routes**: Authentication pages, API routes (handle their own auth)
2. **Protected Routes**: All other routes require authentication
3. **Role-Based Access**: API routes check user roles for authorization

### Route Access Matrix

| Route Pattern | CUSTOMER | RESTAURANT_OWNER | DELIVERY_PARTNER | ADMIN | OPERATIONS |
|--------------|----------|------------------|------------------|-------|------------|
| `/` | ✅ | ❌ | ❌ | ❌ | ❌ |
| `/restaurants/*` | ✅ | ❌ | ❌ | ❌ | ❌ |
| `/orders/*` | ✅ | ❌ | ❌ | ❌ | ❌ |
| `/restaurant/*` | ❌ | ✅ | ❌ | ❌ | ❌ |
| `/delivery/*` | ❌ | ❌ | ✅ | ❌ | ❌ |
| `/admin/*` | ❌ | ❌ | ❌ | ✅ | ❌ |
| `/operations/*` | ❌ | ❌ | ❌ | ❌ | ✅ |

### Authentication Flow

1. **Unauthenticated User**:
   - Accessing protected route → Redirected to appropriate sign-in page
   - Customer routes → `/auth/signin`
   - Restaurant routes → `/restaurant/auth/signin`
   - Delivery routes → `/delivery/auth/signin`
   - Admin routes → `/admin/login`
   - Operations routes → `/operations/login`

2. **Authenticated User**:
   - Accessing role-inappropriate route → Redirected to their dashboard
   - Session validated on each request
   - Role checked for API endpoints

### Session Management

- **Session Duration**: 30 days
- **Session Storage**: JWT tokens via NextAuth.js
- **Session Refresh**: Automatic on activity

---

## Role Switching

Users can switch between roles (CUSTOMER, DELIVERY_PARTNER, RESTAURANT_OWNER) using:

**API Endpoint**: `POST /api/user/update-role`

**Request Body**:
```json
{
  "userId": "string",
  "role": "CUSTOMER" | "DELIVERY_PARTNER" | "RESTAURANT_OWNER"
}
```

**Note**: ADMIN role cannot be switched to/from via this endpoint.

---

## Special Routes

### Testing & Development

- **`/sendnotifications`** - Notification testing page (Admin only)
- Various test endpoints in `/api/test-*`

### Onboarding

- **`/onboarding/location`** - Location onboarding (Customer)
- **`/restaurant/onboarding`** - Restaurant onboarding (Restaurant Owner)

---

## Notes

1. **Role Assignment**: Users can have only one role at a time (except ADMIN)
2. **Profile Creation**: Role-specific profiles are created when role is assigned
3. **Route Guards**: Client-side route guards exist in layout components
4. **API Authorization**: Each API endpoint validates user role independently
5. **Mobile Apps**: Same role-based routing applies to mobile apps via Capacitor

---

## Best Practices

1. Always check user role before rendering role-specific content
2. Use server-side session validation for sensitive operations
3. Implement proper error handling for unauthorized access attempts
4. Log access attempts for security auditing
5. Use role-based API endpoints rather than client-side filtering

