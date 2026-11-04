import { beforeEach, describe, expect, it } from "vitest";
import { specialities } from "@/content/specialities";
import { leadRow } from "@/lib/lead-row";
import { whatsappMessage, type Handoff } from "@/lib/whatsapp";
import { FakeSheet, loadScript, type Cell, type Env } from "./fake-sheets";

/*
 * What the script fills in by itself while Tainá logs a new contact, so the
 * only things she types are who it is, the code, and the Status.
 */

const EXPORTS = ["onEdit", "followUpDate", "serviceForClick", "SERVICE_HEADER", "PAGE_HEADER"];

let env: Env;
beforeEach(() => {
  env = loadScript(EXPORTS);
});

// The contacts tab after "Organizar planilha": a legend on top, header on row 2.
const HEADER = [
  "Contato", "Nome", "Código", "1º contato", "Serviço", "Canal", "Status",
  "Resultado", "Data do resultado", "Último contato", "Retornar em", "Observações", "2º aula",
];
const COL = Object.fromEntries(HEADER.map((h, i) => [h, i + 1]));

function contactsTab(rows: Cell[][] = [[]]) {
  const sheet = env.ss.add(new FakeSheet("Agosto", [["Legenda"], [...HEADER], ...rows]));
  env.ss.active = sheet;
  return sheet;
}

function clicksTab(rows: [code: string, iso: string, service: string, page: string][]) {
  env.ss.add(
    new FakeSheet("Cliques do site", [
      ["Data e hora", "Código", "Técnico: horário (UTC)", env.script.SERVICE_HEADER, env.script.PAGE_HEADER],
      ...rows.map(([code, iso, service, page]) => ["", code, iso, service, page]),
    ]),
  );
}

const edit = (sheet: FakeSheet, row: number, col: number, value: Cell) => {
  sheet.set(row, col, value);
  env.script.onEdit({ range: sheet.getRange(row, col) });
};

const isDate = (v: unknown): v is Date => Object.prototype.toString.call(v) === "[object Date]";
const today = () => new Date();
const dayKey = (d: Date) => d.toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" });

describe("1º contato on a new row", () => {
  it.each([
    ["Contato", 11900000000],
    ["Nome", "Fulana"],
  ])("fills with today when %s is typed on an empty row", (header, value) => {
    const sheet = contactsTab();
    edit(sheet, 3, COL[header], value);
    const first = sheet.get(3, COL["1º contato"]);
    expect(isDate(first)).toBe(true);
    expect(dayKey(first as Date)).toBe(dayKey(today()));
  });

  it("keeps a date already there", () => {
    const sheet = contactsTab();
    const typed = new Date(Date.UTC(2026, 9, 1, 12));
    sheet.set(3, COL["1º contato"], typed);
    edit(sheet, 3, COL.Nome, "Fulana");
    expect(sheet.get(3, COL["1º contato"])).toBe(typed);
  });

  it("stays empty when the name is erased", () => {
    const sheet = contactsTab();
    edit(sheet, 3, COL.Nome, "");
    expect(sheet.get(3, COL["1º contato"])).toBe("");
  });

  it("ignores edits above the header", () => {
    const sheet = contactsTab();
    edit(sheet, 1, COL.Nome, "Legenda nova");
    expect(sheet.get(1, COL["1º contato"])).toBe("");
  });
});

describe("pasting a code that is in 'Cliques do site'", () => {
  const CLICK = "2026-10-29T13:30:00.000Z";

  it("dates 1º contato with the click and fills Serviço", () => {
    clicksTab([["VY-GABCDE", CLICK, "pilates", "/pilates"]]);
    const sheet = contactsTab();
    edit(sheet, 3, COL["Código"], "VY-GABCDE");
    expect(sheet.get(3, COL["1º contato"])).toEqual(new Date(CLICK));
    expect(sheet.get(3, COL["Serviço"])).toBe("Pilates");
    expect(sheet.get(3, COL.Canal)).toBe("Anúncio do Google");
  });

  it("replaces the date filled in automatically today, which was only a guess", () => {
    clicksTab([["VY-GABCDE", CLICK, "geral", "/"]]);
    const sheet = contactsTab();
    edit(sheet, 3, COL.Nome, "Fulana");
    edit(sheet, 3, COL["Código"], "VY-GABCDE");
    expect(sheet.get(3, COL["1º contato"])).toEqual(new Date(CLICK));
  });

  it("keeps an earlier date typed by hand", () => {
    clicksTab([["VY-GABCDE", CLICK, "pilates", "/pilates"]]);
    const typed = new Date(Date.UTC(2026, 9, 27, 12));
    const sheet = contactsTab([["", "", "", typed]]);
    edit(sheet, 3, COL["Código"], "VY-GABCDE");
    expect(sheet.get(3, COL["1º contato"])).toBe(typed);
  });

  it.each([
    ["fisioterapia-oncologica", "/especialidades/fisioterapia-oncologica", "Fisioterapia"],
    ["domiciliar", "/fisioterapia-domiciliar", "Fisioterapia"],
    ["geral", "/pilates", "Pilates"],
    ["geral", "/", ""],
  ])("turns the click's service %j on page %j into Serviço %j", (service, page, servico) => {
    clicksTab([["VY-GABCDE", CLICK, service, page]]);
    const sheet = contactsTab();
    edit(sheet, 3, COL["Código"], "VY-GABCDE");
    expect(sheet.get(3, COL["Serviço"])).toBe(servico);
  });

  it("fills a Serviço left as '-'", () => {
    clicksTab([["VY-GABCDE", CLICK, "pilates", "/pilates"]]);
    const sheet = contactsTab([["", "", "", "", "-"]]);
    edit(sheet, 3, COL["Código"], "VY-GABCDE");
    expect(sheet.get(3, COL["Serviço"])).toBe("Pilates");
  });

  it("never changes a Serviço Tainá already chose", () => {
    clicksTab([["VY-GABCDE", CLICK, "pilates", "/pilates"]]);
    const sheet = contactsTab([["", "", "", "", "Fisioterapia"]]);
    edit(sheet, 3, COL["Código"], "VY-GABCDE");
    expect(sheet.get(3, COL["Serviço"])).toBe("Fisioterapia");
  });

  it("uses the latest click when a code repeats on another day", () => {
    clicksTab([
      ["VY-GABCDE", "2026-08-01T12:00:00.000Z", "geral", "/"],
      ["VY-GABCDE", CLICK, "pilates", "/pilates"],
    ]);
    const sheet = contactsTab();
    edit(sheet, 3, COL["Código"], "VY-GABCDE");
    expect(sheet.get(3, COL["1º contato"])).toEqual(new Date(CLICK));
    expect(sheet.get(3, COL["Serviço"])).toBe("Pilates");
  });

  it("leaves 1º contato and Serviço alone for a code that is not there", () => {
    clicksTab([["VY-GZZZZZ", CLICK, "pilates", "/pilates"]]);
    const sheet = contactsTab();
    edit(sheet, 3, COL["Código"], "VY-GABCDE");
    expect(sheet.get(3, COL["1º contato"])).toBe("");
    expect(sheet.get(3, COL["Serviço"])).toBe("");
  });
});

describe("contract with the site", () => {
  const handoff: Handoff = { code: "VY-GABCDE", service: "pilates", from: "fab", page: "/pilates", first: null, last: null };

  it("reads the service and page from the columns lib/lead-row.ts writes", () => {
    const row = leadRow(handoff, { ts: "2026-10-29T13:30:00.000Z" });
    expect(row[env.script.SERVICE_HEADER]).toBe("pilates");
    expect(row[env.script.PAGE_HEADER]).toBe("/pilates");
  });

  it("calls a click Pilates exactly when the WhatsApp message says Pilates", () => {
    const cases: [string, string][] = [
      ["pilates", "/"],
      ["geral", "/pilates"],
      ["geral", "/pilates/aula-experimental"],
      ["geral", "/"],
      ["domiciliar", "/fisioterapia-domiciliar"],
      ...specialities.map((s): [string, string] => [s.slug, `/especialidades/${s.slug}`]),
    ];
    for (const [service, page] of cases) {
      const saysPilates = whatsappMessage(service, page, "VY-GABCDE").includes("Pilates");
      expect(env.script.serviceForClick(service, page) === "Pilates", `${service} ${page}`).toBe(saysPilates);
    }
  });

  it("files every speciality page under Fisioterapia", () => {
    for (const s of specialities) {
      expect(env.script.serviceForClick(s.slug, `/especialidades/${s.slug}`), s.slug).toBe("Fisioterapia");
    }
  });
});

describe("followUpDate", () => {
  const first = new Date(2026, 9, 1, 12);
  const ymd = (d: Date | null) => d && [d.getFullYear(), d.getMonth() + 1, d.getDate()];

  it.each([
    ["Entrar em contato dia 23/10", [2026, 10, 23]],
    ["Mandar mensagem 27/10", [2026, 10, 27]],
    ["mantar mensagem 27/10", [2026, 10, 27]],
    ["Retornar 30/10", [2026, 10, 30]],
    ["Chamar 27/10", [2026, 10, 27]],
    ["27/10 ver se ele foi mesmo", [2026, 10, 27]],
    ["Retornar 05/01/2027", [2027, 1, 5]],
  ])("reads %j as a follow-up date", (text, expected) => {
    expect(ymd(env.script.followUpDate(text, first))).toEqual(expected);
  });

  it("rolls into next year when the day has already passed", () => {
    const december = new Date(2026, 11, 10, 12);
    expect(ymd(env.script.followUpDate("Retornar 05/01", december))).toEqual([2027, 1, 5]);
  });

  it.each(["Agendou fisio para 21/10", "Fisio resp", "", "Retornar 31/02", "Retornar 12/13"])(
    "finds no follow-up in %j",
    (text) => {
      expect(env.script.followUpDate(text, first)).toBeNull();
    },
  );
});
