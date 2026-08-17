import { clinic } from "@/content/clinic";
import { type Unit } from "@/content/units";
import { team, type Member } from "@/content/team";

const abs = (path: string) =>
  path.startsWith("http") ? path : `${clinic.siteUrl}${path}`;

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Physiotherapy",
    "@id": `${clinic.siteUrl}/#organization`,
    name: clinic.name,
    url: clinic.siteUrl,
    telephone: clinic.phoneE164,
    email: clinic.email,
    sameAs: [clinic.instagram],
    medicalSpecialty: "PhysicalTherapy",
    // Deliberately no `location` here: Google parses each page's structured
    // data independently, and this node renders on every page (root layout),
    // never alongside the unit nodes it would need to reference. The inverse
    // relationship — unitSchema's `parentOrganization` — is the correct
    // direction for a multi-location business and resolves fine, since both
    // nodes are co-located on each unit page.
  };
}

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${clinic.siteUrl}/#website`,
    url: clinic.siteUrl,
    name: clinic.name,
    inLanguage: "pt-BR",
    publisher: { "@id": `${clinic.siteUrl}/#organization` },
  };
}

type UnitSchema = {
  "@context": "https://schema.org";
  "@type": "Physiotherapy";
  "@id": string;
  name: string;
  url: string;
  telephone: string;
  email: string;
  image: string;
  address: Record<string, string>;
  geo: { "@type": "GeoCoordinates"; latitude: number; longitude: number };
  hasMap: string;
  parentOrganization: { "@id": string };
  openingHoursSpecification?: Array<{
    "@type": "OpeningHoursSpecification";
    dayOfWeek: string[];
    opens: string;
    closes: string;
  }>;
};

export function unitSchema(unit: Unit): UnitSchema {
  const address: Record<string, string> = {
    "@type": "PostalAddress",
    streetAddress: unit.street,
    addressLocality: unit.city,
    addressRegion: unit.state,
    addressCountry: "BR",
  };
  if (unit.postalCode) address.postalCode = unit.postalCode;

  const base: UnitSchema = {
    "@context": "https://schema.org",
    "@type": "Physiotherapy",
    "@id": `${clinic.siteUrl}/unidades/${unit.slug}#unit`,
    // Hífen, não travessão: este nome aparece no LocalBusiness e deve bater com
    // o do Google Business Profile, que usa "Vyta Fisioterapia e Pilates - ...".
    name: `${clinic.name} - ${unit.shortName}`,
    url: abs(`/unidades/${unit.slug}`),
    telephone: clinic.phoneE164,
    email: clinic.email,
    image: abs(unit.image),
    address,
    geo: {
      "@type": "GeoCoordinates",
      latitude: unit.geo.lat,
      longitude: unit.geo.lng,
    },
    hasMap: unit.mapsUrl,
    parentOrganization: { "@id": `${clinic.siteUrl}/#organization` },
  };

  // Omitted rather than invented when hours are unknown — spec §12 item 4.
  if (!unit.openingHours) return base;

  return {
    ...base,
    openingHoursSpecification: unit.openingHours.map((h) => ({
      "@type": "OpeningHoursSpecification" as const,
      dayOfWeek: h.days,
      opens: h.opens,
      closes: h.closes,
    })),
  };
}

export function personSchema(member: Member) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${clinic.siteUrl}/#${member.slug}`,
    name: member.name,
    jobTitle: "Fisioterapeuta",
    description: member.bio,
    image: abs(member.image),
    alumniOf: member.institutions.map((i) => ({
      "@type": "EducationalOrganization",
      name: i,
    })),
    hasCredential: {
      "@type": "EducationalOccupationalCredential",
      credentialCategory: member.crefito,
    },
    worksFor: { "@id": `${clinic.siteUrl}/#organization` },
  };
}

export function breadcrumbSchema(items: Array<{ name: string; path: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: abs(item.path),
    })),
  };
}

export function faqSchema(items: Array<{ question: string; answer: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };
}

export function medicalWebPageSchema(args: {
  title: string;
  description: string;
  path: string;
  condition: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "MedicalWebPage",
    name: args.title,
    description: args.description,
    url: abs(args.path),
    inLanguage: "pt-BR",
    about: { "@type": "MedicalCondition", name: args.condition },
    publisher: { "@id": `${clinic.siteUrl}/#organization` },
  };
}

export function articleSchema(post: {
  title: string;
  description: string;
  slug: string;
  date: string;
  image: string;
  authorSlugs: string[];
}) {
  const authors = post.authorSlugs
    .map((s) => team.find((m) => m.slug === s))
    .filter((m): m is Member => Boolean(m));

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    url: abs(`/blog/${post.slug}`),
    image: abs(post.image),
    datePublished: post.date,
    dateModified: post.date,
    inLanguage: "pt-BR",
    author: authors.map((a) => ({ "@id": `${clinic.siteUrl}/#${a.slug}` })),
    publisher: { "@id": `${clinic.siteUrl}/#organization` },
  };
}
