import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";

const STEPS = [
  {
    n: "01",
    title: "Conversa",
    text: "Você conta o que está sentindo pelo WhatsApp. A gente responde qual especialidade faz sentido e qual unidade fica melhor para você — sem compromisso.",
  },
  {
    n: "02",
    title: "Avaliação",
    text: "Uma sessão inteira para escutar, examinar e testar. Saímos dela com um objetivo escrito — seu, não nosso — e o número de sessões estimado até chegar lá.",
  },
  {
    n: "03",
    title: "Tratamento",
    text: "Sessões individuais com a mesma fisioterapeuta. O plano é revisto sempre que o seu corpo muda — e ele muda, é esse o ponto.",
  },
  {
    n: "04",
    title: "Continuidade",
    text: "Alta não é fim de linha. A maioria segue no Pilates para manter o que conquistou — com quem já conhece a sua história clínica.",
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
                className={`text-xs font-medium tracking-[0.2em] ${
                  last ? "text-accent-warm-soft" : "text-accent-deep"
                }`}
              >
                {step.n}
              </div>
              <h3 className={`font-display text-3xl ${last ? "text-surface" : "text-ink"}`}>
                {step.title}
              </h3>
              <p className={`text-[15px] font-light leading-relaxed ${last ? "text-surface/75" : "text-muted"}`}>
                {step.text}
              </p>
            </Reveal>
          );
        })}
      </div>
    </Section>
  );
}
