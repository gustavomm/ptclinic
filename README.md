# Vyta Fisioterapia e Pilates

Site da clínica — Next.js 15 (App Router), TypeScript, Tailwind CSS.

## Desenvolvimento

    npm install
    npm run dev

## Verificação

    npm run typecheck   # tipos
    npm test             # unidade (Vitest) — 213 testes
    npm run build         # build de produção — 26 páginas estáticas; só /whatsapp é dinâmica
    npm run test:e2e      # E2E (Playwright, roda build + start) — 76 testes

Rode os quatro antes de qualquer merge ou deploy.

Os números acima são de 14/10/2026 e servem de linha de base: se `npm test`
voltar com menos testes do que isto, alguma coisa deixou de rodar. Nada os
verifica sozinho — não há CI neste repositório, então os quatro comandos só
acontecem quando alguém lembra.

## Restrições que não podem quebrar

Estas propriedades sustentam a conversão do Google Ads (R$55,50/dia de verba) e
a integridade dos dados de contato. Uma falha aqui é **silenciosa** — o Ads
continua cobrando e reportando zero conversões.

- `/whatsapp` (`app/whatsapp/`) é o evento de conversão do Google Ads. No
  GTM, as tags `Contact WhatsApp` (conversão do Ads) e `Meta ADS - Contact
  WhatsApp` disparam só pelo acionador `Clique WhatsApp (link)`: *Click – Just
  Links*, `Click URL contains /whatsapp`, sem host, então vale para qualquer
  domínio onde o GTM carregue, inclusive localhost. Publicado na versão 10 do
  container, em 14/10/2026. Até ali a conversão do Ads só contava clique cujo
  texto tivesse "Agendar": o botão flutuante, o rodapé e os demais botões sem
  essa palavra levavam ao WhatsApp sem virar conversão. Não mude essa URL.
  A conversão conta no **clique**, na página de origem; por isso `/whatsapp`
  é um redirect de corpo vazio (`302`, `no-store`), sem página, sem GTM.
- `/whatsapp` leva o `lead_code` para a mensagem do WhatsApp. O clique
  (`lib/tracking.ts`) gera o código, empurra `whatsapp_click` para o
  dataLayer e deixa um cookie curto (`vyta_wa`, só em `/whatsapp`) com o
  código e a origem da visita (`lib/attribution.ts`). A rota lê o cookie,
  redireciona para `wa.me/<número de content/clinic.ts>?text=...` e grava a
  linha na planilha depois da resposta. Sem cookie, redireciona do mesmo
  jeito com um código `VY-X…` e não grava linha. No GTM, `whatsapp_click`
  é evento do GA4 — nunca uma segunda conversão do Google Ads.
- A planilha só recebe linhas quando `VERCEL_ENV` é `production` **e**
  `LEAD_WEBHOOK_URL`/`LEAD_WEBHOOK_SECRET` existem — configure os dois só no
  ambiente Production da Vercel. Preview e build local não escrevem; o
  `test:e2e` zera as variáveis no servidor que ele sobe. Exceção: um `.env`
  local puxado de produção (`vercel env pull --environment=production`) traz
  as três, e aí um servidor local escreve de verdade, inclusive se o
  Playwright reaproveitar um que já estava rodando. Não puxe produção para o
  `.env.local`. O outro lado do contrato é `scripts/leads-apps-script.gs`.
- O `lead_code` não é único sozinho (5 caracteres): ligue a conversa à linha
  da planilha pelo código **e** pela data.
- As classes `.redirect-whatsapp`, `.redirect-phone`, `.redirect-email` e
  `.redirect-instagram` são lidas pelo GTM em todo tipo de página.
  `e2e/gtm-classes.spec.ts` guarda isso — roda em toda página, valida as
  quatro classes e confirma que todo `.redirect-whatsapp` aponta para
  `/whatsapp`. Não relaxe essas asserções para fazer uma rota passar; se uma
  rota genuinamente não tem uma classe, isso é um achado a reportar, não um
  motivo para afrouxar o teste.
- Todo CTA de WhatsApp usa `components/WhatsAppLink.tsx`. Nunca link direto
  para `wa.me` ou para `/whatsapp` fora desse componente.
- Dados de contato e endereços vivem em `content/clinic.ts` e
  `content/units.ts`. São a fonte única do NAP (nome/endereço/telefone) e
  alimentam o JSON-LD (`lib/schema.ts`). Não duplique esses dados em outro
  lugar do código.

## Conteúdo

- Posts do blog: `content/blog/*.mdx`.
- Especialidades: `content/specialities.ts`.
- Unidades: `content/units.ts`.
- Dados gerais da clínica: `content/clinic.ts`.
- Equipe: `content/team.ts`.

## Testes

- `e2e/gtm-classes.spec.ts` — guarda de conversão (classes GTM + destino do
  `/whatsapp`).
- `e2e/conversion.spec.ts` — redirect de `/whatsapp` para o número da
  clínica, temporário, sem cache, corpo vazio, com código na mensagem.
- `e2e/lead-code.spec.ts` — clique → dataLayer → `/whatsapp` → mensagem com
  o mesmo `lead_code`, inclusive pelo link do rodapé. Bloqueia toda requisição
  do navegador fora de localhost: com o GTM carregado, um clique de teste
  viraria conversão de verdade no Ads.
- `components/__tests__/whatsapp-cta-guard.test.ts` — nenhum link cru para
  `/whatsapp` (JSX, markdown ou URL absoluta) fora do `WhatsAppLink`, e
  nenhum link direto para `wa.me` fora de `lib/whatsapp.ts`.
- `e2e/redirects.spec.ts` — redirects 308 das URLs antigas `/speciality/*`.
- `e2e/accessibility.spec.ts` — axe (wcag22aa), h1 único, `lang`, alt text.
- `e2e/motion-and-viewport.spec.ts` — `prefers-reduced-motion`, sem JS,
  overflow horizontal em 375/768/1440px, menu mobile.

## Checklist de pré-produção

Antes de promover a URL de preview para produção, siga
`docs/redesign-verificacao.md`.
