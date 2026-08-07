export function TopBar() {
  return (
    <div className="flex w-full items-center justify-center gap-3 bg-ink px-6 py-2 text-center text-[13px] font-light uppercase tracking-eyebrow text-surface">
      <span>Duas unidades em São Paulo</span>
      <span className="opacity-40" aria-hidden>·</span>
      <span>Consolação</span>
      <span className="opacity-40" aria-hidden>·</span>
      <span>Pinheiros</span>
    </div>
  );
}
