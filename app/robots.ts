import type { MetadataRoute } from "next";
import { clinic } from "@/content/clinic";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: "/whatsapp" },
    sitemap: `${clinic.siteUrl}/sitemap.xml`,
  };
}
