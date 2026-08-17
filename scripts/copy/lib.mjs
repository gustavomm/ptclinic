// Núcleo compartilhado entre `extract.mjs` e `apply.mjs`.
//
// A ideia: um único percurso de AST identifica todo texto visível do site e
// devolve, para cada trecho, um `id` estável, o texto legível e as coordenadas
// exatas no código. O extrator escreve isso em CSV (para a planilha) e em JSON
// (para o caminho de volta). O aplicador lê o CSV revisado, casa pelo `id`,
// confere que o texto atual não mudou desde a exportação e reescreve o arquivo.
//
// A regra de ouro do percurso é "negar por padrão em objeto, aceitar por padrão
// em JSX": chaves de objeto só entram se estiverem em COPY_KEYS, mas qualquer
// texto solto dentro de JSX entra. Isso evita arrastar caminho de imagem, slug
// e classe CSS para a planilha sem correr o risco de perder uma frase.

import fs from "node:fs";
import path from "node:path";
import ts from "typescript";

export const ROOT = path.resolve(import.meta.dirname, "../..");

/* ------------------------------------------------------------------ *
 * Mapa de arquivos: ordem de leitura do site e rótulos em português.
 * Tudo que for varrido e não estiver aqui cai em "Outros" no fim da
 * planilha, para que nada suma em silêncio.
 * ------------------------------------------------------------------ */
export const FILE_MAP = [
  { file: "components/layout/TopBar.tsx", page: "Em todas as páginas", section: "Faixa preta no topo" },
  { file: "components/layout/Nav.tsx", page: "Em todas as páginas", section: "Menu" },
  { file: "components/layout/MobileMenu.tsx", page: "Em todas as páginas", section: "Menu no celular" },
  { file: "components/layout/WhatsAppFab.tsx", page: "Em todas as páginas", section: "Botão flutuante do WhatsApp" },
  { file: "components/layout/Footer.tsx", page: "Em todas as páginas", section: "Rodapé" },

  { file: "app/page.tsx", page: "Home", section: "Título e descrição no Google" },
  { file: "components/sections/Hero.tsx", page: "Home", section: "1. Abertura" },
  { file: "components/sections/Manifesto.tsx", page: "Home", section: "2. Os três números" },
  { file: "components/sections/ComoFunciona.tsx", page: "Home", section: "3. Como funciona" },
  { file: "components/sections/EspecialidadesGrid.tsx", page: "Home", section: "4. Grade de especialidades (repete na página Especialidades)" },
  { file: "components/sections/PilatesSection.tsx", page: "Home", section: "5. Bloco escuro de Pilates (repete na página Pilates)" },
  { file: "components/sections/Founders.tsx", page: "Home", section: "6. Quem somos" },
  { file: "components/sections/PullQuote.tsx", page: "Home", section: "7. Citação das fundadoras" },
  { file: "components/sections/BlogTeasers.tsx", page: "Home", section: "8. Conteúdo" },
  { file: "components/sections/UnidadesSection.tsx", page: "Home", section: "9. Unidades (repete na página Unidades)" },
  { file: "components/sections/ContactCTA.tsx", page: "Home", section: "10. Chamada final" },

  { file: "app/especialidades/page.tsx", page: "Especialidades", section: "Página de lista" },
  { file: "app/especialidades/[slug]/page.tsx", page: "Especialidades", section: "Moldura da página de cada especialidade" },
  { file: "content/specialities.ts", page: "Especialidades", section: "Texto de cada especialidade" },

  { file: "app/pilates/page.tsx", page: "Pilates", section: "Página de Pilates" },
  { file: "components/sections/FaqAccordion.tsx", page: "Especialidades", section: "Perguntas frequentes" },
  { file: "components/sections/PhotoGallery.tsx", page: "Unidades", section: "Galeria de fotos" },

  { file: "app/unidades/page.tsx", page: "Unidades", section: "Página de lista" },
  { file: "app/unidades/[slug]/page.tsx", page: "Unidades", section: "Página de cada unidade" },
  { file: "content/units.ts", page: "Unidades", section: "Dados das unidades" },

  { file: "app/blog/page.tsx", page: "Conteúdo", section: "Página de lista" },
  { file: "app/blog/[slug]/page.tsx", page: "Conteúdo", section: "Moldura de cada texto" },

  { file: "content/team.ts", page: "Home", section: "Fisioterapeutas (o nome também assina os guias)" },
  { file: "content/clinic.ts", page: "Em todas as páginas", section: "Dados da clínica" },
  { file: "app/layout.tsx", page: "Em todas as páginas", section: "Título padrão no Google" },
  { file: "app/not-found.tsx", page: "Página não encontrada", section: "Erro 404" },
  { file: "app/opengraph-image.tsx", page: "Em todas as páginas", section: "Imagem que aparece ao compartilhar o link" },
  { file: "components/layout/Logo.tsx", page: "Em todas as páginas", section: "Logo" },
  { file: "components/ui/sheet.tsx", page: "Em todas as páginas", section: "Menu no celular" },
];

/* ------------------------------------------------------------------ *
 * Chaves de objeto
 * ------------------------------------------------------------------ */

// Entram na planilha.
const COPY_KEYS = new Map([
  ["title", "Título"],
  ["cardTitle", "Título curto do card"],
  ["cardText", "Texto do card"],
  ["summary", "Descrição no Google (máx. 160 caracteres)"],
  ["description", "Descrição no Google (máx. 160 caracteres)"],
  ["intro", "Parágrafo de abertura"],
  ["howItWorks", "Como é o tratamento"],
  ["forWhom", "Para quem é (item da lista)"],
  ["question", "Pergunta"],
  ["answer", "Resposta"],
  ["text", "Parágrafo"],
  ["figure", "Número em destaque"],
  ["label", "Rótulo de link"],
  ["lead", "Texto de apoio abaixo do título"],
  ["eyebrow", "Etiqueta acima do título"],
  ["quote", "Citação"],
  ["caption", "Legenda"],
  ["name", "Nome"],
  ["shortName", "Nome curto"],
  ["role", "Especialidade"],
  ["bio", "Minibiografia"],
  ["crefito", "Registro no Crefito"],
  ["education", "Formação (item da lista)"],
  ["tagline", "Assinatura da marca"],
  ["street", "Endereço"],
  ["district", "Bairro"],
  ["city", "Cidade"],
  ["condition", "Nome da condição (usado pelo Google, não aparece na tela)"],
  ["alt", "Descrição da imagem (não aparece na tela)"],
  ["imageAlt", "Descrição da imagem (não aparece na tela)"],
]);

// Nunca entram. Listadas explicitamente para que uma chave nova e desconhecida
// apareça no relatório do extrator em vez de ser descartada em silêncio.
const TECH_KEYS = new Set([
  "slug", "image", "src", "href", "className", "width", "height", "path", "type",
  "geo", "lat", "lng", "mapsUrl", "mapEmbedUrl", "postalCode", "state",
  "institutions", "relatedPosts", "days", "opens", "closes", "openingHours",
  "gallery", "siteUrl", "instagram", "instagramHandle", "email", "phoneE164",
  "phoneDisplay", "whatsappUrl", "legalName", "service", "from", "variant",
  "authorSlugs", "date", "imageWidth", "imageHeight", "n", "category",
  "@context", "@type", "@id", "url", "locale", "card", "images", "siteName",
]);

// Atributos JSX cujo valor é texto para humanos.
const COPY_ATTRS = new Map([
  ["alt", "Descrição da imagem (não aparece na tela)"],
  ["title", "Título"],
  ["lead", "Texto de apoio abaixo do título"],
  ["eyebrow", "Etiqueta acima do título"],
  ["heading", "Título de seção (H2)"],
  ["label", "Rótulo"],
  ["ariaLabel", "Nome do botão para leitor de tela"],
  ["aria-label", "Nome do botão para leitor de tela"],
  ["placeholder", "Texto de exemplo no campo"],
]);

// Elementos cujo conteúdo é uma frase única, montada de uma vez (o <em> dentro
// de um <h1> faz parte da mesma frase e precisa voltar junto).
const TEXT_TAGS = new Set([
  "h1", "h2", "h3", "h4", "h5", "h6", "p", "li", "a", "button", "span",
  "figcaption", "blockquote", "dt", "dd", "summary", "label", "th", "td",
]);

const INLINE_WRAP = new Map([
  ["em", "*"],
  ["i", "*"],
  ["strong", "**"],
  ["b", "**"],
]);

const ROLE_BY_TAG = new Map([
  ["h1", "Título principal da página (H1)"],
  ["h2", "Título de seção (H2)"],
  ["h3", "Subtítulo (H3)"],
  ["h4", "Subtítulo (H4)"],
  ["p", "Parágrafo"],
  ["li", "Item de lista"],
  ["a", "Link ou botão"],
  ["button", "Botão"],
  ["span", "Texto curto"],
  ["blockquote", "Citação"],
  ["figcaption", "Legenda de foto"],
  ["Link", "Link ou botão"],
  ["WhatsAppLink", "Botão"],
  ["Button", "Botão"],
]);

// Limite rígido de caracteres, quando existe um.
const HARD_LIMITS = new Map([
  ["Descrição no Google (máx. 160 caracteres)", 160],
  ["Título curto do card", 24],
  ["Etiqueta acima do título", 28],
  ["Botão", 30],
  ["Rótulo de link", 22],
  ["Número em destaque", 10],
]);

/* ------------------------------------------------------------------ *
 * Percurso
 * ------------------------------------------------------------------ */

const jsxName = (node) => {
  const tag = ts.isJsxElement(node)
    ? node.openingElement.tagName
    : ts.isJsxSelfClosingElement(node)
      ? node.tagName
      : null;
  return tag ? tag.getText() : null;
};

const squash = (s) => s.replace(/\s+/g, " ");

const ENTITIES = { "&amp;": "&", "&nbsp;": " ", "&quot;": '"', "&apos;": "'", "&lt;": "<", "&gt;": ">" };
const decodeEntities = (s) => s.replace(/&(amp|nbsp|quot|apos|lt|gt);/g, (m) => ENTITIES[m]);

/**
 * Última peneira antes de uma linha entrar na planilha. Pega o que escapou da
 * classificação por chave: URL, caminho de arquivo, cor, token de tema.
 */
const isTechnicalValue = (t) =>
  /^(https?:|mailto:|tel:|\/|#[0-9a-fA-F]{3,8}$)/.test(t) ||
  /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/.test(t);

/** Monta o texto legível de um elemento JSX, preservando ênfase como *itálico*. */
function composeJsx(node, unknown) {
  const kids = ts.isJsxFragment(node) ? node.children : node.children ?? [];
  let out = "";
  let hasLiteral = false;

  for (const child of kids) {
    if (ts.isJsxText(child)) {
      out += squash(child.text);
      if (/\p{L}/u.test(child.text)) hasLiteral = true;
      continue;
    }
    if (ts.isJsxExpression(child)) {
      const e = child.expression;
      if (!e) continue;
      if (ts.isStringLiteral(e) || ts.isNoSubstitutionTemplateLiteral(e)) {
        out += e.text;
        if (/\p{L}/u.test(e.text)) hasLiteral = true;
      } else if (ts.isJsxElement(e) || ts.isJsxFragment(e)) {
        const inner = composeJsx(e, unknown);
        out += inner.text;
        hasLiteral ||= inner.hasLiteral;
      } else {
        // Valor que vem do código (nome da unidade, telefone…). Vira um marcador
        // visível para que a fisioterapeuta entenda que ali entra outro dado.
        out += `{${e.getText().replace(/\s+/g, "")}}`;
      }
      continue;
    }
    if (ts.isJsxSelfClosingElement(child)) {
      if (jsxName(child) === "br") out += " / ";
      continue;
    }
    if (ts.isJsxElement(child)) {
      const tag = jsxName(child);
      const wrap = INLINE_WRAP.get(tag) ?? "";
      const inner = composeJsx(child, unknown);
      if (inner.hasLiteral) {
        out += wrap + inner.text.trim() + wrap;
        hasLiteral = true;
      } else {
        out += inner.text;
      }
    }
  }
  return { text: squash(out).trim(), hasLiteral };
}

/*
  Uma lista de classes utilitárias: todo token cabe no alfabeto do CSS e pelo
  menos um traz marca de utilitário, o hífen ou a variante com dois-pontos.

  A checagem é pelo negativo de propósito. Tentar reconhecer "parece uma frase"
  derrubava "min de leitura", que é texto de tela de verdade. Reconhecer a lista
  de classes é o lado que dá para descrever sem ambiguidade — medido contra as
  323 entradas da exportação, rejeita exatamente uma, o UNIT_LINK.
*/
const CSSISH_TOKEN = /^[-a-z0-9:/[\]().%#!]+$/;

function looksLikeClassList(text) {
  const tokens = text.trim().split(/\s+/);
  return (
    tokens.length > 1 &&
    tokens.every((t) => CSSISH_TOKEN.test(t)) &&
    tokens.some((t) => /[-:]/.test(t))
  );
}

/**
 * Decide se um literal de string é texto para humanos, subindo a árvore até
 * encontrar um nó que responda a pergunta.
 */
function classifyString(node, unknown) {
  let cur = node;
  let inArray = false;

  while (cur.parent) {
    const p = cur.parent;

    if (ts.isImportDeclaration(p) || ts.isExportDeclaration(p)) return null;

    if (ts.isJsxAttribute(p)) {
      const attr = p.name.getText();
      const role = COPY_ATTRS.get(attr);
      return role ? { role, note: inArray ? "item" : null } : null;
    }

    if (ts.isPropertyAssignment(p)) {
      const key = p.name.getText().replace(/['"]/g, "");
      if (TECH_KEYS.has(key)) return null;
      const role = COPY_KEYS.get(key);
      if (role) return { role };
      unknown.add(key);
      return null;
    }

    if (ts.isArrayLiteralExpression(p)) {
      inArray = true;
      cur = p;
      continue;
    }

    if (ts.isVariableDeclaration(p)) {
      // Constante solta de copy, como POINTS ou BENEFITS. O nome em maiúsculas
      // não basta: UNIT_LINK, em TopBar.tsx, é uma lista de classes do Tailwind
      // e entrou na planilha como "Texto / Reescrever" com offsets de edição
      // válidos. Se a Vyvyan escrevesse uma frase naquela linha, o `apply`
      // costuraria a frase dentro do className e levaria junto o `-my-2 py-2`,
      // que é o que dá aos links da faixa os 24px de alvo da WCAG 2.5.8.
      const name = p.name.getText();
      if (!/^[A-Z0-9_]+$/.test(name)) return null;
      if (looksLikeClassList(node.text)) return null;
      return { role: inArray ? "Item de lista" : "Texto" };
    }

    if (
      ts.isCallExpression(p) ||
      ts.isTypeReferenceNode(p) ||
      ts.isLiteralTypeNode(p) ||
      ts.isEnumMember(p)
    ) {
      return null;
    }

    if (
      ts.isParenthesizedExpression(p) ||
      ts.isConditionalExpression(p) ||
      ts.isBinaryExpression(p) ||
      ts.isTemplateSpan(p) ||
      ts.isAsExpression(p) ||
      ts.isSatisfiesExpression(p)
    ) {
      cur = p;
      continue;
    }

    if (ts.isJsxExpression(p)) {
      // Uma expressão pode ser filha de JSX (`{texto}`) ou valor de atributo
      // (`tone={cond ? "warm" : "deep"}`). Sem esta distinção, todo ramo de
      // ternário dentro de atributo virava linha de copy na planilha.
      const attr = p.parent && ts.isJsxAttribute(p.parent) ? p.parent.name.getText() : null;
      if (attr) return COPY_ATTRS.has(attr) ? { role: COPY_ATTRS.get(attr) } : null;
      return { role: "Texto curto" };
    }

    return null;
  }
  return null;
}

/** Varre um arquivo e devolve os trechos de texto encontrados, em ordem. */
export function scanFile(relPath, unknown) {
  const abs = path.join(ROOT, relPath);
  const source = fs.readFileSync(abs, "utf8");
  const sf = ts.createSourceFile(abs, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const found = [];

  const lineOf = (pos) => sf.getLineAndCharacterOfPosition(pos).line + 1;

  const push = (node, text, kind, role) => {
    const t = decodeEntities(text.trim());
    if (!t || !/\p{L}/u.test(t)) return;
    if (isTechnicalValue(t)) return;

    // Para um elemento JSX, o que apply.mjs reescreve é só a região entre a tag
    // de abertura e a de fechamento — nunca as tags, nunca as classes.
    let editStart = node.getStart(sf);
    let editEnd = node.getEnd();
    if (ts.isJsxElement(node)) {
      editStart = node.openingElement.getEnd();
      editEnd = node.closingElement.getStart();
    } else if (ts.isJsxFragment(node)) {
      editStart = node.openingFragment.getEnd();
      editEnd = node.closingFragment.getStart();
    }

    found.push({
      file: relPath,
      kind,
      role,
      text: t,
      line: lineOf(node.getStart(sf)),
      start: node.getStart(sf),
      end: node.getEnd(),
      editStart,
      editEnd,
    });
  };

  const walk = (node) => {
    if (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) return;
    if (ts.isJsxAttributes(node)) {
      // Atributos entram pelo classificador, mas os filhos JSX de um atributo
      // (title={<>…</>}) precisam do percurso normal.
      node.forEachChild(walk);
      return;
    }

    if ((ts.isJsxElement(node) || ts.isJsxFragment(node))) {
      const tag = ts.isJsxFragment(node) ? null : jsxName(node);
      // O conteúdo de <style> e <script> é código, não texto de página.
      if (tag === "style" || tag === "script") return;
      const composable = tag === null || TEXT_TAGS.has(tag) || INLINE_WRAP.has(tag);
      if (composable) {
        const composed = composeJsx(node, unknown);
        if (composed.hasLiteral) {
          const role =
            (tag && ROLE_BY_TAG.get(tag)) ||
            (tag === null ? "Título" : "Texto");
          push(node, composed.text, "jsx", role);
          return; // a frase já saiu inteira; não descer e duplicar pedaços
        }
      }
      node.forEachChild(walk);
      return;
    }

    // Texto solto dentro de um elemento que não é frase única (um <div> de
    // rodapé, o filho de <WhatsAppLink>). Sem este ramo esses trechos sumiam.
    if (ts.isJsxText(node)) {
      const owner = node.parent;
      const tag = owner && !ts.isJsxFragment(owner) ? jsxName(owner) : null;
      push(node, squash(node.text), "jsx", ROLE_BY_TAG.get(tag) ?? "Texto");
      return;
    }

    if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
      const hit = classifyString(node, unknown);
      if (hit) push(node, node.text, "string", hit.role);
      return;
    }

    // Título e descrição das páginas dinâmicas (`Fisioterapia em ${u.district}`)
    // são template literals. Sem este ramo, o texto que o Google mostra para as
    // 9 especialidades, as 2 unidades e os 6 guias ficava fora da planilha.
    if (ts.isTemplateExpression(node)) {
      const hit = classifyString(node, unknown);
      if (hit) {
        const text =
          node.head.text +
          node.templateSpans
            .map((sp) => `{${sp.expression.getText().replace(/\s+/g, "")}}` + sp.literal.text)
            .join("");
        push(node, text, "template", hit.role);
      }
      return;
    }

    node.forEachChild(walk);
  };

  walk(sf);
  return found;
}

export function hardLimit(role) {
  return HARD_LIMITS.get(role) ?? "";
}

/** Ação sugerida: o que a Vyvyan e a Tainá precisam fazer com esta linha. */
export function suggestAction(entry) {
  if (/não aparece na tela/.test(entry.role)) return "Opcional";
  if (/^content\/(team|units|clinic)\.ts$/.test(entry.file)) return "Conferir";
  if (entry.role === "Registro no Crefito" || entry.role === "Nome") return "Conferir";
  if (entry.file === "content/specialities.ts") return "Conferir";
  return "Reescrever";
}
