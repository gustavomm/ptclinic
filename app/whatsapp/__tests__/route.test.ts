import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import type { Touch } from "@/lib/attribution";
import { HANDOFF_COOKIE, encodeHandoff, whatsappMessage } from "@/lib/whatsapp";

const afterCallbacks: (() => unknown)[] = [];
vi.mock("next/server", async (importOriginal) => ({
  ...(await importOriginal<typeof import("next/server")>()),
  after: (fn: () => unknown) => void afterCallbacks.push(fn),
}));

const sendLead = vi.fn();
vi.mock("@/lib/lead-webhook", () => ({ sendLead: (...args: unknown[]) => sendLead(...args) }));

let leadRowImpl: ((...args: unknown[]) => unknown) | null = null;
vi.mock("@/lib/lead-row", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/lead-row")>();
  return {
    leadRow: (...args: Parameters<typeof actual.leadRow>) =>
      leadRowImpl ? leadRowImpl(...args) : actual.leadRow(...args),
  };
});

const { GET } = await import("../route");

const touch: Touch = { channel: "google_ads", ts: Date.UTC(2026, 9, 14), landing: "/pilates", gclid: "G1" };

function request(cookies: Record<string, string> = {}) {
  const cookie = Object.entries(cookies).map(([k, v]) => `${k}=${v}`).join("; ");
  return new NextRequest("https://www.vytafisioterapia.com.br/whatsapp", {
    headers: { cookie, "user-agent": "UA/1.0" },
  });
}

const handoff = (code = "VY-GABCDE", service = "pilates", page = "/") =>
  encodeHandoff({ code, service, from: "landing-pilates", page, first: touch, last: touch });

beforeEach(() => {
  afterCallbacks.length = 0;
  sendLead.mockReset();
  vi.stubEnv("VERCEL_ENV", "production");
  vi.stubEnv("LEAD_WEBHOOK_URL", "https://script.example/exec");
  vi.stubEnv("LEAD_WEBHOOK_SECRET", "s3");
});

afterEach(() => vi.unstubAllEnvs());

const textOf = (res: Response) => new URL(res.headers.get("location")!).searchParams.get("text");

describe("GET /whatsapp", () => {
  it("redirects to the clinic number with the click's code in the message", () => {
    const res = GET(request({ [HANDOFF_COOKIE]: handoff() }));
    expect(res.headers.get("location")).toMatch(/^https:\/\/wa\.me\/5511989172311\?text=/);
    expect(textOf(res)).toBe(whatsappMessage("pilates", "/", "VY-GABCDE"));
  });

  it("asks about Pilates when a general CTA is clicked on the Pilates page", () => {
    const res = GET(request({ [HANDOFF_COOKIE]: handoff("VY-GABCDE", "geral", "/pilates") }));
    expect(textOf(res)).toBe(whatsappMessage("geral", "/pilates", "VY-GABCDE"));
    expect(textOf(res)).toMatch(/Pilates/);
  });

  it("uses a temporary redirect that is never cached: each click carries its own code", () => {
    const res = GET(request({ [HANDOFF_COOKIE]: handoff() }));
    expect([302, 303, 307]).toContain(res.status);
    expect(res.headers.get("cache-control")).toBe("no-store");
  });

  it("clears the handoff cookie so it is not replayed", () => {
    const res = GET(request({ [HANDOFF_COOKIE]: handoff() }));
    const setCookie = res.headers.get("set-cookie") ?? "";
    expect(setCookie).toContain(`${HANDOFF_COOKIE}=;`);
    expect(setCookie).toMatch(/Path=\/whatsapp/);
    expect(setCookie).toMatch(/Max-Age=0|Expires=Thu, 01 Jan 1970/);
  });

  it("records the lead after the response, with the row from the handoff", async () => {
    GET(request({ [HANDOFF_COOKIE]: handoff(), _fbp: "fb.1.1.2" }));
    expect(sendLead).not.toHaveBeenCalled();
    expect(afterCallbacks).toHaveLength(1);
    await afterCallbacks[0]();
    expect(sendLead).toHaveBeenCalledTimes(1);
    const [row, config] = sendLead.mock.calls[0];
    expect(row).toMatchObject({
      lead_code: "VY-GABCDE",
      channel: "google_ads",
      last_gclid: "G1",
      fbp: "fb.1.1.2",
      user_agent: "UA/1.0",
    });
    expect(config).toMatchObject({ url: "https://script.example/exec", secret: "s3" });
  });

  it("without a handoff still redirects, with an X code, and writes no row", () => {
    const res = GET(request());
    expect(textOf(res)).toMatch(/^Olá! Vim pelo site da Vyta \(código VY-X[A-HJ-NP-Z2-9]{5}\)\.\nGostaria de marcar uma consulta e tirar algumas dúvidas\.$/);
    expect(afterCallbacks).toHaveLength(0);
  });

  it("treats a tampered cookie like no handoff", () => {
    const res = GET(request({ [HANDOFF_COOKIE]: "garbage" }));
    expect(textOf(res)).toMatch(/VY-X/);
    expect(afterCallbacks).toHaveLength(0);
  });

  it.each([["preview"], ["development"], [""]])(
    "writes no row outside Vercel production (VERCEL_ENV=%j), even with the webhook set",
    (env) => {
      vi.stubEnv("VERCEL_ENV", env);
      const res = GET(request({ [HANDOFF_COOKIE]: handoff() }));
      expect(textOf(res)).toContain("VY-GABCDE");
      expect(afterCallbacks).toHaveLength(0);
    },
  );

  it("still redirects with the code when a touch in the cookie is tampered with", async () => {
    const tampered = encodeHandoff({
      code: "VY-GABCDE",
      service: "geral",
      from: "nav",
      page: "/",
      first: { ...touch, ts: 1e300 },
      last: touch,
    });
    const res = GET(request({ [HANDOFF_COOKIE]: tampered }));
    expect(res.status).toBe(302);
    expect(textOf(res)).toContain("VY-GABCDE");
    await afterCallbacks[0]();
    expect(sendLead.mock.calls[0][0]).toMatchObject({ first_channel: "", last_channel: "google_ads" });
  });

  it("never lets a failure building the row escape the after() callback", async () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    leadRowImpl = () => {
      throw new RangeError("Invalid time value");
    };
    try {
      const res = GET(request({ [HANDOFF_COOKIE]: handoff() }));
      expect(res.status).toBe(302);
      await expect(afterCallbacks[0]()).resolves.toBeUndefined();
      expect(sendLead).not.toHaveBeenCalled();
      expect(log).toHaveBeenCalledWith(expect.stringContaining("VY-GABCDE"), expect.any(RangeError));
    } finally {
      leadRowImpl = null;
      log.mockRestore();
    }
  });

  it("writes no row without the secret: the script would only refuse it", () => {
    vi.stubEnv("LEAD_WEBHOOK_SECRET", "");
    GET(request({ [HANDOFF_COOKIE]: handoff() }));
    expect(afterCallbacks).toHaveLength(0);
  });

  it("writes no row when the webhook is not configured", () => {
    vi.stubEnv("LEAD_WEBHOOK_URL", "");
    const res = GET(request({ [HANDOFF_COOKIE]: handoff() }));
    expect(textOf(res)).toContain("VY-GABCDE");
    expect(afterCallbacks).toHaveLength(0);
  });
});
