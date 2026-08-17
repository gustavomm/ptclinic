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

Piora com o teste de "Sorria", logo acima, que já cobre o rosto: quem decorar as
quatro palavras — que é para o que serve um mnemônico — fica com duas checagens
de rosto, uma de braço, e nenhuma de fala.

- [ ] Vyvyan e Tainá confirmaram a redação do item M
- [ ] **O post do AVC ganhou uma nota de fecho.** Cinco dos seis posts terminam
      com um bloco "Importante:"; o do AVC é o único sem nenhum, e é justamente
      o que manda um leigo agir numa emergência. A redação é das duas, como o
      resto do conteúdo clínico

Aviso relacionado, no post de oncologia: ele traz idades de rastreamento (PSA e
toque retal a partir dos 40, Papanicolau anual após os 25, colonoscopia aos 45)
que estão fora do escopo da fisioterapia e não batem com a orientação do INCA e
do Ministério da Saúde. Também mantido verbatim, e também precisa do sign-off
das duas antes de publicar.

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
- [ ] Clicar em "Agendar" no hero → confirmar o evento **`gtm.click`** na página
      de origem, com `Click URL` = `https://www.vytafisioterapia.com.br/whatsapp`
- [ ] Confirmar que a tag `Contato por WhatsApp` (label `ak4xCLuKhcwYEM3nsM4p`) disparou
- [ ] Repetir **a partir do FAB**, do nav, do menu mobile e de uma página de
      especialidade. O FAB é o que mais importa: no site antigo ele abria em
      aba nova, então a página de origem continuava viva; agora navega na mesma
      aba, e o beacon precisa sair antes do unload
- [ ] Confirmar o redirect final para `wa.me/message/FJNBBFEBI6V5O1`
- [ ] Abrir o site pelo domínio **sem** `www` e confirmar que ele redireciona
      para `www`. A regra do GTM casa a string literal com `www.`; se alguma
      campanha ou algum backlink servir o apex, o clique não conta e o Ads
      continua gastando

> **Não procure um page load em `/whatsapp`.** Essa versão do checklist pedia
> isso e era impossível de satisfazer: `app/whatsapp/route.ts` responde 307 com
> corpo vazio, então não existe página, GTM nem gtag naquela URL. Nunca existiu
> — o `pages/whatsapp.tsx` antigo usava `nextjs-redirect`, que em navegação
> direta faz `res.writeHead(301)` no servidor e também não renderizava nada. A
> conversão sempre foi contada pelo clique na página de origem.

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

### Resolvido no código em 17/08/2026 — não fazer no GTM

Havia dois caminhos aqui e o do código foi tomado: `app/layout.tsx` já renderiza
`<GoogleAnalytics gaId="G-V5YCCVYQRR" />` do `@next/third-parties`, ao lado do
`<GoogleTagManager>`.

> **Não criar a tag *Google Tag* no container.** Esta seção pedia isso e a
> marcava como recomendada. Fazer as duas coisas mede em dobro: sessões
> infladas, engajamento pela metade, e logo na janela de dados limpos de que a
> decisão de verba depende. O aviso já está em `app/layout.tsx`, num lugar que
> quem estiver mexendo no GTM não vai ler — por isso está aqui também.

Se um dia a tag do Google entrar no container, tirar a linha do
`GoogleAnalytics` do `layout.tsx` no mesmo dia.

- [ ] Depois do deploy, confirmar em Tempo Real do GA4 que a propriedade voltou
      a receber sessões.

## URLs — bloqueia o lançamento

- [ ] Abrir cada uma das 8 URLs antigas `/speciality/*` e confirmar 308
- [ ] Confirmar que nenhuma retorna 404
- [ ] `/sitemap.xml` lista 19 URLs e nenhuma delas é `/whatsapp`
      (5 fixas + 6 especialidades + 2 unidades + 6 posts; eram 20 com a
      drenagem linfática, que saiu em 17/08/2026)
- [ ] `/robots.txt` aponta para o sitemap e desautoriza `/whatsapp`
- [ ] `/speciality/drenagem-linfatica` cai em `/especialidades` e não em 404 —
      a página própria deixou de existir e o redirect foi reapontado

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

- [x] Vyvyan e Tainá revisaram todo o texto da landing e das especialidades —
      ciclo de 17/08/2026, 93 linhas aplicadas. Ver `docs/revisao/README.md`
- [ ] **Revisaram os 6 posts do blog.** O ciclo de revisão *não* cobriu o blog,
      e `content/blog/` não existe no `master`: publicar é a primeira vez que
      esses seis textos vão ao ar, indexados, sob o CREFITO das duas. É o maior
      item aberto desta lista
- [ ] Confirmaram a citação sobre não atender plano de saúde
- [ ] Confirmaram as três chamadas do bloco de números da home, que **mudaram**
      na revisão: hoje são `1 : 1`, `Segurança` e `A domicílio`
      (`components/sections/Manifesto.tsx`). O "100% das aulas" e as
      "8 especialidades" não existem mais e não precisam de sign-off
- [ ] **Confirmaram o atendimento em domicílio.** A clínica confirmou em
      17/08/2026 que o serviço existe e que o preço não pode ir para o site.
      Falta a área de cobertura: hoje o "Também em/a domicílio" aparece só nas
      descrições do Google de quatro áreas, e nenhuma página explica o serviço.
      A página dedicada ficou para depois
- [ ] Resolveram as perguntas abertas listadas abaixo (mnemônico do AVC incluído)
- [x] Informaram os DIAS e horários — Seg a Sex, sem sábado; Consolação até 21h,
      Pinheiros até 20h. Aplicado em `content/units.ts` em 17/08/2026

## Perguntas abertas para a clínica

Levantadas durante o build. **Cinco foram respondidas pelo Gustavo em 07/08/2026
e já estão aplicadas no código** (ver "Respondidas" no fim desta seção). As que
sobram precisam de resposta da Vyvyan e da Tainá antes de publicar.

1. ~~**Dias da semana do horário de funcionamento.**~~ **Respondida em
   17/08/2026.** Seg a Sex, não abre sábado, e o fechamento é por unidade:
   Consolação (Frei Caneca) às 21h, Pinheiros (Fradique Coutinho) às 20h. Já
   está em `content/units.ts` e sai no `openingHoursSpecification`. Conferir
   contra o perfil do Google Business das duas unidades, que é o lugar onde uma
   divergência aparece para o paciente.
2. **Toda alegação factual no texto de marketing** (hero, seções da landing,
   pull quote). É rascunho do comp de design, não veio das fontes clínicas, e
   precisa de sign-off antes de publicar. A revisão de 17/08/2026 reescreveu boa
   parte, então o que falta conferir são as chamadas atuais — `1 : 1`,
   `Segurança`, `A domicílio` — e a citação sobre não atender plano de saúde.
3. ~~**Inconsistência na especialidade respiratória.**~~ **Respondida em
   17/08/2026: a clínica não atende crianças.** O "para adultos" do texto
   verbatim da respiratória estava certo, e o que destoava era a neurofuncional,
   que anunciava "crianças com atraso no desenvolvimento motor" em `forWhom`.
   Esse item saiu de `content/specialities.ts` e da fixture congelada. Era a
   mesma pergunta que a revisão levantou na célula `specialities-08`.
4. **Mnemônico SAMU do AVC** — ver aviso destacado no topo deste documento.
   Segundo, de menor gravidade: na Cartilha Cardio, "Colesterol alto" está
   listado em "como saber se tenho" (detecção) em vez de nos fatores de risco.
   Também mantido verbatim.
5. **Alegações não sourced na copy do Pilates — metade resolvida.** A afirmação
   de que quem conduz a aula "sabe o que a sua cirurgia limitou" foi **cortada**
   e o corte está registrado em `components/sections/PilatesSection.tsx`. Segue
   aberta a outra: o Pilates como "transição natural para quem sai da
   reabilitação" (`PilatesSection.tsx`, lista de pontos), que não rastreia até
   `content/specialities.ts` e é uma afirmação operacional sobre como a clínica
   encaminha alta — Vyvyan e Tainá precisam confirmar.

**Item adicional relacionado:** as páginas de unidade listam todas as
especialidades como disponíveis nas **duas** unidades. Se os serviços diferem
por unidade, `Unit` (em `content/units.ts`) precisa de um campo
`specialities: string[]`. Nada foi inventado — isto é uma bandeira, não uma
correção.

### Respondidas em 17/08/2026 — já aplicadas no código

- **A clínica não atende crianças.** O item sobre atraso no desenvolvimento
  motor saiu do `forWhom` da neurofuncional e da fixture congelada. Resolve
  também a pergunta 3.
- **Horários.** Seg a Sex, sem sábado. Consolação até 21h, Pinheiros até 20h.
- **Atendimento em domicílio existe**, o preço não pode ir para o site, e a
  página dedicada ficou para depois. Falta a área de cobertura.
- **Os erros de digitação da revisão foram corrigidos**: `fisiotrapeuta` no
  cartão do Pilates, `técnias` e `terapeuticos` no FAQ do Pilates, a crase de
  "À domicílio" no bloco de números da home, e o "em" que faltava em "chegar em
  melhores condições" na pré e pós-cirúrgica. Mais dois no blog:
  `desenvolve-se` no post de cardiovasculares e "o DPOC" onde o próprio texto
  usa "a DPOC" quatro vezes.

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
