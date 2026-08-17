import { Reveal } from "@/components/ui/Reveal";

const STATS = [
  {
    figure: "1 : 1",
    text: "Atendimento exclusivo, só você e o fisioterapeuta do começo ao fim. Sem sala cheia e específico para sua queixa.",
  },
  {
    figure: "Segurança",
    text: "Toda aula de Pilates é conduzida por fisioterapeutas. Quem entende de lesão orientando cada exercício, cada carga, cada respiração.",
  },
  {
    /*
      Este terceiro número falava da variedade de especialidades. Na revisão de
      agosto de 2026 a clínica trocou pelo atendimento em domicílio, confirmado
      por ela em 17/08/2026. Aparece junto com o "Também em domicílio" das
      quatro áreas que o oferecem, mas ali só nas descrições do Google: nenhuma
      página explica o serviço.

      O preço não pode ser dito no site, e a página dedicada ficou para depois.
      Até ela existir, este bloco é o único lugar onde o domicílio é explicado,
      e quem chegar pela busca vai perguntar por área de cobertura no WhatsApp.
    */
    figure: "A domicílio",
    text: "Atendimento de fisioterapia na sua casa, quando ir até a clínica não é uma opção. Conforto com o mesmo cuidado e atenção.",
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
            <p className="mt-4 text-base leading-relaxed text-muted">
              {stat.text}
            </p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
