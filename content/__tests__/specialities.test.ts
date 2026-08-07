import { describe, it, expect } from "vitest";
import { specialities, getSpeciality } from "../specialities";
import sourceFixture from "./fixtures/speciality-source.json";

describe("specialities", () => {
  it("has seven entries and none is pilates", () => {
    expect(specialities).toHaveLength(7);
    expect(specialities.map((s) => s.slug)).not.toContain("pilates");
  });

  it("uses the new Portuguese slugs", () => {
    expect(specialities.map((s) => s.slug)).toEqual([
      "fisioterapia-neurologica",
      "fisioterapia-oncologica",
      "fisioterapia-ortopedica",
      "fisioterapia-para-idosos",
      "fisioterapia-respiratoria",
      "fisioterapia-pre-e-pos-cirurgica",
      "drenagem-linfatica",
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

  it("looks up by slug", () => {
    expect(getSpeciality("drenagem-linfatica")?.cardTitle).toBe("Drenagem linfática");
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
