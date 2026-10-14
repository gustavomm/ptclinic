/**
 * Sends one lead row to the Google Apps Script web app that appends it to the
 * leads Sheet (scripts/leads-apps-script.gs). Server-only: called from
 * app/whatsapp/route.ts inside `after()`, once the redirect is already sent.
 * Failures are logged and dropped; the code in the WhatsApp message, and its
 * channel letter, survive without the row.
 */

/**
 * Apps Script cold starts take seconds and the script may wait up to 10 s for
 * its lock; nobody is waiting on this. Must stay below the route's maxDuration.
 */
export const TIMEOUT_MS = 25_000;

export type LeadWebhookConfig = {
  url: string | undefined;
  secret: string | undefined;
  fetchImpl?: typeof fetch;
};

export async function sendLead(
  row: Record<string, string>,
  { url, secret, fetchImpl = fetch }: LeadWebhookConfig,
): Promise<void> {
  if (!url) return;
  const code = row.lead_code ?? "?";
  try {
    // The secret goes in the body: an Apps Script web app cannot read request headers.
    const res = await fetchImpl(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ secret: secret ?? "", row }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    // Apps Script cannot set a status code, so a refusal (wrong secret) still
    // arrives as 200. The script answers exactly "ok" when the row is written.
    const answer = (await res.text()).trim();
    if (!res.ok || answer !== "ok") {
      console.error(`lead ${code} not recorded`, `HTTP ${res.status}: ${answer.slice(0, 200)}`);
    }
  } catch (error) {
    console.error(`lead ${code} not recorded`, error);
  }
}
