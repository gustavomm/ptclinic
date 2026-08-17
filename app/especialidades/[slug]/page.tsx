import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Section } from "@/components/ui/Section";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { FaqAccordion } from "@/components/sections/FaqAccordion";
import { WhatsAppLink } from "@/components/WhatsAppLink";
import { JsonLd } from "@/components/JsonLd";
import { specialities, getSpeciality } from "@/content/specialities";
import { getPostMeta } from "@/lib/blog";
import { units } from "@/content/units";
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
          breadcrumbSchema([
            { name: "Início", path: "/" },
            { name: "Áreas de atuação", path: "/especialidades" },
            { name: s.title, path: `/especialidades/${s.slug}` },
          ]),
        ]}
      />

      <Section tone="surface-alt">
        <nav aria-label="Trilha" className="mb-8 text-sm text-subtle">
          <Link href="/" className="inline-flex min-h-[44px] items-center hover:text-ink">Início</Link>
          <span className="mx-2" aria-hidden>/</span>
          <Link href="/especialidades" className="inline-flex min-h-[44px] items-center hover:text-ink">Áreas de atuação</Link>
        </nav>
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
        <h2 className="font-display text-display-md text-ink">Para quem funciona</h2>
        <ul className="mt-8 flex max-w-xl flex-col gap-4">
          {s.forWhom.map((item) => (
            <li key={item} className="flex gap-4 text-base leading-relaxed text-muted">
              <span className="mt-2 h-1 w-1 flex-none rounded-full bg-accent-warm" aria-hidden />
              {item}
            </li>
          ))}
        </ul>

        <h2 className="mt-16 font-display text-display-md text-ink">Como funciona</h2>
        <p className="mt-6 max-w-xl text-base leading-relaxed text-muted">
          {s.howItWorks}
        </p>
      </Section>

      <Section tone="surface-alt">
        <h2 className="mb-8 font-display text-display-md text-ink">Perguntas frequentes</h2>
        <FaqAccordion items={s.faq} />
      </Section>

      {related.length > 0 && (
        <Section>
          <h2 className="mb-8 font-display text-display-md text-ink">Para ler antes da consulta</h2>
          <ul className="flex flex-col gap-4">
            {related.map((p) => (
              <li key={p!.slug}>
                <Link
                  href={`/blog/${p!.slug}`}
                  className="inline-flex min-h-[44px] items-center font-display font-light text-2xl text-ink hover:text-accent"
                >
                  {p!.title} →
                </Link>
              </li>
            ))}
          </ul>
        </Section>
      )}

      <Section tone="ink">
        <h2 className="font-display text-display-md text-surface">Onde atendemos</h2>
        <div className="mt-8 flex flex-wrap gap-8">
          {units.map((u) => (
            <Link key={u.slug} href={`/unidades/${u.slug}`} className="text-surface/85 hover:text-accent-warm-soft">
              <span className="font-display font-light text-2xl">{u.shortName}</span>
              <span className="mt-1 block text-sm">{u.street}</span>
            </Link>
          ))}
        </div>
        <WhatsAppLink service={s.slug} from={`/especialidades/${s.slug}`} variant="warm" className="mt-10">
          Agendar avaliação
        </WhatsAppLink>
      </Section>
    </main>
  );
}
