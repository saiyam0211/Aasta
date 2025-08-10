// Seed script for default locations
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedLocations() {
  console.log('Seeding default locations...');

  const defaultLocations = [
    { name: 'Koramangala', city: 'Bengaluru', state: 'Karnataka', country: 'India' },
    { name: 'Indiranagar', city: 'Bengaluru', state: 'Karnataka', country: 'India' },
    { name: 'Whitefield', city: 'Bengaluru', state: 'Karnataka', country: 'India' },
    { name: 'HSR Layout', city: 'Bengaluru', state: 'Karnataka', country: 'India' },
    { name: 'Marathahalli', city: 'Bengaluru', state: 'Karnataka', country: 'India' },
    { name: 'BTM Layout', city: 'Bengaluru', state: 'Karnataka', country: 'India' },
    { name: 'Electronic City', city: 'Bengaluru', state: 'Karnataka', country: 'India' },
    { name: 'JP Nagar', city: 'Bengaluru', state: 'Karnataka', country: 'India' },
    { name: 'Jayanagar', city: 'Bengaluru', state: 'Karnataka', country: 'India' },
    { name: 'Bannerghatta Road', city: 'Bengaluru', state: 'Karnataka', country: 'India' }
  ];

  try {
    for (const location of defaultLocations) {
      const existingLocation = await prisma.location.findUnique({
        where: { name: location.name }
      });

      if (!existingLocation) {
        await prisma.location.create({
          data: location
        });
        console.log(`✅ Created location: ${location.name}`);
      } else {
        console.log(`⏭️  Location already exists: ${location.name}`);
      }
    }

    console.log('✅ Location seeding completed!');
  } catch (error) {
    console.error('❌ Error seeding locations:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedLocations();
