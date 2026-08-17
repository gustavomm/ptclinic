import { Cormorant_Garamond, Jost } from "next/font/google";

/*
  Só "latin". O latin-ext cobre U+0100-02BA — diacrítico de polonês, tcheco,
  turco — e o site não escreve nenhum: o único caractere fora do Latin-1 no
  código e no conteúdo é o travessão (U+2014), que mora no U+2000-206F e
  portanto já vem no latin.

  Cuidado com o que `subsets` faz, que não é o que o nome sugere: ele controla o
  PRELOAD, não a declaração. Os @font-face de latin-ext continuam no CSS e os
  .woff2 continuam sendo servidos; o que sai é o <link rel=preload> deles. Por
  isso a página baixa 103.668 bytes em 3 arquivos em vez de 189.056 em 6 — 85.388
  bytes que antes eram buscados na carga e nunca desenhavam nada.

  A consequência disso é que não existe modo de falhar visual aqui. Um "Kraków"
  num post continua saindo em Jost: o navegador busca o arquivo de latin-ext sob
  demanda quando encontra o caractere. Medido — o glifo desenha na Jost, não na
  fonte de fallback. O que se paga é uma requisição tardia de ~17 KB (Jost) ou
  ~34 KB (Cormorant), que atrasa a pintura final daquele trecho.

  lib/__tests__/fonts.test.ts avisa quando isso passa a acontecer.
*/
export const display = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400"],
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
});

/*
  Sem `weight`, o @font-face declara o eixo inteiro, 100 a 900, em vez de três
  pesos soltos. Não muda um byte: o next/font já baixava o arquivo variável
  mesmo com weight: ["300","400","500"] — medido, produção e build local pedem
  os mesmos arquivos e os mesmos bytes. Só limitava o que dava para endereçar.

  É o que faz o peso 350 do texto corrido existir. Com os pesos discretos,
  `font-weight: 350` não dava erro nem aviso: o navegador escolhia a face mais
  próxima e desenhava 300, calado.
*/
export const sans = Jost({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});
