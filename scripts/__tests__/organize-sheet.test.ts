import { beforeEach, describe, expect, it } from "vitest";
import { FakeSheet, loadScript, type Cell, type Env } from "./fake-sheets";

const EXPORTS = [
  "onOpen",
  "onEdit",
  "previewOrganization",
  "applyOrganization",
  "classifyRow",
  "highlightFormula",
  "STATUS_OPTIONS",
  "RESULTADO_OPTIONS",
  "PREVIEW_SHEET_NAME",
];

let env: Env;
beforeEach(() => {
  env = loadScript(EXPORTS);
});

const day = (d: number, m = 10) => new Date(Date.UTC(2026, m - 1, d, 12));

describe("classifyRow", () => {
  const row = (status: string, extra: Record<string, unknown> = {}) =>
    env.script.classifyRow({ status, servico: "", observacoes: "", segundaAula: "", resultado: "", ...extra });

  it.each([
    ["Lead Fisio", "Lead Fisio"],
    ["Lead Pilates", "Lead Pilates"],
    ["Lead pilates", "Lead Pilates"],
    ["Lead  Pilates", "Lead Pilates"],
    ["Leas Pilates", "Lead Pilates"],
    ["Pass", "Pass"],
    ["Contato profissional", "Contato profissional"],
    ["Contato Profissional", "Contato profissional"],
    ["Golpe", "Outro"],
    ["Miss Click", "Outro"],
  ])("tidies the contact type %j into %j, with no result", (status, expected) => {
    const out = row(status);
    expect(out.status).toBe(expected);
    expect(out.resultado).toBe("");
  });

  // Old Status values that were really outcomes: the type comes from Serviço.
  it.each([
    ["Nunca respondeu", "Pilates", "Lead Pilates", "Sem resposta"],
    ["Nunca respondeu", "Fisioterapia", "Lead Fisio", "Sem resposta"],
    ["Convênio", "Fisioterapia", "Lead Fisio", "Convênio"],
    ["SUS", "Fisio", "Lead Fisio", "Convênio"],
    ["Outro estado", "-", "Lead Fisio", "Fora da área"],
    ["RPG", "Fisioterapia", "Lead Fisio", "Serviço que não fazemos"],
    ["Achou que era a Vita", "Fisioterapia", "Lead Fisio", "Achou que era a Vita"],
    ["Recusou", "Pilates", "Lead Pilates", "Outro"],
  ])("splits %j (Serviço %j) into %j + %j", (status, servico, newStatus, resultado) => {
    const out = row(status, { servico });
    expect(out.status).toBe(newStatus);
    expect(out.resultado).toBe(resultado);
    expect(out.reason).toContain(status);
  });

  it("treats a request for a service the clinic doesn't offer as such", () => {
    expect(row("Lead Fisio", { servico: "Fono" }).resultado).toBe("Serviço que não fazemos");
  });

  it("marks a lead with a date in '2º aula' as a patient", () => {
    const out = row("Lead Pilates", { segundaAula: day(20) });
    expect(out.resultado).toBe("Paciente");
    expect(out.reason).toMatch(/2º aula/);
  });

  it.each([
    ["Agendou para 21/10", "Agendou"],
    ["AGENDADO dia 3", "Agendou"],
    ["marcou avaliação", "Agendou"],
    ["virou paciente", "Paciente"],
    ["fechou pacote de 10", "Paciente"],
    ["achou caro", "Preço"],
    ["perguntou o preço e sumiu", "Preço"],
    ["queria pelo convênio", "Convênio"],
    ["não tinha horário", "Horário"],
    ["Atendimento domiciliar, fora de mão (interlagos)", "Fora da área"],
    ["mora em outro estado", "Fora da área"],
    ["muito longe", "Fora da área"],
    ["não respondeu mais", "Sem resposta"],
    ["sumiu", "Sem resposta"],
  ])("reads Observações %j as %j", (observacoes, resultado) => {
    const out = row("Lead Fisio", { observacoes });
    expect(out.resultado).toBe(resultado);
    expect(out.reason).toMatch(/Observações/);
  });

  it.each([
    "Chamar 27/10",
    "Entrar em contato em 23/10",
    "Fisio resp",
    "",
    // Words that only look like an outcome: a question, or part of a name.
    "perguntou do pacote de 10",
    "indicação da Carolina",
  ])(
    "leaves Resultado empty when Observações says %j: still in progress, for review",
    (observacoes) => {
      expect(row("Lead Fisio", { observacoes }).resultado).toBe("");
    },
  );

  it("never overwrites a Resultado already chosen by hand", () => {
    const out = row("Nunca respondeu", { servico: "Pilates", resultado: "Agendou" });
    expect(out.status).toBe("Lead Pilates");
    expect(out.resultado).toBe("Agendou");
  });

  it("gives a Pass contact a result too when the evidence is there", () => {
    expect(row("Pass", { segundaAula: day(20) }).resultado).toBe("Paciente");
  });

  it("gives no result to contacts that are not patients", () => {
    expect(row("Contato profissional", { observacoes: "agendou reunião" }).resultado).toBe("");
  });

  it("leaves an unknown Status alone and says so", () => {
    const out = row("Algo novo");
    expect(out.status).toBe("Algo novo");
    expect(out.reason).toMatch(/não reconhecido/);
  });
});

describe("highlightFormula", () => {
  it("names the Status, Resultado and first-contact columns by letter, from the first data row", () => {
    const f = env.script.highlightFormula({ statusCol: 7, resultadoCol: 8, firstContactCol: 4 }, 6);
    expect(f).toContain('LEFT($G6,4)="Lead"');
    expect(f).toContain('$H6=""');
    expect(f).toContain("ISNUMBER($D6)");
    expect(f).toContain("TODAY()-$D6>7");
    expect(f).toMatch(/^=AND\(/);
  });

  it("handles columns past Z", () => {
    const f = env.script.highlightFormula({ statusCol: 27, resultadoCol: 28, firstContactCol: 1 }, 2);
    expect(f).toContain("$AA2");
    expect(f).toContain("$AB2");
  });
});

// The staff's tab as it is: a legend on top, the header on row 5.
const HEADER = ["Contato", "Nome", "Código", "1º contato ", "Serviço ", "Canal", "Status ", "Último contato", "Observações", "2º aula"];

function contactsTab(rows: Cell[][]) {
  const sheet = env.ss.add(
    new FakeSheet("Agosto", [
      ["1º contato: refere-se a quando o cliente entrou em contato a primeira vez"],
      ["Último contato: refere-se a última mensagem enviada a este cliente"],
      ["Lead: quando a pessoa parece se interessar"],
      [],
      [...HEADER],
      ...rows,
    ]),
  );
  env.ss.active = sheet;
  return sheet;
}

const p = (status: string, servico: string, obs = "", segunda: Cell = "") =>
  [11900000000, "Fulana", "-", day(1), servico, "-", status, day(2), obs, segunda];

describe("previewOrganization", () => {
  it("lists every row that would change, without touching the contacts tab", () => {
    const sheet = contactsTab([
      p("Nunca respondeu", "Pilates"),
      p("Lead Fisio", "Fisioterapia", "Agendou para 21/10"),
      p("Lead Fisio", "Fisioterapia", "Chamar 27/10"),
    ]);
    const before = JSON.stringify(sheet.cells);
    env.script.previewOrganization();
    expect(JSON.stringify(sheet.cells)).toBe(before);

    const preview = env.ss.getSheetByName(env.script.PREVIEW_SHEET_NAME)!;
    const text = JSON.stringify(preview.cells);
    expect(text).toContain("Sem resposta");
    expect(text).toContain("Agendou");
    // Row numbers, not names or phones.
    expect(text).not.toContain("11900000000");
    expect(text).not.toContain("Fulana");
    const lines = preview.cells.filter((l) => typeof l[0] === "number");
    expect(lines.map((l) => l[0])).toEqual([6, 7]);
  });
});

describe("applyOrganization", () => {
  it("adds Resultado and Data do resultado right after Status, keeping every other column intact", () => {
    const sheet = contactsTab([p("Lead Fisio", "Fisioterapia", "Chamar 27/10", "")]);
    env.script.applyOrganization();
    const header = sheet.cells[4].map((h) => String(h).trim());
    expect(header).toEqual([
      "Contato", "Nome", "Código", "1º contato", "Serviço", "Canal", "Status",
      "Resultado", "Data do resultado", "Último contato", "Observações", "2º aula",
    ]);
    expect(sheet.getByHeader(5, "Observações", 6)).toBe("Chamar 27/10");
  });

  it("splits old outcome statuses and fills Resultado, noting what it was", () => {
    const sheet = contactsTab([
      p("Nunca respondeu", "Pilates"),
      p("Lead Fisio", "Fisioterapia", "Atendimento domiciliar, fora de mão (interlagos)"),
      p("Lead Pilates", "Pilates", "", day(20)),
    ]);
    env.script.applyOrganization();
    expect(sheet.getByHeader(5, "Status", 6)).toBe("Lead Pilates");
    expect(sheet.getByHeader(5, "Resultado", 6)).toBe("Sem resposta");
    expect(sheet.getByHeader(5, "Resultado", 7)).toBe("Fora da área");
    expect(sheet.getByHeader(5, "Resultado", 8)).toBe("Paciente");
    expect(sheet.getRange(6, 7).getNote()).toContain("Nunca respondeu");
    expect(sheet.getRange(6, 8).getNote()).toMatch(/automaticamente/);
  });

  it("dates an inferred result with the last contact", () => {
    const sheet = contactsTab([p("Nunca respondeu", "Pilates")]);
    env.script.applyOrganization();
    expect(sheet.getByHeader(5, "Data do resultado", 6)).toEqual(day(2));
  });

  it("puts dropdowns on Status and Resultado, for the data rows only", () => {
    const sheet = contactsTab([p("Lead Fisio", "Fisioterapia")]);
    env.script.applyOrganization();
    const status = sheet.validations.find((v) => v.col === 7)!;
    const resultado = sheet.validations.find((v) => v.col === 8)!;
    expect(status.row).toBe(6);
    expect(status.rule.list).toEqual(env.script.STATUS_OPTIONS);
    expect(resultado.rule.list).toEqual(env.script.RESULTADO_OPTIONS);
  });

  it("adds one yellow rule for leads past 7 days without a result", () => {
    const sheet = contactsTab([p("Lead Fisio", "Fisioterapia")]);
    env.script.applyOrganization();
    expect(sheet.formatRules).toHaveLength(1);
    expect(sheet.formatRules[0].formula).toContain('LEFT($G6,4)="Lead"');
    expect(sheet.formatRules[0].formula).toContain('$H6=""');
    expect(sheet.formatRules[0].background).toMatch(/^#/);
  });

  it("keeps rules someone else created", () => {
    const sheet = contactsTab([p("Lead Fisio", "Fisioterapia")]);
    sheet.formatRules = [{ formula: "=A1>0" } as never];
    env.script.applyOrganization();
    expect(sheet.formatRules).toHaveLength(2);
  });

  it("is safe to run twice: nothing changes the second time", () => {
    const sheet = contactsTab([p("Nunca respondeu", "Pilates"), p("Lead Fisio", "Fisioterapia", "Chamar 27/10")]);
    env.script.applyOrganization();
    const cells = JSON.stringify(sheet.cells);
    env.script.applyOrganization();
    expect(JSON.stringify(sheet.cells)).toBe(cells);
    expect(sheet.formatRules).toHaveLength(1);
  });

  it("uses a Resultado column Tainá already created instead of adding another", () => {
    const sheet = env.ss.add(
      new FakeSheet("Agosto", [
        ["Contato", "Nome", "Código", "1º contato", "Serviço", "Canal", "Status", "Resultado", "Observações"],
        [11900000000, "Fulana", "-", day(1), "Pilates", "-", "Lead Pilates", "Preço", ""],
      ]),
    );
    env.ss.active = sheet;
    env.script.applyOrganization();
    const header = sheet.cells[0].map(String);
    expect(header.filter((h) => h === "Resultado")).toHaveLength(1);
    expect(header.indexOf("Data do resultado")).toBe(header.indexOf("Resultado") + 1);
    expect(sheet.getByHeader(1, "Resultado", 2)).toBe("Preço");
  });

  it("refuses, with a message, a tab without the contacts header", () => {
    const other = env.ss.add(new FakeSheet("Cliques do site", [["Data e hora", "Código"]]));
    env.ss.active = other;
    env.script.applyOrganization();
    expect(other.cells).toEqual([["Data e hora", "Código"]]);
    expect(env.ss.toasts.at(-1)).toMatch(/aba de contatos/);
  });
});

describe("onEdit on Resultado", () => {
  function organized() {
    const sheet = contactsTab([p("Lead Fisio", "Fisioterapia")]);
    env.script.applyOrganization();
    return sheet;
  }
  const resultadoCol = 8;
  const dateCol = 9;

  it("dates the result when Tainá picks one", () => {
    const sheet = organized();
    sheet.set(6, resultadoCol, "Agendou");
    env.script.onEdit({ range: sheet.getRange(6, resultadoCol) });
    const stamped = sheet.get(6, dateCol) as Date;
    expect(Object.prototype.toString.call(stamped)).toBe("[object Date]");
    expect(Math.abs(Date.now() - stamped.getTime())).toBeLessThan(5_000);
  });

  it("clears the date when the result is erased", () => {
    const sheet = organized();
    sheet.set(6, resultadoCol, "Agendou");
    env.script.onEdit({ range: sheet.getRange(6, resultadoCol) });
    sheet.set(6, resultadoCol, "");
    env.script.onEdit({ range: sheet.getRange(6, resultadoCol) });
    expect(sheet.get(6, dateCol)).toBe("");
  });

  it("still fills Canal from a pasted code after the columns moved", () => {
    const sheet = organized();
    sheet.set(6, 3, "VY-GABCDE");
    env.script.onEdit({ range: sheet.getRange(6, 3) });
    expect(sheet.getByHeader(5, "Canal", 6)).toBe("Anúncio do Google");
  });

  it("does nothing on other columns", () => {
    const sheet = organized();
    sheet.set(6, 11, "nova observação");
    env.script.onEdit({ range: sheet.getRange(6, 11) });
    expect(sheet.get(6, dateCol)).toBe("");
  });
});

describe("onOpen", () => {
  it("adds a Vyta menu with the preview and the apply actions", () => {
    env.script.onOpen();
    expect(env.menus).toEqual([
      {
        name: "Vyta",
        items: [
          ["Prévia da organização", "previewOrganization"],
          ["Organizar planilha", "applyOrganization"],
        ],
      },
    ]);
  });
});
