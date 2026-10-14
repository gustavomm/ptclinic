import { after, NextResponse, type NextRequest } from "next/server";
import { clinic } from "@/content/clinic";
import { generateLeadCode } from "@/lib/lead-code";
import { leadRow } from "@/lib/lead-row";
import { sendLead } from "@/lib/lead-webhook";
import { HANDOFF_COOKIE, decodeHandoff, whatsappUrl } from "@/lib/whatsapp";

/**
 * The Google Ads conversion route. GTM counts the conversion on the CLICK on a
 * link to this URL, on the page the click came from ("Click URL contains
 * /whatsapp"). Nothing here renders: an empty-body redirect, so no GTM ever
 * loads on /whatsapp and the conversion cannot be counted twice.
 *
 * Without a valid handoff cookie (JavaScript off, cookies blocked, a crawler,
 * someone typing the URL) it still redirects, with an X code, and writes no
 * row: a row has to mean "a real click happened".
 */
export const dynamic = "force-dynamic";
/** Seconds. Keeps the function alive for the Sheet write in `after()`; see TIMEOUT_MS. */
export const maxDuration = 30;

export function GET(request: NextRequest) {
  const handoff = decodeHandoff(request.cookies.get(HANDOFF_COOKIE)?.value);
  const code = handoff?.code ?? generateLeadCode("unknown");
  const destination = whatsappUrl(
    clinic.phoneE164,
    handoff?.service ?? "geral",
    handoff?.page ?? "",
    code,
  );

  // 302, never 301/308: a browser caches a permanent redirect and would reuse
  // a stale code on every later click.
  const response = NextResponse.redirect(destination, 302);
  response.headers.set("Cache-Control", "no-store");
  response.cookies.set(HANDOFF_COOKIE, "", { path: "/whatsapp", maxAge: 0 });

  // Fails closed: only a Vercel production deploy with the webhook configured
  // writes to the Sheet. Previews, local builds and e2e runs never do, even
  // with production variables pulled into a local .env file.
  const url = process.env.LEAD_WEBHOOK_URL;
  if (handoff && url && process.env.VERCEL_ENV === "production") {
    const secret = process.env.LEAD_WEBHOOK_SECRET;
    const extras = {
      ts: new Date().toISOString(),
      userAgent: request.headers.get("user-agent") ?? undefined,
      fbp: request.cookies.get("_fbp")?.value,
      fbc: request.cookies.get("_fbc")?.value,
    };
    after(async () => {
      try {
        await sendLead(leadRow(handoff, extras), { url, secret });
      } catch (error) {
        console.error(`lead ${code} not recorded`, error);
      }
    });
  }

  return response;
}
