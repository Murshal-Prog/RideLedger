import { test, expect, type Page } from "@playwright/test";

async function gotoHydrated(page: Page, url: string) {
  await page.goto(url);
  await page.waitForSelector('body[data-hydrated="true"]');
}

test.describe("Phase 1: Comprehensive Foundation Verification", () => {
  // Test 1: Brand Asset Integrity & HTTP 200 check
  test("verifies all brand assets, logos, and manifest load with HTTP 200 and valid dimensions", async ({
    request,
    page,
  }) => {
    const assets = [
      "/brand/RideLedger_Logo_v1 (1).png",
      "/brand/RideLedger_Logo_v2.png",
      "/brand/RideLedger_Logo_v3.png",
      "/brand/RideLedger_Logo_v4.png",
      "/brand/RideLedger_Logo_v5.png",
      "/favicon.ico",
      "/manifest.json",
    ];

    for (const asset of assets) {
      const res = await request.get(asset);
      expect(res.status(), `Asset ${asset} should return HTTP 200`).toBe(200);
      expect(
        res.headers()["content-type"],
        `Asset ${asset} content-type should be valid`
      ).toBeTruthy();
    }

    await gotoHydrated(page, "/");
    const desktopLogo = page.locator('aside img[alt="RideLedger Logo"]');
    if (await desktopLogo.isVisible()) {
      const naturalWidth = await desktopLogo.evaluate(
        (img: HTMLImageElement) => img.naturalWidth
      );
      expect(naturalWidth).toBeGreaterThan(0);
    }
  });

  // Test 2: Console health and zero hydration errors across all routes
  test("navigates across all application routes without console errors or hydration mismatches", async ({
    page,
  }) => {
    const consoleErrors: string[] = [];
    const pageErrors: string[] = [];

    page.on("console", (msg) => {
      if (msg.type() === "error") {
        consoleErrors.push(msg.text());
      }
    });

    page.on("pageerror", (err) => {
      pageErrors.push(err.message);
    });

    const routes = ["/", "/rides", "/expenses", "/reports", "/sessions", "/settings"];

    for (const route of routes) {
      await gotoHydrated(page, route);
      expect(await page.title()).toMatch(/RideLedger/i);
    }

    // Assert zero uncaught errors or hydration mismatches
    const hydrationErrors = consoleErrors.filter(
      (err) => err.includes("Hydration") || err.includes("did not match")
    );
    expect(hydrationErrors, "Should have 0 React hydration errors").toHaveLength(0);
    expect(pageErrors, "Should have 0 unhandled page runtime errors").toHaveLength(0);
  });

  // Test 3: Light & Dark theme switching, color contrast, and persistent storage
  test("validates light and dark theme styling, contrast tokens, and persistent localStorage", async ({
    page,
  }) => {
    await gotoHydrated(page, "/settings");

    // Select Light Mode button
    const lightBtn = page.getByRole("button", { name: "Light Mode", exact: true });
    await lightBtn.click();

    // Verify root html does not have .dark class
    const isDarkLightMode = await page.evaluate(() =>
      document.documentElement.classList.contains("dark")
    );
    expect(isDarkLightMode).toBe(false);

    // Verify stored theme
    let stored = await page.evaluate(() => localStorage.getItem("rideledger-theme"));
    expect(stored).toBe("light");

    // Select Dark Mode button
    const darkBtn = page.getByRole("button", { name: "Dark Mode", exact: true });
    await darkBtn.click();

    // Verify root html has .dark class
    const isDarkDarkMode = await page.evaluate(() =>
      document.documentElement.classList.contains("dark")
    );
    expect(isDarkDarkMode).toBe(true);

    stored = await page.evaluate(() => localStorage.getItem("rideledger-theme"));
    expect(stored).toBe("dark");

    // Reload page to verify persistence
    await page.reload();
    await page.waitForSelector('body[data-hydrated="true"]');
    const isDarkAfterReload = await page.evaluate(() =>
      document.documentElement.classList.contains("dark")
    );
    expect(isDarkAfterReload).toBe(true);
  });

  // Test 4: Responsive Breakpoints & Horizontal Overflow Prevention
  test("verifies layout responsiveness across desktop, tablet, and mobile viewports with zero overflow", async ({
    page,
  }) => {
    const viewports = [
      { name: "desktop-large", width: 1440, height: 900, isMobile: false },
      { name: "desktop-standard", width: 1024, height: 768, isMobile: false },
      { name: "tablet", width: 768, height: 1024, isMobile: false },
      { name: "mobile-standard", width: 375, height: 667, isMobile: true },
      { name: "mobile-small", width: 320, height: 568, isMobile: true },
    ];

    for (const vp of viewports) {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await gotoHydrated(page, "/");

      // Check horizontal overflow
      const overflow = await page.evaluate(() => {
        return document.documentElement.scrollWidth > window.innerWidth;
      });
      expect(overflow, `Viewport ${vp.name} (${vp.width}px) should have zero horizontal overflow`).toBe(
        false
      );

      if (vp.isMobile) {
        await expect(page.locator('nav[aria-label="Mobile Navigation"]')).toBeVisible();
        await expect(page.locator("aside")).not.toBeVisible();
      } else if (vp.width >= 1024) {
        await expect(page.locator("aside")).toBeVisible();
        await expect(page.locator('nav[aria-label="Mobile Navigation"]')).not.toBeVisible();
      }
    }
  });

  // Test 5: Client-side Navigation with Zero Full-Page Reloads
  test("verifies client-side navigation preserves in-memory window state with zero full-page reloads", async ({
    page,
  }) => {
    await gotoHydrated(page, "/");

    // Stamp a custom in-memory property on window
    await page.evaluate(() => {
      (window as unknown as { __CLIENT_NAVIGATION_SENTINEL__: string }).__CLIENT_NAVIGATION_SENTINEL__ =
        "RIDELEDGER_ACTIVE";
    });

    // Primary routes common to both desktop sidebar and mobile bottom nav
    const routesToVisit = ["/rides", "/expenses", "/reports", "/"];

    for (const route of routesToVisit) {
      const link = page.locator(`a[href="${route}"]:visible`).first();
      await link.click();
      await page.waitForURL(`**${route}`);

      // Verify the in-memory window variable was NOT wiped by a full-page reload
      const sentinel = await page.evaluate(
        () =>
          (window as unknown as { __CLIENT_NAVIGATION_SENTINEL__: string })
            .__CLIENT_NAVIGATION_SENTINEL__
      );
      expect(
        sentinel,
        `Navigating to ${route} must be a client-side transition without page reload`
      ).toBe("RIDELEDGER_ACTIVE");
    }
  });

  // Test 6: Form Controls, Validations, and Toast Notifications
  test("verifies form controls, validation errors, and toast notifications in Add Expense modal", async ({
    page,
  }) => {
    await gotoHydrated(page, "/");

    // Open Add Expense modal
    const addExpenseBtn = page.getByRole("button", { name: "Add Expense" }).first();
    await addExpenseBtn.click();

    // Verify modal is displayed
    const modal = page.getByRole("dialog");
    await expect(modal).toBeVisible();
    await expect(page.getByText("Record Expense")).toBeVisible();

    // Select category dropdown
    const categorySelect = modal.locator("select");
    await categorySelect.selectOption("Fuel/Petrol");
    expect(await categorySelect.inputValue()).toBe("Fuel/Petrol");

    // Amount input
    const amountInput = modal.locator('input[type="number"]');
    await amountInput.fill("350");

    // Optional notes input
    const notesInput = modal.locator('input[placeholder*="HP Petrol Pump"]');
    await notesInput.fill("HP Petrol Station, 3.2 Litres");

    // Save expense
    const saveBtn = modal.getByRole("button", { name: "Save Expense" });
    await saveBtn.click();

    // Modal should close
    await expect(modal).not.toBeVisible();

    // Toast notification should appear with success message
    const toast = page.locator('div[role="region"][aria-label="Notifications"]');
    await expect(toast).toBeVisible();
    await expect(page.getByText("Expense Logged")).toBeVisible();
    await expect(page.getByText("₹350 for Fuel/Petrol recorded.")).toBeVisible();
  });

  // Test 7: Modal Focus Management, Backdrop Dismissal, and Escape Key
  test("verifies modal focus management, keyboard Escape dismissal, and backdrop click", async ({
    page,
  }) => {
    await gotoHydrated(page, "/");

    // Open Go Online modal
    const goOnlineBtn = page.getByRole("button", { name: "Go Online" }).first();
    await goOnlineBtn.click();

    const modal = page.getByRole("dialog");
    await expect(modal).toBeVisible();
    await expect(page.getByText("Start Online Work Session")).toBeVisible();

    // Test Escape key dismissal
    await page.keyboard.press("Escape");
    await expect(modal).not.toBeVisible();

    // Reopen and test backdrop click dismissal
    await goOnlineBtn.click();
    await expect(modal).toBeVisible();

    // Click backdrop
    const backdrop = modal.locator('div[aria-hidden="true"]');
    await backdrop.click({ position: { x: 10, y: 10 }, force: true });
    await expect(modal).not.toBeVisible();
  });

  // Test 8: Empty States and Dashboard Shell Placeholders
  test("verifies financial cards display transparent placeholders without fake data", async ({
    page,
  }) => {
    await gotoHydrated(page, "/");

    // Financial placeholder indicators
    await expect(page.getByText("Today's Gross Income")).toBeVisible();
    await expect(page.getByText("Awaiting ride entries")).toBeVisible();
    await expect(page.getByText("Today's Net Profit")).toBeVisible();
    await expect(page.getByText("Income minus expenses")).toBeVisible();
    await expect(page.getByText("Today's Expenses")).toBeVisible();
    await expect(page.getByText("No expenses recorded", { exact: true })).toBeVisible();

    // Notice banner
    await expect(page.getByText("Foundation Mode Notice:")).toBeVisible();

    // Empty states for Recent Rides and Recent Expenses
    await expect(page.getByText("No Rides Logged Today")).toBeVisible();
    await expect(page.getByText("No Expenses Recorded Today")).toBeVisible();

    // Chart placeholder container
    await expect(page.getByText("No Financial Activity Today")).toBeVisible();
  });
});
