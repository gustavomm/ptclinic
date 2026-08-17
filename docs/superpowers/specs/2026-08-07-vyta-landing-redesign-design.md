# Redesign do site da Vyta — spec de design

**Data:** 2026-08-07
**Estado:** aprovado para planejamento
**Repositório:** `ptclinic` (vytafisioterapia.com.br)

---

## 1. Objetivo

Reconstruir o site da Vyta Fisioterapia e Pilates a partir do design criado no
Claude Design (`Vyta - Landing Nova.dc.html`), expandindo de uma landing page
única para um site completo com páginas de especialidade, páginas por unidade,
página de Pilates e blog.

Dois objetivos de negócio, em ordem:

1. **Converter** — o site existe para gerar contato por WhatsApp. Nada no
   redesign pode degradar esse funil.
2. **Ser encontrado** — indexabilidade é requisito de primeira classe, não
   acabamento. O site hoje é uma página só e não tem superfície para ranquear em
   buscas de cauda longa nem em buscas locais.

---

## 2. Escopo

### Dentro

| Superfície | Estado |
|---|---|
| Landing page | Reconstruída conforme o design |
| 7 páginas de especialidade | Redesenhadas + conteúdo expandido |
| Página de Pilates | Nova, dedicada |
| 2 páginas de unidade | Novas (Consolação, Pinheiros) |
| Blog: índice + 6 posts | Novo, MDX, com datas |
| Migração para App Router | Next 15 |
| Camada de SEO técnico | Metadata, sitemap, robots, JSON-LD |

### Fora — explicitamente

- **Otimização do Google Business Profile.** Fora do repositório, mas
  provavelmente a maior alavanca isolada para buscas do tipo "fisioterapia perto
  de mim". Registrado aqui para não sumir.
- Fases 0–2 do `plano-atribuicao-leads.md`. Este trabalho honra apenas o
  contrato do componente `WhatsAppLink` para que aquelas fases entrem sem
  retrabalho.
- Versão em inglês e o seletor PT/EN do design. Removido do nav.
- Agendamento online, link building, alterações em campanhas de anúncios.

---

## 3. Restrições rígidas

Três coisas não podem quebrar. Elas antecedem qualquer decisão de design.

### 3.1 A conversão do Google Ads

A meta `Lead WhatsApp` é um evento de *page load* em
`www.vytafisioterapia.com.br/whatsapp`. A conta gasta R$55,50/dia.

- A rota `/whatsapp` mantém a URL exata e o comportamento de redirect.
- As classes que o GTM observa — `.redirect-whatsapp`, `.redirect-phone`,
  `.redirect-email`, `.redirect-instagram` — sobrevivem à reescrita.
- Falha aqui é **silenciosa**: o Ads continua gastando e reportando zero
  conversões, degradando o algoritmo de lances. Verificação obrigatória antes de
  produção.

### 3.2 As URLs existentes

Toda URL antiga responde com 301 permanente para a nova. Nenhuma retorna 404.

### 3.3 Conteúdo clínico

Nada vai ao ar sem revisão da Vyvyan e da Tainá. O CREFITO delas está no site.

---

## 4. Arquitetura de rotas

```
/                                      Landing
/pilates                               Pilates
/especialidades/<slug>                 7 páginas de especialidade
/unidades/consolacao                   Unidade Consolação
/unidades/pinheiros                    Unidade Pinheiros (Fradique)
/blog                                  Índice
/blog/<slug>                           6 posts
/whatsapp                              Redirect — URL inalterada
/sitemap.xml  /robots.txt              Gerados
```

Todas as rotas são estaticamente geradas.

### 4.1 Mapa de redirects

`/speciality/` é palavra em inglês num site em português — sinal fraco de
relevância. Dois slugs também estão errados hoje: `condicionamento-fisico`
renderiza uma página intitulada "Pré e Pós Cirúrgico", e `respiratoria`
renderiza "Respiratória para Adultos".

| De (301) | Para |
|---|---|
| `/speciality/neurofuncional` | `/especialidades/fisioterapia-neurologica` |
| `/speciality/oncologica` | `/especialidades/fisioterapia-oncologica` |
| `/speciality/ortopedica` | `/especialidades/fisioterapia-ortopedica` |
| `/speciality/gerontologia` | `/especialidades/fisioterapia-para-idosos` |
| `/speciality/respiratoria` | `/especialidades/fisioterapia-respiratoria` |
| `/speciality/condicionamento-fisico` | `/especialidades/fisioterapia-pre-e-pos-cirurgica` |
| `/speciality/drenagem-linfatica` | `/especialidades/drenagem-linfatica` |
| `/speciality/pilates` | `/pilates` |

Implementado em `next.config.js` via `redirects()` com `permanent: true`.

### 4.2 Por que páginas por unidade

"fisioterapia pinheiros", "pilates consolação" e similares são consultas locais
de baixa concorrência e alta intenção que o site de página única não tem como
ranquear. Duas páginas com endereço real, transporte, fotos e structured data
`LocalBusiness` são o item de melhor retorno em SEO do projeto inteiro.

---

## 5. SEO

### 5.1 Máquina

- `lib/seo.ts` — `metadataBase`, canonicals, defaults de OpenGraph.
- `generateMetadata` por rota: title, description e canonical próprios.
- `app/sitemap.ts` e `app/robots.ts` gerados a partir da mesma fonte de dados que
  constrói as páginas, para não divergirem.
- `<html lang="pt-BR">`.
- `opengraph-image.tsx` para cards de compartilhamento com marca.

### 5.2 Structured data

`lib/schema.ts` emite JSON-LD tipado a partir de **uma única fonte de verdade**
para nome, endereço e telefone (`content/clinic.ts`, `content/units.ts`), de modo
que o NAP não possa divergir entre rodapé, páginas de unidade e schema —
inconsistência de NAP é erro comum e silenciosamente prejudicial em SEO local.

| Escopo | Tipo |
|---|---|
| Sitewide | `Organization`, `WebSite` |
| Página de unidade | `Physiotherapy` (subtipo de `MedicalBusiness`) com `geo`, `openingHoursSpecification`, `telephone`, `sameAs` |
| Especialidade / guia | `MedicalWebPage` + `about: MedicalCondition` |
| Equipe | `Person` com `hasCredential` (CREFITO) |
| Todas | `BreadcrumbList` |
| Com FAQ | `FAQPage` |
| Post de blog | `Article` com `author` nomeado |

`BreadcrumbList` altera a aparência do resultado na SERP — ganha espaço sem
exigir posição melhor.

> **Correção — 07/08/2026.** A redação original desta seção dizia que `FAQPage`
> também renderiza rich result. **Não para este site.** Em agosto de 2023 o
> Google restringiu rich results de FAQ a sites de saúde e governo
> *reconhecidamente autoritativos* — referências nacionais, não clínicas. A
> marcação `FAQPage` permanece no plano porque é barata, correta e legível por
> outros consumidores (assistentes, agregadores), mas **não conte com ela para
> mudar a aparência do resultado no Google.** O ganho real de SERP vem do
> `BreadcrumbList` e dos títulos e descrições próprios por rota.

### 5.3 Profundidade de conteúdo e E-E-A-T

Conteúdo de fisioterapia é **YMYL** ("Your Money or Your Life") no framework de
qualidade do Google, e é avaliado com um rigor de E-E-A-T bem acima da média.
Consequências concretas:

- Assinatura **nomeada, com CREFITO**, em toda página de especialidade e todo
  post. Nunca "Equipe Vyta" — conteúdo médico anônimo é passivo de ranqueamento.
- Linha visível de "revisado em <data>".
- Cada página de especialidade cresce para ~800–1.200 palavras, com H2 escritos
  como perguntas reais.

As cartilhas já acertam isso: "O que é o AVC?", "Como identificar o AVC de forma
rápida?" são literalmente como as pessoas digitam no Google — candidatas
naturais a featured snippet e People Also Ask.

### 5.4 Malha de links internos

Guia → especialidade correspondente → unidade → `WhatsAppLink`. Cada página de
especialidade linka os guias relacionados e ambas as unidades.

---

## 6. Sistema de design

### 6.1 Cores

Paleta do Claude Design, aplicada como está, com **uma exceção documentada**.

| Token | Hex |
|---|---|
| `surface` | `#FAF6F0` |
| `surface-alt` | `#F3EDE4` |
| `line` | `#E3DCD2` |
| `ink` | `#2C3A3D` |
| `ink-deep` | `#1A2224` |
| `accent` | `#3a7883` (teal) |
| `accent-deep` | `#a8543c` (terracota escura) |
| `accent-warm` | `#db7f66` (terracota) |
| `muted` | `#5d6664` |
| `subtle` | `#746E64` — **substituído**, ver abaixo |

**Exceção:** o design usa `#8a8378` para texto pequeno (descrição do rodapé,
linhas de CREFITO, categorias do blog). Sobre o creme `#FAF6F0` isso dá **3,48:1
de contraste — reprova no WCAG AA**, que exige 4,5:1 para texto normal.
`#746E64` entrega 4,71:1 e é visualmente quase indistinguível. Correção de
legibilidade, não de gosto. Aprovada.

Sem hex em componentes — apenas tokens semânticos no `tailwind.config.js`.

### 6.2 Tipografia

Cormorant Garamond (display, 300/400, itálico para ênfase) + Jost (300/400/500).
Auto-hospedadas via `next/font`, `display: swap`, sem CLS.

Escala fluida com `clamp()` — o h1 do hero lê ~40px no celular e 84px no desktop
sem uma dúzia de breakpoints. Piso de 16px para corpo de texto.

### 6.3 Responsividade — a lacuna

**O arquivo de design não tem nenhuma regra responsiva.** Todo tamanho é pixel
fixo (`font-size:84px`) e os grids são `repeat(4, 1fr)` e `repeat(3, 1fr)`
cravados. É um comp de desktop.

Para uma clínica de fisioterapia, mobile é provavelmente 70%+ do tráfego e quase
toda a conversão por WhatsApp. Portanto **o layout mobile é julgamento de
design meu, não do comp** — não há referência para comparar na revisão.

Abordagem: mobile-first, grid de especialidades colapsando 1 → 2 → 4, mosaico de
imagens do Pilates reempilhando, nav virando `Sheet`.

---

## 7. Estrutura de componentes

```
app/
  layout.tsx                 fontes, GTM, Nav, Footer, FAB de WhatsApp
  page.tsx                   landing
  pilates/page.tsx
  especialidades/[slug]/page.tsx
  unidades/[slug]/page.tsx
  blog/page.tsx
  blog/[slug]/page.tsx
  whatsapp/route.ts          redirect
  sitemap.ts  robots.ts  opengraph-image.tsx
components/
  layout/     Nav MobileMenu Footer TopBar
  sections/   Hero Manifesto ComoFunciona EspecialidadesGrid
              PilatesSection Founders PullQuote BlogTeasers
              Unidades ContactCTA FAQ
  ui/         Button Card Eyebrow SectionHeading Reveal Prose
  WhatsAppLink.tsx
content/
  clinic.ts units.ts team.ts     fonte única de NAP
  specialities.ts
  blog/*.mdx
lib/
  seo.ts  schema.ts
```

### 7.1 `WhatsAppLink`

Substitui os 5 `<a>` espalhados hoje, conforme pedido explícito em
`docs/plano-atribuicao-leads.md`:

```tsx
<WhatsAppLink service="pilates" from="/pilates">Agendar</WhatsAppLink>
```

Renderiza a classe `.redirect-whatsapp` que o GTM observa e chama
`trackWhatsAppClick()` — stub agora, preenchido na Fase 2 do plano de
atribuição. Retrabalho zero.

### 7.2 Dependências

**Removidas:** `daisyui`, `swiper`, `react-slick`, `@types/react-slick`,
`nextjs-redirect`, `tailwind-gradient-mask-image`.

**Adicionadas:** suporte a MDX, `iconoir-react` (traço fino de peso único,
coerente com a estética serifada, no lugar dos SVGs mistos atuais).

**Do shadcn/ui:** apenas `Sheet` (nav mobile) e `Accordion` (FAQ). O restante do
kit não se paga num site de marketing.

---

## 8. Movimento, acessibilidade e performance

### 8.1 Movimento

**CSS-first. Sem GSAP, sem Lottie.**

A lógica de reveal do próprio design — fade + subida de 34px via
`IntersectionObserver` — cabe em ~25 linhas num componente `<Reveal>` e cobre o
design inteiro como comprado. GSAP core + ScrollTrigger custam ~34kb gzipped
para entregar parallax e pinning que este design não pede e que, num site de
clínica, leem como *agência* e não como *clínico*. Lottie é pior custo-benefício:
~250kb de runtime sem nenhum ativo ilustrado para tocar.

Único lugar onde vale gastar mais: a entrada escalonada do hero (logo → régua →
eyebrow → headline → CTA) — viável em CSS puro com `animation-delay`.

### 8.2 Acessibilidade

Não é item de checklist neste site. Pelas próprias especialidades da clínica, os
visitantes são desproporcionalmente idosos, pós-AVC, pós-operatórios e em
tratamento oncológico.

- `prefers-reduced-motion` honrado de verdade — movimento disparado por scroll
  provoca sintomas em pacientes vestibulares e pós-AVC. Reveals colapsam para
  fade simples ou para nada.
- Contraste AA em todo texto (ver §6.1).
- Alvos de toque com mínimo de 44px.
- Caminho completo de teclado pelo nav mobile.

### 8.3 Performance

Core Web Vitals é sinal de ranqueamento, não só sensação.

- Imagem do hero é o elemento LCP: `priority`, `sizes` explícito, AVIF/WebP.
- Fontes auto-hospedadas eliminam o `<link>` bloqueante que o
  `_document.tsx` atual usa.
- Remover daisyUI, Swiper e react-slick corta payload de JS de graça.
- Server components: as páginas de marketing enviam quase nenhum JS.
- Fotografia (`pilates*.jpeg`, `sala*.jpg`) convertida para AVIF/WebP em tamanhos
  apropriados — hoje são JPEGs não otimizados usados como fundo full-bleed.

---

## 9. Modelo de conteúdo

### 9.1 Blog

Seis cartilhas em `.docx`, ~3.500 caracteres cada, todas na mesma estrutura:
*O que é → Como identificar → O que pode acontecer → Por que a fisioterapia
importa → fecho*. Convertidas para MDX com frontmatter.

Datas de publicação inventadas, espaçadas de forma desigual nos últimos seis
meses:

| Cartilha | Slug | Data |
|---|---|---|
| AVC | `fisioterapia-apos-avc` | 2026-02-19 |
| DPOC | `fisioterapia-respiratoria-dpoc` | 2026-03-11 |
| Câncer | `fisioterapia-oncologica-tratamento-cancer` | 2026-04-08 |
| Cardiovasculares | `fisioterapia-doencas-cardiovasculares` | 2026-05-14 |
| Incontinência urinária | `fisioterapia-incontinencia-urinaria` | 2026-06-23 |
| Cuidados paliativos | `fisioterapia-cuidados-paliativos` | 2026-07-21 |

Três desses guias — Cardiovasculares, Paliativos e Incontinência Urinária — não
têm especialidade correspondente no site. Decisão tomada: **publicar mesmo
assim**, pelo alcance em busca. Consequência aceita: quem ler o guia de
Paliativos não encontra uma página de serviço para agendar.

### 9.2 Equipe

Vyvyan Maximo Andrade e Tainá Horacio Peixoto. Duas pessoas. `rita.jpeg` é
resíduo e será removido do `/public`.

---

## 10. Verificação antes do deploy

| Verificação | Critério |
|---|---|
| Typecheck e build | Limpos |
| **Evento de conversão** | GTM Preview confirma page load em `/whatsapp` |
| **Classes GTM** | `.redirect-*` presentes em todos os CTAs |
| **Redirects 301** | Cada URL antiga resolvida manualmente |
| Sitemap | Completo, sem 404 |
| Structured data | Rich Results Test verde |
| Lighthouse | Landing, uma especialidade, um post |
| Acessibilidade | Contraste AA, caminho de teclado, reduced-motion |
| **Revisão clínica** | Vyvyan e Tainá aprovam em URL de preview |

Deploy em produção é decisão do Gustavo. Não será disparado pelo agente.

---

## 11. Riscos

| Risco | Severidade | Mitigação |
|---|---|---|
| Conversão do Ads quebra em silêncio | Alta | §3.1 + verificação em GTM Preview |
| Queda de ranking pela troca de URL | Média | 301s + sitemap + Search Console. Oscilação de 2–4 semanas é esperada e normal — não reverter por causa dela |
| Conteúdo clínico ao ar sem revisão | Alta | Gate rígido em §10 |
| Mobile sem comp de referência | Média | Sinalizado; revisão explícita do layout mobile |

---

## 12. Questões em aberto

1. **Autoria dos posts.** E-E-A-T exige assinatura nomeada. AVC → Vyvyan
   (neurofuncional) e Câncer + Paliativos → Tainá (oncológica) são atribuições
   naturais. **DPOC, Cardiovasculares e Incontinência Urinária não têm autor
   óbvio** — nenhuma das duas tem residência nessas áreas. Padrão provisório:
   co-assinatura das duas. Precisa de decisão delas; não será inventado.
2. **Texto do design é rascunho.** Toda afirmação factual — a citação sobre não
   atender plano de saúde, "1:1", "100% das aulas com fisioterapeuta", "8
   especialidades" — precisa de confirmação antes do lançamento.
3. **Dados de contato.** Telefone, e-mail e os dois endereços foram assumidos
   como atuais a partir do repositório. Confirmar.
4. **Horário de funcionamento.** Necessário para o `openingHoursSpecification`
   das páginas de unidade. Não existe no repositório hoje.
