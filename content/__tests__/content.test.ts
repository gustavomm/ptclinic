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

  it("leaves opening hours null until the clinic supplies them", () => {
    for (const u of units) expect(u.openingHours).toBeNull();
  });
});

describe("team", () => {
  it("has two members, each with a CREFITO", () => {
    expect(team).toHaveLength(2);
    for (const m of team) expect(m.crefito).toMatch(/^Crefito 3: \d+F$/);
  });
});
