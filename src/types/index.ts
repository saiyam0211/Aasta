import { UserRole, OrderStatus, RestaurantStatus, PartnerStatus, AddressType, BatchStatus, StopStatus } from "@prisma/client"

// Custom types for API responses and forms
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Location types
export interface Location {
  latitude: number;
  longitude: number;
}

export interface LocationWithAddress extends Location {
  address: string;
  city?: string;
  state?: string;
  zipCode?: string;
}

// Authentication types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthToken {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface UserProfile {
  name?: string;
  phone?: string;
  image?: string;
}

// Customer types
export interface CustomerPreferences {
  cuisinePreferences: string[];
  dietaryRestrictions: string[];
  spiceLevel: string;
  notifications: {
    orderUpdates: boolean;
    promotions: boolean;
    newRestaurants: boolean;
  };
}

export interface CreateOrderRequest {
  restaurantId: string;
  deliveryAddressId: string;
  items: {
    menuItemId: string;
    quantity: number;
    customizations?: Record<string, any>;
  }[];
  specialInstructions?: string;
}

// Restaurant types
export interface MenuItemRequest {
  name: string;
  description?: string;
  price: number;
  originalPrice?: number;
  category: string;
  preparationTime?: number;
  imageUrl?: string;
  dietaryTags?: string[];
  spiceLevel?: string;
  available?: boolean;
  featured?: boolean;
}

export interface RestaurantAnalytics {
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  averagePreparationTime: number;
  averageRating: number;
  popularItems: {
    menuItemId: string;
    name: string;
    orderCount: number;
  }[];
  peakHours: {
    hour: number;
    orderCount: number;
  }[];
}

export interface OperatingHours {
  [key: string]: {
    open: string;
    close: string;
    isOpen: boolean;
  };
}

// Delivery types
export interface RouteInfo {
  distance: number;
  duration: number;
  steps: {
    instruction: string;
    distance: number;
    duration: number;
  }[];
}

export interface DeliveryRoute {
  pickupLocation: Location;
  deliveryStops: {
    orderId: string;
    location: Location;
    estimatedArrivalTime: Date;
  }[];
  totalDistance: number;
  totalDuration: number;
  optimizedOrder: number[];
}

// Payment types
export interface PaymentOrder {
  id: string;
  amount: number;
  currency: string;
  receipt?: string;
  notes?: Record<string, string>;
}

export interface PaymentResponse {
  paymentId: string;
  orderId: string;
  signature: string;
  status: 'success' | 'failed';
}

export interface RefundResponse {
  refundId: string;
  amount: number;
  status: 'processed' | 'failed';
  reason?: string;
}

export interface PaymentStatus {
  id: string;
  status: 'created' | 'authorized' | 'captured' | 'refunded' | 'failed';
  amount: number;
  currency: string;
  method?: string;
  createdAt: Date;
}

// Notification types
export interface NotificationMessage {
  title: string;
  body: string;
  data?: Record<string, any>;
  actions?: {
    action: string;
    title: string;
  }[];
}

export interface UserEvent {
  eventType: string;
  userId: string;
  data: Record<string, any>;
  timestamp: Date;
}

// Analytics types
export interface PlatformMetrics {
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  averageDeliveryTime: number;
  customerAcquisition: number;
  restaurantSignups: number;
  deliveryPartnerSignups: number;
  date: Date;
}

export interface DateRange {
  startDate: Date;
  endDate: Date;
}

// Form validation types
export interface ValidationError {
  field: string;
  message: string;
}

export interface FormState<T = any> {
  data: T;
  errors: ValidationError[];
  isSubmitting: boolean;
  isValid: boolean;
}

// Cart types
export interface CartItem {
  menuItemId: string;
  menuItem: any; // Will be properly typed after Prisma client generation
  quantity: number;
  customizations?: Record<string, any>;
  subtotal: number;
}

export interface Cart {
  restaurantId: string;
  restaurant: any; // Will be properly typed after Prisma client generation
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  taxes: number;
  total: number;
}

// Search and filter types
export interface RestaurantFilters {
  cuisineTypes?: string[];
  priceRange?: {
    min: number;
    max: number;
  };
  rating?: number;
  deliveryTime?: number;
  location?: Location;
  radius?: number;
}

export interface MenuItemFilters {
  category?: string;
  dietaryTags?: string[];
  priceRange?: {
    min: number;
    max: number;
  };
  spiceLevel?: string;
  available?: boolean;
}

// WebSocket types
export interface SocketEvent {
  type: string;
  data: any;
  timestamp: Date;
}

export interface OrderUpdate {
  orderId: string;
  status: string; // Will be properly typed after Prisma client generation
  estimatedDeliveryTime?: Date;
  message?: string;
}

// Error types
export interface AppError {
  code: string;
  message: string;
  details?: any;
  statusCode?: number;
}

// Configuration types
export interface AppConfig {
  apiUrl: string;
  socketUrl: string;
  googleMapsApiKey: string;
  razorpayKeyId: string;
  operatingHours: {
    start: string;
    end: string;
  };
  deliveryRadius: number;
  minimumOrderAmount: number;
}

// Component prop types
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export interface LoadingProps extends BaseComponentProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'spinner' | 'dots' | 'pulse';
}

export interface ModalProps extends BaseComponentProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

// State management types
export interface AppState {
  user: any | null; // Will be properly typed after Prisma client generation
  cart: Cart | null;
  location: Location | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface AuthState {
  user: any | null; // Will be properly typed after Prisma client generation
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface CartState {
  cart: Cart | null;
  isLoading: boolean;
  error: string | null;
}

export interface LocationState {
  currentLocation: Location | null;
  permissionStatus: 'granted' | 'denied' | 'prompt' | null;
  isLoading: boolean;
  error: string | null;
} 