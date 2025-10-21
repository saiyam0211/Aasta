/**
 * Haptic Feedback Types for Aasta Food Delivery App
 * 
 * Defines different haptic patterns for various user interactions
 * to create a more tactile and engaging user experience.
 */

export enum HapticPattern {
  // User Actions
  TAP = 'tap',                    // Light tap (50ms)
  BUTTON_PRESS = 'button_press',  // Medium press (100ms)
  LONG_PRESS = 'long_press',      // Heavy press (200ms)
  
  // Success States
  SUCCESS = 'success',            // Double tap pattern [100, 50, 100]
  ORDER_PLACED = 'order_placed',  // Success pattern [100, 100, 150]
  ITEM_ADDED = 'item_added',      // Quick tap [75ms]
  
  // Warnings & Errors
  WARNING = 'warning',            // Medium vibration [150ms]
  ERROR = 'error',                // Strong vibration [200ms]
  SOLD_OUT = 'sold_out',          // Error pattern [100, 50, 100, 50, 100]
  
  // Navigation
  SWIPE = 'swipe',                // Light swipe [40ms]
  PAGE_CHANGE = 'page_change',    // Medium transition [80ms]
  MODAL_OPEN = 'modal_open',      // Light open [60ms]
  MODAL_CLOSE = 'modal_close',    // Light close [50ms]
  
  // Interactions
  TOGGLE = 'toggle',              // Quick toggle [70ms]
  SLIDER = 'slider',              // Very light [30ms]
  PULL_REFRESH = 'pull_refresh',  // Medium [100ms]
  
  // Cart Actions
  INCREASE_QTY = 'increase_qty',  // Light [60ms]
  DECREASE_QTY = 'decrease_qty',  // Light [60ms]
  REMOVE_ITEM = 'remove_item',    // Medium [120ms]
  
  // Notifications
  NOTIFICATION = 'notification',  // Notification pattern [100, 100, 100]
  ORDER_UPDATE = 'order_update',  // Update pattern [80, 60, 120]
}

export interface HapticConfig {
  pattern: number | number[]; // Vibration duration(s) in ms
  description: string;
}

export const HAPTIC_PATTERNS: Record<HapticPattern, HapticConfig> = {
  // User Actions
  [HapticPattern.TAP]: {
    pattern: 50,
    description: 'Light tap feedback for general touches'
  },
  [HapticPattern.BUTTON_PRESS]: {
    pattern: 100,
    description: 'Medium feedback for button presses'
  },
  [HapticPattern.LONG_PRESS]: {
    pattern: 200,
    description: 'Heavy feedback for long press actions'
  },
  
  // Success States
  [HapticPattern.SUCCESS]: {
    pattern: [100, 50, 100],
    description: 'Success confirmation with double pulse'
  },
  [HapticPattern.ORDER_PLACED]: {
    pattern: [100, 100, 150],
    description: 'Order placed successfully'
  },
  [HapticPattern.ITEM_ADDED]: {
    pattern: 75,
    description: 'Item added to cart'
  },
  
  // Warnings & Errors
  [HapticPattern.WARNING]: {
    pattern: 150,
    description: 'Warning feedback'
  },
  [HapticPattern.ERROR]: {
    pattern: 200,
    description: 'Error feedback'
  },
  [HapticPattern.SOLD_OUT]: {
    pattern: [100, 50, 100, 50, 100],
    description: 'Item sold out or unavailable'
  },
  
  // Navigation
  [HapticPattern.SWIPE]: {
    pattern: 40,
    description: 'Swipe gesture feedback'
  },
  [HapticPattern.PAGE_CHANGE]: {
    pattern: 80,
    description: 'Page navigation feedback'
  },
  [HapticPattern.MODAL_OPEN]: {
    pattern: 60,
    description: 'Modal/sheet opening'
  },
  [HapticPattern.MODAL_CLOSE]: {
    pattern: 50,
    description: 'Modal/sheet closing'
  },
  
  // Interactions
  [HapticPattern.TOGGLE]: {
    pattern: 70,
    description: 'Toggle switch feedback'
  },
  [HapticPattern.SLIDER]: {
    pattern: 30,
    description: 'Slider interaction'
  },
  [HapticPattern.PULL_REFRESH]: {
    pattern: 100,
    description: 'Pull to refresh action'
  },
  
  // Cart Actions
  [HapticPattern.INCREASE_QTY]: {
    pattern: 60,
    description: 'Increase quantity'
  },
  [HapticPattern.DECREASE_QTY]: {
    pattern: 60,
    description: 'Decrease quantity'
  },
  [HapticPattern.REMOVE_ITEM]: {
    pattern: 120,
    description: 'Remove item from cart'
  },
  
  // Notifications
  [HapticPattern.NOTIFICATION]: {
    pattern: [100, 100, 100],
    description: 'General notification'
  },
  [HapticPattern.ORDER_UPDATE]: {
    pattern: [80, 60, 120],
    description: 'Order status update'
  },
};

