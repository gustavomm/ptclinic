import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { JsonLd } from "@/components/JsonLd";
import { getAllPosts } from "@/lib/blog";
import { buildMetadata } from "@/lib/seo";
import { breadcrumbSchema } from "@/lib/schema";

export const metadata: Metadata = buildMetadata({
  title: "Conteúdo",
  description:
    "Guias sobre reabilitação escritos por fisioterapeutas: AVC, câncer, DPOC, doenças cardiovasculares, incontinência urinária e cuidados paliativos.",
  path: "/blog",
});

export default function BlogIndex() {
  const posts = getAllPosts();

  return (
    <main>
      <JsonLd
        data={breadcrumbSchema([
          { name: "Início", path: "/" },
          { name: "Conteúdo", path: "/blog" },
        ])}
      />
      <Section tone="surface-alt">
        <SectionHeading
          level="h1"
          eyebrow="Conteúdo"
          title="O que a gente escreve entre as sessões"
          lead="Guias sobre as condições que mais aparecem na clínica, escritos por quem atende."
        />
      </Section>

      <Section>
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((p, i) => (
            <Reveal key={p.slug} delay={(i % 3) * 80} as="article">
              <Link href={`/blog/${p.slug}`} className="group block text-ink">
                <div className="mb-5 h-56 overflow-hidden">
                  <Image
                    src={p.image}
                    alt={p.title}
                    width={640}
                    height={420}
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                  />
                </div>
                <div className="mb-3 text-[11px] uppercase tracking-eyebrow text-subtle">
                  {p.category} · {p.readingMinutes} min
                </div>
                <h2 className="mb-2 font-display text-2xl leading-tight group-hover:text-accent">
                  {p.title}
                </h2>
                <p className="text-[15px] font-light leading-relaxed text-muted">
                  {p.description}
                </p>
              </Link>
            </Reveal>
          ))}
        </div>
      </Section>
    </main>
  );
}
