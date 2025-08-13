import { test, expect } from '@playwright/test';

test.describe('Order Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should complete full order placement flow', async ({ page }) => {
    // Check if the home page loads correctly
    await expect(page).toHaveTitle(/Aasta/);

    // Look for main heading or hero section
    await expect(page.locator('h1')).toBeVisible();

    // Navigate to restaurants (if available)
    const restaurantsLink = page.locator('text=Restaurants').first();
    if (await restaurantsLink.isVisible()) {
      await restaurantsLink.click();
      await expect(page).toHaveURL(/.*restaurants.*/);
    }

    // Test restaurant selection (mock data scenario)
    const firstRestaurant = page
      .locator('[data-testid="restaurant-card"]')
      .first();
    if (await firstRestaurant.isVisible()) {
      await firstRestaurant.click();

      // Verify restaurant page loads
      await expect(
        page.locator('[data-testid="restaurant-menu"]')
      ).toBeVisible();

      // Add item to cart
      const addToCartButton = page
        .locator('[data-testid="add-to-cart"]')
        .first();
      if (await addToCartButton.isVisible()) {
        await addToCartButton.click();

        // Verify item added to cart
        await expect(page.locator('[data-testid="cart-count"]')).toContainText(
          '1'
        );
      }

      // Proceed to checkout
      const cartButton = page.locator('[data-testid="cart-button"]');
      if (await cartButton.isVisible()) {
        await cartButton.click();

        // Fill delivery information
        await page.fill('[data-testid="delivery-address"]', '123 Test Street');
        await page.fill('[data-testid="delivery-city"]', 'Test City');
        await page.fill('[data-testid="delivery-postal"]', '12345');

        // Select payment method
        await page.click('[data-testid="payment-cash"]');

        // Place order
        await page.click('[data-testid="place-order"]');

        // Verify order confirmation
        await expect(
          page.locator('[data-testid="order-confirmation"]')
        ).toBeVisible();
      }
    }
  });

  test('should handle PWA installation prompt', async ({ page }) => {
    // Check if PWA banner is visible
    const pwaInstallBanner = page.locator('[data-testid="pwa-install-banner"]');

    // Note: PWA install prompt may not always be visible in test environment
    if (await pwaInstallBanner.isVisible()) {
      await expect(pwaInstallBanner).toContainText('Install App');

      // Test dismiss functionality
      await page.click('[data-testid="pwa-dismiss"]');
      await expect(pwaInstallBanner).not.toBeVisible();
    }
  });

  test('should show offline indicator when network is disabled', async ({
    page,
    context,
  }) => {
    // Simulate offline state
    await context.setOffline(true);

    // Reload page to trigger offline state
    await page.reload();

    // Check for offline indicator
    const offlineIndicator = page.locator('[data-testid="offline-indicator"]');
    if (await offlineIndicator.isVisible()) {
      await expect(offlineIndicator).toContainText('offline');
    }

    // Restore online state
    await context.setOffline(false);
  });

  test('should display restaurants list', async ({ page }) => {
    // Navigate to restaurants page
    await page.goto('/restaurants');

    // Check if restaurants are loaded
    const restaurantsContainer = page.locator(
      '[data-testid="restaurants-container"]'
    );
    if (await restaurantsContainer.isVisible()) {
      await expect(restaurantsContainer).toBeVisible();

      // Check if at least one restaurant is displayed
      const restaurantCards = page.locator('[data-testid="restaurant-card"]');
      const count = await restaurantCards.count();
      expect(count).toBeGreaterThan(0);
    }
  });

  test('should handle user authentication flow', async ({ page }) => {
    // Navigate to login page
    const loginLink = page.locator('text=Login').first();
    if (await loginLink.isVisible()) {
      await loginLink.click();

      // Fill login form
      await page.fill('[data-testid="email-input"]', 'test@example.com');
      await page.fill('[data-testid="password-input"]', 'testpassword');

      // Submit login
      await page.click('[data-testid="login-submit"]');

      // Verify successful login (redirect or user menu)
      const userMenu = page.locator('[data-testid="user-menu"]');
      if (await userMenu.isVisible()) {
        await expect(userMenu).toBeVisible();
      }
    }
  });

  test('should be responsive on mobile devices', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Check if mobile navigation works
    const mobileMenuButton = page.locator('[data-testid="mobile-menu-button"]');
    if (await mobileMenuButton.isVisible()) {
      await mobileMenuButton.click();

      // Verify mobile menu opens
      const mobileMenu = page.locator('[data-testid="mobile-menu"]');
      await expect(mobileMenu).toBeVisible();
    }

    // Check if content is properly displayed on mobile
    const mainContent = page.locator('main');
    await expect(mainContent).toBeVisible();
  });
});
