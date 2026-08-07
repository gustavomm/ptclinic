import type { Metadata } from "next";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { UnidadesSection } from "@/components/sections/UnidadesSection";
import { buildMetadata } from "@/lib/seo";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbSchema } from "@/lib/schema";

export const metadata: Metadata = buildMetadata({
  title: "Unidades",
  description:
    "Duas unidades de fisioterapia e Pilates em São Paulo: Consolação (Frei Caneca) e Pinheiros (Fradique Coutinho).",
  path: "/unidades",
});

export default function UnidadesIndex() {
  return (
    <main>
      <JsonLd
        data={breadcrumbSchema([
          { name: "Início", path: "/" },
          { name: "Unidades", path: "/unidades" },
        ])}
      />
      <Section tone="surface-alt">
        <SectionHeading eyebrow="Unidades" title="Onde a gente atende" />
      </Section>
      <UnidadesSection />
    </main>
  );
}
