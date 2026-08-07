import { Reveal } from "@/components/ui/Reveal";

const STATS = [
  {
    figure: "1 : 1",
    text: "Atendimento individual de fisioterapia, do começo ao fim. Sem sala cheia e sem esteira de pacientes.",
  },
  {
    figure: "Sempre",
    text: "Toda aula de Pilates é conduzida por fisioterapeutas. Quem entende de lesão orientando cada exercício, cada carga, cada respiração.",
  },
  {
    // Sem número: a contagem estava fixa no texto enquanto a grade renderiza
    // specialities.length + 1. Somar ou tirar uma especialidade fazia a frase
    // mentir sem ninguém perceber.
    figure: "Todas",
    text: "As especialidades sob o mesmo teto, do pós-operatório à reabilitação neurológica, da oncologia ao condicionamento.",
  },
];

export function Manifesto() {
  return (
    <section className="w-full border-b border-line bg-surface">
      <div className="mx-auto grid max-w-shell gap-10 px-6 py-16 md:px-8 md:py-20 lg:grid-cols-3 lg:gap-0">
        {STATS.map((stat, i) => (
          <Reveal
            key={stat.figure}
            delay={i * 90}
            className={`lg:px-10 ${i === 0 ? "lg:pl-0" : ""} ${
              i < STATS.length - 1 ? "lg:border-r lg:border-line" : "lg:pr-0"
            }`}
          >
            <div className="font-display text-5xl font-light leading-none text-accent">
              {stat.figure}
            </div>
            <p className="mt-4 text-base font-light leading-relaxed text-muted">
              {stat.text}
            </p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
