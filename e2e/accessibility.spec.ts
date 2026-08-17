import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const ROUTES = [
  "/",
  "/pilates",
  "/especialidades",
  "/especialidades/fisioterapia-neurologica",
  "/unidades",
  "/unidades/consolacao",
  "/blog",
  "/blog/fisioterapia-apos-avc",
];

for (const route of ROUTES) {
  test(`${route} has no critical or serious axe violations`, async ({ page }) => {
    await page.goto(route);
    // Reveal-wrapped content (above-the-fold cards, teasers) fades in over a
    // 700ms CSS transition once IntersectionObserver marks it data-revealed.
    // Scanning mid-transition makes axe measure a transient low-opacity frame
    // as a color-contrast failure, which does not reflect the settled page a
    // real visitor reads. Wait for every currently-revealed element to finish
    // transitioning before scanning.
    await page.waitForFunction(() =>
      Array.from(document.querySelectorAll('[data-revealed="true"]')).every(
        (el) => getComputedStyle(el).opacity === "1",
      ),
    );
    // wcag22aa included deliberately: it carries the `target-size` rule, which
    // is the site-wide guard for the 44px tap-target floor. WhatsAppLink's
    // `bare` variant enforces no minimum of its own (Task 8, parked finding),
    // so this is where an undersized CTA gets caught.
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag22aa"])
      .analyze();
    const blocking = results.violations.filter(
      (v) => v.impact === "critical" || v.impact === "serious",
    );
    expect(blocking, JSON.stringify(blocking.map((v) => v.id))).toEqual([]);
  });

  test(`${route} has exactly one h1 and declares pt-BR`, async ({ page }) => {
    await page.goto(route);
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator("html")).toHaveAttribute("lang", "pt-BR");
  });

  test(`${route} has alt text on every image`, async ({ page }) => {
    await page.goto(route);
    const missing = await page.locator("img:not([alt])").count();
    expect(missing).toBe(0);
  });
}
