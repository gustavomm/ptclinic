import { Cormorant_Garamond, Jost } from "next/font/google";

/*
  Só "latin". O latin-ext cobre U+0100-02BA — os diacríticos de polonês, tcheco,
  turco e afins — e o site não desenha nenhum deles: o único caractere fora do
  Latin-1 em todo o código e conteúdo é o travessão (U+2014), que mora no
  U+2000-206F e portanto já vem no latin. Eram 85.388 bytes, 45% do peso de
  fonte da página, para glifos que nunca apareceram na tela.

  lib/__tests__/fonts.test.ts trava isso: se algum texto novo trouxer um
  caractere de latin-ext, o teste quebra em vez de a palavra trocar de fonte no
  meio, calada, na fonte de fallback.
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
