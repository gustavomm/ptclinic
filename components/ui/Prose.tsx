/*
  max-w-xl (36rem), não max-w-2xl (42rem). A 1440px o texto do blog saía com 93
  caracteres por linha; acima de uns 90 o olho começa a errar o retorno de linha.
  36rem com o text-base novo dá ~71, dentro da faixa de 60-75. No celular a
  largura da tela manda, então lá nada muda: continua em 44-55.
*/
export function Prose({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-xl text-base leading-relaxed text-muted [&_a]:text-accent [&_a:hover]:text-accent-deep [&_h2]:mb-4 [&_h2]:mt-12 [&_h2]:font-display [&_h2]:text-display-sm [&_h2]:text-ink [&_h3]:mb-3 [&_h3]:mt-8 [&_h3]:font-display [&_h3]:font-light [&_h3]:text-2xl [&_h3]:text-ink [&_li]:mb-3 [&_ol]:my-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:my-5 [&_strong]:font-medium [&_strong]:text-ink [&_ul]:my-6 [&_ul]:list-disc [&_ul]:pl-6">
      {children}
    </div>
  );
}
