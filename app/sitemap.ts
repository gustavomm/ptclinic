import type { MetadataRoute } from "next";
import { clinic } from "@/content/clinic";
import { specialities } from "@/content/specialities";
import { units } from "@/content/units";
import { getAllPosts } from "@/lib/blog";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const url = (p: string) => (p === "/" ? clinic.siteUrl : `${clinic.siteUrl}${p}`);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: url("/"), priority: 1 },
    { url: url("/pilates"), priority: 0.9 },
    { url: url("/especialidades"), priority: 0.8 },
    { url: url("/unidades"), priority: 0.8 },
    { url: url("/blog"), priority: 0.7 },
  ];

  return [
    ...staticRoutes,
    ...specialities.map((s) => ({ url: url(`/especialidades/${s.slug}`), priority: 0.8 })),
    ...units.map((u) => ({ url: url(`/unidades/${u.slug}`), priority: 0.9 })),
    ...getAllPosts().map((p) => ({
      url: url(`/blog/${p.slug}`),
      lastModified: new Date(`${p.date}T00:00:00Z`),
      priority: 0.6,
    })),
  ];
}
