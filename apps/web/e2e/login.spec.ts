import { test, expect } from "@playwright/test";

test.describe("Login page", () => {
  test("should display phone input form", async ({ page }) => {
    await page.goto("/login");
    await expect(page.locator("h1")).toContainText("ورود به پیکسل");
    await expect(page.getByPlaceholder("09xxxxxxxxx")).toBeVisible();
  });

  test("should validate phone number format", async ({ page }) => {
    await page.goto("/login");
    await page.getByPlaceholder("09xxxxxxxxx").fill("12345");
    await page.getByRole("button", { name: "ارسال کد تأیید" }).click();
    await expect(page.getByText("شماره موبایل باید با ۰۹ شروع شود")).toBeVisible();
  });

  test("should accept valid phone and show OTP step", async ({ page }) => {
    await page.goto("/login");
    await page.getByPlaceholder("09xxxxxxxxx").fill("09100000002");
    await page.getByRole("button", { name: "ارسال کد تأیید" }).click();
    await expect(page.getByText("کد تأیید ارسال شده را وارد کنید")).toBeVisible();
    await expect(page.getByPlaceholder("000000")).toBeVisible();
  });

  test("should show dev code in non-production", async ({ page }) => {
    await page.goto("/login");
    await page.getByPlaceholder("09xxxxxxxxx").fill("09100000002");
    await page.getByRole("button", { name: "ارسال کد تأیید" }).click();
    await expect(page.getByText(/کد تست:/)).toBeVisible();
  });

  test("should allow going back to phone step", async ({ page }) => {
    await page.goto("/login");
    await page.getByPlaceholder("09xxxxxxxxx").fill("09100000002");
    await page.getByRole("button", { name: "ارسال کد تأیید" }).click();
    await page.getByText("تغییر شماره موبایل").click();
    await expect(page.getByPlaceholder("09xxxxxxxxx")).toBeVisible();
  });
});
