import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Section } from "@/components/ui/Section";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { WhatsAppLink } from "@/components/WhatsAppLink";
import { JsonLd } from "@/components/JsonLd";
import { PhotoGallery } from "@/components/sections/PhotoGallery";
import { units, getUnit } from "@/content/units";
import { clinic } from "@/content/clinic";
import { specialities } from "@/content/specialities";
import { buildMetadata } from "@/lib/seo";
import { breadcrumbSchema, unitSchema } from "@/lib/schema";

export function generateStaticParams() {
  return units.map((u) => ({ slug: u.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const u = getUnit(slug);
  if (!u) return {};
  return buildMetadata({
    title: `Fisioterapia e Pilates em ${u.district}`,
    description: `Clínica de fisioterapia e Pilates em ${u.district}, São Paulo. ${u.street}. Atendimento individual conduzido por fisioterapeutas.`,
    path: `/unidades/${u.slug}`,
    image: u.image,
  });
}

export default async function UnitPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const u = getUnit(slug);
  if (!u) notFound();

  return (
    <main>
      <JsonLd
        data={[
          unitSchema(u),
          breadcrumbSchema([
            { name: "Início", path: "/" },
            { name: "Unidades", path: "/unidades" },
            { name: u.name, path: `/unidades/${u.slug}` },
          ]),
        ]}
      />

      <Section tone="surface-alt">
        <nav aria-label="Trilha" className="mb-8 text-sm font-light text-subtle">
          <Link href="/" className="inline-flex min-h-[44px] items-center hover:text-accent">Início</Link>
          <span className="mx-2" aria-hidden>/</span>
          <Link href="/unidades" className="inline-flex min-h-[44px] items-center hover:text-accent">Unidades</Link>
        </nav>
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <Eyebrow>Unidade</Eyebrow>
            <h1 className="font-display text-display-lg text-balance text-ink">
              Fisioterapia e Pilates em {u.district}
            </h1>
            <p className="mt-6 text-lg font-light leading-relaxed text-muted">
              {u.street}
              <br />
              {u.district}, {u.city} · {u.state}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <WhatsAppLink service="geral" from={`/unidades/${u.slug}`}>
                Agendar nesta unidade
              </WhatsAppLink>
              <a
                href={u.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[44px] items-center rounded-full border border-line px-8 text-base text-ink hover:bg-ink/5"
              >
                Abrir no Google Maps
              </a>
            </div>
            <a href={`tel:${clinic.phoneE164}`} className="redirect-phone mt-6 inline-flex min-h-[44px] items-center text-[15px] text-accent hover:text-accent-deep">
              {clinic.phoneDisplay}
            </a>
          </div>
          <Image
            src={u.image}
            alt={u.imageAlt}
            width={u.imageWidth}
            height={u.imageHeight}
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="h-full w-full object-cover"
          />
        </div>
      </Section>

      <Section>
        <h2 className="mb-8 font-display text-display-md text-ink">Como chegar</h2>
        <div className="overflow-hidden border border-line">
          <iframe
            src={u.mapEmbedUrl}
            title={`Mapa da ${u.name}`}
            width="100%"
            height="420"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            style={{ border: 0 }}
          />
        </div>
      </Section>

      <PhotoGallery photos={u.gallery} heading="A unidade por dentro" tone="surface" />

      <Section tone="surface-alt">
        <h2 className="mb-8 font-display text-display-md text-ink">
          O que atendemos em {u.district}
        </h2>
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {specialities.map((s) => (
            <li key={s.slug}>
              <Link href={`/especialidades/${s.slug}`} className="inline-flex min-h-[44px] items-center text-[17px] font-light text-ink hover:text-accent">
                {s.cardTitle} →
              </Link>
            </li>
          ))}
          <li>
            <Link href="/pilates" className="inline-flex min-h-[44px] items-center text-[17px] font-light text-ink hover:text-accent">
              Pilates →
            </Link>
          </li>
        </ul>
      </Section>
    </main>
  );
}
