/**
 * Haptic Feedback Service
 * 
 * Centralized service for triggering haptic feedback across the app.
 * Uses Web Vibration API with pattern support for rich feedback.
 */

import { HapticPattern, HAPTIC_PATTERNS } from './types';

class HapticService {
  private enabled: boolean = true;
  private isSupported: boolean = false;

  constructor() {
    // Check if vibration is supported
    this.isSupported = 'vibrate' in navigator;
    
    if (!this.isSupported) {
      console.warn('Haptic feedback not supported on this device');
    }
  }

  /**
   * Trigger haptic feedback with a predefined pattern
   */
  trigger(pattern: HapticPattern): void {
    if (!this.enabled || !this.isSupported) return;

    const config = HAPTIC_PATTERNS[pattern];
    if (!config) {
      console.warn(`Unknown haptic pattern: ${pattern}`);
      return;
    }

    try {
      navigator.vibrate(config.pattern);
    } catch (error) {
      console.warn('Failed to trigger haptic feedback:', error);
    }
  }

  /**
   * Trigger custom haptic pattern
   * @param duration Single duration or array of durations in ms
   */
  custom(duration: number | number[]): void {
    if (!this.enabled || !this.isSupported) return;

    try {
      navigator.vibrate(duration);
    } catch (error) {
      console.warn('Failed to trigger custom haptic:', error);
    }
  }

  /**
   * Enable haptic feedback
   */
  enable(): void {
    this.enabled = true;
  }

  /**
   * Disable haptic feedback
   */
  disable(): void {
    this.enabled = false;
    // Cancel any ongoing vibration
    if (this.isSupported) {
      navigator.vibrate(0);
    }
  }

  /**
   * Check if haptics are enabled
   */
  isEnabled(): boolean {
    return this.enabled && this.isSupported;
  }

  /**
   * Cancel any ongoing vibration
   */
  cancel(): void {
    if (this.isSupported) {
      navigator.vibrate(0);
    }
  }
}

// Export singleton instance
export const haptics = new HapticService();

// Export individual trigger functions for convenience
export const triggerHaptic = (pattern: HapticPattern) => haptics.trigger(pattern);
export const customHaptic = (duration: number | number[]) => haptics.custom(duration);
export const cancelHaptic = () => haptics.cancel();

