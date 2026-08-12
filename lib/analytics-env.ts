/**
 * Decide se o GTM e o GA4 devem carregar nesta build.
 *
 * Existe para que os deploys de preview da Vercel não meçam nada. O container
 * GTM-NNBD3887 tem a tag de conversão do Google Ads, que dispara em clique cujo
 * Click URL contém `/whatsapp`. Sem esta trava, a Vyvyan e a Tainá revisando o
 * site num preview registrariam conversões de Lead de verdade, e o Smart Bidding
 * passaria a otimizar em cima de cliques que nunca foram paciente.
 *
 * A conferência é pelo "preview" e não pelo "production" de propósito. Se a
 * variável sumir ou a Vercel mudar o nome dela, o site volta a medir como mede
 * hoje, em vez de parar de medir. Dos dois erros possíveis, medir num preview é
 * barato e some ao republicar; a conversão do Ads morrer em silêncio custa
 * dinheiro por dia e ninguém percebe.
 *
 * @param env valor de `process.env.VERCEL_ENV`: "production" | "preview" |
 *   "development" nos deploys da Vercel, e `undefined` fora dela.
 */
export function shouldLoadAnalytics(env: string | undefined): boolean {
  return env !== "preview";
}
