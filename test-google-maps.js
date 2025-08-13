// Simple test script to verify Google Maps integration
require('dotenv').config();

const { googleMapsService } = require('./src/lib/google-maps');

async function testGoogleMapsIntegration() {
  console.log('Testing Google Maps integration...');

  // Test coordinates for Bangalore
  const restaurantLat = 12.9716; // Bangalore coordinates
  const restaurantLng = 77.5946;
  const customerLat = 12.9352; // Different area in Bangalore
  const customerLng = 77.6245;

  try {
    const result = await googleMapsService.calculateDeliveryMetrics(
      restaurantLat,
      restaurantLng,
      customerLat,
      customerLng,
      20 // 20 minutes preparation time
    );

    console.log('✅ Google Maps integration successful!');
    console.log('Results:', result);
    console.log(`Distance: ${result.distance} km`);
    console.log(`Duration: ${result.duration} minutes`);
    console.log(
      `Estimated delivery time: ${result.estimatedDeliveryTime?.toISOString()}`
    );
  } catch (error) {
    console.error('❌ Google Maps integration failed:', error.message);
    console.log('This could be due to:');
    console.log('1. Missing Google Maps API key');
    console.log('2. API key restrictions');
    console.log('3. Distance Matrix API not enabled');
    console.log('4. Network connectivity issues');
  }
}

testGoogleMapsIntegration();
