/*
  A seta era o caractere "→" (U+2192), e ele não está em nenhum dos subsets que
  o site carrega — nem no latin, nem no latin-ext. Não virava tofu: caía na
  fonte de fallback, então uma seta em Arial aparecia no meio de uma frase em
  Jost ou em Cormorant. Era esse desencontro que fazia ela parecer grosseira ao
  lado do resto, e nenhum ajuste de tamanho resolveria.

  Em SVG a seta passa a ser desenho e não texto: acompanha a cor por
  currentColor, o tamanho por em, e a espessura combina com o peso leve do
  layout — 1px de traço, haste longa, ponta curta.

  Também tira o último caractere fora de subset do site, o que fecha o assunto
  aberto em lib/__tests__/fonts.test.ts.
*/
export function Arrow({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 8"
      // A largura vem do em para a seta crescer junto com o texto que a
      // acompanha, que vai de 15px num link de rodapé a 24px num título.
      className={`ml-[0.45em] inline-block w-[1.5em] flex-none align-baseline ${className}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      focusable="false"
    >
      <path d="M0 4h22M18.5 1 22 4l-3.5 3" />
    </svg>
  );
}
