/**
 * React Hook for Haptic Feedback
 * 
 * Provides easy access to haptic functions in React components.
 * 
 * @example
 * ```tsx
 * function MyButton() {
 *   const { onButtonPress, onAddToCart } = useHapticFeedback();
 *   
 *   return (
 *     <button onClick={() => {
 *       onButtonPress();
 *       // ... rest of logic
 *     }}>
 *       Click me
 *     </button>
 *   );
 * }
 * ```
 */

import { useCallback } from 'react';
import * as interactions from './interactions';

export function useHapticFeedback() {
  // Wrap all interaction functions in useCallback for performance
  const onTap = useCallback(() => interactions.hapticLightTap(), []);
  const onButtonPress = useCallback(() => interactions.hapticButtonPress(), []);
  const onLongPress = useCallback(() => interactions.hapticLongPress(), []);
  
  const onAddToCart = useCallback(() => interactions.hapticAddToCart(), []);
  const onIncreaseQty = useCallback(() => interactions.hapticIncreaseQuantity(), []);
  const onDecreaseQty = useCallback(() => interactions.hapticDecreaseQuantity(), []);
  const onRemoveItem = useCallback(() => interactions.hapticRemoveFromCart(), []);
  
  const onSuccess = useCallback(() => interactions.hapticSuccess(), []);
  const onOrderPlaced = useCallback(() => interactions.hapticOrderPlaced(), []);
  
  const onError = useCallback(() => interactions.hapticError(), []);
  const onWarning = useCallback(() => interactions.hapticWarning(), []);
  const onSoldOut = useCallback(() => interactions.hapticSoldOut(), []);
  
  const onPageChange = useCallback(() => interactions.hapticPageChange(), []);
  const onModalOpen = useCallback(() => interactions.hapticModalOpen(), []);
  const onModalClose = useCallback(() => interactions.hapticModalClose(), []);
  const onSwipe = useCallback(() => interactions.hapticSwipe(), []);
  
  const onToggle = useCallback(() => interactions.hapticToggle(), []);
  const onPullRefresh = useCallback(() => interactions.hapticPullRefresh(), []);
  
  const onNotification = useCallback(() => interactions.hapticNotification(), []);
  const onOrderUpdate = useCallback(() => interactions.hapticOrderUpdate(), []);

  return {
    // Generic
    onTap,
    onButtonPress,
    onLongPress,
    
    // Cart
    onAddToCart,
    onIncreaseQty,
    onDecreaseQty,
    onRemoveItem,
    
    // Success
    onSuccess,
    onOrderPlaced,
    
    // Errors
    onError,
    onWarning,
    onSoldOut,
    
    // Navigation
    onPageChange,
    onModalOpen,
    onModalClose,
    onSwipe,
    
    // UI
    onToggle,
    onPullRefresh,
    
    // Notifications
    onNotification,
    onOrderUpdate,
  };
}

