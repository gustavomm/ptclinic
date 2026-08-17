import { describe, it, expect } from "vitest";
import { specialities, getSpeciality } from "../specialities";
import sourceFixture from "./fixtures/speciality-source.json";

describe("specialities", () => {
  it("has six entries and none is pilates", () => {
    expect(specialities).toHaveLength(6);
    expect(specialities.map((s) => s.slug)).not.toContain("pilates");
  });

  /*
    A drenagem linfática saiu a pedido da clínica na revisão de agosto de 2026.
    O que era a página dela agora é atendido dentro da oncológica, que trata
    linfedema, e a URL antiga do site legado aponta para a lista.
  */
  it("no longer offers drenagem linfática as its own page", () => {
    expect(specialities.map((s) => s.slug)).not.toContain("drenagem-linfatica");
    expect(getSpeciality("drenagem-linfatica")).toBeUndefined();
  });

  it("uses the new Portuguese slugs", () => {
    expect(specialities.map((s) => s.slug)).toEqual([
      "fisioterapia-neurologica",
      "fisioterapia-oncologica",
      "fisioterapia-ortopedica",
      "fisioterapia-para-idosos",
      "fisioterapia-respiratoria",
      "fisioterapia-pre-e-pos-cirurgica",
    ]);
  });

  it("gives every speciality FAQ entries for FAQPage schema", () => {
    for (const s of specialities) {
      expect(s.faq.length).toBeGreaterThanOrEqual(3);
      for (const f of s.faq) {
        expect(f.question.length).toBeGreaterThan(0);
        expect(f.answer.length).toBeGreaterThan(0);
      }
    }
  });

  it("gives every speciality a meta description under 160 characters", () => {
    for (const s of specialities) {
      expect(s.summary.length).toBeLessThanOrEqual(160);
    }
  });

  /*
    A clínica confirmou em 17/08/2026 que todas as seis áreas são atendidas em
    casa. O site dizia quatro — as outras duas ficaram de fora por descuido, não
    por decisão, e a descrição é o que o Google mostra para quem procura
    "fisioterapia domiciliar". Se uma área nova entrar sem a menção, ela nasce
    com o mesmo descuido.

    A fórmula é uma só de propósito: antes havia "Também em domicílio" em duas
    áreas e "Também a domicílio" nas outras duas.
  */
  it("says every area is available at home, in the same words", () => {
    for (const s of specialities) {
      expect(s.summary, `sem menção ao domicílio em "${s.slug}"`).toContain(
        "Também em domicílio.",
      );
    }
  });

  it("looks up by slug", () => {
    expect(getSpeciality("fisioterapia-oncologica")?.cardTitle).toBe("Oncológica");
    expect(getSpeciality("nope")).toBeUndefined();
  });

  // Guards the clinic's verbatim clinical copy. forWhom and howItWorks are
  // published under two named physiotherapists' CREFITO registrations and
  // must never drift from the frozen fixture -- see fixtures/speciality-source.json.
  it("keeps forWhom and howItWorks byte-identical to the clinic's published source", () => {
    const fixtureEntries = sourceFixture.entries as Record<
      string,
      { forWhom: string[]; howItWorks: string }
    >;

    expect(Object.keys(fixtureEntries).sort()).toEqual(
      specialities.map((s) => s.slug).sort(),
    );

    for (const s of specialities) {
      const source = fixtureEntries[s.slug];
      expect(source, `no fixture for slug "${s.slug}"`).toBeDefined();
      expect(s.forWhom, `forWhom drifted for "${s.slug}"`).toEqual(source.forWhom);
      expect(s.howItWorks, `howItWorks drifted for "${s.slug}"`).toBe(source.howItWorks);
    }
  });
});
