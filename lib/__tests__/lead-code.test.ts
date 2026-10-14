import { describe, expect, it } from "vitest";
import type { Channel } from "../attribution";
import {
  CHANNEL_LETTER,
  CODE_ALPHABET,
  LEAD_CODE_PATTERN,
  generateLeadCode,
  leadChannel,
} from "../lead-code";

/** Deterministic byte source: returns the given bytes, in order. */
const bytes = (...values: number[]) => (n: number) =>
  Uint8Array.from(values.slice(0, n));

describe("CODE_ALPHABET", () => {
  it("has exactly 32 symbols, so a random byte maps to it without modulo bias", () => {
    expect(CODE_ALPHABET).toHaveLength(32);
    expect(new Set(CODE_ALPHABET).size).toBe(32);
  });

  it("leaves out the characters staff would misread: I, O, 0 and 1", () => {
    for (const c of ["I", "O", "0", "1"]) expect(CODE_ALPHABET).not.toContain(c);
  });
});

describe("generateLeadCode", () => {
  it("is VY- + the channel letter + 5 symbols", () => {
    expect(generateLeadCode("google_ads", bytes(0, 1, 2, 3, 4))).toBe("VY-GABCDE");
  });

  it("encodes each channel in the first letter", () => {
    expect(CHANNEL_LETTER).toEqual({
      google_ads: "G",
      meta_ads: "M",
      organic_search: "O",
      social_organic: "I",
      referral: "R",
      other: "R",
      direct: "D",
      unknown: "X",
    });
    for (const [channel, letter] of Object.entries(CHANNEL_LETTER)) {
      const code = generateLeadCode(channel as keyof typeof CHANNEL_LETTER);
      expect(code.slice(3, 4)).toBe(letter);
      // A letter the pattern doesn't know would make /whatsapp discard the click.
      expect(code).toMatch(LEAD_CODE_PATTERN);
    }
  });

  it("uses only the low 5 bits of each byte, so 255 lands on the last symbol", () => {
    expect(generateLeadCode("direct", bytes(255, 32, 64, 31, 0))).toBe("VY-D9AA9A");
  });

  it("matches LEAD_CODE_PATTERN for every possible byte", () => {
    for (let b = 0; b < 256; b++) {
      expect(generateLeadCode("meta_ads", () => Uint8Array.from([b, b, b, b, b]))).toMatch(
        LEAD_CODE_PATTERN,
      );
    }
  });

  it("draws its suffix from the random source, not a constant", () => {
    const a = generateLeadCode("direct", bytes(0, 0, 0, 0, 0));
    const b = generateLeadCode("direct", bytes(0, 0, 0, 0, 1));
    expect(a).not.toBe(b);
    // The real source: 10 draws all identical would mean it is not random.
    expect(new Set(Array.from({ length: 10 }, () => generateLeadCode("direct"))).size).toBeGreaterThan(1);
  });
});

describe("LEAD_CODE_PATTERN", () => {
  it.each(["VY-GABCDE", "VY-X23456", "VY-R9ZZZZ"])("accepts %s", (code) => {
    expect(code).toMatch(LEAD_CODE_PATTERN);
  });

  it.each(["VY-QABCDE", "VY-GABCD", "VY-GABCDEF", "VY-GABCD0", "vy-gabcde", "VY-GABCDE\n"])(
    "rejects %j",
    (code) => {
      expect(code).not.toMatch(LEAD_CODE_PATTERN);
    },
  );
});

describe("leadChannel", () => {
  const t = (channel: Channel) => ({ channel, ts: 0, landing: "/" });

  it("prefers the last non-direct touch", () => {
    expect(leadChannel({ first: t("google_ads"), last: t("meta_ads") })).toBe("meta_ads");
  });

  it("falls back to the first touch when there is no last one", () => {
    expect(leadChannel({ first: t("direct"), last: null })).toBe("direct");
  });

  it("is unknown when nothing was recorded", () => {
    expect(leadChannel({ first: null, last: null })).toBe("unknown");
  });
});
