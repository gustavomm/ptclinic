import { formatPhone } from "@/lib/format";

/**
 * Also the WhatsApp number: /whatsapp (app/whatsapp/route.ts) builds the wa.me
 * link from it. Never link to WhatsApp directly — use WhatsAppLink.
 */
const PHONE_E164 = "+5511989172311";

export const clinic = {
  name: "Vyta Fisioterapia e Pilates",
  legalName: "Vyta Fisioterapia",
  tagline: "Fisioterapia & Pilates",
  phoneE164: PHONE_E164,
  phoneDisplay: formatPhone(PHONE_E164),
  email: "contato@vytafisioterapia.com.br",
  instagram: "https://instagram.com/vytafisioterapia",
  instagramHandle: "@vytafisioterapia",
  siteUrl: "https://www.vytafisioterapia.com.br",
} as const;

export type Clinic = typeof clinic;
