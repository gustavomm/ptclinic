import { isTouch, type Touch } from "@/lib/attribution";
import { LEAD_CODE_PATTERN } from "@/lib/lead-code";

/**
 * Everything between a click on a WhatsApp CTA and the wa.me redirect.
 *
 * The click (lib/tracking.ts, in the browser) writes a short-lived cookie with
 * the lead_code and the attribution. /whatsapp (app/whatsapp/route.ts, on the
 * server) reads it, sends the visitor to wa.me with the code in the message,
 * and records the lead (lib/lead-row.ts, lib/lead-webhook.ts). A cookie, not a
 * query string, because the CTA's href must stay exactly `/whatsapp`: that is
 * what the Google Ads conversion rule in GTM and e2e/gtm-classes.spec.ts check.
 */

export const HANDOFF_COOKIE = "vyta_wa";
/** Seconds. Long enough to survive a slow tap-to-navigate, short enough to go stale. */
export const HANDOFF_MAX_AGE = 120;
/** Well under the 4096-byte cookie limit, leaving room for name and attributes. */
export const HANDOFF_MAX_LENGTH = 3000;

export type Handoff = {
  code: string;
  service: string;
  /** The CTA's placement label (`hero`, `nav`, a path…), as passed to WhatsAppLink. */
  from: string;
  /** Path of the page the click happened on. */
  page: string;
  first: Touch | null;
  last: Touch | null;
};

const PILATES_GREETING = "Olá, gostaria de informações sobre o Pilates.";
const DEFAULT_GREETING = "Olá, gostaria de marcar uma consulta.";

const isPilates = (service: string, page: string) =>
  service === "pilates" || page === "/pilates" || page.startsWith("/pilates/");

/**
 * The pre-filled first message. Pilates CTAs, and any CTA on the Pilates page,
 * ask about Pilates. The code gets its own labelled line so it reads as
 * something the clinic needs, which makes people less likely to delete it.
 */
export function whatsappMessage(service: string, page: string, code: string): string {
  const greeting = isPilates(service, page) ? PILATES_GREETING : DEFAULT_GREETING;
  return `${greeting}\n\nCódigo de atendimento: ${code}`;
}

export function whatsappUrl(phoneE164: string, service: string, page: string, code: string): string {
  const number = phoneE164.replace(/\D/g, "");
  return `https://wa.me/${number}?text=${encodeURIComponent(whatsappMessage(service, page, code))}`;
}

function toBase64Url(text: string): string {
  let binary = "";
  for (const byte of new TextEncoder().encode(text)) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(encoded: string): string {
  const b64 = encoded.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(b64 + "===".slice((b64.length + 3) % 4));
  return new TextDecoder("utf-8", { fatal: true }).decode(
    Uint8Array.from(binary, (c) => c.charCodeAt(0)),
  );
}

/** Length each value is cut to once a payload is over budget. */
const SHED_LENGTH = 60;
const shed = (value: string | undefined) => (value ?? "").slice(0, SHED_LENGTH);

/** Keep only what attribution needs most, each value shortened. */
function slimTouch(t: Touch | null): Touch | null {
  if (!t) return null;
  const slim: Touch = { channel: t.channel, ts: t.ts, landing: shed(t.landing) };
  for (const key of ["source", "medium", "campaign", "gclid", "fbclid"] as const) {
    const value = t[key];
    if (value) slim[key] = shed(value);
  }
  return slim;
}

/** Just the channel, so the Sheet's channel column still agrees with the code letter. */
const bareTouch = (t: Touch | null): Touch | null =>
  t && { channel: t.channel, ts: t.ts, landing: "" };

/**
 * Cookie value for the handoff: base64url JSON. Real payloads fit as-is. Absurd
 * UTMs are shed in steps until it fits; the code, the service, the page and
 * the channels, which the message and the row need, are never shed.
 */
export function encodeHandoff(h: Handoff): string {
  const short = { ...h, from: shed(h.from), page: shed(h.page) };
  const steps: (() => Handoff)[] = [
    () => h,
    () => ({ ...short, first: slimTouch(h.first), last: slimTouch(h.last) }),
  ];
  for (const step of steps) {
    const encoded = toBase64Url(JSON.stringify(step()));
    if (encoded.length <= HANDOFF_MAX_LENGTH) return encoded;
  }
  // Always fits: a code, two short strings and two channels.
  return toBase64Url(
    JSON.stringify({ ...short, service: shed(h.service), first: bareTouch(h.first), last: bareTouch(h.last) }),
  );
}

/** Parses the cookie. Anything that is not a well-formed handoff is `null`. */
export function decodeHandoff(raw: string | undefined): Handoff | null {
  if (!raw || raw.length > HANDOFF_MAX_LENGTH) return null;
  try {
    const value: unknown = JSON.parse(fromBase64Url(raw));
    if (typeof value !== "object" || value === null) return null;
    const v = value as Record<string, unknown>;
    if (typeof v.code !== "string" || !LEAD_CODE_PATTERN.test(v.code)) return null;
    const str = (x: unknown) => (typeof x === "string" ? x : "");
    return {
      code: v.code,
      service: str(v.service),
      from: str(v.from),
      page: str(v.page),
      first: isTouch(v.first) ? v.first : null,
      last: isTouch(v.last) ? v.last : null,
    };
  } catch {
    return null;
  }
}
