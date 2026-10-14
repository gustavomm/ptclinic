import { describe, expect, it } from "vitest";
import type { Touch } from "../attribution";
import { CHANNEL_LETTER } from "../lead-code";
import {
  CHANNEL_LABEL,
  CODE_COLUMN,
  READABLE_COLUMNS,
  TIMESTAMP_COLUMN,
  buttonLabel,
  deviceLabel,
  leadRow,
  pageLabel,
} from "../lead-row";
import type { Handoff } from "../whatsapp";

const TS = Date.UTC(2026, 9, 14, 12);

const googleTouch: Touch = {
  channel: "google_ads",
  ts: TS,
  landing: "/pilates",
  source: "google",
  medium: "cpc",
  campaign: "123",
  term: "pilates pinheiros",
  gclid: "G1",
};

const handoff: Handoff = {
  code: "VY-GABCDE",
  service: "pilates",
  from: "fab",
  page: "/pilates",
  first: googleTouch,
  last: googleTouch,
};

const IPHONE = "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148";

describe("leadRow", () => {
  const row = leadRow(handoff, {
    ts: "2026-10-14T12:00:00.000Z",
    userAgent: IPHONE,
    fbp: "fb.1.1.2",
    gclAw: "GCL.1760443200.G1",
    ga: "GA1.1.123456789.1760443200",
  });

  it("starts with the columns staff read, in Portuguese, in this order", () => {
    expect(Object.keys(row).slice(0, READABLE_COLUMNS.length)).toEqual([
      "Data e hora",
      "Código",
      "De onde veio",
      "Campanha",
      "Palavra buscada",
      "Página",
      "Botão",
      "Aparelho",
    ]);
    // The Apps Script colours this many columns as the readable ones.
    expect([...READABLE_COLUMNS]).toEqual(Object.keys(row).slice(0, READABLE_COLUMNS.length));
  });

  it("translates every value staff read into plain Portuguese", () => {
    expect(row).toMatchObject({
      "Data e hora": "14/10/2026 09:00",
      Código: "VY-GABCDE",
      "De onde veio": "Anúncio do Google",
      Campanha: "123",
      "Palavra buscada": "pilates pinheiros",
      Página: "Pilates",
      Botão: "Botão flutuante do WhatsApp",
      Aparelho: "Celular",
    });
  });

  it("puts every technical column after the readable ones, labelled as such", () => {
    const technical = Object.keys(row).slice(READABLE_COLUMNS.length);
    expect(technical.length).toBeGreaterThan(30);
    for (const header of technical) expect(header).toMatch(/^Técnico: /);
  });

  it("keeps the raw values Phase 4 needs in the technical columns", () => {
    expect(row).toMatchObject({
      [TIMESTAMP_COLUMN]: "2026-10-14T12:00:00.000Z",
      "Técnico: canal": "google_ads",
      "Técnico: serviço": "pilates",
      "Técnico: página": "/pilates",
      "Técnico: botão": "fab",
      "Técnico: último toque, gclid": "G1",
      "Técnico: último toque, data (UTC)": "2026-10-14T12:00:00.000Z",
      "Técnico: primeiro toque, canal": "google_ads",
      "Técnico: _fbp": "fb.1.1.2",
      "Técnico: _fbc": "",
      "Técnico: _gcl_aw": "GCL.1760443200.G1",
      "Técnico: _ga": "GA1.1.123456789.1760443200",
      "Técnico: navegador": IPHONE,
    });
    for (const value of Object.values(row)) expect(typeof value).toBe("string");
  });

  it("names the code and timestamp columns the Apps Script looks up", () => {
    expect(CODE_COLUMN).toBe("Código");
    expect(TIMESTAMP_COLUMN).toBe("Técnico: horário (UTC)");
    expect(row[CODE_COLUMN]).toBe("VY-GABCDE");
  });

  it("credits the row to the last touch, like the code letter", () => {
    const mixed = leadRow(
      { ...handoff, first: { ...googleTouch, channel: "meta_ads" }, last: googleTouch },
      { ts: "t" },
    );
    expect(mixed["De onde veio"]).toBe("Anúncio do Google");
    expect(mixed["Técnico: primeiro toque, canal"]).toBe("meta_ads");
  });

  it("has the same columns whether or not touches exist", () => {
    const empty = leadRow({ ...handoff, code: "VY-XABCDE", first: null, last: null }, { ts: "t" });
    expect(Object.keys(empty)).toEqual(Object.keys(row));
    expect(empty["De onde veio"]).toBe("Não deu pra saber");
    expect(empty["Data e hora"]).toBe("");
  });

  it("neutralises values a spreadsheet would run as a formula", () => {
    const evil = leadRow(
      {
        ...handoff,
        from: '=HYPERLINK("x")',
        last: { ...googleTouch, campaign: "+1", term: "@a", content: "-2" },
      },
      { ts: "t" },
    );
    expect(evil["Técnico: botão"]).toBe("'=HYPERLINK(\"x\")");
    expect(evil.Campanha).toBe("'+1");
    expect(evil["Palavra buscada"]).toBe("'@a");
    expect(evil["Técnico: último toque, utm_content"]).toBe("'-2");
  });

  it("also neutralises a leading tab or carriage return", () => {
    const evil = leadRow({ ...handoff, from: "\t=1", page: "\r=1" }, { ts: "t" });
    expect(evil["Técnico: botão"]).toBe("'\t=1");
    expect(evil["Técnico: página"]).toBe("'\r=1");
  });
});

describe("CHANNEL_LABEL", () => {
  it("has a label for every channel a code can carry", () => {
    expect(Object.keys(CHANNEL_LABEL).sort()).toEqual(Object.keys(CHANNEL_LETTER).sort());
  });

  // Staff decode a code by its letter, so channels that share a letter must
  // read the same in the Sheet as in the letter list they were given.
  it("reads the same for channels that share a code letter", () => {
    expect(CHANNEL_LABEL.referral).toBe(CHANNEL_LABEL.other);
  });
});

describe("pageLabel", () => {
  it.each([
    ["/", "Página inicial"],
    ["/pilates", "Pilates"],
    ["/fisioterapia-domiciliar", "Atendimento domiciliar"],
    ["/especialidades", "Especialidades"],
    ["/especialidades/fisioterapia-neurologica", "Fisioterapia Neurofuncional"],
    ["/unidades", "Unidades"],
    ["/unidades/pinheiros", "Unidade Fradique"],
    ["/blog", "Blog"],
    ["/blog/fisioterapia-apos-avc", "Blog: fisioterapia apos avc"],
    ["/especialidades/nao-existe", "/especialidades/nao-existe"],
    ["", ""],
  ])("%j reads as %j", (path, label) => {
    expect(pageLabel(path)).toBe(label);
  });
});

describe("buttonLabel", () => {
  it.each([
    ["fab", "Botão flutuante do WhatsApp"],
    ["nav", "Menu do topo"],
    ["mobile-menu", "Menu do celular"],
    ["hero", "Topo da página inicial"],
    ["footer", "Rodapé"],
    ["contato", "Seção de contato"],
    ["landing-pilates", "Seção de Pilates da página inicial"],
    ["/pilates", "Botão no meio da página"],
    ["", ""],
    ["algo-novo", "algo-novo"],
  ])("%j reads as %j", (from, label) => {
    expect(buttonLabel(from)).toBe(label);
  });
});

describe("deviceLabel", () => {
  it.each([
    [IPHONE, "Celular"],
    ["Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 Chrome/130 Mobile Safari/537.36", "Celular"],
    ["Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15", "Tablet"],
    ["Mozilla/5.0 (Linux; Android 14; SM-X710) AppleWebKit/537.36 Chrome/130 Safari/537.36", "Tablet"],
    ["Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/605.1.15 Safari/605.1.15", "Computador"],
    [undefined, ""],
  ])("%j is a %j", (ua, label) => {
    expect(deviceLabel(ua)).toBe(label);
  });
});
