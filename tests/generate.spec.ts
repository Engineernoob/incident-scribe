import { test, expect } from "@playwright/test";

test("generates a postmortem", async ({ page }) => {
  await page.goto("http://localhost:3000");

  await page.getByLabel("Title").fill("API latency incident");
  await page
    .getByLabel("Logs / timeline")
    .fill("2026-02-24 12:00:00Z service=api latency degraded");

  await page.getByRole("button", { name: /Postmortem/i }).click();

  await expect(page.getByText("Postmortem")).toBeVisible();
  await expect(page.getByText("Timeline")).toBeVisible();
});
