import type { Attribution, Channel } from "@/lib/attribution";

/**
 * The lead_code that bridges a click on the site and a WhatsApp conversation:
 * `VY-` + one channel letter + 5 random symbols, e.g. `VY-G7K3Q2`.
 *
 * The channel rides in the first letter so staff can read the origin without
 * opening the Sheet, and so the channel survives even when the Sheet write
 * fails.
 *
 * Not a unique ID: 32^5 codes means a repeat becomes likely after a few
 * thousand clicks. Match a conversation to its row by code AND date.
 */

/** `unknown` exists only here: a click whose attribution never reached us. */
export type CodeChannel = Channel | "unknown";

export const CHANNEL_LETTER: Record<CodeChannel, string> = {
  google_ads: "G",
  meta_ads: "M",
  organic_search: "O",
  social_organic: "I",
  referral: "R",
  other: "R",
  direct: "D",
  unknown: "X",
};

/**
 * 32 symbols: A–Z without I and O, plus 2–9. No 0/O or 1/I to confuse when
 * someone reads the code off a phone screen. 32 divides 256, so taking the low
 * 5 bits of a random byte picks every symbol with the same probability.
 */
export const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export const LEAD_CODE_PATTERN = /^VY-[GMOIRDX][A-HJ-NP-Z2-9]{5}$/;

const SUFFIX_LENGTH = 5;

function cryptoBytes(n: number): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(n));
}

export function generateLeadCode(
  channel: CodeChannel,
  randomBytes: (n: number) => Uint8Array = cryptoBytes,
): string {
  const suffix = Array.from(
    randomBytes(SUFFIX_LENGTH),
    (b) => CODE_ALPHABET[b & 31],
  ).join("");
  return `VY-${CHANNEL_LETTER[channel]}${suffix}`;
}

/**
 * The channel a lead is credited to: the last non-direct touch, else the first
 * touch, else unknown (storage blocked, or a click before the capture ran).
 */
export function leadChannel({ first, last }: Attribution): CodeChannel {
  return last?.channel ?? first?.channel ?? "unknown";
}
