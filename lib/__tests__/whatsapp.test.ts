import { describe, expect, it } from "vitest";
import type { Touch } from "../attribution";
import {
  HANDOFF_MAX_LENGTH,
  decodeHandoff,
  encodeHandoff,
  whatsappMessage,
  whatsappUrl,
  type Handoff,
} from "../whatsapp";

const TS = Date.UTC(2026, 9, 14, 12);

const googleTouch: Touch = {
  channel: "google_ads",
  ts: TS,
  landing: "/pilates",
  source: "google",
  medium: "cpc",
  campaign: "123",
  gclid: "G1",
};

const handoff: Handoff = {
  code: "VY-GABCDE",
  service: "pilates",
  from: "landing-pilates",
  page: "/",
  first: googleTouch,
  last: googleTouch,
};

describe("whatsappMessage", () => {
  it("asks about Pilates on Pilates CTAs, with the code on its own line", () => {
    expect(whatsappMessage("pilates", "/", "VY-GABCDE")).toBe(
      "Olá, gostaria de informações sobre o Pilates.\n\nCódigo de atendimento: VY-GABCDE",
    );
  });

  it("asks about Pilates from any CTA on the Pilates page (nav, FAB, footer)", () => {
    expect(whatsappMessage("geral", "/pilates", "VY-GABCDE")).toMatch(/^Olá, gostaria de informações sobre o Pilates\./);
  });

  it.each([
    ["geral", "/"],
    ["domiciliar", "/fisioterapia-domiciliar"],
    ["fisioterapia-neurologica", "/especialidades/fisioterapia-neurologica"],
    ["fisioterapia-apos-avc", "/blog/fisioterapia-apos-avc"],
  ])("uses the consultation greeting for %s on %s", (service, page) => {
    expect(whatsappMessage(service, page, "VY-DABCDE")).toBe(
      "Olá, gostaria de marcar uma consulta.\n\nCódigo de atendimento: VY-DABCDE",
    );
  });
});

describe("whatsappUrl", () => {
  it("opens the clinic number with the message URL-encoded", () => {
    const url = new URL(whatsappUrl("+5511989172311", "pilates", "/", "VY-GABCDE"));
    expect(url.origin + url.pathname).toBe("https://wa.me/5511989172311");
    expect([...url.searchParams.keys()]).toEqual(["text"]);
    expect(url.searchParams.get("text")).toBe(whatsappMessage("pilates", "/", "VY-GABCDE"));
  });

  it("encodes spaces and line breaks as %20 and %0A, which every WhatsApp client reads", () => {
    const raw = whatsappUrl("+5511989172311", "geral", "/", "VY-DABCDE");
    expect(raw).toContain("%0A%0AC%C3%B3digo%20de%20atendimento%3A%20VY-DABCDE");
    expect(raw).not.toContain("+");
  });
});

describe("handoff cookie", () => {
  it("round-trips", () => {
    expect(decodeHandoff(encodeHandoff(handoff))).toEqual(handoff);
  });

  it("uses only cookie-safe characters", () => {
    expect(encodeHandoff(handoff)).toMatch(/^[A-Za-z0-9_-]+$/);
  });

  it.each([undefined, "%%%", "bm90IGpzb24", encodeHandoff({ ...handoff, code: "VY-QABCDE" })])(
    "rejects %j",
    (raw) => {
      expect(decodeHandoff(raw)).toBeNull();
    },
  );

  it("drops a malformed touch instead of the whole handoff", () => {
    const bad = encodeHandoff({ ...handoff, first: { channel: "bogus" } as unknown as Touch });
    expect(decodeHandoff(bad)).toEqual({ ...handoff, first: null });
  });

  it("sheds long descriptive UTMs before it sheds the click IDs", () => {
    const long = "ç".repeat(150);
    const touch: Touch = {
      ...googleTouch,
      gbraid: "GB1",
      wbraid: "WB1",
      content: long,
      term: long,
      id: long,
      campaign: long,
    };
    const decoded = decodeHandoff(encodeHandoff({ ...handoff, first: touch, last: touch }));
    expect(decoded?.last).toMatchObject({
      channel: "google_ads",
      gclid: "G1",
      gbraid: "GB1",
      wbraid: "WB1",
      source: "google",
      medium: "cpc",
    });
    expect(decoded?.last?.content).toBeUndefined();
  });

  it("stays under the cookie budget with pathological UTMs, and never loses the code", () => {
    // Control characters cost six bytes each once JSON-escaped, so even the
    // shortened values overflow and the last step is reached.
    const huge = "\u0001".repeat(150);
    const touch: Touch = {
      ...googleTouch,
      campaign: huge,
      content: huge,
      term: huge,
      id: huge,
      source: huge,
      medium: huge,
      gclid: huge,
      gbraid: huge,
      wbraid: huge,
      fbclid: huge,
      referrer: huge,
      landing: `/${huge}`,
    };
    const big = { ...handoff, from: huge, page: `/${huge}`, first: touch, last: touch };
    const encoded = encodeHandoff(big);
    expect(encoded.length).toBeLessThanOrEqual(HANDOFF_MAX_LENGTH);
    const decoded = decodeHandoff(encoded);
    expect(decoded?.code).toBe("VY-GABCDE");
    expect(decoded?.service).toBe("pilates");
    // The channel survives even the last step, so the row agrees with the letter.
    expect(decoded?.last?.channel).toBe("google_ads");
  });

  it("rejects a value longer than the budget, even a well-formed one", () => {
    const oversized = Buffer.from(
      JSON.stringify({ ...handoff, from: "x".repeat(HANDOFF_MAX_LENGTH) }),
    ).toString("base64url");
    expect(oversized.length).toBeGreaterThan(HANDOFF_MAX_LENGTH);
    expect(decodeHandoff(oversized)).toBeNull();
  });
});
