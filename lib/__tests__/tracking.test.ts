import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { FIRST_KEY, LAST_KEY, type Touch } from "../attribution";
import { LEAD_CODE_PATTERN } from "../lead-code";
import { trackWhatsAppClick } from "../tracking";
import { HANDOFF_COOKIE, decodeHandoff } from "../whatsapp";

type Win = Window & { dataLayer?: Record<string, unknown>[] };
const win = window as Win;

let cookieWrites: string[];

beforeEach(() => {
  localStorage.clear();
  delete win.dataLayer;
  cookieWrites = [];
  // The cookie is scoped to /whatsapp, so jsdom (at /) would never show it back
  // through document.cookie. Capture the raw writes instead.
  vi.spyOn(Document.prototype, "cookie", "set").mockImplementation((v: string) => {
    cookieWrites.push(v);
  });
});

afterEach(() => vi.restoreAllMocks());

const touch = (extra: Partial<Touch>): Touch => ({ channel: "direct", ts: Date.now(), landing: "/", ...extra });

const lastEvent = () => win.dataLayer?.at(-1);

function writtenHandoff() {
  const write = cookieWrites.find((c) => c.startsWith(`${HANDOFF_COOKIE}=`));
  expect(write, "handoff cookie written").toBeDefined();
  const value = write!.slice(HANDOFF_COOKIE.length + 1).split(";")[0];
  return { write: write!, handoff: decodeHandoff(value) };
}

describe("trackWhatsAppClick", () => {
  it("pushes whatsapp_click with the lead_code and the attribution", () => {
    localStorage.setItem(FIRST_KEY, JSON.stringify(touch({ channel: "meta_ads", campaign: "old" })));
    localStorage.setItem(LAST_KEY, JSON.stringify(touch({ channel: "google_ads", campaign: "123" })));

    const code = trackWhatsAppClick({ service: "pilates", from: "landing-pilates" });

    expect(code).toMatch(/^VY-G/);
    expect(lastEvent()).toEqual({
      event: "whatsapp_click",
      lead_code: code,
      channel: "google_ads",
      campaign: "123",
      service: "pilates",
      placement: "landing-pilates",
      source_page: window.location.pathname,
    });
  });

  it("hands the same code and the attribution to /whatsapp in a short cookie", () => {
    localStorage.setItem(LAST_KEY, JSON.stringify(touch({ channel: "google_ads", gclid: "G1" })));

    const code = trackWhatsAppClick({ service: "geral", from: "hero" });
    const { write, handoff } = writtenHandoff();

    expect(write).toMatch(/; Path=\/whatsapp; Max-Age=120; SameSite=Lax/);
    expect(handoff).toMatchObject({ code, service: "geral", from: "hero", page: window.location.pathname });
    expect(handoff?.last?.gclid).toBe("G1");
  });

  it("codes the click X when no attribution was recorded", () => {
    const code = trackWhatsAppClick({ service: "geral", from: "nav" });
    expect(code).toMatch(/^VY-X/);
    expect(code).toMatch(LEAD_CODE_PATTERN);
    expect(lastEvent()).toMatchObject({ channel: "unknown", campaign: "" });
  });

  it("issues a fresh code on every click", () => {
    const a = trackWhatsAppClick({ service: "geral", from: "nav" });
    const b = trackWhatsAppClick({ service: "geral", from: "nav" });
    expect(a).not.toBe(b);
  });

  it("appends to an existing dataLayer instead of replacing it (GTM owns it)", () => {
    win.dataLayer = [{ event: "gtm.js" }];
    trackWhatsAppClick({ service: "geral", from: "nav" });
    expect(win.dataLayer).toHaveLength(2);
    expect(win.dataLayer[0]).toEqual({ event: "gtm.js" });
  });

  it("still writes the cookie when the dataLayer push throws", () => {
    win.dataLayer = { push: () => { throw new Error("broken"); } } as unknown as Win["dataLayer"];
    expect(() => trackWhatsAppClick({ service: "geral", from: "nav" })).not.toThrow();
    expect(writtenHandoff().handoff?.code).toMatch(LEAD_CODE_PATTERN);
  });

  it("never throws, even when storage and cookies are blocked", () => {
    vi.spyOn(window, "localStorage", "get").mockImplementation(() => {
      throw new Error("SecurityError");
    });
    vi.spyOn(Document.prototype, "cookie", "set").mockImplementation(() => {
      throw new Error("blocked");
    });
    expect(() => trackWhatsAppClick({ service: "geral", from: "nav" })).not.toThrow();
    expect(lastEvent()).toMatchObject({ event: "whatsapp_click", channel: "unknown" });
  });
});
