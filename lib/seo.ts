import { clinic } from "@/content/clinic";

export const SITE_TITLE_TEMPLATE = `%s · ${clinic.name}`;

export function buildMetadata(args: {
  title: string;
  description: string;
  path: string;
  image?: string;
  type?: "website" | "article";
}) {
  const canonical =
    args.path === "/" ? clinic.siteUrl : `${clinic.siteUrl}${args.path}`;
  const image = args.image ?? "/opengraph-image";

  return {
    title: args.title,
    description: args.description,
    alternates: { canonical },
    openGraph: {
      title: args.title,
      description: args.description,
      url: canonical,
      siteName: clinic.name,
      locale: "pt_BR",
      type: args.type ?? "website",
      images: [{ url: image }],
    },
    twitter: {
      card: "summary_large_image",
      title: args.title,
      description: args.description,
      images: [image],
    },
  };
}
