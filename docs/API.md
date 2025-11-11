# API Documentation

This document provides a comprehensive reference for all API endpoints in the Aasta platform.

## Base URL

- **Development**: `http://localhost:3000`
- **Production**: `https://aastadelivery.vercel.app`

## Authentication

Most endpoints require authentication via NextAuth.js. Include the session cookie in requests, or use the `Authorization` header where applicable.

## Response Format

All API responses follow a consistent format:

```json
{
  "success": true,
  "data": {},
  "message": "Optional message"
}
```

Error responses:

```json
{
  "success": false,
  "error": "Error message"
}
```

---

## Authentication APIs

### POST `/api/auth/[...nextauth]`
NextAuth.js authentication endpoint. Handles sign-in, sign-out, and session management.

**Providers:**
- Google OAuth
- Phone OTP (Firebase)
- Credentials (Restaurant Owner, Admin)

---

## Customer APIs

### Orders

#### POST `/api/orders/create`
Create a new order.

**Authentication**: Required (CUSTOMER role)

**Request Body:**
```json
{
  "cart": {
    "restaurantId": "string",
    "items": [
      {
        "menuItemId": "string",
        "quantity": "number",
        "customizations": {}
      }
    ],
    "subtotal": "number",
    "deliveryFee": "number",
    "taxes": "number",
    "totalAmount": "number"
  },
  "deliveryAddress": {
    "address": "string",
    "latitude": "number",
    "longitude": "number"
  },
  "orderType": "DELIVERY" | "PICKUP",
  "addressId": "string"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "orderNumber": "string",
    "order": {}
  }
}
```

#### GET `/api/orders`
Get orders for the authenticated user.

**Authentication**: Required

**Query Parameters:**
- `status` (optional): Filter by order status
- `limit` (optional): Number of orders to return
- `offset` (optional): Pagination offset

**Response:**
```json
{
  "success": true,
  "data": {
    "orders": []
  }
}
```

#### GET `/api/orders/[orderNumber]`
Get order details by order number.

**Authentication**: Required

**Response:**
```json
{
  "success": true,
  "data": {
    "order": {}
  }
}
```

#### POST `/api/orders/[orderNumber]/verify`
Verify order delivery with verification code.

**Authentication**: Required (DELIVERY_PARTNER role)

**Request Body:**
```json
{
  "verificationCode": "string"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Order verified successfully"
}
```

#### GET `/api/orders/ping`
Health check endpoint for orders API.

---

### Restaurants

#### GET `/api/restaurants`
Get list of restaurants.

**Query Parameters:**
- `locationId` (optional): Filter by location
- `latitude` (optional): User latitude for distance calculation
- `longitude` (optional): User longitude for distance calculation
- `search` (optional): Search query
- `cuisine` (optional): Filter by cuisine type

**Response:**
```json
{
  "success": true,
  "data": {
    "restaurants": []
  }
}
```

#### GET `/api/restaurants/[id]`
Get restaurant details by ID.

**Response:**
```json
{
  "success": true,
  "data": {
    "restaurant": {}
  }
}
```

#### GET `/api/restaurants/by-location`
Get restaurants by location.

**Query Parameters:**
- `locationId`: Location ID (required)

**Response:**
```json
{
  "success": true,
  "data": {
    "restaurants": []
  }
}
```

#### GET `/api/restaurants/search`
Search restaurants.

**Query Parameters:**
- `q`: Search query (required)
- `locationId` (optional): Filter by location

**Response:**
```json
{
  "success": true,
  "data": {
    "restaurants": []
  }
}
```

#### GET `/api/restaurants/discover`
Discover restaurants with featured content.

**Response:**
```json
{
  "success": true,
  "data": {
    "restaurants": [],
    "featuredDishes": [],
    "heroBanners": []
  }
}
```

#### POST `/api/restaurants/[id]/assign-partners`
Assign delivery partners to a restaurant.

**Authentication**: Required (ADMIN or OPERATIONS role)

**Request Body:**
```json
{
  "partnerIds": ["string"]
}
```

---

### Menu Items

#### GET `/api/menu-items`
Get menu items for a restaurant.

**Query Parameters:**
- `restaurantId`: Restaurant ID (required)
- `veg`: Filter vegetarian items (1 or 0)
- `showAll`: Show all items including unavailable (1 or 0)

**Response:**
```json
{
  "success": true,
  "data": []
}
```

#### POST `/api/menu-items`
Create a new menu item.

**Authentication**: Required (RESTAURANT_OWNER role)

**Request Body (FormData):**
- `restaurantId`: Restaurant ID
- `name`: Item name
- `description`: Item description
- `price`: Price
- `originalPrice`: Original price (optional)
- `preparationTime`: Preparation time in minutes
- `dietaryType`: "Veg" or "Non-Veg"
- `category`: Category name
- `image`: Image file (optional)
- `featured`: Boolean
- `hackOfTheDay`: Boolean
- `stockLeft`: Stock quantity

**Response:**
```json
{
  "success": true,
  "data": {}
}
```

#### GET `/api/menu-items/[id]`
Get menu item details.

**Response:**
```json
{
  "success": true,
  "data": {}
}
```

---

### Payments

#### POST `/api/payments/create-order`
Create a Razorpay order.

**Authentication**: Required

**Request Body:**
```json
{
  "orderNumber": "string",
  "amount": "number"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "razorpayOrderId": "string",
    "amount": "number",
    "currency": "string"
  }
}
```

#### POST `/api/payments/verify-payment`
Verify Razorpay payment.

**Authentication**: Required

**Request Body:**
```json
{
  "orderNumber": "string",
  "razorpayOrderId": "string",
  "razorpayPaymentId": "string",
  "razorpaySignature": "string"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payment verified successfully"
}
```

#### POST `/api/payments/refund`
Process a refund.

**Authentication**: Required (ADMIN role)

**Request Body:**
```json
{
  "orderNumber": "string",
  "amount": "number",
  "reason": "string"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "refund": {}
  }
}
```

#### POST `/api/payments/webhooks`
Razorpay webhook endpoint for payment events.

**Authentication**: Not required (webhook signature verification)

#### GET `/api/payments/ping`
Health check endpoint for payments API.

---

### User Profile

#### GET `/api/user/profile`
Get user profile.

**Authentication**: Required

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {}
  }
}
```

#### POST `/api/user/profile`
Update user profile.

**Authentication**: Required

**Request Body:**
```json
{
  "name": "string",
  "email": "string",
  "phone": "string",
  "image": "string"
}
```

---

### Addresses

#### GET `/api/user/address`
Get user addresses.

**Authentication**: Required (CUSTOMER role)

**Response:**
```json
{
  "success": true,
  "data": {
    "addresses": []
  }
}
```

#### POST `/api/user/address`
Create a new address.

**Authentication**: Required (CUSTOMER role)

**Request Body:**
```json
{
  "type": "HOME" | "WORK" | "OTHER",
  "street": "string",
  "city": "string",
  "state": "string",
  "zipCode": "string",
  "latitude": "number",
  "longitude": "number",
  "landmark": "string",
  "instructions": "string",
  "isDefault": "boolean",
  "contactPhone": "string",
  "houseNumber": "string",
  "locality": "string"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "address": {}
  }
}
```

#### GET `/api/user/address/[id]`
Get address by ID.

**Authentication**: Required

#### PUT `/api/user/address/[id]`
Update address.

**Authentication**: Required

#### DELETE `/api/user/address/[id]`
Delete address.

**Authentication**: Required

---

### Reviews

#### POST `/api/reviews`
Create a review for an order.

**Authentication**: Required (CUSTOMER role)

**Request Body:**
```json
{
  "orderId": "string",
  "rating": "number",
  "comment": "string",
  "foodRating": "number",
  "serviceRating": "number",
  "deliveryRating": "number"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "review": {}
  }
}
```

---

### Locations

#### GET `/api/locations`
Get all locations.

**Response:**
```json
{
  "success": true,
  "data": {
    "locations": []
  }
}
```

#### GET `/api/locations/autocomplete`
Get location autocomplete suggestions.

**Query Parameters:**
- `query`: Search query (required)

**Response:**
```json
{
  "success": true,
  "data": {
    "suggestions": []
  }
}
```

---

### Search

#### GET `/api/search/suggestions`
Get search suggestions.

**Query Parameters:**
- `q`: Search query (required)

**Response:**
```json
{
  "success": true,
  "data": {
    "suggestions": []
  }
}
```

---

### Nearby Restaurants

#### GET `/api/nearby-restaurants`
Get restaurants near a location.

**Query Parameters:**
- `latitude`: Latitude (required)
- `longitude`: Longitude (required)
- `radius`: Search radius in km (optional, default: 5)

**Response:**
```json
{
  "success": true,
  "data": {
    "restaurants": []
  }
}
```

---

### Featured Content

#### GET `/api/featured-dishes`
Get featured dishes.

**Response:**
```json
{
  "success": true,
  "data": {
    "dishes": []
  }
}
```

#### GET `/api/hack-of-the-day`
Get hack of the day menu item.

**Response:**
```json
{
  "success": true,
  "data": {
    "menuItem": {}
  }
}
```

#### GET `/api/hero-banners`
Get hero banners.

**Response:**
```json
{
  "success": true,
  "data": {
    "banners": []
  }
}
```

---

## Restaurant Owner APIs

### Restaurant Management

#### POST `/api/restaurants`
Create a new restaurant.

**Authentication**: Required (RESTAURANT_OWNER role)

**Request Body:**
```json
{
  "name": "string",
  "ownerName": "string",
  "phone": "string",
  "address": "string",
  "latitude": "number",
  "longitude": "number",
  "locationId": "string",
  "operatingHours": {},
  "cuisineTypes": []
}
```

**Response:**
```json
{
  "message": "Restaurant created successfully",
  "restaurant": {}
}
```

#### GET `/api/restaurants`
Get restaurant for authenticated owner.

**Authentication**: Required (RESTAURANT_OWNER role)

**Response:**
```json
{
  "restaurant": {}
}
```

#### POST `/api/restaurant/signup`
Restaurant signup endpoint.

**Authentication**: Required

**Request Body:**
```json
{
  "name": "string",
  "ownerName": "string",
  "phone": "string",
  "address": "string",
  "latitude": "number",
  "longitude": "number",
  "locationId": "string",
  "operatingHours": {}
}
```

---

### Orders

#### GET `/api/restaurant/orders`
Get orders for restaurant.

**Authentication**: Required (RESTAURANT_OWNER role)

**Query Parameters:**
- `status` (optional): Filter by status
- `limit` (optional): Number of orders
- `offset` (optional): Pagination offset

**Response:**
```json
{
  "success": true,
  "data": {
    "orders": []
  }
}
```

---

### Earnings

#### GET `/api/restaurant/earnings`
Get restaurant earnings.

**Authentication**: Required (RESTAURANT_OWNER role)

**Query Parameters:**
- `startDate` (optional): Start date
- `endDate` (optional): End date

**Response:**
```json
{
  "success": true,
  "data": {
    "earnings": {},
    "transactions": []
  }
}
```
---

### Delivery Partners

#### GET `/api/restaurant/delivery-partners`
Get delivery partners assigned to restaurant.

**Authentication**: Required (RESTAURANT_OWNER role)

**Response:**
```json
{
  "success": true,
  "data": {
    "partners": []
  }
}
```

---

## Delivery Partner APIs

### Profile

#### GET `/api/delivery-partners/me`
Get delivery partner profile.

**Authentication**: Required (DELIVERY_PARTNER role)

**Response:**
```json
{
  "success": true,
  "data": {
    "partner": {}
  }
}
```

#### POST `/api/delivery-partners/me`
Update delivery partner profile.

**Authentication**: Required (DELIVERY_PARTNER role)

**Request Body:**
```json
{
  "status": "AVAILABLE" | "BUSY" | "OFFLINE",
  "currentLatitude": "number",
  "currentLongitude": "number"
}
```

---

### Orders

#### GET `/api/delivery-partners/me/orders`
Get orders assigned to delivery partner.

**Authentication**: Required (DELIVERY_PARTNER role)

**Query Parameters:**
- `status` (optional): Filter by status

**Response:**
```json
{
  "success": true,
  "data": {
    "orders": []
  }
}
```

---

### Delivery Partners (General)

#### GET `/api/delivery-partners`
Get all delivery partners.

**Authentication**: Required (ADMIN or OPERATIONS role)

**Response:**
```json
{
  "success": true,
  "data": []
}
```

#### POST `/api/delivery-partners`
Create a delivery partner.

**Authentication**: Required (ADMIN role)

**Request Body:**
```json
{
  "userId": "string",
  "telegramPhone": "string"
}
```

#### GET `/api/delivery-partners/[id]`
Get delivery partner by ID.

**Authentication**: Required (ADMIN or OPERATIONS role)

---

## Admin APIs

### Users

#### GET `/api/admin/users`
Get all users.

**Authentication**: Required (ADMIN role)

**Response:**
```json
{
  "success": true,
  "data": {
    "users": []
  }
}
```

#### POST `/api/admin/users`
Create a new user.

**Authentication**: Required (ADMIN role)

---

### Restaurants

#### GET `/api/admin/restaurants`
Get all restaurants.

**Authentication**: Required (ADMIN role)

**Response:**
```json
{
  "success": true,
  "data": {
    "restaurants": []
  }
}
```

---

### Customers

#### GET `/api/admin/customers`
Get all customers.

**Authentication**: Required (ADMIN role)

**Response:**
```json
{
  "success": true,
  "data": {
    "customers": []
  }
}
```

#### GET `/api/admin/customers/[id]`
Get customer details.

**Authentication**: Required (ADMIN role)

---

### Locations

#### GET `/api/admin/locations`
Get all locations.

**Authentication**: Required (ADMIN role)

#### POST `/api/admin/locations`
Create a new location.

**Authentication**: Required (ADMIN role)

**Request Body:**
```json
{
  "name": "string",
  "city": "string",
  "state": "string",
  "country": "string",
  "isActive": "boolean"
}
```

#### GET `/api/admin/locations/[id]`
Get location by ID.

#### PUT `/api/admin/locations/[id]`
Update location.

#### DELETE `/api/admin/locations/[id]`
Delete location.

---

### Analytics

#### GET `/api/admin/analytics`
Get platform analytics.

**Authentication**: Required (ADMIN role)

**Query Parameters:**
- `startDate` (optional): Start date
- `endDate` (optional): End date

**Response:**
```json
{
  "success": true,
  "data": {
    "metrics": {},
    "charts": {}
  }
}
```

---

## Operations APIs

### Active Orders

#### GET `/api/operations/active-orders`
Get all active orders.

**Authentication**: Required (OPERATIONS role)

**Response:**
```json
{
  "success": true,
  "data": {
    "orders": []
  }
}
```

---

### Assignments

#### POST `/api/operations/assignments`
Assign delivery partner to order.

**Authentication**: Required (OPERATIONS role)

**Request Body:**
```json
{
  "orderId": "string",
  "deliveryPartnerId": "string"
}
```

---

### Restaurants

#### GET `/api/operations/restaurants`
Get all restaurants for operations.

**Authentication**: Required (OPERATIONS role)

---

### Restaurant Operations

#### GET `/api/operations/restaurant/live-orders`
Get live orders for a restaurant.

**Authentication**: Required (OPERATIONS role)

**Query Parameters:**
- `restaurantId`: Restaurant ID (required)

---

#### GET `/api/operations/restaurant/stats`
Get restaurant statistics.

**Authentication**: Required (OPERATIONS role)

**Query Parameters:**
- `restaurantId`: Restaurant ID (required)

---

#### GET `/api/operations/restaurant/menu`
Get restaurant menu for operations.

**Authentication**: Required (OPERATIONS role)

**Query Parameters:**
- `restaurantId`: Restaurant ID (required)

---

### Delivery Partners

#### GET `/api/operations/delivery-partners`
Get all delivery partners.

**Authentication**: Required (OPERATIONS role)

#### GET `/api/operations/delivery-partners/[id]`
Get delivery partner details.

**Authentication**: Required (OPERATIONS role)

---

### Validation

#### POST `/api/operations/validate-hack-of-the-day`
Validate hack of the day.

**Authentication**: Required (OPERATIONS role)

---

## Notifications APIs

### Preferences

#### GET `/api/notifications/preferences`
Get notification preferences.

**Authentication**: Required

**Response:**
```json
{
  "success": true,
  "data": {
    "preferences": {}
  }
}
```

#### POST `/api/notifications/preferences`
Update notification preferences.

**Authentication**: Required

**Request Body:**
```json
{
  "emailEnabled": "boolean",
  "pushEnabled": "boolean",
  "smsEnabled": "boolean",
  "telegramEnabled": "boolean",
  "orderUpdates": "boolean",
  "promotions": "boolean",
  "deliveryAlerts": "boolean",
  "systemAnnouncements": "boolean",
  "frequency": "REAL_TIME" | "HOURLY" | "DAILY" | "WEEKLY",
  "quietHoursStart": "string",
  "quietHoursEnd": "string"
}
```

---

### Registration

#### POST `/api/notifications/register`
Register for push notifications.

**Authentication**: Required

**Request Body:**
```json
{
  "endpoint": "string",
  "p256dh": "string",
  "auth": "string",
  "userAgent": "string"
}
```

---

### Sending

#### POST `/api/notifications/send`
Send a notification.

**Authentication**: Required (ADMIN role)

**Request Body:**
```json
{
  "userId": "string",
  "title": "string",
  "body": "string",
  "imageUrl": "string",
  "data": {}
}
```

---

### Scheduled Notifications

#### POST `/api/notifications/process-scheduled`
Process scheduled notifications.

**Authentication**: Required (Internal/Admin)

#### POST `/api/notifications/trigger-scheduled`
Trigger scheduled notifications processing.

**Authentication**: Required (Admin)

---

### Statistics

#### GET `/api/notifications/stats`
Get notification statistics.

**Authentication**: Required (ADMIN role)

---

### Welcome Notifications

#### GET `/api/welcome-notifications`
Get welcome notifications.

**Authentication**: Required (ADMIN role)

#### POST `/api/welcome-notifications`
Create welcome notification.

**Authentication**: Required (ADMIN role)

#### GET `/api/welcome-notifications/[id]`
Get welcome notification by ID.

#### PUT `/api/welcome-notifications/[id]`
Update welcome notification.

#### DELETE `/api/welcome-notifications/[id]`
Delete welcome notification.

#### POST `/api/welcome-notifications/trigger`
Trigger welcome notification.

**Authentication**: Required (ADMIN role)

---

### Login Notifications

#### POST `/api/login-notifications/trigger`
Trigger login notification.

**Authentication**: Required (Internal)

---

### Push Subscription

#### POST `/api/push-subscription`
Subscribe to push notifications.

**Authentication**: Required

**Request Body:**
```json
{
  "endpoint": "string",
  "p256dh": "string",
  "auth": "string"
}
```

---

## Upload APIs

### Images

#### POST `/api/upload/image`
Upload an image.

**Authentication**: Required

**Request Body (FormData):**
- `image`: Image file
- `folder`: Folder name (optional)

**Response:**
```json
{
  "success": true,
  "data": {
    "url": "string"
  }
}
```

#### POST `/api/upload/restaurant-image`
Upload restaurant image.

**Authentication**: Required (RESTAURANT_OWNER role)

#### POST `/api/upload/notification-image`
Upload notification image.

**Authentication**: Required (ADMIN role)

---

## Analytics APIs

### Metrics

#### GET `/api/analytics/metrics`
Get platform metrics.

**Authentication**: Required (ADMIN role)

**Response:**
```json
{
  "success": true,
  "data": {
    "metrics": {}
  }
}
```

---

### Payments

#### GET `/api/analytics/payments`
Get payment analytics.

**Authentication**: Required (ADMIN role)

---

## Utility APIs

### Geocoding

#### GET `/api/geocode/reverse`
Reverse geocode coordinates to address.

**Query Parameters:**
- `latitude`: Latitude (required)
- `longitude`: Longitude (required)

**Response:**
```json
{
  "success": true,
  "data": {
    "address": "string"
  }
}
```

---

### Images

#### GET `/api/images/[...path]`
Get image by path.

**Authentication**: Not required

---

### Updates

#### GET `/api/updates/etag`
Get ETag for cache validation.

---

### User Management

#### POST `/api/user/update-role`
Update user role.

**Authentication**: Required

**Request Body:**
```json
{
  "userId": "string",
  "role": "CUSTOMER" | "DELIVERY_PARTNER" | "RESTAURANT_OWNER"
}
```

---

#### GET `/api/users`
Get users.

**Authentication**: Required (ADMIN role)

#### GET `/api/users/[id]/welcome-status`
Get user welcome notification status.

**Authentication**: Required

---

## Testing & Development APIs

### FCM Testing

#### POST `/api/test-fcm`
Test FCM notification.

**Authentication**: Required (Admin)

---

### Telegram Testing

#### POST `/api/test-telegram`
Test Telegram bot.

**Authentication**: Required (Admin)

---

### Restaurant Testing

#### POST `/api/test-restaurant`
Test restaurant creation.

**Authentication**: Required (Admin)

---

### Bot Management

#### GET `/api/bot-status`
Get Telegram bot status.

**Authentication**: Required (Admin)

#### POST `/api/init-bot`
Initialize Telegram bot.

**Authentication**: Required (Admin)

#### POST `/api/telegram-webhook`
Telegram webhook endpoint.

---

### Firebase

#### GET `/api/check-firebase-config`
Check Firebase configuration.

**Authentication**: Required (Admin)

---

### Cleanup

#### POST `/api/cleanup/images`
Cleanup unused images.

**Authentication**: Required (Admin)

#### POST `/api/cleanup/old-images`
Cleanup old images.

**Authentication**: Required (Admin)

#### POST `/api/cleanup/trigger`
Trigger cleanup process.

**Authentication**: Required (Admin)

---

### FCM Tokens

#### POST `/api/clear-fcm-tokens`
Clear FCM tokens.

**Authentication**: Required (Admin)

---

## Error Codes

| Status Code | Description |
|------------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 500 | Internal Server Error |

---

## Rate Limiting

API rate limiting may be applied to prevent abuse. Check response headers for rate limit information.

---

## Webhooks

### Razorpay Webhooks

The `/api/payments/webhooks` endpoint receives webhook events from Razorpay. Ensure proper signature verification is implemented.

### Telegram Webhooks

The `/api/telegram-webhook` endpoint receives updates from Telegram Bot API.

---

## Notes

- All timestamps are in ISO 8601 format
- All monetary values are in the smallest currency unit (paise for INR)
- Image uploads support common formats (JPEG, PNG, WebP)
- Maximum file size for uploads: 10MB
- API responses are cached where appropriate

