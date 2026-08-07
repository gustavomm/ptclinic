import type { Metadata } from "next";
import Link from "next/link";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PilatesSection } from "@/components/sections/PilatesSection";
import { FaqAccordion } from "@/components/sections/FaqAccordion";
import { PhotoGallery, type GalleryPhoto } from "@/components/sections/PhotoGallery";
import { WhatsAppLink } from "@/components/WhatsAppLink";
import { JsonLd } from "@/components/JsonLd";
import { units } from "@/content/units";
import { buildMetadata } from "@/lib/seo";
import { breadcrumbSchema, faqSchema, medicalWebPageSchema } from "@/lib/schema";

const STUDIO_PHOTOS: GalleryPhoto[] = [
  {
    src: "/pilates-pinheiros-cadeiras-bolas.webp",
    alt: "Cadeiras de pilates e bolas suíças refletidas no espelho do estúdio de Pinheiros.",
    orientation: "landscape",
    width: 1472,
    height: 1200,
  },
  {
    src: "/pilates-pinheiros-escada-cadillac.webp",
    alt: "Escada e cadillac refletidos nos espelhos ovais do estúdio de pilates de Pinheiros.",
    orientation: "landscape",
    width: 1600,
    height: 1200,
  },
  {
    src: "/pilates-pinheiros-corredor-bolas.webp",
    alt: "Corredor do estúdio de pilates de Pinheiros com bolas, cadillac e cadeira.",
    orientation: "portrait",
    width: 1200,
    height: 1600,
  },
  {
    src: "/pilates-consolacao-marca-vyta.webp",
    alt: "Estúdio de pilates da unidade Consolação com letreiro VYTA e variedade de equipamentos.",
    orientation: "landscape",
    width: 1200,
    height: 1067,
  },
  {
    src: "/pilates-consolacao-luz-natural.webp",
    alt: "Estúdio de pilates da unidade Consolação com luz natural, cadillac e espaldar.",
    orientation: "portrait",
    width: 1200,
    height: 1600,
  },
  {
    src: "/pilates-consolacao-equipamentos-parede-coral.webp",
    alt: "Reformer, cadillac e escada no estúdio de pilates da unidade Consolação, parede coral ao fundo.",
    orientation: "portrait",
    width: 1200,
    height: 1600,
  },
];

const BENEFITS = [
  "Melhorar a postura: fortalece a musculatura central, ajudando a manter uma postura mais alinhada.",
  "Aumentar a flexibilidade: trabalha a amplitude de movimento dos músculos.",
  "Reduzir o estresse: através das respirações conscientes, oferece um espaço para relaxamento e concentração.",
  "Reabilitação e prevenção de lesões: ajuda na recuperação de lesões e na prevenção de novos problemas.",
  "Melhorar o condicionamento físico: um treino completo, que foca em força, mobilidade, estabilidade e resistência.",
];

const FAQ = [
  {
    question: "Preciso ter feito fisioterapia antes para fazer Pilates aqui?",
    answer:
      "Não. O Pilates é acessível a pessoas de todas as idades e níveis de condicionamento físico.",
  },
  {
    question: "Qual a diferença do Pilates com fisioterapeuta?",
    answer:
      "Quem conduz a aula tem formação clínica. Toda aula na Vyta é conduzida por fisioterapeuta.",
  },
  {
    question: "Como é a primeira aula?",
    answer:
      "Antes da primeira aula é feita uma avaliação postural. A partir dela o exercício é dosado para o seu corpo.",
  },
  {
    question: "As aulas são em grupo?",
    answer: "Em grupos reduzidos, com aparelhos completos.",
  },
];

export const metadata: Metadata = buildMetadata({
  title: "Pilates com fisioterapeuta em São Paulo",
  description:
    "Pilates conduzido por fisioterapeutas em São Paulo. Avaliação postural antes da primeira aula, grupos reduzidos e aparelhos completos. Consolação e Pinheiros.",
  path: "/pilates",
  image: "/pilates1.jpeg",
});

export default function PilatesPage() {
  return (
    <main>
      <JsonLd
        data={[
          medicalWebPageSchema({
            title: "Pilates com fisioterapeuta",
            description:
              "Pilates conduzido por fisioterapeutas, com avaliação postural antes da primeira aula.",
            path: "/pilates",
            condition: "Reabilitação e condicionamento físico",
          }),
          faqSchema(FAQ),
          breadcrumbSchema([
            { name: "Início", path: "/" },
            { name: "Pilates", path: "/pilates" },
          ]),
        ]}
      />

      <Section tone="surface-alt">
        <nav aria-label="Trilha" className="mb-8 text-sm font-light text-subtle">
          <Link href="/" className="inline-flex min-h-[44px] items-center hover:text-accent">Início</Link>
        </nav>
        <SectionHeading
          level="h1"
          eyebrow="Pilates"
          title={<>Pilates com <em className="italic">fisioterapeuta</em>, sempre</>}
          lead="O Pilates é um método eficaz para reabilitação e prevenção de lesões, focando no fortalecimento do core, alinhamento postural e flexibilidade. Aqui, quem conduz cada aula é fisioterapeuta."
        />
        <WhatsAppLink service="pilates" from="/pilates" className="mt-8">
          Agendar aula experimental
        </WhatsAppLink>
      </Section>

      <PilatesSection />

      <PhotoGallery photos={STUDIO_PHOTOS} heading="O estúdio" tone="surface-alt" />

      <Section>
        <h2 className="font-display text-display-md text-ink">Para quem é o Pilates</h2>
        <p className="mt-6 max-w-3xl text-base font-light leading-relaxed text-muted">
          O Pilates é uma prática acessível a pessoas de todas as idades e níveis
          de condicionamento físico. É ideal para quem busca:
        </p>
        <ul className="mt-8 flex max-w-3xl flex-col gap-4">
          {BENEFITS.map((b) => (
            <li key={b} className="flex gap-4 text-base font-light leading-relaxed text-muted">
              <span className="mt-2 h-1 w-1 flex-none rounded-full bg-accent-warm" aria-hidden />
              {b}
            </li>
          ))}
        </ul>
      </Section>

      <Section tone="surface-alt">
        <h2 className="mb-8 font-display text-display-md text-ink">Perguntas frequentes</h2>
        <FaqAccordion items={FAQ} />
      </Section>

      <Section tone="ink">
        <h2 className="font-display text-display-md text-surface">Onde praticar</h2>
        <div className="mt-8 flex flex-wrap gap-8">
          {units.map((u) => (
            <Link key={u.slug} href={`/unidades/${u.slug}`} className="text-surface/85 hover:text-accent-warm-soft">
              <span className="font-display text-2xl">{u.shortName}</span>
              <span className="mt-1 block text-sm font-light">{u.street}</span>
            </Link>
          ))}
        </div>
        <WhatsAppLink service="pilates" from="/pilates" variant="warm" className="mt-10">
          Agendar aula experimental
        </WhatsAppLink>
      </Section>
    </main>
  );
}
