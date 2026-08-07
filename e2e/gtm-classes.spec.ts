import { test, expect } from "@playwright/test";

const ROUTES = [
  "/",
  "/pilates",
  "/especialidades",
  "/especialidades/fisioterapia-neurologica",
  "/unidades",
  "/unidades/consolacao",
  "/unidades/pinheiros",
  "/blog",
  "/blog/fisioterapia-apos-avc",
];

for (const route of ROUTES) {
  test(`${route} carries every GTM conversion class`, async ({ page }) => {
    await page.goto(route);
    for (const cls of [
      "redirect-whatsapp",
      "redirect-phone",
      "redirect-email",
      "redirect-instagram",
    ]) {
      expect(await page.locator(`.${cls}`).count(), cls).toBeGreaterThan(0);
    }
  });

  test(`${route} points every WhatsApp CTA at /whatsapp`, async ({ page }) => {
    await page.goto(route);
    const hrefs = await page.locator(".redirect-whatsapp").evaluateAll((els) =>
      els.map((e) => e.getAttribute("href")),
    );
    expect(hrefs.length).toBeGreaterThan(0);
    for (const href of hrefs) expect(href).toBe("/whatsapp");
  });
}

test("GTM container is present", async ({ page }) => {
  await page.goto("/");
  const html = await page.content();
  expect(html).toContain("GTM-NNBD3887");
});
