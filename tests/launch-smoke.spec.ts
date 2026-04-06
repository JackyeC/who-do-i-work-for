import { test, expect } from "@playwright/test";

type Issue = { type: string; detail: string };

function attachRuntimeGuards(page: import("@playwright/test").Page, baseOrigin: string) {
  const issues: Issue[] = [];

  page.on("pageerror", (err) => {
    issues.push({ type: "pageerror", detail: String(err) });
  });

  page.on("console", (msg) => {
    if (msg.type() === "error") issues.push({ type: "console.error", detail: msg.text() });
  });

  page.on("requestfailed", (req) => {
    const u = new URL(req.url());
    // Fonts often fail in headless runs due to network policies; capture but don't fail the test on them.
    const isFont = u.hostname.includes("fonts.googleapis.com") || u.hostname.includes("fonts.gstatic.com");
    if (isFont) {
      issues.push({ type: "requestfailed(font)", detail: `${req.method()} ${req.url()} (${req.failure()?.errorText ?? "failed"})` });
      return;
    }
    issues.push({ type: "requestfailed", detail: `${req.method()} ${req.url()} (${req.failure()?.errorText ?? "failed"})` });
  });

  page.on("response", (res) => {
    const url = res.url();
    // Only treat same-origin API/route failures as hard signals.
    try {
      const u = new URL(url);
      if (u.origin !== baseOrigin) return;
      const status = res.status();
      if (status >= 500) issues.push({ type: "http>=500", detail: `${status} ${url}` });
      if (status >= 400 && status < 500 && !u.pathname.endsWith(".png") && !u.pathname.endsWith(".ico"))
        issues.push({ type: "http4xx", detail: `${status} ${url}` });
    } catch {
      // ignore
    }
  });

  return {
    getIssues: () => issues,
  };
}

async function goAndStabilize(page: import("@playwright/test").Page, path: string) {
  await page.goto(path, { waitUntil: "domcontentloaded" });
  // Give client-side router & data fetch a moment.
  await page.waitForTimeout(1200);
}

test.describe("Launch smoke: games + company search", () => {
  test("home loads without runtime errors", async ({ page, baseURL }) => {
    const baseOrigin = new URL(baseURL!).origin;
    const guard = attachRuntimeGuards(page, baseOrigin);

    await goAndStabilize(page, "/");
    await expect(page).toHaveTitle(/Who Do I Work For/i);

    // Basic “not blank” check.
    await expect(page.getByRole("main").first()).toBeVisible({ timeout: 15_000 });

    const issues = guard.getIssues().filter((i) => !i.type.includes("(font)"));
    expect(issues, `Runtime issues on /:\n${issues.map((i) => `- ${i.type}: ${i.detail}`).join("\n")}`).toEqual([]);
  });

  test("games pages render and allow basic interaction", async ({ page, baseURL }) => {
    const baseOrigin = new URL(baseURL!).origin;
    const guard = attachRuntimeGuards(page, baseOrigin);

    const gamePaths = ["/quiz", "/brand-madness", "/rivalries", "/decision-engine"];

    for (const p of gamePaths) {
      await test.step(`open ${p}`, async () => {
        await goAndStabilize(page, p);
        // If route is protected, it should land somewhere sensible (often /login).
        await expect(page).not.toHaveURL(/\/undefined/);
      });

      await test.step(`interact on ${p}`, async () => {
        // Try a couple of “common” CTAs without hard-coding UI specifics.
        const startLike = page.getByRole("button", { name: /start|begin|play|next|continue/i }).first();
        if (await startLike.isVisible().catch(() => false)) {
          await startLike.click();
          await page.waitForTimeout(800);
        }

        const optionLike = page.getByRole("button", { name: /a|b|c|d/i }).first();
        if (await optionLike.isVisible().catch(() => false)) {
          await optionLike.click();
          await page.waitForTimeout(800);
        }

        // Not blank.
        await expect(page.locator("body")).toContainText(/./, { timeout: 10_000 });
      });
    }

    const issues = guard.getIssues().filter((i) => !i.type.includes("(font)"));
    expect(issues, `Runtime issues on game routes:\n${issues.map((i) => `- ${i.type}: ${i.detail}`).join("\n")}`).toEqual([]);
  });

  test("company search works (or fails gracefully behind auth)", async ({ page, baseURL }) => {
    const baseOrigin = new URL(baseURL!).origin;
    const guard = attachRuntimeGuards(page, baseOrigin);

    await goAndStabilize(page, "/search");

    // If redirected to login, consider it “graceful” as long as page renders and no runtime errors.
    if (page.url().includes("/login")) {
      await expect(page.getByRole("main").first()).toBeVisible();
      const issues = guard.getIssues().filter((i) => !i.type.includes("(font)"));
      expect(issues, `Runtime issues on auth redirect:\n${issues.map((i) => `- ${i.type}: ${i.detail}`).join("\n")}`).toEqual([]);
      return;
    }

    const input =
      page.getByRole("textbox", { name: /search/i }).first().or(page.locator('input[type="search"], input[placeholder*="Search" i], input[placeholder*="company" i]').first());

    await expect(input).toBeVisible({ timeout: 15_000 });

    for (const q of ["google", "acme"]) {
      await test.step(`search: ${q}`, async () => {
        await input.fill(q);
        await page.keyboard.press("Enter");
        await page.waitForTimeout(1500);

        // Either show results, or show an empty-state / request flow; but should not blank/error.
        await expect(page.locator("body")).not.toContainText(/something went wrong|unexpected error/i);

        const firstResultLink = page.getByRole("link").filter({ hasText: new RegExp(q, "i") }).first();
        if (await firstResultLink.isVisible().catch(() => false)) {
          await firstResultLink.click();
          await page.waitForTimeout(1200);
          await expect(page.locator("body")).not.toContainText(/404|not found/i);
        }
      });
    }

    const issues = guard.getIssues().filter((i) => !i.type.includes("(font)"));
    expect(issues, `Runtime issues on /search:\n${issues.map((i) => `- ${i.type}: ${i.detail}`).join("\n")}`).toEqual([]);
  });
});

