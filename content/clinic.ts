import { formatPhone } from "@/lib/format";

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
  /** Deep link used by the /whatsapp redirect. Never link to it directly — use WhatsAppLink. */
  whatsappUrl: "https://wa.me/message/FJNBBFEBI6V5O1",
  siteUrl: "https://www.vytafisioterapia.com.br",
} as const;

export type Clinic = typeof clinic;
