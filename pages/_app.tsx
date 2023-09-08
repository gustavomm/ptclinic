import "../styles/globals.css";
import type { AppProps } from "next/app";
import { Analytics } from "@vercel/analytics/react";
import Script from "next/script";
import Image from "next/image";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Script
        src="https://www.googletagmanager.com/ns.html?id=GTM-NNBD3887"
        strategy="afterInteractive"
      />
      <Script strategy="afterInteractive">
        {`
          (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
          new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
          'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','GTM-NNBD3887')
        `}
      </Script>
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-VSSZW88J6E"
        strategy="afterInteractive"
      />
      <Script strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){window.dataLayer.push(arguments);}
          gtag('js', new Date());

          gtag('config', 'G-VSSZW88J6E');
        `}
      </Script>

      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-V5YCCVYQRR"
        strategy="afterInteractive"
      />
      <Script strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){window.dataLayer.push(arguments);}
          gtag('js', new Date());

          gtag('config', 'G-V5YCCVYQRR');
        `}
      </Script>

      <Component {...pageProps} />
      <a
        href="/whatsapp"
        className="fixed bottom-10 right-5 md:bottom-15 md:right-15"
        target="_blank"
        rel="noopener noreferrer"
      >
        <Image
          src="/whatsapp.webp"
          alt="whatsapp icon"
          width={70}
          height={70}
          className=""
        />
      </a>
      <footer className="flex flex-col py-4 w-full items-center justify-center border-t gap-2 bg-slate-50">
        <a
          className="flex items-center justify-center text-sm text-vyta-tertiary-700"
          href="https://github.com/gustavomm"
          target="_blank"
          rel="noopener noreferrer"
        >
          Website by Gustavo Moreira
        </a>
      </footer>
      <Analytics />
    </>
  );
}

export default MyApp;
