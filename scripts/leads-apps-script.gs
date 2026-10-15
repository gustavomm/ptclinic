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
 *    `onEdit` needs no setup: Sheets runs it on every edit by name.
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
 * Runs on every edit. When staff type or paste a code into a "Código" column
 * of a tab that also has a "Canal" column (their contacts tab), it tidies the
 * code and writes where the person came from into "Canal". The letter after
 * "VY-" is enough for that, so it works even when the click row is missing;
 * a missing row only earns a note, which is how a typo gets noticed.
 */
function onEdit(e) {
  const sheet = e.range.getSheet();
  // The clicks tabs have a "Código" column but no "Canal", so they never match.
  const header = findCodeHeader(sheet);
  if (!header) return;

  const firstCol = e.range.getColumn();
  const lastCol = firstCol + e.range.getNumColumns() - 1;
  if (header.codeCol < firstCol || header.codeCol > lastCol) return;

  const firstRow = Math.max(e.range.getRow(), header.row + 1);
  const lastRow = e.range.getRow() + e.range.getNumRows() - 1;
  let known = null;
  for (let r = firstRow; r <= lastRow; r++) {
    const codeCell = sheet.getRange(r, header.codeCol);
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
    sheet.getRange(r, header.channelCol).setValue(labelForCode(code));
    known = known || knownCodes();
    codeCell.setNote(
      known.has(code)
        ? ""
        : "Este código não está na aba Cliques do site. Confira se foi digitado certo.",
    );
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

function reply(text) {
  return ContentService.createTextOutput(text);
}
