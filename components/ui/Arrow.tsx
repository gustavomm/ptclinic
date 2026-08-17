/*
  A seta era o caractere "→" (U+2192), e ele não está em nenhum dos subsets que
  o site carrega — nem no latin, nem no latin-ext. Não virava tofu: caía na
  fonte de fallback, então uma seta em Arial aparecia no meio de uma frase em
  Jost ou em Cormorant. Era esse desencontro que fazia ela parecer grosseira ao
  lado do resto, e nenhum ajuste de tamanho resolveria.

  Em SVG a seta passa a ser desenho e não texto: segue a cor por currentColor e
  o tamanho por em, então cresce junto com o texto que acompanha — de 15px num
  link de rodapé a 24px num título de área.

  Proporção de seta de texto: haste curta e ponta visível. A primeira versão
  tinha 1.5em de haste e ficava comprida demais ao lado de uma palavra só.

  Alinhada com as minúsculas, e sem número mágico para isso: `vertical-align:
  middle` é definido como "o meio da caixa na linha de base mais metade da
  altura-x da fonte", que é exatamente o meio ótico das minúsculas. Como a haste
  está no meio do viewBox, ela cai ali sozinha — e continua caindo se a fonte ou
  o tamanho mudarem, porque a altura-x é lida da fonte e não escrita aqui.

  Isso só vale em fluxo inline: flex ignora vertical-align. Por isso os links
  que são inline-flex embrulham texto e seta num <span>, que vira um item de
  flex só e por dentro volta a ser fluxo inline.
*/
export function Arrow({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 12 8"
      width="0.62em"
      className={`ml-[0.4em] inline-block flex-none align-middle ${className}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.1"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      focusable="false"
    >
      <path d="M0 4h10M6.5 1 10 4l-3.5 3" />
    </svg>
  );
}
