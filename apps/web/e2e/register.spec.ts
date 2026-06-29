import { test, expect } from "@playwright/test";

test.describe("Register page", () => {
  test("should display registration form with role selection", async ({ page }) => {
    await page.goto("/register");
    await expect(page.locator("h1")).toContainText("ثبت‌نام در پیکسل");
    await expect(page.getByText("کشاورز")).toBeVisible();
    await expect(page.getByText("تأمین‌کننده")).toBeVisible();
    await expect(page.getByText("شرکت/تعاونی")).toBeVisible();
  });

  test("should have phone, firstName, lastName inputs", async ({ page }) => {
    await page.goto("/register");
    await expect(page.getByPlaceholder("09xxxxxxxxx")).toBeVisible();
    await expect(page.getByPlaceholder("نام")).toBeVisible();
    await expect(page.getByPlaceholder("نام خانوادگی")).toBeVisible();
  });

  test("should select different roles", async ({ page }) => {
    await page.goto("/register");
    await page.getByText("تأمین‌کننده").click();
    await expect(page.getByText("عرضه‌کننده نهاده و تجهیزات")).toBeVisible();
    await page.getByText("شرکت/تعاونی").click();
    await expect(page.getByText("فرآوری، بازرگانی و صنعت")).toBeVisible();
  });
});
