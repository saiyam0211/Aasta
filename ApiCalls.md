When opened addressSheet and selected live location in home page ---
GET /api/user/address 200 in 1825ms
🌐 API REQUEST: {
  method: 'GET',
  url: 'http://localhost:3000/api/user/address',
  pathname: '/api/user/address',
  timestamp: '2025-09-30T14:11:02.155Z',
  userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Vers'
}
Redirect URL: https://neutral-octopus-famous.ngrok-free.app Base URL: https://neutral-octopus-famous.ngrok-free.app
prisma:query SELECT 1
prisma:query SELECT "public"."users"."id", "public"."users"."email", "public"."users"."name", "public"."users"."image", "public"."users"."phone", "public"."users"."role"::text, "public"."users"."googleId", "public"."users"."createdAt", "public"."users"."updatedAt", "public"."users"."password" FROM "public"."users" WHERE "public"."users"."phone" = $1 LIMIT $2 OFFSET $3
prisma:query SELECT "public"."customers"."id", "public"."customers"."userId", "public"."customers"."favoriteRestaurants", "public"."customers"."defaultAddressId", "public"."customers"."createdAt", "public"."customers"."updatedAt" FROM "public"."customers" WHERE "public"."customers"."userId" IN ($1) OFFSET $2
prisma:query SELECT "public"."delivery_partners"."id", "public"."delivery_partners"."userId", "public"."delivery_partners"."assignedRestaurants", "public"."delivery_partners"."currentLatitude", "public"."delivery_partners"."currentLongitude", "public"."delivery_partners"."status"::text, "public"."delivery_partners"."todayEarnings", "public"."delivery_partners"."totalEarnings", "public"."delivery_partners"."rating", "public"."delivery_partners"."completedDeliveries", "public"."delivery_partners"."createdAt", "public"."delivery_partners"."updatedAt", "public"."delivery_partners"."telegramPhone", "public"."delivery_partners"."telegramChatId", "public"."delivery_partners"."ratingCount" FROM "public"."delivery_partners" WHERE "public"."delivery_partners"."userId" IN ($1) OFFSET $2
prisma:query SELECT "public"."customers"."id", "public"."customers"."userId", "public"."customers"."favoriteRestaurants", "public"."customers"."defaultAddressId", "public"."customers"."createdAt", "public"."customers"."updatedAt" FROM "public"."customers" WHERE ("public"."customers"."userId" = $1 AND 1=1) LIMIT $2 OFFSET $3
prisma:query SELECT "public"."addresses"."id", "public"."addresses"."customerId", "public"."addresses"."type"::text, "public"."addresses"."street", "public"."addresses"."city", "public"."addresses"."state", "public"."addresses"."zipCode", "public"."addresses"."latitude", "public"."addresses"."longitude", "public"."addresses"."landmark", "public"."addresses"."instructions", "public"."addresses"."isDefault", "public"."addresses"."createdAt", "public"."addresses"."updatedAt", "public"."addresses"."contactPhone", "public"."addresses"."houseNumber", "public"."addresses"."locality" FROM "public"."addresses" WHERE "public"."addresses"."customerId" = $1 ORDER BY "public"."addresses"."isDefault" DESC OFFSET $2
 GET /api/user/address 200 in 449ms
🌐 API REQUEST: {
  method: 'GET',
  url: 'http://localhost:3000/api/geocode/reverse?lat=12.983607855493151&lng=77.73224727345453',
  pathname: '/api/geocode/reverse',
  timestamp: '2025-09-30T14:11:07.374Z',
  userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Vers'
}
 ○ Compiling /api/geocode/reverse ...
 ✓ Compiled /api/geocode/reverse in 1071ms (1312 modules)
Reverse geocoding for: { lat: '12.983607855493151', lng: '77.73224727345453' }
Google Maps API response status: OK
Processed location data: {
  latitude: 12.983607855493151,
  longitude: 77.73224727345453,
  address: 'XPMJ+9W7, KIADB Export Promotion Industrial Area, Whitefield, Bengaluru, Karnataka 560066, India',
  city: 'Bangalore Division',
  state: 'Karnataka',
  zipCode: '560066'
}
 GET /api/geocode/reverse?lat=12.983607855493151&lng=77.73224727345453 200 in 1583ms
🌐 API REQUEST: {
  method: 'GET',
  url: 'http://localhost:3000/api/nearby-restaurants?latitude=12.9842762&longitude=77.7327008&radius=5&limit=8',
  pathname: '/api/nearby-restaurants',
  timestamp: '2025-09-30T14:11:08.985Z',
  userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Vers'
}
 ✓ Compiled /api/nearby-restaurants in 292ms (862 modules)
[next-auth][warn][DEBUG_ENABLED] 
https://next-auth.js.org/warnings#debug_enabled
Redirect URL: https://neutral-octopus-famous.ngrok-free.app Base URL: https://neutral-octopus-famous.ngrok-free.app
prisma:query SELECT "public"."users"."id", "public"."users"."email", "public"."users"."name", "public"."users"."image", "public"."users"."phone", "public"."users"."role"::text, "public"."users"."googleId", "public"."users"."createdAt", "public"."users"."updatedAt", "public"."users"."password" FROM "public"."users" WHERE "public"."users"."phone" = $1 LIMIT $2 OFFSET $3
prisma:query SELECT "public"."customers"."id", "public"."customers"."userId", "public"."customers"."favoriteRestaurants", "public"."customers"."defaultAddressId", "public"."customers"."createdAt", "public"."customers"."updatedAt" FROM "public"."customers" WHERE "public"."customers"."userId" IN ($1) OFFSET $2
prisma:query SELECT "public"."delivery_partners"."id", "public"."delivery_partners"."userId", "public"."delivery_partners"."assignedRestaurants", "public"."delivery_partners"."currentLatitude", "public"."delivery_partners"."currentLongitude", "public"."delivery_partners"."status"::text, "public"."delivery_partners"."todayEarnings", "public"."delivery_partners"."totalEarnings", "public"."delivery_partners"."rating", "public"."delivery_partners"."completedDeliveries", "public"."delivery_partners"."createdAt", "public"."delivery_partners"."updatedAt", "public"."delivery_partners"."telegramPhone", "public"."delivery_partners"."telegramChatId", "public"."delivery_partners"."ratingCount" FROM "public"."delivery_partners" WHERE "public"."delivery_partners"."userId" IN ($1) OFFSET $2
prisma:query SELECT "public"."restaurants"."id", "public"."restaurants"."name", "public"."restaurants"."ownerId", "public"."restaurants"."latitude", "public"."restaurants"."longitude", "public"."restaurants"."address", "public"."restaurants"."phone", "public"."restaurants"."email", "public"."restaurants"."imageUrl", "public"."restaurants"."cuisineTypes", "public"."restaurants"."averagePreparationTime", "public"."restaurants"."minimumOrderAmount", "public"."restaurants"."deliveryRadius", "public"."restaurants"."commissionRate", "public"."restaurants"."rating", "public"."restaurants"."totalOrders", "public"."restaurants"."status"::text, "public"."restaurants"."operatingHours", "public"."restaurants"."assignedDeliveryPartners", "public"."restaurants"."createdAt", "public"."restaurants"."updatedAt", "public"."restaurants"."ownerName", "public"."restaurants"."aastaPricePercentage", "public"."restaurants"."restaurantPricePercentage", "public"."restaurants"."locationId", "public"."restaurants"."pickupExperienceCount", "public"."restaurants"."pickupExperienceRating", COALESCE("aggr_selection_0_Order"."_aggr_count_orders", 0) AS "_aggr_count_orders" FROM "public"."restaurants" LEFT JOIN (SELECT "public"."orders"."restaurantId", COUNT(*) AS "_aggr_count_orders" FROM "public"."orders" WHERE "public"."orders"."createdAt" >= $1 GROUP BY "public"."orders"."restaurantId") AS "aggr_selection_0_Order" ON ("public"."restaurants"."id" = "aggr_selection_0_Order"."restaurantId") WHERE "public"."restaurants"."status" IN (CAST($2::text AS "public"."RestaurantStatus"),CAST($3::text AS "public"."RestaurantStatus")) ORDER BY "public"."restaurants"."rating" DESC OFFSET $4
prisma:query SELECT "public"."menu_items"."id", "public"."menu_items"."name", "public"."menu_items"."price", "public"."menu_items"."imageUrl", "public"."menu_items"."dietaryTags" FROM "public"."menu_items" WHERE ("public"."menu_items"."restaurantId" = $1 AND "public"."menu_items"."available" = $2) ORDER BY "public"."menu_items"."featured" DESC, "public"."menu_items"."createdAt" DESC LIMIT $3 OFFSET $4
prisma:query SELECT "public"."menu_items"."id", "public"."menu_items"."name", "public"."menu_items"."price", "public"."menu_items"."imageUrl", "public"."menu_items"."dietaryTags" FROM "public"."menu_items" WHERE ("public"."menu_items"."restaurantId" = $1 AND "public"."menu_items"."available" = $2) ORDER BY "public"."menu_items"."featured" DESC, "public"."menu_items"."createdAt" DESC LIMIT $3 OFFSET $4
prisma:query SELECT "public"."menu_items"."id", "public"."menu_items"."name", "public"."menu_items"."price", "public"."menu_items"."imageUrl", "public"."menu_items"."dietaryTags" FROM "public"."menu_items" WHERE ("public"."menu_items"."restaurantId" = $1 AND "public"."menu_items"."available" = $2) ORDER BY "public"."menu_items"."featured" DESC, "public"."menu_items"."createdAt" DESC LIMIT $3 OFFSET $4
prisma:query SELECT "public"."menu_items"."id", "public"."menu_items"."name", "public"."menu_items"."price", "public"."menu_items"."imageUrl", "public"."menu_items"."dietaryTags" FROM "public"."menu_items" WHERE ("public"."menu_items"."restaurantId" = $1 AND "public"."menu_items"."available" = $2) ORDER BY "public"."menu_items"."featured" DESC, "public"."menu_items"."createdAt" DESC LIMIT $3 OFFSET $4
prisma:query SELECT "public"."menu_items"."id", "public"."menu_items"."name", "public"."menu_items"."price", "public"."menu_items"."imageUrl", "public"."menu_items"."dietaryTags" FROM "public"."menu_items" WHERE ("public"."menu_items"."restaurantId" = $1 AND "public"."menu_items"."available" = $2) ORDER BY "public"."menu_items"."featured" DESC, "public"."menu_items"."createdAt" DESC LIMIT $3 OFFSET $4
prisma:query SELECT "public"."menu_items"."id", "public"."menu_items"."name", "public"."menu_items"."price", "public"."menu_items"."imageUrl", "public"."menu_items"."dietaryTags" FROM "public"."menu_items" WHERE ("public"."menu_items"."restaurantId" = $1 AND "public"."menu_items"."available" = $2) ORDER BY "public"."menu_items"."featured" DESC, "public"."menu_items"."createdAt" DESC LIMIT $3 OFFSET $4
 GET /api/nearby-restaurants?latitude=12.9842762&longitude=77.7327008&radius=5&limit=8 200 in 1466ms
🌐 API REQUEST: {
  method: 'GET',
  url: 'http://localhost:3000/api/featured-dishes?limit=8&lat=12.9842762&lng=77.7327008&radius=5',
  pathname: '/api/featured-dishes',
  timestamp: '2025-09-30T14:11:10.489Z',
  userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Vers'
}
 ○ Compiling /api/featured-dishes ...
 ✓ Compiled /api/featured-dishes in 529ms (1319 modules)
[next-auth][warn][DEBUG_ENABLED] 
https://next-auth.js.org/warnings#debug_enabled
Redirect URL: https://neutral-octopus-famous.ngrok-free.app Base URL: https://neutral-octopus-famous.ngrok-free.app
prisma:query SELECT "public"."users"."id", "public"."users"."email", "public"."users"."name", "public"."users"."image", "public"."users"."phone", "public"."users"."role"::text, "public"."users"."googleId", "public"."users"."createdAt", "public"."users"."updatedAt", "public"."users"."password" FROM "public"."users" WHERE "public"."users"."phone" = $1 LIMIT $2 OFFSET $3
prisma:query SELECT "public"."customers"."id", "public"."customers"."userId", "public"."customers"."favoriteRestaurants", "public"."customers"."defaultAddressId", "public"."customers"."createdAt", "public"."customers"."updatedAt" FROM "public"."customers" WHERE "public"."customers"."userId" IN ($1) OFFSET $2
prisma:query SELECT "public"."delivery_partners"."id", "public"."delivery_partners"."userId", "public"."delivery_partners"."assignedRestaurants", "public"."delivery_partners"."currentLatitude", "public"."delivery_partners"."currentLongitude", "public"."delivery_partners"."status"::text, "public"."delivery_partners"."todayEarnings", "public"."delivery_partners"."totalEarnings", "public"."delivery_partners"."rating", "public"."delivery_partners"."completedDeliveries", "public"."delivery_partners"."createdAt", "public"."delivery_partners"."updatedAt", "public"."delivery_partners"."telegramPhone", "public"."delivery_partners"."telegramChatId", "public"."delivery_partners"."ratingCount" FROM "public"."delivery_partners" WHERE "public"."delivery_partners"."userId" IN ($1) OFFSET $2
prisma:query SELECT "public"."menu_items"."id", "public"."menu_items"."restaurantId", "public"."menu_items"."name", "public"."menu_items"."description", "public"."menu_items"."price", "public"."menu_items"."originalPrice", "public"."menu_items"."category", "public"."menu_items"."preparationTime", "public"."menu_items"."imageUrl", "public"."menu_items"."dietaryTags", "public"."menu_items"."spiceLevel", "public"."menu_items"."available", "public"."menu_items"."featured", "public"."menu_items"."createdAt", "public"."menu_items"."updatedAt", "public"."menu_items"."stockLeft", "public"."menu_items"."rating", "public"."menu_items"."ratingCount", "public"."menu_items"."hackOfTheDay" FROM "public"."menu_items" LEFT JOIN "public"."restaurants" AS "orderby_1" ON ("orderby_1"."id") = ("public"."menu_items"."restaurantId") LEFT JOIN "public"."restaurants" AS "j0" ON ("j0"."id") = ("public"."menu_items"."restaurantId") WHERE ("public"."menu_items"."featured" = $1 AND "public"."menu_items"."available" = $2 AND ("j0"."status" = CAST($3::text AS "public"."RestaurantStatus") AND ("j0"."id" IS NOT NULL))) ORDER BY "orderby_1"."rating" DESC, "public"."menu_items"."createdAt" DESC LIMIT $4 OFFSET $5
prisma:query SELECT "public"."restaurants"."id", "public"."restaurants"."name", "public"."restaurants"."rating", "public"."restaurants"."averagePreparationTime", "public"."restaurants"."latitude", "public"."restaurants"."longitude" FROM "public"."restaurants" WHERE "public"."restaurants"."id" IN ($1,$2,$3) OFFSET $4
 GET /api/featured-dishes?limit=8&lat=12.9842762&lng=77.7327008&radius=5 200 in 1338ms
🌐 API REQUEST: {
  method: 'GET',
  url: 'http://localhost:3000/api/hack-of-the-day?lat=12.9842762&lng=77.7327008&radius=5',
  pathname: '/api/hack-of-the-day',
  timestamp: '2025-09-30T14:11:11.976Z',
  userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Vers'
}
 ✓ Compiled /api/hack-of-the-day in 308ms (866 modules)
prisma:query SELECT "public"."menu_items"."id", "public"."menu_items"."restaurantId", "public"."menu_items"."name", "public"."menu_items"."description", "public"."menu_items"."price", "public"."menu_items"."originalPrice", "public"."menu_items"."category", "public"."menu_items"."preparationTime", "public"."menu_items"."imageUrl", "public"."menu_items"."dietaryTags", "public"."menu_items"."spiceLevel", "public"."menu_items"."available", "public"."menu_items"."featured", "public"."menu_items"."createdAt", "public"."menu_items"."updatedAt", "public"."menu_items"."stockLeft", "public"."menu_items"."rating", "public"."menu_items"."ratingCount", "public"."menu_items"."hackOfTheDay" FROM "public"."menu_items" LEFT JOIN "public"."restaurants" AS "j0" ON ("j0"."id") = ("public"."menu_items"."restaurantId") WHERE ("public"."menu_items"."hackOfTheDay" = $1 AND "public"."menu_items"."available" = $2 AND ("j0"."status" = CAST($3::text AS "public"."RestaurantStatus") AND ("j0"."id" IS NOT NULL))) ORDER BY "public"."menu_items"."createdAt" DESC OFFSET $4
prisma:query SELECT "public"."restaurants"."id", "public"."restaurants"."name", "public"."restaurants"."ownerId", "public"."restaurants"."latitude", "public"."restaurants"."longitude", "public"."restaurants"."address", "public"."restaurants"."phone", "public"."restaurants"."email", "public"."restaurants"."imageUrl", "public"."restaurants"."cuisineTypes", "public"."restaurants"."averagePreparationTime", "public"."restaurants"."minimumOrderAmount", "public"."restaurants"."deliveryRadius", "public"."restaurants"."commissionRate", "public"."restaurants"."rating", "public"."restaurants"."totalOrders", "public"."restaurants"."status"::text, "public"."restaurants"."operatingHours", "public"."restaurants"."assignedDeliveryPartners", "public"."restaurants"."createdAt", "public"."restaurants"."updatedAt", "public"."restaurants"."ownerName", "public"."restaurants"."aastaPricePercentage", "public"."restaurants"."restaurantPricePercentage", "public"."restaurants"."locationId", "public"."restaurants"."pickupExperienceCount", "public"."restaurants"."pickupExperienceRating" FROM "public"."restaurants" WHERE "public"."restaurants"."id" IN ($1) OFFSET $2
prisma:query SELECT "public"."locations"."id", "public"."locations"."name", "public"."locations"."city", "public"."locations"."state", "public"."locations"."country", "public"."locations"."isActive", "public"."locations"."createdAt", "public"."locations"."updatedAt" FROM "public"."locations" WHERE "public"."locations"."id" IN ($1) OFFSET $2
Found hack items: 2
Item: Veg Biryani, dietaryTags: ["Veg"], isVeg: true
Item: BBQ Chicken Pizza, dietaryTags: ["Non-Veg"], isVeg: false
 GET /api/hack-of-the-day?lat=12.9842762&lng=77.7327008&radius=5 200 in 704ms
🌐 API REQUEST: {
  method: 'GET',
  url: 'http://localhost:3000/api/nearby-restaurants?latitude=12.9842762&longitude=77.7327008&radius=5&limit=12',
  pathname: '/api/nearby-restaurants',
  timestamp: '2025-09-30T14:11:12.705Z',
  userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Vers'
}
[next-auth][warn][DEBUG_ENABLED] 
https://next-auth.js.org/warnings#debug_enabled
Redirect URL: https://neutral-octopus-famous.ngrok-free.app Base URL: https://neutral-octopus-famous.ngrok-free.app
prisma:query SELECT "public"."users"."id", "public"."users"."email", "public"."users"."name", "public"."users"."image", "public"."users"."phone", "public"."users"."role"::text, "public"."users"."googleId", "public"."users"."createdAt", "public"."users"."updatedAt", "public"."users"."password" FROM "public"."users" WHERE "public"."users"."phone" = $1 LIMIT $2 OFFSET $3
prisma:query SELECT "public"."customers"."id", "public"."customers"."userId", "public"."customers"."favoriteRestaurants", "public"."customers"."defaultAddressId", "public"."customers"."createdAt", "public"."customers"."updatedAt" FROM "public"."customers" WHERE "public"."customers"."userId" IN ($1) OFFSET $2
prisma:query SELECT "public"."delivery_partners"."id", "public"."delivery_partners"."userId", "public"."delivery_partners"."assignedRestaurants", "public"."delivery_partners"."currentLatitude", "public"."delivery_partners"."currentLongitude", "public"."delivery_partners"."status"::text, "public"."delivery_partners"."todayEarnings", "public"."delivery_partners"."totalEarnings", "public"."delivery_partners"."rating", "public"."delivery_partners"."completedDeliveries", "public"."delivery_partners"."createdAt", "public"."delivery_partners"."updatedAt", "public"."delivery_partners"."telegramPhone", "public"."delivery_partners"."telegramChatId", "public"."delivery_partners"."ratingCount" FROM "public"."delivery_partners" WHERE "public"."delivery_partners"."userId" IN ($1) OFFSET $2
prisma:query SELECT "public"."restaurants"."id", "public"."restaurants"."name", "public"."restaurants"."ownerId", "public"."restaurants"."latitude", "public"."restaurants"."longitude", "public"."restaurants"."address", "public"."restaurants"."phone", "public"."restaurants"."email", "public"."restaurants"."imageUrl", "public"."restaurants"."cuisineTypes", "public"."restaurants"."averagePreparationTime", "public"."restaurants"."minimumOrderAmount", "public"."restaurants"."deliveryRadius", "public"."restaurants"."commissionRate", "public"."restaurants"."rating", "public"."restaurants"."totalOrders", "public"."restaurants"."status"::text, "public"."restaurants"."operatingHours", "public"."restaurants"."assignedDeliveryPartners", "public"."restaurants"."createdAt", "public"."restaurants"."updatedAt", "public"."restaurants"."ownerName", "public"."restaurants"."aastaPricePercentage", "public"."restaurants"."restaurantPricePercentage", "public"."restaurants"."locationId", "public"."restaurants"."pickupExperienceCount", "public"."restaurants"."pickupExperienceRating", COALESCE("aggr_selection_0_Order"."_aggr_count_orders", 0) AS "_aggr_count_orders" FROM "public"."restaurants" LEFT JOIN (SELECT "public"."orders"."restaurantId", COUNT(*) AS "_aggr_count_orders" FROM "public"."orders" WHERE "public"."orders"."createdAt" >= $1 GROUP BY "public"."orders"."restaurantId") AS "aggr_selection_0_Order" ON ("public"."restaurants"."id" = "aggr_selection_0_Order"."restaurantId") WHERE "public"."restaurants"."status" IN (CAST($2::text AS "public"."RestaurantStatus"),CAST($3::text AS "public"."RestaurantStatus")) ORDER BY "public"."restaurants"."rating" DESC OFFSET $4
prisma:query SELECT "public"."menu_items"."id", "public"."menu_items"."name", "public"."menu_items"."price", "public"."menu_items"."imageUrl", "public"."menu_items"."dietaryTags" FROM "public"."menu_items" WHERE ("public"."menu_items"."restaurantId" = $1 AND "public"."menu_items"."available" = $2) ORDER BY "public"."menu_items"."featured" DESC, "public"."menu_items"."createdAt" DESC LIMIT $3 OFFSET $4
prisma:query SELECT "public"."menu_items"."id", "public"."menu_items"."name", "public"."menu_items"."price", "public"."menu_items"."imageUrl", "public"."menu_items"."dietaryTags" FROM "public"."menu_items" WHERE ("public"."menu_items"."restaurantId" = $1 AND "public"."menu_items"."available" = $2) ORDER BY "public"."menu_items"."featured" DESC, "public"."menu_items"."createdAt" DESC LIMIT $3 OFFSET $4
prisma:query SELECT "public"."menu_items"."id", "public"."menu_items"."name", "public"."menu_items"."price", "public"."menu_items"."imageUrl", "public"."menu_items"."dietaryTags" FROM "public"."menu_items" WHERE ("public"."menu_items"."restaurantId" = $1 AND "public"."menu_items"."available" = $2) ORDER BY "public"."menu_items"."featured" DESC, "public"."menu_items"."createdAt" DESC LIMIT $3 OFFSET $4
prisma:query SELECT "public"."menu_items"."id", "public"."menu_items"."name", "public"."menu_items"."price", "public"."menu_items"."imageUrl", "public"."menu_items"."dietaryTags" FROM "public"."menu_items" WHERE ("public"."menu_items"."restaurantId" = $1 AND "public"."menu_items"."available" = $2) ORDER BY "public"."menu_items"."featured" DESC, "public"."menu_items"."createdAt" DESC LIMIT $3 OFFSET $4
prisma:query SELECT "public"."menu_items"."id", "public"."menu_items"."name", "public"."menu_items"."price", "public"."menu_items"."imageUrl", "public"."menu_items"."dietaryTags" FROM "public"."menu_items" WHERE ("public"."menu_items"."restaurantId" = $1 AND "public"."menu_items"."available" = $2) ORDER BY "public"."menu_items"."featured" DESC, "public"."menu_items"."createdAt" DESC LIMIT $3 OFFSET $4
prisma:query SELECT "public"."menu_items"."id", "public"."menu_items"."name", "public"."menu_items"."price", "public"."menu_items"."imageUrl", "public"."menu_items"."dietaryTags" FROM "public"."menu_items" WHERE ("public"."menu_items"."restaurantId" = $1 AND "public"."menu_items"."available" = $2) ORDER BY "public"."menu_items"."featured" DESC, "public"."menu_items"."createdAt" DESC LIMIT $3 OFFSET $4
 GET /api/nearby-restaurants?latitude=12.9842762&longitude=77.7327008&radius=5&limit=12 200 in 530ms
🌐 API REQUEST: {
  method: 'GET',
  url: 'http://localhost:3000/api/menu-items?restaurantId=cmfmb36w4000funhyfw6zjkq8',
  pathname: '/api/menu-items',
  timestamp: '2025-09-30T14:11:13.263Z',
  userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Vers'
}
 ○ Compiling /api/menu-items ...
 ✓ Compiled /api/menu-items in 1458ms (1281 modules)
prisma:query SELECT "public"."menu_items"."id", "public"."menu_items"."restaurantId", "public"."menu_items"."name", "public"."menu_items"."description", "public"."menu_items"."price", "public"."menu_items"."originalPrice", "public"."menu_items"."category", "public"."menu_items"."preparationTime", "public"."menu_items"."imageUrl", "public"."menu_items"."dietaryTags", "public"."menu_items"."spiceLevel", "public"."menu_items"."available", "public"."menu_items"."featured", "public"."menu_items"."createdAt", "public"."menu_items"."updatedAt", "public"."menu_items"."stockLeft", "public"."menu_items"."rating", "public"."menu_items"."ratingCount", "public"."menu_items"."hackOfTheDay" FROM "public"."menu_items" WHERE ("public"."menu_items"."restaurantId" = $1 AND "public"."menu_items"."available" = $2) ORDER BY "public"."menu_items"."name" ASC OFFSET $3
 GET /api/menu-items?restaurantId=cmfmb36w4000funhyfw6zjkq8 200 in 1651ms
🌐 API REQUEST: {
  method: 'GET',
  url: 'http://localhost:3000/api/menu-items?restaurantId=cmfmb37j90010unhy47icafsh',
  pathname: '/api/menu-items',
  timestamp: '2025-09-30T14:11:14.938Z',
  userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Vers'
}
prisma:query SELECT "public"."menu_items"."id", "public"."menu_items"."restaurantId", "public"."menu_items"."name", "public"."menu_items"."description", "public"."menu_items"."price", "public"."menu_items"."originalPrice", "public"."menu_items"."category", "public"."menu_items"."preparationTime", "public"."menu_items"."imageUrl", "public"."menu_items"."dietaryTags", "public"."menu_items"."spiceLevel", "public"."menu_items"."available", "public"."menu_items"."featured", "public"."menu_items"."createdAt", "public"."menu_items"."updatedAt", "public"."menu_items"."stockLeft", "public"."menu_items"."rating", "public"."menu_items"."ratingCount", "public"."menu_items"."hackOfTheDay" FROM "public"."menu_items" WHERE ("public"."menu_items"."restaurantId" = $1 AND "public"."menu_items"."available" = $2) ORDER BY "public"."menu_items"."name" ASC OFFSET $3
 GET /api/menu-items?restaurantId=cmfmb37j90010unhy47icafsh 200 in 84ms
🌐 API REQUEST: {
  method: 'GET',
  url: 'http://localhost:3000/api/menu-items?restaurantId=cmfmb39s6002uunhyd6sblhgv',
  pathname: '/api/menu-items',
  timestamp: '2025-09-30T14:11:15.051Z',
  userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Vers'
}
prisma:query SELECT "public"."menu_items"."id", "public"."menu_items"."restaurantId", "public"."menu_items"."name", "public"."menu_items"."description", "public"."menu_items"."price", "public"."menu_items"."originalPrice", "public"."menu_items"."category", "public"."menu_items"."preparationTime", "public"."menu_items"."imageUrl", "public"."menu_items"."dietaryTags", "public"."menu_items"."spiceLevel", "public"."menu_items"."available", "public"."menu_items"."featured", "public"."menu_items"."createdAt", "public"."menu_items"."updatedAt", "public"."menu_items"."stockLeft", "public"."menu_items"."rating", "public"."menu_items"."ratingCount", "public"."menu_items"."hackOfTheDay" FROM "public"."menu_items" WHERE ("public"."menu_items"."restaurantId" = $1 AND "public"."menu_items"."available" = $2) ORDER BY "public"."menu_items"."name" ASC OFFSET $3
 GET /api/menu-items?restaurantId=cmfmb39s6002uunhyd6sblhgv 200 in 88ms
🌐 API REQUEST: {
  method: 'GET',
  url: 'http://localhost:3000/api/menu-items?restaurantId=cmfmb3b21003xunhyt0mjcetv',
  pathname: '/api/menu-items',
  timestamp: '2025-09-30T14:11:15.167Z',
  userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Vers'
}
prisma:query SELECT "public"."menu_items"."id", "public"."menu_items"."restaurantId", "public"."menu_items"."name", "public"."menu_items"."description", "public"."menu_items"."price", "public"."menu_items"."originalPrice", "public"."menu_items"."category", "public"."menu_items"."preparationTime", "public"."menu_items"."imageUrl", "public"."menu_items"."dietaryTags", "public"."menu_items"."spiceLevel", "public"."menu_items"."available", "public"."menu_items"."featured", "public"."menu_items"."createdAt", "public"."menu_items"."updatedAt", "public"."menu_items"."stockLeft", "public"."menu_items"."rating", "public"."menu_items"."ratingCount", "public"."menu_items"."hackOfTheDay" FROM "public"."menu_items" WHERE ("public"."menu_items"."restaurantId" = $1 AND "public"."menu_items"."available" = $2) ORDER BY "public"."menu_items"."name" ASC OFFSET $3
 GET /api/menu-items?restaurantId=cmfmb3b21003xunhyt0mjcetv 200 in 91ms
🌐 API REQUEST: {
  method: 'GET',
  url: 'http://localhost:3000/api/menu-items?restaurantId=cmfmb36ss000cunhy1wtpejbl',
  pathname: '/api/menu-items',
  timestamp: '2025-09-30T14:11:15.283Z',
  userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Vers'
}
prisma:query SELECT "public"."menu_items"."id", "public"."menu_items"."restaurantId", "public"."menu_items"."name", "public"."menu_items"."description", "public"."menu_items"."price", "public"."menu_items"."originalPrice", "public"."menu_items"."category", "public"."menu_items"."preparationTime", "public"."menu_items"."imageUrl", "public"."menu_items"."dietaryTags", "public"."menu_items"."spiceLevel", "public"."menu_items"."available", "public"."menu_items"."featured", "public"."menu_items"."createdAt", "public"."menu_items"."updatedAt", "public"."menu_items"."stockLeft", "public"."menu_items"."rating", "public"."menu_items"."ratingCount", "public"."menu_items"."hackOfTheDay" FROM "public"."menu_items" WHERE ("public"."menu_items"."restaurantId" = $1 AND "public"."menu_items"."available" = $2) ORDER BY "public"."menu_items"."name" ASC OFFSET $3
 GET /api/menu-items?restaurantId=cmfmb36ss000cunhy1wtpejbl 200 in 83ms
🌐 API REQUEST: {
  method: 'GET',
  url: 'http://localhost:3000/api/menu-items?restaurantId=cmfmb38ze0029unhy29jb4oqg',
  pathname: '/api/menu-items',
  timestamp: '2025-09-30T14:11:15.390Z',
  userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Vers'
}
prisma:query SELECT "public"."menu_items"."id", "public"."menu_items"."restaurantId", "public"."menu_items"."name", "public"."menu_items"."description", "public"."menu_items"."price", "public"."menu_items"."originalPrice", "public"."menu_items"."category", "public"."menu_items"."preparationTime", "public"."menu_items"."imageUrl", "public"."menu_items"."dietaryTags", "public"."menu_items"."spiceLevel", "public"."menu_items"."available", "public"."menu_items"."featured", "public"."menu_items"."createdAt", "public"."menu_items"."updatedAt", "public"."menu_items"."stockLeft", "public"."menu_items"."rating", "public"."menu_items"."ratingCount", "public"."menu_items"."hackOfTheDay" FROM "public"."menu_items" WHERE ("public"."menu_items"."restaurantId" = $1 AND "public"."menu_items"."available" = $2) ORDER BY "public"."menu_items"."name" ASC OFFSET $3
 GET /api/menu-items?restaurantId=cmfmb38ze0029unhy29jb4oqg 200 in 82ms
🌐 API REQUEST: {
  method: 'GET',
  url: 'http://localhost:3000/api/orders?limit=4&paymentStatus=COMPLETED',
  pathname: '/api/orders',
  timestamp: '2025-09-30T14:11:15.504Z',
  userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Vers'
}
 ○ Compiling /api/orders ...
 ✓ Compiled /api/orders in 668ms (1336 modules)
[next-auth][warn][DEBUG_ENABLED] 
https://next-auth.js.org/warnings#debug_enabled
Redirect URL: https://neutral-octopus-famous.ngrok-free.app Base URL: https://neutral-octopus-famous.ngrok-free.app
prisma:query SELECT "public"."users"."id", "public"."users"."email", "public"."users"."name", "public"."users"."image", "public"."users"."phone", "public"."users"."role"::text, "public"."users"."googleId", "public"."users"."createdAt", "public"."users"."updatedAt", "public"."users"."password" FROM "public"."users" WHERE "public"."users"."phone" = $1 LIMIT $2 OFFSET $3
prisma:query SELECT "public"."customers"."id", "public"."customers"."userId", "public"."customers"."favoriteRestaurants", "public"."customers"."defaultAddressId", "public"."customers"."createdAt", "public"."customers"."updatedAt" FROM "public"."customers" WHERE "public"."customers"."userId" IN ($1) OFFSET $2
prisma:query SELECT "public"."delivery_partners"."id", "public"."delivery_partners"."userId", "public"."delivery_partners"."assignedRestaurants", "public"."delivery_partners"."currentLatitude", "public"."delivery_partners"."currentLongitude", "public"."delivery_partners"."status"::text, "public"."delivery_partners"."todayEarnings", "public"."delivery_partners"."totalEarnings", "public"."delivery_partners"."rating", "public"."delivery_partners"."completedDeliveries", "public"."delivery_partners"."createdAt", "public"."delivery_partners"."updatedAt", "public"."delivery_partners"."telegramPhone", "public"."delivery_partners"."telegramChatId", "public"."delivery_partners"."ratingCount" FROM "public"."delivery_partners" WHERE "public"."delivery_partners"."userId" IN ($1) OFFSET $2
prisma:query SELECT "public"."customers"."id", "public"."customers"."userId", "public"."customers"."favoriteRestaurants", "public"."customers"."defaultAddressId", "public"."customers"."createdAt", "public"."customers"."updatedAt" FROM "public"."customers" WHERE ("public"."customers"."userId" = $1 AND 1=1) LIMIT $2 OFFSET $3
Payment status filter applied: COMPLETED only
Final where clause for orders query: {
  "customerId": "cmfmbu91e0002unvr86lhm1x5",
  "paymentStatus": "COMPLETED"
}
prisma:query SELECT "public"."orders"."id", "public"."orders"."orderNumber", "public"."orders"."customerId", "public"."orders"."restaurantId", "public"."orders"."deliveryPartnerId", "public"."orders"."deliveryAddressId", "public"."orders"."status"::text, "public"."orders"."subtotal", "public"."orders"."deliveryFee", "public"."orders"."taxes", "public"."orders"."discountAmount", "public"."orders"."totalAmount", "public"."orders"."estimatedPreparationTime", "public"."orders"."estimatedDeliveryTime", "public"."orders"."actualDeliveryTime", "public"."orders"."verificationCode", "public"."orders"."paymentStatus", "public"."orders"."specialInstructions", "public"."orders"."cancelReason", "public"."orders"."createdAt", "public"."orders"."updatedAt", "public"."orders"."deliveryBatchId", "public"."orders"."razorpayOrderId", "public"."orders"."deliveryDistance", "public"."orders"."estimatedDeliveryDuration", "public"."orders"."orderType"::text FROM "public"."orders" WHERE ("public"."orders"."customerId" = $1 AND "public"."orders"."paymentStatus" = $2) ORDER BY "public"."orders"."createdAt" DESC LIMIT $3 OFFSET $4
prisma:query SELECT COUNT(*) AS "_count$_all" FROM (SELECT "public"."orders"."id" FROM "public"."orders" WHERE ("public"."orders"."customerId" = $1 AND "public"."orders"."paymentStatus" = $2) OFFSET $3) AS "sub"
prisma:query SELECT "public"."customers"."id", "public"."customers"."userId", "public"."customers"."favoriteRestaurants", "public"."customers"."defaultAddressId", "public"."customers"."createdAt", "public"."customers"."updatedAt" FROM "public"."customers" WHERE "public"."customers"."id" IN ($1) OFFSET $2
prisma:query SELECT "public"."users"."id", "public"."users"."name", "public"."users"."email", "public"."users"."phone" FROM "public"."users" WHERE "public"."users"."id" IN ($1) OFFSET $2
prisma:query SELECT "public"."restaurants"."id", "public"."restaurants"."name", "public"."restaurants"."phone", "public"."restaurants"."address" FROM "public"."restaurants" WHERE "public"."restaurants"."id" IN ($1,$2) OFFSET $3
prisma:query SELECT "public"."addresses"."id", "public"."addresses"."customerId", "public"."addresses"."type"::text, "public"."addresses"."street", "public"."addresses"."city", "public"."addresses"."state", "public"."addresses"."zipCode", "public"."addresses"."latitude", "public"."addresses"."longitude", "public"."addresses"."landmark", "public"."addresses"."instructions", "public"."addresses"."isDefault", "public"."addresses"."createdAt", "public"."addresses"."updatedAt", "public"."addresses"."contactPhone", "public"."addresses"."houseNumber", "public"."addresses"."locality" FROM "public"."addresses" WHERE "public"."addresses"."id" IN ($1) OFFSET $2
prisma:query SELECT "public"."order_items"."id", "public"."order_items"."orderId", "public"."order_items"."menuItemId", "public"."order_items"."quantity", "public"."order_items"."unitPrice", "public"."order_items"."totalPrice", "public"."order_items"."customizations", "public"."order_items"."createdAt", "public"."order_items"."aastaEarningsPerItem", "public"."order_items"."aastaTotalEarnings", "public"."order_items"."originalUnitPrice", "public"."order_items"."restaurantEarningsPerItem", "public"."order_items"."restaurantTotalEarnings", "public"."order_items"."totalOriginalPrice" FROM "public"."order_items" WHERE "public"."order_items"."orderId" IN ($1,$2,$3,$4) OFFSET $5
prisma:query SELECT "public"."menu_items"."id", "public"."menu_items"."name", "public"."menu_items"."description", "public"."menu_items"."imageUrl", "public"."menu_items"."price", "public"."menu_items"."originalPrice" FROM "public"."menu_items" WHERE "public"."menu_items"."id" IN ($1,$2,$3,$4,$5) OFFSET $6
Orders returned from database: [
  {
    orderNumber: 'AST-20250930-180944-2719',
    paymentStatus: 'COMPLETED',
    status: 'PLACED'
  },
  {
    orderNumber: 'AST-20250930-090024-1915',
    paymentStatus: 'COMPLETED',
    status: 'PLACED'
  },
  {
    orderNumber: 'AST-20250930-085539-1492',
    paymentStatus: 'COMPLETED',
    status: 'PLACED'
  },
  {
    orderNumber: 'AST-20250930-110639-4022',
    paymentStatus: 'COMPLETED',
    status: 'PLACED'
  }
]
Item Chilli Paneer: {
  originalPrice: 149,
  price: 69,
  originalUnitPrice: 149,
  unitPrice: 69,
  quantity: 2,
  calculatedOriginal: 298,
  calculatedPrice: 138
}
Item savings calculation (matching cart): {
  itemName: 'Chilli Paneer',
  originalPrice: 149,
  price: 69,
  originalUnitPrice: 149,
  unitPrice: 69,
  quantity: 2,
  calculatedOriginal: 298
}
Item Veg Biryani: {
  originalPrice: 119,
  price: 59,
  originalUnitPrice: 119,
  unitPrice: 59,
  quantity: 2,
  calculatedOriginal: 238,
  calculatedPrice: 118
}
Item savings calculation (matching cart): {
  itemName: 'Veg Biryani',
  originalPrice: 119,
  price: 59,
  originalUnitPrice: 119,
  unitPrice: 59,
  quantity: 2,
  calculatedOriginal: 238
}
Savings calculation (matching cart): {
  orderNumber: 'AST-20250930-180944-2719',
  itemsTotalOriginal: 536,
  itemsTotal: 256,
  itemSavings: 280,
  deliveryFee: 25,
  estimatedDeliveryFee: 50,
  deliverySavings: 25,
  packagingSavings: 10,
  totalSavings: 280,
  breakdown: {
    itemSavings: 280,
    deliverySavings: 25,
    packagingSavings: 10,
    total: 315
  }
}
Order calculation debug: {
  orderNumber: 'AST-20250930-180944-2719',
  itemsTotal: 256,
  itemsTotalOriginal: 536,
  savings: 280,
  subtotal: 256,
  taxes: 12.8,
  deliveryFee: 25,
  total: 293.8,
  totalAmount: 293.8,
  orderItemsCount: 2
}
Item Egg Biryani: {
  originalPrice: 180,
  price: 90,
  originalUnitPrice: 180,
  unitPrice: 90,
  quantity: 5,
  calculatedOriginal: 900,
  calculatedPrice: 450
}
Item savings calculation (matching cart): {
  itemName: 'Egg Biryani',
  originalPrice: 180,
  price: 90,
  originalUnitPrice: 180,
  unitPrice: 90,
  quantity: 5,
  calculatedOriginal: 900
}
Savings calculation (matching cart): {
  orderNumber: 'AST-20250930-090024-1915',
  itemsTotalOriginal: 900,
  itemsTotal: 450,
  itemSavings: 450,
  deliveryFee: 25,
  estimatedDeliveryFee: 50,
  deliverySavings: 25,
  packagingSavings: 10,
  totalSavings: 450,
  breakdown: {
    itemSavings: 450,
    deliverySavings: 25,
    packagingSavings: 10,
    total: 485
  }
}
Order calculation debug: {
  orderNumber: 'AST-20250930-090024-1915',
  itemsTotal: 450,
  itemsTotalOriginal: 900,
  savings: 450,
  subtotal: 450,
  taxes: 22.5,
  deliveryFee: 25,
  total: 497.5,
  totalAmount: 497.5,
  orderItemsCount: 1
}
Item Chilli Paneer: {
  originalPrice: 149,
  price: 69,
  originalUnitPrice: 149,
  unitPrice: 69,
  quantity: 7,
  calculatedOriginal: 1043,
  calculatedPrice: 483
}
Item savings calculation (matching cart): {
  itemName: 'Chilli Paneer',
  originalPrice: 149,
  price: 69,
  originalUnitPrice: 149,
  unitPrice: 69,
  quantity: 7,
  calculatedOriginal: 1043
}
Savings calculation (matching cart): {
  orderNumber: 'AST-20250930-085539-1492',
  itemsTotalOriginal: 1043,
  itemsTotal: 483,
  itemSavings: 560,
  deliveryFee: 25,
  estimatedDeliveryFee: 50,
  deliverySavings: 25,
  packagingSavings: 10,
  totalSavings: 560,
  breakdown: {
    itemSavings: 560,
    deliverySavings: 25,
    packagingSavings: 10,
    total: 595
  }
}
Order calculation debug: {
  orderNumber: 'AST-20250930-085539-1492',
  itemsTotal: 483,
  itemsTotalOriginal: 1043,
  savings: 560,
  subtotal: 483,
  taxes: 24.15,
  deliveryFee: 25,
  total: 532.15,
  totalAmount: 532.15,
  orderItemsCount: 1
}
Item Veg Biryani: {
  originalPrice: 119,
  price: 59,
  originalUnitPrice: 119,
  unitPrice: 59,
  quantity: 3,
  calculatedOriginal: 357,
  calculatedPrice: 177
}
Item savings calculation (matching cart): {
  itemName: 'Veg Biryani',
  originalPrice: 119,
  price: 59,
  originalUnitPrice: 119,
  unitPrice: 59,
  quantity: 3,
  calculatedOriginal: 357
}
Item BBQ Chicken Pizza: {
  originalPrice: 199,
  price: 99,
  originalUnitPrice: 199,
  unitPrice: 99,
  quantity: 3,
  calculatedOriginal: 597,
  calculatedPrice: 297
}
Item savings calculation (matching cart): {
  itemName: 'BBQ Chicken Pizza',
  originalPrice: 199,
  price: 99,
  originalUnitPrice: 199,
  unitPrice: 99,
  quantity: 3,
  calculatedOriginal: 597
}
Item Veggie Burger: {
  originalPrice: 99,
  price: 38.98,
  originalUnitPrice: 99,
  unitPrice: 38.98,
  quantity: 3,
  calculatedOriginal: 297,
  calculatedPrice: 116.94
}
Item savings calculation (matching cart): {
  itemName: 'Veggie Burger',
  originalPrice: 99,
  price: 38.98,
  originalUnitPrice: 99,
  unitPrice: 38.98,
  quantity: 3,
  calculatedOriginal: 297
}
Item Chilli Paneer: {
  originalPrice: 149,
  price: 69,
  originalUnitPrice: 149,
  unitPrice: 69,
  quantity: 3,
  calculatedOriginal: 447,
  calculatedPrice: 207
}
Item savings calculation (matching cart): {
  itemName: 'Chilli Paneer',
  originalPrice: 149,
  price: 69,
  originalUnitPrice: 149,
  unitPrice: 69,
  quantity: 3,
  calculatedOriginal: 447
}
Savings calculation (matching cart): {
  orderNumber: 'AST-20250930-110639-4022',
  itemsTotalOriginal: 1698,
  itemsTotal: 797.94,
  itemSavings: 900,
  deliveryFee: 25,
  estimatedDeliveryFee: 50,
  deliverySavings: 25,
  packagingSavings: 10,
  totalSavings: 900,
  breakdown: {
    itemSavings: 900,
    deliverySavings: 25,
    packagingSavings: 10,
    total: 935
  }
}
Order calculation debug: {
  orderNumber: 'AST-20250930-110639-4022',
  itemsTotal: 797.94,
  itemsTotalOriginal: 1698,
  savings: 900,
  subtotal: 797.94,
  taxes: 39.89700000000001,
  deliveryFee: 25,
  total: 862.8370000000001,
  totalAmount: 862.8370000000001,
  orderItemsCount: 4
}
 GET /api/orders?limit=4&paymentStatus=COMPLETED 200 in 2281ms




When i searched for a location and selected ---
prisma:query SELECT "public"."menu_items"."id", "public"."menu_items"."restaurantId", "public"."menu_items"."name", "public"."menu_items"."description", "public"."menu_items"."price", "public"."menu_items"."originalPrice", "public"."menu_items"."category", "public"."menu_items"."preparationTime", "public"."menu_items"."imageUrl", "public"."menu_items"."dietaryTags", "public"."menu_items"."spiceLevel", "public"."menu_items"."available", "public"."menu_items"."featured", "public"."menu_items"."createdAt", "public"."menu_items"."updatedAt", "public"."menu_items"."stockLeft", "public"."menu_items"."rating", "public"."menu_items"."ratingCount", "public"."menu_items"."hackOfTheDay" FROM "public"."menu_items" WHERE ("public"."menu_items"."restaurantId" = $1 AND "public"."menu_items"."available" = $2) ORDER BY "public"."menu_items"."name" ASC OFFSET $3
 GET /api/menu-items?restaurantId=cmfmb36w4000funhyfw6zjkq8 200 in 386ms
prisma:query SELECT "public"."users"."id", "public"."users"."email", "public"."users"."name", "public"."users"."image", "public"."users"."phone", "public"."users"."role"::text, "public"."users"."googleId", "public"."users"."createdAt", "public"."users"."updatedAt", "public"."users"."password" FROM "public"."users" WHERE "public"."users"."phone" = $1 LIMIT $2 OFFSET $3
prisma:query SELECT "public"."restaurants"."id", "public"."restaurants"."name", "public"."restaurants"."ownerId", "public"."restaurants"."latitude", "public"."restaurants"."longitude", "public"."restaurants"."address", "public"."restaurants"."phone", "public"."restaurants"."email", "public"."restaurants"."imageUrl", "public"."restaurants"."cuisineTypes", "public"."restaurants"."averagePreparationTime", "public"."restaurants"."minimumOrderAmount", "public"."restaurants"."deliveryRadius", "public"."restaurants"."commissionRate", "public"."restaurants"."rating", "public"."restaurants"."totalOrders", "public"."restaurants"."status"::text, "public"."restaurants"."operatingHours", "public"."restaurants"."assignedDeliveryPartners", "public"."restaurants"."createdAt", "public"."restaurants"."updatedAt", "public"."restaurants"."ownerName", "public"."restaurants"."aastaPricePercentage", "public"."restaurants"."restaurantPricePercentage", "public"."restaurants"."locationId", "public"."restaurants"."pickupExperienceCount", "public"."restaurants"."pickupExperienceRating", COALESCE("aggr_selection_0_Order"."_aggr_count_orders", 0) AS "_aggr_count_orders" FROM "public"."restaurants" LEFT JOIN (SELECT "public"."orders"."restaurantId", COUNT(*) AS "_aggr_count_orders" FROM "public"."orders" WHERE "public"."orders"."createdAt" >= $1 GROUP BY "public"."orders"."restaurantId") AS "aggr_selection_0_Order" ON ("public"."restaurants"."id" = "aggr_selection_0_Order"."restaurantId") WHERE "public"."restaurants"."status" IN (CAST($2::text AS "public"."RestaurantStatus"),CAST($3::text AS "public"."RestaurantStatus")) ORDER BY "public"."restaurants"."rating" DESC OFFSET $4
🌐 API REQUEST: {
  method: 'GET',
  url: 'http://localhost:3000/api/menu-items?restaurantId=cmfmb392p002cunhyefxv67gp',
  pathname: '/api/menu-items',
  timestamp: '2025-09-30T14:14:56.663Z',
  userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Vers'
}
prisma:query SELECT "public"."addresses"."id", "public"."addresses"."customerId", "public"."addresses"."type"::text, "public"."addresses"."street", "public"."addresses"."city", "public"."addresses"."state", "public"."addresses"."zipCode", "public"."addresses"."latitude", "public"."addresses"."longitude", "public"."addresses"."landmark", "public"."addresses"."instructions", "public"."addresses"."isDefault", "public"."addresses"."createdAt", "public"."addresses"."updatedAt", "public"."addresses"."contactPhone", "public"."addresses"."houseNumber", "public"."addresses"."locality" FROM "public"."addresses" WHERE "public"."addresses"."id" IN ($1) OFFSET $2
prisma:query SELECT "public"."menu_items"."id", "public"."menu_items"."name", "public"."menu_items"."price", "public"."menu_items"."imageUrl", "public"."menu_items"."dietaryTags" FROM "public"."menu_items" WHERE ("public"."menu_items"."restaurantId" = $1 AND "public"."menu_items"."available" = $2) ORDER BY "public"."menu_items"."featured" DESC, "public"."menu_items"."createdAt" DESC LIMIT $3 OFFSET $4
prisma:query SELECT "public"."menu_items"."id", "public"."menu_items"."name", "public"."menu_items"."price", "public"."menu_items"."imageUrl", "public"."menu_items"."dietaryTags" FROM "public"."menu_items" WHERE ("public"."menu_items"."restaurantId" = $1 AND "public"."menu_items"."available" = $2) ORDER BY "public"."menu_items"."featured" DESC, "public"."menu_items"."createdAt" DESC LIMIT $3 OFFSET $4
prisma:query SELECT "public"."menu_items"."id", "public"."menu_items"."name", "public"."menu_items"."price", "public"."menu_items"."imageUrl", "public"."menu_items"."dietaryTags" FROM "public"."menu_items" WHERE ("public"."menu_items"."restaurantId" = $1 AND "public"."menu_items"."available" = $2) ORDER BY "public"."menu_items"."featured" DESC, "public"."menu_items"."createdAt" DESC LIMIT $3 OFFSET $4
prisma:query SELECT "public"."customers"."id", "public"."customers"."userId", "public"."customers"."favoriteRestaurants", "public"."customers"."defaultAddressId", "public"."customers"."createdAt", "public"."customers"."updatedAt" FROM "public"."customers" WHERE "public"."customers"."userId" IN ($1) OFFSET $2
prisma:query SELECT "public"."menu_items"."id", "public"."menu_items"."restaurantId", "public"."menu_items"."name", "public"."menu_items"."description", "public"."menu_items"."price", "public"."menu_items"."originalPrice", "public"."menu_items"."category", "public"."menu_items"."preparationTime", "public"."menu_items"."imageUrl", "public"."menu_items"."dietaryTags", "public"."menu_items"."spiceLevel", "public"."menu_items"."available", "public"."menu_items"."featured", "public"."menu_items"."createdAt", "public"."menu_items"."updatedAt", "public"."menu_items"."stockLeft", "public"."menu_items"."rating", "public"."menu_items"."ratingCount", "public"."menu_items"."hackOfTheDay" FROM "public"."menu_items" LEFT JOIN "public"."restaurants" AS "orderby_1" ON ("orderby_1"."id") = ("public"."menu_items"."restaurantId") LEFT JOIN "public"."restaurants" AS "j0" ON ("j0"."id") = ("public"."menu_items"."restaurantId") WHERE ("public"."menu_items"."featured" = $1 AND "public"."menu_items"."available" = $2 AND ("j0"."status" = CAST($3::text AS "public"."RestaurantStatus") AND ("j0"."id" IS NOT NULL))) ORDER BY "orderby_1"."rating" DESC, "public"."menu_items"."createdAt" DESC LIMIT $4 OFFSET $5
prisma:query SELECT "public"."menu_items"."id", "public"."menu_items"."name", "public"."menu_items"."price", "public"."menu_items"."imageUrl", "public"."menu_items"."dietaryTags" FROM "public"."menu_items" WHERE ("public"."menu_items"."restaurantId" = $1 AND "public"."menu_items"."available" = $2) ORDER BY "public"."menu_items"."featured" DESC, "public"."menu_items"."createdAt" DESC LIMIT $3 OFFSET $4
prisma:query SELECT "public"."menu_items"."id", "public"."menu_items"."name", "public"."menu_items"."price", "public"."menu_items"."imageUrl", "public"."menu_items"."dietaryTags" FROM "public"."menu_items" WHERE ("public"."menu_items"."restaurantId" = $1 AND "public"."menu_items"."available" = $2) ORDER BY "public"."menu_items"."featured" DESC, "public"."menu_items"."createdAt" DESC LIMIT $3 OFFSET $4
 GET /api/nearby-restaurants?latitude=12.9889254&longitude=77.71005830000001&radius=5&limit=12 200 in 523ms
prisma:query SELECT "public"."delivery_partners"."id", "public"."delivery_partners"."userId", "public"."delivery_partners"."assignedRestaurants", "public"."delivery_partners"."currentLatitude", "public"."delivery_partners"."currentLongitude", "public"."delivery_partners"."status"::text, "public"."delivery_partners"."todayEarnings", "public"."delivery_partners"."totalEarnings", "public"."delivery_partners"."rating", "public"."delivery_partners"."completedDeliveries", "public"."delivery_partners"."createdAt", "public"."delivery_partners"."updatedAt", "public"."delivery_partners"."telegramPhone", "public"."delivery_partners"."telegramChatId", "public"."delivery_partners"."ratingCount" FROM "public"."delivery_partners" WHERE "public"."delivery_partners"."userId" IN ($1) OFFSET $2
🌐 API REQUEST: {
  method: 'GET',
  url: 'http://localhost:3000/api/menu-items?restaurantId=cmfmb36w4000funhyfw6zjkq8',
  pathname: '/api/menu-items',
  timestamp: '2025-09-30T14:14:56.796Z',
  userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Vers'
}
prisma:query SELECT "public"."menu_items"."id", "public"."menu_items"."restaurantId", "public"."menu_items"."name", "public"."menu_items"."description", "public"."menu_items"."price", "public"."menu_items"."originalPrice", "public"."menu_items"."category", "public"."menu_items"."preparationTime", "public"."menu_items"."imageUrl", "public"."menu_items"."dietaryTags", "public"."menu_items"."spiceLevel", "public"."menu_items"."available", "public"."menu_items"."featured", "public"."menu_items"."createdAt", "public"."menu_items"."updatedAt", "public"."menu_items"."stockLeft", "public"."menu_items"."rating", "public"."menu_items"."ratingCount", "public"."menu_items"."hackOfTheDay" FROM "public"."menu_items" WHERE ("public"."menu_items"."restaurantId" = $1 AND "public"."menu_items"."available" = $2) ORDER BY "public"."menu_items"."name" ASC OFFSET $3
 GET /api/menu-items?restaurantId=cmfmb392p002cunhyefxv67gp 200 in 142ms
prisma:query SELECT "public"."order_items"."id", "public"."order_items"."orderId", "public"."order_items"."menuItemId", "public"."order_items"."quantity", "public"."order_items"."unitPrice", "public"."order_items"."totalPrice", "public"."order_items"."customizations", "public"."order_items"."createdAt", "public"."order_items"."aastaEarningsPerItem", "public"."order_items"."aastaTotalEarnings", "public"."order_items"."originalUnitPrice", "public"."order_items"."restaurantEarningsPerItem", "public"."order_items"."restaurantTotalEarnings", "public"."order_items"."totalOriginalPrice" FROM "public"."order_items" WHERE "public"."order_items"."orderId" IN ($1,$2,$3,$4) OFFSET $5
🌐 API REQUEST: {
  method: 'GET',
  url: 'http://localhost:3000/api/menu-items?restaurantId=cmfmb37j90010unhy47icafsh',
  pathname: '/api/menu-items',
  timestamp: '2025-09-30T14:14:56.832Z',
  userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Vers'
}
prisma:query SELECT "public"."menu_items"."id", "public"."menu_items"."restaurantId", "public"."menu_items"."name", "public"."menu_items"."description", "public"."menu_items"."price", "public"."menu_items"."originalPrice", "public"."menu_items"."category", "public"."menu_items"."preparationTime", "public"."menu_items"."imageUrl", "public"."menu_items"."dietaryTags", "public"."menu_items"."spiceLevel", "public"."menu_items"."available", "public"."menu_items"."featured", "public"."menu_items"."createdAt", "public"."menu_items"."updatedAt", "public"."menu_items"."stockLeft", "public"."menu_items"."rating", "public"."menu_items"."ratingCount", "public"."menu_items"."hackOfTheDay" FROM "public"."menu_items" WHERE ("public"."menu_items"."restaurantId" = $1 AND "public"."menu_items"."available" = $2) ORDER BY "public"."menu_items"."name" ASC OFFSET $3
 GET /api/menu-items?restaurantId=cmfmb36w4000funhyfw6zjkq8 200 in 77ms
🌐 API REQUEST: {
  method: 'GET',
  url: 'http://localhost:3000/api/menu-items?restaurantId=cmfmb392p002cunhyefxv67gp',
  pathname: '/api/menu-items',
  timestamp: '2025-09-30T14:14:56.897Z',
  userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Vers'
}
 GET /api/menu-items?restaurantId=cmfmb37j90010unhy47icafsh 200 in 81ms
 GET /api/featured-dishes?limit=8&lat=12.9889254&lng=77.71005830000001&radius=5 200 in 617ms
prisma:query SELECT "public"."restaurants"."id", "public"."restaurants"."name", "public"."restaurants"."rating", "public"."restaurants"."averagePreparationTime", "public"."restaurants"."latitude", "public"."restaurants"."longitude" FROM "public"."restaurants" WHERE "public"."restaurants"."id" IN ($1,$2,$3) OFFSET $4
prisma:query SELECT "public"."menu_items"."id", "public"."menu_items"."restaurantId", "public"."menu_items"."name", "public"."menu_items"."description", "public"."menu_items"."price", "public"."menu_items"."originalPrice", "public"."menu_items"."category", "public"."menu_items"."preparationTime", "public"."menu_items"."imageUrl", "public"."menu_items"."dietaryTags", "public"."menu_items"."spiceLevel", "public"."menu_items"."available", "public"."menu_items"."featured", "public"."menu_items"."createdAt", "public"."menu_items"."updatedAt", "public"."menu_items"."stockLeft", "public"."menu_items"."rating", "public"."menu_items"."ratingCount", "public"."menu_items"."hackOfTheDay" FROM "public"."menu_items" WHERE ("public"."menu_items"."restaurantId" = $1 AND "public"."menu_items"."available" = $2) ORDER BY "public"."menu_items"."name" ASC OFFSET $3
prisma:query SELECT "public"."menu_items"."id", "public"."menu_items"."name", "public"."menu_items"."description", "public"."menu_items"."imageUrl", "public"."menu_items"."price", "public"."menu_items"."originalPrice" FROM "public"."menu_items" WHERE "public"."menu_items"."id" IN ($1,$2,$3,$4,$5) OFFSET $6
Orders returned from database: [
  {
    orderNumber: 'AST-20250930-180944-2719',
    paymentStatus: 'COMPLETED',
    status: 'PLACED'
  },
  {
    orderNumber: 'AST-20250930-090024-1915',
    paymentStatus: 'COMPLETED',
    status: 'PLACED'
  },
  {
    orderNumber: 'AST-20250930-085539-1492',
    paymentStatus: 'COMPLETED',
    status: 'PLACED'
  },
  {
    orderNumber: 'AST-20250930-110639-4022',
    paymentStatus: 'COMPLETED',
    status: 'PLACED'
  }
]
Item Chilli Paneer: {
  originalPrice: 149,
  price: 69,
  originalUnitPrice: 149,
  unitPrice: 69,
  quantity: 2,
  calculatedOriginal: 298,
  calculatedPrice: 138
}
Item savings calculation (matching cart): {
  itemName: 'Chilli Paneer',
  originalPrice: 149,
  price: 69,
  originalUnitPrice: 149,
  unitPrice: 69,
  quantity: 2,
  calculatedOriginal: 298
}
Item Veg Biryani: {
  originalPrice: 119,
  price: 59,
  originalUnitPrice: 119,
  unitPrice: 59,
  quantity: 2,
  calculatedOriginal: 238,
  calculatedPrice: 118
}
Item savings calculation (matching cart): {
  itemName: 'Veg Biryani',
  originalPrice: 119,
  price: 59,
  originalUnitPrice: 119,
  unitPrice: 59,
  quantity: 2,
  calculatedOriginal: 238
}
Savings calculation (matching cart): {
  orderNumber: 'AST-20250930-180944-2719',
  itemsTotalOriginal: 536,
  itemsTotal: 256,
  itemSavings: 280,
  deliveryFee: 25,
  estimatedDeliveryFee: 50,
  deliverySavings: 25,
  packagingSavings: 10,
  totalSavings: 280,
  breakdown: {
    itemSavings: 280,
    deliverySavings: 25,
    packagingSavings: 10,
    total: 315
  }
}
Order calculation debug: {
  orderNumber: 'AST-20250930-180944-2719',
  itemsTotal: 256,
  itemsTotalOriginal: 536,
  savings: 280,
  subtotal: 256,
  taxes: 12.8,
  deliveryFee: 25,
  total: 293.8,
  totalAmount: 293.8,
  orderItemsCount: 2
}
Item Egg Biryani: {
  originalPrice: 180,
  price: 90,
  originalUnitPrice: 180,
  unitPrice: 90,
  quantity: 5,
  calculatedOriginal: 900,
  calculatedPrice: 450
}
Item savings calculation (matching cart): {
  itemName: 'Egg Biryani',
  originalPrice: 180,
  price: 90,
  originalUnitPrice: 180,
  unitPrice: 90,
  quantity: 5,
  calculatedOriginal: 900
}
Savings calculation (matching cart): {
  orderNumber: 'AST-20250930-090024-1915',
  itemsTotalOriginal: 900,
  itemsTotal: 450,
  itemSavings: 450,
  deliveryFee: 25,
  estimatedDeliveryFee: 50,
  deliverySavings: 25,
  packagingSavings: 10,
  totalSavings: 450,
  breakdown: {
    itemSavings: 450,
    deliverySavings: 25,
    packagingSavings: 10,
    total: 485
  }
}
Order calculation debug: {
  orderNumber: 'AST-20250930-090024-1915',
  itemsTotal: 450,
  itemsTotalOriginal: 900,
  savings: 450,
  subtotal: 450,
  taxes: 22.5,
  deliveryFee: 25,
  total: 497.5,
  totalAmount: 497.5,
  orderItemsCount: 1
}
Item Chilli Paneer: {
  originalPrice: 149,
  price: 69,
  originalUnitPrice: 149,
  unitPrice: 69,
  quantity: 7,
  calculatedOriginal: 1043,
  calculatedPrice: 483
}
Item savings calculation (matching cart): {
  itemName: 'Chilli Paneer',
  originalPrice: 149,
  price: 69,
  originalUnitPrice: 149,
  unitPrice: 69,
  quantity: 7,
  calculatedOriginal: 1043
}
Savings calculation (matching cart): {
  orderNumber: 'AST-20250930-085539-1492',
  itemsTotalOriginal: 1043,
  itemsTotal: 483,
  itemSavings: 560,
  deliveryFee: 25,
  estimatedDeliveryFee: 50,
  deliverySavings: 25,
  packagingSavings: 10,
  totalSavings: 560,
  breakdown: {
    itemSavings: 560,
    deliverySavings: 25,
    packagingSavings: 10,
    total: 595
  }
}
Order calculation debug: {
  orderNumber: 'AST-20250930-085539-1492',
  itemsTotal: 483,
  itemsTotalOriginal: 1043,
  savings: 560,
  subtotal: 483,
  taxes: 24.15,
  deliveryFee: 25,
  total: 532.15,
  totalAmount: 532.15,
  orderItemsCount: 1
}
Item Veg Biryani: {
  originalPrice: 119,
  price: 59,
  originalUnitPrice: 119,
  unitPrice: 59,
  quantity: 3,
  calculatedOriginal: 357,
  calculatedPrice: 177
}
Item savings calculation (matching cart): {
  itemName: 'Veg Biryani',
  originalPrice: 119,
  price: 59,
  originalUnitPrice: 119,
  unitPrice: 59,
  quantity: 3,
  calculatedOriginal: 357
}
Item BBQ Chicken Pizza: {
  originalPrice: 199,
  price: 99,
  originalUnitPrice: 199,
  unitPrice: 99,
  quantity: 3,
  calculatedOriginal: 597,
  calculatedPrice: 297
}
Item savings calculation (matching cart): {
  itemName: 'BBQ Chicken Pizza',
  originalPrice: 199,
  price: 99,
  originalUnitPrice: 199,
  unitPrice: 99,
  quantity: 3,
  calculatedOriginal: 597
}
Item Veggie Burger: {
  originalPrice: 99,
  price: 38.98,
  originalUnitPrice: 99,
  unitPrice: 38.98,
  quantity: 3,
  calculatedOriginal: 297,
  calculatedPrice: 116.94
}
Item savings calculation (matching cart): {
  itemName: 'Veggie Burger',
  originalPrice: 99,
  price: 38.98,
  originalUnitPrice: 99,
  unitPrice: 38.98,
  quantity: 3,
  calculatedOriginal: 297
}
Item Chilli Paneer: {
  originalPrice: 149,
  price: 69,
  originalUnitPrice: 149,
  unitPrice: 69,
  quantity: 3,
  calculatedOriginal: 447,
  calculatedPrice: 207
}
Item savings calculation (matching cart): {
  itemName: 'Chilli Paneer',
  originalPrice: 149,
  price: 69,
  originalUnitPrice: 149,
  unitPrice: 69,
  quantity: 3,
  calculatedOriginal: 447
}
Savings calculation (matching cart): {
  orderNumber: 'AST-20250930-110639-4022',
  itemsTotalOriginal: 1698,
  itemsTotal: 797.94,
  itemSavings: 900,
  deliveryFee: 25,
  estimatedDeliveryFee: 50,
  deliverySavings: 25,
  packagingSavings: 10,
  totalSavings: 900,
  breakdown: {
    itemSavings: 900,
    deliverySavings: 25,
    packagingSavings: 10,
    total: 935
  }
}
Order calculation debug: {
  orderNumber: 'AST-20250930-110639-4022',
  itemsTotal: 797.94,
  itemsTotalOriginal: 1698,
  savings: 900,
  subtotal: 797.94,
  taxes: 39.89700000000001,
  deliveryFee: 25,
  total: 862.8370000000001,
  totalAmount: 862.8370000000001,
  orderItemsCount: 4
}
 GET /api/orders?limit=4&paymentStatus=COMPLETED 200 in 1143ms
🌐 API REQUEST: {
  method: 'GET',
  url: 'http://localhost:3000/api/menu-items?restaurantId=cmfmb36ss000cunhy1wtpejbl',
  pathname: '/api/menu-items',
  timestamp: '2025-09-30T14:14:57.066Z',
  userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Vers'
}
prisma:query SELECT "public"."menu_items"."id", "public"."menu_items"."restaurantId", "public"."menu_items"."name", "public"."menu_items"."description", "public"."menu_items"."price", "public"."menu_items"."originalPrice", "public"."menu_items"."category", "public"."menu_items"."preparationTime", "public"."menu_items"."imageUrl", "public"."menu_items"."dietaryTags", "public"."menu_items"."spiceLevel", "public"."menu_items"."available", "public"."menu_items"."featured", "public"."menu_items"."createdAt", "public"."menu_items"."updatedAt", "public"."menu_items"."stockLeft", "public"."menu_items"."rating", "public"."menu_items"."ratingCount", "public"."menu_items"."hackOfTheDay" FROM "public"."menu_items" WHERE ("public"."menu_items"."restaurantId" = $1 AND "public"."menu_items"."available" = $2) ORDER BY "public"."menu_items"."name" ASC OFFSET $3
 GET /api/menu-items?restaurantId=cmfmb36ss000cunhy1wtpejbl 200 in 139ms
🌐 API REQUEST: {
  method: 'GET',
  url: 'http://localhost:3000/api/menu-items?restaurantId=cmfmb38ze0029unhy29jb4oqg',
  pathname: '/api/menu-items',
  timestamp: '2025-09-30T14:14:57.232Z',
  userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Vers'
}
prisma:query SELECT "public"."restaurants"."id", "public"."restaurants"."name", "public"."restaurants"."ownerId", "public"."restaurants"."latitude", "public"."restaurants"."longitude", "public"."restaurants"."address", "public"."restaurants"."phone", "public"."restaurants"."email", "public"."restaurants"."imageUrl", "public"."restaurants"."cuisineTypes", "public"."restaurants"."averagePreparationTime", "public"."restaurants"."minimumOrderAmount", "public"."restaurants"."deliveryRadius", "public"."restaurants"."commissionRate", "public"."restaurants"."rating", "public"."restaurants"."totalOrders", "public"."restaurants"."status"::text, "public"."restaurants"."operatingHours", "public"."restaurants"."assignedDeliveryPartners", "public"."restaurants"."createdAt", "public"."restaurants"."updatedAt", "public"."restaurants"."ownerName", "public"."restaurants"."aastaPricePercentage", "public"."restaurants"."restaurantPricePercentage", "public"."restaurants"."locationId", "public"."restaurants"."pickupExperienceCount", "public"."restaurants"."pickupExperienceRating", COALESCE("aggr_selection_0_Order"."_aggr_count_orders", 0) AS "_aggr_count_orders" FROM "public"."restaurants" LEFT JOIN (SELECT "public"."orders"."restaurantId", COUNT(*) AS "_aggr_count_orders" FROM "public"."orders" WHERE "public"."orders"."createdAt" >= $1 GROUP BY "public"."orders"."restaurantId") AS "aggr_selection_0_Order" ON ("public"."restaurants"."id" = "aggr_selection_0_Order"."restaurantId") WHERE "public"."restaurants"."status" IN (CAST($2::text AS "public"."RestaurantStatus"),CAST($3::text AS "public"."RestaurantStatus")) ORDER BY "public"."restaurants"."rating" DESC OFFSET $4
prisma:query SELECT "public"."menu_items"."id", "public"."menu_items"."name", "public"."menu_items"."price", "public"."menu_items"."imageUrl", "public"."menu_items"."dietaryTags" FROM "public"."menu_items" WHERE ("public"."menu_items"."restaurantId" = $1 AND "public"."menu_items"."available" = $2) ORDER BY "public"."menu_items"."featured" DESC, "public"."menu_items"."createdAt" DESC LIMIT $3 OFFSET $4
prisma:query SELECT "public"."menu_items"."id", "public"."menu_items"."name", "public"."menu_items"."price", "public"."menu_items"."imageUrl", "public"."menu_items"."dietaryTags" FROM "public"."menu_items" WHERE ("public"."menu_items"."restaurantId" = $1 AND "public"."menu_items"."available" = $2) ORDER BY "public"."menu_items"."featured" DESC, "public"."menu_items"."createdAt" DESC LIMIT $3 OFFSET $4
prisma:query SELECT "public"."menu_items"."id", "public"."menu_items"."name", "public"."menu_items"."price", "public"."menu_items"."imageUrl", "public"."menu_items"."dietaryTags" FROM "public"."menu_items" WHERE ("public"."menu_items"."restaurantId" = $1 AND "public"."menu_items"."available" = $2) ORDER BY "public"."menu_items"."featured" DESC, "public"."menu_items"."createdAt" DESC LIMIT $3 OFFSET $4
prisma:query SELECT "public"."menu_items"."id", "public"."menu_items"."name", "public"."menu_items"."price", "public"."menu_items"."imageUrl", "public"."menu_items"."dietaryTags" FROM "public"."menu_items" WHERE ("public"."menu_items"."restaurantId" = $1 AND "public"."menu_items"."available" = $2) ORDER BY "public"."menu_items"."featured" DESC, "public"."menu_items"."createdAt" DESC LIMIT $3 OFFSET $4
prisma:query SELECT "public"."menu_items"."id", "public"."menu_items"."name", "public"."menu_items"."price", "public"."menu_items"."imageUrl", "public"."menu_items"."dietaryTags" FROM "public"."menu_items" WHERE ("public"."menu_items"."restaurantId" = $1 AND "public"."menu_items"."available" = $2) ORDER BY "public"."menu_items"."featured" DESC, "public"."menu_items"."createdAt" DESC LIMIT $3 OFFSET $4
prisma:query SELECT "public"."menu_items"."id", "public"."menu_items"."name", "public"."menu_items"."price", "public"."menu_items"."imageUrl", "public"."menu_items"."dietaryTags" FROM "public"."menu_items" WHERE ("public"."menu_items"."restaurantId" = $1 AND "public"."menu_items"."available" = $2) ORDER BY "public"."menu_items"."featured" DESC, "public"."menu_items"."createdAt" DESC LIMIT $3 OFFSET $4
 GET /api/nearby-restaurants?latitude=12.989536&longitude=77.7281015&radius=5&limit=12 200 in 807ms
prisma:query SELECT "public"."menu_items"."id", "public"."menu_items"."restaurantId", "public"."menu_items"."name", "public"."menu_items"."description", "public"."menu_items"."price", "public"."menu_items"."originalPrice", "public"."menu_items"."category", "public"."menu_items"."preparationTime", "public"."menu_items"."imageUrl", "public"."menu_items"."dietaryTags", "public"."menu_items"."spiceLevel", "public"."menu_items"."available", "public"."menu_items"."featured", "public"."menu_items"."createdAt", "public"."menu_items"."updatedAt", "public"."menu_items"."stockLeft", "public"."menu_items"."rating", "public"."menu_items"."ratingCount", "public"."menu_items"."hackOfTheDay" FROM "public"."menu_items" WHERE ("public"."menu_items"."restaurantId" = $1 AND "public"."menu_items"."available" = $2) ORDER BY "public"."menu_items"."name" ASC OFFSET $3
 GET /api/menu-items?restaurantId=cmfmb38ze0029unhy29jb4oqg 200 in 144ms
🌐 API REQUEST: {
  method: 'GET',
  url: 'http://localhost:3000/api/menu-items?restaurantId=cmfmb36w4000funhyfw6zjkq8',
  pathname: '/api/menu-items',
  timestamp: '2025-09-30T14:14:57.387Z',
  userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Vers'
}
prisma:query SELECT "public"."menu_items"."id", "public"."menu_items"."restaurantId", "public"."menu_items"."name", "public"."menu_items"."description", "public"."menu_items"."price", "public"."menu_items"."originalPrice", "public"."menu_items"."category", "public"."menu_items"."preparationTime", "public"."menu_items"."imageUrl", "public"."menu_items"."dietaryTags", "public"."menu_items"."spiceLevel", "public"."menu_items"."available", "public"."menu_items"."featured", "public"."menu_items"."createdAt", "public"."menu_items"."updatedAt", "public"."menu_items"."stockLeft", "public"."menu_items"."rating", "public"."menu_items"."ratingCount", "public"."menu_items"."hackOfTheDay" FROM "public"."menu_items" WHERE ("public"."menu_items"."restaurantId" = $1 AND "public"."menu_items"."available" = $2) ORDER BY "public"."menu_items"."name" ASC OFFSET $3
 GET /api/menu-items?restaurantId=cmfmb36w4000funhyfw6zjkq8 200 in 74ms
🌐 API REQUEST: {
  method: 'GET',
  url: 'http://localhost:3000/api/menu-items?restaurantId=cmfmb37j90010unhy47icafsh',
  pathname: '/api/menu-items',
  timestamp: '2025-09-30T14:14:57.485Z',
  userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Vers'
}
prisma:query SELECT "public"."menu_items"."id", "public"."menu_items"."restaurantId", "public"."menu_items"."name", "public"."menu_items"."description", "public"."menu_items"."price", "public"."menu_items"."originalPrice", "public"."menu_items"."category", "public"."menu_items"."preparationTime", "public"."menu_items"."imageUrl", "public"."menu_items"."dietaryTags", "public"."menu_items"."spiceLevel", "public"."menu_items"."available", "public"."menu_items"."featured", "public"."menu_items"."createdAt", "public"."menu_items"."updatedAt", "public"."menu_items"."stockLeft", "public"."menu_items"."rating", "public"."menu_items"."ratingCount", "public"."menu_items"."hackOfTheDay" FROM "public"."menu_items" WHERE ("public"."menu_items"."restaurantId" = $1 AND "public"."menu_items"."available" = $2) ORDER BY "public"."menu_items"."name" ASC OFFSET $3
 GET /api/menu-items?restaurantId=cmfmb37j90010unhy47icafsh 200 in 82ms
🌐 API REQUEST: {
  method: 'GET',
  url: 'http://localhost:3000/api/menu-items?restaurantId=cmfmb39s6002uunhyd6sblhgv',
  pathname: '/api/menu-items',
  timestamp: '2025-09-30T14:14:57.591Z',
  userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Vers'
}
prisma:query SELECT "public"."menu_items"."id", "public"."menu_items"."restaurantId", "public"."menu_items"."name", "public"."menu_items"."description", "public"."menu_items"."price", "public"."menu_items"."originalPrice", "public"."menu_items"."category", "public"."menu_items"."preparationTime", "public"."menu_items"."imageUrl", "public"."menu_items"."dietaryTags", "public"."menu_items"."spiceLevel", "public"."menu_items"."available", "public"."menu_items"."featured", "public"."menu_items"."createdAt", "public"."menu_items"."updatedAt", "public"."menu_items"."stockLeft", "public"."menu_items"."rating", "public"."menu_items"."ratingCount", "public"."menu_items"."hackOfTheDay" FROM "public"."menu_items" WHERE ("public"."menu_items"."restaurantId" = $1 AND "public"."menu_items"."available" = $2) ORDER BY "public"."menu_items"."name" ASC OFFSET $3
 GET /api/menu-items?restaurantId=cmfmb392p002cunhyefxv67gp 200 in 699ms
🌐 API REQUEST: {
  method: 'GET',
  url: 'http://localhost:3000/api/menu-items?restaurantId=cmfmb37j90010unhy47icafsh',
  pathname: '/api/menu-items',
  timestamp: '2025-09-30T14:14:57.616Z',
  userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Vers'
}
prisma:query SELECT "public"."menu_items"."id", "public"."menu_items"."restaurantId", "public"."menu_items"."name", "public"."menu_items"."description", "public"."menu_items"."price", "public"."menu_items"."originalPrice", "public"."menu_items"."category", "public"."menu_items"."preparationTime", "public"."menu_items"."imageUrl", "public"."menu_items"."dietaryTags", "public"."menu_items"."spiceLevel", "public"."menu_items"."available", "public"."menu_items"."featured", "public"."menu_items"."createdAt", "public"."menu_items"."updatedAt", "public"."menu_items"."stockLeft", "public"."menu_items"."rating", "public"."menu_items"."ratingCount", "public"."menu_items"."hackOfTheDay" FROM "public"."menu_items" WHERE ("public"."menu_items"."restaurantId" = $1 AND "public"."menu_items"."available" = $2) ORDER BY "public"."menu_items"."name" ASC OFFSET $3
 GET /api/menu-items?restaurantId=cmfmb39s6002uunhyd6sblhgv 200 in 109ms
prisma:query SELECT "public"."menu_items"."id", "public"."menu_items"."restaurantId", "public"."menu_items"."name", "public"."menu_items"."description", "public"."menu_items"."price", "public"."menu_items"."originalPrice", "public"."menu_items"."category", "public"."menu_items"."preparationTime", "public"."menu_items"."imageUrl", "public"."menu_items"."dietaryTags", "public"."menu_items"."spiceLevel", "public"."menu_items"."available", "public"."menu_items"."featured", "public"."menu_items"."createdAt", "public"."menu_items"."updatedAt", "public"."menu_items"."stockLeft", "public"."menu_items"."rating", "public"."menu_items"."ratingCount", "public"."menu_items"."hackOfTheDay" FROM "public"."menu_items" WHERE ("public"."menu_items"."restaurantId" = $1 AND "public"."menu_items"."available" = $2) ORDER BY "public"."menu_items"."name" ASC OFFSET $3
 GET /api/menu-items?restaurantId=cmfmb37j90010unhy47icafsh 200 in 86ms
🌐 API REQUEST: {
  method: 'GET',
  url: 'http://localhost:3000/api/menu-items?restaurantId=cmfmb3b21003xunhyt0mjcetv',
  pathname: '/api/menu-items',
  timestamp: '2025-09-30T14:14:57.722Z',
  userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Vers'
}
🌐 API REQUEST: {
  method: 'GET',
  url: 'http://localhost:3000/api/menu-items?restaurantId=cmfmb36ss000cunhy1wtpejbl',
  pathname: '/api/menu-items',
  timestamp: '2025-09-30T14:14:57.723Z',
  userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Vers'
}
prisma:query SELECT "public"."menu_items"."id", "public"."menu_items"."restaurantId", "public"."menu_items"."name", "public"."menu_items"."description", "public"."menu_items"."price", "public"."menu_items"."originalPrice", "public"."menu_items"."category", "public"."menu_items"."preparationTime", "public"."menu_items"."imageUrl", "public"."menu_items"."dietaryTags", "public"."menu_items"."spiceLevel", "public"."menu_items"."available", "public"."menu_items"."featured", "public"."menu_items"."createdAt", "public"."menu_items"."updatedAt", "public"."menu_items"."stockLeft", "public"."menu_items"."rating", "public"."menu_items"."ratingCount", "public"."menu_items"."hackOfTheDay" FROM "public"."menu_items" WHERE ("public"."menu_items"."restaurantId" = $1 AND "public"."menu_items"."available" = $2) ORDER BY "public"."menu_items"."name" ASC OFFSET $3
 GET /api/menu-items?restaurantId=cmfmb3b21003xunhyt0mjcetv 200 in 79ms
prisma:query SELECT "public"."menu_items"."id", "public"."menu_items"."restaurantId", "public"."menu_items"."name", "public"."menu_items"."description", "public"."menu_items"."price", "public"."menu_items"."originalPrice", "public"."menu_items"."category", "public"."menu_items"."preparationTime", "public"."menu_items"."imageUrl", "public"."menu_items"."dietaryTags", "public"."menu_items"."spiceLevel", "public"."menu_items"."available", "public"."menu_items"."featured", "public"."menu_items"."createdAt", "public"."menu_items"."updatedAt", "public"."menu_items"."stockLeft", "public"."menu_items"."rating", "public"."menu_items"."ratingCount", "public"."menu_items"."hackOfTheDay" FROM "public"."menu_items" WHERE ("public"."menu_items"."restaurantId" = $1 AND "public"."menu_items"."available" = $2) ORDER BY "public"."menu_items"."name" ASC OFFSET $3
 GET /api/menu-items?restaurantId=cmfmb36ss000cunhy1wtpejbl 200 in 110ms
🌐 API REQUEST: {
  method: 'GET',
  url: 'http://localhost:3000/api/menu-items?restaurantId=cmfmb36ss000cunhy1wtpejbl',
  pathname: '/api/menu-items',
  timestamp: '2025-09-30T14:14:57.852Z',
  userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Vers'
}
🌐 API REQUEST: {
  method: 'GET',
  url: 'http://localhost:3000/api/menu-items?restaurantId=cmfmb38ze0029unhy29jb4oqg',
  pathname: '/api/menu-items',
  timestamp: '2025-09-30T14:14:57.856Z',
  userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Vers'
}
prisma:query SELECT "public"."menu_items"."id", "public"."menu_items"."restaurantId", "public"."menu_items"."name", "public"."menu_items"."description", "public"."menu_items"."price", "public"."menu_items"."originalPrice", "public"."menu_items"."category", "public"."menu_items"."preparationTime", "public"."menu_items"."imageUrl", "public"."menu_items"."dietaryTags", "public"."menu_items"."spiceLevel", "public"."menu_items"."available", "public"."menu_items"."featured", "public"."menu_items"."createdAt", "public"."menu_items"."updatedAt", "public"."menu_items"."stockLeft", "public"."menu_items"."rating", "public"."menu_items"."ratingCount", "public"."menu_items"."hackOfTheDay" FROM "public"."menu_items" WHERE ("public"."menu_items"."restaurantId" = $1 AND "public"."menu_items"."available" = $2) ORDER BY "public"."menu_items"."name" ASC OFFSET $3
 GET /api/menu-items?restaurantId=cmfmb38ze0029unhy29jb4oqg 200 in 86ms
prisma:query SELECT "public"."menu_items"."id", "public"."menu_items"."restaurantId", "public"."menu_items"."name", "public"."menu_items"."description", "public"."menu_items"."price", "public"."menu_items"."originalPrice", "public"."menu_items"."category", "public"."menu_items"."preparationTime", "public"."menu_items"."imageUrl", "public"."menu_items"."dietaryTags", "public"."menu_items"."spiceLevel", "public"."menu_items"."available", "public"."menu_items"."featured", "public"."menu_items"."createdAt", "public"."menu_items"."updatedAt", "public"."menu_items"."stockLeft", "public"."menu_items"."rating", "public"."menu_items"."ratingCount", "public"."menu_items"."hackOfTheDay" FROM "public"."menu_items" WHERE ("public"."menu_items"."restaurantId" = $1 AND "public"."menu_items"."available" = $2) ORDER BY "public"."menu_items"."name" ASC OFFSET $3
 GET /api/menu-items?restaurantId=cmfmb36ss000cunhy1wtpejbl 200 in 101ms
🌐 API REQUEST: {
  method: 'GET',
  url: 'http://localhost:3000/api/menu-items?restaurantId=cmfmb38ze0029unhy29jb4oqg',
  pathname: '/api/menu-items',
  timestamp: '2025-09-30T14:14:58.084Z',
  userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Vers'
}
prisma:query SELECT "public"."menu_items"."id", "public"."menu_items"."restaurantId", "public"."menu_items"."name", "public"."menu_items"."description", "public"."menu_items"."price", "public"."menu_items"."originalPrice", "public"."menu_items"."category", "public"."menu_items"."preparationTime", "public"."menu_items"."imageUrl", "public"."menu_items"."dietaryTags", "public"."menu_items"."spiceLevel", "public"."menu_items"."available", "public"."menu_items"."featured", "public"."menu_items"."createdAt", "public"."menu_items"."updatedAt", "public"."menu_items"."stockLeft", "public"."menu_items"."rating", "public"."menu_items"."ratingCount", "public"."menu_items"."hackOfTheDay" FROM "public"."menu_items" WHERE ("public"."menu_items"."restaurantId" = $1 AND "public"."menu_items"."available" = $2) ORDER BY "public"."menu_items"."name" ASC OFFSET $3
 GET /api/menu-items?restaurantId=cmfmb38ze0029unhy29jb4oqg 200 in 103ms
🌐 API REQUEST: {
  method: 'GET',
  url: 'http://localhost:3000/api/orders?limit=4&paymentStatus=COMPLETED',
  pathname: '/api/orders',
  timestamp: '2025-09-30T14:14:58.209Z',
  userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Vers'
}
Redirect URL: https://neutral-octopus-famous.ngrok-free.app Base URL: https://neutral-octopus-famous.ngrok-free.app
prisma:query SELECT "public"."users"."id", "public"."users"."email", "public"."users"."name", "public"."users"."image", "public"."users"."phone", "public"."users"."role"::text, "public"."users"."googleId", "public"."users"."createdAt", "public"."users"."updatedAt", "public"."users"."password" FROM "public"."users" WHERE "public"."users"."phone" = $1 LIMIT $2 OFFSET $3
prisma:query SELECT "public"."customers"."id", "public"."customers"."userId", "public"."customers"."favoriteRestaurants", "public"."customers"."defaultAddressId", "public"."customers"."createdAt", "public"."customers"."updatedAt" FROM "public"."customers" WHERE "public"."customers"."userId" IN ($1) OFFSET $2
prisma:query SELECT "public"."delivery_partners"."id", "public"."delivery_partners"."userId", "public"."delivery_partners"."assignedRestaurants", "public"."delivery_partners"."currentLatitude", "public"."delivery_partners"."currentLongitude", "public"."delivery_partners"."status"::text, "public"."delivery_partners"."todayEarnings", "public"."delivery_partners"."totalEarnings", "public"."delivery_partners"."rating", "public"."delivery_partners"."completedDeliveries", "public"."delivery_partners"."createdAt", "public"."delivery_partners"."updatedAt", "public"."delivery_partners"."telegramPhone", "public"."delivery_partners"."telegramChatId", "public"."delivery_partners"."ratingCount" FROM "public"."delivery_partners" WHERE "public"."delivery_partners"."userId" IN ($1) OFFSET $2
prisma:query SELECT "public"."customers"."id", "public"."customers"."userId", "public"."customers"."favoriteRestaurants", "public"."customers"."defaultAddressId", "public"."customers"."createdAt", "public"."customers"."updatedAt" FROM "public"."customers" WHERE ("public"."customers"."userId" = $1 AND 1=1) LIMIT $2 OFFSET $3
Payment status filter applied: COMPLETED only
Final where clause for orders query: {
  "customerId": "cmfmbu91e0002unvr86lhm1x5",
  "paymentStatus": "COMPLETED"
}
prisma:query SELECT "public"."orders"."id", "public"."orders"."orderNumber", "public"."orders"."customerId", "public"."orders"."restaurantId", "public"."orders"."deliveryPartnerId", "public"."orders"."deliveryAddressId", "public"."orders"."status"::text, "public"."orders"."subtotal", "public"."orders"."deliveryFee", "public"."orders"."taxes", "public"."orders"."discountAmount", "public"."orders"."totalAmount", "public"."orders"."estimatedPreparationTime", "public"."orders"."estimatedDeliveryTime", "public"."orders"."actualDeliveryTime", "public"."orders"."verificationCode", "public"."orders"."paymentStatus", "public"."orders"."specialInstructions", "public"."orders"."cancelReason", "public"."orders"."createdAt", "public"."orders"."updatedAt", "public"."orders"."deliveryBatchId", "public"."orders"."razorpayOrderId", "public"."orders"."deliveryDistance", "public"."orders"."estimatedDeliveryDuration", "public"."orders"."orderType"::text FROM "public"."orders" WHERE ("public"."orders"."customerId" = $1 AND "public"."orders"."paymentStatus" = $2) ORDER BY "public"."orders"."createdAt" DESC LIMIT $3 OFFSET $4
prisma:query SELECT COUNT(*) AS "_count$_all" FROM (SELECT "public"."orders"."id" FROM "public"."orders" WHERE ("public"."orders"."customerId" = $1 AND "public"."orders"."paymentStatus" = $2) OFFSET $3) AS "sub"
prisma:query SELECT "public"."customers"."id", "public"."customers"."userId", "public"."customers"."favoriteRestaurants", "public"."customers"."defaultAddressId", "public"."customers"."createdAt", "public"."customers"."updatedAt" FROM "public"."customers" WHERE "public"."customers"."id" IN ($1) OFFSET $2
prisma:query SELECT "public"."users"."id", "public"."users"."name", "public"."users"."email", "public"."users"."phone" FROM "public"."users" WHERE "public"."users"."id" IN ($1) OFFSET $2
prisma:query SELECT "public"."restaurants"."id", "public"."restaurants"."name", "public"."restaurants"."phone", "public"."restaurants"."address" FROM "public"."restaurants" WHERE "public"."restaurants"."id" IN ($1,$2) OFFSET $3
prisma:query SELECT "public"."addresses"."id", "public"."addresses"."customerId", "public"."addresses"."type"::text, "public"."addresses"."street", "public"."addresses"."city", "public"."addresses"."state", "public"."addresses"."zipCode", "public"."addresses"."latitude", "public"."addresses"."longitude", "public"."addresses"."landmark", "public"."addresses"."instructions", "public"."addresses"."isDefault", "public"."addresses"."createdAt", "public"."addresses"."updatedAt", "public"."addresses"."contactPhone", "public"."addresses"."houseNumber", "public"."addresses"."locality" FROM "public"."addresses" WHERE "public"."addresses"."id" IN ($1) OFFSET $2
prisma:query SELECT "public"."order_items"."id", "public"."order_items"."orderId", "public"."order_items"."menuItemId", "public"."order_items"."quantity", "public"."order_items"."unitPrice", "public"."order_items"."totalPrice", "public"."order_items"."customizations", "public"."order_items"."createdAt", "public"."order_items"."aastaEarningsPerItem", "public"."order_items"."aastaTotalEarnings", "public"."order_items"."originalUnitPrice", "public"."order_items"."restaurantEarningsPerItem", "public"."order_items"."restaurantTotalEarnings", "public"."order_items"."totalOriginalPrice" FROM "public"."order_items" WHERE "public"."order_items"."orderId" IN ($1,$2,$3,$4) OFFSET $5
prisma:query SELECT "public"."menu_items"."id", "public"."menu_items"."name", "public"."menu_items"."description", "public"."menu_items"."imageUrl", "public"."menu_items"."price", "public"."menu_items"."originalPrice" FROM "public"."menu_items" WHERE "public"."menu_items"."id" IN ($1,$2,$3,$4,$5) OFFSET $6
Orders returned from database: [
  {
    orderNumber: 'AST-20250930-180944-2719',
    paymentStatus: 'COMPLETED',
    status: 'PLACED'
  },
  {
    orderNumber: 'AST-20250930-090024-1915',
    paymentStatus: 'COMPLETED',
    status: 'PLACED'
  },
  {
    orderNumber: 'AST-20250930-085539-1492',
    paymentStatus: 'COMPLETED',
    status: 'PLACED'
  },
  {
    orderNumber: 'AST-20250930-110639-4022',
    paymentStatus: 'COMPLETED',
    status: 'PLACED'
  }
]
Item Chilli Paneer: {
  originalPrice: 149,
  price: 69,
  originalUnitPrice: 149,
  unitPrice: 69,
  quantity: 2,
  calculatedOriginal: 298,
  calculatedPrice: 138
}
Item savings calculation (matching cart): {
  itemName: 'Chilli Paneer',
  originalPrice: 149,
  price: 69,
  originalUnitPrice: 149,
  unitPrice: 69,
  quantity: 2,
  calculatedOriginal: 298
}
Item Veg Biryani: {
  originalPrice: 119,
  price: 59,
  originalUnitPrice: 119,
  unitPrice: 59,
  quantity: 2,
  calculatedOriginal: 238,
  calculatedPrice: 118
}
Item savings calculation (matching cart): {
  itemName: 'Veg Biryani',
  originalPrice: 119,
  price: 59,
  originalUnitPrice: 119,
  unitPrice: 59,
  quantity: 2,
  calculatedOriginal: 238
}
Savings calculation (matching cart): {
  orderNumber: 'AST-20250930-180944-2719',
  itemsTotalOriginal: 536,
  itemsTotal: 256,
  itemSavings: 280,
  deliveryFee: 25,
  estimatedDeliveryFee: 50,
  deliverySavings: 25,
  packagingSavings: 10,
  totalSavings: 280,
  breakdown: {
    itemSavings: 280,
    deliverySavings: 25,
    packagingSavings: 10,
    total: 315
  }
}
Order calculation debug: {
  orderNumber: 'AST-20250930-180944-2719',
  itemsTotal: 256,
  itemsTotalOriginal: 536,
  savings: 280,
  subtotal: 256,
  taxes: 12.8,
  deliveryFee: 25,
  total: 293.8,
  totalAmount: 293.8,
  orderItemsCount: 2
}
Item Egg Biryani: {
  originalPrice: 180,
  price: 90,
  originalUnitPrice: 180,
  unitPrice: 90,
  quantity: 5,
  calculatedOriginal: 900,
  calculatedPrice: 450
}
Item savings calculation (matching cart): {
  itemName: 'Egg Biryani',
  originalPrice: 180,
  price: 90,
  originalUnitPrice: 180,
  unitPrice: 90,
  quantity: 5,
  calculatedOriginal: 900
}
Savings calculation (matching cart): {
  orderNumber: 'AST-20250930-090024-1915',
  itemsTotalOriginal: 900,
  itemsTotal: 450,
  itemSavings: 450,
  deliveryFee: 25,
  estimatedDeliveryFee: 50,
  deliverySavings: 25,
  packagingSavings: 10,
  totalSavings: 450,
  breakdown: {
    itemSavings: 450,
    deliverySavings: 25,
    packagingSavings: 10,
    total: 485
  }
}
Order calculation debug: {
  orderNumber: 'AST-20250930-090024-1915',
  itemsTotal: 450,
  itemsTotalOriginal: 900,
  savings: 450,
  subtotal: 450,
  taxes: 22.5,
  deliveryFee: 25,
  total: 497.5,
  totalAmount: 497.5,
  orderItemsCount: 1
}
Item Chilli Paneer: {
  originalPrice: 149,
  price: 69,
  originalUnitPrice: 149,
  unitPrice: 69,
  quantity: 7,
  calculatedOriginal: 1043,
  calculatedPrice: 483
}
Item savings calculation (matching cart): {
  itemName: 'Chilli Paneer',
  originalPrice: 149,
  price: 69,
  originalUnitPrice: 149,
  unitPrice: 69,
  quantity: 7,
  calculatedOriginal: 1043
}
Savings calculation (matching cart): {
  orderNumber: 'AST-20250930-085539-1492',
  itemsTotalOriginal: 1043,
  itemsTotal: 483,
  itemSavings: 560,
  deliveryFee: 25,
  estimatedDeliveryFee: 50,
  deliverySavings: 25,
  packagingSavings: 10,
  totalSavings: 560,
  breakdown: {
    itemSavings: 560,
    deliverySavings: 25,
    packagingSavings: 10,
    total: 595
  }
}
Order calculation debug: {
  orderNumber: 'AST-20250930-085539-1492',
  itemsTotal: 483,
  itemsTotalOriginal: 1043,
  savings: 560,
  subtotal: 483,
  taxes: 24.15,
  deliveryFee: 25,
  total: 532.15,
  totalAmount: 532.15,
  orderItemsCount: 1
}
Item Veg Biryani: {
  originalPrice: 119,
  price: 59,
  originalUnitPrice: 119,
  unitPrice: 59,
  quantity: 3,
  calculatedOriginal: 357,
  calculatedPrice: 177
}
Item savings calculation (matching cart): {
  itemName: 'Veg Biryani',
  originalPrice: 119,
  price: 59,
  originalUnitPrice: 119,
  unitPrice: 59,
  quantity: 3,
  calculatedOriginal: 357
}
Item BBQ Chicken Pizza: {
  originalPrice: 199,
  price: 99,
  originalUnitPrice: 199,
  unitPrice: 99,
  quantity: 3,
  calculatedOriginal: 597,
  calculatedPrice: 297
}
Item savings calculation (matching cart): {
  itemName: 'BBQ Chicken Pizza',
  originalPrice: 199,
  price: 99,
  originalUnitPrice: 199,
  unitPrice: 99,
  quantity: 3,
  calculatedOriginal: 597
}
Item Veggie Burger: {
  originalPrice: 99,
  price: 38.98,
  originalUnitPrice: 99,
  unitPrice: 38.98,
  quantity: 3,
  calculatedOriginal: 297,
  calculatedPrice: 116.94
}
Item savings calculation (matching cart): {
  itemName: 'Veggie Burger',
  originalPrice: 99,
  price: 38.98,
  originalUnitPrice: 99,
  unitPrice: 38.98,
  quantity: 3,
  calculatedOriginal: 297
}
Item Chilli Paneer: {
  originalPrice: 149,
  price: 69,
  originalUnitPrice: 149,
  unitPrice: 69,
  quantity: 3,
  calculatedOriginal: 447,
  calculatedPrice: 207
}
Item savings calculation (matching cart): {
  itemName: 'Chilli Paneer',
  originalPrice: 149,
  price: 69,
  originalUnitPrice: 149,
  unitPrice: 69,
  quantity: 3,
  calculatedOriginal: 447
}
Savings calculation (matching cart): {
  orderNumber: 'AST-20250930-110639-4022',
  itemsTotalOriginal: 1698,
  itemsTotal: 797.94,
  itemSavings: 900,
  deliveryFee: 25,
  estimatedDeliveryFee: 50,
  deliverySavings: 25,
  packagingSavings: 10,
  totalSavings: 900,
  breakdown: {
    itemSavings: 900,
    deliverySavings: 25,
    packagingSavings: 10,
    total: 935
  }
}
Order calculation debug: {
  orderNumber: 'AST-20250930-110639-4022',
  itemsTotal: 797.94,
  itemsTotalOriginal: 1698,
  savings: 900,
  subtotal: 797.94,
  taxes: 39.89700000000001,
  deliveryFee: 25,
  total: 862.8370000000001,
  totalAmount: 862.8370000000001,
  orderItemsCount: 4
}
 GET /api/orders?limit=4&paymentStatus=COMPLETED 200 in 1285ms




So after the implementation of this "so i will tell you the exact implementation that i want, accordingly tell me what's the best optimization

so when the userr is coming to our main page, either we are detecting the live location of the userr or the location that he have selected , i have attached that what happen when i change the location to live location or searched for a location here in the @ApiCalls.md  

Now based on the user's selected location we have to show him restaurants within 5km of radius, i want this radius in the env variables so that i can change easily later, so based on the userr location we have to show him restaurants within 5km of range, in the restaurants part of the @page.tsx , then we have to mark the closed.json, and close to those restaurants which are inactive in the DB, then similarly in the nearby foods we have to show foods that are not mared as hack of the day food or featured product withing 5km of userr location, this means ofcourse only from those restaurants that are listed below in the restaurants section! then from those restaurants only we have to show the hack of the day product, this again means within 5km of range simply, from those restaurants that we are showing below, then recently order doesn't depend on the userr location, it should be the last 4 items ordered and working fine also, then at top we have popular foods, the food that is marked as featured product, again within 5km of range simply from those restaurants that we are showing below!, and in header we have two main thing, search and veg mode toggle, so search should also show restraurnts, food items from those restaurants only which are listed below i.e within 5m of range, and on veg mode toggle on we just have to filter everything and show only veg items basically the items with dietaryTags as "Veg" and this is applicable to Popular foods, Recently ordered item, Hack of the day, nearby food, restaurants if doesnt have any veg item then we dont have to show that restaurant and if we are showing a restaurant going inside the restaurant page should only list all the veg items only, and search results should also follow this veg mode toggle, in results! and as soon as i toggle off the veg mode we should make the app normal, and make sure that it should be real quick for all the sections -- popular food, recently ordered, hack of the day, nearby foods and restaurants along with search! this is the high level thinking that i need for the displying of products and restaurants " ----

While starting a server and loading the main page am getting this all queries -- 
saiyam@Saiyam-Server:~/Documents/Aasta$ pnpm dev

> aasta@0.1.0 dev /home/saiyam/Documents/Aasta
> next dev

   ▲ Next.js 15.4.4
   - Local:        http://localhost:3000
   - Network:      http://10.108.171.248:3000
   - Environments: .env

 ✓ Starting...
 ✓ Ready in 7.6s
 ○ Compiling /middleware ...
 ✓ Compiled /middleware in 722ms (210 modules)
 ○ Compiling / ...
 ✓ Compiled / in 5.5s (1072 modules)
 GET / 200 in 6162ms
🌐 API REQUEST: {
  method: 'GET',
  url: 'http://localhost:3000/api/user/address',
  pathname: '/api/user/address',
  timestamp: '2025-09-30T15:39:30.193Z',
  userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Vers'
}
 ○ Compiling /api/user/address ...
 ✓ Compiled /api/user/address in 1341ms (620 modules)
 ✓ Compiled in 1465ms (469 modules)
 GET /favicon.ico 200 in 4120ms
[next-auth][warn][DEBUG_ENABLED] 
https://next-auth.js.org/warnings#debug_enabled
Redirect URL: https://neutral-octopus-famous.ngrok-free.app Base URL: https://neutral-octopus-famous.ngrok-free.app
 GET / 200 in 201ms
 GET /favicon.ico 200 in 29ms
Redirect URL: https://neutral-octopus-famous.ngrok-free.app Base URL: https://neutral-octopus-famous.ngrok-free.app
prisma:query SELECT "public"."users"."id", "public"."users"."email", "public"."users"."name", "public"."users"."image", "public"."users"."phone", "public"."users"."role"::text, "public"."users"."googleId", "public"."users"."createdAt", "public"."users"."updatedAt", "public"."users"."password" FROM "public"."users" WHERE "public"."users"."phone" = $1 LIMIT $2 OFFSET $3
prisma:query SELECT "public"."customers"."id", "public"."customers"."userId", "public"."customers"."favoriteRestaurants", "public"."customers"."defaultAddressId", "public"."customers"."createdAt", "public"."customers"."updatedAt" FROM "public"."customers" WHERE "public"."customers"."userId" IN ($1) OFFSET $2
prisma:query SELECT "public"."delivery_partners"."id", "public"."delivery_partners"."userId", "public"."delivery_partners"."assignedRestaurants", "public"."delivery_partners"."currentLatitude", "public"."delivery_partners"."currentLongitude", "public"."delivery_partners"."status"::text, "public"."delivery_partners"."todayEarnings", "public"."delivery_partners"."totalEarnings", "public"."delivery_partners"."rating", "public"."delivery_partners"."completedDeliveries", "public"."delivery_partners"."createdAt", "public"."delivery_partners"."updatedAt", "public"."delivery_partners"."telegramPhone", "public"."delivery_partners"."telegramChatId", "public"."delivery_partners"."ratingCount" FROM "public"."delivery_partners" WHERE "public"."delivery_partners"."userId" IN ($1) OFFSET $2
prisma:query SELECT "public"."customers"."id", "public"."customers"."userId", "public"."customers"."favoriteRestaurants", "public"."customers"."defaultAddressId", "public"."customers"."createdAt", "public"."customers"."updatedAt" FROM "public"."customers" WHERE ("public"."customers"."userId" = $1 AND 1=1) LIMIT $2 OFFSET $3
prisma:query SELECT "public"."users"."id", "public"."users"."email", "public"."users"."name", "public"."users"."image", "public"."users"."phone", "public"."users"."role"::text, "public"."users"."googleId", "public"."users"."createdAt", "public"."users"."updatedAt", "public"."users"."password" FROM "public"."users" WHERE "public"."users"."phone" = $1 LIMIT $2 OFFSET $3
prisma:query SELECT "public"."customers"."id", "public"."customers"."userId", "public"."customers"."favoriteRestaurants", "public"."customers"."defaultAddressId", "public"."customers"."createdAt", "public"."customers"."updatedAt" FROM "public"."customers" WHERE "public"."customers"."userId" IN ($1) OFFSET $2
prisma:query SELECT "public"."delivery_partners"."id", "public"."delivery_partners"."userId", "public"."delivery_partners"."assignedRestaurants", "public"."delivery_partners"."currentLatitude", "public"."delivery_partners"."currentLongitude", "public"."delivery_partners"."status"::text, "public"."delivery_partners"."todayEarnings", "public"."delivery_partners"."totalEarnings", "public"."delivery_partners"."rating", "public"."delivery_partners"."completedDeliveries", "public"."delivery_partners"."createdAt", "public"."delivery_partners"."updatedAt", "public"."delivery_partners"."telegramPhone", "public"."delivery_partners"."telegramChatId", "public"."delivery_partners"."ratingCount" FROM "public"."delivery_partners" WHERE "public"."delivery_partners"."userId" IN ($1) OFFSET $2
 GET /api/auth/session 200 in 5948ms
prisma:query SELECT "public"."addresses"."id", "public"."addresses"."customerId", "public"."addresses"."type"::text, "public"."addresses"."street", "public"."addresses"."city", "public"."addresses"."state", "public"."addresses"."zipCode", "public"."addresses"."latitude", "public"."addresses"."longitude", "public"."addresses"."landmark", "public"."addresses"."instructions", "public"."addresses"."isDefault", "public"."addresses"."createdAt", "public"."addresses"."updatedAt", "public"."addresses"."contactPhone", "public"."addresses"."houseNumber", "public"."addresses"."locality" FROM "public"."addresses" WHERE "public"."addresses"."customerId" = $1 ORDER BY "public"."addresses"."isDefault" DESC OFFSET $2
 GET /api/user/address 200 in 5907ms
🌐 API REQUEST: {
  method: 'GET',
  url: 'http://localhost:3000/api/nearby-restaurants?latitude=12.9842762&longitude=77.7327008&radius=5',
  pathname: '/api/nearby-restaurants',
  timestamp: '2025-09-30T15:39:36.121Z',
  userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Vers'
}
🌐 API REQUEST: {
  method: 'GET',
  url: 'http://localhost:3000/api/nearby-restaurants?latitude=12.9842762&longitude=77.7327008&radius=5&limit=12',
  pathname: '/api/nearby-restaurants',
  timestamp: '2025-09-30T15:39:36.205Z',
  userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Vers'
}
🌐 API REQUEST: {
  method: 'GET',
  url: 'http://localhost:3000/api/orders?limit=4&paymentStatus=COMPLETED',
  pathname: '/api/orders',
  timestamp: '2025-09-30T15:39:36.208Z',
  userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Vers'
}
🌐 API REQUEST: {
  method: 'GET',
  url: 'http://localhost:3000/api/user/address',
  pathname: '/api/user/address',
  timestamp: '2025-09-30T15:39:36.210Z',
  userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Vers'
}
 ○ Compiling /api/orders ...
 ✓ Compiled /api/orders in 1987ms (1376 modules)
[next-auth][warn][DEBUG_ENABLED] 
https://next-auth.js.org/warnings#debug_enabled
Redirect URL: https://neutral-octopus-famous.ngrok-free.app Base URL: https://neutral-octopus-famous.ngrok-free.app
Redirect URL: https://neutral-octopus-famous.ngrok-free.app Base URL: https://neutral-octopus-famous.ngrok-free.app
Redirect URL: https://neutral-octopus-famous.ngrok-free.app Base URL: https://neutral-octopus-famous.ngrok-free.app
Redirect URL: https://neutral-octopus-famous.ngrok-free.app Base URL: https://neutral-octopus-famous.ngrok-free.app
prisma:query SELECT "public"."users"."id", "public"."users"."email", "public"."users"."name", "public"."users"."image", "public"."users"."phone", "public"."users"."role"::text, "public"."users"."googleId", "public"."users"."createdAt", "public"."users"."updatedAt", "public"."users"."password" FROM "public"."users" WHERE "public"."users"."phone" = $1 LIMIT $2 OFFSET $3
prisma:query SELECT "public"."users"."id", "public"."users"."email", "public"."users"."name", "public"."users"."image", "public"."users"."phone", "public"."users"."role"::text, "public"."users"."googleId", "public"."users"."createdAt", "public"."users"."updatedAt", "public"."users"."password" FROM "public"."users" WHERE "public"."users"."phone" = $1 LIMIT $2 OFFSET $3
prisma:query SELECT "public"."customers"."id", "public"."customers"."userId", "public"."customers"."favoriteRestaurants", "public"."customers"."defaultAddressId", "public"."customers"."createdAt", "public"."customers"."updatedAt" FROM "public"."customers" WHERE "public"."customers"."userId" IN ($1) OFFSET $2
prisma:query SELECT "public"."customers"."id", "public"."customers"."userId", "public"."customers"."favoriteRestaurants", "public"."customers"."defaultAddressId", "public"."customers"."createdAt", "public"."customers"."updatedAt" FROM "public"."customers" WHERE "public"."customers"."userId" IN ($1) OFFSET $2
prisma:query SELECT "public"."delivery_partners"."id", "public"."delivery_partners"."userId", "public"."delivery_partners"."assignedRestaurants", "public"."delivery_partners"."currentLatitude", "public"."delivery_partners"."currentLongitude", "public"."delivery_partners"."status"::text, "public"."delivery_partners"."todayEarnings", "public"."delivery_partners"."totalEarnings", "public"."delivery_partners"."rating", "public"."delivery_partners"."completedDeliveries", "public"."delivery_partners"."createdAt", "public"."delivery_partners"."updatedAt", "public"."delivery_partners"."telegramPhone", "public"."delivery_partners"."telegramChatId", "public"."delivery_partners"."ratingCount" FROM "public"."delivery_partners" WHERE "public"."delivery_partners"."userId" IN ($1) OFFSET $2
prisma:query SELECT "public"."delivery_partners"."id", "public"."delivery_partners"."userId", "public"."delivery_partners"."assignedRestaurants", "public"."delivery_partners"."currentLatitude", "public"."delivery_partners"."currentLongitude", "public"."delivery_partners"."status"::text, "public"."delivery_partners"."todayEarnings", "public"."delivery_partners"."totalEarnings", "public"."delivery_partners"."rating", "public"."delivery_partners"."completedDeliveries", "public"."delivery_partners"."createdAt", "public"."delivery_partners"."updatedAt", "public"."delivery_partners"."telegramPhone", "public"."delivery_partners"."telegramChatId", "public"."delivery_partners"."ratingCount" FROM "public"."delivery_partners" WHERE "public"."delivery_partners"."userId" IN ($1) OFFSET $2
prisma:query SELECT "public"."restaurants"."id", "public"."restaurants"."name", "public"."restaurants"."ownerId", "public"."restaurants"."latitude", "public"."restaurants"."longitude", "public"."restaurants"."address", "public"."restaurants"."phone", "public"."restaurants"."email", "public"."restaurants"."imageUrl", "public"."restaurants"."cuisineTypes", "public"."restaurants"."averagePreparationTime", "public"."restaurants"."minimumOrderAmount", "public"."restaurants"."deliveryRadius", "public"."restaurants"."commissionRate", "public"."restaurants"."rating", "public"."restaurants"."totalOrders", "public"."restaurants"."status"::text, "public"."restaurants"."operatingHours", "public"."restaurants"."assignedDeliveryPartners", "public"."restaurants"."createdAt", "public"."restaurants"."updatedAt", "public"."restaurants"."ownerName", "public"."restaurants"."aastaPricePercentage", "public"."restaurants"."restaurantPricePercentage", "public"."restaurants"."locationId", "public"."restaurants"."pickupExperienceCount", "public"."restaurants"."pickupExperienceRating", COALESCE("aggr_selection_0_Order"."_aggr_count_orders", 0) AS "_aggr_count_orders" FROM "public"."restaurants" LEFT JOIN (SELECT "public"."orders"."restaurantId", COUNT(*) AS "_aggr_count_orders" FROM "public"."orders" WHERE "public"."orders"."createdAt" >= $1 GROUP BY "public"."orders"."restaurantId") AS "aggr_selection_0_Order" ON ("public"."restaurants"."id" = "aggr_selection_0_Order"."restaurantId") WHERE ("public"."restaurants"."status" IN (CAST($2::text AS "public"."RestaurantStatus"),CAST($3::text AS "public"."RestaurantStatus")) AND "public"."restaurants"."latitude" >= $4 AND "public"."restaurants"."latitude" <= $5 AND "public"."restaurants"."longitude" >= $6 AND "public"."restaurants"."longitude" <= $7) ORDER BY "public"."restaurants"."rating" DESC LIMIT $8 OFFSET $9
prisma:query SELECT "public"."restaurants"."id", "public"."restaurants"."name", "public"."restaurants"."ownerId", "public"."restaurants"."latitude", "public"."restaurants"."longitude", "public"."restaurants"."address", "public"."restaurants"."phone", "public"."restaurants"."email", "public"."restaurants"."imageUrl", "public"."restaurants"."cuisineTypes", "public"."restaurants"."averagePreparationTime", "public"."restaurants"."minimumOrderAmount", "public"."restaurants"."deliveryRadius", "public"."restaurants"."commissionRate", "public"."restaurants"."rating", "public"."restaurants"."totalOrders", "public"."restaurants"."status"::text, "public"."restaurants"."operatingHours", "public"."restaurants"."assignedDeliveryPartners", "public"."restaurants"."createdAt", "public"."restaurants"."updatedAt", "public"."restaurants"."ownerName", "public"."restaurants"."aastaPricePercentage", "public"."restaurants"."restaurantPricePercentage", "public"."restaurants"."locationId", "public"."restaurants"."pickupExperienceCount", "public"."restaurants"."pickupExperienceRating", COALESCE("aggr_selection_0_Order"."_aggr_count_orders", 0) AS "_aggr_count_orders" FROM "public"."restaurants" LEFT JOIN (SELECT "public"."orders"."restaurantId", COUNT(*) AS "_aggr_count_orders" FROM "public"."orders" WHERE "public"."orders"."createdAt" >= $1 GROUP BY "public"."orders"."restaurantId") AS "aggr_selection_0_Order" ON ("public"."restaurants"."id" = "aggr_selection_0_Order"."restaurantId") WHERE ("public"."restaurants"."status" IN (CAST($2::text AS "public"."RestaurantStatus"),CAST($3::text AS "public"."RestaurantStatus")) AND "public"."restaurants"."latitude" >= $4 AND "public"."restaurants"."latitude" <= $5 AND "public"."restaurants"."longitude" >= $6 AND "public"."restaurants"."longitude" <= $7) ORDER BY "public"."restaurants"."rating" DESC LIMIT $8 OFFSET $9
prisma:query SELECT "public"."menu_items"."id", "public"."menu_items"."restaurantId", "public"."menu_items"."name", "public"."menu_items"."imageUrl", "public"."menu_items"."price", "public"."menu_items"."originalPrice", "public"."menu_items"."dietaryTags", "public"."menu_items"."featured", "public"."menu_items"."hackOfTheDay", "public"."menu_items"."preparationTime", "public"."menu_items"."category", "public"."menu_items"."spiceLevel" FROM "public"."menu_items" WHERE ("public"."menu_items"."restaurantId" IN ($1,$2,$3,$4,$5,$6) AND "public"."menu_items"."available" = $7) ORDER BY "public"."menu_items"."featured" DESC, "public"."menu_items"."createdAt" DESC OFFSET $8
 GET /api/nearby-restaurants?latitude=12.9842762&longitude=77.7327008&radius=5&limit=12 200 in 2543ms
prisma:query SELECT "public"."users"."id", "public"."users"."email", "public"."users"."name", "public"."users"."image", "public"."users"."phone", "public"."users"."role"::text, "public"."users"."googleId", "public"."users"."createdAt", "public"."users"."updatedAt", "public"."users"."password" FROM "public"."users" WHERE "public"."users"."phone" = $1 LIMIT $2 OFFSET $3
prisma:query SELECT "public"."users"."id", "public"."users"."email", "public"."users"."name", "public"."users"."image", "public"."users"."phone", "public"."users"."role"::text, "public"."users"."googleId", "public"."users"."createdAt", "public"."users"."updatedAt", "public"."users"."password" FROM "public"."users" WHERE "public"."users"."phone" = $1 LIMIT $2 OFFSET $3
prisma:query SELECT "public"."customers"."id", "public"."customers"."userId", "public"."customers"."favoriteRestaurants", "public"."customers"."defaultAddressId", "public"."customers"."createdAt", "public"."customers"."updatedAt" FROM "public"."customers" WHERE "public"."customers"."userId" IN ($1) OFFSET $2
prisma:query SELECT "public"."menu_items"."id", "public"."menu_items"."restaurantId", "public"."menu_items"."name", "public"."menu_items"."imageUrl", "public"."menu_items"."price", "public"."menu_items"."originalPrice", "public"."menu_items"."dietaryTags", "public"."menu_items"."featured", "public"."menu_items"."hackOfTheDay", "public"."menu_items"."preparationTime", "public"."menu_items"."category", "public"."menu_items"."spiceLevel" FROM "public"."menu_items" WHERE ("public"."menu_items"."restaurantId" IN ($1,$2,$3,$4,$5,$6) AND "public"."menu_items"."available" = $7) ORDER BY "public"."menu_items"."featured" DESC, "public"."menu_items"."createdAt" DESC OFFSET $8
 GET /api/nearby-restaurants?latitude=12.9842762&longitude=77.7327008&radius=5 200 in 2870ms
prisma:query SELECT "public"."customers"."id", "public"."customers"."userId", "public"."customers"."favoriteRestaurants", "public"."customers"."defaultAddressId", "public"."customers"."createdAt", "public"."customers"."updatedAt" FROM "public"."customers" WHERE "public"."customers"."userId" IN ($1) OFFSET $2
prisma:query SELECT "public"."delivery_partners"."id", "public"."delivery_partners"."userId", "public"."delivery_partners"."assignedRestaurants", "public"."delivery_partners"."currentLatitude", "public"."delivery_partners"."currentLongitude", "public"."delivery_partners"."status"::text, "public"."delivery_partners"."todayEarnings", "public"."delivery_partners"."totalEarnings", "public"."delivery_partners"."rating", "public"."delivery_partners"."completedDeliveries", "public"."delivery_partners"."createdAt", "public"."delivery_partners"."updatedAt", "public"."delivery_partners"."telegramPhone", "public"."delivery_partners"."telegramChatId", "public"."delivery_partners"."ratingCount" FROM "public"."delivery_partners" WHERE "public"."delivery_partners"."userId" IN ($1) OFFSET $2
prisma:query SELECT "public"."delivery_partners"."id", "public"."delivery_partners"."userId", "public"."delivery_partners"."assignedRestaurants", "public"."delivery_partners"."currentLatitude", "public"."delivery_partners"."currentLongitude", "public"."delivery_partners"."status"::text, "public"."delivery_partners"."todayEarnings", "public"."delivery_partners"."totalEarnings", "public"."delivery_partners"."rating", "public"."delivery_partners"."completedDeliveries", "public"."delivery_partners"."createdAt", "public"."delivery_partners"."updatedAt", "public"."delivery_partners"."telegramPhone", "public"."delivery_partners"."telegramChatId", "public"."delivery_partners"."ratingCount" FROM "public"."delivery_partners" WHERE "public"."delivery_partners"."userId" IN ($1) OFFSET $2
prisma:query SELECT "public"."customers"."id", "public"."customers"."userId", "public"."customers"."favoriteRestaurants", "public"."customers"."defaultAddressId", "public"."customers"."createdAt", "public"."customers"."updatedAt" FROM "public"."customers" WHERE ("public"."customers"."userId" = $1 AND 1=1) LIMIT $2 OFFSET $3
prisma:query SELECT "public"."customers"."id", "public"."customers"."userId", "public"."customers"."favoriteRestaurants", "public"."customers"."defaultAddressId", "public"."customers"."createdAt", "public"."customers"."updatedAt" FROM "public"."customers" WHERE ("public"."customers"."userId" = $1 AND 1=1) LIMIT $2 OFFSET $3
Payment status filter applied: COMPLETED only
Final where clause for orders query: {
  "customerId": "cmfmbu91e0002unvr86lhm1x5",
  "paymentStatus": "COMPLETED"
}
prisma:query SELECT "public"."addresses"."id", "public"."addresses"."customerId", "public"."addresses"."type"::text, "public"."addresses"."street", "public"."addresses"."city", "public"."addresses"."state", "public"."addresses"."zipCode", "public"."addresses"."latitude", "public"."addresses"."longitude", "public"."addresses"."landmark", "public"."addresses"."instructions", "public"."addresses"."isDefault", "public"."addresses"."createdAt", "public"."addresses"."updatedAt", "public"."addresses"."contactPhone", "public"."addresses"."houseNumber", "public"."addresses"."locality" FROM "public"."addresses" WHERE "public"."addresses"."customerId" = $1 ORDER BY "public"."addresses"."isDefault" DESC OFFSET $2
 GET /api/user/address 200 in 3142ms
🌐 API REQUEST: {
  method: 'GET',
  url: 'http://localhost:3000/api/user/address',
  pathname: '/api/user/address',
  timestamp: '2025-09-30T15:39:39.409Z',
  userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Vers'
}
prisma:query SELECT COUNT(*) AS "_count$_all" FROM (SELECT "public"."orders"."id" FROM "public"."orders" WHERE ("public"."orders"."customerId" = $1 AND "public"."orders"."paymentStatus" = $2) OFFSET $3) AS "sub"
prisma:query SELECT "public"."orders"."id", "public"."orders"."orderNumber", "public"."orders"."customerId", "public"."orders"."restaurantId", "public"."orders"."deliveryPartnerId", "public"."orders"."deliveryAddressId", "public"."orders"."status"::text, "public"."orders"."subtotal", "public"."orders"."deliveryFee", "public"."orders"."taxes", "public"."orders"."discountAmount", "public"."orders"."totalAmount", "public"."orders"."estimatedPreparationTime", "public"."orders"."estimatedDeliveryTime", "public"."orders"."actualDeliveryTime", "public"."orders"."verificationCode", "public"."orders"."paymentStatus", "public"."orders"."specialInstructions", "public"."orders"."cancelReason", "public"."orders"."createdAt", "public"."orders"."updatedAt", "public"."orders"."deliveryBatchId", "public"."orders"."razorpayOrderId", "public"."orders"."deliveryDistance", "public"."orders"."estimatedDeliveryDuration", "public"."orders"."orderType"::text FROM "public"."orders" WHERE ("public"."orders"."customerId" = $1 AND "public"."orders"."paymentStatus" = $2) ORDER BY "public"."orders"."createdAt" DESC LIMIT $3 OFFSET $4
Redirect URL: https://neutral-octopus-famous.ngrok-free.app Base URL: https://neutral-octopus-famous.ngrok-free.app
prisma:query SELECT "public"."users"."id", "public"."users"."email", "public"."users"."name", "public"."users"."image", "public"."users"."phone", "public"."users"."role"::text, "public"."users"."googleId", "public"."users"."createdAt", "public"."users"."updatedAt", "public"."users"."password" FROM "public"."users" WHERE "public"."users"."phone" = $1 LIMIT $2 OFFSET $3
prisma:query SELECT "public"."customers"."id", "public"."customers"."userId", "public"."customers"."favoriteRestaurants", "public"."customers"."defaultAddressId", "public"."customers"."createdAt", "public"."customers"."updatedAt" FROM "public"."customers" WHERE "public"."customers"."userId" IN ($1) OFFSET $2
prisma:query SELECT "public"."customers"."id", "public"."customers"."userId", "public"."customers"."favoriteRestaurants", "public"."customers"."defaultAddressId", "public"."customers"."createdAt", "public"."customers"."updatedAt" FROM "public"."customers" WHERE "public"."customers"."id" IN ($1) OFFSET $2
prisma:query SELECT "public"."delivery_partners"."id", "public"."delivery_partners"."userId", "public"."delivery_partners"."assignedRestaurants", "public"."delivery_partners"."currentLatitude", "public"."delivery_partners"."currentLongitude", "public"."delivery_partners"."status"::text, "public"."delivery_partners"."todayEarnings", "public"."delivery_partners"."totalEarnings", "public"."delivery_partners"."rating", "public"."delivery_partners"."completedDeliveries", "public"."delivery_partners"."createdAt", "public"."delivery_partners"."updatedAt", "public"."delivery_partners"."telegramPhone", "public"."delivery_partners"."telegramChatId", "public"."delivery_partners"."ratingCount" FROM "public"."delivery_partners" WHERE "public"."delivery_partners"."userId" IN ($1) OFFSET $2
prisma:query SELECT "public"."users"."id", "public"."users"."name", "public"."users"."email", "public"."users"."phone" FROM "public"."users" WHERE "public"."users"."id" IN ($1) OFFSET $2
prisma:query SELECT "public"."customers"."id", "public"."customers"."userId", "public"."customers"."favoriteRestaurants", "public"."customers"."defaultAddressId", "public"."customers"."createdAt", "public"."customers"."updatedAt" FROM "public"."customers" WHERE ("public"."customers"."userId" = $1 AND 1=1) LIMIT $2 OFFSET $3
prisma:query SELECT "public"."restaurants"."id", "public"."restaurants"."name", "public"."restaurants"."phone", "public"."restaurants"."address" FROM "public"."restaurants" WHERE "public"."restaurants"."id" IN ($1,$2) OFFSET $3
prisma:query SELECT "public"."addresses"."id", "public"."addresses"."customerId", "public"."addresses"."type"::text, "public"."addresses"."street", "public"."addresses"."city", "public"."addresses"."state", "public"."addresses"."zipCode", "public"."addresses"."latitude", "public"."addresses"."longitude", "public"."addresses"."landmark", "public"."addresses"."instructions", "public"."addresses"."isDefault", "public"."addresses"."createdAt", "public"."addresses"."updatedAt", "public"."addresses"."contactPhone", "public"."addresses"."houseNumber", "public"."addresses"."locality" FROM "public"."addresses" WHERE "public"."addresses"."customerId" = $1 ORDER BY "public"."addresses"."isDefault" DESC OFFSET $2
 GET /api/user/address 200 in 431ms
🌐 API REQUEST: {
  method: 'GET',
  url: 'http://localhost:3000/api/user/address',
  pathname: '/api/user/address',
  timestamp: '2025-09-30T15:39:39.865Z',
  userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Vers'
}
Redirect URL: https://neutral-octopus-famous.ngrok-free.app Base URL: https://neutral-octopus-famous.ngrok-free.app
prisma:query SELECT "public"."users"."id", "public"."users"."email", "public"."users"."name", "public"."users"."image", "public"."users"."phone", "public"."users"."role"::text, "public"."users"."googleId", "public"."users"."createdAt", "public"."users"."updatedAt", "public"."users"."password" FROM "public"."users" WHERE "public"."users"."phone" = $1 LIMIT $2 OFFSET $3
prisma:query SELECT "public"."addresses"."id", "public"."addresses"."customerId", "public"."addresses"."type"::text, "public"."addresses"."street", "public"."addresses"."city", "public"."addresses"."state", "public"."addresses"."zipCode", "public"."addresses"."latitude", "public"."addresses"."longitude", "public"."addresses"."landmark", "public"."addresses"."instructions", "public"."addresses"."isDefault", "public"."addresses"."createdAt", "public"."addresses"."updatedAt", "public"."addresses"."contactPhone", "public"."addresses"."houseNumber", "public"."addresses"."locality" FROM "public"."addresses" WHERE "public"."addresses"."id" IN ($1) OFFSET $2
prisma:query SELECT "public"."customers"."id", "public"."customers"."userId", "public"."customers"."favoriteRestaurants", "public"."customers"."defaultAddressId", "public"."customers"."createdAt", "public"."customers"."updatedAt" FROM "public"."customers" WHERE "public"."customers"."userId" IN ($1) OFFSET $2
prisma:query SELECT "public"."delivery_partners"."id", "public"."delivery_partners"."userId", "public"."delivery_partners"."assignedRestaurants", "public"."delivery_partners"."currentLatitude", "public"."delivery_partners"."currentLongitude", "public"."delivery_partners"."status"::text, "public"."delivery_partners"."todayEarnings", "public"."delivery_partners"."totalEarnings", "public"."delivery_partners"."rating", "public"."delivery_partners"."completedDeliveries", "public"."delivery_partners"."createdAt", "public"."delivery_partners"."updatedAt", "public"."delivery_partners"."telegramPhone", "public"."delivery_partners"."telegramChatId", "public"."delivery_partners"."ratingCount" FROM "public"."delivery_partners" WHERE "public"."delivery_partners"."userId" IN ($1) OFFSET $2
prisma:query SELECT "public"."order_items"."id", "public"."order_items"."orderId", "public"."order_items"."menuItemId", "public"."order_items"."quantity", "public"."order_items"."unitPrice", "public"."order_items"."totalPrice", "public"."order_items"."customizations", "public"."order_items"."createdAt", "public"."order_items"."aastaEarningsPerItem", "public"."order_items"."aastaTotalEarnings", "public"."order_items"."originalUnitPrice", "public"."order_items"."restaurantEarningsPerItem", "public"."order_items"."restaurantTotalEarnings", "public"."order_items"."totalOriginalPrice" FROM "public"."order_items" WHERE "public"."order_items"."orderId" IN ($1,$2,$3,$4) OFFSET $5
prisma:query SELECT "public"."customers"."id", "public"."customers"."userId", "public"."customers"."favoriteRestaurants", "public"."customers"."defaultAddressId", "public"."customers"."createdAt", "public"."customers"."updatedAt" FROM "public"."customers" WHERE ("public"."customers"."userId" = $1 AND 1=1) LIMIT $2 OFFSET $3
prisma:query SELECT "public"."addresses"."id", "public"."addresses"."customerId", "public"."addresses"."type"::text, "public"."addresses"."street", "public"."addresses"."city", "public"."addresses"."state", "public"."addresses"."zipCode", "public"."addresses"."latitude", "public"."addresses"."longitude", "public"."addresses"."landmark", "public"."addresses"."instructions", "public"."addresses"."isDefault", "public"."addresses"."createdAt", "public"."addresses"."updatedAt", "public"."addresses"."contactPhone", "public"."addresses"."houseNumber", "public"."addresses"."locality" FROM "public"."addresses" WHERE "public"."addresses"."customerId" = $1 ORDER BY "public"."addresses"."isDefault" DESC OFFSET $2
 GET /api/user/address 200 in 346ms
prisma:query SELECT "public"."menu_items"."id", "public"."menu_items"."name", "public"."menu_items"."description", "public"."menu_items"."imageUrl", "public"."menu_items"."price", "public"."menu_items"."originalPrice" FROM "public"."menu_items" WHERE "public"."menu_items"."id" IN ($1,$2,$3,$4,$5) OFFSET $6
Orders returned from database: [
  {
    orderNumber: 'AST-20250930-180944-2719',
    paymentStatus: 'COMPLETED',
    status: 'PLACED'
  },
  {
    orderNumber: 'AST-20250930-090024-1915',
    paymentStatus: 'COMPLETED',
    status: 'PLACED'
  },
  {
    orderNumber: 'AST-20250930-085539-1492',
    paymentStatus: 'COMPLETED',
    status: 'PLACED'
  },
  {
    orderNumber: 'AST-20250930-110639-4022',
    paymentStatus: 'COMPLETED',
    status: 'PLACED'
  }
]
Item Chilli Paneer: {
  originalPrice: 149,
  price: 69,
  originalUnitPrice: 149,
  unitPrice: 69,
  quantity: 2,
  calculatedOriginal: 298,
  calculatedPrice: 138
}
Item savings calculation (matching cart): {
  itemName: 'Chilli Paneer',
  originalPrice: 149,
  price: 69,
  originalUnitPrice: 149,
  unitPrice: 69,
  quantity: 2,
  calculatedOriginal: 298
}
Item Veg Biryani: {
  originalPrice: 119,
  price: 59,
  originalUnitPrice: 119,
  unitPrice: 59,
  quantity: 2,
  calculatedOriginal: 238,
  calculatedPrice: 118
}
Item savings calculation (matching cart): {
  itemName: 'Veg Biryani',
  originalPrice: 119,
  price: 59,
  originalUnitPrice: 119,
  unitPrice: 59,
  quantity: 2,
  calculatedOriginal: 238
}
Savings calculation (matching cart): {
  orderNumber: 'AST-20250930-180944-2719',
  itemsTotalOriginal: 536,
  itemsTotal: 256,
  itemSavings: 280,
  deliveryFee: 25,
  estimatedDeliveryFee: 50,
  deliverySavings: 25,
  packagingSavings: 10,
  totalSavings: 280,
  breakdown: {
    itemSavings: 280,
    deliverySavings: 25,
    packagingSavings: 10,
    total: 315
  }
}
Order calculation debug: {
  orderNumber: 'AST-20250930-180944-2719',
  itemsTotal: 256,
  itemsTotalOriginal: 536,
  savings: 280,
  subtotal: 256,
  taxes: 12.8,
  deliveryFee: 25,
  total: 293.8,
  totalAmount: 293.8,
  orderItemsCount: 2
}
Item Egg Biryani: {
  originalPrice: 180,
  price: 90,
  originalUnitPrice: 180,
  unitPrice: 90,
  quantity: 5,
  calculatedOriginal: 900,
  calculatedPrice: 450
}
Item savings calculation (matching cart): {
  itemName: 'Egg Biryani',
  originalPrice: 180,
  price: 90,
  originalUnitPrice: 180,
  unitPrice: 90,
  quantity: 5,
  calculatedOriginal: 900
}
Savings calculation (matching cart): {
  orderNumber: 'AST-20250930-090024-1915',
  itemsTotalOriginal: 900,
  itemsTotal: 450,
  itemSavings: 450,
  deliveryFee: 25,
  estimatedDeliveryFee: 50,
  deliverySavings: 25,
  packagingSavings: 10,
  totalSavings: 450,
  breakdown: {
    itemSavings: 450,
    deliverySavings: 25,
    packagingSavings: 10,
    total: 485
  }
}
Order calculation debug: {
  orderNumber: 'AST-20250930-090024-1915',
  itemsTotal: 450,
  itemsTotalOriginal: 900,
  savings: 450,
  subtotal: 450,
  taxes: 22.5,
  deliveryFee: 25,
  total: 497.5,
  totalAmount: 497.5,
  orderItemsCount: 1
}
Item Chilli Paneer: {
  originalPrice: 149,
  price: 69,
  originalUnitPrice: 149,
  unitPrice: 69,
  quantity: 7,
  calculatedOriginal: 1043,
  calculatedPrice: 483
}
Item savings calculation (matching cart): {
  itemName: 'Chilli Paneer',
  originalPrice: 149,
  price: 69,
  originalUnitPrice: 149,
  unitPrice: 69,
  quantity: 7,
  calculatedOriginal: 1043
}
Savings calculation (matching cart): {
  orderNumber: 'AST-20250930-085539-1492',
  itemsTotalOriginal: 1043,
  itemsTotal: 483,
  itemSavings: 560,
  deliveryFee: 25,
  estimatedDeliveryFee: 50,
  deliverySavings: 25,
  packagingSavings: 10,
  totalSavings: 560,
  breakdown: {
    itemSavings: 560,
    deliverySavings: 25,
    packagingSavings: 10,
    total: 595
  }
}
Order calculation debug: {
  orderNumber: 'AST-20250930-085539-1492',
  itemsTotal: 483,
  itemsTotalOriginal: 1043,
  savings: 560,
  subtotal: 483,
  taxes: 24.15,
  deliveryFee: 25,
  total: 532.15,
  totalAmount: 532.15,
  orderItemsCount: 1
}
Item Veg Biryani: {
  originalPrice: 119,
  price: 59,
  originalUnitPrice: 119,
  unitPrice: 59,
  quantity: 3,
  calculatedOriginal: 357,
  calculatedPrice: 177
}
Item savings calculation (matching cart): {
  itemName: 'Veg Biryani',
  originalPrice: 119,
  price: 59,
  originalUnitPrice: 119,
  unitPrice: 59,
  quantity: 3,
  calculatedOriginal: 357
}
Item BBQ Chicken Pizza: {
  originalPrice: 199,
  price: 99,
  originalUnitPrice: 199,
  unitPrice: 99,
  quantity: 3,
  calculatedOriginal: 597,
  calculatedPrice: 297
}
Item savings calculation (matching cart): {
  itemName: 'BBQ Chicken Pizza',
  originalPrice: 199,
  price: 99,
  originalUnitPrice: 199,
  unitPrice: 99,
  quantity: 3,
  calculatedOriginal: 597
}
Item Veggie Burger: {
  originalPrice: 99,
  price: 38.98,
  originalUnitPrice: 99,
  unitPrice: 38.98,
  quantity: 3,
  calculatedOriginal: 297,
  calculatedPrice: 116.94
}
Item savings calculation (matching cart): {
  itemName: 'Veggie Burger',
  originalPrice: 99,
  price: 38.98,
  originalUnitPrice: 99,
  unitPrice: 38.98,
  quantity: 3,
  calculatedOriginal: 297
}
Item Chilli Paneer: {
  originalPrice: 149,
  price: 69,
  originalUnitPrice: 149,
  unitPrice: 69,
  quantity: 3,
  calculatedOriginal: 447,
  calculatedPrice: 207
}
Item savings calculation (matching cart): {
  itemName: 'Chilli Paneer',
  originalPrice: 149,
  price: 69,
  originalUnitPrice: 149,
  unitPrice: 69,
  quantity: 3,
  calculatedOriginal: 447
}
Savings calculation (matching cart): {
  orderNumber: 'AST-20250930-110639-4022',
  itemsTotalOriginal: 1698,
  itemsTotal: 797.94,
  itemSavings: 900,
  deliveryFee: 25,
  estimatedDeliveryFee: 50,
  deliverySavings: 25,
  packagingSavings: 10,
  totalSavings: 900,
  breakdown: {
    itemSavings: 900,
    deliverySavings: 25,
    packagingSavings: 10,
    total: 935
  }
}
Order calculation debug: {
  orderNumber: 'AST-20250930-110639-4022',
  itemsTotal: 797.94,
  itemsTotalOriginal: 1698,
  savings: 900,
  subtotal: 797.94,
  taxes: 39.89700000000001,
  deliveryFee: 25,
  total: 862.8370000000001,
  totalAmount: 862.8370000000001,
  orderItemsCount: 4
}
 GET /api/orders?limit=4&paymentStatus=COMPLETED 200 in 4198ms





when i press on place order 

Api logs --- 🌐 API REQUEST: {
  method: 'POST',
  url: 'http://localhost:3000/api/orders/create',
  pathname: '/api/orders/create',
  timestamp: '2025-10-03T15:53:40.834Z',
  userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Vers'
}
 ○ Compiling /api/orders/create ...
 ✓ Compiled /api/orders/create in 734ms (1458 modules)
[next-auth][warn][DEBUG_ENABLED] 
https://next-auth.js.org/warnings#debug_enabled
Redirect URL: http://localhost:3000 Base URL: http://localhost:3000
prisma:query SELECT 1
prisma:query SELECT "public"."users"."id", "public"."users"."email", "public"."users"."name", "public"."users"."image", "public"."users"."phone", "public"."users"."role"::text, "public"."users"."googleId", "public"."users"."createdAt", "public"."users"."updatedAt", "public"."users"."password" FROM "public"."users" WHERE "public"."users"."phone" = $1 LIMIT $2 OFFSET $3
prisma:query SELECT "public"."customers"."id", "public"."customers"."userId", "public"."customers"."favoriteRestaurants", "public"."customers"."defaultAddressId", "public"."customers"."createdAt", "public"."customers"."updatedAt" FROM "public"."customers" WHERE "public"."customers"."userId" IN ($1) OFFSET $2
prisma:query SELECT "public"."delivery_partners"."id", "public"."delivery_partners"."userId", "public"."delivery_partners"."assignedRestaurants", "public"."delivery_partners"."currentLatitude", "public"."delivery_partners"."currentLongitude", "public"."delivery_partners"."status"::text, "public"."delivery_partners"."todayEarnings", "public"."delivery_partners"."totalEarnings", "public"."delivery_partners"."rating", "public"."delivery_partners"."completedDeliveries", "public"."delivery_partners"."createdAt", "public"."delivery_partners"."updatedAt", "public"."delivery_partners"."telegramPhone", "public"."delivery_partners"."telegramChatId", "public"."delivery_partners"."ratingCount" FROM "public"."delivery_partners" WHERE "public"."delivery_partners"."userId" IN ($1) OFFSET $2
prisma:query SELECT "public"."restaurants"."id" FROM "public"."restaurants" WHERE ("public"."restaurants"."ownerId" = $1 AND 1=1) LIMIT $2 OFFSET $3
prisma:query SELECT "public"."restaurants"."id", "public"."restaurants"."name", "public"."restaurants"."ownerId", "public"."restaurants"."latitude", "public"."restaurants"."longitude", "public"."restaurants"."address", "public"."restaurants"."phone", "public"."restaurants"."email", "public"."restaurants"."imageUrl", "public"."restaurants"."cuisineTypes", "public"."restaurants"."averagePreparationTime", "public"."restaurants"."minimumOrderAmount", "public"."restaurants"."deliveryRadius", "public"."restaurants"."commissionRate", "public"."restaurants"."rating", "public"."restaurants"."totalOrders", "public"."restaurants"."status"::text, "public"."restaurants"."operatingHours", "public"."restaurants"."assignedDeliveryPartners", "public"."restaurants"."createdAt", "public"."restaurants"."updatedAt", "public"."restaurants"."ownerName", "public"."restaurants"."aastaPricePercentage", "public"."restaurants"."restaurantPricePercentage", "public"."restaurants"."locationId", "public"."restaurants"."pickupExperienceCount", "public"."restaurants"."pickupExperienceRating" FROM "public"."restaurants" WHERE ("public"."restaurants"."id" = $1 AND 1=1) LIMIT $2 OFFSET $3
prisma:query SELECT "public"."menu_items"."id", "public"."menu_items"."restaurantId", "public"."menu_items"."name", "public"."menu_items"."description", "public"."menu_items"."price", "public"."menu_items"."originalPrice", "public"."menu_items"."category", "public"."menu_items"."preparationTime", "public"."menu_items"."imageUrl", "public"."menu_items"."dietaryTags", "public"."menu_items"."spiceLevel", "public"."menu_items"."available", "public"."menu_items"."featured", "public"."menu_items"."createdAt", "public"."menu_items"."updatedAt", "public"."menu_items"."stockLeft", "public"."menu_items"."rating", "public"."menu_items"."ratingCount", "public"."menu_items"."hackOfTheDay" FROM "public"."menu_items" WHERE "public"."menu_items"."restaurantId" IN ($1) OFFSET $2
prisma:query SELECT "public"."menu_items"."id", "public"."menu_items"."restaurantId", "public"."menu_items"."name", "public"."menu_items"."description", "public"."menu_items"."price", "public"."menu_items"."originalPrice", "public"."menu_items"."category", "public"."menu_items"."preparationTime", "public"."menu_items"."imageUrl", "public"."menu_items"."dietaryTags", "public"."menu_items"."spiceLevel", "public"."menu_items"."available", "public"."menu_items"."featured", "public"."menu_items"."createdAt", "public"."menu_items"."updatedAt", "public"."menu_items"."stockLeft", "public"."menu_items"."rating", "public"."menu_items"."ratingCount", "public"."menu_items"."hackOfTheDay" FROM "public"."menu_items" WHERE ("public"."menu_items"."id" IN ($1) AND "public"."menu_items"."restaurantId" = $2 AND "public"."menu_items"."available" = $3) OFFSET $4
prisma:query SELECT "public"."customers"."id", "public"."customers"."userId", "public"."customers"."favoriteRestaurants", "public"."customers"."defaultAddressId", "public"."customers"."createdAt", "public"."customers"."updatedAt" FROM "public"."customers" WHERE ("public"."customers"."userId" = $1 AND 1=1) LIMIT $2 OFFSET $3
prisma:query SELECT "public"."users"."id", "public"."users"."email", "public"."users"."name", "public"."users"."image", "public"."users"."phone", "public"."users"."role"::text, "public"."users"."googleId", "public"."users"."createdAt", "public"."users"."updatedAt", "public"."users"."password" FROM "public"."users" WHERE "public"."users"."id" IN ($1) OFFSET $2
prisma:query SELECT "public"."addresses"."id", "public"."addresses"."customerId", "public"."addresses"."type"::text, "public"."addresses"."street", "public"."addresses"."city", "public"."addresses"."state", "public"."addresses"."zipCode", "public"."addresses"."latitude", "public"."addresses"."longitude", "public"."addresses"."landmark", "public"."addresses"."instructions", "public"."addresses"."isDefault", "public"."addresses"."createdAt", "public"."addresses"."updatedAt", "public"."addresses"."contactPhone", "public"."addresses"."houseNumber", "public"."addresses"."locality" FROM "public"."addresses" WHERE ("public"."addresses"."customerId" = $1 AND "public"."addresses"."street" = $2) LIMIT $3 OFFSET $4
prisma:query INSERT INTO "public"."addresses" ("id","customerId","type","street","city","state","zipCode","latitude","longitude","isDefault","createdAt","updatedAt") VALUES ($1,$2,CAST($3::text AS "public"."AddressType"),$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING "public"."addresses"."id", "public"."addresses"."customerId", "public"."addresses"."type"::text, "public"."addresses"."street", "public"."addresses"."city", "public"."addresses"."state", "public"."addresses"."zipCode", "public"."addresses"."latitude", "public"."addresses"."longitude", "public"."addresses"."landmark", "public"."addresses"."instructions", "public"."addresses"."isDefault", "public"."addresses"."createdAt", "public"."addresses"."updatedAt", "public"."addresses"."contactPhone", "public"."addresses"."houseNumber", "public"."addresses"."locality"
Calculating delivery metrics for order AST-20251003-212342-6819
Restaurant: 12.98420094669663, 77.7320823495282
Customer: 12.98360574609645, 77.73226341977569
Delivery calculation completed:
Distance: 0.2 km
Duration: 2 minutes
Estimated delivery time: 2025-10-03T16:15:43.977Z
prisma:query BEGIN
prisma:query INSERT INTO "public"."orders" ("id","orderNumber","customerId","restaurantId","deliveryAddressId","status","subtotal","deliveryFee","taxes","discountAmount","totalAmount","estimatedPreparationTime","estimatedDeliveryTime","verificationCode","paymentStatus","createdAt","updatedAt","deliveryDistance","estimatedDeliveryDuration","orderType") VALUES ($1,$2,$3,$4,$5,CAST($6::text AS "public"."OrderStatus"),$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,CAST($20::text AS "public"."OrderType")) RETURNING "public"."orders"."id"
prisma:query INSERT INTO "public"."order_items" ("id","orderId","menuItemId","quantity","unitPrice","totalPrice","createdAt","aastaEarningsPerItem","aastaTotalEarnings","originalUnitPrice","restaurantEarningsPerItem","restaurantTotalEarnings","totalOriginalPrice") VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING "public"."order_items"."id"
prisma:query SELECT "public"."orders"."id", "public"."orders"."orderNumber", "public"."orders"."customerId", "public"."orders"."restaurantId", "public"."orders"."deliveryPartnerId", "public"."orders"."deliveryAddressId", "public"."orders"."status"::text, "public"."orders"."subtotal", "public"."orders"."deliveryFee", "public"."orders"."taxes", "public"."orders"."discountAmount", "public"."orders"."totalAmount", "public"."orders"."estimatedPreparationTime", "public"."orders"."estimatedDeliveryTime", "public"."orders"."actualDeliveryTime", "public"."orders"."verificationCode", "public"."orders"."paymentStatus", "public"."orders"."specialInstructions", "public"."orders"."cancelReason", "public"."orders"."createdAt", "public"."orders"."updatedAt", "public"."orders"."deliveryBatchId", "public"."orders"."razorpayOrderId", "public"."orders"."deliveryDistance", "public"."orders"."estimatedDeliveryDuration", "public"."orders"."orderType"::text FROM "public"."orders" WHERE "public"."orders"."id" = $1 LIMIT $2 OFFSET $3
prisma:query SELECT "public"."order_items"."id", "public"."order_items"."orderId", "public"."order_items"."menuItemId", "public"."order_items"."quantity", "public"."order_items"."unitPrice", "public"."order_items"."totalPrice", "public"."order_items"."customizations", "public"."order_items"."createdAt", "public"."order_items"."aastaEarningsPerItem", "public"."order_items"."aastaTotalEarnings", "public"."order_items"."originalUnitPrice", "public"."order_items"."restaurantEarningsPerItem", "public"."order_items"."restaurantTotalEarnings", "public"."order_items"."totalOriginalPrice" FROM "public"."order_items" WHERE "public"."order_items"."orderId" IN ($1) OFFSET $2
prisma:query SELECT "public"."menu_items"."id", "public"."menu_items"."restaurantId", "public"."menu_items"."name", "public"."menu_items"."description", "public"."menu_items"."price", "public"."menu_items"."originalPrice", "public"."menu_items"."category", "public"."menu_items"."preparationTime", "public"."menu_items"."imageUrl", "public"."menu_items"."dietaryTags", "public"."menu_items"."spiceLevel", "public"."menu_items"."available", "public"."menu_items"."featured", "public"."menu_items"."createdAt", "public"."menu_items"."updatedAt", "public"."menu_items"."stockLeft", "public"."menu_items"."rating", "public"."menu_items"."ratingCount", "public"."menu_items"."hackOfTheDay" FROM "public"."menu_items" WHERE "public"."menu_items"."id" IN ($1) OFFSET $2
prisma:query SELECT "public"."restaurants"."id", "public"."restaurants"."name", "public"."restaurants"."ownerId", "public"."restaurants"."latitude", "public"."restaurants"."longitude", "public"."restaurants"."address", "public"."restaurants"."phone", "public"."restaurants"."email", "public"."restaurants"."imageUrl", "public"."restaurants"."cuisineTypes", "public"."restaurants"."averagePreparationTime", "public"."restaurants"."minimumOrderAmount", "public"."restaurants"."deliveryRadius", "public"."restaurants"."commissionRate", "public"."restaurants"."rating", "public"."restaurants"."totalOrders", "public"."restaurants"."status"::text, "public"."restaurants"."operatingHours", "public"."restaurants"."assignedDeliveryPartners", "public"."restaurants"."createdAt", "public"."restaurants"."updatedAt", "public"."restaurants"."ownerName", "public"."restaurants"."aastaPricePercentage", "public"."restaurants"."restaurantPricePercentage", "public"."restaurants"."locationId", "public"."restaurants"."pickupExperienceCount", "public"."restaurants"."pickupExperienceRating" FROM "public"."restaurants" WHERE "public"."restaurants"."id" IN ($1) OFFSET $2
prisma:query SELECT "public"."addresses"."id", "public"."addresses"."customerId", "public"."addresses"."type"::text, "public"."addresses"."street", "public"."addresses"."city", "public"."addresses"."state", "public"."addresses"."zipCode", "public"."addresses"."latitude", "public"."addresses"."longitude", "public"."addresses"."landmark", "public"."addresses"."instructions", "public"."addresses"."isDefault", "public"."addresses"."createdAt", "public"."addresses"."updatedAt", "public"."addresses"."contactPhone", "public"."addresses"."houseNumber", "public"."addresses"."locality" FROM "public"."addresses" WHERE "public"."addresses"."id" IN ($1) OFFSET $2
prisma:query COMMIT
prisma:query UPDATE "public"."menu_items" SET "stockLeft" = ("public"."menu_items"."stockLeft" - $1), "available" = $2, "updatedAt" = $3 WHERE ("public"."menu_items"."id" = $4 AND 1=1) RETURNING "public"."menu_items"."id", "public"."menu_items"."restaurantId", "public"."menu_items"."name", "public"."menu_items"."description", "public"."menu_items"."price", "public"."menu_items"."originalPrice", "public"."menu_items"."category", "public"."menu_items"."preparationTime", "public"."menu_items"."imageUrl", "public"."menu_items"."dietaryTags", "public"."menu_items"."spiceLevel", "public"."menu_items"."available", "public"."menu_items"."featured", "public"."menu_items"."createdAt", "public"."menu_items"."updatedAt", "public"."menu_items"."stockLeft", "public"."menu_items"."rating", "public"."menu_items"."ratingCount", "public"."menu_items"."hackOfTheDay"
 POST /api/orders/create 200 in 4895ms
🌐 API REQUEST: {
  method: 'POST',
  url: 'http://localhost:3000/api/payments/create-order',
  pathname: '/api/payments/create-order',
  timestamp: '2025-10-03T15:53:45.761Z',
  userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Vers'
}
 ○ Compiling /api/payments/create-order ...
🌐 API REQUEST: {
  method: 'PUT',
  url: 'http://localhost:3000/api/client-register',
  pathname: '/api/client-register',
  timestamp: '2025-10-03T15:53:46.652Z',
  userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Vers'
}
 ✓ Compiled /api/payments/create-order in 1537ms (1553 modules)
[next-auth][warn][DEBUG_ENABLED] 
https://next-auth.js.org/warnings#debug_enabled
Redirect URL: http://localhost:3000 Base URL: http://localhost:3000
Redirect URL: http://localhost:3000 Base URL: http://localhost:3000
prisma:query SELECT 1
prisma:query SELECT "public"."users"."id", "public"."users"."email", "public"."users"."name", "public"."users"."image", "public"."users"."phone", "public"."users"."role"::text, "public"."users"."googleId", "public"."users"."createdAt", "public"."users"."updatedAt", "public"."users"."password" FROM "public"."users" WHERE "public"."users"."phone" = $1 LIMIT $2 OFFSET $3
prisma:query SELECT "public"."customers"."id", "public"."customers"."userId", "public"."customers"."favoriteRestaurants", "public"."customers"."defaultAddressId", "public"."customers"."createdAt", "public"."customers"."updatedAt" FROM "public"."customers" WHERE "public"."customers"."userId" IN ($1) OFFSET $2
prisma:query SELECT "public"."users"."id", "public"."users"."email", "public"."users"."name", "public"."users"."image", "public"."users"."phone", "public"."users"."role"::text, "public"."users"."googleId", "public"."users"."createdAt", "public"."users"."updatedAt", "public"."users"."password" FROM "public"."users" WHERE "public"."users"."phone" = $1 LIMIT $2 OFFSET $3
prisma:query SELECT "public"."delivery_partners"."id", "public"."delivery_partners"."userId", "public"."delivery_partners"."assignedRestaurants", "public"."delivery_partners"."currentLatitude", "public"."delivery_partners"."currentLongitude", "public"."delivery_partners"."status"::text, "public"."delivery_partners"."todayEarnings", "public"."delivery_partners"."totalEarnings", "public"."delivery_partners"."rating", "public"."delivery_partners"."completedDeliveries", "public"."delivery_partners"."createdAt", "public"."delivery_partners"."updatedAt", "public"."delivery_partners"."telegramPhone", "public"."delivery_partners"."telegramChatId", "public"."delivery_partners"."ratingCount" FROM "public"."delivery_partners" WHERE "public"."delivery_partners"."userId" IN ($1) OFFSET $2
prisma:query SELECT "public"."customers"."id", "public"."customers"."userId", "public"."customers"."favoriteRestaurants", "public"."customers"."defaultAddressId", "public"."customers"."createdAt", "public"."customers"."updatedAt" FROM "public"."customers" WHERE "public"."customers"."userId" IN ($1) OFFSET $2
prisma:query SELECT "public"."restaurants"."id" FROM "public"."restaurants" WHERE ("public"."restaurants"."ownerId" = $1 AND 1=1) LIMIT $2 OFFSET $3
prisma:query SELECT "public"."delivery_partners"."id", "public"."delivery_partners"."userId", "public"."delivery_partners"."assignedRestaurants", "public"."delivery_partners"."currentLatitude", "public"."delivery_partners"."currentLongitude", "public"."delivery_partners"."status"::text, "public"."delivery_partners"."todayEarnings", "public"."delivery_partners"."totalEarnings", "public"."delivery_partners"."rating", "public"."delivery_partners"."completedDeliveries", "public"."delivery_partners"."createdAt", "public"."delivery_partners"."updatedAt", "public"."delivery_partners"."telegramPhone", "public"."delivery_partners"."telegramChatId", "public"."delivery_partners"."ratingCount" FROM "public"."delivery_partners" WHERE "public"."delivery_partners"."userId" IN ($1) OFFSET $2
prisma:query SELECT "public"."customers"."id", "public"."customers"."userId", "public"."customers"."favoriteRestaurants", "public"."customers"."defaultAddressId", "public"."customers"."createdAt", "public"."customers"."updatedAt" FROM "public"."customers" WHERE ("public"."customers"."userId" = $1 AND 1=1) LIMIT $2 OFFSET $3
prisma:query SELECT "public"."restaurants"."id" FROM "public"."restaurants" WHERE ("public"."restaurants"."ownerId" = $1 AND 1=1) LIMIT $2 OFFSET $3
⚠️ Session not found for activity update: session_1759506796384_q5tc66ogr
 PUT /api/client-register 404 in 1301ms
prisma:query SELECT "public"."orders"."id", "public"."orders"."orderNumber", "public"."orders"."customerId", "public"."orders"."restaurantId", "public"."orders"."deliveryPartnerId", "public"."orders"."deliveryAddressId", "public"."orders"."status"::text, "public"."orders"."subtotal", "public"."orders"."deliveryFee", "public"."orders"."taxes", "public"."orders"."discountAmount", "public"."orders"."totalAmount", "public"."orders"."estimatedPreparationTime", "public"."orders"."estimatedDeliveryTime", "public"."orders"."actualDeliveryTime", "public"."orders"."verificationCode", "public"."orders"."paymentStatus", "public"."orders"."specialInstructions", "public"."orders"."cancelReason", "public"."orders"."createdAt", "public"."orders"."updatedAt", "public"."orders"."deliveryBatchId", "public"."orders"."razorpayOrderId", "public"."orders"."deliveryDistance", "public"."orders"."estimatedDeliveryDuration", "public"."orders"."orderType"::text FROM "public"."orders" WHERE ("public"."orders"."orderNumber" = $1 AND "public"."orders"."customerId" = $2) LIMIT $3 OFFSET $4
prisma:query SELECT "public"."customers"."id", "public"."customers"."userId", "public"."customers"."favoriteRestaurants", "public"."customers"."defaultAddressId", "public"."customers"."createdAt", "public"."customers"."updatedAt" FROM "public"."customers" WHERE "public"."customers"."id" IN ($1) OFFSET $2
prisma:query SELECT "public"."users"."id", "public"."users"."email", "public"."users"."phone" FROM "public"."users" WHERE "public"."users"."id" IN ($1) OFFSET $2
prisma:query UPDATE "public"."orders" SET "razorpayOrderId" = $1, "paymentStatus" = $2, "updatedAt" = $3 WHERE ("public"."orders"."id" = $4 AND 1=1) RETURNING "public"."orders"."id", "public"."orders"."orderNumber", "public"."orders"."customerId", "public"."orders"."restaurantId", "public"."orders"."deliveryPartnerId", "public"."orders"."deliveryAddressId", "public"."orders"."status"::text, "public"."orders"."subtotal", "public"."orders"."deliveryFee", "public"."orders"."taxes", "public"."orders"."discountAmount", "public"."orders"."totalAmount", "public"."orders"."estimatedPreparationTime", "public"."orders"."estimatedDeliveryTime", "public"."orders"."actualDeliveryTime", "public"."orders"."verificationCode", "public"."orders"."paymentStatus", "public"."orders"."specialInstructions", "public"."orders"."cancelReason", "public"."orders"."createdAt", "public"."orders"."updatedAt", "public"."orders"."deliveryBatchId", "public"."orders"."razorpayOrderId", "public"."orders"."deliveryDistance", "public"."orders"."estimatedDeliveryDuration", "public"."orders"."orderType"::text
prisma:query INSERT INTO "public"."payments" ("id","orderId","razorpayOrderId","amount","currency","status","paymentMethod","createdAt") VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING "public"."payments"."id", "public"."payments"."orderId", "public"."payments"."razorpayOrderId", "public"."payments"."razorpayPaymentId", "public"."payments"."amount", "public"."payments"."currency", "public"."payments"."status", "public"."payments"."paymentMethod", "public"."payments"."failureReason", "public"."payments"."capturedAt", "public"."payments"."createdAt"
 POST /api/payments/create-order 200 in 4371ms


console logs ---

page.tsx:83 Menu item: Dahi Bhalla Chaat dietaryTags: undefined normalized: []
page.tsx:83 Menu item: Dahi Bhalla Chaat dietaryTags: undefined normalized: []
page.tsx:83 Menu item: Dahi Bhalla Chaat dietaryTags: undefined normalized: []
page.tsx:83 Menu item: Dahi Bhalla Chaat dietaryTags: undefined normalized: []
hot-reloader-app.js:197 [Fast Refresh] rebuilding
report-hmr-latency.js:14 [Fast Refresh] done in 452ms
hot-reloader-app.js:197 [Fast Refresh] rebuilding
report-hmr-latency.js:14 [Fast Refresh] done in 607ms
customer-layout.tsx:146  PUT http://localhost:60069/api/client-register 404 (Not Found)
CustomerLayout.useEffect.activityInterval @ customer-layout.tsx:146
setInterval
CustomerLayout.useEffect @ customer-layout.tsx:142
react_stack_bottom_frame @ react-dom-client.development.js:23638
runWithFiberInDEV @ react-dom-client.development.js:873
commitHookEffectListMount @ react-dom-client.development.js:12296
commitHookPassiveMountEffects @ react-dom-client.development.js:12417
reconnectPassiveEffects @ react-dom-client.development.js:14514
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:14485
reconnectPassiveEffects @ react-dom-client.development.js:14507
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:14485
reconnectPassiveEffects @ react-dom-client.development.js:14507
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:14485
reconnectPassiveEffects @ react-dom-client.development.js:14561
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:14485
reconnectPassiveEffects @ react-dom-client.development.js:14561
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:14485
reconnectPassiveEffects @ react-dom-client.development.js:14507
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:14485
reconnectPassiveEffects @ react-dom-client.development.js:14561
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:14485
reconnectPassiveEffects @ react-dom-client.development.js:14507
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:14485
reconnectPassiveEffects @ react-dom-client.development.js:14507
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:14485
reconnectPassiveEffects @ react-dom-client.development.js:14507
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:14485
reconnectPassiveEffects @ react-dom-client.development.js:14507
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:14485
reconnectPassiveEffects @ react-dom-client.development.js:14561
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:14485
reconnectPassiveEffects @ react-dom-client.development.js:14507
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:14485
reconnectPassiveEffects @ react-dom-client.development.js:14507
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:14485
reconnectPassiveEffects @ react-dom-client.development.js:14561
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:14485
reconnectPassiveEffects @ react-dom-client.development.js:14561
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:14485
reconnectPassiveEffects @ react-dom-client.development.js:14507
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:14485
reconnectPassiveEffects @ react-dom-client.development.js:14507
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:14485
reconnectPassiveEffects @ react-dom-client.development.js:14561
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:14485
reconnectPassiveEffects @ react-dom-client.development.js:14561
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:14485
reconnectPassiveEffects @ react-dom-client.development.js:14507
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:14485
reconnectPassiveEffects @ react-dom-client.development.js:14561
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:14485
reconnectPassiveEffects @ react-dom-client.development.js:14507
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:14485
reconnectPassiveEffects @ react-dom-client.development.js:14561
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:14485
reconnectPassiveEffects @ react-dom-client.development.js:14507
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:14485
reconnectPassiveEffects @ react-dom-client.development.js:14507
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:14485
reconnectPassiveEffects @ react-dom-client.development.js:14507
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:14485
reconnectPassiveEffects @ react-dom-client.development.js:14561
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:14485
reconnectPassiveEffects @ react-dom-client.development.js:14507
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:14485
reconnectPassiveEffects @ react-dom-client.development.js:14507
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:14485
reconnectPassiveEffects @ react-dom-client.development.js:14561
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:14485
reconnectPassiveEffects @ react-dom-client.development.js:14561
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:14485
reconnectPassiveEffects @ react-dom-client.development.js:14507
doubleInvokeEffectsOnFiber @ react-dom-client.development.js:16517
runWithFiberInDEV @ react-dom-client.development.js:873
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:16481
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:16487
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:16487
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:16487
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:16487
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:16487
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:16487
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:16487
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:16487
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:16487
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:16487
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:16487
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:16487
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:16487
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:16487
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:16487
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:16487
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:16487
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:16487
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:16487
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:16487
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:16487
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:16487
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:16487
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:16487
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:16487
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:16487
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:16487
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:16487
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:16487
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:16487
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:16487
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:16487
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:16487
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:16487
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:16487
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:16487
commitDoubleInvokeEffectsInDEV @ react-dom-client.development.js:16526
flushPassiveEffects @ react-dom-client.development.js:16299
flushPendingEffects @ react-dom-client.development.js:16250
performSyncWorkOnRoot @ react-dom-client.development.js:16779
flushSyncWorkAcrossRoots_impl @ react-dom-client.development.js:16628
flushSpawnedWork @ react-dom-client.development.js:16225
commitRoot @ react-dom-client.development.js:15949
commitRootWhenReady @ react-dom-client.development.js:15179
performWorkOnRoot @ react-dom-client.development.js:15098
performWorkOnRootViaSchedulerTask @ react-dom-client.development.js:16767
performWorkUntilDeadline @ scheduler.development.js:45
(anonymous) @ content.js:13
d @ content.js:13
f @ content.js:13
<CustomerLayout>
exports.jsxDEV @ react-jsx-dev-runtime.development.js:345
CartPage @ page.tsx:405
react_stack_bottom_frame @ react-dom-client.development.js:23553
renderWithHooksAgain @ react-dom-client.development.js:6864
renderWithHooks @ react-dom-client.development.js:6776
updateFunctionComponent @ react-dom-client.development.js:9070
beginWork @ react-dom-client.development.js:10680
runWithFiberInDEV @ react-dom-client.development.js:873
performUnitOfWork @ react-dom-client.development.js:15678
workLoopConcurrentByScheduler @ react-dom-client.development.js:15672
renderRootConcurrent @ react-dom-client.development.js:15647
performWorkOnRoot @ react-dom-client.development.js:14941
performWorkOnRootViaSchedulerTask @ react-dom-client.development.js:16767
performWorkUntilDeadline @ scheduler.development.js:45
(anonymous) @ content.js:13
d @ content.js:13
f @ content.js:13
<CartPage>
exports.jsx @ react-jsx-runtime.development.js:338
ClientPageRoot @ client-page.js:20
react_stack_bottom_frame @ react-dom-client.development.js:23553
renderWithHooksAgain @ react-dom-client.development.js:6864
renderWithHooks @ react-dom-client.development.js:6776
updateFunctionComponent @ react-dom-client.development.js:9070
beginWork @ react-dom-client.development.js:10629
runWithFiberInDEV @ react-dom-client.development.js:873
performUnitOfWork @ react-dom-client.development.js:15678
workLoopConcurrentByScheduler @ react-dom-client.development.js:15672
renderRootConcurrent @ react-dom-client.development.js:15647
performWorkOnRoot @ react-dom-client.development.js:14941
performWorkOnRootViaSchedulerTask @ react-dom-client.development.js:16767
performWorkUntilDeadline @ scheduler.development.js:45
(anonymous) @ content.js:13
d @ content.js:13
f @ content.js:13
"use client"
initializeElement @ react-server-dom-webpack-client.browser.development.js:1206
wakeChunk @ react-server-dom-webpack-client.browser.development.js:976
fulfillReference @ react-server-dom-webpack-client.browser.development.js:1310
wakeChunk @ react-server-dom-webpack-client.browser.development.js:977
wakeChunkIfInitialized @ react-server-dom-webpack-client.browser.development.js:1012
resolveModuleChunk @ react-server-dom-webpack-client.browser.development.js:1097
eval @ react-server-dom-webpack-client.browser.development.js:1944
"use server"
ResponseInstance @ react-server-dom-webpack-client.browser.development.js:1870
createResponseFromOptions @ react-server-dom-webpack-client.browser.development.js:2858
exports.createFromReadableStream @ react-server-dom-webpack-client.browser.development.js:3228
createFromNextReadableStream @ fetch-server-response.js:217
fetchServerResponse @ fetch-server-response.js:124
await in fetchServerResponse
eval @ prefetch-cache-utils.js:197
task @ promise-queue.js:30
processNext @ promise-queue.js:81
enqueue @ promise-queue.js:45
createLazyPrefetchEntry @ prefetch-cache-utils.js:197
getOrCreatePrefetchCacheEntry @ prefetch-cache-utils.js:144
navigateReducer @ navigate-reducer.js:163
clientReducer @ router-reducer.js:25
action @ app-router-instance.js:156
runAction @ app-router-instance.js:66
dispatchAction @ app-router-instance.js:120
dispatch @ app-router-instance.js:154
eval @ use-action-queue.js:55
startTransition @ react-dom-client.development.js:7939
dispatch @ use-action-queue.js:54
dispatchAppRouterAction @ use-action-queue.js:37
dispatchNavigateAction @ app-router-instance.js:207
eval @ app-router-instance.js:260
exports.startTransition @ react.development.js:1131
push @ app-router-instance.js:258
handleCartClick @ cart-bottom-nav.tsx:54
executeDispatch @ react-dom-client.development.js:16922
runWithFiberInDEV @ react-dom-client.development.js:873
processDispatchQueue @ react-dom-client.development.js:16972
eval @ react-dom-client.development.js:17573
batchedUpdates$1 @ react-dom-client.development.js:3313
dispatchEventForPluginEventSystem @ react-dom-client.development.js:17126
dispatchEvent @ react-dom-client.development.js:21309
dispatchDiscreteEvent @ react-dom-client.development.js:21277
v2-entry-sentry-2e65aebd.modern.js:1  GET https://browser.sentry-cdn.com/7.64.0/bundle.min.js net::ERR_BLOCKED_BY_CONTENT_BLOCKER
_ @ v2-entry-sentry-2e65aebd.modern.js:1
1430 @ v2-entry-sentry-2e65aebd.modern.js:1
i @ v2-entry.modern.js:1
Promise.then
(anonymous) @ v2-entry.modern.js:1
Promise.then
p @ v2-entry.modern.js:1
(anonymous) @ v2-entry.modern.js:1
Promise.finally
u @ v2-entry.modern.js:1
(anonymous) @ v2-entry.modern.js:1
n @ v2-entry.modern.js:1
(anonymous) @ v2-entry.modern.js:1
"serviceworker" must be a dictionary in your web app manifest.
"serviceworker" must be a dictionary in your web app manifest.
"serviceworker" must be a dictionary in your web app manifest.
"serviceworker" must be a dictionary in your web app manifest.
"serviceworker" must be a dictionary in your web app manifest.
"serviceworker" must be a dictionary in your web app manifest.
v2-entry.modern.js:1  POST https://api.razorpay.com/v1/standard_checkout/payments/validate/account?key_id=rzp_test_R5Bt2xIblxWVU2&session_token=3CC89395354FCC198A190B7355E99FD674D824E3F24CB0B85C409F774272F2C0FDF0559BDEB487E1A50F5A704053620F211952278AF9AADDD179096F005EB94271C872DA232A60B053692AD113B04F761528C6749827142C492133945646F6A76F3B368F2D2B9E00 500 (Internal Server Error)
(anonymous) @ v2-entry.modern.js:1
q @ v2-entry.modern.js:1
c @ v2-entry-app-2a241120.modern.js:1
L @ v2-entry-app-2a241120.modern.js:1
O @ v2-entry-84a6a0dd.modern.js:1
(anonymous) @ v2-entry-84a6a0dd.modern.js:1
subscribe @ v2-entry-759e98e8.modern.js:1
ye @ v2-entry-84a6a0dd.modern.js:1
_n @ v2-entry-c9b1556b.modern.js:1
Ie @ v2-entry-84a6a0dd.modern.js:1
ae @ v2-entry-quick-buy-mobile-home-7b9da705.modern.js:1
b @ v2-entry-c9b1556b.modern.js:1
d @ v2-entry-app-2a241120.modern.js:1
b @ v2-entry-c9b1556b.modern.js:1
E @ v2-entry-app-2a241120.modern.js:1
B @ v2-entry-app-2a241120.modern.js:1
o @ v2-entry-c9b1556b.modern.js:1
(anonymous) @ v2-entry-c9b1556b.modern.js:1
Promise.then
ln @ v2-entry-c9b1556b.modern.js:1
C @ v2-entry-app-2a241120.modern.js:1
S @ v2-entry-app-2a241120.modern.js:1
_n @ v2-entry-c9b1556b.modern.js:1
N @ v2-entry-app-2a241120.modern.js:1
f @ v2-entry-app-2a241120.modern.js:1
_n @ v2-entry-c9b1556b.modern.js:1
h @ v2-entry-app-2a241120.modern.js:1
(anonymous) @ v2-entry-quick-buy-mobile-home-7b9da705.modern.js:1
Ce @ v2-entry-quick-buy-mobile-home-7b9da705.modern.js:1
b @ v2-entry-c9b1556b.modern.js:1
m @ v2-entry-app-2a241120.modern.js:1
_n @ v2-entry-c9b1556b.modern.js:1
_ @ v2-entry-app-2a241120.modern.js:1
Le @ v2-entry-quick-buy-mobile-home-7b9da705.modern.js:1
b @ v2-entry-c9b1556b.modern.js:1
R @ v2-entry-cd63cc9d.modern.js:1
b @ v2-entry-c9b1556b.modern.js:1
r @ v2-entry-cd63cc9d.modern.js:1
_n @ v2-entry-c9b1556b.modern.js:1
c @ v2-entry-cd63cc9d.modern.js:1
G @ v2-entry-cd63cc9d.modern.js:1
_n @ v2-entry-c9b1556b.modern.js:1
B @ v2-entry-cd63cc9d.modern.js:1
Te @ v2-entry-quick-buy-mobile-home-7b9da705.modern.js:1
_n @ v2-entry-c9b1556b.modern.js:1
Ne @ v2-entry-quick-buy-mobile-home-7b9da705.modern.js:1
wt @ v2-entry-home-f9765af3.modern.js:1
Yt @ v2-entry-home-f9765af3.modern.js:1
_n @ v2-entry-c9b1556b.modern.js:1
Rt @ v2-entry-home-f9765af3.modern.js:1
vt @ v2-entry-c9b1556b.modern.js:1
l @ v2-entry-app-2a241120.modern.js:1
b @ v2-entry-c9b1556b.modern.js:1
d @ v2-entry-app-2a241120.modern.js:1
b @ v2-entry-c9b1556b.modern.js:1
w @ v2-entry-app-2a241120.modern.js:1
k @ v2-entry-app-2a241120.modern.js:1
S @ v2-entry-app-2a241120.modern.js:1
_n @ v2-entry-c9b1556b.modern.js:1
N @ v2-entry-app-2a241120.modern.js:1
f @ v2-entry-app-2a241120.modern.js:1
_n @ v2-entry-c9b1556b.modern.js:1
h @ v2-entry-app-2a241120.modern.js:1
u @ v2-entry-app-2a241120.modern.js:1
_n @ v2-entry-c9b1556b.modern.js:1
p @ v2-entry-app-2a241120.modern.js:1
h @ v2-entry-app-2a241120.modern.js:1
v @ v2-entry-app-2a241120.modern.js:1
_n @ v2-entry-c9b1556b.modern.js:1
b @ v2-entry-app-2a241120.modern.js:1
q @ v2-entry-app-2a241120.modern.js:1
b @ v2-entry-c9b1556b.modern.js:1
P @ v2-entry-app-2a241120.modern.js:1
B @ v2-entry-app-2a241120.modern.js:1
o @ v2-entry-c9b1556b.modern.js:1
(anonymous) @ v2-entry-c9b1556b.modern.js:1
Promise.then
ln @ v2-entry-c9b1556b.modern.js:1
C @ v2-entry-app-2a241120.modern.js:1
S @ v2-entry-app-2a241120.modern.js:1
_n @ v2-entry-c9b1556b.modern.js:1
N @ v2-entry-app-2a241120.modern.js:1
ie @ v2-entry-app-2a241120.modern.js:1
_n @ v2-entry-c9b1556b.modern.js:1
le @ v2-entry-app-2a241120.modern.js:1
Bn @ v2-entry-app-2a241120.modern.js:1
b @ v2-entry-c9b1556b.modern.js:1
Wt @ v2-entry-app-2a241120.modern.js:1
_n @ v2-entry-c9b1556b.modern.js:1
en @ v2-entry-app-2a241120.modern.js:1
gn @ v2-entry-app-2a241120.modern.js:1
Tn @ v2-entry-app-2a241120.modern.js:1
Mn @ v2-entry-app-2a241120.modern.js:1
_n @ v2-entry-c9b1556b.modern.js:1
Yn @ v2-entry-app-2a241120.modern.js:1
(anonymous) @ v2-entry-app-2a241120.modern.js:1
Promise.then
h @ v2-entry-app-2a241120.modern.js:1
(anonymous) @ v2-entry.modern.js:1
Promise.then
p @ v2-entry.modern.js:1
(anonymous) @ v2-entry.modern.js:1
Promise.finally
u @ v2-entry.modern.js:1
(anonymous) @ v2-entry.modern.js:1
n @ v2-entry.modern.js:1
(anonymous) @ v2-entry.modern.js:1
v2-entry.modern.js:1  POST https://api.razorpay.com/v1/standard_checkout/payments/validate/account?key_id=rzp_test_R5Bt2xIblxWVU2&session_token=3CC89395354FCC198A190B7355E99FD674D824E3F24CB0B85C409F774272F2C0FDF0559BDEB487E1A50F5A704053620F211952278AF9AADDD179096F005EB94271C872DA232A60B053692AD113B04F761528C6749827142C492133945646F6A76F3B368F2D2B9E00 500 (Internal Server Error)
(anonymous) @ v2-entry.modern.js:1
q @ v2-entry.modern.js:1
c @ v2-entry-app-2a241120.modern.js:1
L @ v2-entry-app-2a241120.modern.js:1
O @ v2-entry-84a6a0dd.modern.js:1
(anonymous) @ v2-entry-84a6a0dd.modern.js:1
i @ v2-entry-759e98e8.modern.js:1
w @ v2-entry-app-2a241120.modern.js:1
await in w
p @ v2-entry-app-2a241120.modern.js:1
Fn @ v2-entry-app-2a241120.modern.js:1
_n @ v2-entry-c9b1556b.modern.js:1
Yn @ v2-entry-app-2a241120.modern.js:1
(anonymous) @ v2-entry-app-2a241120.modern.js:1
Promise.then
h @ v2-entry-app-2a241120.modern.js:1
(anonymous) @ v2-entry.modern.js:1
Promise.then
p @ v2-entry.modern.js:1
(anonymous) @ v2-entry.modern.js:1
Promise.finally
u @ v2-entry.modern.js:1
(anonymous) @ v2-entry.modern.js:1
n @ v2-entry.modern.js:1
(anonymous) @ v2-entry.modern.js:1
customer-layout.tsx:146  PUT http://localhost:60069/api/client-register 404 (Not Found)
CustomerLayout.useEffect.activityInterval @ customer-layout.tsx:146
setInterval
CustomerLayout.useEffect @ customer-layout.tsx:142
react_stack_bottom_frame @ react-dom-client.development.js:23638
runWithFiberInDEV @ react-dom-client.development.js:873
commitHookEffectListMount @ react-dom-client.development.js:12296
commitHookPassiveMountEffects @ react-dom-client.development.js:12417
reconnectPassiveEffects @ react-dom-client.development.js:14514
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:14485
reconnectPassiveEffects @ react-dom-client.development.js:14507
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:14485
reconnectPassiveEffects @ react-dom-client.development.js:14507
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:14485
reconnectPassiveEffects @ react-dom-client.development.js:14561
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:14485
reconnectPassiveEffects @ react-dom-client.development.js:14561
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:14485
reconnectPassiveEffects @ react-dom-client.development.js:14507
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:14485
reconnectPassiveEffects @ react-dom-client.development.js:14561
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:14485
reconnectPassiveEffects @ react-dom-client.development.js:14507
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:14485
reconnectPassiveEffects @ react-dom-client.development.js:14507
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:14485
reconnectPassiveEffects @ react-dom-client.development.js:14507
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:14485
reconnectPassiveEffects @ react-dom-client.development.js:14507
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:14485
reconnectPassiveEffects @ react-dom-client.development.js:14561
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:14485
reconnectPassiveEffects @ react-dom-client.development.js:14507
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:14485
reconnectPassiveEffects @ react-dom-client.development.js:14507
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:14485
reconnectPassiveEffects @ react-dom-client.development.js:14561
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:14485
reconnectPassiveEffects @ react-dom-client.development.js:14561
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:14485
reconnectPassiveEffects @ react-dom-client.development.js:14507
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:14485
reconnectPassiveEffects @ react-dom-client.development.js:14507
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:14485
reconnectPassiveEffects @ react-dom-client.development.js:14561
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:14485
reconnectPassiveEffects @ react-dom-client.development.js:14561
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:14485
reconnectPassiveEffects @ react-dom-client.development.js:14507
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:14485
reconnectPassiveEffects @ react-dom-client.development.js:14561
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:14485
reconnectPassiveEffects @ react-dom-client.development.js:14507
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:14485
reconnectPassiveEffects @ react-dom-client.development.js:14561
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:14485
reconnectPassiveEffects @ react-dom-client.development.js:14507
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:14485
reconnectPassiveEffects @ react-dom-client.development.js:14507
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:14485
reconnectPassiveEffects @ react-dom-client.development.js:14507
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:14485
reconnectPassiveEffects @ react-dom-client.development.js:14561
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:14485
reconnectPassiveEffects @ react-dom-client.development.js:14507
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:14485
reconnectPassiveEffects @ react-dom-client.development.js:14507
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:14485
reconnectPassiveEffects @ react-dom-client.development.js:14561
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:14485
reconnectPassiveEffects @ react-dom-client.development.js:14561
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:14485
reconnectPassiveEffects @ react-dom-client.development.js:14507
doubleInvokeEffectsOnFiber @ react-dom-client.development.js:16517
runWithFiberInDEV @ react-dom-client.development.js:873
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:16481
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:16487
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:16487
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:16487
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:16487
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:16487
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:16487
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:16487
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:16487
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:16487
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:16487
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:16487
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:16487
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:16487
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:16487
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:16487
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:16487
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:16487
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:16487
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:16487
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:16487
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:16487
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:16487
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:16487
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:16487
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:16487
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:16487
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:16487
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:16487
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:16487
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:16487
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:16487
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:16487
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:16487
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:16487
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:16487
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:16487
commitDoubleInvokeEffectsInDEV @ react-dom-client.development.js:16526
flushPassiveEffects @ react-dom-client.development.js:16299
flushPendingEffects @ react-dom-client.development.js:16250
performSyncWorkOnRoot @ react-dom-client.development.js:16779
flushSyncWorkAcrossRoots_impl @ react-dom-client.development.js:16628
flushSpawnedWork @ react-dom-client.development.js:16225
commitRoot @ react-dom-client.development.js:15949
commitRootWhenReady @ react-dom-client.development.js:15179
performWorkOnRoot @ react-dom-client.development.js:15098
performWorkOnRootViaSchedulerTask @ react-dom-client.development.js:16767
performWorkUntilDeadline @ scheduler.development.js:45
(anonymous) @ content.js:13
d @ content.js:13
f @ content.js:13
<CustomerLayout>
exports.jsxDEV @ react-jsx-dev-runtime.development.js:345
CartPage @ page.tsx:405
react_stack_bottom_frame @ react-dom-client.development.js:23553
renderWithHooksAgain @ react-dom-client.development.js:6864
renderWithHooks @ react-dom-client.development.js:6776
updateFunctionComponent @ react-dom-client.development.js:9070
beginWork @ react-dom-client.development.js:10680
runWithFiberInDEV @ react-dom-client.development.js:873
performUnitOfWork @ react-dom-client.development.js:15678
workLoopConcurrentByScheduler @ react-dom-client.development.js:15672
renderRootConcurrent @ react-dom-client.development.js:15647
performWorkOnRoot @ react-dom-client.development.js:14941
performWorkOnRootViaSchedulerTask @ react-dom-client.development.js:16767
performWorkUntilDeadline @ scheduler.development.js:45
(anonymous) @ content.js:13
d @ content.js:13
f @ content.js:13
<CartPage>
exports.jsx @ react-jsx-runtime.development.js:338
ClientPageRoot @ client-page.js:20
react_stack_bottom_frame @ react-dom-client.development.js:23553
renderWithHooksAgain @ react-dom-client.development.js:6864
renderWithHooks @ react-dom-client.development.js:6776
updateFunctionComponent @ react-dom-client.development.js:9070
beginWork @ react-dom-client.development.js:10629
runWithFiberInDEV @ react-dom-client.development.js:873
performUnitOfWork @ react-dom-client.development.js:15678
workLoopConcurrentByScheduler @ react-dom-client.development.js:15672
renderRootConcurrent @ react-dom-client.development.js:15647
performWorkOnRoot @ react-dom-client.development.js:14941
performWorkOnRootViaSchedulerTask @ react-dom-client.development.js:16767
performWorkUntilDeadline @ scheduler.development.js:45
(anonymous) @ content.js:13
d @ content.js:13
f @ content.js:13
"use client"
initializeElement @ react-server-dom-webpack-client.browser.development.js:1206
wakeChunk @ react-server-dom-webpack-client.browser.development.js:976
fulfillReference @ react-server-dom-webpack-client.browser.development.js:1310
wakeChunk @ react-server-dom-webpack-client.browser.development.js:977
wakeChunkIfInitialized @ react-server-dom-webpack-client.browser.development.js:1012
resolveModuleChunk @ react-server-dom-webpack-client.browser.development.js:1097
eval @ react-server-dom-webpack-client.browser.development.js:1944
"use server"
ResponseInstance @ react-server-dom-webpack-client.browser.development.js:1870
createResponseFromOptions @ react-server-dom-webpack-client.browser.development.js:2858
exports.createFromReadableStream @ react-server-dom-webpack-client.browser.development.js:3228
createFromNextReadableStream @ fetch-server-response.js:217
fetchServerResponse @ fetch-server-response.js:124
await in fetchServerResponse
eval @ prefetch-cache-utils.js:197
task @ promise-queue.js:30
processNext @ promise-queue.js:81
enqueue @ promise-queue.js:45
createLazyPrefetchEntry @ prefetch-cache-utils.js:197
getOrCreatePrefetchCacheEntry @ prefetch-cache-utils.js:144
navigateReducer @ navigate-reducer.js:163
clientReducer @ router-reducer.js:25
action @ app-router-instance.js:156
runAction @ app-router-instance.js:66
dispatchAction @ app-router-instance.js:120
dispatch @ app-router-instance.js:154
eval @ use-action-queue.js:55
startTransition @ react-dom-client.development.js:7939
dispatch @ use-action-queue.js:54
dispatchAppRouterAction @ use-action-queue.js:37
dispatchNavigateAction @ app-router-instance.js:207
eval @ app-router-instance.js:260
exports.startTransition @ react.development.js:1131
push @ app-router-instance.js:258
handleCartClick @ cart-bottom-nav.tsx:54
executeDispatch @ react-dom-client.development.js:16922
runWithFiberInDEV @ react-dom-client.development.js:873
processDispatchQueue @ react-dom-client.development.js:16972
eval @ react-dom-client.development.js:17573
batchedUpdates$1 @ react-dom-client.development.js:3313
dispatchEventForPluginEventSystem @ react-dom-client.development.js:17126
dispatchEvent @ react-dom-client.development.js:21309
dispatchDiscreteEvent @ react-dom-client.development.js:21277
hot-reloader-app.js:197 [Fast Refresh] rebuilding
report-hmr-latency.js:14 [Fast Refresh] done in 1232ms
page.tsx:83 Menu item: Dahi Bhalla Chaat dietaryTags: undefined normalized: []
page.tsx:83 Menu item: Dahi Bhalla Chaat dietaryTags: undefined normalized: []
hot-reloader-app.js:197 [Fast Refresh] rebuilding
report-hmr-latency.js:14 [Fast Refresh] done in 479ms
page.tsx:83 Menu item: Dahi Bhalla Chaat dietaryTags: undefined normalized: []
page.tsx:83 Menu item: Dahi Bhalla Chaat dietaryTags: undefined normalized: []
hot-reloader-app.js:197 [Fast Refresh] rebuilding
report-hmr-latency.js:14 [Fast Refresh] done in 372ms
page.tsx:83 Menu item: Dahi Bhalla Chaat dietaryTags: undefined normalized: []
page.tsx:83 Menu item: Dahi Bhalla Chaat dietaryTags: undefined normalized: []
