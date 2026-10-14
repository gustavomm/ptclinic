/**
 * Where a visitor came from, kept in the browser for 90 days.
 *
 * Two records, because the common path is: find the clinic through an ad,
 * leave, come back a week later by typing the address. Keeping only the last
 * visit would credit "direct" and make the ad look useless.
 *
 * - `vyta_attr_first`: first touch, never overwritten inside the window.
 * - `vyta_attr_last`: last non-direct touch, overwritten on every visit that is
 *   not direct (tagged, or from an outside referrer).
 *
 * Nothing here leaves the browser by itself. It is read when someone clicks a
 * WhatsApp CTA (lib/tracking.ts) and handed to /whatsapp in a short cookie.
 */

export const CHANNELS = [
  "google_ads",
  "meta_ads",
  "organic_search",
  "social_organic",
  "referral",
  "other",
  "direct",
] as const;

export type Channel = (typeof CHANNELS)[number];

export type Touch = {
  channel: Channel;
  /** Epoch ms. */
  ts: number;
  /** Path of the page the visit landed on, without the query string. */
  landing: string;
  /** Host only: a full referrer URL can carry search terms. */
  referrer?: string;
  source?: string;
  medium?: string;
  campaign?: string;
  content?: string;
  term?: string;
  id?: string;
  gclid?: string;
  gbraid?: string;
  wbraid?: string;
  fbclid?: string;
};

export type Attribution = { first: Touch | null; last: Touch | null };

export type KeyValueStorage = Pick<Storage, "getItem" | "setItem" | "removeItem">;

export const FIRST_KEY = "vyta_attr_first";
export const LAST_KEY = "vyta_attr_last";
export const ATTRIBUTION_WINDOW_MS = 90 * 24 * 60 * 60 * 1000;

/**
 * Long enough for any real gclid or campaign name. Everything stored is
 * visitor-controlled; the handoff cookie applies its own, tighter budget.
 */
const MAX_VALUE_LENGTH = 150;

const PARAM_FIELDS = {
  utm_source: "source",
  utm_medium: "medium",
  utm_campaign: "campaign",
  utm_content: "content",
  utm_term: "term",
  utm_id: "id",
  gclid: "gclid",
  gbraid: "gbraid",
  wbraid: "wbraid",
  fbclid: "fbclid",
} as const satisfies Record<string, keyof Touch>;

const GOOGLE_CLICK_IDS = ["gclid", "gbraid", "wbraid"];
const GOOGLE_SOURCES = new Set(["google", "adwords", "googleads"]);
const META_SOURCES = new Set(["facebook", "fb", "instagram", "ig"]);
const PAID_MEDIUM = /^(cpc|ppc|cpm|ads?|paid([_-]?[a-z]+)?)$/;
const SEARCH_ENGINE =
  /(^|\.)(google|bing|duckduckgo|yahoo|ecosia|yandex)\.(com(\.[a-z]{2})?|co\.[a-z]{2}|[a-z]{2})$/;
const META_SOCIAL = /(^|\.)(instagram\.com|facebook\.com|fb\.com)$/;
/** The Google app on Android: `android-app://com.google.android.googlequicksearchbox/`. */
const GOOGLE_APP = "com.google.android.googlequicksearchbox";
/** Mediums we tag our own organic links with (Instagram bio, Google Business Profile). */
const OWN_ORGANIC_MEDIUM = new Set(["bio", "organic"]);

function param(params: URLSearchParams, name: string): string {
  return (params.get(name) ?? "").trim();
}

function referrerHost(referrer: string): string | null {
  if (!referrer) return null;
  try {
    return new URL(referrer).hostname.toLowerCase() || null;
  } catch {
    return null;
  }
}

const bareHost = (host: string) => host.toLowerCase().replace(/^www\./, "");

/**
 * Channel of one landing, or `null` when the page load is an internal
 * navigation and so not a new touch at all.
 *
 * Order: Google click ID → fbclid → explicit UTM → referrer. `fbclid` beats a
 * UTM because Meta ads are often tagged loosely (`utm_medium=Instagram_Stories`).
 * The exception is a medium we use for our own organic links (`bio`,
 * `organic`): Instagram and Facebook stamp `fbclid` on those too, and the bio
 * link must not be credited to Meta Ads.
 */
export function classifyChannel(
  params: URLSearchParams,
  referrer: string,
  ownHost: string,
): Channel | null {
  if (GOOGLE_CLICK_IDS.some((id) => param(params, id))) return "google_ads";

  const source = param(params, "utm_source").toLowerCase();
  const medium = param(params, "utm_medium").toLowerCase();
  if (param(params, "fbclid") && !OWN_ORGANIC_MEDIUM.has(medium)) return "meta_ads";

  if (source || medium) {
    const paid = PAID_MEDIUM.test(medium);
    if (GOOGLE_SOURCES.has(source) && paid) return "google_ads";
    if (source === "meta") return "meta_ads";
    if (META_SOURCES.has(source)) return paid ? "meta_ads" : "social_organic";
    if (source === "gbp" || medium === "organic") return "organic_search";
    return "other";
  }

  const host = referrerHost(referrer);
  if (!host) return "direct";
  if (bareHost(host) === bareHost(ownHost)) return null;
  if (SEARCH_ENGINE.test(host) || host === GOOGLE_APP) return "organic_search";
  if (META_SOCIAL.test(host)) return "social_organic";
  return "referral";
}

export function touchFromLocation(url: URL, referrer: string, now: number): Touch | null {
  const channel = classifyChannel(url.searchParams, referrer, url.hostname);
  if (!channel) return null;

  const touch: Touch = { channel, ts: now, landing: url.pathname.slice(0, MAX_VALUE_LENGTH) };
  const host = referrerHost(referrer);
  if (host) touch.referrer = host;
  for (const [name, field] of Object.entries(PARAM_FIELDS)) {
    const value = param(url.searchParams, name).slice(0, MAX_VALUE_LENGTH);
    if (value) touch[field] = value;
  }
  return touch;
}

/** 2100-01-01. Anything later (or not positive) is tampering, and would break `toISOString`. */
const MAX_TS = 4_102_444_800_000;

const OPTIONAL_STRING_FIELDS = ["referrer", ...Object.values(PARAM_FIELDS)];

/** Shape check for values read back from storage or from the handoff cookie. */
export function isTouch(value: unknown): value is Touch {
  if (typeof value !== "object" || value === null) return false;
  const t = value as Record<string, unknown>;
  return (
    CHANNELS.includes(t.channel as Channel) &&
    typeof t.ts === "number" &&
    t.ts > 0 &&
    t.ts < MAX_TS &&
    typeof t.landing === "string" &&
    OPTIONAL_STRING_FIELDS.every((k) => t[k] === undefined || typeof t[k] === "string")
  );
}

function readTouch(storage: KeyValueStorage, key: string, now: number): Touch | null {
  try {
    const raw = storage.getItem(key);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (isTouch(parsed) && now - parsed.ts <= ATTRIBUTION_WINDOW_MS) return parsed;
    storage.removeItem(key);
    return null;
  } catch {
    return null;
  }
}

function writeTouch(storage: KeyValueStorage, key: string, touch: Touch): void {
  try {
    storage.setItem(key, JSON.stringify(touch));
  } catch {
    // Private mode or full storage: attribution is lost, the site is not.
  }
}

export function readAttribution(storage: KeyValueStorage, now: number): Attribution {
  return {
    first: readTouch(storage, FIRST_KEY, now),
    last: readTouch(storage, LAST_KEY, now),
  };
}

export function recordTouch(storage: KeyValueStorage, touch: Touch, now: number): void {
  if (!readTouch(storage, FIRST_KEY, now)) writeTouch(storage, FIRST_KEY, touch);
  if (touch.channel !== "direct") writeTouch(storage, LAST_KEY, touch);
}

/** Browser entry point. Called once per full page load. Never throws. */
export function captureAttribution(): void {
  try {
    const now = Date.now();
    const touch = touchFromLocation(new URL(window.location.href), document.referrer, now);
    if (touch) recordTouch(window.localStorage, touch, now);
  } catch {
    // localStorage itself can throw on access when site data is blocked.
  }
}

/** Browser read used at click time. Never throws. */
export function currentAttribution(): Attribution {
  try {
    return readAttribution(window.localStorage, Date.now());
  } catch {
    return { first: null, last: null };
  }
}
