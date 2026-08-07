# Verificação do redesign — checklist de pré-produção

Rodar contra a URL de preview da Vercel, antes de promover para produção —
com a exceção da seção "Conversão", que tem um bloco específico para rodar só
depois do deploy em produção (ver abaixo o motivo). Este documento é o
resultado dos 22 tarefas do redesign — reúne o que precisa de confirmação
manual (o que testes automatizados não cobrem) e o que ficou pendente de
decisão da clínica.

## ATENÇÃO — mnemônico do AVC (SAMU): confirmar antes de publicar

A Cartilha AVC ensina o mnemônico de reconhecimento de AVC assim:

- S — Sorria (peça para sorrir)
- A — Abrace (peça para levantar os dois braços)
- M — **Mímica facial** (peça para repetir uma frase simples)
- U — Urgente (ligue 192)

O item M é internamente inconsistente: "mímica facial" descreve movimento do
rosto, mas a instrução testa **fala** ("repetir uma frase simples"). A versão
mais difundida no Brasil usa M de Música/Mensagem (fala). O texto foi mantido
**verbatim** no site — ninguém neste projeto edita o conteúdo clínico da
clínica — mas como alguém pode agir sobre isso numa emergência real, Vyvyan e
Tainá precisam confirmar a redação antes da página ir ao ar.

## Conversão — bloqueia o lançamento

**A tag de conversão do Ads só pode ser verificada em produção, não na URL de
preview.** A regra do GTM que sobrevive ao redesign é `Click URL contains
https://www.vytafisioterapia.com.br/whatsapp` — ela casa contra o host de
produção, literalmente. Numa URL `*.vercel.app` o link do WhatsApp resolve
para o host do preview (ex.: `https://ptclinic-git-xyz.vercel.app/whatsapp`),
que nunca contém `www.vytafisioterapia.com.br`. Rodar esse teste no preview
não é "menos confiável" — é estruturalmente incapaz de passar, e um tester que
tentar vai reportar uma falha falsa numa tag que na verdade está correta.

O que dá para verificar no preview é só o comportamento funcional do redirect
(independe de host):

- [ ] Clicar em "Agendar" no hero, no FAB, no nav, no menu mobile e numa
      página de especialidade → confirmar que cada um navega para `/whatsapp`
- [ ] Confirmar o redirect final para `wa.me/message/FJNBBFEBI6V5O1`

### Verificar em produção, imediatamente após o deploy

Só dá para confirmar a conversão do Ads depois que o domínio de produção
(`www.vytafisioterapia.com.br`) está servindo o build novo:

- [ ] GTM Preview conectado à URL de produção
- [ ] Clicar em "Agendar" no hero → confirmar page load em `/whatsapp` no GTM
- [ ] Confirmar que a tag `Contato por WhatsApp` (label `ak4xCLuKhcwYEM3nsM4p`) disparou
- [ ] Repetir a partir do FAB, do nav, do menu mobile e de uma página de especialidade
- [ ] Confirmar o redirect final para `wa.me/message/FJNBBFEBI6V5O1`

Se algo falhar aqui — depois do deploy, contra o host de produção — aí sim é
um problema real na tag, não um artefato do host de preview.

### Achado: uma segunda ação de conversão do Google Ads vai parar de registrar

O contêiner GTM tem duas tags de conversão `__sp`:

- **Principal** (label `ak4xCLuKhcwYEM3nsM4p`) — dispara em 9 regras, incluindo
  a regra robusta `Click URL contains /whatsapp`. Essa sobrevive ao redesign
  e é a que `e2e/gtm-classes.spec.ts` guarda automaticamente.
- **Secundária** (label `ZopfCK6b_ssYEM3nsM4p`) — dispara a partir de exatamente
  uma regra: clique em elemento com as classes `text-slate-50 w-8 h-8` (os
  ícones antigos da navbar). Nenhum elemento do redesign carrega essas
  classes, então essa ação de conversão para de registrar 100% no lançamento.

**A clínica precisa decidir o que essa segunda ação media** (ela é distinta da
principal — dois cliques do mesmo usuário no mesmo botão poderiam estar sendo
contados como duas conversões diferentes hoje) e se algo equivalente precisa
ser recriado no GTM/Ads para o site novo.

### Achado: cinco outras regras do GTM para a conversão principal também vão morrer

Presas ao DOM do Pages Router antigo (`div#__next`, botões daisyUI
`btn.btn-primary`) e às classes antigas do botão flutuante
(`fixed bottom-10 right-5 md:bottom-15 md:right-15`):

1. `gtm.click` + element path `HTMLButtonElement: ...div#__next...btn.btn-primary`
2. `gtm.click` + element path `HTMLImageElement: ...a.fixed.bottom-10.right-5`
3. `gtm.click` + element path `SVGPathElement: ...div#__next...`
4. `gtm.click` + elementClasses `fixed bottom-10 right-5 md:bottom-15 md:right-15`
5. `gtm.click` + click text contains `AGENDAR`

**Inofensivo** — todas duplicam a regra de Click URL que sobrevive, e o Ads
conta uma conversão por clique, não uma por regra disparada. Mas é peso morto
no contêiner. Recomendação: limpar essas 5 regras (mais a `gtm.init + Page URL
contains /whatsapp`, que já estava morta antes do redesign) na próxima
manutenção do GTM.

## GA4 — bloqueia o lançamento

**Confirmado empiricamente em 07/08/2026**, baixando e decodificando o container
público `https://www.googletagmanager.com/gtm.js?id=GTM-NNBD3887`:

| Procurado no container | Encontrado |
|---|---|
| Qualquer measurement ID `G-…` | **nenhum** |
| `G-V5YCCVYQRR` | 0 ocorrências |
| `G-VSSZW88J6E` | 0 ocorrências |
| Tags de GA4 (`__googtag` / `__gaawc` / `__gaawe`) | **nenhuma** |

O container só tem: 12 click listeners (`__cl`), 3 tags do Google Ads (`__sp`),
1 conversion linker (`__gclidw`) e 5 instâncias de um template custom
(provavelmente o Pixel da Meta).

O site antigo carregava o `gtag.js` direto pelo `pages/_app.tsx`. Esse código
saiu na migração. **Se nada for feito, o GA4 para de receber dados no momento do
deploy** — sem erro em lugar nenhum.

A tela "Your Google tag" do Google mostra o tag saudável mandando dados para
`www.vytafisioterapia.com.br` (GA4) e `CA - VYTA Fisioterapia` (Ads). Isso é a
*configuração* do tag, não a instalação: hoje ele chega ao navegador porque o
site **antigo** ainda o carrega.

Escolher um dos dois caminhos antes de promover:

- [ ] **No GTM** (recomendado): criar uma tag *Google Tag* com o ID
      `G-V5YCCVYQRR` (ou `GT-K4TFJ4K`), acionador *Initialization — All Pages*.
      Nada muda no repositório.
- [ ] **No código**: adicionar `<GoogleAnalytics gaId="G-V5YCCVYQRR" />` do
      `@next/third-parties` ao lado do `<GoogleTagManager>` em `app/layout.tsx`.

- [ ] Depois do deploy, confirmar em Tempo Real do GA4 que a propriedade voltou
      a receber sessões.

## URLs — bloqueia o lançamento

- [ ] Abrir cada uma das 8 URLs antigas `/speciality/*` e confirmar 308
- [ ] Confirmar que nenhuma retorna 404
- [ ] `/sitemap.xml` lista 20 URLs e nenhuma delas é `/whatsapp`
- [ ] `/robots.txt` aponta para o sitemap e desautoriza `/whatsapp`

## SEO

- [ ] Rich Results Test em `/`, `/unidades/consolacao`, uma especialidade e um post
- [ ] Confirmar `Physiotherapy`, `FAQPage`, `BreadcrumbList` e `Article` sem erro
      (nota: `FAQPage` não gera rich result no Google desde ago/2023 para sites
      fora de saúde/governo autoritativos — o markup fica por ser barato e
      correto, mas não espere o snippet de FAQ no SERP)
- [ ] Cada página tem title e meta description próprios
- [ ] Lighthouse ≥ 90 em Performance e 100 em SEO na landing

## Conteúdo — bloqueia o lançamento

Gustavo revisa tudo com Vyvyan e Tainá antes do lançamento. Nenhum texto
clínico foi reescrito ou suavizado durante o build — o que não vinha das
fontes da clínica foi cortado, não inventado.

- [ ] Vyvyan e Tainá revisaram todo o texto da landing
- [ ] Revisaram as 7 páginas de especialidade
- [ ] Revisaram os 6 posts do blog
- [ ] Confirmaram a citação sobre não atender plano de saúde
- [ ] Confirmaram "1:1", "100% das aulas com fisioterapeuta" e "8 especialidades"
- [ ] Resolveram as 5 perguntas abertas listadas abaixo (mnemônico do AVC incluído)
- [ ] Informaram em que DIAS vale o horário das 7h às 20h (preencher `openingHours` em `content/units.ts`)

## Perguntas abertas para a clínica

Levantadas durante o build. **Cinco foram respondidas pelo Gustavo em 07/08/2026
e já estão aplicadas no código** (ver "Respondidas" no fim desta seção). As que
sobram precisam de resposta da Vyvyan e da Tainá antes de publicar.

1. **Dias da semana do horário de funcionamento.** O horário confirmado é das
   **7h às 20h**, mas falta saber em que dias. Sábado abre? `units.openingHours`
   segue `null` até isso ser respondido, e o `unitSchema` omite
   `openingHoursSpecification` em vez de inventar. Horário errado no schema
   `LocalBusiness` contradiz o perfil do Google Business, que é pior do que não
   ter horário nenhum.
2. **Toda alegação factual no texto de marketing** (hero, seções da landing,
   pull quote). É rascunho do comp de design, não veio das fontes clínicas, e
   precisa de sign-off antes de publicar. Inclui a citação sobre não atender
   plano de saúde, o "1:1", os "100% das aulas com fisioterapeuta" e as "8
   especialidades".
3. **Inconsistência na especialidade respiratória.** Foi renomeada para
   "Fisioterapia Respiratória" (sem qualificador de idade) pela tabela de
   identidade do plano, mas o texto verbatim de "como funciona" ainda diz "A
   fisioterapia respiratória PARA ADULTOS". A página fica inconsistente sobre se
   atende fisioterapia respiratória pediátrica. Não foi resolvido editando o
   texto clínico verbatim — a clínica decide.
4. **Mnemônico SAMU do AVC** — ver aviso destacado no topo deste documento.
   Segundo, de menor gravidade: na Cartilha Cardio, "Colesterol alto" está
   listado em "como saber se tenho" (detecção) em vez de nos fatores de risco.
   Também mantido verbatim.
5. **Alegações não sourced na copy do Pilates.** `PilatesSection.tsx` (copy de
   marketing da landing) afirma que "quem corrige a sua postura conhece a sua
   lesão, SABE O QUE A SUA CIRURGIA LIMITOU" e chama o Pilates de "transição
   natural para quem sai da reabilitação". Nenhuma das duas rastreia até
   `content/specialities.ts`. As mesmas afirmações foram **cortadas** do FAQ de
   `/pilates` (respostas de FAQ são tratadas como orientação clínica), mas
   permanecem na copy de marketing, que é rascunho e já está sob revisão. A
   alegação sobre cirurgia é uma afirmação operacional sobre como as aulas são
   conduzidas — Vyvyan e Tainá precisam confirmar que é verdadeira.

**Item adicional relacionado:** as páginas de unidade listam todas as
especialidades como disponíveis nas **duas** unidades. Se os serviços diferem
por unidade, `Unit` (em `content/units.ts`) precisa de um campo
`specialities: string[]`. Nada foi inventado — isto é uma bandeira, não uma
correção.

### Respondidas em 07/08/2026 — já aplicadas no código

- **CEPs.** Consolação `01307-002`, Fradique `05416-000`. Gravados em
  `content/units.ts`; o `LocalBusiness` agora emite `postalCode`.
- **Residência da Tainá.** "Hospital AC Camargo Cancer Center" — confirma a
  grafia que já estava publicada. Nada mudou.
- **Autoria dos posts de DPOC, Cardiovasculares e Incontinência.** Tainá. Os
  três `.mdx` foram atualizados e os comentários de "AUTORIA PROVISÓRIA"
  removidos. Os seis posts agora têm autor nomeado com CREFITO.
- **Telefone, e-mail e os dois endereços** estão atuais. Confirmado.
- **Propriedade GA4.** Só a `G-V5YCCVYQRR` segue em uso; a `G-VSSZW88J6E` saiu
  de cena. Ver a seção "GA4 — bloqueia o lançamento" acima.

## Itens técnicos adiados (não bloqueiam o lançamento)

Registrados durante o build; nenhum impede o deploy, mas valem uma passada
numa manutenção futura.

**Performance / build**
- Aviso benigno `LRUCache: calculateSize returned 0` no log do servidor a
  cada request de `/whatsapp` (visível também nos logs do `test:e2e`). Causa
  raiz: corpo de 0 bytes faz o cálculo de tamanho do cache de prerender
  falhar: o erro é capturado e logado na escrita, engolido na leitura. Efeito
  é um cache miss silencioso — `/whatsapp` reexecuta a cada request e sempre
  retorna um 307 correto. Só vale corrigir se o ruído no log incomodar;
  forçar `dynamic` trocaria a saída estática servível por CDN.
- `Footer`'s `new Date().getFullYear()` é calculado em build time numa rota
  estática — o ano do © fica desatualizado até o próximo deploy.
- `getPostMeta` relê e reparseia os 6 arquivos MDX do disco a cada chamada.
  Irrelevante com 6 posts; revisitar se o blog crescer bastante.
- `vitest.config.ts` usa sintaxe ESM num arquivo carregado como CommonJS —
  gera um aviso não fatal em todo `npm test`. Resolve renomeando para
  `vitest.config.mts`.

**Contraste — margens estreitas a observar** (não mexer nesses tokens sem
recalcular o contraste):
- `text-accent-deep` sobre `bg-surface-alt` (Eyebrow): 4.51:1 — passa por
  0,28%.
- `accent` sobre `bg-surface` (Footer, `UnidadesSection`): 4,65:1 — passa por
  0,15.

**Cobertura de teste**
- Testes do `WhatsAppLink` exercitam só a variante `primary`; um typo em
  `VARIANTS.warm/teal/bare` não seria pego.
- Nenhum teste dispara uma entrada de `IntersectionObserver` para confirmar
  que `data-revealed` vira `"true"` no componente `Reveal`. O caminho de
  acessibilidade (reduced-motion, sem JS) está coberto; o caminho feliz não.
- O `Sheet` (menu mobile, `components/ui/sheet.tsx`, sobre
  `@radix-ui/react-dialog`) não tem `SheetDescription`/`aria-describedby` —
  gera um aviso dev-only do Radix, não visível ao usuário.
- `sheet.tsx` exporta `SheetClose`, sem nenhum consumidor.

**Riscos condicionais** (hoje inalcançáveis; watch-list para tarefas futuras
que reusem esses componentes):
- `SectionHeading` tem tom claro por padrão e não herda o tom de uma
  `Section` escura — se algum dia for aninhado numa `Section tone="ink"`,
  renderiza texto escuro sobre fundo escuro. Nenhuma tarefa faz isso hoje.
- `Prose` tem cores de texto fixas para modo claro — ficaria ilegível num
  fundo escuro. Usado uma única vez hoje, dentro de uma `Section` clara.
- `formatPhone` (em `content/clinic.ts`) remove um prefixo "55" pela posição
  do dígito; um número no formato nacional cujo DDD seja literalmente 55
  (Santa Maria/Passo Fundo, RS) seria cortado errado. Inalcançável hoje — o
  único número usado é +5511989172311 (DDD 11). Revisitar se um segundo
  telefone for adicionado.

## Depois do deploy

- [ ] Submeter o sitemap no Search Console
- [ ] Solicitar indexação das páginas de unidade
- [ ] Acompanhar conversões no Ads por 7 dias — vigiar especificamente a
      segunda ação de conversão (`ZopfCK6b_ssYEM3nsM4p`) parar de registrar
- [ ] Oscilação de ranking por 2–4 semanas é esperada — não reverter
