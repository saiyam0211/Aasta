import { PrismaClient, UserRole } from '@prisma/client';

const prisma = new PrismaClient({
  log: ['warn', 'error'],
});

// Configuration — tweak with env if needed
const RESTAURANT_COUNT = Number(process.env.SEED_RESTAURANTS ?? 45); // 40–50
const CUSTOMERS_COUNT = Number(process.env.SEED_CUSTOMERS ?? 150);    // 100–200
const DELIVERY_PARTNERS_COUNT = Number(process.env.SEED_PARTNERS ?? 40);
const MIN_ITEMS_PER_RESTAURANT = 10; // 10–15
const MAX_ITEMS_PER_RESTAURANT = 15;

// Simple random utilities
const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const sample = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const uniquePhone = (i: number) => `+91${(9000000000 + i).toString()}`; // deterministic unique phones

// Location centroids around Bengaluru
const locationCenters: Record<string, { lat: number; lng: number; address: string }[]> = {
  Koramangala: [
    { lat: 12.9352, lng: 77.6245, address: 'Koramangala, Bengaluru 560034' },
  ],
  Indiranagar: [
    { lat: 12.9716, lng: 77.6400, address: 'Indiranagar, Bengaluru 560038' },
  ],
  Whitefield: [
    { lat: 12.9698, lng: 77.7499, address: 'Whitefield, Bengaluru 560066' },
  ],
  'HSR Layout': [
    { lat: 12.9121, lng: 77.6446, address: 'HSR Layout, Bengaluru 560102' },
  ],
  'BTM Layout': [
    { lat: 12.9166, lng: 77.6101, address: 'BTM Layout, Bengaluru 560076' },
  ],
  Marathahalli: [
    { lat: 12.9558, lng: 77.7019, address: 'Marathahalli, Bengaluru 560037' },
  ],
  'Electronic City': [
    { lat: 12.8390, lng: 77.6770, address: 'Electronic City, Bengaluru 560100' },
  ],
};

const defaultLocations = Object.keys(locationCenters);

const cuisines = [
  'North Indian',
  'South Indian',
  'Chinese',
  'Italian',
  'Pizza',
  'Biryani',
  'Fast Food',
  'Rolls',
  'Beverages',
  'Desserts',
];

const restaurantNamesLeft = [
  'Spice',
  'Midnight',
  'Urban',
  'Royal',
  'Fusion',
  'Garden',
  'Street',
  'Green',
  'Golden',
  'Crispy',
  'Flame',
  'Hot',
];
const restaurantNamesRight = [
  'Bites',
  'Kitchen',
  'Corner',
  'Treats',
  'Delight',
  'House',
  'Hub',
  'Point',
  'Oven',
  'Curry',
  'Grill',
  'Platter',
];

const firstNames = ['Aarav', 'Vihaan', 'Ishan', 'Anaya', 'Diya', 'Kabir', 'Advait', 'Rhea', 'Aditi', 'Rohan', 'Riya', 'Neha', 'Kunal', 'Maya', 'Arjun', 'Ira', 'Meera', 'Nikhil', 'Saanvi', 'Anushka'];
const lastNames = ['Sharma', 'Verma', 'Gupta', 'Iyer', 'Menon', 'Reddy', 'Patel', 'Rao', 'Khan', 'Kapoor', 'Mehta', 'Agarwal', 'Singh'];

const dishBank: Record<string, string[]> = {
  'North Indian': ['Paneer Butter Masala', 'Dal Makhani', 'Butter Chicken', 'Aloo Paratha', 'Chole Bhature', 'Kadhai Paneer', 'Tandoori Chicken', 'Rajma Chawal'],
  'South Indian': ['Masala Dosa', 'Idli Sambar', 'Medu Vada', 'Curd Rice', 'Lemon Rice', 'Pongal', 'Ghee Roast Dosa'],
  Chinese: ['Veg Hakka Noodles', 'Chicken Manchurian', 'Chilli Paneer', 'Fried Rice', 'Spring Rolls', 'Schezwan Noodles'],
  Italian: ['Penne Arrabbiata', 'Pesto Pasta', 'Alfredo Pasta', 'Bruschetta', 'Tiramisu'],
  Pizza: ['Margherita Pizza', 'Farmhouse Pizza', 'Pepperoni Pizza', 'BBQ Chicken Pizza', 'Veggie Delight Pizza'],
  Biryani: ['Veg Biryani', 'Chicken Biryani', 'Mutton Biryani', 'Egg Biryani', 'Hyderabadi Biryani'],
  'Fast Food': ['Crispy Burger', 'Chicken Burger', 'Veggie Burger', 'French Fries', 'Cheese Sandwich', 'Grilled Sandwich'],
  Rolls: ['Paneer Kathi Roll', 'Chicken Kathi Roll', 'Veg Roll', 'Egg Roll', 'Cheese Roll'],
  Beverages: ['Fresh Lime Soda', 'Cold Coffee', 'Masala Chai', 'Iced Tea', 'Sweet Lassi', 'Mango Smoothie'],
  Desserts: ['Gulab Jamun', 'Brownie', 'Cheesecake', 'Ice Cream Sundae', 'Rasgulla', 'Kulfi'],
};

function randomName() {
  return `${sample(firstNames)} ${sample(lastNames)}`;
}

function randomRestaurantName() {
  return `${sample(restaurantNamesLeft)} ${sample(restaurantNamesRight)}`;
}

function operatingHoursJSON() {
  return {
    monday: { open: '21:00', close: '00:00', isOpen: true },
    tuesday: { open: '21:00', close: '00:00', isOpen: true },
    wednesday: { open: '21:00', close: '00:00', isOpen: true },
    thursday: { open: '21:00', close: '00:00', isOpen: true },
    friday: { open: '21:00', close: '01:00', isOpen: true },
    saturday: { open: '21:00', close: '01:00', isOpen: true },
    sunday: { open: '21:00', close: '00:00', isOpen: true },
  } as any;
}

function jitter(v: number, delta = 0.02) {
  return v + (Math.random() - 0.5) * delta; // ~2km jitter
}

async function ensureLocations() {
  const created: Record<string, string> = {};
  for (const name of defaultLocations) {
    const existing = await prisma.location.findUnique({ where: { name } });
    if (existing) {
      created[name] = existing.id;
      continue;
    }
    const loc = await prisma.location.create({
      data: {
        name,
        city: 'Bengaluru',
        state: 'Karnataka',
        country: 'India',
        isActive: true,
      },
    });
    created[name] = loc.id;
  }
  return created;
}

async function seedOwnersAndRestaurants(locationIdByName: Record<string, string>) {
  const restaurants: { id: string; name: string }[] = [];
  for (let i = 0; i < RESTAURANT_COUNT; i++) {
    const owner = await prisma.user.create({
      data: {
        email: `perf-owner-${i}@aasta.dev`,
        name: randomName(),
        phone: uniquePhone(10000 + i),
        role: UserRole.RESTAURANT_OWNER,
      },
    });

    const locName = sample(defaultLocations);
    const centroid = sample(locationCenters[locName]);
    const lat = jitter(centroid.lat, 0.03);
    const lng = jitter(centroid.lng, 0.03);

    const restaurant = await prisma.restaurant.create({
      data: {
        name: randomRestaurantName(),
        ownerName: randomName(),
        ownerId: owner.id,
        locationId: locationIdByName[locName],
        latitude: lat,
        longitude: lng,
        address: centroid.address,
        phone: uniquePhone(20000 + i),
        email: `orders-${i}@aasta.dev`,
        imageUrl: `https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=800&q=60`,
        cuisineTypes: Array.from(new Set([sample(cuisines), sample(cuisines)])).slice(0, 2),
        averagePreparationTime: rand(15, 30),
        minimumOrderAmount: rand(150, 300),
        deliveryRadius: rand(3, 6),
        commissionRate: 0.15,
        rating: Math.round((Math.random() * 1.5 + 3.5) * 10) / 10,
        totalOrders: rand(50, 1200),
        status: 'ACTIVE',
        operatingHours: operatingHoursJSON(),
        assignedDeliveryPartners: [],
      },
      select: { id: true, name: true },
    });
    restaurants.push(restaurant);
  }
  return restaurants;
}

function buildMenuItems(restaurantId: string) {
  const itemsCount = rand(MIN_ITEMS_PER_RESTAURANT, MAX_ITEMS_PER_RESTAURANT);
  const items: any[] = [];
  for (let i = 0; i < itemsCount; i++) {
    const category = sample(cuisines);
    const bank = dishBank[category] ?? dishBank['North Indian'];
    const dish = sample(bank);
    const price = rand(80, 450);
    const originalPrice = Math.random() > 0.5 ? price + rand(10, 60) : null;
    items.push({
      restaurantId,
      name: dish,
      description: `${dish} prepared fresh with quality ingredients` ,
      price,
      originalPrice: originalPrice ?? undefined,
      category,
      preparationTime: rand(10, 25),
      imageUrl: `https://source.unsplash.com/featured/400x300/?${encodeURIComponent(dish)}`,
      dietaryTags: [],
      spiceLevel: sample(['Mild', 'Medium', 'Hot']),
      available: true,
      featured: Math.random() > 0.7,
      stockLeft: Math.random() > 0.6 ? rand(10, 80) : null,
      rating: Math.round((Math.random() * 1.5 + 3.5) * 10) / 10,
      ratingCount: rand(0, 500),
    });
  }
  return items;
}

async function seedMenuItems(restaurants: { id: string }[]) {
  for (const r of restaurants) {
    const items = buildMenuItems(r.id);
    await prisma.menuItem.createMany({ data: items });
  }
}

async function seedCustomers() {
  for (let i = 0; i < CUSTOMERS_COUNT; i++) {
    const user = await prisma.user.create({
      data: {
        email: `perf-customer-${i}@aasta.dev`,
        name: randomName(),
        phone: uniquePhone(30000 + i),
        role: UserRole.CUSTOMER,
        customer: {
          create: { favoriteRestaurants: [] },
        },
      },
      select: { id: true },
    });

    if (Math.random() > 0.35) {
      const locName = sample(defaultLocations);
      const centroid = sample(locationCenters[locName]);
      await prisma.address.create({
        data: {
          customer: { connect: { userId: user.id } },
          type: 'HOME',
          street: centroid.address,
          city: 'Bengaluru',
          state: 'Karnataka',
          zipCode: '560001',
          latitude: jitter(centroid.lat, 0.02),
          longitude: jitter(centroid.lng, 0.02),
          isDefault: true,
        },
      });
    }
  }
}

async function seedDeliveryPartners() {
  for (let i = 0; i < DELIVERY_PARTNERS_COUNT; i++) {
    await prisma.user.create({
      data: {
        email: `perf-dp-${i}@aasta.dev`,
        name: randomName(),
        phone: uniquePhone(40000 + i),
        role: UserRole.DELIVERY_PARTNER,
        deliveryPartner: {
          create: {
            assignedRestaurants: [],
            status: 'OFFLINE',
            todayEarnings: 0,
            totalEarnings: 0,
            rating: Math.round((Math.random() * 1.0 + 3.5) * 10) / 10,
            ratingCount: rand(0, 200),
            completedDeliveries: rand(0, 500),
          },
        },
      },
    });
  }
}

async function main() {
  console.log('🌱 Starting performance seed...');
  console.log(`Plan → Restaurants: ${RESTAURANT_COUNT}, Customers: ${CUSTOMERS_COUNT}, Partners: ${DELIVERY_PARTNERS_COUNT}`);

  const locationIdByName = await ensureLocations();

  // Seed owners + restaurants
  const restaurants = await seedOwnersAndRestaurants(locationIdByName);
  console.log(`✅ Created ${restaurants.length} restaurants`);

  // Seed menu items per restaurant
  await seedMenuItems(restaurants);
  console.log('✅ Added menu items for all restaurants');

  // Seed customers with addresses
  await seedCustomers();
  console.log(`✅ Created ${CUSTOMERS_COUNT} customers (+addresses)`);

  // Seed delivery partners
  await seedDeliveryPartners();
  console.log(`✅ Created ${DELIVERY_PARTNERS_COUNT} delivery partners`);

  console.log('🎯 Seed complete. You can now run performance tests against this dataset.');
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (e) => {
    console.error('❌ Error during performance seed', e);
    await prisma.$disconnect();
    process.exit(1);
  }); 