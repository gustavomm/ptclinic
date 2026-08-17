import type { Metadata } from "next";
import { Hero } from "@/components/sections/Hero";
import { Manifesto } from "@/components/sections/Manifesto";
import { ComoFunciona } from "@/components/sections/ComoFunciona";
import { EspecialidadesGrid } from "@/components/sections/EspecialidadesGrid";
import { PilatesSection } from "@/components/sections/PilatesSection";
import { Founders } from "@/components/sections/Founders";
import { PullQuote } from "@/components/sections/PullQuote";
import { BlogTeasers } from "@/components/sections/BlogTeasers";
import { UnidadesSection } from "@/components/sections/UnidadesSection";
import { ContactCTA } from "@/components/sections/ContactCTA";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Fisioterapia e Pilates em São Paulo",
  description:
    "Fisioterapia oncológica, neurofuncional e ortopédica. Pilates em grupo. Duas unidades em São Paulo: Consolação e Pinheiros.",
  path: "/",
});

export default function Home() {
  return (
    <main>
      <Hero />
      <Manifesto />
      <ComoFunciona />
      <EspecialidadesGrid />
      <PilatesSection />
      <Founders />
      <PullQuote />
      <BlogTeasers />
      <UnidadesSection />
      <ContactCTA />
    </main>
  );
}
