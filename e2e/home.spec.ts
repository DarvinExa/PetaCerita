import { test, expect } from "@playwright/test";

test("beranda memuat judul utama", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { level: 1, name: /Rencanakan trip bareng/i }),
  ).toBeVisible();
});
