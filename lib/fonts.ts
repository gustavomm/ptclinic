import { Cormorant_Garamond, Jost } from "next/font/google";

export const display = Cormorant_Garamond({
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400"],
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
});

/*
  Sem `weight`, o next/font baixa a fonte variável em vez de três instâncias
  estáticas. Sai mais barato e não mais caro, que é o incomum aqui: 43.792 bytes
  em 2 arquivos contra 49.672 em 6 (latin + latin-ext, medido no fonts.gstatic).
  As estáticas do Jost são pequenas demais para ganhar de um arquivo variável.

  O que isso destrava é o eixo inteiro de 100 a 900, e com ele o peso 350 do
  texto corrido. Com as estáticas, `font-weight: 350` não dava erro nem aviso:
  o navegador escolhia a face mais próxima e desenhava 300, calado.
*/
export const sans = Jost({
  subsets: ["latin", "latin-ext"],
  variable: "--font-sans",
  display: "swap",
});
