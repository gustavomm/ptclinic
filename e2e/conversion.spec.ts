import { test, expect } from "@playwright/test";

test.describe("Google Ads conversion route", () => {
  test("/whatsapp redirects to the clinic's WhatsApp with a lead code in the message", async ({ request }) => {
    const res = await request.get("/whatsapp", { maxRedirects: 0 });
    // Temporary only: a cached permanent redirect would freeze one code forever.
    expect([302, 303, 307]).toContain(res.status());
    expect(res.headers()["cache-control"]).toBe("no-store");
    const location = res.headers()["location"];
    // The whole URL: the clinic number and a single text parameter, nothing else.
    expect(location).toMatch(/^https:\/\/wa\.me\/5511989172311\?text=[^&#]+$/);
    // No click happened, so there is no handoff cookie: the code is X.
    expect(new URL(location).searchParams.get("text")).toMatch(
      /^Olá, gostaria de marcar uma consulta\.\n\nCódigo de atendimento: VY-X[A-HJ-NP-Z2-9]{5}$/,
    );
  });

  test("/whatsapp is reachable and not a 404", async ({ request }) => {
    const res = await request.get("/whatsapp", { maxRedirects: 0 });
    expect(res.status()).not.toBe(404);
  });

  test("/whatsapp has an empty body, so no GTM can load there and double-count", async ({ request }) => {
    const res = await request.get("/whatsapp", { maxRedirects: 0 });
    expect(await res.text()).toBe("");
  });
});
