#!/usr/bin/env node
// Gera o mapa visual dos textos: docs/revisao/mapa-dos-textos.html
//
//   node scripts/copy/guide.mjs
//
// A planilha resolve a edição, mas não resolve "onde fica esse texto na página".
// Este arquivo resolve: mostra cada trecho na ordem em que aparece no site, com
// o mesmo código da planilha ao lado, e cada um renderizado com a tipografia do
// papel que ele exerce — título em Cormorant, corpo em Jost. É o companheiro da
// planilha, não substituto: aqui não se edita nada.
//
// As fontes entram embutidas em base64 porque a página publicada não pode pedir
// nada para fora. Vêm do build do próprio site, então são as mesmas do ar.

import fs from "node:fs";
import path from "node:path";
import { ROOT, FILE_MAP } from "./lib.mjs";

const OUT = path.join(ROOT, "docs/revisao/mapa-dos-textos.html");

/* ----------------------------- dados ----------------------------- */

const sidecar = JSON.parse(
  fs.readFileSync(path.join(ROOT, "docs/revisao/textos-vyta.json"), "utf8"),
);

function parseCsv(text) {
  const rows = [];
  let row = [], cell = "", quoted = false;
  const src = text.replace(/^﻿/, "");
  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (quoted) {
      if (c === '"') { if (src[i + 1] === '"') (cell += '"', i++); else quoted = false; }
      else cell += c;
      continue;
    }
    if (c === '"') quoted = true;
    else if (c === ",") (row.push(cell), (cell = ""));
    else if (c === "\n") (row.push(cell), rows.push(row), (row = []), (cell = ""));
    else if (c !== "\r") cell += c;
  }
  if (cell || row.length) (row.push(cell), rows.push(row));
  const header = rows.shift();
  return rows.filter((r) => r.some(Boolean))
    .map((r) => Object.fromEntries(header.map((h, i) => [h, r[i] ?? ""])));
}

const rows = parseCsv(
  fs.readFileSync(path.join(ROOT, "docs/revisao/textos-vyta.csv"), "utf8"),
);

/* ----------------------------- fontes ----------------------------- */

const FONTS = {
  cormorant: ".next/static/media/7b89a4fd5e90ede0-s.p.woff2",
  cormorantItalic: ".next/static/media/e18f83c737786aa7-s.p.woff2",
  jost: ".next/static/media/9dd75fadc5b3df29-s.p.woff2",
};

const dataUri = (rel) => {
  const abs = path.join(ROOT, rel);
  if (!fs.existsSync(abs)) {
    throw new Error(`fonte não encontrada: ${rel} — rode 'npm run build' antes`);
  }
  return `data:font/woff2;base64,${fs.readFileSync(abs).toString("base64")}`;
};

/* ---------------------------- montagem ---------------------------- */

const esc = (s) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** Renderiza o texto com as convenções da planilha: *itálico* e {marcador}. */
const renderText = (s) =>
  esc(s)
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>")
    .replace(/\{([^}]+)\}/g, '<span class="slot" title="valor preenchido pelo site">$1</span>');

const isHeading = (role) => /Título|Citação/.test(role);
const isMicro = (role) => /Etiqueta|Rótulo|Botão|Link|Número|Nome curto/.test(role);

const ACTIONS = {
  Reescrever: { cls: "rewrite", hint: "texto que o Gustavo escreveu" },
  Conferir: { cls: "check", hint: "informação clínica ou dado da clínica" },
  Opcional: { cls: "optional", hint: "não aparece na tela" },
};

// Agrupa mantendo a ordem de leitura que veio do extrator.
const pages = [];
for (const r of rows) {
  let page = pages.at(-1);
  if (!page || page.name !== r["Página"]) {
    page = { name: r["Página"], sections: [] };
    pages.push(page);
  }
  let section = page.sections.at(-1);
  if (!section || section.name !== r["Seção"]) {
    section = { name: r["Seção"], rows: [] };
    page.sections.push(section);
  }
  section.rows.push(r);
}

const slug = (s) =>
  s.normalize("NFD").replace(/\p{Mn}/gu, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const counts = rows.reduce((a, r) => ((a[r["Ação"]] = (a[r["Ação"]] ?? 0) + 1), a), {});

const body = pages
  .map(
    (page) => `
<section class="page" id="p-${slug(page.name)}">
  <h2 class="page-title">${esc(page.name)}</h2>
  ${page.sections
    .map(
      (section) => `
  <div class="section">
    <h3 class="section-title">${esc(section.name)}</h3>
    <div class="rows">
      ${section.rows
        .map((r) => {
          const action = ACTIONS[r["Ação"]] ?? ACTIONS.Reescrever;
          const limit = r["Limite"]
            ? `<span class="limit">máx. ${esc(r["Limite"])} caracteres</span>`
            : "";
          const cls = [
            "text",
            isHeading(r["Onde aparece"]) ? "as-heading" : "",
            isMicro(r["Onde aparece"]) ? "as-micro" : "",
          ].filter(Boolean).join(" ");
          return `
      <article class="row ${action.cls}" data-find="${esc((r["ID"] + " " + r["Onde aparece"] + " " + r["Texto atual"]).toLowerCase())}">
        <div class="meta">
          <code class="id">${esc(r["ID"])}</code>
          <span class="role">${esc(r["Onde aparece"])}</span>
          ${limit}
        </div>
        <p class="${cls}">${renderText(r["Texto atual"])}</p>
      </article>`;
        })
        .join("")}
    </div>
  </div>`,
    )
    .join("")}
</section>`,
  )
  .join("");

const nav = pages
  .map((p) => `<a href="#p-${slug(p.name)}">${esc(p.name)}</a>`)
  .join("");

/* ------------------------------ HTML ------------------------------ */

const html = `<title>Mapa dos textos do site · Vyta</title>
<style>
@font-face{font-family:'Cormorant Garamond';font-style:normal;font-weight:300 400;font-display:swap;src:url(${dataUri(FONTS.cormorant)}) format('woff2')}
@font-face{font-family:'Cormorant Garamond';font-style:italic;font-weight:300 400;font-display:swap;src:url(${dataUri(FONTS.cormorantItalic)}) format('woff2')}
@font-face{font-family:'Jost';font-style:normal;font-weight:300 500;font-display:swap;src:url(${dataUri(FONTS.jost)}) format('woff2')}

:root{
  --ground:#FAF6F0; --raised:#F3EDE4; --line:#E3DCD2; --line-soft:#EDE6DC;
  --ink:#2C3A3D; --muted:#5d6664; --subtle:#6F695F;
  --teal:#346b75; --coral:#a8543c; --coral-bg:#f6e3dc;
  --display:'Cormorant Garamond',Georgia,serif;
  --sans:'Jost',ui-sans-serif,system-ui,sans-serif;
  --mono:ui-monospace,SFMono-Regular,'SF Mono',Menlo,monospace;
}
@media (prefers-color-scheme:dark){
  :root:not([data-theme="light"]){
    --ground:#1A2224; --raised:#232D30; --line:#33403F; --line-soft:#2A3537;
    --ink:#F2EDE6; --muted:#B4BDBB; --subtle:#9AA3A0;
    --teal:#7FB6BF; --coral:#e69883; --coral-bg:#3A2C28;
  }
}
:root[data-theme="dark"]{
  --ground:#1A2224; --raised:#232D30; --line:#33403F; --line-soft:#2A3537;
  --ink:#F2EDE6; --muted:#B4BDBB; --subtle:#9AA3A0;
  --teal:#7FB6BF; --coral:#e69883; --coral-bg:#3A2C28;
}

*{box-sizing:border-box}
body{
  margin:0; background:var(--ground); color:var(--ink);
  font-family:var(--sans); font-weight:300; font-size:16px; line-height:1.6;
  -webkit-font-smoothing:antialiased;
}
.shell{max-width:60rem;margin:0 auto;padding:0 1.5rem 6rem}

/* ---- abertura ---- */
header.intro{padding:4.5rem 0 2.5rem;display:flex;flex-direction:column;gap:1.25rem}
.eyebrow{font-size:.75rem;text-transform:uppercase;letter-spacing:.28em;color:var(--teal)}
h1{font-family:var(--display);font-weight:300;font-size:clamp(2.25rem,1.5rem+3vw,3.5rem);line-height:1.05;margin:0;text-wrap:balance}
.lede{max-width:38rem;color:var(--muted);font-size:1.0625rem}
.lede strong{font-weight:500;color:var(--ink)}

/* ---- como usar ---- */
.howto{border:1px solid var(--line);background:var(--raised);padding:1.5rem 1.75rem;display:flex;flex-direction:column;gap:1rem;margin-top:.5rem}
.howto h2{font-family:var(--display);font-weight:400;font-size:1.5rem;margin:0}
.howto ol{margin:0;padding-left:1.25rem;display:flex;flex-direction:column;gap:.5rem;color:var(--muted)}
.howto code{font-family:var(--mono);font-size:.8125em;color:var(--teal)}

.legend{display:flex;flex-wrap:wrap;gap:.5rem 1.5rem;margin-top:1.5rem;font-size:.875rem;color:var(--muted)}
.legend div{display:flex;align-items:center;gap:.5rem}
.dot{width:.625rem;height:.625rem;flex:none;border-radius:50%}
.dot.rewrite{background:var(--coral)}
.dot.check{background:var(--teal)}
.dot.optional{background:var(--line);border:1px solid var(--subtle)}

/* ---- barra fixa ---- */
.bar{position:sticky;top:0;z-index:10;background:var(--ground);border-bottom:1px solid var(--line);padding:.75rem 0;margin-bottom:2.5rem}
.bar-inner{max-width:60rem;margin:0 auto;padding:0 1.5rem;display:flex;flex-wrap:wrap;gap:.75rem 1.25rem;align-items:center}
input[type=search]{
  flex:1 1 14rem;min-width:0;font:inherit;font-size:.9375rem;padding:.5rem .75rem;
  background:var(--raised);color:var(--ink);border:1px solid var(--line);border-radius:0;
}
input[type=search]:focus-visible{outline:2px solid var(--teal);outline-offset:1px}
.jump{display:flex;flex-wrap:wrap;gap:.25rem .875rem;font-size:.8125rem}
.jump a{color:var(--muted);text-decoration:none;border-bottom:1px solid transparent;padding:.125rem 0}
.jump a:hover,.jump a:focus-visible{color:var(--teal);border-bottom-color:var(--teal);outline:none}
.tally{font-size:.8125rem;color:var(--subtle);font-variant-numeric:tabular-nums;margin-left:auto}

/* ---- conteúdo ---- */
.page{margin-bottom:4rem;scroll-margin-top:5.5rem}
.page-title{
  font-family:var(--display);font-weight:300;font-size:2.25rem;margin:0 0 .25rem;
  padding-bottom:.5rem;border-bottom:1px solid var(--ink);
}
.section{margin-top:2.5rem}
.section-title{
  font-size:.75rem;text-transform:uppercase;letter-spacing:.2em;color:var(--subtle);
  font-weight:400;margin:0 0 1rem;
}
.rows{display:flex;flex-direction:column;gap:1px;background:var(--line-soft)}
.row{background:var(--ground);padding:1rem 1.25rem;display:flex;flex-direction:column;gap:.5rem;border-left:3px solid transparent}
.row.rewrite{border-left-color:var(--coral)}
.row.check{border-left-color:var(--teal)}
.row.optional{opacity:.72}
.row[hidden]{display:none}

.meta{display:flex;flex-wrap:wrap;align-items:baseline;gap:.5rem .875rem}
.id{
  font-family:var(--mono);font-size:.75rem;letter-spacing:.02em;
  background:var(--raised);border:1px solid var(--line);padding:.125rem .4rem;color:var(--teal);
}
.role{font-size:.75rem;text-transform:uppercase;letter-spacing:.12em;color:var(--subtle)}
.limit{font-size:.75rem;color:var(--coral);font-variant-numeric:tabular-nums}

.text{margin:0;max-width:60ch;color:var(--ink);font-size:1rem}
.text.as-heading{font-family:var(--display);font-size:1.5rem;line-height:1.25;font-weight:300}
.text.as-micro{font-size:.9375rem;color:var(--muted)}
.text em{font-style:italic}
.slot{
  font-family:var(--mono);font-size:.8125em;background:var(--coral-bg);color:var(--coral);
  padding:.05em .35em;border-radius:2px;
}

.empty{padding:2rem 0;color:var(--subtle);font-size:.9375rem}
.empty[hidden]{display:none}
footer{border-top:1px solid var(--line);margin-top:3rem;padding-top:1.5rem;color:var(--subtle);font-size:.8125rem}
</style>

<div class="shell">
  <header class="intro">
    <span class="eyebrow">Revisão de conteúdo</span>
    <h1>Todo texto do site, na ordem em que aparece</h1>
    <p class="lede">
      São <strong>${rows.length} trechos</strong>. Cada um tem um código, tipo <code style="font-family:var(--mono);font-size:.85em">hero-03</code>,
      e esse mesmo código está na planilha. Aqui vocês veem onde o texto fica e como ele
      soa na página; a reescrita acontece na planilha.
    </p>
  </header>

  <div class="howto">
    <h2>Como usar</h2>
    <ol>
      <li>Leia esta página de cima para baixo. Ela segue a ordem do site.</li>
      <li>Achou algo para mudar? Anote o código e procure por ele na planilha.</li>
      <li>Escreva a nova versão na coluna <strong>TEXTO NOVO</strong>. O que ficar em branco fica como está.</li>
      <li>Dúvida sobre por que um texto está ali? Escreva na coluna <strong>Comentário</strong>.</li>
    </ol>
    <p style="margin:0;color:var(--muted);font-size:.9375rem">
      Duas convenções: palavra em <em>itálico</em> aparece assim no site, e na planilha vem
      entre asteriscos (<code>*assim*</code>). O que estiver marcado como
      <span class="slot">u.district</span> é preenchido pelo site sozinho, com o nome do
      bairro ou da unidade. Mantenha esses pedaços onde estão.
    </p>
    <div class="legend">
      <div><span class="dot rewrite"></span> <strong style="font-weight:500">Reescrever</strong> · ${counts.Reescrever ?? 0} trechos que o Gustavo escreveu</div>
      <div><span class="dot check"></span> <strong style="font-weight:500">Conferir</strong> · ${counts.Conferir ?? 0} de conteúdo clínico ou dado da clínica</div>
      <div><span class="dot optional"></span> <strong style="font-weight:500">Opcional</strong> · ${counts.Opcional ?? 0} que não aparecem na tela</div>
    </div>
  </div>
</div>

<div class="bar">
  <div class="bar-inner">
    <input type="search" id="q" placeholder="Procurar por palavra ou código" aria-label="Procurar texto" autocomplete="off">
    <nav class="jump" aria-label="Ir para">${nav}</nav>
    <span class="tally" id="tally"></span>
  </div>
</div>

<div class="shell">
  ${body}
  <p class="empty" id="empty" hidden>Nenhum texto com essa palavra.</p>
  <footer>
    Gerado a partir do código do site em ${new Date().toLocaleDateString("pt-BR")}.
    Se o site mudar, esta página é gerada de novo — ela não é editada à mão.
  </footer>
</div>

<script>
  const q = document.getElementById("q");
  const rows = [...document.querySelectorAll(".row")];
  const tally = document.getElementById("tally");
  const empty = document.getElementById("empty");

  const update = () => {
    const term = q.value.trim().toLowerCase();
    let shown = 0;
    for (const row of rows) {
      const hit = !term || row.dataset.find.includes(term);
      row.hidden = !hit;
      if (hit) shown++;
    }
    for (const el of document.querySelectorAll(".section")) {
      el.hidden = !el.querySelector(".row:not([hidden])");
    }
    for (const el of document.querySelectorAll(".page")) {
      el.hidden = !el.querySelector(".row:not([hidden])");
    }
    empty.hidden = shown > 0;
    tally.textContent = term ? shown + " de " + rows.length : rows.length + " trechos";
  };

  q.addEventListener("input", update);
  update();
</script>
`;

fs.writeFileSync(OUT, html, "utf8");
console.log(`${OUT} — ${rows.length} trechos, ${(html.length / 1024).toFixed(0)} KB`);
