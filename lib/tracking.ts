import { currentAttribution, type Attribution } from "@/lib/attribution";
import { generateLeadCode, leadChannel } from "@/lib/lead-code";
import {
  HANDOFF_COOKIE,
  HANDOFF_MAX_AGE,
  encodeHandoff,
} from "@/lib/whatsapp";

export type WhatsAppClick = {
  /** Which service the visitor was looking at: "geral", "pilates", a speciality slug. */
  service: string;
  /** The CTA's placement label (`hero`, `nav`, `fab`, a path…); `placement` in GA4 and the Sheet. */
  from: string;
};

type DataLayerWindow = Window & { dataLayer?: Record<string, unknown>[] };

/**
 * Runs on the click of every WhatsApp CTA, on the page the click came from,
 * where GTM is already loaded. Every step is best-effort: the link's own
 * navigation to /whatsapp, and the Ads conversion GTM counts on it, never wait
 * on this.
 *
 * GA4 can see codes that never reach a message: when cookies are blocked the
 * write fails silently and /whatsapp falls back to an X code.
 *
 * Returns the code (a test seam), or null if not even that could be produced.
 */
export function trackWhatsAppClick({ service, from }: WhatsAppClick): string | null {
  let code: string;
  let page: string;
  let channel: ReturnType<typeof leadChannel>;
  let attribution: Attribution;
  try {
    attribution = currentAttribution();
    channel = leadChannel(attribution);
    code = generateLeadCode(channel);
    page = window.location.pathname;
  } catch {
    return null;
  }

  try {
    const secure = window.location.protocol === "https:" ? "; Secure" : "";
    const value = encodeHandoff({ code, service, from, page, ...attribution });
    document.cookie = `${HANDOFF_COOKIE}=${value}; Path=/whatsapp; Max-Age=${HANDOFF_MAX_AGE}; SameSite=Lax${secure}`;
  } catch {
    // Never expected to throw; the write itself fails silently when blocked.
  }

  try {
    const w = window as DataLayerWindow;
    w.dataLayer = w.dataLayer || [];
    // In GTM this must stay a GA4 event, never a second Google Ads conversion.
    w.dataLayer.push({
      event: "whatsapp_click",
      lead_code: code,
      channel,
      campaign: (attribution.last ?? attribution.first)?.campaign ?? "",
      service,
      placement: from,
      source_page: page,
    });
  } catch {
    // A broken dataLayer must not stop the click.
  }

  return code;
}
