export type WhatsAppClick = {
  /** Which service the visitor was looking at: "geral", "pilates", a speciality slug. */
  service: string;
  /** Path the click originated from. */
  from: string;
};

/**
 * Stub. Phase 2 of docs/plano-atribuicao-leads.md fills this in with the
 * lead_code generation and the POST to /api/lead. Deliberately does nothing
 * today so that the call sites already exist when that work lands.
 */
export function trackWhatsAppClick(_click: WhatsAppClick): void {}
