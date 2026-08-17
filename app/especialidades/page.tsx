import type { Metadata } from "next";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { EspecialidadesGrid } from "@/components/sections/EspecialidadesGrid";
import { buildMetadata } from "@/lib/seo";
import { JsonLd } from "@/components/JsonLd";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { breadcrumbSchema } from "@/lib/schema";

export const metadata: Metadata = buildMetadata({
  title: "Áreas de atuação",
  description:
    "Seis áreas de atuação em fisioterapia e Pilates em São Paulo: neurofuncional, oncológica, ortopédica, gerontologia, respiratória e pré e pós-cirúrgica.",
  path: "/especialidades",
});

// Mesmo array para o JSON-LD e para a trilha visível, para os dois não
// discordarem: o schema leva todos os itens, a tela desenha todos menos o
// último, que é a página em que a pessoa já está.
const TRAIL = [
  { name: "Início", path: "/" },
  { name: "Áreas de atuação", path: "/especialidades" },
];

export default function EspecialidadesIndex() {
  return (
    <main>
      <JsonLd
        data={breadcrumbSchema(TRAIL)}
      />
      <Section tone="surface-alt">
        <Breadcrumb trail={TRAIL} />
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
