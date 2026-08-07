import Image from "next/image";
import Link from "next/link";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { getAllPosts } from "@/lib/blog";

export function BlogTeasers() {
  const posts = getAllPosts().slice(0, 3);

  return (
    <Section id="conteudo">
      <div className="mb-14 flex flex-wrap items-end justify-between gap-8">
        <SectionHeading className="max-w-2xl" eyebrow="Conteúdo" title="O que a gente escreve entre as sessões" />
        <Link href="/blog" className="inline-flex min-h-[44px] items-center text-[15px] text-accent hover:text-accent-deep">
          Ver todos os textos →
        </Link>
      </div>
      <div className="grid gap-10 md:grid-cols-3">
        {posts.map((p, i) => (
          <Reveal key={p.slug} delay={i * 80} as="article">
            <Link href={`/blog/${p.slug}`} className="group block text-ink">
              <div className="mb-5 h-56 overflow-hidden">
                <Image
                  src={p.image}
                  alt={p.title}
                  width={640}
                  height={420}
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                />
              </div>
              <div className="mb-3 text-[11px] uppercase tracking-eyebrow text-subtle">
                {p.category} · {p.readingMinutes} min
              </div>
              <h3 className="mb-2 font-display text-2xl leading-tight group-hover:text-accent">
                {p.title}
              </h3>
              <p className="text-[15px] font-light leading-relaxed text-muted">{p.description}</p>
            </Link>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
