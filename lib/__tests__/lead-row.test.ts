import { describe, expect, it } from "vitest";
import type { Touch } from "../attribution";
import { leadRow } from "../lead-row";
import type { Handoff } from "../whatsapp";

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

describe("leadRow", () => {
  const row = leadRow(handoff, {
    ts: "2026-10-14T12:00:00.000Z",
    userAgent: "Mozilla/5.0",
    fbp: "fb.1.1.2",
  });

  it("is flat, with the code, the channel it encodes, and both touches", () => {
    expect(row).toMatchObject({
      ts: "2026-10-14T12:00:00.000Z",
      lead_code: "VY-GABCDE",
      channel: "google_ads",
      service: "pilates",
      page: "/",
      placement: "landing-pilates",
      last_channel: "google_ads",
      last_campaign: "123",
      last_gclid: "G1",
      last_ts: "2026-10-14T12:00:00.000Z",
      first_channel: "google_ads",
      fbp: "fb.1.1.2",
      fbc: "",
      user_agent: "Mozilla/5.0",
    });
    for (const value of Object.values(row)) expect(typeof value).toBe("string");
  });

  it("credits the row's channel to the last touch, like the code letter", () => {
    const mixed = leadRow(
      { ...handoff, first: { ...googleTouch, channel: "meta_ads" }, last: googleTouch },
      { ts: "t" },
    );
    expect(mixed.channel).toBe("google_ads");
    expect(mixed.first_channel).toBe("meta_ads");
  });

  it("has the same columns whether or not touches exist", () => {
    const empty = leadRow({ ...handoff, code: "VY-XABCDE", first: null, last: null }, { ts: "t" });
    expect(Object.keys(empty)).toEqual(Object.keys(row));
    expect(empty.channel).toBe("unknown");
  });

  it("neutralises values a spreadsheet would run as a formula", () => {
    const evil = leadRow(
      { ...handoff, from: "=HYPERLINK(\"x\")", last: { ...googleTouch, campaign: "+1", term: "@a", content: "-2" } },
      { ts: "t" },
    );
    expect(evil.placement).toBe("'=HYPERLINK(\"x\")");
    expect(evil.last_campaign).toBe("'+1");
    expect(evil.last_term).toBe("'@a");
    expect(evil.last_content).toBe("'-2");
  });

  it("also neutralises a leading tab or carriage return", () => {
    const evil = leadRow({ ...handoff, from: "\t=1", page: "\r=1" }, { ts: "t" });
    expect(evil.placement).toBe("'\t=1");
    expect(evil.page).toBe("'\r=1");
  });
});
