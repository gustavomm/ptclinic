import Image from "next/image";
import Link from "next/link";
import { Section } from "@/components/ui/Section";
import { Arrow } from "@/components/ui/Arrow";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { units } from "@/content/units";

export function UnidadesSection({
  showHeading = true,
}: {
  showHeading?: boolean;
}) {
  return (
    <Section id="localizacao" tone="surface-alt">
      {showHeading && (
        <SectionHeading className="mb-14 max-w-2xl" eyebrow="Unidades" title="Consolação e Pinheiros" />
      )}
      <div className="grid gap-8 md:grid-cols-2">
        {units.map((u, i) => (
          <Reveal key={u.slug} delay={i * 100} className="border border-line bg-surface">
            <div className="h-64 overflow-hidden">
              <Image src={u.image} alt={u.imageAlt} width={u.imageWidth} height={u.imageHeight} sizes="(max-width: 768px) 100vw, 50vw" className="h-full w-full object-cover" />
            </div>
            <div className="flex flex-col gap-3 p-8">
              <h3 className="font-display font-light text-3xl text-ink">{u.name}</h3>
              <p className="text-base font-book leading-relaxed text-muted">
                {u.street}
                <br />
                {u.district}, {u.city} · {u.state}
              </p>
              <Link href={`/unidades/${u.slug}`} className="inline-flex min-h-[44px] items-center text-[15px] text-accent hover:text-accent-deep">
                Ver a unidade
                <Arrow />
              </Link>
            </div>
          </Reveal>
        ))}
      </div>

      {/*
        A terceira resposta para "onde". As duas unidades e o domicílio estão no
        mesmo eixo — mudam o lugar, não o tratamento — e é aqui que ficam juntos
        pela primeira vez. Era a queixa: o site não deixava claro que existem
        duas casas físicas E atendimento na casa do paciente.

        Fica como faixa e não como terceiro cartão de propósito: cartão pediria
        foto, e não existe foto de atendimento em domicílio que possa ir ao ar
        sem consentimento de quem aparece nela.
      */}
      <Reveal delay={200} className="mt-8 border border-line bg-surface p-8">
        <h3 className="font-display font-light text-3xl text-ink">
          Também na sua casa
        </h3>
        <p className="mt-3 text-base font-book leading-relaxed text-muted">
          Atendimento domiciliar na cidade de São Paulo, para quem não consegue
          ou não deve se deslocar até a clínica.
        </p>
        <Link
          href="/fisioterapia-domiciliar"
          className="mt-1 inline-flex min-h-[44px] items-center text-[15px] text-accent hover:text-accent-deep"
        >
          Ver o atendimento domiciliar
          <Arrow />
        </Link>
      </Reveal>
    </Section>
  );
}
