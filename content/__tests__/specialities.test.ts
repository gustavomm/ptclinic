import { describe, it, expect } from "vitest";
import { specialities, getSpeciality } from "../specialities";

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
});
