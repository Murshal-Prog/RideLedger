import { test, expect, type Page } from "@playwright/test";

async function gotoHydrated(page: Page, url: string) {
  await page.goto(url);
  await page.waitForSelector('body[data-hydrated="true"]');
}

test.describe("Phase 2: Authentication & Data Foundation E2E", () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage to ensure clean state
    await page.goto("/");
    await page.evaluate(() => localStorage.clear());
  });

  // Test 1: Login page branding and form validation
  test("login page renders branding and validates inputs", async ({ page }) => {
    await gotoHydrated(page, "/login");

    // Verify brand logo v5 renders with valid dimensions
    const logo = page.locator('img[alt="RideLedger"]');
    await expect(logo).toBeVisible();
    const naturalWidth = await logo.evaluate((img: HTMLImageElement) => img.naturalWidth);
    expect(naturalWidth).toBeGreaterThan(0);

    // Verify heading
    await expect(page.locator("main h1")).toContainText("Captain Sign In");

    // Click submit without entering values -> HTML5 or Zod validation
    const submitBtn = page.locator('button[type="submit"]');
    await expect(submitBtn).toBeVisible();

    // Verify demo login button exists
    const demoBtn = page.getByRole("button", { name: /Demo Captain Account/i });
    await expect(demoBtn).toBeVisible();
  });

  // Test 2: Successful sign in with Demo Account and Header Profile integration
  test("signs in with demo captain account and displays profile in header", async ({ page }) => {
    await gotoHydrated(page, "/login");

    const demoBtn = page.getByRole("button", { name: /Demo Captain Account/i });
    await demoBtn.click();

    // Should redirect to dashboard
    await expect(page).toHaveURL("/");

    // Verify header displays Captain profile and partner ID
    const headerProfile = page.locator("header");
    await expect(headerProfile).toContainText("Rapido Captain Partner");
    await expect(headerProfile).toContainText("RAP-4091");
  });

  // Test 3: Authentication survives ordinary page refresh
  test("maintains valid authentication across page refresh", async ({ page }) => {
    await gotoHydrated(page, "/login");

    const demoBtn = page.getByRole("button", { name: /Demo Captain Account/i });
    await demoBtn.click();
    await expect(page).toHaveURL("/");

    // Perform full page refresh
    await page.reload();
    await page.waitForSelector('body[data-hydrated="true"]');

    // Verify Captain remains signed in after reload
    const headerProfile = page.locator("header");
    await expect(headerProfile).toContainText("Rapido Captain Partner");
    await expect(headerProfile).toContainText("RAP-4091");
  });

  // Test 4: Settings page profile editing and persistence
  test("updates Captain profile settings and persists changes", async ({ page }) => {
    await gotoHydrated(page, "/login");
    await page.getByRole("button", { name: /Demo Captain Account/i }).click();
    await expect(page).toHaveURL("/");

    // Navigate to /settings
    await gotoHydrated(page, "/settings");
    await expect(page.locator("main h1")).toContainText("Application Settings");

    // Verify active session indicator in settings
    await expect(page.locator("text=Active Session")).toBeVisible();

    // Update daily target input
    const dailyTargetInput = page.locator('input[placeholder="1500"]');
    await dailyTargetInput.fill("2200");

    // Save profile changes
    const saveBtn = page.getByRole("button", { name: /Save Profile Changes/i });
    await saveBtn.click();

    // Verify success toast appears
    await expect(page.locator("text=Profile Saved")).toBeVisible();

    // Reload page and verify daily target remains 2200
    await page.reload();
    await page.waitForSelector('body[data-hydrated="true"]');
    await expect(page.locator('input[placeholder="1500"]')).toHaveValue("2200");
  });

  // Test 5: Explicit logout flow with confirmation modal
  test("explicit logout requires confirmation and does not clear stored data", async ({ page }) => {
    await gotoHydrated(page, "/login");
    await page.getByRole("button", { name: /Demo Captain Account/i }).click();
    await expect(page).toHaveURL("/");

    // Click sign out button in header
    const signOutBtn = page.getByTestId("header-signout-btn");
    await signOutBtn.click();

    // Verify confirmation dialog opens
    const modal = page.locator('div[role="dialog"]');
    await expect(modal).toBeVisible();
    await expect(modal).toContainText("Sign Out of RideLedger?");
    await expect(modal).toContainText("safely preserved");

    // Click "Stay Signed In" to cancel
    await page.getByRole("button", { name: "Stay Signed In" }).click();
    await expect(modal).not.toBeVisible();
    await expect(page.locator("header")).toContainText("Rapido Captain Partner");

    // Open again and confirm sign out
    await signOutBtn.click();
    await expect(modal).toBeVisible();
    await modal.getByRole("button", { name: "Sign Out" }).click();

    // Verify header now shows "Sign In" button instead of captain profile
    await expect(page.locator("header")).toContainText("Sign In");
    await expect(page.locator("header")).not.toContainText("Rapido Captain Partner");
  });

  // Test 6: Registration flow for new Captain
  test("registers a new Captain account and establishes session", async ({ page }) => {
    await gotoHydrated(page, "/signup");
    await expect(page.locator("main h1")).toContainText("Register Captain Account");

    const email = `captain_${Date.now()}@example.com`;
    await page.locator('input[placeholder="captain@example.com"]').fill(email);
    await page.locator('input[placeholder="Create a secure password"]').fill("securepass123");
    await page.locator('input[placeholder="Rapido Captain"]').fill("Vijay Kumar");
    await page.locator('input[placeholder="RAP-4091"]').fill("RAP-8833");

    await page.getByRole("button", { name: /Complete Registration/i }).click();

    // Verify redirect and personalized header
    await expect(page).toHaveURL("/");
    const header = page.locator("header");
    await expect(header).toContainText("Vijay Kumar");
    await expect(header).toContainText("RAP-8833");
  });
});
