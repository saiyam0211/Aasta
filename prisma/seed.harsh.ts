import { PrismaClient, UserRole } from '@prisma/client';

const prisma = new PrismaClient({ log: ['warn', 'error'] });

// ⚡ Scalable test dataset sizes
const RESTAURANT_COUNT = Number(process.env.SEED_RESTAURANTS ?? 500);
const CUSTOMERS_COUNT = Number(process.env.SEED_CUSTOMERS ?? 10000);
const DELIVERY_PARTNERS_COUNT = Number(process.env.SEED_PARTNERS ?? 1000);
const MIN_ITEMS_PER_RESTAURANT = 20;
const MAX_ITEMS_PER_RESTAURANT = 50;

// Utilities
const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const sample = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const uniquePhone = (prefix: string, i: number) => `+91${prefix}${i.toString().padStart(6, '0')}`;

function harshString(len = 500) {
  const safeChars = [
    "🔥", "💥", "💣", "⚡", "✨", "🚀", "💀",
    "A", "B", "C", "D", "E", "F", "G", "H",
  ];
  let out = "";
  for (let i = 0; i < len; i++) {
    out += sample(safeChars);
  }
  return out;
}

function malformedJSON() {
  return Math.random() > 0.5 ? { open: "99:99", close: null } : ({} as any);
}

// Locations (unchanged)
const locationCenters = {
  Koramangala: [{ lat: 12.9352, lng: 77.6245, address: 'Koramangala, Bengaluru 560034' }],
  Indiranagar: [{ lat: 12.9716, lng: 77.6400, address: 'Indiranagar, Bengaluru 560038' }],
  Whitefield: [{ lat: 12.9698, lng: 77.7499, address: 'Whitefield, Bengaluru 560066' }],
  HSR: [{ lat: 12.9121, lng: 77.6446, address: 'HSR Layout, Bengaluru 560102' }],
};
const defaultLocations = Object.keys(locationCenters);

function jitter(v: number, delta = 0.05) {
  return v + (Math.random() - 0.5) * delta;
}

async function ensureLocations() {
  const created: Record<string, string> = {};
  for (const name of defaultLocations) {
    const existing = await prisma.location.findUnique({ where: { name } });
    if (existing) {
      created[name] = existing.id;
    } else {
      const loc = await prisma.location.create({
        data: { name, city: 'Bengaluru', state: 'Karnataka', country: 'India', isActive: true },
      });
      created[name] = loc.id;
    }
  }
  return created;
}

// Restaurants + Owners
async function seedOwnersAndRestaurants(locationIdByName: Record<string, string>) {
  const restaurants: { id: string }[] = [];
  for (let i = 0; i < RESTAURANT_COUNT; i++) {
    const owner = await prisma.user.create({
      data: {
        email: `owner-${i}-${Date.now()}-${Math.floor(Math.random() * 100000)}@test.com`,
        name: harshString(50),
        phone: uniquePhone("1", i),
        role: UserRole.RESTAURANT_OWNER,
      },
    });

    const locName = sample(defaultLocations);
    const centroid = sample(locationCenters[locName]);
    const restaurant = await prisma.restaurant.create({
      data: {
        name: harshString(30),
        ownerName: harshString(20),
        ownerId: owner.id,
        locationId: locationIdByName[locName],
        latitude: jitter(centroid.lat),
        longitude: jitter(centroid.lng),
        address: centroid.address + harshString(20),
        phone: uniquePhone("2", i),
        email: `orders-${i}-${Date.now()}-${Math.floor(Math.random() * 100000)}@test.com`,
        cuisineTypes: ["Test", "🔥"],
        averagePreparationTime: rand(1, 999),
        minimumOrderAmount: rand(1, 1000000),
        deliveryRadius: rand(1, 50),
        commissionRate: Math.random(),
        rating: Math.random() * 10,
        totalOrders: rand(0, 1000000),
        status: 'ACTIVE',
        operatingHours: malformedJSON(),
      },
      select: { id: true },
    });
    restaurants.push(restaurant);
  }
  return restaurants;
}

// Menu Items
function buildMenuItems(restaurantId: string) {
  const items: any[] = [];
  const itemsCount = rand(MIN_ITEMS_PER_RESTAURANT, MAX_ITEMS_PER_RESTAURANT);
  for (let i = 0; i < itemsCount; i++) {
    items.push({
      restaurantId,
      name: harshString(30),
      description: harshString(2000),
      price: rand(1, 1000000),
      originalPrice: rand(1, 2000000),
      category: "StressTest",
      preparationTime: rand(1, 999),
      imageUrl: `https://picsum.photos/seed/${Math.random()}/400/300`,
      spiceLevel: sample(['Mild', 'Medium', 'Hot', '🔥🔥🔥']),
      available: Math.random() > 0.3,
      featured: Math.random() > 0.8,
      stockLeft: Math.random() > 0.5 ? rand(0, 1000000) : null,
      rating: Math.random() * 10,
      ratingCount: rand(0, 1000000),
    });
  }
  return items;
}

async function seedMenuItems(restaurants: { id: string }[]) {
  for (const r of restaurants) {
    const items = buildMenuItems(r.id);
    await prisma.menuItem.createMany({ data: items, skipDuplicates: true });
  }
}

// Customers
async function seedCustomers() {
  const batch: any[] = [];
  for (let i = 0; i < CUSTOMERS_COUNT; i++) {
    batch.push({
      email: `customer-${i}-${Date.now()}-${Math.floor(Math.random() * 100000)}@test.com`,
      name: harshString(40),
      phone: uniquePhone("3", i),
      role: UserRole.CUSTOMER,
    });
    if (batch.length >= 1000) {
      await prisma.user.createMany({ data: batch, skipDuplicates: true });
      batch.length = 0;
    }
  }
  if (batch.length > 0) await prisma.user.createMany({ data: batch, skipDuplicates: true });
}

// Delivery Partners
async function seedDeliveryPartners() {
  const batch: any[] = [];
  for (let i = 0; i < DELIVERY_PARTNERS_COUNT; i++) {
    batch.push({
      email: `dp-${i}-${Date.now()}-${Math.floor(Math.random() * 100000)}@test.com`,
      name: harshString(30),
      phone: uniquePhone("4", i),
      role: UserRole.DELIVERY_PARTNER,
    });
    if (batch.length >= 1000) {
      await prisma.user.createMany({ data: batch, skipDuplicates: true });
      batch.length = 0;
    }
  }
  if (batch.length > 0) await prisma.user.createMany({ data: batch, skipDuplicates: true });
}

// Main
async function main() {
  console.log('🌱 Starting HARSH performance seed...');
  console.log(`Restaurants: ${RESTAURANT_COUNT}, Customers: ${CUSTOMERS_COUNT}, Partners: ${DELIVERY_PARTNERS_COUNT}`);

  const locationIdByName = await ensureLocations();
  const restaurants = await seedOwnersAndRestaurants(locationIdByName);
  console.log(`✅ Created ${restaurants.length} restaurants`);

  await seedMenuItems(restaurants);
  console.log('✅ Added menu items');

  await seedCustomers();
  console.log(`✅ Created ${CUSTOMERS_COUNT} customers`);

  await seedDeliveryPartners();
  console.log(`✅ Created ${DELIVERY_PARTNERS_COUNT} delivery partners`);

  console.log('🎯 HARSH Seed complete. Ready for stress testing!');
}

main().then(() => prisma.$disconnect()).catch(async (e) => {
  console.error('❌ Error during HARSH seed', e);
  await prisma.$disconnect();
  process.exit(1);
});
