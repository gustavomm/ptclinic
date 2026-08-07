import type { Metadata } from "next";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { EspecialidadesGrid } from "@/components/sections/EspecialidadesGrid";
import { buildMetadata } from "@/lib/seo";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbSchema } from "@/lib/schema";

export const metadata: Metadata = buildMetadata({
  title: "Especialidades",
  description:
    "Sete especialidades de fisioterapia e Pilates em São Paulo: neurofuncional, oncológica, ortopédica, gerontologia, respiratória, pré e pós-cirúrgica e drenagem linfática.",
  path: "/especialidades",
});

export default function EspecialidadesIndex() {
  return (
    <main>
      <JsonLd
        data={breadcrumbSchema([
          { name: "Início", path: "/" },
          { name: "Especialidades", path: "/especialidades" },
        ])}
      />
      <Section tone="surface-alt">
        <SectionHeading
          level="h1"
          eyebrow="Especialidades"
          title="O que tratamos"
          lead="Cada especialidade tem técnica própria, mas todas partem do mesmo lugar: avaliar antes de tratar, e tratar uma pessoa — não um diagnóstico."
        />
      </Section>
      <EspecialidadesGrid />
    </main>
  );
}
