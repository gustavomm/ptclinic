/*
  Título à esquerda, conteúdo à direita.

  Antes o título ocupava os 1216px do shell e o texto embaixo dele parava nos
  576px da medida de leitura — sobravam 640px vazios à direita de cada
  parágrafo, e o descompasso entre os dois é que lia como layout quebrado, não
  o vazio em si. Aqui as duas colunas dividem a largura por igual, então a
  página não tem borda direita morta e a linha de texto continua curta.

  A coluna do título é `1fr` de propósito, e não uma largura fixa: ela absorve
  o que sobra, que é o que faz o conteúdo parar antes do fim sem parecer
  acidente. O `minmax(0,...)` evita que um título longo estoure a coluna.

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
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,36rem)] lg:gap-16">
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
