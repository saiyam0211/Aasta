/**
 * Haptic Feedback System
 * 
 * Central export point for all haptic functionality.
 * Import from this file to use haptics throughout the app.
 * 
 * @example
 * ```ts
 * import { hapticAddToCart, hapticSuccess } from '@/haptics';
 * 
 * // When user adds item to cart
 * hapticAddToCart();
 * 
 * // When order is placed
 * hapticSuccess();
 * ```
 */

// Export service
export { haptics, triggerHaptic, customHaptic, cancelHaptic } from './service';

// Export React hook
export { useHapticFeedback } from './useHapticFeedback';

// Export types
export { HapticPattern, HAPTIC_PATTERNS } from './types';
export type { HapticConfig } from './types';

// Export interaction functions
export {
  // Buttons
  hapticButtonPress,
  hapticLightTap,
  hapticLongPress,
  
  // Cart
  hapticAddToCart,
  hapticIncreaseQuantity,
  hapticDecreaseQuantity,
  hapticRemoveFromCart,
  
  // Success
  hapticSuccess,
  hapticOrderPlaced,
  
  // Errors
  hapticError,
  hapticWarning,
  hapticSoldOut,
  
  // Navigation
  hapticPageChange,
  hapticModalOpen,
  hapticModalClose,
  hapticSwipe,
  
  // UI
  hapticToggle,
  hapticPullRefresh,
  
  // Notifications
  hapticNotification,
  hapticOrderUpdate,
} from './interactions';

