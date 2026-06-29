import { test, expect } from "@playwright/test";

test.describe("Home page", () => {
  test("should display hero section and navigation links", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("h1")).toContainText("پلتفرم ملی تحول دیجیتال در کشاورزی");
    await expect(page.getByRole("link", { name: "ورود" })).toBeVisible();
    await expect(page.getByRole("link", { name: "ثبت‌نام" })).toBeVisible();
  });

  test("should navigate to login page", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "ورود" }).click();
    await expect(page).toHaveURL(/\/login/);
    await expect(page.locator("h1")).toContainText("ورود به پیکسل");
  });

  test("should navigate to register page", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "ثبت‌نام" }).click();
    await expect(page).toHaveURL(/\/register/);
    await expect(page.locator("h1")).toContainText("ثبت‌نام در پیکسل");
  });

  test("should navigate to farmers listing", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "کشاورزان" }).click();
    await expect(page).toHaveURL(/\/farmers/);
    await expect(page.locator("h1")).toContainText("کشاورزان");
  });

  test("should navigate to suppliers listing", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "تأمین‌کنندگان" }).click();
    await expect(page).toHaveURL(/\/suppliers/);
    await expect(page.locator("h1")).toContainText("تأمین‌کنندگان");
  });

  test("should navigate to companies listing", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "شرکت‌ها" }).click();
    await expect(page).toHaveURL(/\/companies/);
    await expect(page.locator("h1")).toContainText("شرکت‌ها و تعاونی‌ها");
  });
});
