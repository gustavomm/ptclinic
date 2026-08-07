import type { Metadata } from "next";
import { GoogleTagManager } from "@next/third-parties/google";
import { Analytics } from "@vercel/analytics/react";
import { display, sans } from "@/lib/fonts";
import { clinic } from "@/content/clinic";
import { SITE_TITLE_TEMPLATE } from "@/lib/seo";
import { organizationSchema, websiteSchema } from "@/lib/schema";
import { JsonLd } from "@/components/JsonLd";
import { TopBar } from "@/components/layout/TopBar";
import { Nav } from "@/components/layout/Nav";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppFab } from "@/components/layout/WhatsAppFab";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(clinic.siteUrl),
  title: {
    default: `${clinic.name} — Fisioterapia e Pilates em São Paulo`,
    template: SITE_TITLE_TEMPLATE,
  },
  description:
    "Fisioterapia e Pilates com atendimento individual conduzido por fisioterapeutas. Duas unidades em São Paulo: Consolação e Pinheiros.",
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={`${display.variable} ${sans.variable}`}>
      <GoogleTagManager gtmId="GTM-NNBD3887" />
      <body className="bg-surface text-ink font-sans font-light antialiased">
        <noscript>
          <style>{`[data-revealed]{opacity:1 !important;transform:none !important;}`}</style>
        </noscript>
        <JsonLd data={[organizationSchema(), websiteSchema()]} />
        <TopBar />
        <Nav />
        {children}
        <Footer />
        <WhatsAppFab />
        <Analytics />
      </body>
    </html>
  );
}
