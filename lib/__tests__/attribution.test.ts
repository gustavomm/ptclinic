import { describe, expect, it } from "vitest";
import {
  ATTRIBUTION_WINDOW_MS,
  FIRST_KEY,
  LAST_KEY,
  classifyChannel,
  isTouch,
  readAttribution,
  recordTouch,
  touchFromLocation,
  type Touch,
} from "../attribution";

const SITE = "https://www.vytafisioterapia.com.br";
const NOW = Date.UTC(2026, 9, 14, 12);
const DAY = 24 * 60 * 60 * 1000;

const classify = (query: string, referrer = "") =>
  classifyChannel(new URLSearchParams(query), referrer, "www.vytafisioterapia.com.br");

describe("classifyChannel", () => {
  it.each([
    // Google click IDs beat everything, including a UTM that says otherwise.
    ["gclid=abc", "", "google_ads"],
    ["gbraid=abc", "", "google_ads"],
    ["wbraid=abc", "", "google_ads"],
    ["gclid=abc&utm_source=instagram&utm_medium=bio", "", "google_ads"],
    ["gclid=abc", "https://www.google.com/", "google_ads"],
    // Google Ads tracking template without auto-tagging.
    ["utm_source=google&utm_medium=cpc", "", "google_ads"],
    // Meta.
    ["utm_source=meta&utm_medium=paid", "", "meta_ads"],
    ["utm_source=meta", "", "meta_ads"],
    ["utm_source=facebook&utm_medium=paid_social", "", "meta_ads"],
    ["fbclid=abc", "", "meta_ads"],
    ["fbclid=abc", "https://l.facebook.com/", "meta_ads"],
    // fbclid means Meta Ads even when the ad's UTMs are tagged loosely.
    ["fbclid=abc&utm_source=ig&utm_medium=Instagram_Stories", "", "meta_ads"],
    ["fbclid=abc&utm_source=facebook&utm_medium=social", "", "meta_ads"],
    // The one exception: Instagram and Facebook stamp fbclid on organic links
    // too, so a link we tagged as organic ourselves (the bio) stays organic.
    ["utm_source=instagram&utm_medium=bio&fbclid=abc", "", "social_organic"],
    ["utm_source=gbp&utm_medium=organic&fbclid=abc", "", "organic_search"],
    ["utm_source=instagram&utm_medium=bio", "", "social_organic"],
    ["utm_source=gbp&utm_medium=organic", "", "organic_search"],
    ["utm_source=qr&utm_medium=offline&utm_campaign=consolacao", "", "other"],
    ["utm_source=newsletter", "", "other"],
    // UTM matching ignores case and surrounding spaces.
    ["utm_source=Google&utm_medium=CPC", "", "google_ads"],
    ["utm_source=%20META%20", "", "meta_ads"],
    // Referrer-only visits.
    ["", "https://www.google.com/", "organic_search"],
    ["", "https://www.google.com.br/", "organic_search"],
    ["", "https://www.bing.com/search?q=fisio", "organic_search"],
    ["", "https://duckduckgo.com/", "organic_search"],
    // The Google app on Android sends an app referrer, not a web one.
    ["", "android-app://com.google.android.googlequicksearchbox/", "organic_search"],
    ["", "https://l.instagram.com/", "social_organic"],
    ["", "https://www.instagram.com/", "social_organic"],
    ["", "https://m.facebook.com/", "social_organic"],
    ["", "https://lm.facebook.com/", "social_organic"],
    ["", "https://www.doctoralia.com.br/", "referral"],
    // A host that only contains "google" is not Google.
    ["", "https://notgoogle.com/", "referral"],
    ["", "https://google.evil.example/", "referral"],
    ["", "", "direct"],
    // An unparseable referrer is treated like none.
    ["", "not a url", "direct"],
  ])("?%s from %j → %s", (query, referrer, expected) => {
    expect(classify(query, referrer)).toBe(expected);
  });

  it("returns null for an internal navigation with no tags (not a new touch)", () => {
    expect(classify("", `${SITE}/pilates`)).toBeNull();
  });

  it("treats the apex domain as the site itself too", () => {
    expect(classify("", "https://vytafisioterapia.com.br/")).toBeNull();
  });

  it("still counts tags on a landing referred by the site itself", () => {
    expect(classify("utm_source=meta", `${SITE}/`)).toBe("meta_ads");
  });
});

describe("touchFromLocation", () => {
  it("keeps the tags, the landing path and only the referrer host", () => {
    const touch = touchFromLocation(
      new URL(`${SITE}/pilates?utm_source=google&utm_medium=cpc&utm_campaign=123&utm_term=pilates%20sp&gclid=G1#x`),
      "https://www.google.com/search?q=private+words",
      NOW,
    );
    expect(touch).toEqual({
      channel: "google_ads",
      ts: NOW,
      landing: "/pilates",
      referrer: "www.google.com",
      source: "google",
      medium: "cpc",
      campaign: "123",
      term: "pilates sp",
      gclid: "G1",
    });
  });

  it("caps every value: storage and the Sheet hold attribution, not arbitrary text", () => {
    const touch = touchFromLocation(
      new URL(`${SITE}/${"p".repeat(1000)}?utm_campaign=${"x".repeat(1000)}&gclid=${"g".repeat(1000)}`),
      "",
      NOW,
    )!;
    expect(touch.campaign!.length).toBeLessThanOrEqual(150);
    expect(touch.gclid!.length).toBeLessThanOrEqual(150);
    expect(touch.landing.length).toBeLessThanOrEqual(150);
  });

  it("is null for an internal navigation", () => {
    expect(touchFromLocation(new URL(`${SITE}/blog`), `${SITE}/`, NOW)).toBeNull();
  });
});

function memoryStorage(initial: Record<string, string> = {}) {
  const data = new Map(Object.entries(initial));
  return {
    getItem: (k: string) => data.get(k) ?? null,
    setItem: (k: string, v: string) => void data.set(k, v),
    removeItem: (k: string) => void data.delete(k),
    data,
  };
}

const touch = (channel: Touch["channel"], ts: number, extra: Partial<Touch> = {}): Touch => ({
  channel,
  ts,
  landing: "/",
  ...extra,
});

describe("recordTouch / readAttribution", () => {
  it("records the first visit as both first and last when it is tagged", () => {
    const s = memoryStorage();
    recordTouch(s, touch("google_ads", NOW), NOW);
    expect(readAttribution(s, NOW)).toEqual({
      first: touch("google_ads", NOW),
      last: touch("google_ads", NOW),
    });
  });

  it("never overwrites first inside the window", () => {
    const s = memoryStorage();
    recordTouch(s, touch("google_ads", NOW), NOW);
    recordTouch(s, touch("meta_ads", NOW + 10 * DAY), NOW + 10 * DAY);
    const { first, last } = readAttribution(s, NOW + 10 * DAY);
    expect(first?.channel).toBe("google_ads");
    expect(last?.channel).toBe("meta_ads");
  });

  it("does not let a direct visit overwrite last: the ad keeps the credit", () => {
    const s = memoryStorage();
    recordTouch(s, touch("meta_ads", NOW), NOW);
    recordTouch(s, touch("direct", NOW + 7 * DAY), NOW + 7 * DAY);
    expect(readAttribution(s, NOW + 7 * DAY).last?.channel).toBe("meta_ads");
  });

  it("records a direct first visit as first only", () => {
    const s = memoryStorage();
    recordTouch(s, touch("direct", NOW), NOW);
    expect(readAttribution(s, NOW)).toEqual({ first: touch("direct", NOW), last: null });
  });

  it("forgets touches older than 90 days, and lets a new first in", () => {
    const s = memoryStorage();
    recordTouch(s, touch("google_ads", NOW), NOW);
    const later = NOW + ATTRIBUTION_WINDOW_MS + 1;
    expect(readAttribution(s, later)).toEqual({ first: null, last: null });
    recordTouch(s, touch("direct", later), later);
    expect(readAttribution(s, later).first?.channel).toBe("direct");
  });

  it("keeps a touch that is exactly 90 days old", () => {
    const s = memoryStorage();
    recordTouch(s, touch("google_ads", NOW), NOW);
    expect(readAttribution(s, NOW + ATTRIBUTION_WINDOW_MS).first).not.toBeNull();
  });

  it("keeps the storage keys stable: renaming them forgets every visitor's attribution", () => {
    const s = memoryStorage();
    recordTouch(s, touch("google_ads", NOW), NOW);
    expect([...s.data.keys()].sort()).toEqual([FIRST_KEY, LAST_KEY].sort());
    expect(FIRST_KEY).toBe("vyta_attr_first");
    expect(LAST_KEY).toBe("vyta_attr_last");
  });

  it("treats corrupt or foreign stored values as absent", () => {
    const s = memoryStorage({
      [FIRST_KEY]: "{not json",
      [LAST_KEY]: JSON.stringify({ channel: "bogus", ts: NOW, landing: "/" }),
    });
    expect(readAttribution(s, NOW)).toEqual({ first: null, last: null });
  });

  it("deletes expired records instead of keeping them past the window", () => {
    const s = memoryStorage();
    recordTouch(s, touch("google_ads", NOW), NOW);
    readAttribution(s, NOW + ATTRIBUTION_WINDOW_MS + 1);
    expect(s.data.size).toBe(0);
  });

  it.each([
    ["a timestamp no Date can format", { channel: "google_ads", ts: 1e16, landing: "/" }],
    ["a negative timestamp", { channel: "google_ads", ts: -1, landing: "/" }],
    ["a non-string field", { channel: "google_ads", ts: NOW, landing: "/", gclid: ["x"] }],
  ])("rejects a stored record with %s", (_, value) => {
    expect(isTouch(value)).toBe(false);
  });

  it("survives a storage that throws (Safari private mode, blocked site data)", () => {
    const throwing = {
      getItem: () => {
        throw new Error("SecurityError");
      },
      setItem: () => {
        throw new Error("QuotaExceededError");
      },
      removeItem: () => {},
    };
    expect(() => recordTouch(throwing, touch("google_ads", NOW), NOW)).not.toThrow();
    expect(readAttribution(throwing, NOW)).toEqual({ first: null, last: null });
  });
});
