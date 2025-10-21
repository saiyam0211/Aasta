/**
 * Splash Screen Control
 * 
 * Controls the native splash screen to show while data loads.
 * This ensures the Lottie animation plays and stays visible until all data is ready.
 */

import { Capacitor } from '@capacitor/core';

class SplashScreenService {
  private isVisible = true;
  private isNative = Capacitor.isNativePlatform();

  /**
   * Hide the splash screen
   * Call this when all data is loaded and app is ready
   */
  async hide() {
    if (!this.isNative || !this.isVisible) return;
    
    try {
      // Import SplashScreen plugin dynamically
      const { SplashScreen } = await import('@capacitor/splash-screen');
      await SplashScreen.hide();
      this.isVisible = false;
      console.log('🎬 Splash screen hidden');
    } catch (error) {
      console.warn('Failed to hide splash screen:', error);
    }
  }

  /**
   * Show the splash screen
   * Call this if you need to show splash again
   */
  async show() {
    if (!this.isNative || this.isVisible) return;
    
    try {
      const { SplashScreen } = await import('@capacitor/splash-screen');
      await SplashScreen.show({
        showSpinner: false, // We don't want spinner, just the Lottie animation
        autoHide: false, // We'll control when to hide it
      });
      this.isVisible = true;
      console.log('🎬 Splash screen shown');
    } catch (error) {
      console.warn('Failed to show splash screen:', error);
    }
  }

  /**
   * Check if splash screen is visible
   */
  isSplashVisible(): boolean {
    return this.isVisible;
  }

  /**
   * Wait for splash screen to be ready
   * This ensures the Lottie animation has started
   */
  async waitForSplashReady(): Promise<void> {
    if (!this.isNative) return;
    
    // Wait a bit for the splash screen to be fully displayed
    await new Promise(resolve => setTimeout(resolve, 100));
  }
}

// Export singleton instance
export const splashScreen = new SplashScreenService();

// Helper function to hide splash when data is ready
export const hideSplashWhenReady = async () => {
  await splashScreen.waitForSplashReady();
  await splashScreen.hide();
};
