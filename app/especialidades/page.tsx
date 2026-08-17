import type { Metadata } from "next";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { EspecialidadesGrid } from "@/components/sections/EspecialidadesGrid";
import { buildMetadata } from "@/lib/seo";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbSchema } from "@/lib/schema";

export const metadata: Metadata = buildMetadata({
  title: "Áreas de atuação",
  description:
    "Seis áreas de atuação em fisioterapia e Pilates em São Paulo: neurofuncional, oncológica, ortopédica, gerontologia, respiratória e pré e pós-cirúrgica.",
  path: "/especialidades",
});

export default function EspecialidadesIndex() {
  return (
    <main>
      <JsonLd
        data={breadcrumbSchema([
          { name: "Início", path: "/" },
          { name: "Áreas de atuação", path: "/especialidades" },
        ])}
      />
      <Section tone="surface-alt">
        <SectionHeading
          level="h1"
          eyebrow="Áreas de atuação"
          title="O que tratamos"
          lead="Cada área tem técnica própria, mas todas partem do mesmo lugar: avaliar antes de tratar, e tratar uma pessoa. Não um diagnóstico."
        />
      </Section>
      <EspecialidadesGrid showHeading={false} />
    </main>
  );
}
