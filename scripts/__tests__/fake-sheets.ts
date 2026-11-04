import { readFileSync } from "node:fs";
import path from "node:path";
import vm from "node:vm";

/*
 * scripts/leads-apps-script.gs runs inside Google Sheets, where nothing tests
 * it. The tests run it in a sandbox against this small fake of the Sheets API,
 * enough for the calls the script makes.
 */

export type Cell = string | number | Date;

type Validation = { list: string[]; date: boolean; allowInvalid: boolean };
type FormatRule = {
  formula: string;
  background: string;
  ranges: FakeRange[];
  getBooleanCondition: () => { getCriteriaValues: () => string[] };
  getRanges: () => FakeRange[];
};

export class FakeRange {
  constructor(
    private sheet: FakeSheet,
    private row: number,
    private col: number,
    private rows = 1,
    private cols = 1,
  ) {}
  getSheet = () => this.sheet;
  getRow = () => this.row;
  getColumn = () => this.col;
  getNumRows = () => this.rows;
  getNumColumns = () => this.cols;
  getValue = () => this.sheet.get(this.row, this.col);
  setValue = (v: Cell) => (this.sheet.set(this.row, this.col, v), this);
  getValues = () =>
    Array.from({ length: this.rows }, (_, r) =>
      Array.from({ length: this.cols }, (_, c) => this.sheet.get(this.row + r, this.col + c)),
    );
  setValues = (values: Cell[][]) => {
    values.forEach((line, r) => line.forEach((v, c) => this.sheet.set(this.row + r, this.col + c, v)));
    return this;
  };
  clearContent = () => (this.sheet.set(this.row, this.col, ""), this);
  getNote = () => this.sheet.notes.get(`${this.row}:${this.col}`) ?? "";
  setNote = (note: string) => (this.sheet.notes.set(`${this.row}:${this.col}`, note), this);
  setDataValidation = (rule: Validation) => {
    this.sheet.validations.push({ col: this.col, row: this.row, rows: this.rows, rule });
    return this;
  };
  setNumberFormat = () => this;
  setFontWeight = () => this;
  setWrap = () => this;
  setBackground = () => this;
  setFontColor = () => this;
  a1 = () => `${this.row}:${this.col}:${this.rows}:${this.cols}`;
}

export class FakeSheet {
  notes = new Map<string, string>();
  validations: { col: number; row: number; rows: number; rule: Validation }[] = [];
  formatRules: FormatRule[] = [];
  frozenRows = 0;
  constructor(
    private name: string,
    public cells: Cell[][] = [],
  ) {}
  getName = () => this.name;
  get = (r: number, c: number): Cell => this.cells[r - 1]?.[c - 1] ?? "";
  set = (r: number, c: number, v: Cell) => {
    while (this.cells.length < r) this.cells.push([]);
    this.cells[r - 1][c - 1] = v;
  };
  /** Value of the cell under the header named `header` (exact text) in row `r`. */
  getByHeader = (headerRow: number, header: string, r: number): Cell =>
    this.get(r, this.cells[headerRow - 1].findIndex((h) => String(h).trim() === header) + 1);
  getLastRow = () => this.cells.length;
  getLastColumn = () => Math.max(0, ...this.cells.map((line) => line.length));
  getMaxRows = () => Math.max(this.cells.length, 50);
  getRange = (r: number, c: number, rows = 1, cols = 1) => new FakeRange(this, r, c, rows, cols);
  insertColumnsAfter = (col: number, n: number) => {
    for (const line of this.cells) if (line.length > col) line.splice(col, 0, ...Array(n).fill(""));
    const moved = new Map<string, string>();
    for (const [key, note] of this.notes) {
      const [r, c] = key.split(":").map(Number);
      moved.set(`${r}:${c > col ? c + n : c}`, note);
    }
    this.notes = moved;
    return this;
  };
  getConditionalFormatRules = () => [...this.formatRules];
  setConditionalFormatRules = (rules: FormatRule[]) => void (this.formatRules = [...rules]);
  setFrozenRows = (n: number) => void (this.frozenRows = n);
  setColumnWidths = () => this;
}

export class FakeSpreadsheet {
  sheets = new Map<string, FakeSheet>();
  active: FakeSheet | null = null;
  toasts: string[] = [];
  locale = "en_US";
  getSpreadsheetLocale = () => this.locale;
  getSheetByName = (name: string) => this.sheets.get(name) ?? null;
  insertSheet = (name: string) => {
    const sheet = new FakeSheet(name);
    this.sheets.set(name, sheet);
    return sheet;
  };
  deleteSheet = (sheet: FakeSheet) => void this.sheets.delete(sheet.getName());
  getActiveSheet = () => this.active;
  toast = (message: string) => void this.toasts.push(message);
  add = (sheet: FakeSheet) => (this.sheets.set(sheet.getName(), sheet), sheet);
}

function validationBuilder() {
  const rule: Validation = { list: [], date: false, allowInvalid: true };
  const builder = {
    requireValueInList: (list: string[]) => ((rule.list = list), builder),
    requireDate: () => ((rule.date = true), builder),
    setAllowInvalid: (allow: boolean) => ((rule.allowInvalid = allow), builder),
    build: () => rule,
  };
  return builder;
}

function formatRuleBuilder() {
  const rule = { formula: "", background: "", ranges: [] as FakeRange[] } as FormatRule;
  rule.getBooleanCondition = () => ({ getCriteriaValues: () => [rule.formula] });
  rule.getRanges = () => rule.ranges;
  const builder = {
    whenFormulaSatisfied: (f: string) => ((rule.formula = f), builder),
    setBackground: (c: string) => ((rule.background = c), builder),
    setRanges: (r: FakeRange[]) => ((rule.ranges = r), builder),
    build: () => rule,
  };
  return builder;
}

/** Utilities.formatDate, for the patterns the script uses (yyyy MM dd HH mm ss). */
function formatDate(date: Date, timeZone: string, pattern: string) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-GB", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hourCycle: "h23",
    })
      .formatToParts(date)
      .map((p) => [p.type, p.value]),
  );
  return pattern
    .replace("yyyy", parts.year)
    .replace("MM", parts.month)
    .replace("dd", parts.day)
    .replace("HH", parts.hour)
    .replace("mm", parts.minute)
    .replace("ss", parts.second);
}

const SOURCE = readFileSync(path.resolve(__dirname, "../leads-apps-script.gs"), "utf8");

export type Env = {
  ss: FakeSpreadsheet;
  mail: { to: string; subject: string }[];
  menus: { name: string; items: [string, string][] }[];
  script: Record<string, any>;
};

/** Loads the script fresh, against a fresh fake spreadsheet. */
export function loadScript(exports: string[]): Env {
  const ss = new FakeSpreadsheet();
  const mail: Env["mail"] = [];
  const menus: Env["menus"] = [];
  const context = {
    SpreadsheetApp: {
      getActiveSpreadsheet: () => ss,
      newDataValidation: validationBuilder,
      newConditionalFormatRule: formatRuleBuilder,
      getUi: () => ({
        createMenu: (name: string) => {
          const menu = { name, items: [] as [string, string][] };
          const builder = {
            addItem: (label: string, fn: string) => (menu.items.push([label, fn]), builder),
            addToUi: () => void menus.push(menu),
          };
          return builder;
        },
      }),
    },
    PropertiesService: {
      getScriptProperties: () => ({
        getProperty: (k: string) => ({ LEAD_WEBHOOK_SECRET: "s3", ALERT_EMAIL: "dono@example.com" })[k] ?? null,
      }),
    },
    LockService: { getScriptLock: () => ({ waitLock: () => {}, releaseLock: () => {} }) },
    ContentService: { createTextOutput: (text: string) => ({ text }) },
    Utilities: { formatDate },
    MailApp: { sendEmail: (to: string, subject: string) => mail.push({ to, subject }) },
  };
  const script = vm.runInNewContext(`${SOURCE}\n;({ ${exports.join(", ")} })`, context);
  return { ss, mail, menus, script };
}
