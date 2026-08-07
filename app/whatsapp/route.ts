import { redirect } from "next/navigation";

export const dynamic = "force-static";

const WHATSAPP_DEEPLINK = "https://wa.me/message/FJNBBFEBI6V5O1";

export function GET() {
  redirect(WHATSAPP_DEEPLINK);
}
