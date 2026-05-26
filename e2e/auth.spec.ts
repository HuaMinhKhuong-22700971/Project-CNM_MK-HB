import { test, expect } from "@playwright/test";

test.describe("Authentication", () => {
  test("should register new user", async ({ page }) => {
    await page.goto("/register");
    
    // Fill registration form
    await page.fill('input[name="email"]', `test${Date.now()}@example.com`);
    await page.fill('input[name="password"]', "Test@123456");
    await page.fill('input[name="fullName"]', "Test User");
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Should redirect to login or home
    await expect(page).toHaveURL(/\/(login|home|$)/);
  });

  test("should login with valid credentials", async ({ page }) => {
    await page.goto("/login");
    
    // Fill login form
    await page.fill('input[name="email"]', "admin@cnm.local");
    await page.fill('input[name="password"]', "Admin@123");
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Should redirect to admin dashboard or home
    await expect(page).toHaveURL(/\/(admin|home|$)/);
  });

  test("should show error with invalid credentials", async ({ page }) => {
    await page.goto("/login");
    
    // Fill login form with invalid credentials
    await page.fill('input[name="email"]', "invalid@example.com");
    await page.fill('input[name="password"]', "wrongpassword");
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Should show error message
    await expect(page.locator("text=/invalid|error/i")).toBeVisible();
  });
});
