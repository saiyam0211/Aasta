'use client';

interface PreloadConfig {
  locationId: string | null;
  vegOnly: boolean;
}

interface PreloadResult {
  restaurants: any[];
  dishes: any[];
  hacks: any[];
  nearbyDishes: any[][];
  recentOrders: any[];
  success: boolean;
  error?: string;
}

export class DataPreloader {
  private static instance: DataPreloader;
  private cache: Map<string, any> = new Map();
  private isPreloading = false;

  static getInstance(): DataPreloader {
    if (!DataPreloader.instance) {
      DataPreloader.instance = new DataPreloader();
    }
    return DataPreloader.instance;
  }

  async preloadData(config: PreloadConfig): Promise<PreloadResult> {
    if (this.isPreloading) {
      return { restaurants: [], dishes: [], hacks: [], nearbyDishes: [], recentOrders: [], success: false, error: 'Already preloading' };
    }

    if (!config.locationId) {
      return { restaurants: [], dishes: [], hacks: [], nearbyDishes: [], recentOrders: [], success: false, error: 'No location ID' };
    }

    this.isPreloading = true;
    console.log('🚀 Starting data preload for location:', config.locationId);

    try {
      const startTime = Date.now();
      
      // Preload all data in parallel
      const [
        restaurantsResult,
        hacksResult,
        nearbyDishesResult,
        recentOrdersResult
      ] = await Promise.allSettled([
        this.preloadRestaurants(config),
        this.preloadHacks(config),
        this.preloadNearbyDishes(config),
        this.preloadRecentOrders()
      ]);

      const endTime = Date.now();
      console.log(`✅ Data preload completed in ${endTime - startTime}ms`);

      const result: PreloadResult = {
        restaurants: restaurantsResult.status === 'fulfilled' ? restaurantsResult.value.restaurants : [],
        dishes: restaurantsResult.status === 'fulfilled' ? restaurantsResult.value.dishes : [],
        hacks: hacksResult.status === 'fulfilled' ? hacksResult.value : [],
        nearbyDishes: nearbyDishesResult.status === 'fulfilled' ? nearbyDishesResult.value : [],
        recentOrders: recentOrdersResult.status === 'fulfilled' ? recentOrdersResult.value : [],
        success: true
      };

      // Cache the results
      this.cache.set(`preload_${config.locationId}_${config.vegOnly}`, result);
      
      return result;
    } catch (error) {
      console.error('❌ Data preload failed:', error);
      return {
        restaurants: [],
        dishes: [],
        hacks: [],
        nearbyDishes: [],
        recentOrders: [],
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    } finally {
      this.isPreloading = false;
    }
  }

  private async preloadRestaurants(config: PreloadConfig) {
    const response = await fetch(
      `/api/restaurants/by-location?locationId=${config.locationId}&limit=12${config.vegOnly ? '&veg=1' : ''}`
    );
    
    if (!response.ok) {
      throw new Error('Failed to preload restaurants');
    }

    const data = await response.json();
    const restaurants = Array.isArray(data?.data) ? data.data : [];
    
    // Extract dishes from restaurants
    const dishes = restaurants.flatMap((r: any) => 
      Array.isArray(r.featuredItems) ? r.featuredItems : []
    );

    return { restaurants, dishes };
  }

  private async preloadHacks(config: PreloadConfig) {
    const response = await fetch(
      `/api/restaurants/by-location?locationId=${config.locationId}${config.vegOnly ? '&veg=1' : ''}`
    );
    
    if (!response.ok) {
      throw new Error('Failed to preload hacks');
    }

    const data = await response.json();
    const restaurants = Array.isArray(data?.data) ? data.data : [];
    
    const hacks: any[] = [];
    for (const r of restaurants) {
      const hackItems = Array.isArray(r.hackItems) ? r.hackItems : [];
      for (const item of hackItems) {
        const tags = Array.isArray(item.dietaryTags) ? item.dietaryTags : [];
        const lower = tags.map((t: any) => String(t).toLowerCase());
        const hasNonVeg = lower.some((t: any) => /(non[-\s]?veg)/i.test(t));
        const hasVeg = lower.some((t: any) => /(\bveg\b|vegetarian|vegan)/i.test(t));
        const isVeg = !hasNonVeg && hasVeg;
        
        if (config.vegOnly && !isVeg) continue;
        
        hacks.push({
          id: item.id,
          name: item.name,
          image: item.image || '/images/dish-placeholder.svg',
          price: item.price,
          originalPrice: item.originalPrice,
          restaurant: r.name,
          restaurantId: r.id,
          dietaryTags: item.dietaryTags || [],
          stockLeft: typeof item.stockLeft === 'number' ? item.stockLeft : null,
          soldOut: item.soldOut === true,
        });
      }
    }

    return hacks;
  }

  private async preloadNearbyDishes(config: PreloadConfig) {
    const response = await fetch(
      `/api/restaurants/by-location?locationId=${config.locationId}&limit=12${config.vegOnly ? '&veg=1' : ''}`
    );
    
    if (!response.ok) {
      throw new Error('Failed to preload nearby dishes');
    }

    const data = await response.json();
    const restaurants = Array.isArray(data?.data) ? data.data : [];
    
    const allDishes: any[] = [];
    for (const r of restaurants) {
      const nonFeatured = Array.isArray(r.nonFeaturedItems) ? r.nonFeaturedItems : [];
      for (const item of nonFeatured) {
        const isVeg = Array.isArray(item.dietaryTags) ? item.dietaryTags.includes('Veg') : false;
        if (config.vegOnly && !isVeg) continue;
        
        allDishes.push({
          id: item.id,
          name: item.name,
          image: item.image || '/images/dish-placeholder.svg',
          price: item.price,
          originalPrice: item.originalPrice,
          restaurant: r.name,
          restaurantId: r.id,
          dietaryTags: item.dietaryTags || [],
          stockLeft: typeof item.stockLeft === 'number' ? item.stockLeft : null,
          soldOut: item.soldOut === true,
        });
      }
    }

    // Shuffle and split into sections
    for (let i = allDishes.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allDishes[i], allDishes[j]] = [allDishes[j], allDishes[i]];
    }

    const sectionSize = Math.ceil(allDishes.length / 3);
    return [
      allDishes.slice(0, sectionSize),
      allDishes.slice(sectionSize, sectionSize * 2),
      allDishes.slice(sectionSize * 2)
    ];
  }

  private async preloadRecentOrders() {
    try {
      const response = await fetch('/api/orders?limit=10&paymentStatus=COMPLETED');
      if (!response.ok) {
        return [];
      }
      
      const data = await response.json();
      return Array.isArray(data?.data?.orders) ? data.data.orders : [];
    } catch {
      return [];
    }
  }

  getCachedData(locationId: string, vegOnly: boolean): PreloadResult | null {
    return this.cache.get(`preload_${locationId}_${vegOnly}`) || null;
  }

  clearCache() {
    this.cache.clear();
  }
}

export const dataPreloader = DataPreloader.getInstance();
