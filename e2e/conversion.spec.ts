import { test, expect } from "@playwright/test";

const WHATSAPP_DEEPLINK = "https://wa.me/message/FJNBBFEBI6V5O1";

test.describe("Google Ads conversion route", () => {
  test("/whatsapp redirects to the WhatsApp deep link", async ({ request }) => {
    const res = await request.get("/whatsapp", { maxRedirects: 0 });
    expect([301, 302, 307, 308]).toContain(res.status());
    expect(res.headers()["location"]).toBe(WHATSAPP_DEEPLINK);
  });

  test("/whatsapp is reachable and not a 404", async ({ request }) => {
    const res = await request.get("/whatsapp", { maxRedirects: 0 });
    expect(res.status()).not.toBe(404);
  });
});
