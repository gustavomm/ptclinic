import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

/*
  lib/fonts.ts carrega as duas fontes só com o subset "latin", e com isso a
  página baixa 85.388 bytes a menos — 45% do peso de fonte.

  Este teste NÃO está protegendo contra texto quebrado. Vale ser explícito
  porque o contrário é o palpite natural: `subsets` controla o preload, não a
  declaração, então os @font-face de latin-ext continuam no CSS e um "Kraków"
  num post continua desenhando em Jost, com o navegador buscando o arquivo sob
  demanda. Isso foi medido, não deduzido.

  O que o teste protege é mais modesto: a economia acima só existe enquanto
  nenhum texto puxa o latin-ext. No dia em que puxar, aquele trecho passa a
  custar uma requisição tardia de ~17 KB (Jost) ou ~34 KB (Cormorant) e pinta
  depois do resto. É um aviso de performance, não de correção — e se a palavra
  precisar existir, o certo é deixá-la existir e apagar este teste.

  Só sobre o latin-ext, porque é o que a mudança tirou. Não pergunta se todo
  caractere está no latin: a seta "→" das chamadas de link nunca esteve em
  subset nenhum e sempre desenhou na fonte de fallback, antes e depois disto.

  Vale para comentário também, não só para o texto que vai à tela. Separar os
  dois pediria varrer a árvore sintática, e o custo de um falso positivo aqui é
  trocar uma palavra num comentário.
*/

// unicode-range do subset "latin-ext", copiado do CSS servido em
// https://fonts.googleapis.com/css2?family=Jost:wght@100..900
// Fora U+0304, U+0308 e U+0329, que o "latin" também cobre e portanto continuam
// desenhando na fonte certa.
const LATIN_EXT: Array<[number, number]> = [
  [0x0100, 0x02ba],
  [0x02bd, 0x02c5],
  [0x02c7, 0x02cc],
  [0x02ce, 0x02d7],
  [0x02dd, 0x02ff],
  [0x1d00, 0x1dbf],
  [0x1e00, 0x1e9f],
  [0x1ef2, 0x1eff],
  [0x2020, 0x2020],
  [0x20a0, 0x20ab],
  [0x20ad, 0x20c0],
  [0x2113, 0x2113],
  [0x2c60, 0x2c7f],
  [0xa720, 0xa7ff],
];

const inLatinExt = (cp: number) => LATIN_EXT.some(([lo, hi]) => cp >= lo && cp <= hi);

const ROOT = path.join(__dirname, "..", "..");
const DIRS = ["content", "app", "components", "lib"];
const EXT = new Set([".ts", ".tsx", ".mdx", ".md"]);

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === "node_modules" || entry.name === "__tests__") continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else if (EXT.has(path.extname(entry.name))) out.push(full);
  }
  return out;
}

describe("subset das fontes", () => {
  it("não usa nenhum caractere que só exista no latin-ext", () => {
    const offenders: string[] = [];

    for (const dir of DIRS) {
      for (const file of walk(path.join(ROOT, dir))) {
        const text = fs.readFileSync(file, "utf8");
        const seen = new Set<number>();
        for (const ch of text) {
          const cp = ch.codePointAt(0)!;
          if (!inLatinExt(cp) || seen.has(cp)) continue;
          seen.add(cp);
          const line = text.slice(0, text.indexOf(ch)).split("\n").length;
          offenders.push(
            `${path.relative(ROOT, file)}:${line}  ${ch}  U+${cp.toString(16).toUpperCase().padStart(4, "0")}`,
          );
        }
      }
    }

    expect(
      offenders,
      `Caractere que só existe no subset "latin-ext", que lib/fonts.ts deixou\n` +
        `de dar preload. O texto NÃO quebra: desenha na fonte certa, buscada sob\n` +
        `demanda. O que muda é que aquele trecho passa a custar uma requisição\n` +
        `tardia (~17 KB Jost, ~34 KB Cormorant) e pinta depois do resto.\n` +
        `Se a palavra precisa existir, deixe existir e apague este teste. Se foi\n` +
        `descuido, troque o caractere.\n\n` +
        offenders.join("\n"),
    ).toEqual([]);
  });

  it("deixa passar o que o português escreve", () => {
    for (const ch of "áàâãéêíóôõúüçÁÀÂÃÉÊÍÓÔÕÚÜÇ—…“”‘’–") {
      expect(inLatinExt(ch.codePointAt(0)!), `${ch} não é latin-ext`).toBe(false);
    }
  });

  it("pega o que é de latin-ext", () => {
    for (const ch of "ŁłŠšŽžĆćĘęŃńŐő") {
      expect(inLatinExt(ch.codePointAt(0)!), `${ch} é latin-ext`).toBe(true);
    }
  });
});
