import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <main>
      <Section tone="surface-alt">
        <SectionHeading
          level="h1"
          eyebrow="Página não encontrada"
          title="Essa página não existe"
          lead="O endereço que você acessou não foi encontrado. Pode ter mudado de lugar ou nunca ter existido."
        />
        <div className="mt-8 flex flex-wrap gap-4">
          <Button href="/">Voltar para o início</Button>
          <Button href="/especialidades" variant="outlineInk">
            
            Ver áreas de atuação
          </Button>
        </div>
      </Section>
    </main>
  );
}
