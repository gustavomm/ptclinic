import type { Metadata } from "next";
import Link from "next/link";
import { Section } from "@/components/ui/Section";
import { UnitLinks } from "@/components/ui/UnitLinks";
import { SectionSplit } from "@/components/ui/SectionSplit";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { BulletList } from "@/components/ui/BulletList";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PilatesSection } from "@/components/sections/PilatesSection";
import { FaqAccordion } from "@/components/sections/FaqAccordion";
import { PhotoGallery, type GalleryPhoto } from "@/components/sections/PhotoGallery";
import { WhatsAppLink } from "@/components/WhatsAppLink";
import { JsonLd } from "@/components/JsonLd";
import { buildMetadata } from "@/lib/seo";
import { breadcrumbSchema, faqSchema, medicalWebPageSchema } from "@/lib/schema";

const STUDIO_PHOTOS: GalleryPhoto[] = [
  {
    src: "/pilates-pinheiros-cadeiras-bolas.webp",
    alt: "Cadeiras de pilates e bolas suíças refletidas no espelho do estúdio de Pinheiros.",
    width: 1472,
    height: 1200,
  },
  {
    src: "/pilates-pinheiros-escada-cadillac.webp",
    alt: "Escada e cadillac refletidos nos espelhos ovais do estúdio de pilates de Pinheiros.",
    width: 1600,
    height: 1200,
  },
  {
    src: "/pilates-pinheiros-corredor-bolas.webp",
    alt: "Corredor do estúdio de pilates de Pinheiros com bolas, cadillac e cadeira.",
    width: 1200,
    height: 1600,
  },
  {
    src: "/pilates-consolacao-marca-vyta.webp",
    alt: "Estúdio de pilates da unidade Consolação com letreiro VYTA e variedade de equipamentos.",
    width: 1200,
    height: 1067,
  },
  {
    src: "/pilates-consolacao-luz-natural.webp",
    alt: "Estúdio de pilates da unidade Consolação com luz natural, cadillac e espaldar.",
    width: 1200,
    height: 1600,
  },
  {
    src: "/pilates-consolacao-equipamentos-parede-coral.webp",
    alt: "Reformer, cadillac e escada no estúdio de pilates da unidade Consolação, parede coral ao fundo.",
    width: 1200,
    height: 1600,
  },
];

const BENEFITS = [
  "Melhorar a postura: fortalece a musculatura do core, aumentando a estabilidade e melhorando o suporte da coluna.",
  "Aumentar a flexibilidade: ajuda a alongar os músculos para ganhar amplitude de movimento.",
  "Reduzir o estresse: através das respirações conscientes, oferece um espaço para relaxamento e concentração.",
  "Ajuda na recuperação de lesões e na prevenção de novos problemas.",
  "Melhorar o condicionamento físico: um treino completo, que foca em força, mobilidade, estabilidade e resistência.",
];

const FAQ = [
  {
    question: "Preciso ter feito fisioterapia antes para fazer Pilates aqui?",
    answer:
      "Não. O Pilates é uma modalidade aplicável para todas as pessoas, não só para quem tem dor. É recomendada para qualquer idade e nível de condicionamento físico.",
  },
  {
    question: "Qual a diferença entre o Pilates e a fisioterapia?",
    answer:
      "Apesar de também ser uma ferramenta de reabilitação, o pilates é uma atividade física estruturada focada em força, mobilidade e controle. Diferente da fisioterapia, que possui técnicas de analgesia, recursos terapêuticos manuais, cinesioterapia e é focada na reabilitação física.",
  },
  {
    question: "Como é a primeira aula?",
    answer:
      "Ao chegar ao nosso estúdio, o aluno comunica seu histórico de lesões, queixas e/ou objetivos com a prática de pilates. O fisioterapeuta que conduz a aula planeja os exercícios individualmente, de acordo com as demandas específicas, e evolui a intensidade no ritmo particular de cada um.",
  },
  {
    question: "As aulas são em grupo?",
    answer: "Em grupos reduzidos, de no máximo um aluno por aparelho.",
  },
];

const TRAIL = [
  { name: "Início", path: "/" },
  { name: "Pilates", path: "/pilates" },
];

export const metadata: Metadata = buildMetadata({
  title: "Pilates com fisioterapeuta em São Paulo",
  description:
    "Pilates conduzido por fisioterapeutas em São Paulo. Aulas personalizadas, grupos reduzidos e aparelhos completos. Consolação e Pinheiros.",
  path: "/pilates",
  // Foto deitada de propósito: o card do Twitter é summary_large_image e o
  // WhatsApp corta pelo meio. O hero passou a ser uma foto em pé e não serve
  // mais aqui.
  image: "/pilates-espelhos.webp",
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
          breadcrumbSchema(TRAIL),
        ]}
      />

      <Section tone="surface-alt">
        <Breadcrumb trail={TRAIL} />
        <SectionHeading
          level="h1"
          eyebrow="Pilates"
          title={<>Pilates com <em className="italic">fisioterapeuta</em>, sempre</>}
          lead="O Pilates é uma atividade completa: fortalece, melhora postura e flexibilidade, e funciona tanto na reabilitação quanto na prevenção de lesões. Aqui, todas as aulas são conduzidas por fisioterapeutas."
        />
        <WhatsAppLink service="pilates" from="/pilates" className="mt-8">
          Agendar aula experimental
        </WhatsAppLink>
      </Section>

      <PilatesSection />

      <PhotoGallery photos={STUDIO_PHOTOS} heading="O estúdio" tone="surface-alt" />

      {/*
        Só estas três seções em duas colunas. O PilatesSection e a PhotoGallery
        entre elas têm layout próprio — a galeria é uma grade de fotos de ponta a
        ponta — e espremê-las numa coluna de 36rem estragaria as duas.
      */}
      <Section>
        <SectionSplit title="Para quem é o Pilates">
          <p className="text-base font-book leading-relaxed text-muted">
            O Pilates é uma prática acessível a pessoas de todas as idades e níveis
            de condicionamento físico. É ideal para quem busca:
          </p>
          <BulletList items={BENEFITS} className="mt-8" />
        </SectionSplit>
      </Section>

      <Section tone="surface-alt">
        <SectionSplit title="Perguntas frequentes">
          <FaqAccordion items={FAQ} />
        </SectionSplit>
      </Section>

      <Section tone="ink">
        <SectionSplit title="Onde praticar" tone="surface">
          <UnitLinks />
          <WhatsAppLink service="pilates" from="/pilates" variant="warm" className="mt-10">
            Agendar aula experimental
          </WhatsAppLink>
        </SectionSplit>
      </Section>
    </main>
  );
}
