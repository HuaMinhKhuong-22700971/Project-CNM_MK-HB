import { test, expect } from "@playwright/test";

test.describe("Products", () => {
  test("should display products list", async ({ page }) => {
    await page.goto("/products");
    
    // Should show product cards
    await expect(page.locator('[data-testid="product-card"]').first()).toBeVisible();
  });

  test("should filter products by category", async ({ page }) => {
    await page.goto("/products");
    
    // Select a category filter
    await page.click('button:has-text("Danh mục")');
    await page.click('text=/CPU|Mainboard/i');
    
    // Wait for filter to apply
    await page.waitForLoadState("networkidle");
    
    // Should still show products
    await expect(page.locator('[data-testid="product-card"]').first()).toBeVisible();
  });

  test("should navigate to product detail", async ({ page }) => {
    await page.goto("/products");
    
    // Click first product
    await page.locator('[data-testid="product-card"]').first().click();
    
    // Should be on product detail page
    await expect(page).toHaveURL(/\/products\/\d+/);
    await expect(page.locator('h1').first()).toBeVisible();
  });
});
