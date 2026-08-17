const TONES = {
  surface: "bg-surface text-ink",
  "surface-alt": "bg-surface-alt text-ink",
  ink: "bg-ink text-surface",
} as const;

export function Section({
  id,
  tone = "surface",
  className = "",
  /*
    Desligue quando a seção seguinte continuar o mesmo assunto — tipicamente um
    título de página seguido do conteúdo dele. Sem isso os dois py-28 se somam e
    abrem 224px entre o título e o que ele anuncia. Aparece mais nas páginas de
    índice, e pior na de unidades, onde as duas faixas têm o mesmo tom e o vão
    lê como buraco em vez de fronteira.
  */
  padBottom = true,
  children,
}: {
  id?: string;
  tone?: keyof typeof TONES;
  className?: string;
  padBottom?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className={`w-full ${TONES[tone]} ${className}`}>
      <div
        className={`mx-auto max-w-shell px-6 pt-20 md:px-8 md:pt-28 ${
          padBottom ? "pb-20 md:pb-28" : ""
        }`}
      >
        {children}
      </div>
    </section>
  );
}
