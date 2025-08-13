/**
 * Calculate the distance between two coordinates using the Haversine formula
 * @param lat1 Latitude of first point
 * @param lng1 Longitude of first point
 * @param lat2 Latitude of second point
 * @param lng2 Longitude of second point
 * @returns Distance in kilometers
 */
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLng = (lng2 - lng1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in kilometers
  return distance;
}

/**
 * Filter restaurants within a certain radius
 * @param restaurants Array of restaurants with latitude and longitude
 * @param userLat User's latitude
 * @param userLng User's longitude
 * @param radiusKm Radius in kilometers (default 5km)
 * @returns Filtered array of restaurants within radius
 */
export function filterRestaurantsByDistance(
  restaurants: any[],
  userLat: number,
  userLng: number,
  radiusKm: number = 5
) {
  return restaurants
    .map((restaurant) => {
      if (!restaurant.latitude || !restaurant.longitude) {
        return null; // Skip restaurants without location data
      }

      const distance = calculateDistance(
        userLat,
        userLng,
        restaurant.latitude,
        restaurant.longitude
      );

      return {
        ...restaurant,
        distance: distance,
      };
    })
    .filter((restaurant) => restaurant && restaurant.distance <= radiusKm)
    .sort((a, b) => a.distance - b.distance); // Sort by nearest first
}
