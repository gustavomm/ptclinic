/*
  Título à esquerda, conteúdo à direita.

  Antes o título ocupava os 1216px do shell e o texto embaixo dele parava nos
  576px da medida de leitura — sobravam 640px vazios à direita de cada
  parágrafo, e o descompasso entre os dois é que lia como layout quebrado, não
  o vazio em si. Aqui as duas colunas dividem a largura por igual, então a
  página não tem borda direita morta e a linha de texto continua curta.

  A coluna do título é estreita e fixa, e isso importa. A primeira versão usou
  `1fr` para não sobrar borda direita: a coluna esticava para 576px, o título
  ocupava 340 e os 236 restantes viravam um buraco ENTRE as duas colunas. Ficou
  pior que o problema original — vazio na borda da página lê como margem, vazio
  no meio corta o laço entre o título e o texto dele.

  24rem porque o título mais largo que cabe numa linha é "Perguntas frequentes",
  com 356px medidos no Cormorant de 44px. Só "Para ler antes da consulta" (433)
  quebra em duas linhas, e quebrar ali não incomoda.

  O que sobra à direita — 1216 menos 384 de título, 64 de gap e 576 de texto —
  fica como margem, que é o comportamento que se quer.

  Abaixo de lg vira uma coluna só, que é exatamente o layout de hoje no
  celular — a mudança é só de desktop.
*/
export function SectionSplit({
  title,
  tone = "ink",
  children,
}: {
  title: string;
  tone?: "ink" | "surface";
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-[24rem_minmax(0,36rem)] lg:gap-16">
      <h2
        className={`font-display text-display-md ${
          tone === "surface" ? "text-surface" : "text-ink"
        }`}
      >
        {title}
      </h2>
      <div>{children}</div>
    </div>
  );
}
