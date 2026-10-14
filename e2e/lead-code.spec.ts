import { test, expect, type BrowserContext, type Page } from "@playwright/test";

/**
 * The click → /whatsapp → wa.me bridge, end to end.
 *
 * Every browser request off localhost is blocked. GTM loads in local builds,
 * and its rule "Click URL contains /whatsapp" would otherwise record a REAL
 * Google Ads conversion each time these tests click a CTA. (The server side
 * cannot write to the Sheet either: playwright.config.ts blanks the webhook.)
 *
 * /whatsapp itself is fetched without following its redirect, and the browser
 * is shown a stub instead: Playwright does not intercept the second hop of a
 * redirect, so letting it through would load the real wa.me.
 */
async function isolate(context: BrowserContext, redirects: string[]) {
  await context.route("**/*", async (route) => {
    const url = new URL(route.request().url());
    if (url.hostname !== "localhost") return route.abort();
    if (url.pathname !== "/whatsapp") return route.continue();
    const response = await route.fetch({ maxRedirects: 0 });
    redirects.push(response.headers()["location"] ?? "");
    const setCookie = response.headers()["set-cookie"];
    return route.fulfill({
      status: 200,
      contentType: "text/plain",
      body: "stub",
      headers: setCookie ? { "set-cookie": setCookie } : {},
    });
  });
}

const LANDING = "/pilates?utm_source=google&utm_medium=cpc&utm_campaign=e2e&gclid=E2E-GCLID";
const pilatesCta = (page: Page) => page.locator('main .redirect-whatsapp[href="/whatsapp"]').first();
const textOf = (url: string) => new URL(url).searchParams.get("text") ?? "";

let redirects: string[];

test.beforeEach(async ({ context }) => {
  redirects = [];
  await isolate(context, redirects);
});

test("a click lands on WhatsApp with a code that names the ad channel", async ({ page }) => {
  await page.goto(LANDING);
  await Promise.all([page.waitForURL("**/whatsapp"), pilatesCta(page).click()]);
  expect(redirects).toHaveLength(1);
  expect(redirects[0].startsWith("https://wa.me/5511989172311?text=")).toBe(true);
  expect(textOf(redirects[0])).toMatch(
    /^Código de atendimento: VY-G[A-HJ-NP-Z2-9]{5}\n\nOlá, gostaria de informações sobre o Pilates\.$/,
  );
});

test("the dataLayer event and the WhatsApp message carry the same lead_code", async ({ page, context }) => {
  await page.goto(LANDING);
  // Stop the navigation after every click handler has run, to inspect the page.
  await page.evaluate(() =>
    window.addEventListener("click", (e) => {
      if ((e.target as Element).closest('a[href="/whatsapp"]')) e.preventDefault();
    }),
  );
  await pilatesCta(page).click();

  const event = await page.evaluate(() =>
    (window as unknown as { dataLayer: Record<string, unknown>[] }).dataLayer.find(
      (e) => e.event === "whatsapp_click",
    ),
  );
  expect(event).toMatchObject({
    channel: "google_ads",
    campaign: "e2e",
    service: "pilates",
    placement: "/pilates",
    source_page: "/pilates",
  });
  expect(event?.lead_code).toMatch(/^VY-G[A-HJ-NP-Z2-9]{5}$/);

  const cookie = (await context.cookies("http://localhost:3000/whatsapp")).find((c) => c.name === "vyta_wa");
  expect(cookie).toBeDefined();
  expect(cookie?.path).toBe("/whatsapp");

  await page.goto("/whatsapp");
  expect(textOf(redirects[0])).toMatch(new RegExp(`^Código de atendimento: ${event?.lead_code}\\n`));

  // The route consumed the cookie: a second visit cannot replay the code.
  const left = await context.cookies("http://localhost:3000/whatsapp");
  expect(left.find((c) => c.name === "vyta_wa")).toBeUndefined();
});

test("the footer link carries the code too, and asks about Pilates on /pilates", async ({ page }) => {
  await page.goto(LANDING);
  const footerLink = page.locator("footer .redirect-whatsapp");
  await footerLink.scrollIntoViewIfNeeded();
  await Promise.all([page.waitForURL("**/whatsapp"), footerLink.click()]);
  expect(textOf(redirects[0])).toMatch(
    /^Código de atendimento: VY-G[A-HJ-NP-Z2-9]{5}\n\nOlá, gostaria de informações sobre o Pilates\.$/,
  );
});

test("attribution survives a later direct visit (first and last touch)", async ({ page }) => {
  await page.goto(LANDING);
  await page.goto("/"); // typed URL, no referrer, no tags
  const stored = await page.evaluate(() => ({
    first: JSON.parse(localStorage.getItem("vyta_attr_first") ?? "null"),
    last: JSON.parse(localStorage.getItem("vyta_attr_last") ?? "null"),
  }));
  expect(stored.first).toMatchObject({ channel: "google_ads", gclid: "E2E-GCLID", landing: "/pilates" });
  expect(stored.last).toMatchObject({ channel: "google_ads" });
});
