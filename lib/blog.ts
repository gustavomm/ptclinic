import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import readingTime from "reading-time";

const BLOG_DIR = path.join(process.cwd(), "content", "blog");

export type PostMeta = {
  slug: string;
  title: string;
  description: string;
  /** ISO date, YYYY-MM-DD. */
  date: string;
  category: string;
  categoryHref: string;
  readingMinutes: number;
  image: string;
  /** Slugs from content/team.ts. Never empty — E-E-A-T requires a named author. */
  authorSlugs: string[];
  condition: string;
};

function readPost(file: string) {
  const slug = file.replace(/\.mdx$/, "");
  const raw = fs.readFileSync(path.join(BLOG_DIR, file), "utf8");
  const { data, content } = matter(raw);
  const meta: PostMeta = {
    slug,
    title: data.title,
    description: data.description,
    date: data.date,
    category: data.category,
    categoryHref: data.categoryHref,
    readingMinutes: Math.max(1, Math.round(readingTime(content).minutes)),
    image: data.image,
    authorSlugs: data.authors,
    condition: data.condition,
  };
  return { meta, content };
}

function allFiles(): string[] {
  return fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith(".mdx"));
}

export function getAllPosts(): PostMeta[] {
  return allFiles()
    .map((f) => readPost(f).meta)
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getPostMeta(slug: string): PostMeta | undefined {
  return getAllPosts().find((p) => p.slug === slug);
}

export function getPost(slug: string) {
  const file = `${slug}.mdx`;
  if (!allFiles().includes(file)) return undefined;
  return readPost(file);
}
