import { expect, test } from "@playwright/test";

const keyRoutes = [
  "/",
  "/electric-dirt-bikes",
  "/electric-bikes",
  "/electric-wheelchairs",
  "/accessories",
  "/products/xceed",
  "/news",
  "/blog",
  "/search",
  "/contact",
  "/checkout?productSlug=xceed",
  "/admin/login",
];

for (const viewport of [
  { name: "mobile", width: 390, height: 844 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "desktop", width: 1440, height: 1000 },
]) {
  test(`key routes render without overflow at ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    const pageErrors: string[] = [];
    page.on("pageerror", (error) => pageErrors.push(error.message));
    for (const route of keyRoutes) {
      const response = await page.goto(route, { waitUntil: "domcontentloaded" });
      expect(response?.status(), route).toBe(200);
      await expect(page.locator("h1"), route).toHaveCount(1);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow, `${route} horizontal overflow`).toBeLessThanOrEqual(1);
    }
    expect(pageErrors).toEqual([]);
  });
}

test("content lists are paginated and images load", async ({ page }) => {
  await page.goto("/news", { waitUntil: "domcontentloaded" });
  await expect(page.locator(".content-card")).toHaveCount(12);
  await expect(page.locator(".content-pagination")).toContainText("Page 1 of");
  await expect.poll(() => page.locator(".content-card img").first().evaluate((image) => (image as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);

  await page.goto("/blog", { waitUntil: "domcontentloaded" });
  await expect(page.locator(".content-card")).toHaveCount(12);
  await expect(page.locator(".content-pagination")).toContainText("Page 1 of");
});

test("product facts and managed catalog stay consistent", async ({ page }) => {
  await page.goto("/electric-dirt-bikes");
  await expect(page.locator("body")).toContainText("$3,099.00");
  await expect(page.locator("body")).not.toContainText("$2,099.00");
  await expect(page.locator("body")).toContainText("8,500W peak");

  await page.goto("/electric-wheelchairs");
  await expect(page.locator("body")).toContainText("350 lb");
  await expect(page.locator("body")).not.toContainText("250 lb");

  await page.goto("/accessories", { waitUntil: "domcontentloaded" });
  await expect(page.locator(".category-product-card")).toHaveCount(3);
  await expect.poll(() => page.locator(".category-product-card img").first().evaluate((image) => (image as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
});

test("SEO, accessibility and error handling are present", async ({ page, request }) => {
  for (const route of ["/", "/electric-dirt-bikes", "/electric-bikes", "/electric-wheelchairs", "/accessories", "/search", "/privacy", "/terms", "/checkout"]) {
    const response = await request.get(route);
    expect(response.status(), route).toBe(200);
    expect(await response.text(), route).toMatch(/<link rel="canonical" href="https:\/\/cheerdmotors\.com/);
  }
  await page.goto("/contact", { waitUntil: "domcontentloaded" });
  await expect(page.locator(".contact-form label")).toHaveCount(7);
  await page.goto("/does-not-exist-audit", { waitUntil: "domcontentloaded" });
  await expect(page.locator("h1")).toHaveText("This page is not available.");
});

test("protected APIs reject unauthenticated requests and test analytics is not stored", async ({ request }) => {
  for (const route of ["/api/admin/posts", "/api/admin/analytics", "/api/admin/realtime", "/api/cron/news", "/api/cron/google-search"]) {
    const response = await request.get(route);
    expect(response.status(), route).toBe(401);
  }
  expect((await request.get("/api/cron/blog")).status()).toBe(404);
  const analytics = await request.post("/api/analytics/track", {
    data: { type: "analytics_test", visitorId: "playwright-audit", sessionId: "playwright-audit", page: "/", environment: "localhost", payload: { testTraffic: true } },
  });
  expect(analytics.status()).toBe(200);
  expect(await analytics.json()).toMatchObject({ ok: true, recorded: false });
  const health = await request.get("/api/health");
  expect(health.status()).toBe(200);
  expect(await health.json()).toMatchObject({ ok: true, store: { configured: true } });
  expect(health.headers()["x-content-type-options"]).toBe("nosniff");
  expect(health.headers()["x-frame-options"]).toBe("DENY");
});
