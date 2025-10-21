/**
 * Haptic Feedback for User Interactions
 * 
 * Specific haptic functions for different user interactions
 * in the Aasta food delivery app.
 */

import { triggerHaptic } from './service';
import { HapticPattern } from './types';

// ===== BUTTON INTERACTIONS =====

export const hapticButtonPress = () => {
  triggerHaptic(HapticPattern.BUTTON_PRESS);
};

export const hapticLightTap = () => {
  triggerHaptic(HapticPattern.TAP);
};

export const hapticLongPress = () => {
  triggerHaptic(HapticPattern.LONG_PRESS);
};

// ===== CART ACTIONS =====

export const hapticAddToCart = () => {
  triggerHaptic(HapticPattern.ITEM_ADDED);
};

export const hapticIncreaseQuantity = () => {
  triggerHaptic(HapticPattern.INCREASE_QTY);
};

export const hapticDecreaseQuantity = () => {
  triggerHaptic(HapticPattern.DECREASE_QTY);
};

export const hapticRemoveFromCart = () => {
  triggerHaptic(HapticPattern.REMOVE_ITEM);
};

// ===== SUCCESS STATES =====

export const hapticSuccess = () => {
  triggerHaptic(HapticPattern.SUCCESS);
};

export const hapticOrderPlaced = () => {
  triggerHaptic(HapticPattern.ORDER_PLACED);
};

// ===== ERROR & WARNING STATES =====

export const hapticError = () => {
  triggerHaptic(HapticPattern.ERROR);
};

export const hapticWarning = () => {
  triggerHaptic(HapticPattern.WARNING);
};

export const hapticSoldOut = () => {
  triggerHaptic(HapticPattern.SOLD_OUT);
};

// ===== NAVIGATION =====

export const hapticPageChange = () => {
  triggerHaptic(HapticPattern.PAGE_CHANGE);
};

export const hapticModalOpen = () => {
  triggerHaptic(HapticPattern.MODAL_OPEN);
};

export const hapticModalClose = () => {
  triggerHaptic(HapticPattern.MODAL_CLOSE);
};

export const hapticSwipe = () => {
  triggerHaptic(HapticPattern.SWIPE);
};

// ===== UI INTERACTIONS =====

export const hapticToggle = () => {
  triggerHaptic(HapticPattern.TOGGLE);
};

export const hapticPullRefresh = () => {
  triggerHaptic(HapticPattern.PULL_REFRESH);
};

// ===== NOTIFICATIONS =====

export const hapticNotification = () => {
  triggerHaptic(HapticPattern.NOTIFICATION);
};

export const hapticOrderUpdate = () => {
  triggerHaptic(HapticPattern.ORDER_UPDATE);
};

