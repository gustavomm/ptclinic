import { Reveal } from "@/components/ui/Reveal";

/**
 * Citação atribuída às fundadoras.
 *
 * "O atendimento é particular" está confirmado pelo Gustavo em 07/08/2026: a
 * clínica atende só particular. A frase em si ainda passa pelo sign-off da
 * Vyvyan e da Tainá junto com o resto da copy de marketing.
 *
 * A versão anterior dizia que a clínica não atende plano de saúde "porque não
 * conseguiria fazer, em vinte minutos, o que a sua recuperação exige em uma
 * hora inteira". Saiu por dois motivos: era uma afirmação comparativa sobre o
 * que a fisioterapia por convênio entrega, o que o código de ética do CREFITO
 * trata com restrição, e definia a clínica pelo que ela não faz.
 */
export function PullQuote() {
  return (
    <section className="w-full border-y border-line bg-surface-alt">
      <Reveal className="mx-auto max-w-3xl px-6 py-24 text-center md:px-8">
        <p className="font-display text-display-md text-balance text-ink">
          “Uma sessão de fisioterapia leva o tempo que precisa levar. Por isso o
          atendimento é particular: assim conseguimos dedicar{" "}
          <em className="italic">uma hora inteira</em> a cada paciente.”
        </p>
        <div className="mt-7 text-[13px] uppercase tracking-eyebrow text-subtle">
          Vyvyan &amp; Tainá · fundadoras
        </div>
      </Reveal>
    </section>
  );
}
