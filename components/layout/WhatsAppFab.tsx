import Image from "next/image";
import { WhatsAppLink } from "@/components/WhatsAppLink";

export function WhatsAppFab() {
  return (
    <WhatsAppLink
      service="geral"
      from="fab"
      variant="bare"
      className="fixed bottom-6 right-5 z-40 block h-14 w-14 drop-shadow-lg md:bottom-8 md:right-8"
    >
      <Image src="/whatsapp.webp" alt="Falar no WhatsApp" width={56} height={56} />
    </WhatsAppLink>
  );
}
