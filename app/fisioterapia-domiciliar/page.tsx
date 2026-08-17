import type { Metadata } from "next";
import Link from "next/link";
import { Section } from "@/components/ui/Section";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Arrow } from "@/components/ui/Arrow";
import { BulletList } from "@/components/ui/BulletList";
import { SectionSplit } from "@/components/ui/SectionSplit";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { FaqAccordion } from "@/components/sections/FaqAccordion";
import { WhatsAppLink } from "@/components/WhatsAppLink";
import { JsonLd } from "@/components/JsonLd";
import { units } from "@/content/units";
import { specialities } from "@/content/specialities";
import { buildMetadata } from "@/lib/seo";
import { breadcrumbSchema, faqSchema, homeVisitSchema } from "@/lib/schema";

/*
  Por que esta página existe fora de /especialidades.

  A clínica pediu, na revisão de agosto de 2026, para "substituir a drenagem
  linfática por uma página sobre atendimento domiciliar". A primeira metade foi
  feita na hora; esta é a segunda, com uma correção de rumo: domiciliar não é
  área de atuação. As seis áreas respondem "o que eu tenho"; o domiciliar
  responde "onde me tratam", que é o mesmo eixo das duas unidades. Enfiá-lo na
  grade obrigaria alguém com Parkinson a escolher entre "neurofuncional" e
  "domiciliar", quando o que essa pessoa precisa é dos dois.

  O site já resolveu exatamente este caso uma vez: o pilates era
  /speciality/pilates no site antigo e virou /pilates no redesenho, com redirect
  permanente e um card destacado dentro da grade. Esta página segue a mesma
  forma, pelo mesmo motivo.

  O que aqui é fato confirmado pela clínica, e portanto pode ser dito:
    - atende em domicílio, confirmado em 17/08/2026
    - todas as seis áreas atendem em casa (o site dizia quatro; era descuido)
    - a cobertura é São Paulo - SP, sem recorte de bairro por enquanto
    - o preço não pode ser dito no site

  O que NÃO está escrito aqui porque ninguém confirmou: quanto dura a sessão,
  que equipamento o fisioterapeuta leva, se há taxa de deslocamento, com quanto
  tempo de antecedência agendar. Inventar qualquer um seria fabricar conteúdo
  clínico-operacional, que é a linha que este projeto não cruza.
*/

const FOR_WHOM = [
  "Quem está acamado ou com mobilidade reduzida e não consegue se deslocar até a clínica.",
  "Quem acabou de receber alta hospitalar e precisa começar a reabilitação sem esperar.",
  "Idosos para quem sair de casa representa risco de queda ou desgaste desnecessário.",
  "Quem faz tratamento contínuo e tem dias em que ir até a clínica não é possível.",
];

/*
  Três perguntas, e só as três que se responde com fato confirmado. A da
  cobertura sai da resposta da clínica de hoje; a do preço repete o que o site
  inteiro faz, que é levar a conversa para o WhatsApp; a das áreas passou a ser
  verdadeira para as seis.

  Faltam aqui as perguntas que as pessoas mais vão fazer — duração, equipamento,
  deslocamento. Elas entram quando a clínica responder, não antes.
*/
const FAQ = [
  {
    question: "Vocês atendem em qual região?",
    answer:
      "Atendemos em domicílio na cidade de São Paulo. Antes de agendar, confirme conosco pelo WhatsApp se a sua região está dentro do atendimento.",
  },
  {
    question: "O atendimento em casa serve para quais tratamentos?",
    answer:
      "Para todas as áreas que atendemos na clínica: neurofuncional, oncológica, ortopédica, para idosos, respiratória e pré e pós-cirúrgica. O tratamento é o mesmo, muda o lugar.",
  },
  {
    question: "Como faço para saber o valor?",
    answer:
      "Fale com a gente pelo WhatsApp. O valor depende da avaliação inicial e da frequência combinada, e a clínica passa tudo antes de qualquer agendamento. Atendimento particular, com recibo para reembolso.",
  },
];

const TRAIL = [
  { name: "Início", path: "/" },
  { name: "Fisioterapia domiciliar", path: "/fisioterapia-domiciliar" },
];

export const metadata: Metadata = buildMetadata({
  title: "Fisioterapia domiciliar em São Paulo",
  description:
    "Fisioterapia na casa do paciente em São Paulo, quando ir até a clínica não é uma opção. Todas as áreas que atendemos na clínica, com o mesmo cuidado.",
  path: "/fisioterapia-domiciliar",
});

export default function DomiciliarPage() {
  return (
    <main>
      <JsonLd
        data={[
          homeVisitSchema({
            title: "Fisioterapia domiciliar",
            description:
              "Atendimento de fisioterapia na casa do paciente em São Paulo, em todas as áreas atendidas na clínica.",
            path: "/fisioterapia-domiciliar",
          }),
          faqSchema(FAQ),
          breadcrumbSchema(TRAIL),
        ]}
      />

      <Section tone="surface-alt">
        <Breadcrumb trail={TRAIL} />
        <SectionHeading
          level="h1"
          eyebrow="Atendimento"
          title={
            <>
              Fisioterapia <em className="italic">na sua casa</em>
            </>
          }
          /*
            O lead é o texto da Vyvyan, palavra por palavra, como voltou na
            planilha de 17/08/2026. É o mesmo que está no terceiro número da
            home — repetir de propósito, para quem chega por aqui e para quem
            chega pela home ler a mesma promessa.
          */
          lead="Atendimento de fisioterapia na sua casa, quando ir até a clínica não é uma opção. Conforto com o mesmo cuidado e atenção."
        />
        <WhatsAppLink service="domiciliar" from="/fisioterapia-domiciliar" className="mt-8">
          Falar sobre atendimento em casa
        </WhatsAppLink>
      </Section>

      <Section>
        <SectionSplit title="Para quem é">
          <BulletList items={FOR_WHOM} />
        </SectionSplit>

        <div className="mt-16">
          <SectionSplit title="O que atendemos em casa">
            <p className="text-base font-book leading-relaxed text-muted">
              Todas as áreas que atendemos na clínica. O tratamento é o mesmo e a
              condução é a mesma — muda o lugar.
            </p>
            <ul className="mt-6 flex flex-col gap-3">
              {specialities.map((s) => (
                <li key={s.slug}>
                  <Link
                    href={`/especialidades/${s.slug}`}
                    className="inline-flex min-h-[44px] items-center font-display font-light text-2xl text-ink hover:text-accent"
                  >
                    <span>{s.cardTitle}<Arrow /></span>
                  </Link>
                </li>
              ))}
            </ul>
          </SectionSplit>
        </div>
      </Section>

      <Section tone="surface-alt">
        <SectionSplit title="Perguntas frequentes">
          <FaqAccordion items={FAQ} />
        </SectionSplit>
      </Section>

      <Section tone="ink">
        <SectionSplit title="Onde atendemos" tone="surface">
          <p className="text-base font-book leading-relaxed text-surface/85">
            Em domicílio na cidade de São Paulo, e nas duas unidades para quem
            prefere ou consegue se deslocar.
          </p>
          <div className="mt-8 flex flex-wrap gap-8">
            {units.map((u) => (
              <Link
                key={u.slug}
                href={`/unidades/${u.slug}`}
                className="text-surface/85 hover:text-accent-warm-soft"
              >
                <span className="font-display font-light text-2xl">{u.shortName}</span>
                <span className="mt-1 block text-sm">{u.street}</span>
              </Link>
            ))}
          </div>
          <WhatsAppLink
            service="domiciliar"
            from="/fisioterapia-domiciliar"
            variant="warm"
            className="mt-10"
          >
            Falar sobre atendimento em casa
          </WhatsAppLink>
        </SectionSplit>
      </Section>
    </main>
  );
}
