import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { Section } from "@/components/ui/Section";
import { Prose } from "@/components/ui/Prose";
import { WhatsAppLink } from "@/components/WhatsAppLink";
import { JsonLd } from "@/components/JsonLd";
import { getAllPosts, getPost } from "@/lib/blog";
import { getMember } from "@/content/team";
import { buildMetadata } from "@/lib/seo";
import { articleSchema, breadcrumbSchema } from "@/lib/schema";

export function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  return buildMetadata({
    title: post.meta.title,
    description: post.meta.description,
    path: `/blog/${post.meta.slug}`,
    image: post.meta.image,
    type: "article",
  });
}

const FORMATTER = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const { meta, content } = post;
  const authors = meta.authorSlugs.map(getMember).filter(Boolean);
  const published = FORMATTER.format(new Date(`${meta.date}T00:00:00Z`));

  return (
    <main>
      <JsonLd
        data={[
          articleSchema({
            title: meta.title,
            description: meta.description,
            slug: meta.slug,
            date: meta.date,
            image: meta.image,
            authorSlugs: meta.authorSlugs,
          }),
          breadcrumbSchema([
            { name: "Início", path: "/" },
            { name: "Conteúdo", path: "/blog" },
            { name: meta.title, path: `/blog/${meta.slug}` },
          ]),
        ]}
      />

      <Section tone="surface-alt">
        <nav aria-label="Trilha" className="mb-8 text-sm font-light text-subtle">
          <Link href="/" className="inline-flex min-h-[44px] items-center hover:text-accent">Início</Link>
          <span className="mx-2" aria-hidden>/</span>
          <Link href="/blog" className="inline-flex min-h-[44px] items-center hover:text-accent">Conteúdo</Link>
        </nav>
        <div className="mb-4 text-[11px] uppercase tracking-eyebrow text-subtle">
          <Link href={meta.categoryHref} className="inline-flex min-h-[44px] items-center hover:text-accent">{meta.category}</Link>
          {" · "}
          {meta.readingMinutes} min de leitura
        </div>
        <h1 className="max-w-3xl font-display text-display-lg text-balance text-ink">
          {meta.title}
        </h1>
        <p className="mt-5 max-w-2xl text-lg font-light leading-relaxed text-muted">
          {meta.description}
        </p>

        {/* E-E-A-T: named author with CREFITO and a visible review date. */}
        <div className="mt-8 flex flex-wrap items-center gap-4 border-t border-line pt-6">
          {authors.map((a) => (
            <div key={a!.slug} className="flex items-center gap-3">
              <Image src={a!.image} alt={a!.name} width={44} height={44} className="h-11 w-11 rounded-full object-cover object-top" />
              <div>
                <div className="text-[15px] text-ink">{a!.name}</div>
                <div className="text-[13px] font-light text-subtle">{a!.crefito}</div>
              </div>
            </div>
          ))}
          <div className="text-[13px] font-light text-subtle">Revisado em {published}</div>
        </div>
      </Section>

      <Section>
        <div className="mb-12 max-h-[28rem] overflow-hidden">
          <Image src={meta.image} alt={meta.title} width={1280} height={720} priority sizes="100vw" className="w-full object-cover" />
        </div>
        <Prose>
          <MDXRemote source={content} />
        </Prose>

        <div className="mt-16 border-t border-line pt-10">
          <p className="mb-6 max-w-2xl text-lg font-light leading-relaxed text-muted">
            Se algo aqui descreve o que você está vivendo, conta pra gente. A
            avaliação define o que faz sentido no seu caso.
          </p>
          <WhatsAppLink service={meta.slug} from={`/blog/${meta.slug}`}>
            Falar com uma fisioterapeuta
          </WhatsAppLink>
        </div>
      </Section>
    </main>
  );
}
