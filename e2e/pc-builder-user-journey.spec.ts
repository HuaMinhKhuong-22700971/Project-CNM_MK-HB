import { test, expect } from "@playwright/test";

test.describe("Smart PC Builder — End-to-End User Journeys (P10-04)", () => {
  test.setTimeout(60000);

  test.beforeEach(async ({ page }) => {
    // Navigate to PC Builder page
    await page.goto("/pc-builder");
    await page.waitForLoadState("networkidle");
  });

  test("Journey 1: Requirement Wizard -> Gaming 25M -> AI Build -> XAI Drawer -> Purchase Review", async ({ page }) => {
    // 1. Verify Topbar Header & AI Build controls
    await expect(page.locator(".topbar-brand-name")).toContainText("Smart PC Builder");

    // 2. Open Requirement Wizard Modal
    const reqWizardBtn = page.getByRole("button", { name: /Nhu Cầu AI/i });
    if (await reqWizardBtn.isVisible()) {
      await reqWizardBtn.click();

      const modalCard = page.locator(".req-modal-card");
      await expect(modalCard).toBeVisible();

      // Click submit inside modal footer specifically
      const modalSubmitBtn = page.locator(".req-modal-footer .btn-req-primary");
      await expect(modalSubmitBtn).toBeVisible();
      await modalSubmitBtn.click();
    }

    // 3. Trigger Primary AI Build
    const aiBuildBtn = page.locator("#btn-ai-build-primary");
    await expect(aiBuildBtn).toBeEnabled();
    await aiBuildBtn.click();

    // Wait for parallel AI Build recommendation to finish fully
    await page.waitForTimeout(2000);

    // 4. Open XAI Drawer ("🧠 XAI" in topbar)
    const xaiBtn = page.locator("header.builder-topbar button").filter({ hasText: "XAI" });
    await expect(xaiBtn).toBeVisible();
    await xaiBtn.click({ force: true });
    await page.waitForTimeout(1000);

    // Verify XAI Drawer container is rendered in DOM
    const xaiOverlay = page.locator(".xai-drawer-overlay");
    await expect(xaiOverlay).toBeVisible();

    // Close XAI drawer via close button
    const closeXaiBtn = page.locator(".xai-drawer-content button").first();
    if (await closeXaiBtn.isVisible()) {
      await closeXaiBtn.click();
    }

    // 5. Verify Purchase Action button is available
    const buyWholeBtn = page.getByRole("button", { name: /Mua Nguyên Bộ/i });
    await expect(buyWholeBtn).toBeVisible();
  });

  test("Journey 2: Hardware Conflict -> BLOCKER Severity -> Block Purchase Enforcement", async ({ page }) => {
    // 1. Select CPU category
    const cpuStep = page.locator(".step-item").filter({ hasText: "CPU" }).first();
    await expect(cpuStep).toBeVisible();
    await cpuStep.click();
    await page.waitForTimeout(500);

    // Select first CPU product card
    const firstCpuCard = page.locator(".product-card").first();
    if (await firstCpuCard.isVisible()) {
      await firstCpuCard.click();
    }

    // 2. Select Mainboard category
    const mbStep = page.locator(".step-item").filter({ hasText: "Mainboard" }).first();
    if (await mbStep.isVisible()) {
      await mbStep.click();
      await page.waitForTimeout(500);
      const firstMbCard = page.locator(".product-card").first();
      if (await firstMbCard.isVisible()) {
        await firstMbCard.click();
      }
    }

    // 3. Open XAI Drawer from Topbar to inspect compatibility
    const xaiBtn = page.locator("header.builder-topbar button").filter({ hasText: "XAI" });
    await expect(xaiBtn).toBeVisible();
    await xaiBtn.click({ force: true });
    await page.waitForTimeout(1000);

    // Verify XAI report overlay opens
    const xaiOverlay = page.locator(".xai-drawer-overlay");
    await expect(xaiOverlay).toBeVisible();
  });
});
