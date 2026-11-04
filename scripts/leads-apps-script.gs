/**
 * @OnlyCurrentDoc
 *
 * Receiving end of lib/lead-webhook.ts: appends one row per WhatsApp click to
 * the "Cliques do site" tab, and fills "Canal" in the staff's contacts tab when
 * they paste a code. Lives in the Sheet itself (Extensions → Apps Script);
 * this file is the versioned copy, tested by scripts/__tests__.
 *
 * Contract with the site:
 * - POST body `{ secret, row }`; `row` is lib/lead-row.ts, a flat object of
 *   strings whose keys are the column headers, readable columns first.
 * - Reply exactly `ok` when the row is stored (or was already stored).
 *   Anything else is logged by the site as "lead not recorded": Apps Script
 *   cannot send an error status, so the body is the only signal.
 *
 * Setup:
 * 1. Project Settings → Script Properties: LEAD_WEBHOOK_SECRET (long random
 *    value) and ALERT_EMAIL (who hears about silence).
 * 2. Deploy → New deployment → Web app; execute as Me; access: Anyone.
 *    The /exec URL and the same secret go into Vercel, **Production only**:
 *    LEAD_WEBHOOK_URL, LEAD_WEBHOOK_SECRET.
 *    Editing the script later: Deploy → Manage deployments → edit → New
 *    version. A *new deployment* gets a new URL, and Vercel keeps the old one.
 * 3. Triggers → add `checkStale`, time-driven, daily.
 *    `onEdit` and `onOpen` need no setup: Sheets runs them by name.
 * 4. Once, on the contacts tab: menu Vyta → "Prévia da organização" to see
 *    what would change, then "Organizar planilha" to apply it. Safe to rerun.
 *
 * Columns are created from the first row's keys and matched by header name,
 * so columns can be added to the right freely. A code is not unique on its
 * own: match a conversation to a row by code and date.
 */
const SHEET_NAME = "Cliques do site";
/**
 * Rows in the first, English format (before 2026-10-14) still go to the old
 * tab, so the switchover never mixes the two. Remove once nothing arrives there.
 */
const LEGACY_SHEET_NAME = "cliques";
const CODE_HEADER = "Código";
const TS_HEADER = "Técnico: horário (UTC)";
const SERVICE_HEADER = "Técnico: serviço";
const PAGE_HEADER = "Técnico: página";
/** The first columns, the ones staff read; the rest start with "Técnico:". */
const READABLE_COLUMNS = 8;
const TIMEZONE = "America/Sao_Paulo";
/** The same click arriving twice (a double tap sends two requests with one cookie) is ignored. */
const DUPLICATE_WINDOW_MS = 10 * 60 * 1000;
/** No new row for this long, with this volume of traffic, means something broke. */
const STALE_AFTER_DAYS = 3;

/** The code's 4th character. Same wording as CHANNEL_LABEL in lib/lead-row.ts. */
const LETTER_LABELS = {
  G: "Anúncio do Google",
  M: "Anúncio do Instagram ou Facebook",
  O: "Achou no Google, sem anúncio",
  I: "Instagram ou Facebook, sem anúncio",
  R: "Outro site, QR code ou indicação",
  D: "Digitou o endereço do site",
  X: "Não deu pra saber",
};

function doPost(e) {
  let body;
  try {
    body = JSON.parse(e.postData.contents);
  } catch (err) {
    return reply("bad request");
  }
  const props = PropertiesService.getScriptProperties();
  const expected = props.getProperty("LEAD_WEBHOOK_SECRET");
  if (!expected || body.secret !== expected) return reply("forbidden");
  const row = body.row;
  if (!row || typeof row !== "object") return reply("bad request");

  const legacy = typeof row.lead_code === "string";
  const codeKey = legacy ? "lead_code" : CODE_HEADER;
  const tsKey = legacy ? "ts" : TS_HEADER;
  if (typeof row[codeKey] !== "string" || !row[codeKey]) return reply("bad request");

  const lock = LockService.getScriptLock();
  // Short enough that the site's 25 s timeout never logs "not recorded" for a
  // row that is then written anyway: past this, the write fails and says so.
  lock.waitLock(10000);
  try {
    const name = legacy ? LEGACY_SHEET_NAME : SHEET_NAME;
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(name) || ss.insertSheet(name);
    let headers = headerRow(sheet);

    if (isDuplicate(sheet, headers, codeKey, tsKey, row)) return reply("ok");

    const record = legacy
      ? Object.assign({}, row, {
          data_hora: Utilities.formatDate(new Date(row.ts), TIMEZONE, "yyyy-MM-dd HH:mm:ss"),
        })
      : row;
    const isNewSheet = headers.length === 0;
    const missing = Object.keys(record).filter((k) => headers.indexOf(k) === -1);
    if (missing.length) {
      sheet.getRange(1, headers.length + 1, 1, missing.length).setValues([missing]);
      headers = headers.concat(missing);
    }
    if (isNewSheet && !legacy) formatClicksSheet(sheet, headers.length);

    const values = headers.map((h) =>
      Object.prototype.hasOwnProperty.call(record, h) ? String(record[h]) : "",
    );
    // Plain text, always: no formulas, no "0011" turned into 11, no dates guessed.
    const target = sheet.getRange(sheet.getLastRow() + 1, 1, 1, headers.length);
    target.setNumberFormat("@");
    target.setValues([values]);
    return reply("ok");
  } finally {
    lock.releaseLock();
  }
}

/** Frozen bold header; readable columns green and wide, technical ones grey. */
function formatClicksSheet(sheet, columns) {
  sheet.setFrozenRows(1);
  sheet.getRange(1, 1, 1, columns).setFontWeight("bold").setWrap(true);
  sheet.getRange(1, 1, 1, READABLE_COLUMNS).setBackground("#d9ead3");
  if (columns > READABLE_COLUMNS) {
    sheet
      .getRange(1, READABLE_COLUMNS + 1, 1, columns - READABLE_COLUMNS)
      .setBackground("#eeeeee")
      .setFontColor("#666666");
  }
  sheet.setColumnWidths(1, READABLE_COLUMNS, 170);
}

function headerRow(sheet) {
  if (sheet.getLastRow() === 0) return [];
  return sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0].map(String);
}

function isDuplicate(sheet, headers, codeKey, tsKey, row) {
  const codeCol = headers.indexOf(codeKey);
  const tsCol = headers.indexOf(tsKey);
  const last = sheet.getLastRow();
  if (codeCol === -1 || tsCol === -1 || last < 2) return false;
  const start = Math.max(2, last - 49);
  const recent = sheet.getRange(start, 1, last - start + 1, headers.length).getValues();
  const now = new Date(row[tsKey]).getTime();
  return recent.some(
    (r) =>
      r[codeCol] === row[codeKey] && Math.abs(now - new Date(r[tsCol]).getTime()) < DUPLICATE_WINDOW_MS,
  );
}

/**
 * Runs on every edit of the staff's contacts tab (the one with "Código" and
 * "Canal" columns).
 * - A phone or name on a row with no "1º contato" dates it today.
 * - A code typed or pasted into "Código" is tidied, and "Canal" gets where the
 *   person came from. The letter after "VY-" is enough for that, so it works
 *   even when the click row is missing; a missing row only earns a note, which
 *   is how a typo gets noticed. When the click row is there, it also gives
 *   "1º contato" and, if empty, "Serviço".
 * - A value picked in "Resultado" dates itself in "Data do resultado".
 */
function onEdit(e) {
  const sheet = e.range.getSheet();
  // The clicks tabs have a "Código" column but no "Canal", so they never match.
  const layout = contactsLayout(sheet);
  if (!layout) return;
  if (layout.firstContactCol && (touches(e.range, layout.contactCol) || touches(e.range, layout.nameCol))) {
    stampFirstContact(sheet, layout, e.range);
  }
  if (touches(e.range, layout.codeCol)) fillFromCodes(sheet, layout, e.range);
  if (layout.resultadoCol && layout.dateCol && touches(e.range, layout.resultadoCol)) {
    stampResultDates(sheet, layout, e.range);
  }
}

function touches(range, col) {
  return col >= range.getColumn() && col <= range.getColumn() + range.getNumColumns() - 1;
}

/** The data rows of an edited range: never the header or anything above it. */
function editedRows(range, layout) {
  const rows = [];
  const last = range.getRow() + range.getNumRows() - 1;
  for (let r = Math.max(range.getRow(), layout.row + 1); r <= last; r++) rows.push(r);
  return rows;
}

function stampFirstContact(sheet, layout, range) {
  for (const r of editedRows(range, layout)) {
    const cell = sheet.getRange(r, layout.firstContactCol);
    if (hasValue(cell.getValue())) continue;
    const named = [layout.contactCol, layout.nameCol].some((c) => c && hasValue(sheet.getRange(r, c).getValue()));
    if (named) cell.setValue(new Date()).setNumberFormat("dd/mm/yyyy");
  }
}

function fillFromCodes(sheet, layout, range) {
  let known = null;
  let clicks = null;
  for (const r of editedRows(range, layout)) {
    const codeCell = sheet.getRange(r, layout.codeCol);
    const raw = String(codeCell.getValue()).trim();
    if (!raw || raw === "-") {
      codeCell.setNote("");
      continue;
    }
    const code = normalizeCode(raw);
    if (!code) {
      codeCell.setNote("Código inválido: confira se foi copiado inteiro, por exemplo VY-G7K3Q2.");
      continue;
    }
    if (code !== raw) codeCell.setValue(code);
    sheet.getRange(r, layout.channelCol).setValue(labelForCode(code));
    known = known || knownCodes();
    codeCell.setNote(
      known.has(code)
        ? ""
        : "Este código não está na aba Cliques do site. Confira se foi digitado certo.",
    );
    clicks = clicks || latestClicks();
    if (clicks[code]) fillFromClick(sheet, layout, r, clicks[code]);
  }
}

/**
 * The click is when the person wrote, so it beats an empty "1º contato" or
 * one dated today by stampFirstContact, but never a date typed by hand.
 */
function fillFromClick(sheet, layout, r, click) {
  if (layout.firstContactCol && click.time) {
    const cell = sheet.getRange(r, layout.firstContactCol);
    const current = cell.getValue();
    if (!hasValue(current) || (isDate(current) && sameDay(current, new Date()))) {
      cell.setValue(click.time).setNumberFormat("dd/mm/yyyy");
    }
  }
  if (layout.servicoCol) {
    const cell = sheet.getRange(r, layout.servicoCol);
    const servico = serviceForClick(click.service, click.page);
    if (servico && !hasValue(cell.getValue())) cell.setValue(servico);
  }
}

/**
 * Serviço for a click, matching what the WhatsApp message asked about
 * (lib/whatsapp.ts): Pilates by service or page, any other service is
 * physiotherapy, and the general buttons say nothing.
 */
function serviceForClick(service, page) {
  const s = String(service || "");
  const p = String(page || "");
  if (s === "pilates" || p === "/pilates" || p.startsWith("/pilates/")) return "Pilates";
  if (s === "domiciliar" || s.startsWith("fisioterapia")) return "Fisioterapia";
  return "";
}

/** The newest click of each code in "Cliques do site": codes repeat across days. */
function latestClicks() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  if (!sheet || sheet.getLastRow() < 2) return {};
  const values = sheet.getRange(1, 1, sheet.getLastRow(), sheet.getLastColumn()).getValues();
  const header = values[0].map((v) => String(v).trim());
  const at = (cells, name) => (header.indexOf(name) === -1 ? "" : cells[header.indexOf(name)]);
  const clicks = {};
  for (const cells of values.slice(1)) {
    const code = String(at(cells, CODE_HEADER)).trim();
    const raw = at(cells, TS_HEADER);
    const time = isDate(raw) ? raw : new Date(String(raw));
    const known = clicks[code];
    if (!code || (known && known.time && !isNaN(time) && known.time > time)) continue;
    clicks[code] = {
      time: isNaN(time) ? null : time,
      service: String(at(cells, SERVICE_HEADER)),
      page: String(at(cells, PAGE_HEADER)),
    };
  }
  return clicks;
}

function sameDay(a, b) {
  return Utilities.formatDate(a, TIMEZONE, "yyyy-MM-dd") === Utilities.formatDate(b, TIMEZONE, "yyyy-MM-dd");
}

function stampResultDates(sheet, layout, range) {
  for (const r of editedRows(range, layout)) {
    const picked = String(sheet.getRange(r, layout.resultadoCol).getValue()).trim();
    const dateCell = sheet.getRange(r, layout.dateCol);
    if (picked) {
      dateCell.setValue(new Date());
      dateCell.setNumberFormat("dd/mm/yyyy");
    } else {
      dateCell.setValue("");
    }
  }
}

/** The header row of a tab with both a "Código" and a "Canal" column, if any. */
function findCodeHeader(sheet) {
  const rows = Math.min(10, sheet.getLastRow());
  if (rows === 0) return null;
  const values = sheet.getRange(1, 1, rows, sheet.getLastColumn()).getValues();
  for (let i = 0; i < values.length; i++) {
    const cells = values[i].map((v) => String(v).trim());
    const codeCol = cells.indexOf(CODE_HEADER);
    const channelCol = cells.indexOf("Canal");
    if (codeCol !== -1 && channelCol !== -1) {
      return { row: i + 1, codeCol: codeCol + 1, channelCol: channelCol + 1 };
    }
  }
  return null;
}

/**
 * The code inside whatever was pasted ("(código vy-g7k3q2)." included), in
 * canonical form, or null. The 4th character is always a letter, so a 0 or 1
 * typed there was an O or I.
 */
function normalizeCode(raw) {
  const text = String(raw)
    // Invisible marks a copy from WhatsApp or a phone can carry: zero-width
    // characters, direction marks, soft hyphen, byte-order mark.
    .replace(/[\u00AD\u200B-\u200F\u202A-\u202E\u2060-\u2064\u2066-\u206F\uFEFF]/g, "")
    // Dashes that look like "-" but are other characters.
    .replace(/[\u2010-\u2015\u2212\uFE58\uFE63\uFF0D_]/g, "-")
    .toUpperCase();
  const match = text.match(/VY[\s-]?([A-Z0-9]{6})(?![A-Z0-9])/);
  if (!match) return null;
  let body = match[1];
  const letter = { 0: "O", 1: "I" }[body[0]];
  if (letter) body = letter + body.slice(1);
  const code = "VY-" + body;
  return /^VY-[GMOIRDX][A-HJ-NP-Z2-9]{5}$/.test(code) ? code : null;
}

function labelForCode(code) {
  return LETTER_LABELS[code.charAt(3)] || "";
}

function knownCodes() {
  return new Set(
    codesIn(SHEET_NAME, CODE_HEADER).concat(codesIn(LEGACY_SHEET_NAME, "lead_code")),
  );
}

function codesIn(name, header) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(name);
  if (!sheet || sheet.getLastRow() < 2) return [];
  const col = headerRow(sheet).indexOf(header);
  if (col === -1) return [];
  return sheet
    .getRange(2, col + 1, sheet.getLastRow() - 1, 1)
    .getValues()
    .map((r) => String(r[0]));
}

/**
 * Daily trigger: e-mails ALERT_EMAIL when no click has been recorded for a
 * while. Reads the newest timestamp in the column, so sorting the Sheet or
 * adding manual rows does not fool it.
 */
function checkStale() {
  const newest = Math.max(newestTime(SHEET_NAME, TS_HEADER), newestTime(LEGACY_SHEET_NAME, "ts"));
  const ageDays = (Date.now() - newest) / 86400000;
  if (ageDays < STALE_AFTER_DAYS) return;

  const to = PropertiesService.getScriptProperties().getProperty("ALERT_EMAIL");
  if (!to) return;
  MailApp.sendEmail(
    to,
    "Planilha de leads sem cliques novos",
    `Nenhum clique de WhatsApp registrado há ${isFinite(ageDays) ? Math.floor(ageDays) + " dias" : "muito tempo"}. ` +
      "Conferir: LEAD_WEBHOOK_URL e LEAD_WEBHOOK_SECRET na Vercel (Production), a implantação do " +
      "Apps Script e os logs da função /whatsapp na Vercel.",
  );
}

function newestTime(name, header) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(name);
  if (!sheet || sheet.getLastRow() < 2) return -Infinity;
  const col = headerRow(sheet).indexOf(header);
  if (col === -1) return -Infinity;
  const times = sheet
    .getRange(2, col + 1, sheet.getLastRow() - 1, 1)
    .getValues()
    .map((r) => new Date(r[0]).getTime())
    .filter((t) => !isNaN(t));
  return times.length ? Math.max.apply(null, times) : -Infinity;
}

// ---------------------------------------------------------------------------
// Contacts tab: Status says what kind of contact it is (filled at first
// contact), Resultado says how it ended (filled in the weekly review). A lead
// with no Resultado after a week turns yellow. The menu "Vyta" can preview and
// then apply a one-time tidy of the older rows, inferring Resultado from what
// the tab already says.
// ---------------------------------------------------------------------------

const STATUS_OPTIONS = ["Lead Fisio", "Lead Pilates", "Pass", "Contato profissional", "Outro"];
const RESULTADO_OPTIONS = [
  "Agendou",
  "Paciente",
  "Sem resposta",
  "Preço",
  "Convênio",
  "Horário",
  "Fora da área",
  "Serviço que não fazemos",
  "Achou que era a Vita",
  "Outro",
];
const SERVICO_OPTIONS = ["Pilates", "Fisioterapia", "Contato profissional", "Outro"];
/** Where someone came from when there is no code to say it. */
const MANUAL_CHANNELS = ["Instagram (mensagem direta)", "Google Maps", "Indicação", "Ligação", "Já é paciente", "Outro"];
const CANAL_OPTIONS = Object.values(LETTER_LABELS).concat(MANUAL_CHANNELS);
const RETURN_HEADER = "Retornar em";
const PREVIEW_SHEET_NAME = "Prévia da organização";
const REVIEW_AFTER_DAYS = 7;
const REVIEW_COLOR = "#fff2cc";
const FOLLOW_UP_COLOR = "#fce5cd";
/** Let a rerun find and replace its own highlight rules, and no one else's. */
const REVIEW_MARKER = "revisao-vyta";
const FOLLOW_UP_MARKER = "retorno-vyta";

/** Old Status values that name the kind of contact, as their tidy form. */
const STATUS_TYPES = {
  "lead fisio": "Lead Fisio",
  "lead pilates": "Lead Pilates",
  "leas pilates": "Lead Pilates",
  pass: "Pass",
  "contato profissional": "Contato profissional",
  golpe: "Outro",
  "miss click": "Outro",
  erro: "Outro",
  outro: "Outro",
};

/** Old Status values that were really an outcome, as the Resultado they mean. */
const STATUS_OUTCOMES = {
  "nunca respondeu": "Sem resposta",
  convenio: "Convênio",
  sus: "Convênio",
  "outro estado": "Fora da área",
  rpg: "Serviço que não fazemos",
  "achou que era a vita": "Achou que era a Vita",
  recusou: "Outro",
};

/** Old Serviço values, as the option they mean. "-" was the old "nothing here". */
const SERVICO_TIDY = {
  pilates: "Pilates",
  fisio: "Fisioterapia",
  fisioterapia: "Fisioterapia",
  "contato profissional": "Contato profissional",
  golpe: "Outro",
  erro: "Outro",
  fono: "Outro",
  outro: "Outro",
  "-": "",
};

/** Words in Observações that schedule the next message ("Chamar 27/10"). */
const FOLLOW_UP_WORDS = /chamar|retornar|mandar mensagem|mantar mensagem|entrar em contato|ligar|ver se|cobrar|lembrar/;

/** Words in Observações that settle a Resultado, strongest first. */
const OBSERVATION_RULES = [
  [/virou paciente|ja e paciente|fechou|matricul/, "Paciente"],
  [/agendou|agendad|marcou|marcad/, "Agendou"],
  [/preco|\bcaro\b|\bvalor/, "Preço"],
  [/convenio|plano de saude|reembolso/, "Convênio"],
  [/horario/, "Horário"],
  [/longe|fora de mao|outro estado|fora da area|mora em|mora no|mora na/, "Fora da área"],
  [/nao respond|nunca respond|sumiu|visualizou|vacuo/, "Sem resposta"],
];

/** Lowercase, no accents, single spaces: how headers and free text are compared. */
function fold(text) {
  return String(text)
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function isDate(value) {
  return Object.prototype.toString.call(value) === "[object Date]" && !isNaN(value.getTime());
}

function hasValue(value) {
  if (isDate(value)) return true;
  const text = String(value === undefined || value === null ? "" : value).trim();
  return text !== "" && text !== "-";
}

function leadFor(servico) {
  return fold(servico).includes("pilates") ? "Lead Pilates" : "Lead Fisio";
}

/**
 * What one row of the contacts tab should say. Input and output are plain
 * values, so the rules can be tested and previewed without touching the tab.
 * A Resultado already chosen by hand is never changed.
 */
function classifyRow(row) {
  const current = String(row.status || "").trim();
  const existing = String(row.resultado || "").trim();
  const key = fold(current);
  let status = current;
  let resultado = existing;
  let reason = "";
  if (!key) return { status, resultado, reason };

  if (STATUS_TYPES[key]) {
    status = STATUS_TYPES[key];
    if (status !== current) reason = `Status "${current}" padronizado`;
  } else if (STATUS_OUTCOMES[key]) {
    status = leadFor(row.servico);
    reason = `Status antigo "${current}"`;
    if (!existing) resultado = STATUS_OUTCOMES[key];
  } else {
    return { status, resultado, reason: `Status "${current}" não reconhecido: ficou como está` };
  }

  const canHaveResult = status === "Lead Fisio" || status === "Lead Pilates" || status === "Pass";
  if (resultado || !canHaveResult) return { status, resultado, reason };

  const servico = fold(row.servico);
  if (/fono|rpg/.test(servico)) {
    return { status, resultado: "Serviço que não fazemos", reason: `Serviço "${row.servico}"` };
  }
  if (hasValue(row.segundaAula)) {
    return { status, resultado: "Paciente", reason: "tem data em 2º aula" };
  }
  const observacoes = fold(row.observacoes);
  for (const [pattern, value] of OBSERVATION_RULES) {
    const match = observacoes.match(pattern);
    if (match) return { status, resultado: value, reason: `Observações menciona "${match[0]}"` };
  }
  return { status, resultado, reason };
}

/**
 * The follow-up date written in Observações, or null. A date without a year
 * is the next one on or after the first contact.
 */
function followUpDate(observacoes, firstContact) {
  const text = fold(observacoes || "");
  if (!FOLLOW_UP_WORDS.test(text)) return null;
  const match = text.match(/\b(\d{1,2})\/(\d{1,2})(?:\/(\d{4}|\d{2}))?\b/);
  if (!match) return null;
  const day = Number(match[1]);
  const month = Number(match[2]);
  const base = isDate(firstContact) ? firstContact : new Date();
  const year = match[3] ? Number(match[3].length === 2 ? "20" + match[3] : match[3]) : base.getFullYear();
  let date = new Date(year, month - 1, day, 12);
  if (!match[3] && date.getTime() < base.getTime() - 86400000) date = new Date(year + 1, month - 1, day, 12);
  return date.getMonth() === month - 1 && date.getDate() === day ? date : null;
}

function columnLetter(n) {
  let letters = "";
  for (let x = n; x > 0; x = Math.floor((x - 1) / 26)) {
    letters = String.fromCharCode(65 + ((x - 1) % 26)) + letters;
  }
  return letters;
}

/**
 * Yellow when: a lead, no Resultado, first contact more than a week ago, and
 * no follow-up date (that one has its own colour).
 * Sheets reads the formula in the spreadsheet's own syntax: a Portuguese
 * Sheet rejects commas between arguments and wants ";".
 */
function highlightFormula(cols, firstRow, sep = ",") {
  const status = `$${columnLetter(cols.statusCol)}${firstRow}`;
  const resultado = `$${columnLetter(cols.resultadoCol)}${firstRow}`;
  const first = `$${columnLetter(cols.firstContactCol)}${firstRow}`;
  const followUp = cols.returnCol ? `NOT(ISNUMBER($${columnLetter(cols.returnCol)}${firstRow}))${sep}` : "";
  return (
    `=AND(LEFT(${status}${sep}4)="Lead"${sep}${resultado}=""${sep}ISNUMBER(${first})${sep}` +
    `TODAY()-${first}>${REVIEW_AFTER_DAYS}${sep}${followUp}N("${REVIEW_MARKER}")=0)`
  );
}

/** Orange from the follow-up day on, until someone picks a Resultado. */
function followUpFormula(cols, firstRow, sep = ",") {
  const followUp = `$${columnLetter(cols.returnCol)}${firstRow}`;
  const resultado = `$${columnLetter(cols.resultadoCol)}${firstRow}`;
  return `=AND(ISNUMBER(${followUp})${sep}${followUp}<=TODAY()${sep}${resultado}=""${sep}N("${FOLLOW_UP_MARKER}")=0)`;
}

/** Sheets separates arguments with ";" in locales that write decimals with a comma. */
function argumentSeparator(locale) {
  return /^(en|ja|zh|ko|th|he|iw|hi)(_|$)/.test(String(locale)) ? "," : ";";
}

/** Where each named column of the contacts tab is (0 when missing), or null. */
function contactsLayout(sheet) {
  const header = findCodeHeader(sheet);
  if (!header) return null;
  const names = sheet
    .getRange(header.row, 1, 1, sheet.getLastColumn())
    .getValues()[0]
    .map(fold);
  const col = (name) => names.indexOf(fold(name)) + 1;
  return {
    row: header.row,
    codeCol: header.codeCol,
    channelCol: header.channelCol,
    contactCol: col("Contato"),
    nameCol: col("Nome"),
    statusCol: col("Status"),
    resultadoCol: col("Resultado"),
    dateCol: col("Data do resultado"),
    servicoCol: col("Serviço"),
    obsCol: col("Observações"),
    segundaCol: col("2º aula"),
    firstContactCol: col("1º contato"),
    lastContactCol: col("Último contato"),
    returnCol: col(RETURN_HEADER),
  };
}

/**
 * Every row that would change, and why. A row whose only change is clearing
 * a "-" placeholder is not `listed`: the preview counts those instead.
 */
function planChanges(sheet, layout) {
  const count = sheet.getLastRow() - layout.row;
  if (count <= 0) return [];
  const values = sheet.getRange(layout.row + 1, 1, count, sheet.getLastColumn()).getValues();
  const changes = [];
  values.forEach((cells, i) => {
    const at = (col) => (col ? cells[col - 1] : "");
    const oldStatus = String(at(layout.statusCol)).trim();
    const oldResultado = String(at(layout.resultadoCol)).trim();
    const oldServico = String(at(layout.servicoCol)).trim();
    const oldCanal = String(at(layout.channelCol)).trim();
    const out = classifyRow({
      status: oldStatus,
      servico: oldServico,
      observacoes: at(layout.obsCol),
      segundaAula: at(layout.segundaCol),
      resultado: oldResultado,
    });
    const tidy = SERVICO_TIDY[fold(oldServico)];
    const servico = layout.servicoCol && tidy !== undefined ? tidy : oldServico;
    const canal = oldCanal === "-" ? "" : oldCanal;
    const followUp =
      !out.resultado && !hasValue(at(layout.returnCol)) ? followUpDate(at(layout.obsCol), at(layout.firstContactCol)) : null;
    const reasons = [out.reason];
    if (followUp) reasons.push("Observações tem data de retorno");
    if (servico !== oldServico && oldServico !== "-") reasons.push(`Serviço "${oldServico}" padronizado`);
    const listed =
      out.status !== oldStatus || out.resultado !== oldResultado || !!followUp || (servico !== oldServico && oldServico !== "-");
    const cleared = (servico !== oldServico && oldServico === "-" ? 1 : 0) + (canal !== oldCanal ? 1 : 0);
    if (listed || cleared) {
      changes.push({
        row: layout.row + 1 + i,
        listed,
        cleared,
        oldStatus,
        newStatus: out.status,
        oldResultado,
        resultado: out.resultado,
        oldServico,
        servico,
        oldCanal,
        canal,
        followUp,
        reason: reasons.filter(Boolean).join("; "),
        lastContact: at(layout.lastContactCol),
      });
    }
  });
  return changes;
}

/** The active tab, if it is the contacts tab; otherwise explains and returns null. */
function activeContactsTab() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getActiveSheet();
  const layout = sheet && contactsLayout(sheet);
  if (!layout || !layout.statusCol) {
    ss.toast("Abra a aba de contatos (a que tem Código, Canal e Status) e rode de novo.");
    return null;
  }
  return { ss, sheet, layout };
}

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("Vyta")
    .addItem("Prévia da organização", "previewOrganization")
    .addItem("Organizar planilha", "applyOrganization")
    .addToUi();
}

/** Writes what "Organizar planilha" would do into its own tab, changing nothing else. */
function previewOrganization() {
  const tab = activeContactsTab();
  if (!tab) return;
  const { ss, sheet, layout } = tab;
  const changes = planChanges(sheet, layout);
  const listed = changes.filter((c) => c.listed);
  const cleared = changes.reduce((n, c) => n + c.cleared, 0);
  const old = ss.getSheetByName(PREVIEW_SHEET_NAME);
  if (old) ss.deleteSheet(old);
  const preview = ss.insertSheet(PREVIEW_SHEET_NAME);

  const missing = [];
  if (!layout.resultadoCol) missing.push("Resultado e Data do resultado, depois de Status");
  else if (!layout.dateCol) missing.push("Data do resultado, depois de Resultado");
  if (!layout.returnCol) missing.push("Retornar em, depois de Último contato");
  const blank = ["", "", "", "", "", ""];
  const rows = [
    [`Aba "${sheet.getName()}": ${listed.length} linhas vão mudar.`].concat(blank),
    [missing.length ? `Colunas novas: ${missing.join("; ")}` : ""].concat(blank),
    [cleared ? `Além disso, ${cleared} células com "-" em Serviço ou Canal vão ficar vazias.` : ""].concat(blank),
    ["Linha", "Status atual", "Status novo", "Resultado sugerido", "Retornar em", "Serviço novo", "Por quê"],
  ].concat(
    listed.map((c) => [
      c.row,
      c.oldStatus,
      c.newStatus === c.oldStatus ? "" : c.newStatus,
      c.resultado === c.oldResultado ? "" : c.resultado,
      c.followUp ? Utilities.formatDate(c.followUp, TIMEZONE, "dd/MM/yyyy") : "",
      c.servico === c.oldServico || c.oldServico === "-" ? "" : c.servico,
      c.reason,
    ]),
  );
  preview.getRange(1, 1, rows.length, 7).setValues(rows);
  ss.toast(`Prévia pronta: ${listed.length} linhas vão mudar. Nada foi alterado ainda.`);
}

/** Adds the columns, tidies the rows, and sets the dropdowns and the yellow rule. */
function applyOrganization() {
  const tab = activeContactsTab();
  if (!tab) return;
  const { ss, sheet } = tab;
  let layout = tab.layout;

  if (!layout.resultadoCol) {
    sheet.insertColumnsAfter(layout.statusCol, 2);
    sheet.getRange(layout.row, layout.statusCol + 1, 1, 2).setValues([["Resultado", "Data do resultado"]]);
  } else if (!layout.dateCol) {
    sheet.insertColumnsAfter(layout.resultadoCol, 1);
    sheet.getRange(layout.row, layout.resultadoCol + 1).setValue("Data do resultado");
  }
  layout = contactsLayout(sheet);
  if (!layout.returnCol) {
    const after = layout.lastContactCol || layout.dateCol;
    sheet.insertColumnsAfter(after, 1);
    sheet.getRange(layout.row, after + 1).setValue(RETURN_HEADER);
    layout = contactsLayout(sheet);
  }

  const changes = planChanges(sheet, layout);
  for (const c of changes) {
    if (c.newStatus !== c.oldStatus) {
      sheet.getRange(c.row, layout.statusCol).setValue(c.newStatus).setNote(`Status antigo: "${c.oldStatus}"`);
    }
    if (c.resultado !== c.oldResultado) {
      sheet.getRange(c.row, layout.resultadoCol).setValue(c.resultado).setNote(`Preenchido automaticamente: ${c.reason}`);
      if (isDate(c.lastContact)) sheet.getRange(c.row, layout.dateCol).setValue(c.lastContact);
    }
    if (c.servico !== c.oldServico) {
      const cell = sheet.getRange(c.row, layout.servicoCol).setValue(c.servico);
      if (c.oldServico !== "-") cell.setNote(`Serviço antigo: "${c.oldServico}"`);
    }
    if (c.canal !== c.oldCanal) sheet.getRange(c.row, layout.channelCol).setValue(c.canal);
    if (c.followUp) {
      sheet
        .getRange(c.row, layout.returnCol)
        .setValue(c.followUp)
        .setNote("Preenchido automaticamente: data de retorno nas Observações");
    }
  }

  const rows = sheet.getMaxRows() - layout.row;
  const dropdown = (options) =>
    SpreadsheetApp.newDataValidation().requireValueInList(options, true).setAllowInvalid(false).build();
  sheet.getRange(layout.row + 1, layout.statusCol, rows, 1).setDataValidation(dropdown(STATUS_OPTIONS));
  sheet.getRange(layout.row + 1, layout.resultadoCol, rows, 1).setDataValidation(dropdown(RESULTADO_OPTIONS));
  if (layout.servicoCol) {
    sheet.getRange(layout.row + 1, layout.servicoCol, rows, 1).setDataValidation(dropdown(SERVICO_OPTIONS));
  }
  sheet.getRange(layout.row + 1, layout.channelCol, rows, 1).setDataValidation(dropdown(CANAL_OPTIONS));
  const datePicker = SpreadsheetApp.newDataValidation().requireDate().setAllowInvalid(false).build();
  for (const col of [layout.firstContactCol, layout.returnCol]) {
    if (col) sheet.getRange(layout.row + 1, col, rows, 1).setDataValidation(datePicker).setNumberFormat("dd/mm/yyyy");
  }
  sheet.getRange(layout.row + 1, layout.dateCol, rows, 1).setNumberFormat("dd/mm/yyyy");

  const ours = [REVIEW_MARKER, FOLLOW_UP_MARKER];
  const others = sheet.getConditionalFormatRules().filter((rule) => {
    const condition = rule.getBooleanCondition && rule.getBooleanCondition();
    const formula = condition ? String(condition.getCriteriaValues()[0]) : "";
    return !ours.some((marker) => formula.includes(marker));
  });
  const sep = argumentSeparator(ss.getSpreadsheetLocale());
  const area = [sheet.getRange(layout.row + 1, 1, rows, sheet.getLastColumn())];
  const rule = (formula, color) =>
    SpreadsheetApp.newConditionalFormatRule().whenFormulaSatisfied(formula).setBackground(color).setRanges(area).build();
  // Sheets applies the first rule that matches, so a due follow-up shows orange.
  sheet.setConditionalFormatRules(
    others.concat([
      rule(followUpFormula(layout, layout.row + 1, sep), FOLLOW_UP_COLOR),
      rule(highlightFormula(layout, layout.row + 1, sep), REVIEW_COLOR),
    ]),
  );

  ss.toast(
    `${changes.filter((c) => c.listed).length} linhas organizadas. Leads com mais de ${REVIEW_AFTER_DAYS} dias ` +
      "sem Resultado ficam amarelos; quem tem retorno marcado fica laranja no dia.",
  );
}

function reply(text) {
  return ContentService.createTextOutput(text);
}
