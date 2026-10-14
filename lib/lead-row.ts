import { specialities } from "@/content/specialities";
import { units } from "@/content/units";
import type { Touch } from "@/lib/attribution";
import { leadChannel, type CodeChannel } from "@/lib/lead-code";
import type { Handoff } from "@/lib/whatsapp";

/**
 * The Sheet row for one click, sent by lib/lead-webhook.ts. The receiving end
 * is scripts/leads-apps-script.gs, which matches columns by header name.
 *
 * The clinic's staff read this tab, so the first columns are plain Portuguese
 * with translated values. Everything after them is raw data kept for sending
 * bookings back to the ad platforms later, labelled "Técnico:" so staff know
 * they can ignore it.
 */

/** The Apps Script finds the code and the timestamp by these headers. */
export const CODE_COLUMN = "Código";
export const TIMESTAMP_COLUMN = "Técnico: horário (UTC)";

/** Same wording as the letter list staff were given. */
export const CHANNEL_LABEL: Record<CodeChannel, string> = {
  google_ads: "Anúncio do Google",
  meta_ads: "Anúncio do Instagram ou Facebook",
  organic_search: "Achou no Google, sem anúncio",
  social_organic: "Instagram ou Facebook, sem anúncio",
  referral: "Outro site, QR code ou indicação",
  other: "Outro site, QR code ou indicação",
  direct: "Digitou o endereço do site",
  unknown: "Não deu pra saber",
};

const FIXED_PAGES: Record<string, string> = {
  "/": "Página inicial",
  "/pilates": "Pilates",
  "/fisioterapia-domiciliar": "Atendimento domiciliar",
  "/especialidades": "Especialidades",
  "/unidades": "Unidades",
  "/blog": "Blog",
};

/** The page a click came from, as the clinic would name it. */
export function pageLabel(path: string): string {
  if (path in FIXED_PAGES) return FIXED_PAGES[path];
  const [, section, slug] = path.split("/");
  if (section === "especialidades") {
    const speciality = specialities.find((s) => s.slug === slug);
    if (speciality) return speciality.title;
  }
  if (section === "unidades") {
    const unit = units.find((u) => u.slug === slug);
    if (unit) return unit.name;
  }
  if (section === "blog" && slug) return `Blog: ${slug.replace(/-/g, " ")}`;
  return path;
}

const BUTTONS: Record<string, string> = {
  fab: "Botão flutuante do WhatsApp",
  nav: "Menu do topo",
  "mobile-menu": "Menu do celular",
  hero: "Topo da página inicial",
  footer: "Rodapé",
  contato: "Seção de contato",
  "landing-pilates": "Seção de Pilates da página inicial",
};

/**
 * Which button was tapped. In-page CTAs pass their page path as `from`, and
 * the page already has its own column.
 */
export function buttonLabel(from: string): string {
  if (from in BUTTONS) return BUTTONS[from];
  if (from.startsWith("/")) return "Botão no meio da página";
  return from;
}

export function deviceLabel(userAgent: string | undefined): string {
  if (!userAgent) return "";
  if (/iPad|Tablet/i.test(userAgent)) return "Tablet";
  if (/Android/i.test(userAgent) && !/Mobile/i.test(userAgent)) return "Tablet";
  if (/Mobi|iPhone|Android/i.test(userAgent)) return "Celular";
  return "Computador";
}

const BRASILIA = new Intl.DateTimeFormat("pt-BR", {
  timeZone: "America/Sao_Paulo",
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

function brasiliaTime(iso: string): string {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? "" : BRASILIA.format(date).replace(", ", " ");
}

/**
 * A spreadsheet runs a cell that starts with = + - or @ as a formula. The
 * cookie is visitor-controlled, so every value is neutralised before it can
 * reach the Sheet.
 */
function cell(value: string | number | undefined): string {
  const text = value === undefined ? "" : String(value);
  return /^[=+\-@\t\r]/.test(text) ? `'${text}` : text;
}

const TOUCH_COLUMNS = {
  channel: "canal",
  ts: "data (UTC)",
  landing: "página de entrada",
  referrer: "site de origem",
  source: "utm_source",
  medium: "utm_medium",
  campaign: "utm_campaign",
  content: "utm_content",
  term: "utm_term",
  id: "utm_id",
  gclid: "gclid",
  gbraid: "gbraid",
  wbraid: "wbraid",
  fbclid: "fbclid",
} as const satisfies Partial<Record<keyof Touch, string>>;

function touchCells(name: string, t: Touch | null): Record<string, string> {
  const cells: Record<string, string> = {};
  for (const [field, label] of Object.entries(TOUCH_COLUMNS) as [keyof typeof TOUCH_COLUMNS, string][]) {
    const value = field === "ts" && t ? new Date(t.ts).toISOString() : t?.[field];
    cells[`Técnico: ${name}, ${label}`] = cell(value);
  }
  return cells;
}

/**
 * Read from the /whatsapp request, not from the click handoff. All four are
 * first-party cookies on the site's domain, and each is what an ad platform
 * needs to match a later booking to its click:
 * - `_fbp` / `_fbc`: Meta Pixel browser and click ids (Conversions API).
 * - `_gcl_aw`: Google's Conversion Linker copy of the gclid, kept 90 days;
 *   a fallback when the site's own storage lost it.
 * - `_ga`: the GA4 client id, for sending a conversion through GA4.
 */
export type LeadExtras = {
  ts: string;
  userAgent?: string;
  fbp?: string;
  fbc?: string;
  gclAw?: string;
  ga?: string;
};

export const READABLE_COLUMNS = [
  "Data e hora",
  CODE_COLUMN,
  "De onde veio",
  "Campanha",
  "Palavra buscada",
  "Página",
  "Botão",
  "Aparelho",
] as const;

/** One Sheet row per click, always the same columns in the same order. */
export function leadRow(h: Handoff, extras: LeadExtras): Record<string, string> {
  const channel = leadChannel(h);
  const touch = h.last ?? h.first;
  const readable: Record<(typeof READABLE_COLUMNS)[number], string> = {
    "Data e hora": brasiliaTime(extras.ts),
    [CODE_COLUMN]: cell(h.code),
    "De onde veio": CHANNEL_LABEL[channel],
    Campanha: cell(touch?.campaign),
    "Palavra buscada": cell(touch?.term),
    Página: cell(pageLabel(h.page)),
    Botão: cell(buttonLabel(h.from)),
    Aparelho: deviceLabel(extras.userAgent),
  };
  return {
    ...readable,
    [TIMESTAMP_COLUMN]: cell(extras.ts),
    "Técnico: canal": channel,
    "Técnico: serviço": cell(h.service),
    "Técnico: página": cell(h.page),
    "Técnico: botão": cell(h.from),
    ...touchCells("último toque", h.last),
    ...touchCells("primeiro toque", h.first),
    "Técnico: _fbp": cell(extras.fbp),
    "Técnico: _fbc": cell(extras.fbc),
    "Técnico: _gcl_aw": cell(extras.gclAw),
    "Técnico: _ga": cell(extras.ga),
    "Técnico: navegador": cell(extras.userAgent),
  };
}
