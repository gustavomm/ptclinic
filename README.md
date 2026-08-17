# Vyta Fisioterapia e Pilates

Site da clínica — Next.js 15 (App Router), TypeScript, Tailwind CSS.

## Desenvolvimento

    npm install
    npm run dev

## Verificação

    npm run typecheck   # tipos
    npm test             # unidade (Vitest) — 68 testes
    npm run build         # build de produção — 24 rotas pré-renderizadas
    npm run test:e2e      # E2E (Playwright, roda build + start) — 68 testes

Rode os quatro antes de qualquer merge ou deploy.

Os números acima são de 17/08/2026 e servem de linha de base: se `npm test`
voltar com menos testes do que isto, alguma coisa deixou de rodar. Nada os
verifica sozinho — não há CI neste repositório, então os quatro comandos só
acontecem quando alguém lembra.

## Restrições que não podem quebrar

Estas propriedades sustentam a conversão do Google Ads (R$55,50/dia de verba) e
a integridade dos dados de contato. Uma falha aqui é **silenciosa** — o Ads
continua cobrando e reportando zero conversões.

- `/whatsapp` (`app/whatsapp/`) é o evento de conversão do Google Ads. A regra
  do GTM é `event = gtm.click AND Click URL contains
  "https://www.vytafisioterapia.com.br/whatsapp"`. Não mude essa URL.
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
- `e2e/conversion.spec.ts` — redirect de `/whatsapp` para o deep link do
  WhatsApp.
- `e2e/redirects.spec.ts` — redirects 308 das URLs antigas `/speciality/*`.
- `e2e/accessibility.spec.ts` — axe (wcag22aa), h1 único, `lang`, alt text.
- `e2e/motion-and-viewport.spec.ts` — `prefers-reduced-motion`, sem JS,
  overflow horizontal em 375/768/1440px, menu mobile.

## Checklist de pré-produção

Antes de promover a URL de preview para produção, siga
`docs/redesign-verificacao.md`.
