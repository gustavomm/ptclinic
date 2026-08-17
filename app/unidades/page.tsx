import type { Metadata } from "next";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { UnidadesSection } from "@/components/sections/UnidadesSection";
import { buildMetadata } from "@/lib/seo";
import { JsonLd } from "@/components/JsonLd";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { breadcrumbSchema } from "@/lib/schema";

export const metadata: Metadata = buildMetadata({
  title: "Unidades",
  description:
    "Duas unidades de fisioterapia e Pilates em São Paulo: Consolação (Frei Caneca) e Pinheiros (Fradique Coutinho).",
  path: "/unidades",
});

// Mesmo array para o JSON-LD e para a trilha visível, para os dois não
// discordarem: o schema leva todos os itens, a tela desenha todos menos o
// último, que é a página em que a pessoa já está.
const TRAIL = [
  { name: "Início", path: "/" },
  { name: "Unidades", path: "/unidades" },
];

export default function UnidadesIndex() {
  return (
    <main>
      <JsonLd
        data={breadcrumbSchema(TRAIL)}
      />
      <Section tone="surface-alt" padBottom={false}>
        <Breadcrumb trail={TRAIL} />
        <SectionHeading level="h1" eyebrow="Unidades" title="Onde a gente atende" />
      </Section>
      <UnidadesSection showHeading={false} />
    </main>
  );
}
