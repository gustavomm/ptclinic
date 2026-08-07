import type { GalleryPhoto } from "@/components/sections/PhotoGallery";

export type OpeningHours = {
  days: string[];
  opens: string;
  closes: string;
};

export type Unit = {
  slug: string;
  name: string;
  shortName: string;
  street: string;
  district: string;
  city: string;
  state: string;
  postalCode: string;
  geo: { lat: number; lng: number };
  mapsUrl: string;
  mapEmbedUrl: string;
  image: string;
  imageAlt: string;
  imageWidth: number;
  imageHeight: number;
  /** Photos of the unit itself (treatment room + Pilates studio), shown below the map. */
  gallery: GalleryPhoto[];
  /** null until the clinic supplies real hours — see spec §12 item 4. */
  openingHours: OpeningHours[] | null;
};

export const units: Unit[] = [
  {
    slug: "consolacao",
    name: "Unidade Consolação",
    shortName: "Consolação",
    street: "Rua Frei Caneca, 1212, Conjunto 53",
    district: "Consolação",
    city: "São Paulo",
    state: "SP",
    // dado incorreto em LocalBusiness schema, que é pior que dado ausente).
    postalCode: "01307-002",
    geo: { lat: -23.559993, lng: -46.66116 },
    mapsUrl: "https://maps.google.com/?q=Vyta+Fisioterapia+Frei+Caneca+1212",
    mapEmbedUrl:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d427.96519633859407!2d-46.66115957244263!3d-23.559992771406215!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94ce592d449e10dd%3A0x9fb98fcb63eab6f4!2sVyta%20Fisioterapia!5e0!3m2!1sen!2sbr!4v1678887676221!5m2!1sen!2sbr",
    image: "/unidade-consolacao.webp",
    imageAlt:
      "Sala de atendimento da unidade Consolação da Vyta, com tablado azul de tratamento e espelho de corpo inteiro",
    imageWidth: 1440,
    imageHeight: 1920,
    gallery: [
      {
        src: "/consolacao-sala-fisioterapia.webp",
        alt: "Sala de fisioterapia da unidade Consolação, com maca de atendimento, janelas com persianas e piso de madeira.",
        orientation: "portrait",
        width: 1020,
        height: 1600,
      },
      {
        src: "/consolacao-pilates-cadillac-escada.webp",
        alt: "Estúdio de pilates da unidade Consolação com cadillac, escada e barril, parede coral ao fundo.",
        orientation: "portrait",
        width: 1200,
        height: 1600,
      },
      {
        src: "/pilates-consolacao-luz-natural.webp",
        alt: "Estúdio de pilates da unidade Consolação iluminado por luz natural, com cadillac, cadeira e espaldar de madeira.",
        orientation: "portrait",
        width: 1200,
        height: 1600,
      },
      {
        src: "/pilates-consolacao-marca-vyta.webp",
        alt: "Estúdio de pilates da unidade Consolação com letreiro VYTA na parede e variedade de equipamentos.",
        orientation: "landscape",
        width: 1200,
        height: 1067,
      },
    ],
    openingHours: null,
  },
  {
    slug: "pinheiros",
    name: "Unidade Fradique",
    shortName: "Pinheiros",
    street: "Rua Fradique Coutinho, 380",
    district: "Pinheiros",
    city: "São Paulo",
    state: "SP",
    // dado incorreto em LocalBusiness schema, que é pior que dado ausente).
    postalCode: "05416-000",
    geo: { lat: -23.563253, lng: -46.688716 },
    mapsUrl:
      "https://maps.google.com/?q=Vyta+Fisioterapia+Fradique+Coutinho+380",
    mapEmbedUrl:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3657.1445059856637!2d-46.688715823961424!3d-23.563252978798484!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94ce57c57e3ccf37%3A0xec2878cdd908125f!2sVyta%20Fisioterapia%20e%20Pilates%20-%20Unidade%20Fradique!5e0!3m2!1sen!2sbr!4v1756327748591!5m2!1sen!2sbr",
    image: "/unidade-pinheiros.webp",
    imageAlt:
      "Sala de atendimento da unidade Pinheiros da Vyta, com maca de tratamento junto à janela e pia de higienização",
    imageWidth: 1920,
    imageHeight: 1440,
    gallery: [
      {
        src: "/pinheiros-sala-fisioterapia.webp",
        alt: "Sala de fisioterapia da unidade Pinheiros, com espaldar de madeira e maca de atendimento.",
        orientation: "portrait",
        width: 1364,
        height: 1600,
      },
      {
        src: "/pinheiros-pilates-espelho-detalhe.webp",
        alt: "Detalhe do estúdio de pilates da unidade Pinheiros refletido em espelhos ovais retroiluminados.",
        orientation: "portrait",
        width: 900,
        height: 1600,
      },
      {
        src: "/pinheiros-pilates-reformer-cadillac.webp",
        alt: "Cadillac e cadeiras de pilates em destaque no estúdio de pilates da unidade Pinheiros.",
        orientation: "landscape",
        width: 1440,
        height: 1200,
      },
      {
        src: "/pinheiros-pilates-corredor-equipamentos.webp",
        alt: "Corredor do estúdio de pilates da unidade Pinheiros com reformer, cadillac e escada.",
        orientation: "portrait",
        width: 1200,
        height: 1600,
      },
    ],
    openingHours: null,
  },
];

export function getUnit(slug: string): Unit | undefined {
  return units.find((u) => u.slug === slug);
}
