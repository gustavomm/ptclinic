import { describe, it, expect } from "vitest";
import {
  organizationSchema,
  unitSchema,
  breadcrumbSchema,
  faqSchema,
  personSchema,
} from "../schema";
import { units } from "@/content/units";
import { team } from "@/content/team";
import { clinic } from "@/content/clinic";

describe("organizationSchema", () => {
  it("is a MedicalBusiness with the clinic phone and Instagram", () => {
    const s = organizationSchema();
    expect(s["@type"]).toBe("Physiotherapy");
    expect(s.telephone).toBe(clinic.phoneE164);
    expect(s.sameAs).toContain(clinic.instagram);
  });
});

describe("unitSchema", () => {
  it("carries a PostalAddress and GeoCoordinates", () => {
    const s = unitSchema(units[0]);
    expect(s.address["@type"]).toBe("PostalAddress");
    expect(s.address.addressLocality).toBe("São Paulo");
    expect(s.geo.latitude).toBeCloseTo(-23.559993, 5);
  });

  it("omits openingHoursSpecification when hours are unknown", () => {
    const s = unitSchema(units[0]);
    expect(s).not.toHaveProperty("openingHoursSpecification");
  });

  it("includes openingHoursSpecification when hours exist", () => {
    const withHours = {
      ...units[0],
      openingHours: [{ days: ["Monday"], opens: "07:00", closes: "20:00" }],
    };
    const s = unitSchema(withHours);
    expect(s.openingHoursSpecification).toHaveLength(1);
    expect(s.openingHoursSpecification?.[0].opens).toBe("07:00");
  });

  // The guard must be tested against a synthetic unit, not the real data:
  // both units now carry a confirmed CEP, and coupling this to the content
  // would make the assertion silently vacuous the moment the data changed.
  it("omits postalCode from the address when the unit has none", () => {
    const withoutPostalCode = { ...units[0], postalCode: "" };
    const s = unitSchema(withoutPostalCode);
    expect(s.address).not.toHaveProperty("postalCode");
  });

  it("includes postalCode in the address when the unit has one", () => {
    const withPostalCode = { ...units[0], postalCode: "01000-000" };
    const s = unitSchema(withPostalCode);
    expect(s.address.postalCode).toBe("01000-000");
  });
});

describe("personSchema", () => {
  it("exposes CREFITO as an occupational credential", () => {
    const s = personSchema(team[0]);
    expect(s["@type"]).toBe("Person");
    expect(s.hasCredential.credentialCategory).toBe("Crefito 3: 293919F");
  });

  it("builds alumniOf from institution names, not full education sentences", () => {
    expect(personSchema(team[0]).alumniOf[0].name).toBe("Universidade de São Paulo");
    expect(personSchema(team[1]).alumniOf[0].name).toBe("Universidade de São Paulo");
  });
});

describe("breadcrumbSchema", () => {
  it("numbers positions from 1 and absolutises URLs", () => {
    const s = breadcrumbSchema([
      { name: "Início", path: "/" },
      { name: "Pilates", path: "/pilates" },
    ]);
    expect(s.itemListElement[0].position).toBe(1);
    expect(s.itemListElement[1].item).toBe(`${clinic.siteUrl}/pilates`);
  });
});

describe("faqSchema", () => {
  it("builds Question/Answer pairs", () => {
    const s = faqSchema([{ question: "O que é?", answer: "Isto." }]);
    expect(s["@type"]).toBe("FAQPage");
    expect(s.mainEntity[0].acceptedAnswer.text).toBe("Isto.");
  });
});
