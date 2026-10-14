import type { Touch } from "@/lib/attribution";
import { leadChannel } from "@/lib/lead-code";
import type { Handoff } from "@/lib/whatsapp";

/**
 * The Sheet row for one click, sent by lib/lead-webhook.ts. The receiving end
 * is scripts/leads-apps-script.gs, which matches columns by header name.
 */

/**
 * A spreadsheet runs a cell that starts with = + - or @ as a formula. The
 * cookie is visitor-controlled, so every value is neutralised before it can
 * reach the Sheet.
 */
function cell(value: string | number | undefined): string {
  const text = value === undefined ? "" : String(value);
  return /^[=+\-@\t\r]/.test(text) ? `'${text}` : text;
}

const TOUCH_COLUMNS = [
  "channel",
  "ts",
  "landing",
  "referrer",
  "source",
  "medium",
  "campaign",
  "content",
  "term",
  "id",
  "gclid",
  "gbraid",
  "wbraid",
  "fbclid",
] as const satisfies readonly (keyof Touch)[];

function touchCells(prefix: string, t: Touch | null): Record<string, string> {
  const cells: Record<string, string> = {};
  for (const column of TOUCH_COLUMNS) {
    const value = column === "ts" && t ? new Date(t.ts).toISOString() : t?.[column];
    cells[`${prefix}_${column}`] = cell(value);
  }
  return cells;
}

export type LeadExtras = { ts: string; userAgent?: string; fbp?: string; fbc?: string };

/** One Sheet row per click, always the same columns in the same order. */
export function leadRow(h: Handoff, extras: LeadExtras): Record<string, string> {
  return {
    ts: cell(extras.ts),
    lead_code: cell(h.code),
    channel: leadChannel(h),
    service: cell(h.service),
    page: cell(h.page),
    placement: cell(h.from),
    ...touchCells("last", h.last),
    ...touchCells("first", h.first),
    fbp: cell(extras.fbp),
    fbc: cell(extras.fbc),
    user_agent: cell(extras.userAgent),
  };
}
