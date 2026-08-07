export type Member = {
  slug: string;
  name: string;
  role: string;
  crefito: string;
  bio: string;
  image: string;
  education: string[];
};

export const team: Member[] = [
  {
    slug: "vyvyan-maximo-andrade",
    name: "Vyvyan Maximo Andrade",
    role: "Neurofuncional",
    crefito: "Crefito 3: 293919F",
    bio: "Trabalha com quem precisa reaprender um movimento — depois de um AVC, de uma cirurgia de coluna, de um diagnóstico que mudou o passo.",
    image: "/vyvyan-3.webp",
    education: [
      "Graduada em Fisioterapia pela Universidade de São Paulo (USP)",
      "Residência em Neurologia e Neurocirurgia pelo Hospital São Paulo (Unifesp)",
    ],
  },
  {
    slug: "taina-horacio-peixoto",
    name: "Tainá Horacio Peixoto",
    role: "Oncológica",
    crefito: "Crefito 3: 293916F",
    bio: "Acompanha pacientes durante e depois do tratamento oncológico, quando o corpo cobra o preço da cura.",
    image: "/taina-3.webp",
    education: [
      "Graduada em Fisioterapia pela Universidade de São Paulo (USP)",
      "Residência em Oncologia pelo Hospital AC Camargo Cancer Center",
    ],
  },
];

export function getMember(slug: string): Member | undefined {
  return team.find((m) => m.slug === slug);
}
