import { describe, it, expect } from "vitest";
import sitemap from "@/app/sitemap";
import { clinic } from "@/content/clinic";

describe("sitemap", () => {
  const entries = sitemap();
  const urls = entries.map((e) => e.url);

  it("lists every static route", () => {
    expect(urls).toContain(clinic.siteUrl);
    expect(urls).toContain(`${clinic.siteUrl}/pilates`);
    expect(urls).toContain(`${clinic.siteUrl}/especialidades`);
    expect(urls).toContain(`${clinic.siteUrl}/unidades`);
    expect(urls).toContain(`${clinic.siteUrl}/blog`);
  });

  it("lists all six specialities, two units and six posts", () => {
    expect(urls.filter((u) => u.includes("/especialidades/"))).toHaveLength(6);
    expect(urls.filter((u) => u.includes("/unidades/"))).toHaveLength(2);
    expect(urls.filter((u) => u.includes("/blog/"))).toHaveLength(6);
  });

  it("never lists the conversion redirect", () => {
    expect(urls).not.toContain(`${clinic.siteUrl}/whatsapp`);
  });

  it("emits absolute URLs only", () => {
    for (const u of urls) expect(u.startsWith("https://")).toBe(true);
  });
});
