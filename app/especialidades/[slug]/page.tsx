import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Section } from "@/components/ui/Section";
import { UnitLinks } from "@/components/ui/UnitLinks";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Arrow } from "@/components/ui/Arrow";
import { BulletList } from "@/components/ui/BulletList";
import { SectionSplit } from "@/components/ui/SectionSplit";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { FaqAccordion } from "@/components/sections/FaqAccordion";
import { WhatsAppLink } from "@/components/WhatsAppLink";
import { JsonLd } from "@/components/JsonLd";
import { specialities, getSpeciality } from "@/content/specialities";
import { getPostMeta } from "@/lib/blog";
import { buildMetadata } from "@/lib/seo";
import { breadcrumbSchema, faqSchema, medicalWebPageSchema } from "@/lib/schema";

export function generateStaticParams() {
  return specialities.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const s = getSpeciality(slug);
  if (!s) return {};
  return buildMetadata({
    title: s.title,
    description: s.summary,
    path: `/especialidades/${s.slug}`,
    image: s.image,
  });
}

export default async function SpecialityPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const s = getSpeciality(slug);
  if (!s) notFound();

  const related = s.relatedPosts.map(getPostMeta).filter(Boolean);

  const TRAIL = [
    { name: "Início", path: "/" },
    { name: "Áreas de atuação", path: "/especialidades" },
    { name: s.title, path: `/especialidades/${s.slug}` },
  ];

  return (
    <main>
      <JsonLd
        data={[
          medicalWebPageSchema({
            title: s.title,
            description: s.summary,
            path: `/especialidades/${s.slug}`,
            condition: s.condition,
          }),
          faqSchema(s.faq),
          breadcrumbSchema(TRAIL),
        ]}
      />

      <Section tone="surface-alt">
        <Breadcrumb trail={TRAIL} />
                <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <Eyebrow>Áreas de atuação</Eyebrow>
            <h1 className="font-display text-display-lg text-balance text-ink">{s.title}</h1>
            <p className="mt-6 text-lg font-light leading-relaxed text-muted">{s.intro}</p>
            <WhatsAppLink service={s.slug} from={`/especialidades/${s.slug}`} className="mt-8">
              Agendar avaliação
            </WhatsAppLink>
          </div>
          <Image
            src={s.image}
            alt={s.title}
            width={880}
            height={620}
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="h-full w-full object-cover"
          />
        </div>
      </Section>

      <Section>
        <SectionSplit title="Para quem funciona">
          <BulletList items={s.forWhom} />
        </SectionSplit>

        <div className="mt-16">
          <SectionSplit title="Como funciona">
            <p className="text-base font-book leading-relaxed text-muted">{s.howItWorks}</p>
          </SectionSplit>
        </div>
      </Section>

      <Section tone="surface-alt">
        <SectionSplit title="Perguntas frequentes">
          <FaqAccordion items={s.faq} />
        </SectionSplit>
      </Section>

      {related.length > 0 && (
        <Section>
          <SectionSplit title="Para ler antes da consulta">
            <ul className="flex flex-col gap-4">
              {related.map((p) => (
                <li key={p!.slug}>
                  <Link
                    href={`/blog/${p!.slug}`}
                    className="inline-flex min-h-[44px] items-center font-display font-light text-2xl text-ink hover:text-accent"
                  >
                    <span>{p!.title}<Arrow /></span>
                  </Link>
                </li>
              ))}
            </ul>
          </SectionSplit>
        </Section>
      )}

      <Section tone="ink">
        <SectionSplit title="Onde atendemos" tone="surface">
          <UnitLinks />
          <WhatsAppLink service={s.slug} from={`/especialidades/${s.slug}`} variant="warm" className="mt-10">
            Agendar avaliação
          </WhatsAppLink>
        </SectionSplit>
      </Section>
    </main>
  );
}
