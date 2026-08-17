import { WhatsAppLink } from "@/components/WhatsAppLink";

/**
 * Botão flutuante do WhatsApp.
 *
 * Por que continua verde: é o elemento de conversão do site, e o círculo verde
 * do WhatsApp é a affordance de "fala com a gente agora" mais reconhecida no
 * Brasil. Recolorir para a paleta ficaria mais bonito e provavelmente
 * converteria pior, sem jeito de medir o quanto. As diretrizes de marca da Meta
 * também pedem que a marca não seja recolorida.
 *
 * O que mudou: o verde do WhatsApp tem só 1,84:1 contra o creme da página e
 * 1,70:1 contra o creme escuro, abaixo dos 3:1 que a WCAG 1.4.11 pede para o
 * contorno de um componente. Sem contorno, a borda do botão é difícil de achar
 * para quem tem sensibilidade a contraste reduzida — parte relevante dos
 * pacientes desta clínica.
 *
 * O anel usa `ink` (#2C3A3D) porque foi a única cor testada que passa dos 3:1
 * contra os dois fundos claros (10,96 e 10,14) E contra o próprio verde (5,95).
 * Anel branco não serve: branco contra creme dá 1,08:1. Nas seções escuras o
 * anel some no fundo, mas ali o próprio verde já faz 5,95:1 contra o ink.
 *
 * Resíduo conhecido e aceito: o glifo branco sobre verde dá 1,98:1. É a marca
 * do WhatsApp como a Meta a define; corrigir exigiria descaracterizá-la. O nome
 * acessível do botão vem do `aria-label`, não do desenho.
 */
export function WhatsAppFab() {
  return (
    <WhatsAppLink
      service="geral"
      from="fab"
      variant="bare"
      ariaLabel="Falar no WhatsApp"
      className="fixed bottom-6 right-5 z-40 block h-14 w-14 drop-shadow-lg transition-transform hover:scale-105 motion-reduce:transition-none motion-reduce:hover:scale-100 md:bottom-8 md:right-8"
    >
      <svg
        viewBox="0 0 56 56"
        width={56}
        height={56}
        role="img"
        aria-hidden="true"
        focusable="false"
        className="pointer-events-none"
      >
        <circle cx="28" cy="28" r="26" fill="#25D366" stroke="#2C3A3D" strokeWidth="2" />
        <g transform="translate(14 14) scale(1.1667)" fill="#FFFFFF">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347" />
          <path d="M12.051 21.785h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413" />
        </g>
      </svg>
    </WhatsAppLink>
  );
}
