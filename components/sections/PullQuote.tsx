import { Reveal } from "@/components/ui/Reveal";

/**
 * DRAFT COPY — this asserts the clinic does not accept health insurance.
 * Must be confirmed by Vyvyan and Tainá before launch. Spec §12 item 2.
 */
export function PullQuote() {
  return (
    <section className="w-full border-y border-line bg-surface-alt">
      <Reveal className="mx-auto max-w-3xl px-6 py-24 text-center md:px-8">
        <p className="font-display text-display-md text-balance text-ink">
          “A gente não atende plano de saúde porque não conseguiria fazer, em
          vinte minutos, o que a sua recuperação exige em{" "}
          <em className="italic">uma hora inteira</em>.”
        </p>
        <div className="mt-7 text-xs uppercase tracking-eyebrow text-subtle">
          Vyvyan &amp; Tainá · fundadoras
        </div>
      </Reveal>
    </section>
  );
}
