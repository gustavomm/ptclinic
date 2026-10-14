/**
 * @OnlyCurrentDoc
 *
 * Receiving end of lib/lead-webhook.ts: appends one row per WhatsApp click to
 * the leads Sheet. Lives in the Sheet itself (Extensions → Apps Script); this
 * file is the versioned copy. Contract with the site:
 *
 * - POST body `{ secret, row }`; `row` is lib/lead-row.ts, a flat object of
 *   strings with a stable set of keys.
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
 *
 * Columns are created from the first row's keys and matched by header name,
 * so manual columns (nome, telefone, estágio, motivo_perda…) can be added to
 * the right freely. lead_code is not unique on its own: match a conversation
 * by code and date.
 */
const SHEET_NAME = "cliques";
const TIMEZONE = "America/Sao_Paulo";
/** The same click arriving twice (a double tap sends two requests with one cookie) is ignored. */
const DUPLICATE_WINDOW_MS = 10 * 60 * 1000;
/** No new row for this long, with this volume of traffic, means something broke. */
const STALE_AFTER_DAYS = 3;

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
  if (!row || typeof row.lead_code !== "string") return reply("bad request");

  const lock = LockService.getScriptLock();
  // Short enough that the site's 25 s timeout never logs "not recorded" for a
  // row that is then written anyway: past this, the write fails and says so.
  lock.waitLock(10000);
  try {
    const sheet = leadsSheet();
    let headers = sheet.getLastRow() === 0
      ? []
      : sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

    if (isDuplicate(sheet, headers, row)) return reply("ok");

    const record = Object.assign({}, row, {
      data_hora: Utilities.formatDate(new Date(row.ts), TIMEZONE, "yyyy-MM-dd HH:mm:ss"),
    });
    const missing = Object.keys(record).filter((k) => headers.indexOf(k) === -1);
    if (missing.length) {
      sheet.getRange(1, headers.length + 1, 1, missing.length).setValues([missing]);
      headers = headers.concat(missing);
    }

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

function leadsSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  return ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
}

function isDuplicate(sheet, headers, row) {
  const codeCol = headers.indexOf("lead_code");
  const tsCol = headers.indexOf("ts");
  const last = sheet.getLastRow();
  if (codeCol === -1 || tsCol === -1 || last < 2) return false;
  const start = Math.max(2, last - 49);
  const recent = sheet.getRange(start, 1, last - start + 1, headers.length).getValues();
  const now = new Date(row.ts).getTime();
  return recent.some(
    (r) => r[codeCol] === row.lead_code && Math.abs(now - new Date(r[tsCol]).getTime()) < DUPLICATE_WINDOW_MS,
  );
}

/**
 * Daily trigger: e-mails ALERT_EMAIL when no click has been recorded for a
 * while. Reads the newest `ts` in the column, so sorting the Sheet or adding
 * manual rows does not fool it.
 */
function checkStale() {
  const sheet = leadsSheet();
  const last = sheet.getLastRow();
  const headers = last === 0 ? [] : sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const tsCol = headers.indexOf("ts");
  const times = last >= 2 && tsCol !== -1
    ? sheet.getRange(2, tsCol + 1, last - 1, 1).getValues()
        .map((r) => new Date(r[0]).getTime())
        .filter((t) => !isNaN(t))
    : [];
  const lastTs = times.length ? new Date(Math.max.apply(null, times)) : null;
  const ageDays = lastTs ? (Date.now() - lastTs.getTime()) / 86400000 : Infinity;
  if (ageDays < STALE_AFTER_DAYS) return;

  const to = PropertiesService.getScriptProperties().getProperty("ALERT_EMAIL");
  if (!to) return;
  MailApp.sendEmail(
    to,
    "Planilha de leads sem cliques novos",
    `Nenhum clique de WhatsApp registrado há ${lastTs ? Math.floor(ageDays) + " dias" : "nunca"}. ` +
      "Conferir: LEAD_WEBHOOK_URL e LEAD_WEBHOOK_SECRET na Vercel (Production), a implantação do " +
      "Apps Script e os logs da função /whatsapp na Vercel.",
  );
}

function reply(text) {
  return ContentService.createTextOutput(text);
}
