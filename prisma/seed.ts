import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  // Create sample users
  const customer1 = await prisma.user.upsert({
    where: { email: 'customer@test.com' },
    update: {},
    create: {
      email: 'customer@test.com',
      name: 'John Customer',
      role: 'CUSTOMER',
      customer: {
        create: {
          favoriteRestaurants: [],
        }
      }
    },
  })

  const restaurantOwner1 = await prisma.user.upsert({
    where: { email: 'restaurant1@test.com' },
    update: {},
    create: {
      email: 'restaurant1@test.com',
      name: 'Restaurant Owner 1',
      role: 'RESTAURANT_OWNER',
    },
  })

  const restaurantOwner2 = await prisma.user.upsert({
    where: { email: 'restaurant2@test.com' },
    update: {},
    create: {
      email: 'restaurant2@test.com',
      name: 'Restaurant Owner 2',
      role: 'RESTAURANT_OWNER',
    },
  })

  const deliveryPartner1 = await prisma.user.upsert({
    where: { email: 'delivery@test.com' },
    update: {},
    create: {
      email: 'delivery@test.com',
      name: 'Delivery Partner',
      role: 'DELIVERY_PARTNER',
      deliveryPartner: {
        create: {
          assignedRestaurants: [],
          status: 'OFFLINE',
          todayEarnings: 0,
          totalEarnings: 0,
          rating: 4.5,
          completedDeliveries: 0,
        }
      }
    },
  })

  // Create sample restaurants
  const restaurant1 = await prisma.restaurant.upsert({
    where: { ownerId: restaurantOwner1.id },
    update: {},
    create: {
      name: 'Midnight Bites',
      ownerName: 'Rajesh Kumar',
      ownerId: restaurantOwner1.id,
      latitude: 28.6139,
      longitude: 77.2090,
      address: '123 Food Street, Koramangala, Bengaluru - 560034',
      phone: '+91-9876543210',
      email: 'orders@midnightbites.com',
      imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400',
      cuisineTypes: ['North Indian', 'Mughlai', 'Biryani'],
      averagePreparationTime: 25,
      minimumOrderAmount: 200,
      deliveryRadius: 5,
      commissionRate: 0.15,
      rating: 4.5,
      totalOrders: 156,
      status: 'ACTIVE',
      operatingHours: {
        monday: { open: '21:00', close: '00:00', isOpen: true },
        tuesday: { open: '21:00', close: '00:00', isOpen: true },
        wednesday: { open: '21:00', close: '00:00', isOpen: true },
        thursday: { open: '21:00', close: '00:00', isOpen: true },
        friday: { open: '21:00', close: '01:00', isOpen: true },
        saturday: { open: '21:00', close: '01:00', isOpen: true },
        sunday: { open: '21:00', close: '00:00', isOpen: true },
      },
      assignedDeliveryPartners: deliveryPartner1.deliveryPartner ? [deliveryPartner1.deliveryPartner.id] : [],
    },
  })

  const restaurant2 = await prisma.restaurant.upsert({
    where: { ownerId: restaurantOwner2.id },
    update: {},
    create: {
      name: 'Night Owl Pizza',
      ownerName: 'Maria Gonzalez',
      ownerId: restaurantOwner2.id,
      latitude: 28.6304,
      longitude: 77.2177,
      address: '456 Pizza Lane, Whitefield, Bengaluru - 560066',
      phone: '+91-9876543211',
      email: 'orders@nightowlpizza.com',
      imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400',
      cuisineTypes: ['Italian', 'Fast Food', 'Pizza'],
      averagePreparationTime: 30,
      minimumOrderAmount: 150,
      deliveryRadius: 4,
      commissionRate: 0.15,
      rating: 4.3,
      totalOrders: 203,
      status: 'ACTIVE',
      operatingHours: {
        monday: { open: '21:00', close: '00:00', isOpen: true },
        tuesday: { open: '21:00', close: '00:00', isOpen: true },
        wednesday: { open: '21:00', close: '00:00', isOpen: true },
        thursday: { open: '21:00', close: '00:00', isOpen: true },
        friday: { open: '21:00', close: '01:00', isOpen: true },
        saturday: { open: '21:00', close: '01:00', isOpen: true },
        sunday: { open: '21:00', close: '00:00', isOpen: true },
      },
      assignedDeliveryPartners: deliveryPartner1.deliveryPartner ? [deliveryPartner1.deliveryPartner.id] : [],
    },
  })

  // Create sample menu items for restaurant 1
  const menuItems1 = [
    {
      name: 'Butter Chicken',
      description: 'Creamy tomato-based curry with tender chicken pieces',
      price: 320,
      originalPrice: 380,
      category: 'Main Course',
      preparationTime: 20,
      imageUrl: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=300',
      dietaryTags: ['Non-Vegetarian', 'Contains Dairy'],
      spiceLevel: 'Medium',
      available: true,
      featured: true,
    },
    {
      name: 'Paneer Tikka Masala',
      description: 'Grilled cottage cheese in rich spiced gravy',
      price: 280,
      category: 'Main Course',
      preparationTime: 18,
      imageUrl: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=300',
      dietaryTags: ['Vegetarian', 'Contains Dairy'],
      spiceLevel: 'Medium',
      available: true,
      featured: true,
    },
    {
      name: 'Chicken Biryani',
      description: 'Aromatic basmati rice cooked with succulent chicken and exotic spices',
      price: 350,
      category: 'Biryani',
      preparationTime: 25,
      imageUrl: 'https://images.unsplash.com/photo-1563379091339-03246963d293?w=300',
      dietaryTags: ['Non-Vegetarian'],
      spiceLevel: 'Medium',
      available: true,
      featured: true,
    },
    {
      name: 'Dal Makhani',
      description: 'Rich and creamy black lentils slow-cooked overnight',
      price: 220,
      category: 'Dal & Curry',
      preparationTime: 15,
      imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=300',
      dietaryTags: ['Vegetarian', 'Contains Dairy'],
      spiceLevel: 'Mild',
      available: true,
      featured: false,
    },
    {
      name: 'Garlic Naan',
      description: 'Soft bread topped with fresh garlic and herbs',
      price: 60,
      category: 'Breads',
      preparationTime: 10,
      imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=300',
      dietaryTags: ['Vegetarian'],
      spiceLevel: 'Mild',
      available: true,
      featured: false,
    },
  ]

  for (const item of menuItems1) {
    await prisma.menuItem.create({
      data: {
        ...item,
        restaurantId: restaurant1.id,
      },
    })
  }

  // Create sample menu items for restaurant 2
  const menuItems2 = [
    {
      name: 'Margherita Pizza',
      description: 'Classic pizza with fresh mozzarella, tomatoes, and basil',
      price: 250,
      category: 'Pizza',
      preparationTime: 15,
      imageUrl: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=300',
      dietaryTags: ['Vegetarian'],
      spiceLevel: 'Mild',
      available: true,
      featured: true,
    },
    {
      name: 'Pepperoni Pizza',
      description: 'Loaded with spicy pepperoni and mozzarella cheese',
      price: 320,
      category: 'Pizza',
      preparationTime: 18,
      imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=300',
      dietaryTags: ['Non-Vegetarian'],
      spiceLevel: 'Medium',
      available: true,
      featured: true,
    },
    {
      name: 'Chicken Alfredo Pasta',
      description: 'Creamy white sauce pasta with grilled chicken',
      price: 280,
      category: 'Pasta',
      preparationTime: 20,
      imageUrl: 'https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=300',
      dietaryTags: ['Non-Vegetarian', 'Contains Dairy'],
      spiceLevel: 'Mild',
      available: true,
      featured: true,
    },
    {
      name: 'Caesar Salad',
      description: 'Crisp romaine lettuce with parmesan cheese and croutons',
      price: 180,
      category: 'Salads',
      preparationTime: 10,
      imageUrl: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=300',
      dietaryTags: ['Vegetarian'],
      spiceLevel: 'Mild',
      available: true,
      featured: false,
    },
    {
      name: 'Garlic Bread',
      description: 'Toasted bread with garlic butter and herbs',
      price: 120,
      category: 'Starters',
      preparationTime: 8,
      imageUrl: 'https://images.unsplash.com/photo-1573140247632-f8fd74997d5c?w=300',
      dietaryTags: ['Vegetarian'],
      spiceLevel: 'Mild',
      available: true,
      featured: false,
    },
  ]

  for (const item of menuItems2) {
    await prisma.menuItem.create({
      data: {
        ...item,
        restaurantId: restaurant2.id,
      },
    })
  }

  // Create sample customer address
  if (customer1.customer) {
    await prisma.address.create({
      data: {
        customerId: customer1.customer.id,
      type: 'HOME',
      street: '789 Customer Street, Apartment 5B',
      city: 'Bengaluru',
      state: 'Karnataka',
      zipCode: '560001',
      latitude: 28.6129,
      longitude: 77.2295,
      landmark: 'Near City Mall',
      instructions: 'Ring the bell twice',
      isDefault: true,
      },
    })
  }

  console.log('✅ Database seeding completed successfully!')
  console.log('📊 Created:')
  console.log('- 4 Users (1 Customer, 2 Restaurant Owners, 1 Delivery Partner)')
  console.log('- 2 Restaurants with complete profiles')
  console.log('- 10 Menu Items across different categories')
  console.log('- 1 Customer Address')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Error during seeding:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
