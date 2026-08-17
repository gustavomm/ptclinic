import type { Metadata, Viewport } from "next";
import { GoogleTagManager } from "@next/third-parties/google";
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
    "Fisioterapia oncológica, neurofuncional e ortopédica. Pilates em grupo. Duas unidades em São Paulo: Consolação e Pinheiros.",
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
        Só o GTM. O container GTM-NNBD3887 carrega a conversão do Google Ads e
        também o GA4.

        Aqui havia um <GoogleAnalytics gaId="G-V5YCCVYQRR" /> ao lado, porque em
        07/08/2026 o container foi baixado e decodificado e não tinha nenhuma
        tag de GA4 dentro. Em 17/08/2026 tem: `{"function":"__googtag",
        "vtp_tagId":"G-V5YCCVYQRR"}`, a "Tag do Google" que alguém adicionou
        nesse intervalo. Manter os dois mediria a mesma propriedade duas vezes.

        Se a tag sair do container de novo, esta linha volta. Conferir é baixar
        https://www.googletagmanager.com/gtm.js?id=GTM-NNBD3887 e procurar
        __googtag — a tela do GTM mostra o mesmo em Overview → Destinations.

        O GTM fica de fora dos previews da Vercel — o porquê está em
        lib/analytics-env.ts.
      */}
      {shouldLoadAnalytics(process.env.VERCEL_ENV) && (
        <GoogleTagManager gtmId="GTM-NNBD3887" />
      )}
      {/*
        O peso padrão daqui era 300. Como peso se herda, todo texto que não
        dissesse o contrário nascia Jost Light — elegante num título de 48px,
        fino demais nos 13-16px do texto corrido, que é a maior parte do site.
        Agora o padrão é 400 e o 300 sobrou só onde é escolha: nos tokens
        display-* e nos títulos em Cormorant, que o declaram explicitamente.
      */}
      <body className="bg-surface text-ink font-sans font-normal antialiased">
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
