import type { Metadata } from "next";
import { GoogleTagManager } from "@next/third-parties/google";
import { Analytics } from "@vercel/analytics/react";
import { display, sans } from "@/lib/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vyta Fisioterapia e Pilates",
  description:
    "Fisioterapia e Pilates com atendimento individual, em duas unidades em São Paulo.",
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
        {children}
        <Analytics />
      </body>
    </html>
  );
}
