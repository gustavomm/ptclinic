import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";

/*
  A planilha de revisão diz para a Vyvyan e a Tainá que "*entre asteriscos* vira
  itálico no site", e vale para a página inteira. Mas o `apply` só converte os
  asteriscos quando o texto é filho de um elemento JSX; aqui `text` é uma string
  solta dentro de um objeto, e o React imprimiria os asteriscos na tela. Esta
  função fecha essa diferença do lado do componente.
*/
function withEmphasis(text: string) {
  return text.split(/(\*[^*]+\*)/g).map((part, i) =>
    part.startsWith("*") && part.endsWith("*") && part.length > 2 ? (
      <em key={i} className="italic">
        {part.slice(1, -1)}
      </em>
    ) : (
      part
    ),
  );
}

const STEPS = [
  {
    n: "01",
    title: "Primeiro contato",
    text: "Você conta o que está sentindo pelo WhatsApp. Nós indicamos a fisioterapeuta certa e a unidade compatível com o seu caso.",
  },
  {
    n: "02",
    title: "Avaliação",
    text: "Uma sessão inteira para escutar, examinar e testar. O tratamento já começa neste dia, e você sai com um plano definido e *exclusivo para o seu caso*.",
  },
  {
    n: "03",
    title: "Tratamento",
    text: "Sessões individuais, sempre com a mesma fisioterapeuta. Reavaliações que acontecem ao longo do processo e ajustes do plano conforme você evolui.",
  },
  {
    n: "04",
    title: "Continuidade",
    text: "A alta não é fim de linha. Seguir no pilates *com quem já conhece sua história clínica* é para manter o que conquistou.",
  },
];

export function ComoFunciona() {
  return (
    <Section id="como-funciona" tone="surface-alt">
      <SectionHeading
        className="mb-14 max-w-3xl"
        eyebrow="Como funciona"
        title={
          <>
            Quatro passos entre a primeira mensagem e{" "}
            <em className="italic">voltar a se mover sem medo</em>
          </>
        }
      />
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((step, i) => {
          const last = i === STEPS.length - 1;
          return (
            <Reveal
              key={step.n}
              delay={i * 80}
              className={`flex min-h-[17rem] flex-col gap-4 border p-8 ${
                last ? "border-ink bg-ink" : "border-line bg-surface"
              }`}
            >
              <div
                className={`text-[13px] font-medium tracking-[0.2em] ${
                  last ? "text-accent-warm-soft" : "text-accent-deep"
                }`}
              >
                {step.n}
              </div>
              <h3 className={`font-display text-3xl ${last ? "text-surface" : "text-ink"}`}>
                {step.title}
              </h3>
              <p className={`text-[15px] font-light leading-relaxed ${last ? "text-surface/75" : "text-muted"}`}>
                {withEmphasis(step.text)}
              </p>
            </Reveal>
          );
        })}
      </div>
    </Section>
  );
}
