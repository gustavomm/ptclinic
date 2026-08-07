"use client";

import { trackWhatsAppClick } from "@/lib/tracking";

const VARIANTS = {
  primary:
    "bg-accent-deep text-white hover:bg-accent-deep/90",
  warm: "bg-accent-warm text-ink-deep hover:bg-accent-warm/90",
  teal: "bg-accent text-white hover:bg-accent/90",
  bare: "",
} as const;

export function WhatsAppLink({
  service,
  from,
  variant = "primary",
  className = "",
  ariaLabel,
  children,
}: {
  service: string;
  from: string;
  variant?: keyof typeof VARIANTS;
  className?: string;
  /**
   * Nome acessível do link. Obrigatório quando `children` não tem texto — o
   * FAB, por exemplo, só contém um SVG. Sem isto o link fica sem nome nenhum
   * para leitor de tela, e o axe reprova (`link-name`) em todas as rotas.
   *
   * Existe como prop explícita, e não via spread: passar `aria-label` solto
   * neste componente compila sem erro e é descartado em silêncio.
   */
  ariaLabel?: string;
  children: React.ReactNode;
}) {
  const base =
    variant === "bare"
      ? ""
      : "inline-flex items-center justify-center min-h-[44px] px-8 rounded-full text-base font-medium transition-colors";

  return (
    <a
      href="/whatsapp"
      aria-label={ariaLabel}
      className={`redirect-whatsapp ${base} ${VARIANTS[variant]} ${className}`.trim()}
      onClick={() => trackWhatsAppClick({ service, from })}
    >
      {children}
    </a>
  );
}
