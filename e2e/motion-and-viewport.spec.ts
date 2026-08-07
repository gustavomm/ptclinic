import { test, expect } from "@playwright/test";

test.describe("reduced motion", () => {
  // Not `test.use({ reducedMotion: "reduce" })`: the installed playwright
  // 1.62.1 test types omit `reducedMotion`/`forcedColors`/`contrast`/`screen`
  // from `PlaywrightTestOptions` (confirmed by reading
  // node_modules/playwright/types/test.d.ts — they're documented in a
  // comment but never declared as properties), so `test.use` doesn't
  // type-check, and at runtime the option silently fails to apply before the
  // first navigation (verified: even a bare `data:` page reports
  // `matchMedia(...).matches === false` under `test.use`). `page.emulateMedia`
  // is backed by a different, complete type (playwright-core's
  // `types.d.ts`) and reliably applies the media feature, so it is used
  // directly instead.
  test("all revealed content is visible immediately", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    const hidden = await page
      .locator('[data-revealed]')
      .evaluateAll((els) =>
        els.filter((e) => getComputedStyle(e).opacity !== "1").length,
      );
    expect(hidden).toBe(0);
  });
});

test.describe("no javascript", () => {
  test.use({ javaScriptEnabled: false });

  test("revealed content is still visible", async ({ page }) => {
    await page.goto("/");
    const hidden = await page
      .locator('[data-revealed]')
      .evaluateAll((els) =>
        els.filter((e) => getComputedStyle(e).opacity !== "1").length,
      );
    expect(hidden).toBe(0);
  });
});

const VIEWPORTS = [
  { name: "mobile", width: 375, height: 812 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "desktop", width: 1440, height: 900 },
];

for (const vp of VIEWPORTS) {
  test(`no horizontal overflow at ${vp.name} (${vp.width}px)`, async ({ page }) => {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.goto("/");
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );
    expect(overflow, `horizontal scrollbar at ${vp.width}px`).toBe(false);
  });
}

test("mobile menu opens, traps focus, and closes on Escape", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/");
  const trigger = page.getByRole("button", { name: "Abrir menu" });
  await trigger.click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await page.keyboard.press("Tab");
  await expect(dialog.locator(":focus")).toHaveCount(1);
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
});

// The top bar wrapped to four lines at 375px and ate a third of the viewport:
// the full string is ~45 characters at 0.28em tracking, far wider than a phone.
// The descriptive phrase is now hidden below `sm`. Guard the rendered height
// rather than the class, so any future copy or tracking change is caught too.
for (const width of [320, 375, 414, 768, 1440]) {
  test(`top bar stays on one line at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    await page.goto("/");
    const height = await page.evaluate(
      () => document.querySelector(".bg-ink")!.getBoundingClientRect().height,
    );
    expect(height, `top bar wrapped at ${width}px`).toBeLessThan(48);
  });
}
