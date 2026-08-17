import { describe, it, expect } from "vitest";
import { clinic } from "../clinic";
import { units, getUnit } from "../units";
import { team } from "../team";

describe("clinic", () => {
  it("exposes a display phone derived from the E.164 number", () => {
    expect(clinic.phoneE164).toBe("+5511989172311");
    expect(clinic.phoneDisplay).toBe("(11) 98917-2311");
  });

  it("has an absolute site URL with no trailing slash", () => {
    expect(clinic.siteUrl).toBe("https://www.vytafisioterapia.com.br");
  });
});

describe("units", () => {
  it("has exactly two units", () => {
    expect(units).toHaveLength(2);
  });

  it("looks up a unit by slug", () => {
    expect(getUnit("consolacao")?.district).toBe("Consolação");
    expect(getUnit("pinheiros")?.district).toBe("Pinheiros");
  });

  it("carries real coordinates for both units", () => {
    for (const u of units) {
      expect(u.geo.lat).toBeLessThan(-23);
      expect(u.geo.lng).toBeLessThan(-46);
    }
  });

  it("pins each unit's exact coordinates by slug, not just a loose bound", () => {
    // Guards against the two units' geo being swapped with each other,
    // which would place each unit at the other's address in the
    // LocalBusiness structured data Task 6 emits.
    expect(getUnit("consolacao")?.geo.lat).toBeCloseTo(-23.559993, 5);
    expect(getUnit("consolacao")?.geo.lng).toBeCloseTo(-46.66116, 5);
    expect(getUnit("pinheiros")?.geo.lat).toBeCloseTo(-23.563253, 5);
    expect(getUnit("pinheiros")?.geo.lng).toBeCloseTo(-46.688716, 5);
  });

  /*
    O horário de fechamento não é o mesmo nas duas unidades, e um teste que
    varria as duas com o mesmo número escondia isso. Vale por unidade, porque é
    daqui que sai o openingHoursSpecification do LocalBusiness: um horário
    errado faz o Google mandar gente para uma porta fechada.
  */
  it.each([
    ["consolacao", "21:00"],
    ["pinheiros", "20:00"],
  ])("%s opens 07:00 to %s, Monday to Friday", (slug, closes) => {
    const h = getUnit(slug)!.openingHours![0];
    expect(getUnit(slug)!.openingHours).toHaveLength(1);
    expect(h.opens).toBe("07:00");
    expect(h.closes).toBe(closes);
    expect(h.days).toEqual([
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
    ]);
  });

  it("never opens on Saturday or Sunday at either unit", () => {
    for (const u of units) {
      for (const h of u.openingHours ?? []) {
        expect(h.days).not.toContain("Saturday");
        expect(h.days).not.toContain("Sunday");
      }
    }
  });
});

describe("team", () => {
  it("has two members, each with a CREFITO", () => {
    expect(team).toHaveLength(2);
    for (const m of team) expect(m.crefito).toMatch(/^Crefito 3: \d+F$/);
  });
});
