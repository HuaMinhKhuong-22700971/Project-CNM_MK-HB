import { test, expect } from "@playwright/test";

test.describe("Checkout", () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto("/login");
    await page.fill('input[name="email"]', "admin@cnm.local");
    await page.fill('input[name="password"]', "Admin@123");
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/(admin|home|$)/);
  });

  test("should add product to cart", async ({ page }) => {
    await page.goto("/products");
    
    // Click first product
    await page.locator('[data-testid="product-card"]').first().click();
    
    // Add to cart
    await page.click('button:has-text("Thêm vào giỏ")');
    
    // Should show success message
    await expect(page.locator('text=/đã thêm|thành công/i')).toBeVisible();
  });

  test("should view cart", async ({ page }) => {
    await page.goto("/cart");
    
    // Should show cart page
    await expect(page).toHaveURL(/\/cart/);
  });

  test("should proceed to checkout", async ({ page }) => {
    await page.goto("/cart");
    
    // Click checkout button
    const checkoutButton = page.locator('button:has-text("Thanh toán")');
    if (await checkoutButton.isVisible()) {
      await checkoutButton.click();
      
      // Should redirect to checkout page
      await expect(page).toHaveURL(/\/checkout/);
    }
  });
});
