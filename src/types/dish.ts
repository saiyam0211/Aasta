export interface Dish {
  id: string;
  name: string;
  image: string;
  price: number;
  originalPrice?: number;
  rating: number;
  preparationTime: number;
  restaurant: string;
  category: string;
  isVegetarian: boolean;
  spiceLevel: 'mild' | 'medium' | 'spicy' | 'extra-spicy';
  description?: string;
  dietaryTags?: string[];
  distanceText?: string;
  distanceMeters?: number;
  durationText?: string;
} 