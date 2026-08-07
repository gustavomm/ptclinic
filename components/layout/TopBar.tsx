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
      <span className="whitespace-nowrap">Consolação</span>
      <span className="opacity-40" aria-hidden>
        ·
      </span>
      <span className="whitespace-nowrap">Pinheiros</span>
    </div>
  );
}
