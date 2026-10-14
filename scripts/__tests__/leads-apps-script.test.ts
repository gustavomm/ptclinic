import { readFileSync } from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { beforeEach, describe, expect, it } from "vitest";
import { CHANNEL_LETTER } from "@/lib/lead-code";
import { CHANNEL_LABEL, CODE_COLUMN, READABLE_COLUMNS, TIMESTAMP_COLUMN } from "@/lib/lead-row";

/*
 * scripts/leads-apps-script.gs runs inside Google Sheets, where nothing tests
 * it. Here it runs in a sandbox against a small fake of the Sheets API, enough
 * for the calls it makes.
 */

type Cell = string | number;

class FakeRange {
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
  getNote = () => this.sheet.notes.get(`${this.row}:${this.col}`) ?? "";
  setNote = (note: string) => (this.sheet.notes.set(`${this.row}:${this.col}`, note), this);
  setNumberFormat = () => this;
  setFontWeight = () => this;
  setWrap = () => this;
  setBackground = () => this;
  setFontColor = () => this;
}

class FakeSheet {
  notes = new Map<string, string>();
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
  getLastRow = () => this.cells.length;
  getLastColumn = () => Math.max(0, ...this.cells.map((line) => line.length));
  getRange = (r: number, c: number, rows = 1, cols = 1) => new FakeRange(this, r, c, rows, cols);
  setFrozenRows = (n: number) => void (this.frozenRows = n);
  setColumnWidths = () => this;
}

class FakeSpreadsheet {
  sheets = new Map<string, FakeSheet>();
  getSheetByName = (name: string) => this.sheets.get(name) ?? null;
  insertSheet = (name: string) => {
    const sheet = new FakeSheet(name);
    this.sheets.set(name, sheet);
    return sheet;
  };
  add = (sheet: FakeSheet) => (this.sheets.set(sheet.getName(), sheet), sheet);
}

const SOURCE = readFileSync(path.resolve(__dirname, "../leads-apps-script.gs"), "utf8");
const EXPORTS = [
  "doPost",
  "onEdit",
  "checkStale",
  "normalizeCode",
  "labelForCode",
  "SHEET_NAME",
  "LEGACY_SHEET_NAME",
  "CODE_HEADER",
  "TS_HEADER",
  "READABLE_COLUMNS",
  "LETTER_LABELS",
];

let ss: FakeSpreadsheet;
let mail: { to: string; subject: string }[];
let script: Record<string, any>;

beforeEach(() => {
  ss = new FakeSpreadsheet();
  mail = [];
  const context = {
    SpreadsheetApp: { getActiveSpreadsheet: () => ss },
    PropertiesService: {
      getScriptProperties: () => ({
        getProperty: (k: string) => ({ LEAD_WEBHOOK_SECRET: "s3", ALERT_EMAIL: "dono@example.com" })[k] ?? null,
      }),
    },
    LockService: { getScriptLock: () => ({ waitLock: () => {}, releaseLock: () => {} }) },
    ContentService: { createTextOutput: (text: string) => ({ text }) },
    Utilities: { formatDate: (d: Date) => d.toISOString() },
    MailApp: { sendEmail: (to: string, subject: string) => mail.push({ to, subject }) },
  };
  script = vm.runInNewContext(`${SOURCE}\n;({ ${EXPORTS.join(", ")} })`, context);
});

const post = (body: unknown) => script.doPost({ postData: { contents: JSON.stringify(body) } }).text;

const newRow = (code: string, ts = "2026-10-14T12:00:00.000Z") => ({
  "Data e hora": "14/10/2026 09:00",
  [CODE_COLUMN]: code,
  "De onde veio": "Anúncio do Google",
  [TIMESTAMP_COLUMN]: ts,
  "Técnico: _gcl_aw": "0011",
});

describe("contract with the site", () => {
  it("looks rows up by the same headers lib/lead-row.ts writes", () => {
    expect(script.CODE_HEADER).toBe(CODE_COLUMN);
    expect(script.TS_HEADER).toBe(TIMESTAMP_COLUMN);
    expect(script.READABLE_COLUMNS).toBe(READABLE_COLUMNS.length);
  });

  it("names each code letter exactly as the site names its channel", () => {
    for (const [channel, letter] of Object.entries(CHANNEL_LETTER)) {
      expect(script.LETTER_LABELS[letter], letter).toBe(CHANNEL_LABEL[channel as keyof typeof CHANNEL_LABEL]);
    }
  });
});

describe("doPost", () => {
  it("writes a readable row into 'Cliques do site', columns in the site's order", () => {
    expect(post({ secret: "s3", row: newRow("VY-GABCDE") })).toBe("ok");
    const sheet = ss.getSheetByName(script.SHEET_NAME)!;
    expect(sheet.cells[0]).toEqual(Object.keys(newRow("x")));
    expect(sheet.cells[1]).toEqual(Object.values(newRow("VY-GABCDE")));
    expect(sheet.frozenRows).toBe(1);
  });

  it("refuses a wrong secret and writes nothing", () => {
    expect(post({ secret: "nope", row: newRow("VY-GABCDE") })).toBe("forbidden");
    expect(ss.sheets.size).toBe(0);
  });

  it("ignores the same click arriving twice within minutes (double tap)", () => {
    post({ secret: "s3", row: newRow("VY-GABCDE") });
    post({ secret: "s3", row: newRow("VY-GABCDE", "2026-10-14T12:02:00.000Z") });
    expect(ss.getSheetByName(script.SHEET_NAME)!.getLastRow()).toBe(2);
  });

  it("keeps a repeated code from another day: codes are not unique on their own", () => {
    post({ secret: "s3", row: newRow("VY-GABCDE") });
    post({ secret: "s3", row: newRow("VY-GABCDE", "2026-11-20T12:00:00.000Z") });
    expect(ss.getSheetByName(script.SHEET_NAME)!.getLastRow()).toBe(3);
  });

  it("sends rows in the old English format to the old 'cliques' tab", () => {
    expect(post({ secret: "s3", row: { ts: "2026-10-14T12:00:00.000Z", lead_code: "VY-GABCDE" } })).toBe("ok");
    expect(ss.getSheetByName(script.LEGACY_SHEET_NAME)!.cells[1].slice(0, 2)).toEqual([
      "2026-10-14T12:00:00.000Z",
      "VY-GABCDE",
    ]);
    expect(ss.getSheetByName(script.SHEET_NAME)).toBeNull();
  });
});

describe("normalizeCode", () => {
  it.each([
    ["VY-GABCDE", "VY-GABCDE"],
    ["  vy-gabcde ", "VY-GABCDE"],
    ["(código VY-GABCDE).", "VY-GABCDE"],
    ["VY GABCDE", "VY-GABCDE"],
    ["VYGABCDE", "VY-GABCDE"],
    // The letter after VY- is always a letter: a 0 or 1 there was an O or I.
    ["VY-07K3Q2", "VY-O7K3Q2"],
    ["VY-17K3Q2", "VY-I7K3Q2"],
  ])("%j -> %j", (raw, code) => {
    expect(script.normalizeCode(raw)).toBe(code);
  });

  it.each(["", "-", "VY-GABCD", "VY-GABCDEF", "VY-QABCDE", "VY-GABCD0", "Ligação"])(
    "rejects %j",
    (raw) => {
      expect(script.normalizeCode(raw)).toBeNull();
    },
  );
});

describe("onEdit on the staff's contacts tab", () => {
  const HEADER = ["Contato", "Nome", "Código", "1º contato", "Serviço", "Canal", "Status"];

  function contactsTab() {
    return ss.add(
      new FakeSheet("Agosto", [
        ["1º contato: refere-se a quando o cliente entrou em contato a primeira vez"],
        ["Último contato: refere-se a última mensagem enviada a este cliente"],
        ["Lead: quando a pessoa parece se interessar"],
        [],
        HEADER,
        [11999990000, "Paciente A", "-", "", "Pilates", "-", "Lead Pilates"],
        [11999990001, "Paciente B", "-", "", "Fisio", "Ligação", "Lead Fisio"],
      ]),
    );
  }

  const type = (sheet: FakeSheet, row: number, col: number, value: Cell, rows = 1) => {
    if (rows === 1) sheet.set(row, col, value);
    script.onEdit({ range: sheet.getRange(row, col, rows, 1) });
  };

  it("fills 'Canal' from the code's letter and tidies the code", () => {
    const sheet = contactsTab();
    type(sheet, 6, 3, "(código vy-g7k3q2).");
    expect(sheet.get(6, 3)).toBe("VY-G7K3Q2");
    expect(sheet.get(6, 6)).toBe("Anúncio do Google");
  });

  it("notes a code that never reached the Sheet, so a typo gets noticed", () => {
    const sheet = contactsTab();
    type(sheet, 6, 3, "VY-G7K3Q2");
    expect(sheet.getRange(6, 3).getNote()).toMatch(/não está na aba Cliques do site/);
  });

  it("leaves no note when the code is in 'Cliques do site'", () => {
    post({ secret: "s3", row: newRow("VY-G7K3Q2") });
    const sheet = contactsTab();
    type(sheet, 6, 3, "VY-G7K3Q2");
    expect(sheet.getRange(6, 3).getNote()).toBe("");
  });

  it("also recognises codes in the old 'cliques' tab", () => {
    post({ secret: "s3", row: { ts: "2026-10-14T12:00:00.000Z", lead_code: "VY-RC7EP6" } });
    const sheet = contactsTab();
    type(sheet, 6, 3, "VY-RC7EP6");
    expect(sheet.getRange(6, 3).getNote()).toBe("");
    expect(sheet.get(6, 6)).toBe("Outro site, QR code ou indicação");
  });

  it("flags an invalid code and leaves 'Canal' alone", () => {
    const sheet = contactsTab();
    type(sheet, 7, 3, "VY-12345");
    expect(sheet.get(7, 6)).toBe("Ligação");
    expect(sheet.getRange(7, 3).getNote()).toMatch(/Código inválido/);
  });

  it("handles several codes pasted at once", () => {
    const sheet = contactsTab();
    sheet.set(6, 3, "VY-MABCDE");
    sheet.set(7, 3, "VY-DABCDE");
    type(sheet, 6, 3, "", 2);
    expect(sheet.get(6, 6)).toBe("Anúncio do Instagram ou Facebook");
    expect(sheet.get(7, 6)).toBe("Digitou o endereço do site");
  });

  it("does nothing when another column is edited", () => {
    const sheet = contactsTab();
    sheet.set(6, 3, "VY-GABCDE");
    type(sheet, 6, 7, "Agendado");
    expect(sheet.get(6, 6)).toBe("-");
  });

  it("does nothing above or on the header row", () => {
    const sheet = contactsTab();
    type(sheet, 5, 3, "Código");
    expect(sheet.get(5, 3)).toBe("Código");
    expect(sheet.get(5, 6)).toBe("Canal");
    expect(sheet.getRange(5, 3).getNote()).toBe("");
  });

  it("clears its note, and keeps 'Canal', when the code is erased", () => {
    const sheet = contactsTab();
    type(sheet, 6, 3, "VY-GABCDE");
    type(sheet, 6, 3, "");
    expect(sheet.getRange(6, 3).getNote()).toBe("");
    expect(sheet.get(6, 6)).toBe("Anúncio do Google");
  });

  it("ignores a tab with a 'Código' column but no 'Canal' to fill", () => {
    const sheet = ss.add(new FakeSheet("Outra", [["Nome", "Código"], ["Paciente D", "vy-gabcde"]]));
    type(sheet, 2, 2, "vy-gabcde");
    expect(sheet.cells[1]).toEqual(["Paciente D", "vy-gabcde"]);
    expect(sheet.getRange(2, 2).getNote()).toBe("");
  });

  it("ignores tabs without a 'Código' + 'Canal' header (A retornar)", () => {
    const other = ss.add(new FakeSheet("A retornar", [["Paciente C", "11 90000-0000", "Pilates", "VY-GABCDE"]]));
    type(other, 1, 4, "VY-GABCDE");
    expect(other.cells[0]).toEqual(["Paciente C", "11 90000-0000", "Pilates", "VY-GABCDE"]);
  });

  it("never touches the clicks tab itself", () => {
    post({ secret: "s3", row: newRow("VY-GABCDE") });
    const clicks = ss.getSheetByName(script.SHEET_NAME)!;
    type(clicks, 2, 2, "vy-gabcde");
    expect(clicks.get(2, 2)).toBe("vy-gabcde");
    expect(clicks.getRange(2, 2).getNote()).toBe("");
  });
});

describe("checkStale", () => {
  it("e-mails when no click has ever arrived", () => {
    script.checkStale();
    expect(mail).toHaveLength(1);
  });

  it("stays quiet when a click arrived recently", () => {
    post({ secret: "s3", row: newRow("VY-GABCDE", new Date().toISOString()) });
    script.checkStale();
    expect(mail).toHaveLength(0);
  });

  it("counts recent clicks in the old tab during the switchover", () => {
    post({ secret: "s3", row: { ts: new Date().toISOString(), lead_code: "VY-GABCDE" } });
    script.checkStale();
    expect(mail).toHaveLength(0);
  });
});
