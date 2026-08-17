#!/usr/bin/env node
// Aplica no código o CSV revisado pela Vyvyan e pela Tainá.
//
//   node scripts/copy/apply.mjs docs/revisao/textos-revisados.csv
//   node scripts/copy/apply.mjs docs/revisao/textos-revisados.csv --dry
//
// Só toca nas linhas com a coluna TEXTO NOVO preenchida.
//
// Antes de escrever qualquer coisa, cada linha passa por uma tripla conferência:
// o ID existe no mapa da exportação, o texto que está hoje no código bate com o
// que foi exportado, e a coluna "Texto atual" da planilha bate com os dois. Se
// qualquer uma falhar, a linha é recusada e listada no fim — nunca aplicada com
// palpite. É o que protege contra a planilha ter sido feita a partir de uma
// exportação antiga, ou contra alguém ter reordenado as linhas.

import fs from "node:fs";
import path from "node:path";
import { ROOT, scanFile } from "./lib.mjs";

const [csvArg, ...flags] = process.argv.slice(2);
const DRY = flags.includes("--dry");
if (!csvArg) {
  console.error("uso: node scripts/copy/apply.mjs <csv revisado> [--dry]");
  process.exit(1);
}

const sidecar = JSON.parse(
  fs.readFileSync(path.join(ROOT, "docs/revisao/textos-vyta.json"), "utf8"),
);

/* --------------------------- leitura do CSV --------------------------- */

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let quoted = false;
  const src = text.replace(/^﻿/, "");

  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (quoted) {
      if (c === '"') {
        if (src[i + 1] === '"') (cell += '"'), i++;
        else quoted = false;
      } else cell += c;
      continue;
    }
    if (c === '"') quoted = true;
    else if (c === ",") (row.push(cell), (cell = ""));
    else if (c === "\n") (row.push(cell), rows.push(row), (row = []), (cell = ""));
    else if (c !== "\r") cell += c;
  }
  if (cell || row.length) (row.push(cell), rows.push(row));

  const header = rows.shift().map((h) => h.trim());
  return rows
    .filter((r) => r.some((c) => c.trim()))
    .map((r) => Object.fromEntries(header.map((h, i) => [h, (r[i] ?? "").trim()])));
}

const rows = parseCsv(fs.readFileSync(path.resolve(csvArg), "utf8"));

/* ------------------------- geração de código ------------------------- */

/** Reescreve os filhos de um elemento JSX a partir do texto da planilha. */
function jsxChildren(text, original) {
  // `{algo}` na planilha é um valor que vem do código. Só pode sair ou continuar,
  // nunca ser inventado: um marcador novo viraria variável inexistente.
  const wanted = [...text.matchAll(/\{([^}]+)\}/g)].map((m) => m[1]);
  const available = [...original.matchAll(/\{([^}]+)\}/g)].map((m) => m[1]);
  for (const w of wanted) {
    if (!available.includes(w)) throw new Error(`marcador {${w}} não existe no original`);
  }

  const escape = (s) =>
    s.replace(/[<>{}]/g, (ch) => `{"${ch}"}`).replace(/\}\{/g, "}​{");

  // *itálico* e **negrito** viram os mesmos elementos que o site já usa.
  return text
    .split(/(\*\*[^*]+\*\*|\*[^*]+\*|\{[^}]+\})/g)
    .filter(Boolean)
    .map((part) => {
      if (/^\*\*[^*]+\*\*$/.test(part)) return `<strong>${part.slice(2, -2)}</strong>`;
      if (/^\*[^*]+\*$/.test(part)) return `<em className="italic">${part.slice(1, -1)}</em>`;
      if (/^\{[^}]+\}$/.test(part)) return part;
      return escape(part);
    })
    .join("");
}

/** Devolve o novo trecho de código para uma entrada, ou lança se não souber. */
function render(entry, novo, originalSource) {
  const original = originalSource.slice(entry.editStart, entry.editEnd);

  if (entry.kind === "string") {
    return JSON.stringify(novo);
  }

  if (entry.kind === "template") {
    const wanted = [...novo.matchAll(/\{([^}]+)\}/g)].map((m) => m[1]);
    for (const w of wanted) {
      if (!original.includes("${" + w)) throw new Error(`marcador {${w}} não existe no original`);
    }
    const body = novo
      .replace(/\\/g, "\\\\")
      .replace(/`/g, "\\`")
      .replace(/\{([^}]+)\}/g, "${$1}");
    return "`" + body + "`";
  }

  if (entry.kind === "jsx") {
    const code = jsxChildren(novo, original);
    // Sem prettier no projeto, o script cuida da própria formatação. A regra é
    // manter o formato que o arquivo já tinha: elemento que ocupava várias
    // linhas continua em várias linhas, o que estava em uma linha só continua
    // assim. Reformatar geraria ruído no diff em cima de uma troca de palavra.
    if (!original.includes("\n")) return code;
    // A indentação sai da linha da tag de fechamento, não da de abertura: a de
    // abertura pode ter os atributos quebrados em várias linhas.
    const lineStart = originalSource.lastIndexOf("\n", entry.editEnd) + 1;
    const indent = (originalSource.slice(lineStart).match(/^[ \t]*/) ?? [""])[0];
    return `\n${indent}  ${code}\n${indent}`;
  }

  throw new Error(`tipo desconhecido: ${entry.kind}`);
}

/* ----------------------------- aplicação ----------------------------- */

const edits = new Map(); // arquivo → lista de edições
const rejected = [];
let unchanged = 0;

for (const row of rows) {
  const id = row["ID"];
  const novo = row["TEXTO NOVO"];
  if (!novo) continue;

  const entry = sidecar.entries[id];
  if (!entry) {
    rejected.push({ id, why: "ID não existe no mapa da exportação" });
    continue;
  }
  if (novo === entry.text) {
    unchanged++;
    continue;
  }
  if (row["Texto atual"] && row["Texto atual"] !== entry.text) {
    rejected.push({
      id,
      why: `a coluna "Texto atual" não bate com o que foi exportado (planilha de outra exportação?)`,
    });
    continue;
  }

  if (!edits.has(entry.file)) edits.set(entry.file, []);
  edits.get(entry.file).push({ id, entry, novo });
}

// Confere que o código não mudou desde a exportação: revarre cada arquivo e
// compara o texto encontrado hoje com o que foi exportado.
const applied = [];
for (const [file, list] of edits) {
  const abs = path.join(ROOT, file);
  const source = fs.readFileSync(abs, "utf8");
  const fresh = scanFile(file, new Set());
  const byText = new Map();
  for (const hit of fresh) {
    if (!byText.has(hit.text)) byText.set(hit.text, []);
    byText.get(hit.text).push(hit);
  }

  const ok = [];
  for (const edit of list) {
    const matches = byText.get(edit.entry.text) ?? [];
    const still = matches.find(
      (m) => m.editStart === edit.entry.editStart && m.editEnd === edit.entry.editEnd,
    );
    if (!still) {
      rejected.push({
        id: edit.id,
        why: `o texto mudou em ${file} depois da exportação — exporte de novo antes de aplicar`,
      });
      continue;
    }
    ok.push(edit);
  }

  // De trás para frente: uma edição não desloca a posição das anteriores.
  ok.sort((a, b) => b.entry.editStart - a.entry.editStart);

  let out = source;
  for (const edit of ok) {
    let code;
    try {
      code = render(edit.entry, edit.novo, source);
    } catch (err) {
      rejected.push({ id: edit.id, why: err.message });
      continue;
    }
    out = out.slice(0, edit.entry.editStart) + code + out.slice(edit.entry.editEnd);
    applied.push({ id: edit.id, file, de: edit.entry.text, para: edit.novo });
  }

  if (!DRY && out !== source) fs.writeFileSync(abs, out, "utf8");
}

/* ----------------------------- relatório ----------------------------- */

console.log(
  `${applied.length} ${DRY ? "seriam aplicadas" : "aplicadas"}, ` +
    `${unchanged} sem mudança, ${rejected.length} recusadas.\n`,
);
for (const a of applied) {
  console.log(`  ${a.id}  ${a.file}`);
  console.log(`    - ${a.de}`);
  console.log(`    + ${a.para}\n`);
}
if (rejected.length) {
  console.log("Recusadas:");
  for (const r of rejected) console.log(`  ${r.id}: ${r.why}`);
}
if (!DRY && applied.length) {
  console.log("\nAgora rode: npm run typecheck && npm test && npm run build");
}
process.exit(rejected.length ? 1 : 0);
