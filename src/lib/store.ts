import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Auth Store
interface AuthState {
  isAuthenticated: boolean;
  user: any | null;
  isLoading: boolean;
  error: string | null;
  setUser: (user: any) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  user: null,
  isLoading: false,
  error: null,
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  logout: () => set({ user: null, isAuthenticated: false, error: null }),
}));

// Cart Store
interface CartItem {
  menuItemId: string;
  menuItem: any;
  quantity: number;
  customizations?: Record<string, any>;
  subtotal: number;
}

interface CartState {
  cart: {
    restaurantId: string;
    restaurant: any;
    items: CartItem[];
    subtotal: number;
    deliveryFee: number;
    taxes: number;
    total: number;
  } | null;
  isLoading: boolean;
  error: string | null;
  addItem: (item: CartItem, restaurant: any) => void;
  removeItem: (menuItemId: string) => void;
  updateQuantity: (menuItemId: string, quantity: number) => void;
  getItemQuantityInCart: (menuItemId: string) => number;
  clearCart: () => void;
  calculateTotals: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cart: null,
      isLoading: false,
      error: null,
      addItem: (item, restaurant) => {
        const currentCart = get().cart;
        
        // If cart is empty or from different restaurant, create new cart
        if (!currentCart || currentCart.restaurantId !== restaurant.id) {
          set({
            cart: {
              restaurantId: restaurant.id,
              restaurant,
              items: [item],
              subtotal: item.subtotal,
              deliveryFee: 25, // Default delivery fee
              taxes: 0,
              total: 0,
            },
          });
        } else {
          // Add to existing cart
          const existingItemIndex = currentCart.items.findIndex(
            (cartItem) => cartItem.menuItemId === item.menuItemId
          );
          
          if (existingItemIndex >= 0) {
            // Update existing item
            const updatedItems = [...currentCart.items];
            updatedItems[existingItemIndex].quantity += item.quantity;
            updatedItems[existingItemIndex].subtotal += item.subtotal;
            
            set({
              cart: {
                ...currentCart,
                items: updatedItems,
              },
            });
          } else {
            // Add new item
            set({
              cart: {
                ...currentCart,
                items: [...currentCart.items, item],
              },
            });
          }
        }
        
        get().calculateTotals();
      },
      removeItem: (menuItemId) => {
        const currentCart = get().cart;
        if (!currentCart) return;
        
        const updatedItems = currentCart.items.filter(
          (item) => item.menuItemId !== menuItemId
        );
        
        if (updatedItems.length === 0) {
          set({ cart: null });
        } else {
          set({
            cart: {
              ...currentCart,
              items: updatedItems,
            },
          });
          get().calculateTotals();
        }
      },
      updateQuantity: (menuItemId, quantity) => {
        const currentCart = get().cart;
        if (!currentCart) return;
        
        if (quantity <= 0) {
          get().removeItem(menuItemId);
          return;
        }
        
        const updatedItems = currentCart.items.map((item) => {
          if (item.menuItemId === menuItemId) {
            const unitPrice = item.subtotal / item.quantity;
            return {
              ...item,
              quantity,
              subtotal: unitPrice * quantity,
            };
          }
          return item;
        });
        
        set({
          cart: {
            ...currentCart,
            items: updatedItems,
          },
        });
        
        get().calculateTotals();
      },
      getItemQuantityInCart: (menuItemId) => {
        const currentCart = get().cart;
        if (!currentCart) return 0;
        const item = currentCart.items.find(
          (cartItem) => cartItem.menuItemId === menuItemId
        );
        return item ? item.quantity : 0;
      },
      clearCart: () => set({ cart: null }),
      calculateTotals: () => {
        const currentCart = get().cart;
        if (!currentCart) return;
        
        const subtotal = currentCart.items.reduce(
          (total, item) => total + item.subtotal,
          0
        );
        
        const taxes = subtotal * 0.05; // 5% tax
        const total = subtotal + currentCart.deliveryFee + taxes;
        
        set({
          cart: {
            ...currentCart,
            subtotal,
            taxes,
            total,
          },
        });
      },
    }),
    {
      name: 'cart-storage',
      partialize: (state) => ({ cart: state.cart }),
    }
  )
);

// Location Store
interface LocationState {
  currentLocation: {
    latitude: number;
    longitude: number;
  } | null;
  currentAddress: {
    address: string;
    city?: string;
    state?: string;
    zipCode?: string;
  } | null;
  permissionStatus: 'granted' | 'denied' | 'prompt' | null;
  isLoading: boolean;
  error: string | null;
  setLocation: (location: { latitude: number; longitude: number }) => void;
  setAddress: (address: { address: string; city?: string; state?: string; zipCode?: string }) => void;
  setPermissionStatus: (status: 'granted' | 'denied' | 'prompt') => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  requestLocation: () => Promise<void>;
  getDisplayText: () => string;
}

export const useLocationStore = create<LocationState>()(
  persist(
    (set, get) => ({
      currentLocation: null,
      currentAddress: null,
      permissionStatus: null,
      isLoading: false,
      error: null,
      setLocation: (currentLocation) => set({ currentLocation }),
      setAddress: (currentAddress) => set({ currentAddress }),
      setPermissionStatus: (permissionStatus) => set({ permissionStatus }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      getDisplayText: () => {
        const state = get();
        if (state.currentAddress && state.currentAddress.address) {
          // Try to create a short, user-friendly address
          const address = state.currentAddress.address;
          const parts = address.split(',');
          if (parts.length >= 2) {
            // Return first two parts for a concise display
            return `${parts[0].trim()}, ${parts[1].trim()}`;
          }
          return address.length > 40 ? address.substring(0, 37) + '...' : address;
        }
        if (state.currentLocation) {
          return 'Current Location';
        }
        return 'Set your location';
      },
      requestLocation: async () => {
        if (!navigator.geolocation) {
          set({ error: 'Geolocation is not supported by this browser.' });
          return;
        }
        
        set({ isLoading: true, error: null });
        
        try {
          const position = await new Promise<GeolocationPosition>(
            (resolve, reject) => {
              navigator.geolocation.getCurrentPosition(resolve, reject, {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 300000, // 5 minutes
              });
            }
          );
          
          const location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          
          set({
            currentLocation: location,
            permissionStatus: 'granted',
            isLoading: false,
          });
        } catch (error: any) {
          let errorMessage = 'Failed to get location';
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location access denied by user';
              set({ permissionStatus: 'denied' });
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information is unavailable';
              break;
            case error.TIMEOUT:
              errorMessage = 'Location request timed out';
              break;
          }
          
          set({ error: errorMessage, isLoading: false });
        }
      },
    }),
    {
      name: 'location-storage',
      partialize: (state) => ({
        currentLocation: state.currentLocation,
        currentAddress: state.currentAddress,
        permissionStatus: state.permissionStatus,
      }),
    }
  )
);

// Combined store hook for convenience
export const useStore = () => {
  const auth = useAuthStore();
  const cart = useCartStore();
  const location = useLocationStore();
  const app = useAppStore();
  
  return {
    // Auth
    user: auth.user,
    isAuthenticated: auth.isAuthenticated,
    authLoading: auth.isLoading,
    authError: auth.error,
    setUser: auth.setUser,
    logout: auth.logout,
    
    // Cart
    cart: cart.cart,
    cartLoading: cart.isLoading,
    cartError: cart.error,
    addToCart: cart.addItem,
    removeFromCart: cart.removeItem,
    updateCartQuantity: cart.updateQuantity,
    clearCart: cart.clearCart,
    
    // Location
    location: location.currentLocation,
    locationAddress: location.currentAddress,
    locationPermission: location.permissionStatus,
    locationLoading: location.isLoading,
    locationError: location.error,
    setLocation: location.setLocation,
    setAddress: location.setAddress,
    getLocationDisplayText: location.getDisplayText,
    requestLocation: location.requestLocation,
    
    // App
    isOnline: app.isOnline,
    theme: app.theme,
    notifications: app.notifications,
    setOnlineStatus: app.setOnlineStatus,
    setTheme: app.setTheme,
    addNotification: app.addNotification,
    removeNotification: app.removeNotification,
    clearNotifications: app.clearNotifications,
  };
};

// App Store for global app state
interface AppState {
  isOnline: boolean;
  theme: 'light' | 'dark' | 'system';
  notifications: any[];
  setOnlineStatus: (isOnline: boolean) => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  addNotification: (notification: any) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      isOnline: true,
      theme: 'system',
      notifications: [],
      setOnlineStatus: (isOnline) => set({ isOnline }),
      setTheme: (theme) => set({ theme }),
      addNotification: (notification) => {
        const notifications = get().notifications;
        set({ notifications: [...notifications, notification] });
      },
      removeNotification: (id) => {
        const notifications = get().notifications.filter(
          (notification) => notification.id !== id
        );
        set({ notifications });
      },
      clearNotifications: () => set({ notifications: [] }),
    }),
    {
      name: 'app-storage',
      partialize: (state) => ({ theme: state.theme }),
    }
  )
);
