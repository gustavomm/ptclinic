import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

/*
  lib/fonts.ts carrega as duas fontes só com o subset "latin". São 85.388 bytes
  a menos, 45% do peso de fonte de uma página, e vale enquanto o site não
  escrever nada que só exista no latin-ext.

  O modo de falhar é traiçoeiro: um caractere de fora não quebra o build nem
  aparece como tofu. Ele desenha na fonte de fallback, então a palavra troca de
  fonte no meio da frase e ninguém vê até olhar de perto. Quem escrever "Kraków"
  ou "Škoda" num post descobre aqui, não no ar.

  O teste é sobre o latin-ext e só sobre ele, porque é o que esta mudança tirou.
  Não pergunta se todo caractere está no latin: existe coisa que nunca esteve em
  subset nenhum — ver o teste do travessão e da seta lá embaixo.

  Vale para comentário também, não só para texto que vai à tela. Separar os dois
  pediria varrer a árvore sintática, e o custo de um falso positivo aqui é
  trocar uma palavra num comentário.

  Se um dia precisar mesmo, o conserto é devolver "latin-ext" ao subsets das
  duas fontes — e aí este teste sai junto.
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
      `Caractere que só existe no subset "latin-ext", que lib/fonts.ts não\n` +
        `carrega mais. Não vira tofu: desenha na fonte de fallback e troca de\n` +
        `fonte no meio da palavra. Ou troque o caractere, ou devolva "latin-ext"\n` +
        `ao subsets das duas fontes (custa 85.388 bytes) e apague este teste.\n\n` +
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
