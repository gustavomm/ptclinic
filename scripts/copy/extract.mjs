#!/usr/bin/env node
// Exporta todo o texto visível do site para uma planilha de revisão.
//
//   node scripts/copy/extract.mjs
//
// Gera dois arquivos em docs/revisao/:
//   textos-vyta.csv   → sobe para o Google Sheets, é o que a Vyvyan e a Tainá veem
//   textos-vyta.json  → mapa id → arquivo/posição, usado por apply.mjs na volta
//
// O CSV não carrega caminho de arquivo nem número de linha de propósito: quanto
// menos coluna técnica na planilha, menos chance de alguém apagar sem querer a
// única coisa que permite reimportar. O vínculo é o ID.

import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { ROOT, FILE_MAP, scanFile, hardLimit, suggestAction } from "./lib.mjs";

const OUT_DIR = path.join(ROOT, "docs/revisao");

// O ID precisa ser único e estável — é a única coluna que liga a planilha de
// volta ao código. Usar só o nome do arquivo não serve: todo `page.tsx` viraria
// a mesma chave e as linhas de páginas diferentes se sobrescreveriam.
const shortKey = (file) => {
  if (/^app\/.*page\.tsx$/.test(file)) {
    const segs = file.slice(4, -"/page.tsx".length).replace(/[[\]]/g, "").split("/").filter(Boolean);
    return segs.length ? segs.join("-") : "home";
  }
  return path
    .basename(file, path.extname(file))
    .replace(/[[\]]/g, "")
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .toLowerCase();
};

// Arquivos varridos mas ausentes do FILE_MAP entram no fim, sob "Outros".
function allTargets() {
  const mapped = FILE_MAP.filter((e) => fs.existsSync(path.join(ROOT, e.file)));
  const known = new Set(mapped.map((e) => e.file));

  const globbed = execSync(
    "find app components content -type f \\( -name '*.tsx' -o -name '*.ts' \\) " +
      "-not -path '*/__tests__/*' -not -name '*.test.*'",
    { cwd: ROOT, encoding: "utf8" },
  )
    .trim()
    .split("\n")
    .filter(Boolean)
    .sort();

  const extra = globbed
    .filter((f) => !known.has(f))
    .map((f) => ({ file: f, page: "Outros", section: f }));

  // Agrupa por página mantendo a ordem da primeira aparição. Sem isto, um
  // componente compartilhado listado lá embaixo abriria um segundo bloco
  // "Em todas as páginas" no índice, e a planilha ficaria com a mesma página
  // repetida em dois lugares distantes.
  const all = [...mapped, ...extra];
  const order = [...new Set(all.map((t) => t.page))];
  return order.flatMap((page) => all.filter((t) => t.page === page));
}

const unknownKeys = new Set();
const rows = [];
const sidecar = {};
const perFileCount = new Map();

for (const target of allTargets()) {
  const hits = scanFile(target.file, unknownKeys);
  if (!hits.length) continue;
  perFileCount.set(target.file, hits.length);

  const key = shortKey(target.file);
  hits.forEach((hit, i) => {
    const id = `${key}-${String(i + 1).padStart(2, "0")}`;
    rows.push({
      id,
      page: target.page,
      section: target.section,
      role: hit.role,
      action: suggestAction(hit),
      limit: hardLimit(hit.role),
      chars: hit.text.length,
      text: hit.text,
    });
    sidecar[id] = {
      file: hit.file,
      line: hit.line,
      kind: hit.kind,
      start: hit.start,
      end: hit.end,
      editStart: hit.editStart,
      editEnd: hit.editEnd,
      text: hit.text,
    };
  });
}

// Trava contra regressão: dois trechos com o mesmo ID fariam apply.mjs
// reescrever o lugar errado, sem erro visível.
if (Object.keys(sidecar).length !== rows.length) {
  const seen = new Set();
  const dup = rows.map((r) => r.id).filter((id) => (seen.has(id) ? true : (seen.add(id), false)));
  throw new Error(`IDs duplicados (${dup.length}): ${[...new Set(dup)].slice(0, 10).join(", ")}`);
}

/* ---------------------------- CSV ---------------------------- */

const HEADERS = [
  "ID",
  "Página",
  "Seção",
  "Onde aparece",
  "Ação",
  "Limite",
  "Caracteres",
  "Texto atual",
  "TEXTO NOVO",
  "Comentário",
];

const cell = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
const csv = [
  HEADERS.map(cell).join(","),
  ...rows.map((r) =>
    [r.id, r.page, r.section, r.role, r.action, r.limit, r.chars, r.text, "", ""]
      .map(cell)
      .join(","),
  ),
].join("\r\n");

fs.mkdirSync(OUT_DIR, { recursive: true });
// BOM: sem ele o Excel abre acentuação quebrada. O Sheets aceita os dois.
fs.writeFileSync(path.join(OUT_DIR, "textos-vyta.csv"), "﻿" + csv, "utf8");

const head = execSync("git rev-parse HEAD", { cwd: ROOT, encoding: "utf8" }).trim();
fs.writeFileSync(
  path.join(OUT_DIR, "textos-vyta.json"),
  JSON.stringify({ commit: head, entries: sidecar }, null, 2) + "\n",
  "utf8",
);

/* --------------------------- relatório --------------------------- */

const byAction = rows.reduce((acc, r) => ((acc[r.action] = (acc[r.action] ?? 0) + 1), acc), {});

console.log(`${rows.length} trechos extraídos de ${perFileCount.size} arquivos.`);
console.log("Por ação:", byAction);
console.log("\nPor arquivo:");
for (const [file, n] of [...perFileCount].sort((a, b) => b[1] - a[1])) {
  console.log(`  ${String(n).padStart(4)}  ${file}`);
}
if (unknownKeys.size) {
  console.log(
    "\nChaves de objeto ignoradas por não estarem em COPY_KEYS nem TECH_KEYS.",
  );
  console.log("Confira se alguma delas é texto visível:\n ", [...unknownKeys].sort().join(", "));
}
