import Link from "next/link";

/*
  Os dois bairros levam para a página da respectiva unidade.

  O `-my-2 py-2` não muda a altura da faixa: o padding cresce a área clicável
  até os 34px da faixa inteira e a margem negativa devolve o espaço. Sem isso o
  alvo teria os 18px da linha de texto, abaixo dos 24px que a WCAG 2.5.8 pede.
*/
const UNIT_LINK =
  "-my-2 whitespace-nowrap py-2 transition-colors hover:text-accent-warm-soft";

export function TopBar() {
  return (
    <div className="flex w-full items-center justify-center gap-2 bg-ink px-4 py-2 text-center text-[13px] font-light uppercase tracking-[0.16em] text-surface sm:gap-3 sm:px-6 sm:tracking-eyebrow">
      {/*
        The descriptive phrase is hidden below `sm`. At 375px the full string is
        ~45 characters at 0.28em tracking — roughly 520px of text in 343px of
        space — so it wrapped to four lines and ate a third of the viewport.
        The two neighbourhood names already say "two units in São Paulo" to
        anyone reading them, so nothing is lost on small screens.
      */}
      <span className="hidden whitespace-nowrap sm:inline">
        Duas unidades em São Paulo
      </span>
      <span className="hidden opacity-40 sm:inline" aria-hidden>
        ·
      </span>
      <Link href="/unidades/consolacao" className={UNIT_LINK}>Consolação</Link>
      <span className="opacity-40" aria-hidden>
        ·
      </span>
      <Link href="/unidades/pinheiros" className={UNIT_LINK}>Pinheiros</Link>
    </div>
  );
}
