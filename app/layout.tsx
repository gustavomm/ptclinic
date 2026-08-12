import type { Metadata, Viewport } from "next";
import { GoogleAnalytics, GoogleTagManager } from "@next/third-parties/google";
import { Analytics } from "@vercel/analytics/react";
import { shouldLoadAnalytics } from "@/lib/analytics-env";
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
    default: `${clinic.name} · Fisioterapia e Pilates em São Paulo`,
    template: SITE_TITLE_TEMPLATE,
  },
  description:
    "Fisioterapia e Pilates com atendimento individual conduzido por fisioterapeutas. Duas unidades em São Paulo: Consolação e Pinheiros.",
  robots: { index: true, follow: true },
  manifest: "/site.webmanifest",
  icons: {
    icon: [
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
    other: [
      {
        rel: "mask-icon",
        url: "/safari-pinned-tab.svg",
        color: "#5bbad5",
      },
    ],
  },
  other: {
    "msapplication-TileColor": "#da532c",
  },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={`${display.variable} ${sans.variable}`}>
      {/*
        GTM dispara a conversão do Google Ads. O GA4 vem separado, direto,
        porque o container GTM-NNBD3887 não tem nenhuma tag de GA4 dentro —
        conferido baixando e decodificando o container público em 07/08/2026.
        O site antigo também carregava o gtag direto, então é o mesmo arranjo
        que já funcionava. Se um dia a tag do Google entrar no container,
        remover a linha do GoogleAnalytics daqui para não medir em dobro.

        Os dois ficam de fora dos previews da Vercel — o porquê está em
        lib/analytics-env.ts.
      */}
      {shouldLoadAnalytics(process.env.VERCEL_ENV) && (
        <>
          <GoogleTagManager gtmId="GTM-NNBD3887" />
          <GoogleAnalytics gaId="G-V5YCCVYQRR" />
        </>
      )}
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
