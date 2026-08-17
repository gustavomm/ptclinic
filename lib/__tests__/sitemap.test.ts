import { describe, it, expect } from "vitest";
import sitemap from "@/app/sitemap";
import { clinic } from "@/content/clinic";

describe("sitemap", () => {
  const entries = sitemap();
  const urls = entries.map((e) => e.url);

  /*
    Lista fechada, não `toContain` solto. A versão anterior só perguntava se
    cada rota conhecida estava lá, então uma rota nova entrava no sitemap sem
    ninguém revisar — foi o que aconteceu ao adicionar o domiciliar, e o teste
    passou calado. Agora sobrar uma rota quebra tanto quanto faltar.
  */
  it("lists exactly the static routes, and no others", () => {
    const staticUrls = urls.filter(
      (u) => !/\/(especialidades|unidades|blog)\//.test(u),
    );
    expect(staticUrls.sort()).toEqual(
      [
        clinic.siteUrl,
        `${clinic.siteUrl}/blog`,
        `${clinic.siteUrl}/especialidades`,
        `${clinic.siteUrl}/fisioterapia-domiciliar`,
        `${clinic.siteUrl}/pilates`,
        `${clinic.siteUrl}/unidades`,
      ].sort(),
    );
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
